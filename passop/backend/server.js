const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { MongoClient } = require("mongodb");
const url = process.env.MONGO_URI || "mongodb://localhost:27017";
const cors = require("cors");
const jwt = require("jsonwebtoken");
const client = new MongoClient(url);
const dbname = "passop";
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
dotenv.config();
const { encrypt, decrypt } = require("./cryptoutils");

app.use(cookieParser());
const port = 3000;


app.use(bodyParser.json());

client.connect().then(() => {
  const db = client.db(dbname);
  db.collection("Sessions").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 3600 }
  );
  db.collection("otps").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 300 }
  );
});
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.AUTH_EMAIL || "",
    pass: process.env.AUTH_PASS || "",
  },
});

const otpverification = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    console.error("Error in OTP verification:", error);
  }
};
router.post("/change-password", async (req, res) => {
  const { email, password } = req.body;
  const db = client.db(dbname);
  const user = await db.collection("Users").findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .collection("Users")
    .updateOne(
      { email: email },
      { $set: { password: hashedPassword } },
      { upsert: true }
    );
  const token = jwt.sign({ email: email }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  await db
    .collection("Sessions")
    .insertOne({ email: email, token, createdAt: new Date() });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600000,
  });

  res.status(200).json({ success: true, message: "Email sent successfully" });
});
router.post("/send-email", async (req, res) => {
  const { email } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");
  const existing = await collection.findOne({ email: email });
  // if (existing) {
  //   console.log(email)
  //     return res
  //     .status(400)
  //     .json({ success: false, message: "User already exists" });
  //   }

  const otp = await otpverification(email);
  if (!otp) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }

  await db
    .collection("otps")
    .updateOne(
      { email: email },
      { $set: { otp: otp, createdAt: new Date() } },
      { upsert: true }
    );

  res.status(200).json({ success: true, message: "Email sent successfully" });
});
app.get("/", async (req, res) => {
  const user = req.query.user;
  const db = client.db(dbname);
  const collection = db.collection("passwords");
  const findresult = await collection.find({ user: user }).toArray();
  const decryptedResults = findresult.map(entry => ({
    id:entry.id,
    site: decrypt(entry.site),
    username: decrypt(entry.username),
    password: decrypt(entry.password),
    user: entry.user,
  }));

  res.json(decryptedResults);
});
// app.get('/login', async (req, res) => {
//     const user = req.query.user;
//     const password = req.query.password;
//     const db= client.db(dbname);
//     const collection = db.collection('Users');
//     const findresult=await collection.find({email:user,password:password}).toArray();
//     console.log(user, password);
//     if(findresult.length === 0) {
//         console.log(findresult);
//         return res.status(401).json({ success: false, message: 'Invalid credentials' });
//     }
//   return res.status(200).json({ success: true, user: findresult[0] });
// });

router.post("/login", async (req, res) => {
  const { user, password } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");

  const found = await collection.findOne({ email: user });

  if (!found) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, found.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
  const token = jwt.sign({ email: user }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  await db
    .collection("Sessions")
    .insertOne({ email: user, token, createdAt: new Date() });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600000,
  });

  res.status(200).json({ success: true });
});

router.delete("/logout", async (req, res) => {
  const db = client.db(dbname);
  const collection = db.collection("Sessions");
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token not found in cookies" });
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;
  const result = await collection.deleteOne({ email: email, token: token });

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    deleted: result.deletedCount,
  });
});

router.get("/verify", async (req, res) => {
  const db = client.db(dbname);
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ success: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = await db
      .collection("Sessions")
      .findOne({ email: payload.email, token });

    if (!session) return res.status(403).json({ success: false });

    res.json({ success: true, email: payload.email });
  } catch (err) {
    return res.status(403).json({ success: false });
  }
});
app.use(router);

app.post("/", async (req, res) => {
  const password = req.body;
  const db = client.db(dbname);
  const collection = db.collection("passwords");

  const encryptedEntry = {
    id:password.id,
    site: encrypt(password.site),
    username: encrypt(password.username),
    password: encrypt(password.password),
    user: password.user,
  };
  const findresult = await collection.insertOne(encryptedEntry);
  res.send({
    success: true,
    message: "Password saved successfully",
    data: findresult,
  });
});
app.post("/signup", async (req, res) => {
  const user = req.body;
  const db = client.db(dbname);
  const userCollection = db.collection("Users");
  const otpCollection = db.collection("otps");
  const sessionCollection = db.collection("Sessions");


  try {
    const stored = await otpCollection.findOne({ email: user.email });
    const isExpired = new Date() - new Date(stored.createdAt) > 5 * 60 * 1000;

    if (isExpired) {
      return res
        .status(410)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (!stored) return res.status(400).json({ message: "Email not found." });
    if (stored.otp != user.otp) {

      return res.status(401).json({ message: "Invalid OTP." });
    }
    await otpCollection.deleteOne({ email: user.email });
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await userCollection.insertOne({
      email: user.email,
      username: user.username,
      password: hashedPassword,
    });
    const token = jwt.sign({ email: user.email }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
    await sessionCollection.insertOne({
      email: user.email,
      token,
      createdAt: new Date(),
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.delete("/", async (req, res) => {
  const password = req.body;
  const db = client.db(dbname);
  const collection = db.collection("passwords");
  const findresult = await collection.deleteOne(password);
  res.send({
    success: true,
    message: "Password saved successfully",
    data: findresult,
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
