// src/pos.js  – نسخهٔ کامل POS با همهٔ درخواست‌های اخیر
// • ویجت ساعت/هوا/ماشین‌حساب • دیتالیست و اسکن کالا
// • تخفیف و کش‌بک • جست‌وجو و اسکن مشتری
// • نمایش بدهی، کیف‌پول، اعتبار، اولین/آخرین خرید، تاریخ آخرین بدهی
// • دکمهٔ «سابقه خرید» + دیالوگ تاریخچه
import * as S from "./store.js";
import { navigate } from "./router.js";
import { mountWidgets } from "./widgets.js";

/* helpers */
const $   = (q, p = document) => p.querySelector(q);
const fmt = n => (+n || 0).toLocaleString("fa-IR");

/* ================================================================================= */
export function renderPOS(root){

  /* ───────── HTML اسکلت ───────── */
  root.innerHTML = /*html*/`
  <section class="card pos">
    <h2 style="display:flex;justify-content:space-between;align-items:center">
      صندوق فروش
      <small id="clock" class="muted" style="font-weight:500"></small>
    </h2>

    <!-- ورود کالا -->
    <div class="row">
      <input id="sku" list="invList" class="in flex-1" placeholder="کد / نام کالا">
      <input id="qty" class="in num" value="1" style="max-width:80px">
      <button id="add"  class="btn">افزودن</button>
      <button id="scanItem" class="btn">اسکن کالا</button>
    </div>
    <datalist id="invList"></datalist>

    <!-- جدول فروش -->
    <table id="tbl" class="mt">
      <thead><tr><th>نام</th><th>قیمت</th><th>تعداد</th><th>جمع</th><th></th></tr></thead>
      <tbody></tbody>
      <tfoot>
        <tr><td colspan="3">تخفیف:</td>
            <td><input id="disc" class="in num" value="0" style="max-width:100px"></td><td></td></tr>
        <tr><td colspan="3">کش‌بک ۵٪:</td><td id="cb">0</td><td></td></tr>
        <tr><td colspan="3"><b>قابل پرداخت:</b></td><td id="pay">0</td><td></td></tr>
      </tfoot>
    </table>

    <hr>

    <!-- اطلاعات مشتری -->
    <div class="row">
      <input id="custPhone" class="in flex-1" placeholder="09xxxxxxxxx / نام">
      <button id="searchCust" class="btn">جستجو</button>
      <button id="scanCust"  class="btn">اسکن QR</button>
    </div>

    <div class="row mt">
      <input id="custName" class="in flex-1" placeholder="نام و نام خانوادگی">
      <input id="custAddr" class="in flex-2" placeholder="آدرس مشتری">
      <input id="custZip"  class="in" style="max-width:120px" placeholder="کد پستی">
    </div>

    <div id="custInfo" class="muted mt" style="line-height:1.5"></div>
    <button id="showHist" class="btn-sm" style="display:none;margin-top:.4rem">📜 سابقه خرید</button>

    <button id="finalize" class="btn primary wide mt">ثبت فروش</button>
  </section>

  <video id="vid" hidden playsinline style="width:0;height:0"></video>

  <!-- دیالوگ تاریخچه -->
  <dialog id="histDlg">
    <div class="card">
      <h3>سابقه خرید</h3>
      <div id="histBody" style="max-height:60vh;overflow:auto"></div>
      <form method="dialog" style="text-align:center;margin-top:1rem">
        <button class="btn">بستن</button>
      </form>
    </div>
  </dialog>
  `;

  /* ویجت هوا / ماشین‌حساب */
  mountWidgets(root);

  /* ساعت زنده + روز هفته */
  const faDays=["یکشنبه","دوشنبه","سه‌شنبه","چهارشنبه","پنجشنبه","جمعه","شنبه"];
  (function clk(){
    const d=new Date();
    $("#clock").textContent =
      faDays[d.getDay()]+" • "+
      d.toLocaleString("fa-IR",{dateStyle:"short",timeStyle:"medium"});
    setTimeout(clk,1000);
  })();

  /* داده‌ها */
  const state = { rows:[], cust:null, total:0, cashback:0 };
  const inv   = S.loadInv();
  $("#invList").innerHTML = inv.map(i=>`<option value="${i.sku}">${i.name}</option>`).join("");

  /* ===== کمک‌کننده‌های مشتری ===== */
  const formatDate = d => {
    try {
      return new Date(d).toLocaleString("fa-IR", { dateStyle:"short", timeStyle:"short" });
    } catch { return d; }
  };
  const tierOf = s => s >= 50e6 ? "VIP" : s >= 20e6 ? "طلایی" : s >= 10e6 ? "نقره‌ای" : "برنزی";
  const creditOf = u => {
    if ((u.debt || 0) > 0) return "ضعیف";
    if ((u.totalSpent || 0) >= 50e6) return "عالی";
    if ((u.totalSpent || 0) >= 20e6) return "خوب";
    return "معمولی";
  };
  const allSalesFor = uid => S.loadSales().filter(x => x.user?.uid === uid);
  const firstSale = u => {
    const list = allSalesFor(u.uid).sort((a,b)=> new Date(a.at) - new Date(b.at));
    return list[0] || null;
  };
  const lastSale = u => {
    const list = allSalesFor(u.uid).sort((a,b)=> new Date(b.at) - new Date(a.at));
    return list[0] || null;
  };
  const daysActive = u => {
    const f = firstSale(u);
    if (!f) return "جدید";
    const diffMs = Date.now() - new Date(f.at).getTime();
    const days = Math.floor(diffMs / (1000*60*60*24));
    return days <= 0 ? "امروز" : `${days} روز`;
  };

  /* رویدادهای کالا */
  $("#add").onclick     = ()=> add($("#sku").value.trim(), +$("#qty").value||1);
  $("#sku").onkeydown   = e=> e.key==="Enter" && $("#add").click();
  $("#qty").onkeydown   = e=> e.key==="Enter" && $("#add").click();
  $("#disc").oninput    = calc;
  $("#scanItem").onclick= ()=> scan(code=> add(code,1));

  /* رویدادهای مشتری */
  $("#searchCust").onclick   = search;
  $("#custPhone").onkeydown  = e=> e.key==="Enter" && search();
  $("#scanCust").onclick     = ()=> scan(fillQR);
  $("#showHist").onclick     = showHist;
  $("#finalize").onclick     = finalize;

  /* آیتم‌ها */
  function add(q, n){
    if(!q) return;
    const it = inv.find(x=>x.sku===q||x.id===q||(x.name||"").toLowerCase().includes(q.toLowerCase()));
    if(!it)  return alert("کالا یافت نشد!");
    const r = state.rows.find(x=>x.id===it.id);
    r ? r.qty+=n : state.rows.push({...it, qty:n});
    renderRows(); calc();
    $("#sku").value=""; $("#qty").value="1";
  }
  function renderRows(){
    const tb=$("#tbl tbody"); tb.innerHTML="";
    state.rows.forEach(r=>{
      const tr=document.createElement("tr");
      tr.innerHTML=`
        <td>${r.name}</td><td>${fmt(r.price)}</td><td>${r.qty}</td>
        <td>${fmt(r.price*r.qty)}</td>
        <td><button class="btn-sm">✕</button></td>`;
      tr.querySelector("button").onclick=()=>{
        state.rows=state.rows.filter(x=>x!==r);
        renderRows(); calc();
      };
      tb.appendChild(tr);
    });
  }
  function calc(){
    const disc=+$("#disc").value||0;
    const sum = state.rows.reduce((t,r)=>t + r.price * r.qty, 0);
    state.cashback = Math.round(sum*0.05);
    state.total   = sum - disc;
    $("#cb").textContent  = fmt(state.cashback);
    $("#pay").textContent = fmt(state.total);
  }

  /* اسکن */
  let det, scanning=false;
  async function scan(cb){
    if(scanning) return;
    if(!("BarcodeDetector" in window)) return alert("BarcodeDetector نیست");
    det ??= new BarcodeDetector({formats:["qr_code","code_128","ean_13"]});
    scanning=true;
    const st = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    const v=$("#vid"); v.hidden=false; v.srcObject=st;
    (async function loop(){
      const res = await det.detect(v).catch(()=>[]);
      if(res[0]){ st.getTracks().forEach(t=>t.stop()); v.hidden=true; scanning=false; cb(res[0].rawValue); return; }
      scanning && requestAnimationFrame(loop);
    })();
  }

  /* مشتری */
  function search(){
    const k=$("#custPhone").value.trim();
    if(!k) return;
    const u=Object.values(S.loadUsers()).find(u=>u.phone===k || (u.name||"").toLowerCase().includes(k.toLowerCase()));
    u ? fill(u) : alert("مشتری یافت نشد");
  }
  function fillQR(raw){
    let p; try{p=JSON.parse(raw)||{}}catch{p={uid:raw};}
    if(!p.uid) return alert("QR نامعتبر"); fill(S.ensureUser(p.uid));
  }
  function fill(u){
    state.cust = u;
    $("#custPhone").value = u.phone   || "";
    $("#custName").value  = u.name    || "";
    $("#custAddr").value  = u.address || "";
    $("#custZip").value   = u.zip     || "";

    const first = firstSale(u);
    const last  = lastSale(u);
    const creditStatus = creditOf(u);
    const level = tierOf(u.totalSpent || 0);
    const activeSince = first ? formatDate(first.at) : "—";
    const activeDuration = first ? daysActive(u) : "—";
    const lastInfo = last ? `${fmt(last.total)} تومان — ${formatDate(last.at)}` : "—";

    $("#custInfo").innerHTML = `
      <div style="margin-bottom:.4rem">
        <b>بدهی:</b> ${fmt(u.debt||0)} |
        <b>کیف‌پول:</b> ${fmt(u.wallet||0)} |
        <b>اعتبار پرداخت:</b> ${creditStatus} |
        <b>سطح:</b> ${level}
      </div>
      <div style="margin-bottom:.4rem">
        <b>فعال از:</b> ${activeSince} (${activeDuration}) |
        <b>آخرین خرید:</b> ${lastInfo}
      </div>
    `;
    $("#showHist").style.display="inline-block";
  }

  /* تاریخچه خرید */
  function showHist(){
    const body=$("#histBody");
    const list=S.loadSales().filter(x=>x.user?.uid===state.cust?.uid).reverse();
    body.innerHTML = list.length
      ? list.map(s=>`
          <div class="card-sm" style="margin-bottom:.5rem">
            ${s.at.slice(0,10)} | ${fmt(s.total)} تومان | ${s.items.length} قلم
          </div>`).join("")
      : "<p>بدون رکورد</p>";
    $("#histDlg").showModal();
  }

  /* ثبت فروش */
  function finalize(){
    if(!state.rows.length) return alert("لیست خالی است!");
    const phone=$("#custPhone").value.trim();
    if(!phone) return alert("موبایل مشتری لازم است");
    const u = S.ensureUser(
      state.cust?.uid || "u_"+phone,
      {
        phone,
        name   : $("#custName").value.trim(),
        address: $("#custAddr").value.trim(),
        zip    : $("#custZip").value.trim()
      }
    );

    state.rows.forEach(r=>S.decStock(r.id,r.qty));

    S.pushSale({
      id:S.uid("s"),
      at:new Date().toISOString(),
      items:state.rows,
      total:state.total,
      user:{uid:u.uid, phone}
    });

    if(state.cashback) S.addWallet(u.uid, state.cashback);
    alert("✅ فروش ثبت شد!");
    navigate("/home");
  }
}

/* استایل اختصاصی */
if(!$("#pos-css")){
  const st = document.createElement("style");
  st.id = "pos-css";
  st.textContent = `
    .pos input.in{
      padding:.35rem .45rem;
      font-size:.9rem;
      color:#fff;
      background:#0f172a;
      caret-color:#fff;
    }
    .row{display:flex;gap:.4rem;align-items:center;margin-top:.5rem}
    .num{text-align:center}
    table{width:100%;margin-top:.8rem;border-collapse:collapse}
    th,td{padding:.35rem;text-align:center;border-bottom:1px solid #333}
    tfoot td{font-weight:bold}
    .btn-sm{font-size:13px;padding:0 .4rem}
    .wide{width:100%}
    .flex-2{flex:2}
  `;
  document.head.appendChild(st);
}
