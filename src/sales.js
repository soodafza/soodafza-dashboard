import { db } from "./http.js";
const cart = [];
export function renderSales(root){
  root.insertAdjacentHTML("beforeend", `
    <div class="card"><h2>فروش</h2>
      <div class="row">
        <div class="col"><input id="sku" class="input" placeholder="اسکن/کد کالا"/></div>
        <div class="col"><input id="qty" class="input" placeholder="تعداد" value="1"/></div>
        <div><button id="add" class="btn">افزودن</button></div>
      </div>
      <table class="table" id="tbl"><thead><tr><th>نام</th><th>SKU</th><th>قیمت</th><th>تعداد</th><th>جمع</th></tr></thead><tbody></tbody></table>
      <div class="row"><div class="col"><b id="total">0</b> تومان</div>
        <div><button id="save" class="btn">ثبت فروش</button></div>
      </div>
    </div>
  `);
  const tbody = root.querySelector("#tbl tbody");
  const totalEl = root.querySelector("#total");
  root.querySelector("#add").onclick = async ()=>{
    const sku = root.querySelector("#sku").value.trim(); if(!sku) return;
    const qty = +root.querySelector("#qty").value||1;
    const item = await db.get(`inventory/${sku}`);
    if(!item){ alert("کالا یافت نشد"); return; }
    cart.push({sku, name:item.name, price:+item.price||0, qty});
    renderCart();
  };
  function renderCart(){
    let total=0;
    tbody.innerHTML = cart.map(r=>{ const s=r.price*r.qty; total+=s; return `<tr><td>${r.name}</td><td>${r.sku}</td><td>${r.price}</td><td>${r.qty}</td><td>${s}</td></tr>`; }).join("");
    totalEl.textContent = total;
  }
  root.querySelector("#save").onclick = async ()=>{
    if(!cart.length) return;
    const sale = { createdAt:Date.now(), subtotal:cart.reduce((a,b)=>a+b.price*b.qty,0), discount:0, tax:0, total:0, paid:true, paymentMethod:"cash" };
    sale.total = sale.subtotal;
    const res = await db.post("sales", sale);
    const saleId = res.name;
    for(const r of cart){
      await db.post(`salesItems/${saleId}`, { itemId:r.sku, name:r.name, qty:r.qty, unitPrice:r.price, lineTotal:r.price*r.qty });
      const it = await db.get(`inventory/${r.sku}`);
      if(it) await db.patch(`inventory/${r.sku}`, { qty: Math.max(0,(+it.qty||0)-r.qty), updatedAt:Date.now() });
    }
    cart.length=0; renderCart(); alert("فروش ثبت شد");
  };
}
