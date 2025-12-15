
import React, { useEffect, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { listVersions, restoreVersion, updateSnippet, deleteSnippet } from "../api";
import { useSettings } from "../settings/SettingsContext";


function langClass(language){ const map={JavaScript:"javascript",Python:"python"}; return map[language]||"clike"; }

export default function SnippetCard({ item, onChanged }){
  const { codeSize, previewExpanded, cardStyle } = useSettings();
  const [expanded, setExpanded] = useState(previewExpanded);
  const [versions, setVersions] = useState([]);
  const [showVersions, setShowVersions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState({ title:item.title||"", language:item.language||"", description:item.description||"", code:item.code||"", tags:(item.tags||[]).join(", "), favorite:item.favorite, visibility:item.visibility });

  useEffect(()=>{ Prism.highlightAll(); }, [item, expanded, editing]);
  
  useEffect(() => {
  setExpanded(previewExpanded);
  }, [previewExpanded]);


  const save = async ()=>{
    const payload = { ...edited, tags: edited.tags? edited.tags.split(",").map(s=>s.trim()).filter(Boolean):[] };
    const saved = await updateSnippet(item.id, payload);
    setEditing(false); onChanged?.(saved);
  };

  const openVersions = async ()=>{ setShowVersions(true); setVersions(await listVersions(item.id)); };

  return (
    <li className={`card card--${cardStyle} vstack gap-md`}>
      <div className="row between wrap">
        <h3 className="title">{item.title||"Sin título"}</h3>
        <div className="row">
          <button className="btn" onClick={()=>setExpanded(x=>!x)}>{expanded? "Colapsar":"Expandir"}</button>
          <button className="btn" onClick={openVersions}>Versiones</button>
          <CopyToClipboard text={item.code}><button className="btn">Copiar</button></CopyToClipboard>
          <button className="btn danger" onClick={async ()=>{ if(window.confirm("Eliminar (a papelera)?")){ await deleteSnippet(item.id); onChanged?.(); } }}>Eliminar</button>
        </div>
      </div>
      <span className="badge">{item.language||"N/A"}</span>
      <p className="muted">{item.description}</p>
      
      {expanded && (
        <pre
          className="code"
          style={{ fontSize: `var(--code-font-size, ${codeSize}px)` }}
        >
          <code className={`language-${langClass(item.language)}`}>{item.code}</code>
        </pre>
      )}


      {editing ? (
        <div className="vstack gap-sm">
          <input className="input" value={edited.title} onChange={e=>setEdited(p=>({...p,title:e.target.value}))} />
          <input className="input" value={edited.language} onChange={e=>setEdited(p=>({...p,language:e.target.value}))} />
          <textarea className="textarea" rows={2} value={edited.description} onChange={e=>setEdited(p=>({...p,description:e.target.value}))} />
          <textarea className="textarea" rows={6} value={edited.code} onChange={e=>setEdited(p=>({...p,code:e.target.value}))} />
          <input className="input" value={edited.tags} onChange={e=>setEdited(p=>({...p,tags:e.target.value}))} />
          <div className="row">
            <button className="btn success" onClick={save}>Guardar</button>
            <button className="btn muted" onClick={()=>setEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : <button className="btn" onClick={()=>setEditing(true)}>Editar</button>}

      {showVersions && (
        <div className="vstack gap-sm">
          <strong>Versiones</strong>
          <ul className="list vstack gap-sm">
            {versions.map(v => (
              <li key={v.id} className="row between">
                <span>v{v.version} — {new Date(v.createdAt).toLocaleString()}</span>
                <button className="btn" onClick={async ()=>{ const s = await restoreVersion(item.id, v.version); setShowVersions(false); onChanged?.(s); }}>Restaurar</button>
              </li>
            ))}
            {versions.length===0 && <em className="muted">Sin versiones aún</em>}
          </ul>
          <button className="btn muted" onClick={()=>setShowVersions(false)}>Cerrar</button>
        </div>
      )}
    </li>
  );
}
