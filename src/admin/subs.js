import { db } from "../http.js";
const $=s=>document.querySelector(s);

export async function renderSubs(root){
  root.innerHTML = `<section class="card">
    <h2 class="title">اشتراک‌ها</h2>
    <div class="row">
      <input id="c_code"  class="inp" placeholder="کد">
      <input id="c_name"  class="inp" placeholder="نام/پلن">
      <input id="c_disc"  class="inp" placeholder="درصد تخفیف (0-100)" type="number">
      <button class="btn" id="c_add">افزودن/ویرایش</button>
    </div>
    <div id="clist" class="box"></div>
  </section>`;
  const list=$("#clist");

  async function renderList(){
    const subs = await db.get("subs") || {};
    list.innerHTML = Object.values(subs).map(s=>`
      <div class="row">
        <b>${s.code}</b> — ${s.name||""} — ${s.disc||0}%
        <button class="btn" data-r="${s.code}">حذف</button>
      </div>
    `).join("") || "موردی نیست";
    list.querySelectorAll("[data-r]").forEach(b => b.onclick = async ()=>{
      await db.remove(`subs/${b.dataset.r}`); renderList();
    });
  }
  document.getElementById("c_add").onclick = async ()=>{
    const code=$("#c_code").value.trim();
    const name=$("#c_name").value.trim();
    const disc= Math.max(0, Math.min(100, +$("#c_disc").value||0));
    if(!code) return alert("کد لازم است");
    await db.put(`subs/${code}`, { code, name, disc });
    renderList();
  };
  renderList();
}
