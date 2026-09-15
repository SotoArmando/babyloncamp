import { createReadStream, existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publishGwdKit } from "./publish-gwd-kit.mjs";

const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
const port = Number(process.env.PORT) || 8765;
const publicRoot = join(root, "public");
const mime = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".glb": "model/gltf-binary",
  ".hdr": "application/octet-stream",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function send(res, status, body, type = "text/plain; charset=utf-8") {
  cors(res);
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8");
}

function safeName(value) {
  const name = String(value || "").split(/[/\\]/).pop();
  return /^[\w.-]+$/.test(name) ? name : "";
}

function publicFile(folder, name) {
  const file = safeName(name);
  if (!file || !["gwd", "gtm", "iframe"].includes(folder)) return "";
  return join(publicRoot, folder, file);
}

function diskFile(urlPath) {
  const clean = decodeURIComponent(String(urlPath || "").split("?")[0]);
  const rel = normalize(clean).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
  const full = resolve(root, rel);
  if (full !== root && !full.startsWith(root + "/") && !full.startsWith(root + "\\")) return "";
  return full;
}

function existsPublic(folder, name) {
  const path = publicFile(folder, name);
  return Boolean(path && existsSync(path) && statSync(path).isFile());
}

function listPublishedIframes() {
  const dir = join(publicRoot, "iframe");
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".html") && !name.includes("-gwd-snippet"))
    .map((name) => {
      const slug = name.replace(/\.html$/i, "");
      return { slug, file: name, src: `/public/iframe/${name}` };
    });
}

function normalizeGtmId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^(GTM|GT|G|AW)-[A-Z0-9]+$/.test(id) ? id : "";
}

function gtmHeadHtml(id) {
  const tag = normalizeGtmId(id);
  if (!tag) return "";
  if (tag.startsWith("GTM-")) {
    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tag}');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${tag}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tag}');</script>
<!-- End Google Tag Manager -->`;
  }
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${tag}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tag}');</script>`;
}

function gtmBodyHtml(id) {
  const tag = normalizeGtmId(id);
  if (!tag || !tag.startsWith("GTM-")) return "";
  return `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${tag}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}

function sendGtmPage(res, method, searchParams) {
  const file = join(root, "gtm.html");
  if (!existsSync(file)) {
    send(res, 404, "Not found");
    return;
  }
  const id = normalizeGtmId(searchParams.get("gtm"));
  let html = readFileSync(file, "utf8");
  html = html.replace("<!--GTM_HEAD-->", gtmHeadHtml(id));
  html = html.replace("<!--GTM_BODY-->", gtmBodyHtml(id));
  cors(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  if (method === "HEAD") {
    res.writeHead(200);
    res.end();
    return;
  }
  res.writeHead(200);
  res.end(html);
}

function kitStatus() {
  return {
    "ad-play.css": existsPublic("gwd", "ad-play.css"),
    "gwd-shell.js": existsPublic("gwd", "gwd-shell.js"),
    "env-neutral.hdr": existsPublic("gwd", "env-neutral.hdr"),
  };
}

function readBody(req, limit = 32 * 1024 * 1024) {
  return new Promise((resolveBody, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("payload demasiado grande"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolveBody(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function publish(body) {
  publishGwdKit();
  const written = ["public/gwd/ad-play.css", "public/gwd/gwd-shell.js", "public/gwd/env-neutral.hdr"];
  const iframe = safeName(body.iframeName);
  if (iframe && typeof body.iframeHtml === "string") {
    await writeFile(publicFile("iframe", iframe), body.iframeHtml, "utf8");
    written.push(`public/iframe/${iframe}`);
  }
  const snippet = safeName(body.snippetName);
  if (snippet && typeof body.snippetHtml === "string") {
    await writeFile(publicFile("iframe", snippet), body.snippetHtml, "utf8");
    written.push(`public/iframe/${snippet}`);
  }
  const glb = safeName(body.glbName);
  if (glb && body.glbBase64) {
    await writeFile(publicFile("gtm", glb), Buffer.from(String(body.glbBase64), "base64"));
    written.push(`public/gtm/${glb}`);
  }
  const img = safeName(body.imgName);
  if (img && !existsPublic("gtm", img)) {
    const src = join(root, "assets", "ads", img);
    if (existsSync(src)) {
      await copyFile(src, publicFile("gtm", img));
      written.push(`public/gtm/${img}`);
    }
  }
  return { ok: true, written };
}

function serveStatic(req, res, method) {
  const url = new URL(req.url, "http://127.0.0.1");
  let full = diskFile(url.pathname);
  if (full && statSync(full, { throwIfNoEntry: false })?.isDirectory()) {
    full = join(full, "index.html");
  }
  if ((!full || !existsSync(full) || !statSync(full).isFile()) && full && !extname(full)) {
    const html = `${full}.html`;
    if (existsSync(html) && statSync(html).isFile()) full = html;
  }
  if (!full || !existsSync(full) || !statSync(full).isFile()) {
    send(res, 404, "Not found");
    return;
  }
  const type = mime[extname(full).toLowerCase()] || "application/octet-stream";
  cors(res);
  res.setHeader("Content-Type", type);
  res.setHeader("Cache-Control", "no-store");
  if (method === "HEAD") {
    res.writeHead(200);
    res.end();
    return;
  }
  res.writeHead(200);
  createReadStream(full).pipe(res);
}

publishGwdKit();

createServer(async (req, res) => {
  const method = req.method || "GET";
  const url = new URL(req.url || "/", "http://127.0.0.1");
  if (method === "OPTIONS") {
    cors(res);
    res.writeHead(204);
    res.end();
    return;
  }
  try {
    if (url.pathname === "/api/gtm-ads" && method === "GET") {
      sendJson(res, 200, { ads: listPublishedIframes() });
      return;
    }
    const gtmPlay = url.pathname.match(/^\/gtm\/([\w.-]+)$/);
    if (gtmPlay && (method === "GET" || method === "HEAD")) {
      if (!url.searchParams.get("ad")) url.searchParams.set("ad", gtmPlay[1]);
      sendGtmPage(res, method, url.searchParams);
      return;
    }
    if ((url.pathname === "/gtm" || url.pathname === "/gtm.html") && (method === "GET" || method === "HEAD")) {
      sendGtmPage(res, method, url.searchParams);
      return;
    }
    if (url.pathname === "/api/gwd-status" && method === "GET") {
      const glb = safeName(url.searchParams.get("glb"));
      const img = safeName(url.searchParams.get("img"));
      const iframe = safeName(url.searchParams.get("iframe"));
      const snippet = safeName(url.searchParams.get("snippet"));
      sendJson(res, 200, {
        kit: kitStatus(),
        glb: glb ? existsPublic("gtm", glb) : true,
        img: img ? existsPublic("gtm", img) : true,
        iframe: iframe ? existsPublic("iframe", iframe) : true,
        snippet: snippet ? existsPublic("iframe", snippet) : true,
      });
      return;
    }
    if (url.pathname === "/api/gwd-publish" && method === "POST") {
      const raw = await readBody(req);
      const body = JSON.parse(String(raw || "{}"));
      sendJson(res, 200, await publish(body));
      return;
    }
    if (method === "GET" || method === "HEAD") {
      serveStatic(req, res, method);
      return;
    }
    send(res, 405, "Method not allowed");
  } catch (err) {
    sendJson(res, 500, { ok: false, error: String(err?.message || err) });
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`http://127.0.0.1:${port}/`);
});
