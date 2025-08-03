// src/admin/inventory.js
import { loadInv, addItem, updateItem } from "../store.js";
import { t } from "../i18n.js";

export function renderInventory(root){
  function draw(){
    const items = loadInv();
    root.innerHTML = `
      <section class="card">
        <h2>📦 ${t("inventory","موجودی")}</h2>
        <form id="f" class="row" style="gap:.4rem;flex-wrap:wrap">
          <input class="input" name="name"  placeholder="${t("name","نام")}" required />
          <input class="input" name="sku"   placeholder="SKU" />
          <input class="input" name="unit"  placeholder="${t("unit","واحد")}" value="kg" style="max-width:80px" />
          <input class="input" name="price" type="number" placeholder="${t("price","قیمت")}" />
          <input class="input" name="stock" type="number" step="0.1" placeholder="${t("stock","موجودی")}" />
          <button class="btn primary">➕ ${t("add","افزودن")}</button>
        </form>

        <div class="mt">
          ${items.length?`
          <table class="table"><thead><tr>
            <th>${t("name","نام")}</th><th>SKU</th><th>${t("unit","واحد")}</th><th>${t("price","قیمت")}</th><th>${t("stock","موجودی")}</th>
          </tr></thead><tbody>
            ${items.map(i=>`
              <tr>
                <td>${i.name}</td><td>${i.sku||""}</td><td>${i.unit||""}</td>
                <td><input class="input" data-p="${i.id}" type="number" value="${i.price}"></td>
                <td><input class="input" data-s="${i.id}" type="number" step="0.1" value="${i.stock}"></td>
              </tr>
            `).join("")}
          </tbody></table>` : `<p class="muted">${t("empty","خالی")}</p>`}
        </div>
      </section>
    `;
    root.querySelector("#f").onsubmit = (e)=>{
      e.preventDefault();
      const fd = new FormData(e.target);
      addItem({
        name: fd.get("name").trim(),
        sku:  fd.get("sku").trim(),
        unit: fd.get("unit").trim() || "kg",
        price:+fd.get("price")||0,
        stock:+fd.get("stock")||0
      });
      draw();
      e.target.reset();
    };
    root.querySelectorAll("[data-p]").forEach(inp=>{
      inp.onchange = ()=> updateItem(inp.dataset.p, { price:+inp.value||0 });
    });
    root.querySelectorAll("[data-s]").forEach(inp=>{
      inp.onchange = ()=> updateItem(inp.dataset.s, { stock:+inp.value||0 });
    });
  }
  draw();
}
