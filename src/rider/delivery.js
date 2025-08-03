import * as S from "../store.js";
import { getSession } from "../state.js"; // فرض می‌کنیم state.js تابع getSession را صادر می‌کند

// وضعیت‌های سفارش و نمایش فارسی
const statusFlow = ["placed", "preparing", "out_for_delivery", "delivered"];
const humanStatus = {
  placed: "ثبت‌شده",
  preparing: "در حال آماده‌سازی",
  out_for_delivery: "در راه",
  delivered: "تحویل داده شد"
};

// قالب‌بندی عددی
const fmt = n => (+n || 0).toLocaleString("fa-IR");

// توابع عملیاتی روی سفارش
function setOrderStatus(id, status) {
  const orders = S.loadOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return;
  orders[idx].status = status;
  orders[idx].timestamps = orders[idx].timestamps || {};
  if (!orders[idx].timestamps[status]) {
    orders[idx].timestamps[status] = new Date().toISOString();
  }
  S.saveOrders(orders);
}

export function renderRiderDelivery(root) {
  const user = getSession();
  if (!user || user.role !== "rider") {
    root.innerHTML = "<p>دسترسی نامعتبر است.</p>";
    return;
  }

  // فیلتر سفارش‌های اختصاص‌یافته
  let orders = S.loadOrders().filter(o => o.riderId === user.uid);

  root.innerHTML = `
    <section class="card p-4">
      <h2 class="mb-4">ماموریت‌های من</h2>
      <div id="deliveryList"></div>
    </section>
  `;

  const listEl = root.querySelector("#deliveryList");

  function renderList() {
    orders = S.loadOrders().filter(o => o.riderId === user.uid);
    listEl.innerHTML = orders.length
      ? orders.map(o => {
          const next = statusFlow[Math.min(statusFlow.indexOf(o.status) + 1, statusFlow.length - 1)];
          return `
            <div class="card-sm mb-3" data-id="${o.id}">
              <div class="flex justify-between items-center">
                <div>
                  <b>#${o.id}</b> | ${fmt(o.total)} تومان<br>
                  <small>${humanStatus[o.status]}</small>
                </div>
                <button class="btn-sm advance">
                  ${ o.status === "out_for_delivery" ? "تحویل داده شد" : "تحویل به پیک" }
                </button>
              </div>
              <button class="btn-sm toggle-items mt-2">نمایش/پنهان اقلام</button>
              <div class="items hidden mt-2">
                ${o.items.map(i=>`
                  <div class="flex justify-between py-1 border-b">
                    <span>${i.name} (${i.sku||""})</span>
                    <span>${fmt(i.qty)}×${fmt(i.price)}=${fmt(i.qty*i.price)}</span>
                  </div>
                `).join("")}
                <div class="mt-2">
                  <b>آدرس مشتری:</b> ${o.address || "—"}<br>
                  <b>یادداشت:</b> ${o.notes || "—"}
                </div>
              </div>
            </div>
          `;
        }).join("")
      : `<p>سفارشی برای شما اختصاص نیافته.</p>`;
  }

  // وصل کردن هندلرها
  function bindHandlers() {
    listEl.querySelectorAll("[data-id]").forEach(card => {
      const id = card.dataset.id;
      card.querySelector(".advance").onclick = () => {
        const order = S.loadOrders().find(o=>o.id===id);
        const curr = order.status;
        const next = statusFlow[Math.min(statusFlow.indexOf(curr)+1, statusFlow.length-1)];
        setOrderStatus(id, next);
        renderList();
        bindHandlers();
      };
      card.querySelector(".toggle-items").onclick = () => {
        card.querySelector(".items").classList.toggle("hidden");
      };
    });
  }

  renderList();
  bindHandlers();
}
