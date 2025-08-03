// src/theme.js
export function getTheme(){ return localStorage.getItem("theme") || "dark"; }
export function toggleTheme(){ const n = getTheme()==="dark" ? "light" : "dark"; localStorage.setItem("theme", n); applyTheme(); }
export function applyTheme(){ document.documentElement.dataset.theme = getTheme(); }
applyTheme();
