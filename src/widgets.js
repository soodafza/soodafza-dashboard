/*  ساده‌ترین ویجت هوا + ماشین‌حساب درون‌صفحه  */
/*  هیچ کتابخانهٔ بیرونی لازم ندارد  */

export function mountWidgets(root){

  /* ---------- کارت هوا ---------- */
  const wCard = document.createElement("div");
  wCard.className = "wx card-sm";
  wCard.innerHTML = `<b>هوا:</b> <span id="wx-tmp">…°C</span> <small id="wx-city" class="muted"></small>`;
  root.prepend(wCard);

  /* Geo + Open-Meteo (بدون کلید) */
  navigator.geolocation?.getCurrentPosition(ok=>loadWX(ok.coords),()=>loadWX());
  function loadWX(coords){
    const {latitude:lat=35,longitude:lon=51} = coords||{};
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
      .then(r=>r.json()).then(d=>{
        $("#wx-tmp",wCard).textContent = Math.round(d.current_weather.temperature)+"°C";
        $("#wx-city",wCard).textContent = d.timezone.replace("_"," ");
      }).catch(()=>$("#wx-tmp",wCard).textContent="n/a");
  }

  /* ---------- ماشین‌حساب ---------- */
  const calc = document.createElement("dialog");
  calc.id="calcDlg";
  calc.innerHTML = `
    <form method="dialog" class="card" style="min-width:220px;text-align:center">
      <h3>ماشین‌حساب</h3>
      <input id="calcIn" class="in wide" placeholder="مثلاً 12+7*3">
      <div class="row" style="justify-content:center;margin-top:.6rem">
        <button class="btn">محاسبه</button>
        <button class="btn" value="close">بستن</button>
      </div>
      <div id="calcRes" class="mt muted"></div>
    </form>`;
  document.body.appendChild(calc);

  const btn = document.createElement("button");
  btn.className="btn"; btn.textContent="🧮";
  btn.style="position:fixed;bottom:18px;left:18px;z-index:999";
  document.body.appendChild(btn);

  btn.onclick = ()=>{ calc.showModal(); $("#calcIn").focus(); };
  calc.querySelector("form").onsubmit = e=>{
    e.preventDefault();
    try{
      const v = eval($("#calcIn").value||"");
      $("#calcRes").textContent = " = "+v;
    }catch{
      $("#calcRes").textContent = "معادله نامعتبر!";
    }
  };

  /* helper */
  function $(q,p=document){return p.querySelector(q);}
}
