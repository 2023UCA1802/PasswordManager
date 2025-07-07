import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Forgot = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [isConfirmFocused, setIsConfirmFocused] = useState(false);
    const [step, setStep] = useState("email");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmpassword, setconfirmPassword] = useState("");
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const inputsRef = useRef([]);
    const ref = useRef();
    const ref1 = useRef();
    const passwordRef = useRef();
    const passwordRef1 = useRef();
    const handlechange = (e, index) => {
        if (step === "email")
            setEmail(e.target.value);
        else if (step === "otp") {
            const value = e.target.value.replace(/\D/g, '');
            if (!value) return;

            const newOtp = [...otp];
            newOtp[index] = value[value.length - 1];

            setOtp(newOtp);

            if (index < 5) {
                inputsRef.current[index + 1].focus();
            }
        }
        else setPassword(e.target.value);
    }
    const signup = async () => {
        setLoading(true);
        const response = await fetch("http://localhost:3000/send-email", {
            credentials: "include",
            method: "POST", headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        })
        setLoading(false);
        const data = await response.json();
        if (data.success) {

            setStep("otp");
            setTimer(120);
            setCanResend(false);
            setOtp(Array(6).fill(""));
            inputsRef.current[0]?.focus();
        } else {
            setMessage("Failed to send OTP.");
        }
    }
    const handleBackspace = (e, index) => {
        if (e.key === 'Backspace') {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            if (index > 0) inputsRef.current[index - 1].focus();
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (index > 0) {
                inputsRef.current[index - 1].focus();
            }
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (index < otp.length - 1) {
                inputsRef.current[index + 1].focus();
            }
        }

    };
    const handlePaste = (e) => {
        const paste = e.clipboardData.getData('text').replace(/\D/g, '');
        if (paste.length === 6) {
            const newOtp = paste.split('').slice(0, 6);
            setOtp(newOtp);
            newOtp.forEach((val, idx) => {
                if (inputsRef.current[idx]) {
                    inputsRef.current[idx].value = val;
                }
            });
            inputsRef.current[5].focus();
        }
    };


    const handleotp = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            alert('Please enter a 6-digit OTP');
            return;
        }
        setStep("success");
        // const response = await fetch('http://localhost:3000/signup', {
        //     credentials: 'include',
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //         username: username,
        //         email: email,
        //         password: password,
        //         otp: fullOtp,
        //     }),
        // });

        // const data = await response.json();
        // if (data.success) {
        //     navigate("/");
        // } else {
        //     alert(data.message || 'OTP verification failed');
        // }
    }
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };
    const handleResendOtp = async () => {
        if (!canResend) return;
        await fetch("http://localhost:3000/send-email", {
            credentials: "include",
            method: "POST", headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email: email })
        })
        setTimer(120);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
    };
    const handlelogin = async () => {
        if (password != confirmpassword) {
            alert("Passwords do not match");
            return;
        }
        const response = await fetch('http://localhost:3000/change-password', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            }),
        });

        const data = await response.json();
        if (data.success) {
            onLoginSuccess(email);

            navigate("/");
        } else {
            alert(data.message || 'OTP verification failed');
        }
    }
    const showpassword = () => {
        passwordRef.current.type = "text"

        if (ref.current.src.includes("icons/eye.png")) {
            ref.current.src = "icons/eyecross.png"
            passwordRef.current.type = "text"
        } else {
            ref.current.src = "icons/eye.png";
            passwordRef.current.type = "password";
        }

    }
    const showpassword1 = () => {
        passwordRef1.current.type = "text"
        if (ref1.current.src.includes("icons/eye.png")) {
            ref1.current.src = "icons/eyecross.png"
            passwordRef1.current.type = "text"
        } else {
            ref1.current.src = "icons/eye.png";
            passwordRef1.current.type = "password";
        }
    }
    useEffect(() => {
        if (step !== "otp" || timer <= 0) {
            setCanResend(true);
            return;
        }
        const interval = setInterval(() => setTimer((t) => t - 1), 1000);
        return () => clearInterval(interval);
    }, [step, timer]);
    return (
        <>
            <div className='w-full  flex flex-col justify-center items-center transform-[translateY(-50px)]'>
                <div className=' flex flex-col justify-center items-center mb-[50px]'>
                    <h1 className="text-4xl font-bold text-center">
                        <span className='text-green-500'> &lt;</span>
                        Pass
                        <span className='text-green-500'>OP/&gt;</span>
                    </h1>
                    <p className="text-green-900 text-lg text-center">Your own Password Manager</p>
                </div>
                {message && <p className="text-red-600 mb-2">{message}</p>}


                {step === "email" && (
                    <>

                        <input className='rounded-full border border-green-500 sm:w-[40%] p-4 py-1 m-2.5 w-[70%]' onChange={handlechange} value={email} placeholder='Enter your email' type="text" name="email" id="forgot-email" />
                        <button
                            onClick={signup}
                            className="flex justify-center items-center bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-[40%] gap-2 mt-[30px] mb-[20px] border border-green-900"
                        >
                            {loading ? "Sending..." : "Send OTP"}
                        </button>
                    </>
                )
                }

                {step === "otp" && (
                    <>

                        <div className='flex gap-2 justify-center mb-6'>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    type='text'
                                    value={digit}
                                    onPaste={handlePaste}
                                    onChange={(e) => handlechange(e, index)}
                                    onKeyDown={(e) => handleBackspace(e, index)}
                                    ref={(el) => (inputsRef.current[index] = el)}
                                    className='w-12 h-12 text-2xl text-center border border-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500'
                                />
                            ))}
                        </div>
                        <button
                            onClick={handleResendOtp}
                            disabled={!canResend}
                            style={{
                                color: canResend ? '#007bff' : '#aaa',
                                cursor: canResend ? 'pointer' : 'not-allowed',
                                background: 'none',
                                border: 'none',
                                fontSize: '14px',
                            }}
                        >
                            {canResend ? 'Resend OTP' : `Resend in ${formatTime(timer)}`}
                        </button>

                        <button onClick={() => handleotp()} className="flex justify-center items-center bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-[40%] gap-2 mt-[30px] mb-[20px] border border-green-900">Verify Otp</button>
                    </>
                )}
                {step === "success" && (
                    <>
                        <div className="sm:w-[40%] relative m-2.5 w-[70%]">

                            <input ref={passwordRef} className='rounded-full border border-green-500 p-4 py-1 w-full ' onChange={handlechange} value={password} placeholder='Enter your password' type="password" name="password" id="forgot-password" />
                            <span className="cursor-pointer" onClick={showpassword}>
                                <img ref={ref} className="absolute right-[10px] top-[3px] p-1" width={28} src="icons/eye.png" alt="eye" />
                            </span>

                        </div>
                        <div className="sm:w-[40%] relative m-2.5 w-[70%]">

                            <input ref={passwordRef1} className='rounded-full border border-green-500 p-4 py-1 w-full '
                                onFocus={() => setIsConfirmFocused(true)}
                                onChange={(e) => {
                                    setconfirmPassword(e.target.value);
                                }} value={confirmpassword} placeholder='Confirm your password' type="password" name="password" id="confirm-password" />
                            <span className="cursor-pointer" onClick={showpassword1}>
                                <img ref={ref1} className="absolute right-[10px] top-[3px] p-1" width={28} src="icons/eye.png" alt="eye" />
                            </span>
                            {isConfirmFocused && password !== confirmpassword && <p className='text-red-500'> Passwords do not match</p>}
                        </div>
                        <button onClick={() => handlelogin()} className="flex justify-center items-center bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-[40%] gap-2 mt-[30px] mb-[20px] border border-green-900">Confirm Password</button>
                    </>
                )}
            </div>
        </>
    )
}

export default Forgot
