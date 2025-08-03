// src/state.js
const KEY  = "session";
const LOCK = "roleLock";

/* ========== نشست ========== */
export const session = JSON.parse(localStorage.getItem(KEY) || "{}");

export function setSession(next = {}){
  Object.assign(session, next);
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function signout(){
  localStorage.removeItem(KEY);   // پاک‌کردن سشن
  localStorage.removeItem(LOCK);  // ← قفل نقش هم پاک شود
  location.href = "/signin";
}

/* ========== قفل نقش روی دستگاه ========== */
export const roleLock = localStorage.getItem(LOCK) || null;

export function lockRole(role){
  localStorage.setItem(LOCK, role);
  setSession({ ...session, role });
}
