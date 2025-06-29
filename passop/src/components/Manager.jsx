import React, { useEffect, useRef,useState } from "react";

const Manager = () => {
    const ref=useRef();
    const [form, setForm] = useState({site: "", username: "", password: ""});
    let [passwordArray, setPasswordArray] = useState([]);
    useEffect(() => {
       let passwords=localStorage.getItem("passwords");
        
        if(passwords){
            setPasswordArray = JSON.parse(passwords);
        }
        
    }, [])
    
    const showpassword = () => {
       ( ref.current.src.includes("icons/eye.png") ) ? ref.current.src = "icons/eyecross.png" : ref.current.src = "icons/eye.png";
    }
    const savepassword = () => {
       setPasswordArray([...passwordArray, form]);
       localStorage.setItem("passwords", JSON.stringify([...passwordArray, form]))
       console.log(form);
    }
    const handlechange=(e)=>{
        setForm({...form, [e.target.name]: e.target.value});
    }
    return (
        <>
            <div className="absolute inset-0 -z-10 h-full w-full bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div></div>
            <div className="mycontainer">
                <h1 className="text-4xl font-bold text-center">
                    <span className='text-green-500'> &lt;</span>
                    Pass
                    <span className='text-green-500'>OP/&gt;</span>
                </h1>
                <p className="text-green-900 text-lg text-center">Your own Password Manager</p>
                <div className="flex flex-col p-4 text-black gap-8 items-center">
                    <input value={form.site} onChange={handlechange} placeholder="Enter Website URL" className="rounded-full border border-green-500 w-full p-4 py-1" type="text" name="site" id="" />
                    <div className="flex w-full justify-between gap-8">
                        <input value={form.username} onChange={handlechange} placeholder="Enter Username" className="rounded-full border border-green-500 w-full p-4 py-1" type="text" name="username" id="" />
                        <div className="relative">

                        <input value={form.password} onChange={handlechange} placeholder="Enter Password" className="rounded-full border border-green-500 w-full p-4 py-1" type="text" name="password" id="" />
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
                        Add Password
                    </button>
                </div>
                <div className="passwords">
                    <h2>Your Passwords</h2>
                </div>
            </div>
        </>
    );
};

export default Manager;
