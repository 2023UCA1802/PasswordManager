const express= require('express');
const app= express();
const dotenv=require('dotenv');
const {MongoClient, Collection} = require('mongodb');
const url= process.env.MONGO_URI || 'mongodb://localhost:27017';
const cors = require('cors');
const client = new MongoClient(url);
const dbname='passop';
const bodyParser = require('body-parser');
const port= 3000;
dotenv.config();
app.use(bodyParser.json());
client.connect();
app.use(cors());


app.get('/', async (req, res) => {
    const db= client.db(dbname);
    const collection = db.collection('passwords');
    const findresult=await collection.find({}).toArray();
    
    res.json(findresult);
});
app.post('/', async (req, res) => {
    const password= req.body;
    const db= client.db(dbname);
    const collection = db.collection('passwords');
    const findresult=await collection.insertOne(password);
    res.send({success: true, message: 'Password saved successfully', data: findresult});
});
app.delete('/', async (req, res) => {
    const password= req.body;
    const db= client.db(dbname);
    const collection = db.collection('passwords');
    const findresult=await collection.deleteOne(password);
    res.send({success: true, message: 'Password saved successfully', data: findresult});
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});