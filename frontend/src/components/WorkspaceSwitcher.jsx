import React, { useEffect, useState } from "react";
import { listWorkspaces, createWorkspace } from "../api";
import { useAuth } from "../auth/AuthContext";
import { useSettings } from "../settings/SettingsContext";

export default function WorkspaceSwitcher() {
  const { workspace, setWorkspace } = useAuth();
  const { t } = useSettings();

  const [list, setList] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    (async () => {
      setList(await listWorkspaces());
    })();
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    const ws = await createWorkspace(name.trim());
    setList((prev) => [...prev, { id: ws.id, name: ws.name, role: "OWNER" }]);
    setName("");
    setWorkspace(ws.id);
  };

  return (
    <div className="row wrap gap-sm">
      <select
        className="select"
        value={workspace}
        onChange={(e) => setWorkspace(e.target.value)}
        aria-label={t("workspace")}
      >
        <option value="">{t("chooseWorkspace")}</option>
        {list.map((w) => (
          <option key={w.id} value={w.id}>
            {w.name} — {w.role}
          </option>
        ))}
      </select>

      <input
        className="input"
        placeholder={t("newWorkspace")}
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ maxWidth: 220 }}
      />

      <button className="btn" onClick={create}>
        {t("create")}
      </button>
    </div>
  );
}
