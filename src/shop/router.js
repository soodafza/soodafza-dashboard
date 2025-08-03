import { register, navigate } from "/src/router.js";
import { lockRole, setSession } from "/src/state.js";

/* ---------- nav (فقط مشتری) ---------- */
function renderNav(){
  const nav = document.getElementById("nav");
  nav.innerHTML = `
    <button class="btn" data-nav href="/shop/search">جست‌وجو</button>
    <button class="btn" data-nav href="/shop/cart">سبد</button>
    <button class="btn" data-nav href="/shop/orders">سفارش‌ها</button>
  `;
}
renderNav();

/* ---------- صفحات ---------- */
register("/shop/search",   () => import("./search.js").then(m=>m.renderSearch));
register("/shop/cart",     () => import("./cart.js").then(m=>m.renderCart));
register("/shop/orders",   () => import("./orders.js").then(m=>m.renderOrders));
register("/shop/login",    () => import("./login.js").then(m=>m.renderLogin));

/* ---------- ریدایرکت اولیه ---------- */
if (location.pathname === "/shop.html" || location.pathname === "/shop")
  navigate("/shop/search", true);

/* ---------- لینک‌های داخلی ---------- */
document.addEventListener("click", e=>{
  const a = e.target.closest("[data-nav]");
  if(!a) return;
  e.preventDefault();
  navigate(new URL(a.getAttribute("href"), location.origin).pathname);
});

/* ---------- نقش مشتری قفل شود ---------- */
if (!localStorage.getItem("roleLock")){
  lockRole("customer");
  setSession({ role:"customer" });
}
