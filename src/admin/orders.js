
// src/admin/orders.js
import * as S from "../store.js";
import { navigate } from "../router.js";

/* helper */
const $ = (q, p = document) => p.querySelector(q);
const fmt = n => (+n || 0).toLocaleString("fa-IR");
const statusFlow = ["placed", "preparing", "out_for_delivery", "delivered"];
const human = {
  placed: "ثبت‌شده",
  preparing: "در حال آماده‌سازی",
  out_for_delivery: "در راه",
  delivered: "تحویل داده شد"
};
const tierOf = s => s >= 50e6 ? "VIP" : s >= 20e6 ? "طلایی" : s >= 10e6 ? "نقره‌ای" : "برنزی";

/* زمان‌بندی */
function isoToDate(s){ return s ? new Date(s) : null; }
function diffHuman(a, b){
  if(!a||!b) return "—";
  const ms = b - a;
  const sec = Math.floor(ms/1000);
  const mins = Math.floor(sec/60);
  const hrs = Math.floor(mins/60);
  if(hrs) return `${hrs}س ${mins%60}د`;
  if(mins) return `${mins}د ${sec%60}ث`;
  return `${sec}ث`;
}

/* next status helper */
function nextStatus(s) {
  const i = statusFlow.indexOf(s);
  return statusFlow[Math.min(i + 1, statusFlow.length - 1)];
}

/* وضعیت سفارش با تایم‌لاین */
function setOrderStatus(orderId, status) {
  let order;
  if (S.setOrderStatus) {
    order = S.setOrderStatus(orderId, status);
  } else {
    const all = S.loadOrders();
    const idx = all.findIndex(o => o.id === orderId);
    if (idx > -1) {
      all[idx].status = status;
      order = all[idx];
      S.saveOrders(all);
    }
  }
  if (!order) return null;

  order.timestamps = order.timestamps || {};
  const now = new Date().toISOString();
  if (!order.timestamps[status]) {
    order.timestamps[status] = now;
    // اگر placed هنوز نداشته باشه، موقع ساخت سفارش باید ست شده؛ ولی در صورت نبود هم بزن
    if (status === "placed" && !order.timestamps.placed) {
      order.timestamps.placed = now;
    }
    // ذخیره مجدد برای fallback
    if (!S.setOrderStatus) {
      const all = S.loadOrders();
      const idx = all.findIndex(o => o.id === order.id);
      if (idx > -1) {
        all[idx] = order;
        S.saveOrders(all);
      }
    } else {
      // اگر تابعی برای ذخیره timestamp اضافه نشده، بازنویسی دستی
      const all = S.loadOrders();
      const idx = all.findIndex(o => o.id === order.id);
      if (idx > -1) {
        all[idx] = order;
        S.saveOrders(all);
      }
    }
  }
  return order;
}

