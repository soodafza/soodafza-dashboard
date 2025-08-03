// src/i18n.js
// ساده، بدون وابستگی، با fallback، جایگزینی و خبررسانی تغییر زبان.

export const LANGS = ["fa", "en"];
const STORAGE_KEY = "lang";

// === مدیریت زبان ===
export function getLang() {
  return localStorage.getItem(STORAGE_KEY) || "fa";
}
export function setLang(l) {
  if (!LANGS.includes(l)) return;
  localStorage.setItem(STORAGE_KEY, l);
  document.documentElement.lang = l;
  document.documentElement.dir = l === "fa" ? "rtl" : "ltr";
  dispatchChange(l);
}

// === رویداد تغییر زبان (اگر UI بخواد خودبه‌خود رندر کنه) ===
const listeners = new Set();
function dispatchChange(lang) {
  for (const fn of listeners) {
    try { fn(lang); } catch {}
  }
}
export function onLangChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// === فرهنگ‌نامه ===
const dict = {
  fa: {
    sale: "فروش",
    inventory: "موجودی",
    rider: "موتورسوار",
    wallet: "مشتری/کیف‌پول",
    map: "نقشه",
    subs: "اشتراک‌ها",
    order: "سفارش آنلاین",
    scan: "اسکن QR",
    signin: "ورود",
    logout: "خروج",
    offline: "آفلاین",
    theme: "پوسته",
    lang: "زبان",
    home: "خانه",
    delivery: "تحویل",
    customer_orders: "سفارش‌های من",
    customer_qr: "کیو‌آر‌کد",
    admin_orders: "سفارش‌ها",
    admin_inventory: "موجودی",
    pos: "صندوق فروش",
    search: "جستجو",
    add: "افزودن",
    scan_item: "اسکن کالا",
    discount: "تخفیف",
    cashback: "کش‌بک",
    payable: "قابل پرداخت",
    customer_info: "اطلاعات مشتری",
    finalize: "ثبت فروش",
    order_status: "وضعیت سفارش",
    placed: "ثبت‌شده",
    preparing: "در حال آماده‌سازی",
    out_for_delivery: "در راه",
    delivered: "تحویل داده شد",
    history: "سابقه",
    debt: "بدهی",
    wallet_balance: "کیف‌پول",
    credit: "اعتبار",
    last_purchase: "آخرین خرید",
    active_since: "فعال از",
    total: "مجموع",
    cancel: "لغو",
    details: "جزئیات",
    next: "بعدی",
    filter: "فیلتر",
    summary: "خلاصه",
    customer: "مشتری",
    rider_location: "موقعیت موتورسوار",
    customer_location: "موقعیت مشتری",
    order_id: "شناسه سفارش",
    user: "کاربر",
    items: "آیتم‌ها",
    address: "آدرس",
    notes: "یادداشت",
    search_placeholder: "جستجو: شناسه/شماره",
    login_offline: "ورود آفلاین",
    name: "نام و نام خانوادگی",
    phone: "شماره موبایل",
    postal_code: "کد پستی",
    apply: "اعمال",
    cancel_order: "لغو سفارش",
    view_map: "نمایش نقشه",
    timeline: "تایم‌لاین",
    duration: "مدت",
    total_time: "کل زمان"
  },
  en: {
    sale: "Sales",
    inventory: "Inventory",
    rider: "Rider",
    wallet: "Customers/Wallet",
    map: "Map",
    subs: "Subscriptions",
    order: "Online Order",
    scan: "Scan QR",
    signin: "Sign in",
    logout: "Sign out",
    offline: "Offline",
    theme: "Theme",
    lang: "Language",
    home: "Home",
    delivery: "Delivery",
    customer_orders: "My Orders",
    customer_qr: "QR Code",
    admin_orders: "Orders",
    admin_inventory: "Inventory",
    pos: "POS",
    search: "Search",
    add: "Add",
    scan_item: "Scan Item",
    discount: "Discount",
    cashback: "Cashback",
    payable: "Payable",
    customer_info: "Customer Info",
    finalize: "Finalize Sale",
    order_status: "Order Status",
    placed: "Placed",
    preparing: "Preparing",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    history: "History",
    debt: "Debt",
    wallet_balance: "Wallet",
    credit: "Credit",
    last_purchase: "Last Purchase",
    active_since: "Active Since",
    total: "Total",
    cancel: "Cancel",
    details: "Details",
    next: "Next",
    filter: "Filter",
    summary: "Summary",
    customer: "Customer",
    rider_location: "Rider Location",
    customer_location: "Customer Location",
    order_id: "Order ID",
    user: "User",
    items: "Items",
    address: "Address",
    notes: "Notes",
    search_placeholder: "Search: ID/Phone",
    login_offline: "Offline Login",
    name: "Name",
    phone: "Phone",
    postal_code: "Postal Code",
    apply: "Apply",
    cancel_order: "Cancel Order",
    view_map: "View Map",
    timeline: "Timeline",
    duration: "Duration",
    total_time: "Total Time"
  }
};

// === ترجمه ===
export function t(key, vars = {}) {
  const lang = getLang();
  const from = (dict[lang] && dict[lang][key]) || dict["fa"][key] || key;
  return interpolate(from, vars);
}

// ساده برای جایگزینی قالب {name}
function interpolate(str, vars) {
  return str.replace(/\{([^}]+)\}/g, (_, k) => {
    return vars[k.trim()] !== undefined ? vars[k.trim()] : `{${k}}`;
  });
}

// کمکی: عنصر با متن ترجمه‌شده
export function el(key, vars = {}) {
  const span = document.createElement("span");
  span.textContent = t(key, vars);
  return span;
}

// اعمال اولیه زبان
setLang(getLang());
