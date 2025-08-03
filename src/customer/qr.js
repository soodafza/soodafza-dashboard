// src/customer/qr.js
// نمایش QR ثابتِ مشتری + امکان دانلود

import { session } from "../state.js";
import { uid } from "../store.js";
import QR from "../lib/tinyqr.js";   // همان tinyqr کوچک خودمان

export function renderCustomerQR(el){
  if (session.role!=="customer"){
    el.innerHTML = `<section class="card"><h2>دسترسی محدود است</h2></section>`;
    return;
  }

  // payload ساده: {uid:<userId>}
  const data = JSON.stringify({ uid: session.user.uid, ts: Date.now() });
  const svg  = QR.svg(data, { fill:"#fff", stroke:"#111", margin:2 });

  el.innerHTML = /*html*/`
  <section class="card" style="text-align:center">
    <h2>کد وفاداری شما</h2>
    <div id="qrWrap">${svg}</div>
    <p style="font-size:13px;color:#0af">در صندوق هنگام پرداخت، این کد را نشان دهید.</p>
    <button id="btnSave" class="btn">دانلود PNG</button>
  </section>`;

  // دانلود PNG
  el.querySelector("#btnSave").onclick = ()=>{
    const canvas = QR.canvas(data, { size:512, margin:2 });
    const link = document.createElement("a");
    link.download = `qr_${uid("u")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}
