// src/shop.js  (کاتالوگ آنلاین ساده)
import { loadInv, getItemById } from "./store.js";

export function renderShop(el, addToCart){
  const list = loadInv().filter(it => +it.stock > 0);
  el.innerHTML = `
    <section class="card">
      <h2>فهرست محصولات</h2>
      <div class="grid">
        ${list.map(it=>`
          <button class="item" data-id="${it.id}">
            <strong>${it.name}</strong>
            <small>${(+it.price).toLocaleString()} ریال/${it.unit}</small>
          </button>
        `).join("")}
      </div>
    </section>
  `;
  el.querySelectorAll(".item").forEach(btn=>{
    btn.onclick = ()=> addToCart(getItemById(btn.dataset.id));
  });
}
