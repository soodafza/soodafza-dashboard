// src/admin/report.js
// گزارش فروش روزانه و خروجی چاپ / PDF

import { loadSales } from "../store.js";

export function renderAdminReport(el){
  const today = new Date().toISOString().slice(0,10);   // YYYY-MM-DD

  el.innerHTML = `
    <section class="card" style="max-width:960px;margin:auto">
      <h2>گزارش فروش</h2>
      <label>از: <input id="from" type="date" value="${today}" class="in"></label>
      <label>تا: <input id="to"   type="date" value="${today}" class="in"></label>
      <button id="btn" class="btn">نمایش</button>
      <button id="print" class="btn green" style="float:left">چاپ / PDF</button>
      <div id="out" style="margin-top:8px"></div>
    </section>
  `;

  const $out = el.querySelector("#out");
  el.querySelector("#btn").onclick = ()=> render();
  el.querySelector("#print").onclick = ()=> window.print();
  render();

  function render(){
    const f = el.querySelector("#from").value;
    const t = el.querySelector("#to").value;

    const list = loadSales().filter(s=>{
      const d = (s.at||"").slice(0,10);
      return d>=f && d<=t;
    }).reverse();

    const sum = list.reduce((n,s)=>n+ (+s.total||0), 0);

    $out.innerHTML = list.length
      ? `<table class="tbl">
           <thead><tr><th>زمان</th><th>جمع</th><th>اقلام</th></tr></thead>
           <tbody>
             ${list.map(s=>`
               <tr>
                 <td>${new Date(s.at).toLocaleString("fa-IR")}</td>
                 <td>${(+s.total).toLocaleString()}</td>
                 <td>${s.items.length}</td>
               </tr>`).join("")}
           </tbody>
         </table>
         <h3 style="text-align:left">جمع کل: ${sum.toLocaleString()} تومان</h3>`
      : `<p class="muted">فروشی در بازه انتخابی یافت نشد.</p>`;
  }
}
