import * as S from "../store.js";
import { getSession } from "../state.js";

const fmtCoord = n => (+n || 0).toFixed(6);

export function renderRiderMap(root) {
  const user = getSession();
  if (!user || user.role !== "rider") {
    root.innerHTML = "<p>دسترسی نامعتبر است.</p>";
    return;
  }

  root.innerHTML = `
    <section class="card p-4">
      <h2 class="mb-4">نقشه زنده موقعیت‌ها</h2>
      <div id="posInfo" class="mb-4">در حال بارگذاری موقعیت...</div>
      <div id="mapLinks" class="grid gap-2"></div>
    </section>
  `;

  const infoEl = root.querySelector("#posInfo");
  const linksEl = root.querySelector("#mapLinks");

  // نمایش موقعیت خود موتورسوار با Geolocation API
  if ("geolocation" in navigator) {
    navigator.geolocation.watchPosition(pos => {
      const { latitude, longitude } = pos.coords;
      infoEl.innerHTML = `
        <div><b>موقعیت شما:</b> ${fmtCoord(latitude)}, ${fmtCoord(longitude)}</div>
        <a href="https://www.google.com/maps?q=${latitude},${longitude}" target="_blank" class="btn-sm mt-2">باز کردن در گوگل مپس</a>
      `;
    }, err => {
      infoEl.textContent = "امکان دریافت موقعیت وجود ندارد.";
    }, { enableHighAccuracy: true });
  } else {
    infoEl.textContent = "Geolocation پشتیبانی نمی‌شود.";
  }

  // لینک به موقعیت مشتریان و سفارش‌های اختصاص‌یافته
  const orders = S.loadOrders().filter(o => o.riderId === user.uid && o.status !== "delivered");
  if (!orders.length) {
    linksEl.innerHTML = "<p>سفارشی برای نمایش موقعیت ندارید.</p>";
    return;
  }

  // فرض می‌کنیم موقعیت مشتریان در store ذخیره شده
  const positions = S.loadPositions(); // آرایه { uid, lat, lng, ts }
  linksEl.innerHTML = orders.map(o => {
    const pos = positions.find(p => p.uid === o.user.uid);
    if (!pos) return `
      <div class="card-sm p-2">
        <div>#${o.id} | ${o.user.phone}</div>
        <div>موقعیت مشتری ثبت نشده</div>
      </div>
    `;
    return `
      <div class="card-sm p-2">
        <div><b>#${o.id}</b> | ${o.user.phone}</div>
        <div>${fmtCoord(pos.lat)}, ${fmtCoord(pos.lng)}</div>
        <a href="https://www.google.com/maps?q=${pos.lat},${pos.lng}" target="_blank" class="btn-sm mt-1">
          نمایش مقصد در نقشه
        </a>
      </div>
    `;
  }).join("");
}
