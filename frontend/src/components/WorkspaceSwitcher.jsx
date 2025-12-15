
import React, { useEffect, useState } from "react";
import { listWorkspaces, createWorkspace } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function WorkspaceSwitcher(){
  const { workspace, setWorkspace } = useAuth();
  const [list, setList] = useState([]);
  const [name, setName] = useState("");

  useEffect(()=>{ (async()=> setList(await listWorkspaces()))(); },[]);
  const create = async ()=>{
    if(!name.trim()) return;
    const ws = await createWorkspace(name.trim()); setList(prev=>[...prev,{ id:ws.id, name:ws.name, role:"OWNER" }]); setName(""); setWorkspace(ws.id);
  };

  return (
    <div className="row wrap gap-sm">
      <select className="select" value={workspace} onChange={e=>setWorkspace(e.target.value)} aria-label="Seleccionar espacio de trabajo">
        <option value="">(elige un workspace)</option>
        {list.map(w => <option key={w.id} value={w.id}>{w.name} — {w.role}</option>)}
      </select>
      <input className="input" placeholder="Nuevo workspace" value={name} onChange={e=>setName(e.target.value)} style={{maxWidth:220}} />
      <button className="btn" onClick={create}>Crear</button>
    </div>
  );
}
