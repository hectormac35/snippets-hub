
import React, { useState } from "react";
import { createSnippet } from "../api";
import { useAuth } from "../auth/AuthContext";

export default function SnippetForm({ onCreated }){
  const { workspace } = useAuth();
  const [form, setForm] = useState({ title:"", language:"", description:"", code:"", tags:"", favorite:false, visibility:"private" });
  const [saving, setSaving] = useState(false);

  const submit = async (e)=>{
    e.preventDefault();
    if (!workspace) return alert("Selecciona un workspace arriba");
    setSaving(true);
    try{
      const payload = { ...form, tags: form.tags? form.tags.split(",").map(s=>s.trim()).filter(Boolean):[], workspaceId: workspace };
      const created = await createSnippet(payload);
      setForm({ title:"", language:"", description:"", code:"", tags:"", favorite:false, visibility:"private" });
      onCreated?.(created);
    } finally { setSaving(false); }
  };

  const ch = (e)=>{ const {name,value,type,checked} = e.target; setForm(p=>({ ...p, [name]: type==="checkbox"? checked: value })); };

  return (
    <form onSubmit={submit} className="vstack gap-md">
      <div className="grid-2 gap-md">
        <input className="input" name="title" value={form.title} onChange={ch} placeholder="Título" />
        <input className="input" name="language" value={form.language} onChange={ch} placeholder="Lenguaje" required />
      </div>
      <textarea className="textarea" name="description" value={form.description} onChange={ch} placeholder="Descripción" rows={2} />
      <textarea className="textarea" name="code" value={form.code} onChange={ch} placeholder="Código" rows={6} required />
      <div className="grid-2 gap-md">
        <input className="input" name="tags" value={form.tags} onChange={ch} placeholder="tags separadas por coma" />
        <label className="checkbox"><input type="checkbox" name="favorite" checked={form.favorite} onChange={ch}/> Favorito</label>
      </div>
      <select className="select" name="visibility" value={form.visibility} onChange={ch}>
        <option value="private">Privado</option>
        <option value="unlisted">No listado</option>
        <option value="public">Público</option>
      </select>
      <button className="btn success" disabled={saving}>{saving? "Guardando..." : "Añadir snippet"}</button>
    </form>
  );
}
