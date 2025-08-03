// src/map.js
// نقشهٔ زنده ساده با بروزرسانی هر ۱۰ ثانیه (بدون کتابخانهٔ خارجی)

import { listPositions } from "./store.js";

export function renderMap(el){
  el.innerHTML = `
    <section class="card" style="max-width:960px;margin:auto">
      <h2>نقشهٔ زنده</h2>
      <div id="wrap"></div>
    </section>
  `;
  const $w = el.querySelector("#wrap");
  draw(); const t = setInterval(draw, 10000);
  el.closest("main")?.addEventListener("navigate-away", ()=> clearInterval(t));

  function draw(){
    const pos = listPositions();
    const keys = Object.keys(pos);
    $w.innerHTML = keys.length
      ? keys.map(k=>{
          const p  = pos[k];
          const url= `https://maps.googleapis.com/maps/api/staticmap?key=YOUR_KEY&center=${p.lat},${p.lng}&zoom=15&size=300x200&markers=color:red|${p.lat},${p.lng}`;
          return `<div class="card-sm" style="display:inline-block;margin:4px">
                    <div><b>${k}</b> – ${new Date(p.ts).toLocaleTimeString("fa-IR")}</div>
                    <img src="${url}" style="border-radius:6px" />
                    <a class="btn small" target="_blank"
                       href="https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}">مسیـر</a>
                  </div>`;
        }).join("")
      : `<p class="muted">موقعیتی ثبت نشده است.</p>`;
  }
}
