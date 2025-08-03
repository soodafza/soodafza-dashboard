// src/page/home.js

/**
 * صفحهٔ اصلی با یک نوار جستجو شبیه اسنپ‌فود
 */
export function renderHome(root) {
  root.innerHTML = `
    <section class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto text-center">
        <h1 class="text-3xl font-bold mb-4">به سوداافزا خوش آمدید!</h1>
        <div class="relative mb-8">
          <input
            id="homeSearch"
            type="text"
            placeholder="چی می‌خوای امروز سفارش بدی؟"
            class="w-full border border-gray-300 rounded-full py-3 px-5 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            id="searchBtn"
            class="absolute top-1/2 transform -translate-y-1/2 right-3 bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition"
          >
            🔍
          </button>
        </div>
        <div id="searchResults" class="space-y-4"></div>
      </div>
    </section>
  `;

  const input = document.getElementById('homeSearch');
  const btn   = document.getElementById('searchBtn');
  const results = document.getElementById('searchResults');

  function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    // نمونهٔ نتایج موقت
    const items = [
      { id: 'apple', name: 'سیب تازه' },
      { id: 'banana', name: 'موز درجه یک' },
      { id: 'orange', name: 'پرتقال آفریقایی' }
    ].filter(i => i.name.includes(q));

    results.innerHTML = items.length
      ? items.map(i => `
          <div class="p-4 bg-white rounded shadow flex justify-between items-center">
            <span>${i.name}</span>
            <button class="btn-sm text-blue-500" data-id="${i.id}">انتخاب</button>
          </div>
        `).join('')
      : `<p class="text-gray-500">موردی یافت نشد.</p>`;

    // هندل دکمه‌های انتخاب
    results.querySelectorAll('button[data-id]').forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        // هدایت به صفحه فروش یا جزئیات
        import('../router.js').then(m => m.navigate(`/shop/search?q=${encodeURIComponent(id)}`));
      };
    });
  }

  btn.onclick = doSearch;
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') doSearch();
  });
}
