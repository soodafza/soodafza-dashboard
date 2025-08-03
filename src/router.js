import { session, roleLock } from "./state.js";

const routes = new Map();
const appRoot = () => document.getElementById("app");

/** ثبت یک مسیر */
export const register = (path, loader) => routes.set(path, loader);

/** ناوبری به مسیر مشخص */
export async function navigate(path, replace = false) {
  // بررسی دسترسی
  if (!allowed(path)) path = "/signin";
  try {
    // loader یا تابع رندر پیش‌فرض 404
    const loader = routes.get(path) || (() => Promise.resolve(root => {
      root.innerHTML = "<section class='card'><h2>۴۰۴ - صفحه یافت نشد</h2></section>";
    }));
    const modOrFn = await loader();
    // انتخاب تابع render
    const fn = typeof modOrFn === "function"
      ? modOrFn
      : (typeof modOrFn?.default === "function" ? modOrFn.default : null);
    if (!fn) throw new Error("Route loader did not return a render function");
    fn(appRoot());
    history[replace ? "replaceState" : "pushState"]({}, "", path);
  } catch (err) {
    console.error("Router error:", err);
    appRoot().innerHTML = "<section class='card'><h2 style='color:#f55'>خطا در مسیریابی</h2></section>";
  }
}

/** کنترل دسترسی بر اساس نقش */
function allowed(path) {
  if (path.startsWith("/shop")) return true;
  if (["/", "/home", "/signin"].includes(path)) return true;
  const r = session.role || roleLock || "guest";
  if (r === "admin") return true;
  if (r === "cashier") return [
    "/pos", "/scan", "/admin/inventory",
    "/admin/orders", "/admin/report", "/home"
  ].includes(path);
  if (r === "rider") return ["/delivery", "/map", "/home"].includes(path);
  if (r === "customer") return ["/customer/orders", "/customer/qr", "/home"].includes(path);
  return false;
}

/** ثبت همه مسیرها و هندل ناوبری */
export function initRouter() {
  // عمومی
  register("/home",   () => import("./page/home.js").then(m => m.renderHome));
  register("/signin", () => import("./signin.js").then(m => m.renderSignin));

  // صندوقدار / مدیر
  register("/pos",             () => import("./pos.js").then(m => m.renderPOS));
  register("/scan",            () => import("./scan.js").then(m => m.renderScan));
  register("/admin/inventory", () => import("./admin/inventory.js").then(m => m.renderInventory));
  register("/admin/orders",    () => import("./admin/orders.js").then(m => m.renderAdminOrders));
  register("/admin/report",    () => import("./admin/report.js").then(m => m.renderAdminReport));

  // مشتری
  register("/customer/orders", () => import("./customer/orders.js").then(m => m.renderCustomerOrders));
  register("/customer/qr",     () => import("./customer/qr.js").then(m => m.renderCustomerQR));

  // موتورسوار
  register("/delivery", () => import("./rider/delivery.js").then(m => m.renderRiderDelivery));
  register("/map",      () => import("./rider/map.js").then(m => m.renderRiderMap));

  // فروشگاه
  register("/shop",        () => import("./shop/index.js").then(m => m.renderShop));
  register("/shop/search", () => import("./shop/search.js").then(m => m.renderSearch));
  register("/shop/cart",   () => import("./shop/cart.js").then(m => m.renderCart));
  register("/shop/orders", () => import("./shop/orders.js").then(m => m.renderOrders));
  register("/shop/login",  () => import("./shop/login.js").then(m => m.renderShopLogin));

  // ریدایرکت "/" به "/home"
  if (location.pathname === "/") history.replaceState({}, "", "/home");

  // لینک‌های داخلی
  document.addEventListener("click", e => {
    const a = e.target.closest("a[data-nav]");
    if (!a) return;
    const u = new URL(a.href, location.origin);
    if (u.origin !== location.origin) return;
    e.preventDefault();
    navigate(u.pathname);
  });

  // back/forward
  window.addEventListener("popstate", () => navigate(location.pathname || "/home", true));

  // رندر اولیه
  navigate(location.pathname || "/home", true);
}
