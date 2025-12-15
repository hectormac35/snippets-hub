
import React, { useEffect, useState } from "react";
import { listTrash, restoreSnippet, purgeSnippet } from "../api";

export default function Trash(){
  const [list, setList] = useState([]);
  const refresh = async ()=> setList(await listTrash());
  useEffect(()=>{ refresh(); },[]);
  return (
    <div className="container vstack gap-lg">
      <div className="card vstack gap-md">
        <h2>Papelera</h2>
        <ul className="list vstack gap-sm">
          {list.map(s => (
            <li key={s.id} className="row between">
              <span>{s.title||"(sin título)"} — {new Date(s.deletedAt).toLocaleString()}</span>
              <div className="row">
                <button className="btn" onClick={async ()=>{ await restoreSnippet(s.id); refresh(); }}>Restaurar</button>
                <button className="btn danger" onClick={async ()=>{ if(window.confirm("¿Purgar definitivamente?")){ await purgeSnippet(s.id); refresh(); } }}>Purgar</button>
              </div>
            </li>
          ))}
          {list.length===0 && <em className="muted">La papelera está vacía.</em>}
        </ul>
      </div>
    </div>
  );
}
