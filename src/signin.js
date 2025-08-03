/* ----------  src/signin.js  ---------- */
/* فرم سادهٔ ورود (موبایل + رمز) فقط روی لوکال‌‌استوریج  */

import { setSession, lockRole } from "./state.js";
import { navigate }          from "./router.js";

const LS_PASS = "userPass";           // { "<phone>" : "<pass>" , … }

function $(id, r=document){ return r.getElementById(id); }

export function renderSignin(root){

    root.innerHTML = `
    <section class="card" style="max-width:380px;margin:4rem auto">
      <h2 style="text-align:center">ورود</h2>

      <div style="display:flex;flex-direction:column;gap:.6rem">
        <label class="lbl">شماره موبایل</label>
        <input  id="phone" class="in" placeholder="09xxxxxxxxx"
                inputmode="tel" autocomplete="tel" />

        <label class="lbl">رمز عبور</label>
        <input  id="pass"  class="in" type="password"
                placeholder="******" autocomplete="current-password" />
      </div>

      <button class="btn" id="go" style="width:100%;margin-top:1.2rem">
        تایید
      </button>

      <p id="msg" class="muted" style="margin-top:.6rem"></p>
    </section>
  `;


  $("go").onclick = () => {
    const phone = $("phone").value.trim();
    const pass  = $("pass").value.trim();
    if (!/^09\d{9}$/.test(phone)) return warn("شماره صحیح نیست");
    if (!pass)                    return warn("رمز را وارد کنید");

    const DB = JSON.parse(localStorage.getItem(LS_PASS)||"{}");

    /* اگر اولین بار است، ثبت‌نام با همان رمز */
    if (!DB[phone]){
      DB[phone] = pass;
      localStorage.setItem(LS_PASS, JSON.stringify(DB));
    }

    if (DB[phone] !== pass) return warn("رمز نادرست است!");

    /* ورود موفق → نقش customer قفل می‌شود */
    lockRole("customer");
    setSession({ user:{ uid:"u_"+phone, phone, email:phone+"@local" }, role:"customer" });
    navigate("/home");
  };

  function warn(t){ $("msg").textContent = t; }
}
