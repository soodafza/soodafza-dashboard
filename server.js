// server.js — Dev server با MIME صحیح + SPA fallback
const http = require("http");
const fs   = require("fs");
const path = require("path");

const root = __dirname;
const port = 5173;

const MIME = {
  ".html":"text/html; charset=utf-8",
  ".js":"application/javascript; charset=utf-8",
  ".mjs":"application/javascript; charset=utf-8",
  ".css":"text/css; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",
  ".ico":"image/x-icon",".map":"application/json; charset=utf-8",
  ".webmanifest":"application/manifest+json; charset=utf-8"
};

function send(res, file) {
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control":"no-store"
  });
  fs.createReadStream(file).pipe(res);
}

http.createServer((req,res)=>{
  let urlPath = decodeURI((req.url||"/").split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const abs = path.join(root, urlPath);

  // فایل واقعی
  if (abs.startsWith(root) && fs.existsSync(abs) && fs.statSync(abs).isFile())
    return send(res, abs);

  // مسیرهای SPA بدون پسوند
  if (!path.extname(urlPath))
    return send(res, path.join(root, "index.html"));

  // 404
  res.writeHead(404, {"Content-Type":"text/plain; charset=utf-8"});
  res.end("Not found");
}).listen(port, ()=> console.log(`Dev server on http://localhost:${port}`));
