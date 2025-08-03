import { db } from "./http.js";
export async function renderInventory(root){
  root.insertAdjacentHTML("beforeend", `
    <div class="card"><h2>موجودی</h2>
      <div class="row">
        <div class="col"><input id="name" class="input" placeholder="نام"/></div>
        <div class="col"><input id="sku" class="input" placeholder="SKU"/></div>
        <div class="col"><input id="price" class="input" placeholder="قیمت"/></div>
        <div class="col"><input id="qty" class="input" placeholder="تعداد"/></div>
        <div><button id="add" class="btn">افزودن/بروزرسانی</button></div>
      </div>
      <table class="table" id="tbl"><thead><tr><th>نام</th><th>SKU</th><th>قیمت</th><th>تعداد</th></tr></thead><tbody></tbody></table>
    </div>
  `);
  const tbody = root.querySelector("#tbl tbody");
  async function load(){
    const inv = await db.get("inventory") || {};
    tbody.innerHTML = Object.entries(inv).map(([id,v])=>`
      <tr><td>${v.name||""}</td><td>${v.sku||""}</td><td>${v.price||0}</td><td>${v.qty||0}</td></tr>`).join("");
  }
  root.querySelector("#add").onclick = async ()=>{
    const v = sel=>root.querySelector(sel).value.trim();
    const sku = v("#sku"); if(!sku) return alert("SKU لازم است");
    const item = { name:v("#name"), sku, price:+v("#price")||0, qty:+v("#qty")||0, updatedAt:Date.now() };
    await db.put(`inventory/${sku}`, item);
    await load();
  };
  await load();
}
