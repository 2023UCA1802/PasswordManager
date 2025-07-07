import React, { useEffect, useRef, useState } from 'react';

const Navbar = ({onLogout,isLoggedIn}) => {
  const [hid, sethid] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3000/logout", {
        method: "Delete",
        credentials: "include",
      });
      const data = await response.json();
      if (data.success) {
        sethid(false);
        onLogout();
      } else {
        alert("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }
  useEffect(() => {

    if(isLoggedIn)
    {const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        sethid(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };} else sethid(false);
  }, []);
  return (
    <>
      <nav className='bg-slate-800 text-white'>
        <div className="mycontainer flex justify-between items-center px-4 py-5 h-14">

          <div className='logo font-bold text-white text-2xl'>
            <span className='text-green-500'> &lt;</span>
            Pass
            <span className='text-green-500'>OP/&gt;</span>
          </div>
          {/* <ul>
            <li className='flex gap-4'>
                <a className='hover:font-bold' href="/">Home</a>
                <a className='hover:font-bold' href="/">About</a>
                <a className='hover:font-bold' href="/">Contact</a>
                
            </li>
        </ul> */}
          <div className='flex flex-col justify-center items-center transform-[translateY(39px)]' ref={dropdownRef}>

            <button className='text-white bg-green-700 my-1 rounded-full flex justify-between items-center ring-white ring-1' onClick={() =>{
             if(isLoggedIn) sethid(!hid);
             else sethid(false);
             
            }}>
              
              <img className='invert p-1 w-10' src="icons/github.png" alt="github image" />
              <span className='font-bold px-2'>Github</span>


            </button>

            <div className= {`bg-slate-900 w-[200px] ${!hid?"invisible":"visible"}`} >
              <ul className='p-1 w-full h-full flex flex-col justify-center items-center border-2 border-slate-600 divide-y divide-slate-600'>
                <li className='p-1 w-full text-center'>Profile</li>
                <li className='p-1 w-full text-center' onClick={()=>handleLogout()}>Logout</li>
              </ul>

            </div>


          </div>

        </div>

      </nav>

    </>
  )
}

export default Navbar
