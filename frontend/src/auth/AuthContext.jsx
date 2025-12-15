
import React, { createContext, useContext, useEffect, useState } from "react";
const AuthContext = createContext(null);
export function AuthProvider({ children }){
  const [user, setUser] = useState(()=> JSON.parse(localStorage.getItem("user") || "null"));
  const [accessToken, setAccessToken] = useState("");
  const [theme, setTheme] = useState(()=> localStorage.getItem("theme") || "dark");
  const [workspace, setWorkspace] = useState(()=> localStorage.getItem("workspace") || "");
  useEffect(()=>{
    user ? localStorage.setItem("user", JSON.stringify(user)) : localStorage.removeItem("user");
    localStorage.setItem("theme", theme);
    workspace ? localStorage.setItem("workspace", workspace) : localStorage.removeItem("workspace");
    document.documentElement.dataset.theme = theme;
  }, [user, theme, workspace]);
  return <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken, theme, setTheme, workspace, setWorkspace }}>{children}</AuthContext.Provider>;
}
export function useAuth(){ return useContext(AuthContext); }
