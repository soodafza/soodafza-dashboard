// src/nav.js
import { session } from "./state.js";

export function renderNav(){
  const offline = localStorage.getItem("OFFLINE_MODE")==="1";
  const role    = session.role || "guest";
  const L = [];

  L.push(`<a class="btn" data-nav href="/home">خانه</a>`);

  if (role==="admin" || role==="cashier"){
    L.push(`<a class="btn" data-nav href="/pos">فروش</a>`);
    L.push(`<a class="btn" onclick="window.open('/scan','scan','width=420,height=340')">اسکن</a>`);
    L.push(`<a class="btn" data-nav href="/admin/inventory">موجودی</a>`);
    L.push(`<a class="btn" data-nav href="/admin/orders">سفارش‌ها</a>`);
    L.push(`<a class="btn" data-nav href="/admin/report">گزارش</a>`);
  }

  if (role==="rider"){
    L.push(`<a class="btn" data-nav href="/delivery">موتورسوار</a>`);
    L.push(`<a class="btn" data-nav href="/map">نقشه</a>`);
  }

  if (role==="customer"){
    L.push(`<a class="btn" data-nav href="/customer/orders">سفارش‌های من</a>`);
    L.push(`<a class="btn" data-nav href="/customer/qr">کیو‌آر‌کد</a>`);
  }

  if (offline)            L.push(`<span class="badge">آفلاین</span>`);
  if (session.user)       L.push(`<span class="badge">${session.user.email||""}</span>`);
  else                    L.push(`<a class="btn" data-nav href="/signin">ورود</a>`);

  document.getElementById("nav").innerHTML = L.join("");
}
