import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, oauthDev } from "../api";
import { useAuth } from "../auth/AuthContext";
import { setAT } from "../api";

export default function Login() {
  const nav = useNavigate();
  const { setUser, setAccessToken } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [devEmail, setDevEmail] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { user, accessToken } = await login(form);
      setUser(user);
      setAccessToken(accessToken);
      setAT(accessToken);
      nav("/");
    } catch {
      setError("Credenciales inválidas");
    }
  };

  const devSSO = async () => {
    if (!devEmail.trim()) return;
    const { user, accessToken } = await oauthDev({
      email: devEmail,
      name: "Dev SSO",
    });
    setUser(user);
    setAccessToken(accessToken);
    setAT(accessToken);
    nav("/");
  };

  return (
    <div className="container auth-card vstack gap-lg">

      {/* 🔵 LOGO + NOMBRE */}
      <div className="vstack gap-sm" style={{ alignItems: "center" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 28,
            color: "#fff",
          }}
        >
          SH
        </div>

        <h1 style={{ margin: 0 }}>SnippetsHub</h1>
        <p className="muted" style={{ margin: 0 }}>
          Organiza y versiona tu código
        </p>
      </div>

      {/* 🔐 CARD LOGIN */}
      <div className="card vstack gap-md">
        <h2>Iniciar sesión</h2>

        <form onSubmit={submit} className="vstack gap-md">
          <input
            className="input"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            className="input"
            placeholder="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          {error && <p className="muted error">{error}</p>}

          <button className="btn success" type="submit">
            Entrar
          </button>
        </form>

        {/* 🔑 SSO DEV */}
        <div className="vstack gap-sm">
          <p className="muted small">SSO (dev):</p>
          <div className="row">
            <input
              className="input"
              placeholder="tu-email@ejemplo.com"
              value={devEmail}
              onChange={(e) => setDevEmail(e.target.value)}
            />
            <button className="btn" onClick={devSSO}>
              Entrar con Magic (dev)
            </button>
          </div>
        </div>

        <p className="muted small">
          ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
        </p>
      </div>
    </div>
  );
}
