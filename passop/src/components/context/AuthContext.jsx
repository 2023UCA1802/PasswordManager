import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const AuthProvider=({children})=>{
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const verifyUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/verify", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          setEmail(data.email);
        }
      } catch (err) {
        console.error("Verification error", err);
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);
  return (
    <AuthContext.Provider value={{ email, isLoggedIn, loading, setEmail, setIsLoggedIn,setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth  =() => {
  return useContext(AuthContext);
};
