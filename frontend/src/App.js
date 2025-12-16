// frontend/src/App.js
import React from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { SettingsProvider, useSettings } from "./settings/SettingsContext";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Trash from "./pages/Trash";
import { logout } from "./api";

function Navbar() {
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const { t } = useSettings();

  // ✅ autenticación REAL
  const isAuthenticated =
    !!user && !!localStorage.getItem("accessToken");

  // ✅ NO mostrar navbar en login / register
  if (loc.pathname === "/login" || loc.pathname === "/register") {
    return null;
  }

  const exit = async () => {
    try {
      await logout();
    } catch {}

    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    nav("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        {t("appName")}
      </Link>

      <div className="spacer" />

      {isAuthenticated && (
        <>
          <Link
            to="/trash"
            className={"btn " + (loc.pathname === "/trash" ? "success" : "")}
          >
            {t("trash")}
          </Link>

          <Link
            to="/settings"
            className={"btn " + (loc.pathname === "/settings" ? "success" : "")}
          >
            {t("settings")}
          </Link>

          <button className="btn" onClick={exit}>
            {t("logout")}
          </button>
        </>
      )}
    </nav>
  );
}

function AppInner() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/trash" element={<Trash />} />
      <Route
        path="*"
        element={
          <div className="container">
            <h2>No encontrado</h2>
          </div>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Navbar />
        <AppInner />
      </AuthProvider>
    </SettingsProvider>
  );
}
