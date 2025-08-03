// src/customers.js
import { db } from "./http.js";
import { t } from "./i18n.js";
import { makeQR } from "./qr.js";

const $ = (s, r = document) => r.querySelector(s);
const uid = () => "c" + Math.random().toString(36).slice(2, 9);
const fmt = n => (n || 0).toLocaleString("fa-IR");

export function CustomersPage(root) {
  root.innerHTML = `
  <section class="card">
    <h2 class="title">${t('wallet')}</h2>

    <div class="row">
      <input class="inp" id="q" placeholder="جستجو بر اساس موبایل یا نام">
      <button class="btn" id="findBtn">جستجو</button>
      <a class="btn" data-nav href="/scan">اسکن QR</a>
    </div>

    <div class="grid">
      <div class="box">
        <h3>افزودن/ویرایش مشتری</h3>
        <input class="inp" id="ph" placeholder="موبایل">
        <input class="inp" id="nm" placeholder="نام">
        <input class="inp" id="addr" placeholder="آدرس">
        <button class="btn" id="save">ذخیره</button>
      </div>

      <div class="box">
        <h3>اطلاعات مشتری</h3>
        <div id="info" class="muted">مشتری انتخاب نشده است</div>
        <div class="row" id="qrBox"></div>
      </div>
    </div>

    <h3 style="margin-top:14px">فهرست مشتریان</h3>
    <div id="list" class="list"></div>
  </section>`;

  const listEl = $("#list", root);
  const infoEl = $("#info", root);
  const qrBox  = $("#qrBox", root);

  $("#save").onclick = async () => {
    const phone = $("#ph").value.trim();
    const name  = $("#nm").value.trim();
    const addr  = $("#addr").value.trim();
    if (!phone) return alert("موبایل لازم است");
    await db.put(`customers/${phone}`, { id: uid(), phone, name, addr, balance: 0, ts: Date.now() });
    await renderList(); alert("ذخیره شد.");
  };

  $("#findBtn").onclick = async () => {
    const q = $("#q").value.trim();
    const c = await findOne(q);
    c ? renderInfo(c) : alert("پیدا نشد");
  };

  async function findOne(q) {
    const all = await db.get("customers") || {};
    const arr = Object.values(all);
    return arr.find(c => c.phone === q || (c.name || "").includes(q));
  }

  function renderInfo(c) {
    infoEl.innerHTML = `
      <div class="row"><b>${c.name || "—"}</b> — ${c.phone}</div>
      <div class="muted">${c.addr || ""}</div>
      <div>اعتبار کیف‌پول: <b>${fmt(c.balance)} تومان</b></div>
    `;
    // QR دائمی مشتری
    const code = `cust:${c.phone}`;
    makeQR(code, 180).then(svg => {
      qrBox.innerHTML = `
        <div class="box" style="background:#fff;border-radius:12px;padding:8px">${svg}</div>
        <div class="row">
          <button class="btn" id="copy">کپی کد</button>
          <span class="muted">${code}</span>
        </div>`;
      $("#copy")?.addEventListener("click", () => navigator.clipboard.writeText(code));
    });
  }

  async function renderList() {
    const all = await db.get("customers") || {};
    const items = Object.values(all).sort((a, b) => b.ts - a.ts);
    listEl.innerHTML = items.map(c => `
      <div class="row">
        <div><b>${c.name || "—"}</b> — ${c.phone}</div>
        <div class="muted">${fmt(c.balance)} تومان</div>
        <button class="btn btn-sm" data-p="${c.phone}">نمایش</button>
      </div>
    `).join("") || "<div class='muted'>مشتری‌ای ثبت نشده</div>";

    listEl.querySelectorAll("[data-p]").forEach(b => {
      b.onclick = async () => {
        const p = b.dataset.p; const c = (await db.get(`customers/${p}`)) || null;
        if (c) renderInfo(c);
      };
    });
  }

  renderList();
}
