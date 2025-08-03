// src/scan.js
import { ensureUser, getWallet, addWallet } from "./store.js";

export function renderScan(el){
  el.innerHTML = `
    <section class="card" style="max-width:420px;margin:auto;text-align:center">
      <h2>اسکن کد مشتری</h2>
      <video id="v" autoplay playsinline style="width:100%;border-radius:8px;background:#000"></video>
      <p id="msg" class="muted" style="margin-top:6px">دوربین در حال فعال‌شدن…</p>
      <hr/>
      <p style="font-size:12px">اگر اسکن کار نکرد، کد را دستی وارد کنید:</p>
      <input id="manual" class="in" placeholder="کد را بچسبانید و Enter بزنید">
      <div id="info" style="margin-top:10px"></div>
    </section>
  `;

  const vid = el.querySelector("#v"),
        msg = el.querySelector("#msg"),
        manual = el.querySelector("#manual"),
        info = el.querySelector("#info");

  manual.onkeydown = e=>{
    if(e.key==="Enter"){ handle(e.target.value.trim()); e.target.value=""; }
  };

  (async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ video:{facingMode:"environment"} });
      vid.srcObject = stream;
      if(!("BarcodeDetector" in window)){
        msg.innerHTML="مرورگر شما BarcodeDetector ندارد؛ از ورودی دستی استفاده کنید.";return;
      }
      const det = new BarcodeDetector({formats:["qr_code","code_128","ean_13"]});
      msg.textContent="دوربین آماده است؛ کد را مقابل آن بگیرید.";
      (function loop(){
        det.detect(vid).then(r=>{if(r[0]){handle(r[0].rawValue);return;} requestAnimationFrame(loop);});
      })();
    }catch(e){ msg.textContent="خطا در دوربین: "+e.message; }
  })();

  function handle(raw){
    if(!raw) return;
    let p; try{p=JSON.parse(raw);}catch{p={uid:raw};}
    if(!p.uid) return alert("کد معتبر نیست");

    const user=ensureUser(p.uid);
    const before=getWallet(user.uid).balance||0;
    const last=JSON.parse(localStorage.getItem("sales")||"[]").pop()||{total:0};
    const cash=Math.round(last.total*0.05);
    if(cash>0) addWallet(user.uid,cash);
    const after=getWallet(user.uid).balance;

    info.innerHTML=`<div class="card-sm">
      <h3>${user.uid}</h3>
      <p>قبلی: ${before.toLocaleString()} ریال</p>
      <p>کش‌بک: ${cash.toLocaleString()} ریال</p>
      <p><b>جدید: ${after.toLocaleString()} ریال</b></p>
    </div>`;

    opener?.postMessage({customer:user}, "*");
    alert("✅ درج شد");
  }
}
