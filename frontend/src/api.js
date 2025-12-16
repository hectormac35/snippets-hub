// frontend/src/api.js

const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

let accessToken = localStorage.getItem("accessToken") || "";
let refreshPromise = null;

export function setAT(t) {
  accessToken = t || "";
  if (t) localStorage.setItem("accessToken", t);
  else localStorage.removeItem("accessToken");
}

function headers(auth = true) {
  const h = { "Content-Type": "application/json" };
  if (auth && accessToken) h.Authorization = `Bearer ${accessToken}`;
  return h;
}

function clearSession() {
  setAT(null);
  localStorage.removeItem("user");
}

/**
 * Hace refresh del accessToken usando la cookie HttpOnly refresh_token.
 * Solo permite 1 refresh concurrente (todas las llamadas esperan a la misma promesa).
 */
async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/api/v1/auth/refresh`, {
      method: "POST",
      headers: headers(false),
      credentials: "include",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("Refresh failed");
        const data = await r.json();
        if (!data?.accessToken) throw new Error("No accessToken in refresh response");
        setAT(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function req(path, { method = "GET", body, auth = true, _retry = false } = {}) {
  const url = `${BASE}/api/v1${path}`;

  let res = await fetch(url, {
    method,
    headers: headers(auth),
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });

  // Si caducó el accessToken, intentamos refrescar 1 vez y reintentar
  if (res.status === 401 && auth && !_retry) {
    try {
      await refreshToken();
      return req(path, { method, body, auth, _retry: true });
    } catch (e) {
      clearSession();
      throw new Error("SESSION_EXPIRED");
    }
  }

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "Error");
  }

  const ct = res.headers.get("content-type") || "";
  return ct.includes("application/json") ? res.json() : res.text();
}

// -------------------- Auth --------------------
export async function register(p) {
  return req("/auth/register", { method: "POST", body: p, auth: false });
}

export async function login(p) {
  const data = await req("/auth/login", { method: "POST", body: p, auth: false });
  setAT(data.accessToken);
  return data;
}

export async function oauthDev(p) {
  return req("/auth/oauth/dev", { method: "POST", body: p, auth: false });
}

export async function logout() {
  try {
    await req("/auth/logout", { method: "POST", auth: false });
  } finally {
    clearSession();
  }
}

export async function me() {
  return req("/me");
}

export async function updatePrefs(prefs) {
  return req("/me", { method: "PUT", body: { prefs } });
}

// -------------------- Workspaces --------------------
export async function listWorkspaces() {
  return req("/workspaces");
}

export async function createWorkspace(name) {
  return req("/workspaces", { method: "POST", body: { name } });
}

// -------------------- Snippets --------------------
export async function listSnippets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return req(`/snippets${qs ? "?" + qs : ""}`);
}

export async function createSnippet(p) {
  return req("/snippets", { method: "POST", body: p });
}

export async function updateSnippet(id, p) {
  return req(`/snippets/${id}`, { method: "PUT", body: p });
}

export async function deleteSnippet(id) {
  return req(`/snippets/${id}`, { method: "DELETE" });
}

export async function listTrash() {
  return req("/snippets/trash");
}

export async function restoreSnippet(id) {
  return req(`/snippets/${id}/restore`, { method: "POST" });
}

export async function purgeSnippet(id) {
  return req(`/snippets/${id}/purge`, { method: "DELETE" });
}

export async function listVersions(id) {
  return req(`/snippets/${id}/versions`);
}

export async function restoreVersion(id, ver) {
  return req(`/snippets/${id}/versions/restore/${ver}`, { method: "POST" });
}

export async function summary() {
  return req("/snippets/stats/summary");
}

// -------------------- PATs --------------------
export async function listPAT() {
  return req("/pat");
}

export async function createPAT(name) {
  return req("/pat", { method: "POST", body: { name } });
}

export async function revokePAT(id) {
  return req(`/pat/${id}/revoke`, { method: "POST" });
}

// -------------------- Webhooks --------------------
export async function listHooks(wsId) {
  return req(`/webhooks/${wsId}`);
}

export async function addHook(wsId, url, events) {
  return req(`/webhooks/${wsId}`, { method: "POST", body: { url, events } });
}

export async function toggleHook(id) {
  return req(`/webhooks/${id}/toggle`, { method: "POST" });
}

export async function delHook(id) {
  return req(`/webhooks/${id}`, { method: "DELETE" });
}

// -------------------- Public --------------------
export async function listPublic() {
  return req("/public/snippets", { auth: false });
}