/* render */
export function renderAdminOrders(root) {
  root.innerHTML = `
    <section class="card">
      <h2 style="display:flex;justify-content:space-between;align-items:center">
        سفارش‌ها
        <div style="display:flex;gap:.5rem;align-items:center">
          <input id="qsearch" placeholder="جستجو: شناسه/شماره" class="in" style="padding:.3rem .6rem">
          <select id="filterStatus" class="in" style="padding:.3rem .6rem">
            <option value="">همه وضعیت‌ها</option>
            ${statusFlow.map(s => `<option value="${s}">${human[s]}</option>`).join("")}
          </select>
          <button id="refresh" class="btn-sm">بروزرسانی</button>
        </div>
      </h2>
      <div style="margin-bottom:.5rem" id="summary"></div>
      <div id="ordersList"></div>
    </section>
  `;

  const listEl = root.querySelector("#ordersList");
  const filterEl = root.querySelector("#filterStatus");
  const searchEl = root.querySelector("#qsearch");
  const summaryEl = root.querySelector("#summary");
  root.querySelector("#refresh").onclick = () => loadAndRender();

  function loadAndRender() {
    let orders = S.loadOrders().slice().reverse();
    const f = filterEl.value;
    const q = (searchEl.value || "").trim().toLowerCase();
    if (f) orders = orders.filter(o => o.status === f);
    if (q) {
      orders = orders.filter(o => {
        const user = o.user || {};
        return (
          (o.id || "").toLowerCase().includes(q) ||
          (user.phone || "").toLowerCase().includes(q) ||
          (user.email || "").toLowerCase().includes(q)
        );
      });
    }

    // summary
    const totalCount = orders.length;
    const totalSum = orders.reduce((s, o) => s + (+o.total || 0), 0);
    summaryEl.innerHTML = `
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <div><b>تعداد:</b> ${totalCount}</div>
        <div><b>مجموع مبلغ:</b> ${fmt(totalSum)} تومان</div>
      </div>
    `;

    if (!orders.length) {
      listEl.innerHTML = `<div class="card-sm">هیچ سفارشی با این فیلتر/جستجو یافت نشد.</div>`;
      return;
    }

    listEl.innerHTML = orders.map(o => {
      const customer = o.user || {};
      const userObj = (customer.uid) ? S.loadUsers()[customer.uid] || {} : {};
      const debt = userObj.debt || 0;
      const wallet = userObj.wallet || 0;
      const level = tierOf(userObj.totalSpent || 0);
      const itemsSummary = (o.items || []).map(i => `${i.name} x${i.qty}`).join(", ");

      // تایم‌لاین
      const ts = o.timestamps || {};
      const placedAt = isoToDate(ts.placed);
      const preparingAt = isoToDate(ts.preparing);
      const outAt = isoToDate(ts.out_for_delivery);
      const deliveredAt = isoToDate(ts.delivered);
      const prepDuration = diffHuman(placedAt, preparingAt);
      const pickupDelay = diffHuman(preparingAt, outAt);
      const deliveryDuration = diffHuman(outAt, deliveredAt);
      const totalDuration = diffHuman(placedAt, deliveredAt);

      return `
        <div class="card-sm order-card" data-id="${o.id}" style="margin-bottom:.8rem; padding:.6rem; background:#0f172a; border:1px solid #333;">
          <div style="display:flex;gap:1rem;flex-wrap:wrap;">
            <div style="flex:1;min-width:220px;">
              <div><b>شناسه:</b> ${o.id}</div>
              <div><b>کاربر:</b> ${customer.phone || customer.uid || "—"}</div>
              <div><b>بدهی:</b> ${fmt(debt)} | <b>کیف‌پول:</b> ${fmt(wallet)} | <b>سطح:</b> ${level}</div>
              <div><b>جمع:</b> ${fmt(o.total)} تومان</div>
              <div><b>وضعیت:</b> <span class="badge">${human[o.status] || o.status}</span></div>
              <div style="margin-top:.4rem">
                <div><b>تایم‌لاین:</b></div>
                <div style="font-size:.75rem; margin-top:.2rem">
                  ثبت: ${placedAt ? placedAt.toLocaleString("fa-IR") : "—"} /
                  آماده‌سازی: ${preparingAt ? preparingAt.toLocaleString("fa-IR") : "—"} (${prepDuration})<br>
                  تحویل به پیک: ${outAt ? outAt.toLocaleString("fa-IR") : "—"} (${pickupDelay}) /
                  تحویل نهایی: ${deliveredAt ? deliveredAt.toLocaleString("fa-IR") : "—"} (${deliveryDuration})<br>
                  کل زمان: ${totalDuration}
                </div>
              </div>
            </div>
            <div style="min-width:180px;display:flex;flex-direction:column;gap:.4rem;">
              <button class="btn-sm advance">→ ${human[nextStatus(o.status)]}</button>
              <button class="btn-sm cancel" style="background:#a33;color:#fff">لغو</button>
              <button class="btn-sm details">جزئیات</button>
              <button class="btn-sm map">نقشه</button>
            </div>
          </div>
          <div class="extra" style="margin-top:.6rem;display:none;">
            <div style="margin-bottom:.4rem"><b>آیتم‌ها:</b> ${itemsSummary}</div>
            <div class="full-details" style="margin-top:.5rem;"></div>
          </div>
        </div>
      `;
    }).join("");

    // attach handlers
    listEl.querySelectorAll(".order-card").forEach(card => {
      const id = card.dataset.id;
      const order = S.loadOrders().find(o => o.id === id);
      if (!order) return;

      const advanceBtn = card.querySelector(".advance");
      advanceBtn.onclick = () => {
        const ns = nextStatus(order.status);
        setOrderStatus(order.id, ns);
        loadAndRender();
      };

      const cancelBtn = card.querySelector(".cancel");
      cancelBtn.onclick = () => {
        if (!confirm("آیا مطمئن هستید می‌خواهی این سفارش را لغو کنی؟")) return;
        setOrderStatus(order.id, "delivered"); // یا وضعیت خاص لغو اگر تعریف کنی
        loadAndRender();
      };

      const detailsBtn = card.querySelector(".details");
      detailsBtn.onclick = () => {
        const extra = card.querySelector(".extra");
        const full = card.querySelector(".full-details");
        const itemsHtml = (order.items || []).map(i => `
          <div style="display:flex;gap:.6rem;border-bottom:1px solid #444;padding:.3rem 0">
            <div style="flex:1"><b>${i.name}</b> (${i.sku||""})</div>
            <div>${fmt(i.qty)} × ${fmt(i.price)}</div>
            <div>${fmt(i.qty * i.price)}</div>
          </div>
        `).join("");
        full.innerHTML = `
          <div><b>آدرس:</b> ${order.address||"—"}</div>
          <div><b>یادداشت:</b> ${order.notes||"—"}</div>
          <div style="margin-top:.5rem">${itemsHtml}</div>
        `;
        extra.style.display = extra.style.display === "none" ? "block" : "none";
      };

      const mapBtn = card.querySelector(".map");
      mapBtn.onclick = () => {
        const pos = S.getPosition ? S.getPosition(order.user?.uid) : null;
        if (pos) {
          window.open(`https://www.google.com/maps?q=${pos.lat},${pos.lng}`, "_blank");
        } else {
          alert("موقعیت مشتری موجود نیست.");
        }
      };
    });
  }

  filterEl.onchange = loadAndRender;
  searchEl.oninput = () => {
    clearTimeout(searchEl._t);
    searchEl._t = setTimeout(loadAndRender, 250);
  };
  loadAndRender();
}


