// src/page/home.js

/**
 * صفحهٔ اصلی شبیه به اسنپ‌فود با لوگوی «سودافزا»
 */
export function renderHome(root) {
  root.innerHTML = `
    <div class="min-h-screen bg-white flex flex-col">
      <!-- هدر -->
      <header class="flex justify-between items-center p-6">
        <h1 class="text-4xl font-extrabold text-yellow-400">سودافزا</h1>
        <div class="flex gap-3">
          <a href="/signin" data-nav class="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-100 transition">ورود یا عضویت</a>
          <a href="/register-seller" data-nav class="px-4 py-2 bg-yellow-400 text-white rounded-full hover:bg-yellow-500 transition">ثبت‌نام فروشندگان</a>
        </div>
      </header>

      <!-- بخش اصلی -->
      <main class="flex-1 flex flex-col lg:flex-row items-center justify-between px-6 lg:px-20 py-12 gap-10">
        <!-- تصویر میوه -->
        <div class="lg:w-1/2 order-2 lg:order-1">
          <img
            src="https://via.placeholder.com/600x400.png?text=%D9%85%DB%8C%D9%88%D9%87+%D8%AA%D8%B1%D8%A7%D8%B3%D9%87"
            alt="میوه تازه"
            class="w-full rounded-2xl shadow-lg"
          />
        </div>

        <!-- متن و جستجو -->
        <div class="lg:w-1/2 text-center lg:text-right order-1 lg:order-2 space-y-6">
          <h2 class="text-5xl font-bold">سفارش آنلاین میوه و سبزیجات</h2>
          <p class="text-gray-600 text-lg">سفارش آنلاین تازه‌ترین میوه‌ها و سبزیجات با چند کلیک ساده</p>
          <div class="relative max-w-md mx-auto lg:mx-0">
            <input
              id="homeSearch"
              type="text"
              placeholder="ابتدا آدرس را انتخاب کنید."
              class="w-full border border-gray-300 rounded-full py-3 pl-12 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              id="searchBtn"
              class="absolute top-1/2 transform -translate-y-1/2 left-4 bg-yellow-400 text-white rounded-full p-3 hover:bg-yellow-500 transition"
            >🔍</button>
          </div>
        </div>
      </main>
    </div>
  `;

  // هندل سادهٔ جستجو
  const input = document.getElementById('homeSearch');
  const btn = document.getElementById('searchBtn');
  function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    // برای نمونه، alert می‌ده
    alert(`جستجو برای: ${q}`);
    // در عمل می‌توانید ناوبری کنید:
    // import('../router.js').then(m=>m.navigate(`/shop/search?q=${encodeURIComponent(q)}`));
  }
  btn.onclick = doSearch;
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}
