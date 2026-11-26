import React, { useEffect, useState } from 'react'
export const AuthContextManager = React.createContext();

export default function AuthenticationManager(props) {
  const [loginManager,setLoginManager] = useState(()=>{
    const stored = localStorage.getItem('loginManager');
    return stored ? JSON.parse(stored) : { "username":"", "status":"false"}
  });

  useEffect(()=>{
    localStorage.setItem('loginManager',JSON.stringify(loginManager));
  },[loginManager])

  return (
    <AuthContextManager.Provider value={{loginManager,setLoginManager}}>
      {props.children}
    </AuthContextManager.Provider>
  )
}
