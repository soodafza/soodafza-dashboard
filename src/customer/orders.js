// src/customer/orders.js
// فهرست سفارش‌های کاربر و امکان ثبت سفارش جدید (ساده)

import * as S from "../store.js";
import { session } from "../state.js";

export function renderCustomerOrders(el){
  if (session.role!=="customer"){
    el.innerHTML = `<section class="card"><h2>دسترسی محدود است</h2></section>`;
    return;
  }

  const uid   = session.user.uid;
  let   list  = S.getOrdersByUser(uid);

  const tpl = /*html*/`
  <section class="card" style="max-width:900px;margin:auto">
    <h2>سفارش‌های من</h2>
    <div id="box"></div>

    <hr/>
    <h3>سفارش فوری جدید</h3>
    <p style="font-size:13px">برای تست سریع، فقط نام کالا و مبلغ را وارد کنید.</p>
    <form id="frm" class="grid" style="grid-template-columns:1fr 120px 120px">
      <input id="fldName"   placeholder="نام کالا" class="in" required />
      <input id="fldPrice"  type="number" min="0" placeholder="قیمت" class="in" required />
      <button class="btn green">ثبت</button>
    </form>
  </section>`;
  el.innerHTML = tpl;

  const $box = el.querySelector("#box");

  function render(){
    list = S.getOrdersByUser(uid);     // آخرین داده
    if(!list.length){
      $box.innerHTML = `<p style="opacity:.7">سفارشی ثبت نشده است.</p>`;
      return;
    }
    $box.innerHTML = list.map(o=>`
      <div class="order card-sm">
        <div><strong>#${o.id}</strong> – ${new Date(o.at).toLocaleString("fa-IR")}</div>
        <div>وضعیت: <b>${statusLabel(o.status)}</b></div>
        <div>جمع: ${o.total.toLocaleString()} تومان</div>
        <div style="font-size:12px;color:#0af">${o.items.length} قلم</div>
      </div>`).join("");
  }
  render();

  el.querySelector("#frm").onsubmit = e=>{
    e.preventDefault();
    const name  = el.querySelector("#fldName").value.trim();
    const price = +el.querySelector("#fldPrice").value || 0;
    if(!name || !price) return;

    S.createOrder({
      user:{ uid, name: session.user?.name||"" },
      items:[{ name, qty:1, price }],
      total:price
    });
    e.target.reset();
    render();
    alert("سفارش ثبت شد (نمونه).");
  };

  function statusLabel(s){
    const map = { placed:"ثبت شد", preparing:"در حال آماده‌سازی",
                  out_for_delivery:"ارسال", delivered:"تحویل" };
    return map[s] || s;
  }
}
