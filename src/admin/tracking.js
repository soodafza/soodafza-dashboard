import { db } from "../http.js";

export async function renderTracking(root){
  root.innerHTML = `<section class="card">
    <h2 class="title">نقشه تحویل</h2>
    <div id="map" style="height:60vh;border-radius:12px;overflow:hidden"></div>
    <div class="muted">* در حالت آنلاین نقشه بارگذاری می‌شود؛ آفلاین = لیست ساده.</div>
    <div id="list" class="box"></div>
  </section>`;

  // لیست ساده آفلاین
  async function renderList(){
    const drivers = await db.get("drivers") || {};
    const orders  = await db.get("orders")  || {};
    const list = Object.values(orders).sort((a,b)=>b.ts-a.ts).map(o=>{
      const d = drivers[o.driverId] || {};
      return `<div class="row">
        <div>📦 ${o.addr} — ${o.status}</div>
        <div class="muted">${d.name||"—"} ${d.lat?`(${d.lat.toFixed(4)}, ${d.lng.toFixed(4)})`:""}</div>
      </div>`;
    }).join("") || "سفارشی نیست";
    root.querySelector("#list").innerHTML = list;
  }

  await renderList();

  if (!navigator.onLine) return; // آفلاین، نقشه نمی‌آید

  // لود تنبل Leaflet
  await loadLeaflet();
  const map = L.map("map").setView([35.72, 51.42], 12);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  const markers = new Map();
  function putMarker(id, lat, lng, label, color="#0ea5e9"){
    let m = markers.get(id);
    const icon = L.divIcon({ className:"", html:`<div style="background:${color};width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,.4)"></div>` });
    if(!m){ m = L.marker([lat,lng], {icon}).addTo(map).bindPopup(label); markers.set(id,m); }
    else { m.setLatLng([lat,lng]).setPopupContent(label); }
  }

  // ریفرش هر 10 ثانیه
  setInterval(async ()=>{
    const drivers = await db.get("drivers") || {};
    const orders  = await db.get("orders")  || {};
    Object.values(drivers).forEach(d=>{
      if(d.lat && d.lng) putMarker("d:"+d.id, d.lat, d.lng, "پیک: "+d.name, "#22c55e");
    });
    Object.values(orders).forEach(o=>{
      if(o.lat && o.lng) putMarker("o:"+o.id, o.lat, o.lng, "سفارش: "+o.addr, "#f59e0b");
    });
  }, 10000);
}

function loadLeaflet(){
  return new Promise((res,rej)=>{
    if (window.L) return res();
    const css = document.createElement("link");
    css.rel="stylesheet"; css.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    const js  = document.createElement("script");
    js.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    js.onload=()=>res(); js.onerror=rej;
    document.head.appendChild(css); document.body.appendChild(js);
  });
}
