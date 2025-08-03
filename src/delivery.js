// src/delivery.js
// پنل موتورسوار: لیست مأموریت‌ها + Claim + تحویل + ارسال مکان زنده

import { listOrders, setOrderStatus, nextOrderStatus, saveOrders, setPosition } from "./store.js";
import { session } from "./state.js";

export function renderDelivery(el){

  /* === تعیین شناسه موتورسوار === */
  const riderId = session.user?.uid || prompt("کد موتورسوار را وارد کنید:", "r_demo") || "r_demo";

  /* === UI اولیه === */
  el.innerHTML = `
    <section class="card" style="max-width:900px;margin:auto">
      <h2>مأموریت‌های من</h2>
      <p style="font-size:13px">موتورسوار: <b>${riderId}</b></p>
      <button id="btnTrack" class="btn">📍 فعال‌کردن ارسال مکان</button>
      <div id="list" style="margin-top:8px"></div>
    </section>
  `;

  const $list = el.querySelector("#list");
  const $trk  = el.querySelector("#btnTrack");

  /* === نمایش سفارش‌ها === */
  function refresh(){
    const orders = listOrders().filter(o=>(
      o.riderId === riderId ||
      (!o.riderId && o.status==="out_for_delivery")
    ));

    if(!orders.length){
      $list.innerHTML = `<p class="muted">سفارشی برای شما نیست.</p>`;
      return;
    }

    $list.innerHTML = orders.map(o=>`
      <div class="card-sm" style="margin-bottom:6px">
        <div><b>#${o.id.slice(-4)}</b> — ${new Date(o.at).toLocaleTimeString("fa-IR")}</div>
        <div>مشتری: ${o.user?.name||"-"} (${o.user?.phone||""})</div>
        <div>وضعیت: ${o.status}</div>
        <div>جمع: ${o.total.toLocaleString()} تومان</div>
        ${!o.riderId ? `<button class="btn" data-claim="${o.id}">🤝 برداشتم</button>` : ""}
        ${o.status==="out_for_delivery" ? `<button class="btn green" data-del="${o.id}">✅ تحویل شد</button>` : ""}
      </div>
    `).join("");
  }
  refresh();

  /* === رویداد Claim / تحویل === */
  $list.onclick = e=>{
    const claimId = e.target.dataset.claim;
    const delId   = e.target.dataset.del;

    if (claimId){
      // افزودن riderId به سفارش
      const all = listOrders().map(o=> o.id===claimId? {...o, riderId} : o);
      saveOrders(all);
      alert("سفارش برای شما ثبت شد.");
      refresh();
    }

    if (delId){
      const o = setOrderStatus(delId, "delivered");
      alert("✅ تحویل ثبت شد. متشکرم!");
      refresh();
    }
  };

  /* === ارسال موقعیت زنده === */
  let watchId = null;
  $trk.onclick = ()=>{
    if(watchId){
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      $trk.textContent = "📍 فعال‌کردن ارسال مکان";
      return;
    }
    if(!("geolocation" in navigator)){
      return alert("دسترسی به موقعیت در این مرورگر وجود ندارد.");
    }
    watchId = navigator.geolocation.watchPosition(pos=>{
      setPosition(riderId, { lat:pos.coords.latitude, lng:pos.coords.longitude });
    }, err=> alert("GPS error: "+err.message), { enableHighAccuracy:true, maximumAge:15000 });
    $trk.textContent = "⏸️ توقف ارسال مکان";
  };
}
