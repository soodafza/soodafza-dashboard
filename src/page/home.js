// src/page/home.js
export function renderHome(root){
  root.innerHTML = /*html*/`
    <section class="card" style="text-align:center;max-width:640px;margin:auto">
      <h2>داشبورد</h2>
      <p>🎉 ورود موفق بود!</p>
      <p>از منوی بالا، بخش موردنظر را انتخاب کنید.</p>
    </section>`;
}

export default renderHome;   // برای سازگاری با Router
