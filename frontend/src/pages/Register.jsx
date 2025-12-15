
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api";
import { useAuth } from "../auth/AuthContext";
import { setAT } from "../api";

export default function Register(){
  const nav = useNavigate();
  const { setUser, setAccessToken, setWorkspace } = useAuth();
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error, setError] = useState("");

  const submit = async (e)=>{
    e.preventDefault();
    setError("");
    try{
      const { user, accessToken, defaultWorkspaceId } = await register(form);
      setUser(user); setAccessToken(accessToken); setAT(accessToken); setWorkspace(defaultWorkspaceId);
      nav("/");
    }catch{ setError("No se pudo registrar"); }
  };

  return (
    <div className="container">
      <div className="card auth-card vstack gap-md">
        <h2>Crear cuenta</h2>
        <form onSubmit={submit} className="vstack gap-md">
          <input className="input" placeholder="Nombre" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
          <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
          <input className="input" placeholder="Contraseña (mín. 6)" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})}/>
          {error && <p className="muted error">{error}</p>}
          <button className="btn success" type="submit">Crear cuenta</button>
        </form>
        <p className="muted small">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
      </div>
    </div>
  );
}
