import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from './components/Navbar'
import './App.css'
import Manager from './components/Manager'
import Footer from './components/Footer'
import Login from './components/Login'
import Verify from './components/Verify';
import { AuthProvider,useAuth} from './components/context/AuthContext';
import Forgot from './components/Forgot';

function App() {
  const {isLoggedIn,setIsLoggedIn,loading,setLoading,setEmail,email}=useAuth();

  return (


    <div className='flex flex-col min-h-screen'>

      <Navbar onLogout={() => { setIsLoggedIn(false); setLoading(false) }} isLoggedIn={isLoggedIn} />

      <div className={`flex-grow bg-green-50 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] 
    ${!isLoggedIn ? "flex justify-center items-center" : ""}`}>
        {
          loading ? (
            <div className="text-center">Loading...</div>
          ) : (<Routes>
            <Route path='/' element={
              isLoggedIn ? (
                <Manager />
              ) : (
                <Login onLoginSuccess={(email) => {
                  setEmail(email);
                }} onLog={()=>setIsLoggedIn(true)} />)
            }
            />
            <Route path='/otp' element={<Verify onLoginSuccess={()=>{
              setIsLoggedIn(true);
            }} />} />
            <Route path='/forgot' element={<Forgot onLoginSuccess={(email) => {
                  setEmail(email);
                  setIsLoggedIn(true)
                } }/>} />
          </Routes>
          )}
      </div>

      <Footer />
    </div>

  )
}

export default App
