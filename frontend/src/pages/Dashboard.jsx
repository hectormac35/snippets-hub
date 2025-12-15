import React, { useEffect, useMemo, useState } from "react";
import WorkspaceSwitcher from "../components/WorkspaceSwitcher";
import SnippetForm from "../components/SnippetForm";
import SnippetCard from "../components/SnippetCard";
import { listSnippets, summary } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useSettings } from "../settings/SettingsContext"; // <-- añadido

export default function Dashboard(){
  const { workspace } = useAuth();
  const { sortOrder } = useSettings(); // <-- añadido
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [list, setList] = useState([]);
  const [stats, setStats] = useState({ total:0, counts:{} });
  const [loading, setLoading] = useState(false);

  const pages = Math.ceil((stats.total||0)/limit);
  const curPage = Math.floor(offset/limit)+1;

  const refresh = async ()=>{
    if(!workspace) return;
    setLoading(true);
    const res = await listSnippets({ q, limit, offset, workspaceId: workspace });
    setList(res.items); setStats({ total: res.total, counts:{} });
    setLoading(false);
  };
  useEffect(()=>{ refresh(); /* eslint-disable-next-line */ }, [workspace]);
  useEffect(()=>{ refresh(); /* eslint-disable-next-line */ }, [q, limit, offset]);

  // función auxiliar para fechas
  const ts = (x) => new Date(x?.createdAt || x?.updatedAt || 0).getTime() || 0;

  // lista ordenada según preferencia
  const sortedList = useMemo(() => {
    const arr = [...(list || [])];

    switch (sortOrder) {
      case "oldest":
        arr.sort((a, b) => ts(a) - ts(b));
        break;
      case "title":
        arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "language":
        arr.sort((a, b) => (a.language || "").localeCompare(b.language || ""));
        break;
      case "newest":
      default:
        arr.sort((a, b) => ts(b) - ts(a));
        break;
    }

    return arr;
  }, [list, sortOrder]);

  return (
    <div className="container vstack gap-lg">
      <section className="card vstack gap-md">
        <h2 className="title">Tu espacio de trabajo</h2>
        <WorkspaceSwitcher />
      </section>

      <div className="grid-cols">
        <div className="left-col vstack gap-lg">
          <section className="card vstack gap-md">
            <h3 className="title">Nuevo snippet</h3>
            <SnippetForm onCreated={refresh} />
          </section>

          <section className="card vstack gap-md">
            <div className="vstack gap-sm">
              <input className="input" placeholder="Búsqueda avanzada: 'lang:js tag:react fav:true'" value={q} onChange={e=>setQ(e.target.value)} />
              <div className="row">
                <select className="select" value={limit} onChange={e=>{ setOffset(0); setLimit(parseInt(e.target.value,10)); }}>
                  {[10,20,50,100].map(n=> <option key={n} value={n}>{n} por página</option>)}
                </select>
                <div className="row">
                  <button className="btn" onClick={()=>setOffset(Math.max(0, offset-limit))} disabled={curPage<=1}>Anterior</button>
                  <span className="muted">Página {curPage} de {pages||1}</span>
                  <button className="btn" onClick={()=>setOffset(offset+limit)} disabled={curPage>=pages}>Siguiente</button>
                </div>
              </div>
            </div>
          </section>

          {loading && <p className="muted">Cargando…</p>}
          <ul className="list vstack gap-lg">
            {sortedList.map(it => <SnippetCard key={it.id} item={it} onChanged={refresh} />)}
            {!loading && sortedList.length===0 && <em className="muted">Sin resultados</em>}
          </ul>
        </div>
        <aside className="right-col vstack gap-lg">
          <section className="card vstack gap-sm">
            <h3 className="title">Consejos</h3>
            <ul>
              <li>Usa <strong>tag:react</strong>, <strong>lang:js</strong>, <strong>fav:true</strong></li>
              <li>Gestiona versiones desde cada tarjeta</li>
              <li>La app es 100% responsive</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
