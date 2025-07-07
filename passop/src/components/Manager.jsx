import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "./context/AuthContext";

const Manager = () => {
    const { email, loading, isLoggedIn } = useAuth();
    const ref = useRef();
    const passwordRef = useRef();
    const [form, setForm] = useState({ site: "", username: "", password: "", user: "" });
    let [passwordArray, setPasswordArray] = useState([]);
    const getPasswords = async () => {
        let req = await fetch(`http://localhost:3000/?user=${encodeURIComponent(email)}`);
        let passwords = await req.json();

        // if (passwords.length != 0) {
        setPasswordArray(passwords);
        // }
    }
    form.user = email
    useEffect(() => {

        getPasswords();


    }, [email])
    const copyText = (text) => {
        toast('Copied to clipboard', {
            position: "bottom-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            // transition :"Bounce",
        });
        navigator.clipboard.writeText(text)
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
    const savepassword = async () => {
        if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
            const id = form.id || uuidv4();
            const newPassword = { ...form, id };
            if (form.id) {
                await fetch("http://localhost:3000/", {
                    method: "DELETE", headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id: form.id })
                })
                setPasswordArray(passwordArray.filter(item => item.id !== form.id));
            }
            setPasswordArray([...passwordArray, { ...form, id: uuidv4() }]);
            setPasswordArray([...passwordArray, newPassword]);
            await fetch("http://localhost:3000/", {
                method: "POST", headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ ...form, id: uuidv4() })
            })
            // setPasswordArray([...passwordArray, newPassword]);
            // localStorage.setItem("passwords", JSON.stringify([...passwordArray, { ...form, id: uuidv4() }]))
            setForm({ site: "", username: "", password: "" });
            toast('Password Saved', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                // transition :"Bounce",
            });
         
        }
        else {
            toast('Password Not Saved', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                // transition :"Bounce",
            });
        }
    }
    const deletepassword = async (id) => {
        let c = confirm("Are you sure you want to delete this password?");
        if (c) {
            setPasswordArray(passwordArray.filter((item) => item.id !== id));
            let res = await fetch("http://localhost:3000/", {
                method: "DELETE", headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ id })
            })
            // localStorage.setItem("passwords", JSON.stringify(passwordArray.filter((item) => item.id !== id)))
            toast('Password Deleted', {
                position: "bottom-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                // transition :"Bounce",
            });
            
        }
    }
    const editpassword = (id) => {
        setForm({ ...passwordArray.find((item) => item.id === id), id: id });
        setPasswordArray(passwordArray.filter((item) => item.id !== id));

    }
    const handlechange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }
    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            // transition="Bounce"
            />
         

            <div className="p-2 md:p-5 md:mycontainer">
                <h1 className="text-4xl font-bold text-center">
                    <span className='text-green-500'> &lt;</span>
                    Pass
                    <span className='text-green-500'>OP/&gt;</span>
                </h1>
                <p className="text-green-900 text-lg text-center">Your own Password Manager</p>
                <div className="flex flex-col  p-4 text-black gap-8 items-center">
                    <input value={form.site} onChange={handlechange} placeholder="Enter Website URL" className="rounded-full border border-green-500 w-full p-4 py-1" type="text" name="site" id="site" />
                    <div className="flex flex-col md:flex-row w-full justify-between gap-8">
                        <input value={form.username} onChange={handlechange} placeholder="Enter Username" className="rounded-full border border-green-500 w-full p-4 py-1" type="text" name="username" id="username" />
                        <div className="relative">

                            <input ref={passwordRef} value={form.password} onChange={handlechange} placeholder="Enter Password" className="rounded-full border border-green-500 w-full p-4 py-1" type="password" name="password" id="password" />
                            <span className="absolute right-[10px] top-[4px] cursor-pointer" onClick={showpassword}>
                                <img ref={ref} className="p-1" width={28} src="icons/eye.png" alt="eye" />
                            </span>
                        </div>
                    </div>
                    <button onClick={savepassword} className="flex justify-center items-center bg-green-400 hover:bg-green-300 rounded-full px-8 py-2 w-fit gap-2 border border-green-900">
                        <lord-icon
                            src="https://cdn.lordicon.com/efxgwrkc.json"
                            trigger="hover"
                        >
                        </lord-icon>
                        Save Password
                    </button>
                </div>
                <div className="passwords">
                    <h2 className="font-bold text-2xl py-4">Your Passwords</h2>
                    {passwordArray.length == 0 && <div>No passwords to show</div>}
                    {passwordArray.length != 0 && <table className="table-auto w-full rounded-md overflow-hidden">
                        <thead className="bg-green-800 text-white ">
                            <tr>
                                <th className="py-2">Site</th>
                                <th className="py-2">Username</th>
                                <th className="py-2">Password</th>
                                <th className="py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-green-100">
                            {
                                passwordArray.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td className=" py-2 border border-white text-center">
                                                <div className="flex items-center justify-center">
                                                    <a href={item.site} target="_blank"></a> {item.site}
                                                    <div className="lordiconcopy size-7 cursor-pointer" onClick={() => copyText(item.site)}>
                                                        <lord-icon style={{ width: "25px", height: "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                            src="https://cdn.lordicon.com/xuoapdes.json"
                                                            trigger="hover"
                                                        >
                                                        </lord-icon>
                                                    </div></div>
                                            </td>
                                            <td className=" py-2 border border-white text-center ">
                                                <div className="flex items-center justify-center">
                                                    <span>{item.username}</span>
                                                    <div className="lordiconcopy size-7 cursor-pointer" onClick={() => copyText(item.username)}>
                                                        <lord-icon style={{ width: "25px", height: "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                            src="https://cdn.lordicon.com/xuoapdes.json"
                                                            trigger="hover"
                                                        >
                                                        </lord-icon>
                                                    </div></div>
                                            </td>
                                            <td className=" py-2 border border-white text-center ">
                                                <div className="flex items-center justify-center">
                                                    <span>{"*".repeat(item.password.length)}</span>
                                                    <div className="lordiconcopy size-7 cursor-pointer" onClick={() => copyText(item.password)}>
                                                        <lord-icon style={{ width: "25px", height: "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                            src="https://cdn.lordicon.com/xuoapdes.json"
                                                            trigger="hover"
                                                        >
                                                        </lord-icon>
                                                    </div></div>
                                            </td>
                                            <td className=" py-2 border border-white text-center ">
                                                <span className="cursor-pointer mx-1" onClick={() => editpassword(item.id)}>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/valwmkhs.json"
                                                        trigger="hover"
                                                        style={{ "width": "25px", "height": "25px" }}>
                                                    </lord-icon></span>

                                                <span className="cursor-pointer mx-1" onClick={() => deletepassword(item.id)}>
                                                    <lord-icon
                                                        src="https://cdn.lordicon.com/xyfswyxf.json"
                                                        trigger="hover"
                                                        style={{ "width": "25px", "height": "25px" }}>
                                                    </lord-icon></span>
                                            </td>
                                        </tr>
                                    )
                                })
                            }


                        </tbody>
                    </table>}
                </div>
            </div>

        </>
    );
};

export default Manager;
