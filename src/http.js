// src/http.js — online/offline switch with identical API
// اگر OFFLINE_MODE=1 باشد، همهٔ عملیات روی ذخیرهٔ محلی انجام می‌شود
// و ورود بدون Firebase انجام می‌شود؛ در غیر اینصورت، مثل قبل آنلاین.

import { env, session, setSession } from "./state.js";

// تشخیص حالت آفلاین از LocalStorage
const OFFLINE = localStorage.getItem("OFFLINE_MODE") === "1";

// ====== ابزار ذخیرهٔ محلی بسیار سبک (LocalStorage) ======
function dbLoad() {
  try { return JSON.parse(localStorage.getItem("db:root") || "{}"); }
  catch { return {}; }
}
function dbSave(obj) {
  localStorage.setItem("db:root", JSON.stringify(obj));
}
function pathGet(obj, path) {
  const parts = (path || "").split("/").filter(Boolean);
  let cur = obj;
  for (const k of parts) { if (cur == null) return null; cur = cur[k]; }
  return cur ?? null;
}
function pathSet(obj, path, val) {
  const parts = (path || "").split("/").filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    if (typeof cur[k] !== "object" || cur[k] === null) cur[k] = {};
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = val;
}
function pathMerge(obj, path, patch) {
  const cur = pathGet(obj, path) || {};
  pathSet(obj, path, { ...cur, ...patch });
}
function pathDel(obj, path) {
  const parts = (path || "").split("/").filter(Boolean);
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i]; cur = cur?.[k]; if (!cur) return;
  }
  delete cur[parts[parts.length - 1]];
}
const genId = () => ("s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));

// ====== نسخهٔ آنلاین (Firebase REST) ======
const AUTH  = "https://identitytoolkit.googleapis.com/v1";
const TOKEN = "https://securetoken.googleapis.com/v1";

async function safeFetch(url, init = {}) {
  try { return await fetch(url, init); }
  catch {
    // تلاش دوم از پراکسی محلی اگر server.js مسیر /proxy دارد
    return fetch("/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url, method: init.method || "GET",
        headers: init.headers || {}, body: init.body ?? null
      })
    });
  }
}

// ====== Auth ======
export async function signInEmail(email, password) {
  if (OFFLINE) {
    // ورود محلی فوری
    setSession({ idToken: "offline", refreshToken: "", user: { uid: "local", email: email || "offline@local" } });
    return { idToken: "offline", localId: "local", email };
  }

  const res = await safeFetch(
    `${AUTH}/accounts:signInWithPassword?key=${env.apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }) }
  );
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Signin failed (${res.status}): ${msg}`);
  }
  const d = await res.json();
  setSession({ idToken: d.idToken, refreshToken: d.refreshToken, user: { uid: d.localId, email } });
  return d;
}

export async function refreshToken() {
  if (OFFLINE || !session.refreshToken) return;
  const res = await safeFetch(`${TOKEN}/token?key=${env.apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: session.refreshToken }).toString()
  });
  if (res.ok) {
    const d = await res.json();
    setSession({ idToken: d.id_token, refreshToken: d.refresh_token });
  }
}

// ====== DB API مشترک (همان امضای قبلی) ======
async function authedFetchOnline(method, path, body) {
  if (!session.idToken) throw new Error("No auth");
  const url = `${env.dbUrl}/${path}.json?auth=${session.idToken}`;
  const init = { method, headers: { "Content-Type": "application/json" } };
  if (body !== undefined) init.body = JSON.stringify(body);
  const r = await safeFetch(url, init);
  if (!r.ok) {
    const t = await r.text().catch(() => "");
    throw new Error(`DB ${method} ${path} failed (${r.status}): ${t}`);
  }
  return r.json();
}

async function authedFetchOffline(method, path, body) {
  // شبیه RTDB عمل می‌کنیم ولی در LocalStorage
  const root = dbLoad();
  if (method === "GET")           { return pathGet(root, path); }
  if (method === "PUT")           { pathSet(root, path, body); dbSave(root); return body; }
  if (method === "PATCH")         { pathMerge(root, path, body || {}); dbSave(root); return pathGet(root, path); }
  if (method === "DELETE")        { pathDel(root, path); dbSave(root); return { ok: true }; }
  if (method === "POST") {
    const id = genId();
    const p = path.replace(/\/+$/,"") + "/" + id;
    pathSet(root, p, body);
    dbSave(root);
    // RTDB معمولاً {"name":"-N.."} برمی‌گرداند؛ برای سازگاری name را می‌دهیم
    return { name: id, ...body };
  }
  throw new Error("Unsupported method in offline mode: " + method);
}

const $fetch = OFFLINE ? authedFetchOffline : authedFetchOnline;

export const db = {
  get:   (p)    => $fetch("GET",    p),
  put:   (p, o) => $fetch("PUT",    p, o),
  patch: (p, o) => $fetch("PATCH",  p, o),
  post:  (p, o) => $fetch("POST",   p, o),
  del:   (p)    => $fetch("DELETE", p),
};

// کمک‌تابع اختیاری برای تست آنلاین Auth
export async function pingAuth() {
  if (OFFLINE) return true;
  const r = await safeFetch(`${AUTH}/discovery`);
  return r.ok;
}
