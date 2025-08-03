// src/store.js
// داده‌ها کاملاً لوکال و سبک (بدون وابستگی خارجی)

// ---------- ابزارهای عمومی ----------
function get(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || ""); }
  catch { return fallback; }
}
function set(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
export const uid = (p="x") => p + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,6);

// ---------- کلیدهای ذخیره ----------
const LS_INV   = "inv";        // موجودی
const LS_SALE  = "sales";      // فروش‌ها
const LS_ORD   = "orders";     // سفارش مشتری
const LS_USER  = "users";      // کیف‌پول/پروفایل
const LS_POS   = "positions";  // موقعیت‌ها

// ========== موجودی ==========
export function loadInv(){ return get(LS_INV, []) || []; }
export function saveInv(a){ set(LS_INV, a || []); }

export function addItem({ sku, name, unit="kg", price=0, stock=0, expiry="", supplier="" }){
  const list = loadInv();
  const item = { id: uid("i"), sku, name, unit, price:+price||0, stock:+stock||0, expiry, supplier };
  list.push(item); saveInv(list); return item;
}
export function updateItem(id, patch){
  const list = loadInv();
  const i = list.findIndex(x=>x.id===id);
  if (i>-1){ list[i] = { ...list[i], ...patch }; saveInv(list); return list[i]; }
  return null;
}
export function decStock(id, q){
  const list = loadInv();
  const it = list.find(x=>x.id===id);
  if(!it) return false;
  it.stock = Math.max(0, (+it.stock||0) - (+q||0));
  saveInv(list); return true;
}
export function incStock(id, q){
  const list = loadInv();
  const it = list.find(x=>x.id===id);
  if(!it) return false;
  it.stock = (+it.stock||0) + (+q||0);
  saveInv(list); return true;
}
export function findByQuery(q){
  const list = loadInv(); if(!q) return list;
  const s = q.trim().toLowerCase();
  return list.filter(x =>
    (x.name||"").toLowerCase().includes(s) ||
    (x.sku||"").toLowerCase().includes(s)
  );
}
/* ⇣⇣⇣   تابع کمکی جدید برای کاتالوگ   ⇣⇣⇣ */
export function getItemById(id){
  return loadInv().find(x => x.id === id) || null;
}

// ========== فروش ==========
export function loadSales(){ return get(LS_SALE, []) || []; }
export function saveSales(a){ set(LS_SALE, a||[]); }
export function pushSale(sale){
  const all = loadSales(); all.push(sale); saveSales(all); return sale;
}

// ========== سفارش‌ها ==========
export function loadOrders(){ return get(LS_ORD, []) || []; }
export function saveOrders(a){ set(LS_ORD, a||[]); }
export function createOrder(order){
  const o = {
    id: order.id || uid("o"),
    at: order.at || new Date().toISOString(),
    status: order.status || "placed",
    items: order.items || [],
    total: +order.total || 0,
    address: order.address || "",
    user: order.user || null,
    notes: order.notes || ""
  };
  const all = loadOrders(); all.push(o); saveOrders(all); return o;
}
export function getOrdersByUser(u){ return loadOrders().filter(o=>o.user && o.user.uid===u); }
export function listOrders(s){ const a=loadOrders(); return s?a.filter(o=>o.status===s):a; }
export function setOrderStatus(id, st){
  const a = loadOrders(); const i=a.findIndex(o=>o.id===id);
  if(i>-1){ a[i].status=st; saveOrders(a); return a[i]; }
  return null;
}
export function nextOrderStatus(s){
  const flow = ["placed","preparing","out_for_delivery","delivered"];
  const i = flow.indexOf(s); return flow[Math.min(i+1, flow.length-1)];
}

// ========== کاربران ==========
export function loadUsers(){ return get(LS_USER, {}) || {}; }
export function saveUsers(u){ set(LS_USER, u||{}); }
export function ensureUser(uid, data={}){
  const all=loadUsers();
  all[uid]=all[uid]||{uid, name:"", phone:"", wallet:0, cashback:0};
  all[uid]={...all[uid], ...data};
  saveUsers(all); return all[uid];
}
export function getWallet(uid){
  const u=loadUsers()[uid]; return {balance:u?.wallet||0, cashback:u?.cashback||0};
}
export function addWallet(uid, d){
  const all=loadUsers(); all[uid]=all[uid]||{uid, wallet:0, cashback:0};
  all[uid].wallet=(+all[uid].wallet||0)+(+d||0);
  saveUsers(all); return all[uid].wallet;
}

// ========== موقعیت ==========
export function setPosition(uid,pos){
  const all=get(LS_POS,{})||{};
  all[uid]={...(all[uid]||{}),...pos,ts:pos.ts||Date.now()};
  set(LS_POS,all); return all[uid];
}
export function getPosition(uid){ return (get(LS_POS,{})||{})[uid]||null; }
export function listPositions(){ return get(LS_POS,{})||{}; }

// ========== گزارش کوچک ==========
export function salesTodaySum(){
  const today=new Date().toISOString().slice(0,10);
  return loadSales().filter(s=>(s.at||"").slice(0,10)===today)
                    .reduce((n,s)=>n+(+s.total||0),0);
}
