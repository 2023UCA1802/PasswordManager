import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";


const Login = ({ onLoginSuccess,onLog }) => {
    const navigate=useNavigate();
    const [change, setChange] = useState(false);
    const ref = useRef();
    const passwordRef = useRef();
    const modeConfig = change
        ? {
            buttonText: "Login",
            linkText: "Don't have an account? ",
            linkCTA: "Sign Up",
        }
        : {
            buttonText: "Sign Up",
            linkText: "Already have an account? ",
            linkCTA: "Login",
        };


    const [form, setForm] = useState({ username: "", email: "", password: "" });
    // let [passwordArray, setPasswordArray] = useState([]);
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
    const handlechange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    const signup = async () => {

        if (form.username.length > 3 && form.email.length > 3 && form.password.length > 3 && !change) {
            const response = await fetch("http://localhost:3000/send-email", {
                credentials: "include",
                method: "POST", headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify( {email:form.email })
            })
            const data = await response.json();
            if (data.success) {
                onLoginSuccess(form.email);
                
                navigate("/otp",{state:{username:form.username,email:form.email,password:form.password}})
            } else {
                alert("Sign Up failed");
            }
        }
        else {
            const res = await fetch("http://localhost:3000/login", {
                credentials: "include",
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user: form.email, password:form.password }),
            });
            const data = await res.json();
            if (data.success) {
                onLog();
            } else {
                alert("Login failed");
            }
        }
    }
    return (
        <>
            <div className='w-full flex flex-col justify-center items-center transform-[translateY(-50px)]'>
                <div className='min-h-[100%] flex flex-col justify-center items-center mb-[50px]'>
                    <h1 className="text-4xl font-bold text-center">
                        <span className='text-green-500'> &lt;</span>
                        Pass
                        <span className='text-green-500'>OP/&gt;</span>
                    </h1>
                    <p className="text-green-900 text-lg text-center">Your own Password Manager</p>
                </div>
                {!change && <input className='rounded-full border border-green-500 sm:w-[40%] p-4 py-1 m-2.5 w-[70%]' onChange={handlechange} value={form.username} placeholder='Enter your Username' type="text" name="username" id="home-username" />}
                <input className='rounded-full border border-green-500 sm:w-[40%] p-4 py-1 m-2.5 w-[70%]' onChange={handlechange} value={form.email} placeholder='Enter your email' type="text" name="email" id="home-email" />
                <div className="sm:w-[40%] relative m-2.5 w-[70%]">

                    <input ref={passwordRef} className='rounded-full border border-green-500 p-4 py-1 w-full ' onChange={handlechange} value={form.password} placeholder='Enter your password' type="password" name="password" id="home-password" />
                    <span className="cursor-pointer" onClick={showpassword}>
                        <img ref={ref} className="absolute right-[10px] top-[3px] p-1" width={28} src="icons/eye.png" alt="eye" />
                    </span>
               {change && <p className="mt-[10px] ml-[10px] text-sm" onClick={()=>{navigate("/forgot",{state:{username:form.username,email:form.email,password:form.password}})}}>Forgot Password?</p>}
                </div>
                <button
                    onClick={signup}
                    className="flex justify-center items-center bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-[40%] gap-2 mt-[30px] mb-[20px] border border-green-900"
                >
                    {modeConfig.buttonText}
                </button>

                <p onClick={() => setChange(!change)}>
                    {modeConfig.linkText} <span className="font-bold">{modeConfig.linkCTA}</span>
                </p>
                
               
            </div>
        </>
    )
}

export default Login
