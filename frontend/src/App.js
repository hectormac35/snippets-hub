import React from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { useSettings } from "./settings/SettingsContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Trash from "./pages/Trash";
import { logout } from "./api";

function Navbar(){
  const nav = useNavigate(); const loc = useLocation();
  const { user } = useAuth();
  const { t } = useSettings();
  const exit = async ()=>{ try{ await logout(); }catch{} localStorage.removeItem("user"); nav("/login"); };
  return (
    <nav className="navbar">
      <Link to="/" className="brand">SnippetsHub</Link>

      {/* eliminamos Papelera de aquí para que no quede a la izquierda */}
      <div className="spacer" />

      {user ? (<>
        {/* movemos Papelera aquí, junto a Ajustes */}
        <Link
          to="/trash"
          className={"btn " + (loc.pathname === "/trash" ? "success" : "")}
        >
          Papelera
        </Link>

        <Link to="/settings" className="btn">Ajustes</Link>
        <button className="btn" onClick={exit}>Salir</button>
      </>) : (<>
        <Link to="/login" className="btn">Entrar</Link>
        <Link to="/register" className="btn">Registro</Link>
      </>)}
    </nav>
  );
}

function AppInner(){
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/trash" element={<Trash />} />
      <Route path="*" element={<div className="container"><h2>No encontrado</h2></div>} />
    </Routes>
  );
}

export default function App(){

  return (
   <SettingsProvider>
      <AuthProvider><Navbar /><AppInner /></AuthProvider>
    </SettingsProvider>
  );
  
}
