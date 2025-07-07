import React, { useState, useRef,useEffect } from 'react'
import { useLocation, useNavigate } from "react-router-dom"


const Verify = ({ onLoginSuccess }) => {
    const [timer, setTimer] = useState(120);
    const [canResend, setCanResend] = useState(false);
    const location = useLocation()
    const navigate = useNavigate()
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const inputsRef = useRef([]);
    const { username, email, password } = location.state;
    const handleChange = (e, index) => {
        const value = e.target.value.replace(/\D/g, '');
        if (!value) return;

        const newOtp = [...otp];
        newOtp[index] = value[value.length - 1];
        
        setOtp(newOtp);

        if (index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

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

   
    const handlelogin = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            alert('Please enter a 6-digit OTP');
            return;
        }
        const response = await fetch('http://localhost:3000/signup', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                otp: fullOtp,
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
    const formatTime = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, '0');
        const s = (sec % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    useEffect(() => {
        if (timer <= 0) {
            setCanResend(true);
            return;
        }

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);
    const handleResendOtp = async() => {
        if (!canResend) return;
         await fetch("http://localhost:3000/send-email", {
                credentials: "include",
                method: "POST", headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( {email:email })
            })
        setTimer(120);
        setCanResend(false);
        setOtp(Array(6).fill(''));
        inputsRef.current[0]?.focus();
    };
    return (
        <div className='w-full h-full flex flex-col justify-center items-center '>
            <div className=' flex flex-col justify-center items-center mb-[50px]'>
                <h1 className="text-4xl font-bold text-center">
                    <span className='text-green-500'> &lt;</span>
                    Pass
                    <span className='text-green-500'>OP/&gt;</span>
                </h1>
                <p className="text-green-900 text-lg text-center">Your own Password Manager</p>
            </div>
            <div className='flex gap-2 justify-center mb-6'>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        type='text'
                        value={digit}
                        onPaste={handlePaste}
                        onChange={(e) => handleChange(e, index)}
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

            <button onClick={() => handlelogin()} className="flex justify-center items-center bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-[40%] gap-2 mt-[30px] mb-[20px] border border-green-900">Verify Otp</button>
        </div>

    )
}

export default Verify
