import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const poseDir = path.join(root, "poleas-poses");
const accionDir = path.join(root, "poleas-acciones");
const cuerpoDir = path.join(root, "cuerpos");
const port = Number(process.env.PORT) || 8765;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".map": "application/json",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".soma": "text/plain; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".gltf": "model/gltf+json",
};

function slugify(raw) {
  const slug = String(raw || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return slug || "pose";
}

function send(res, status, body, type = "application/json; charset=utf-8") {
  res.writeHead(status, {
    "Content-Type": type,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

function sendJson(res, status, data) {
  send(res, status, JSON.stringify(data), "application/json; charset=utf-8");
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function posePath(file) {
  const safe = path.basename(file);
  if (!safe.endsWith(".json") || safe.includes("..")) return null;
  return path.join(poseDir, safe);
}

async function listPoses() {
  await fs.mkdir(poseDir, { recursive: true });
  const names = (await fs.readdir(poseDir)).filter((name) => name.endsWith(".json"));
  const items = [];
  for (const file of names) {
    try {
      const raw = JSON.parse(await fs.readFile(path.join(poseDir, file), "utf8"));
      items.push({
        file,
        name: raw.name || file.replace(/\.json$/i, ""),
        saved: raw.saved || null,
      });
    } catch {
      items.push({ file, name: file.replace(/\.json$/i, ""), saved: null });
    }
  }
  items.sort((a, b) => String(b.saved || "").localeCompare(String(a.saved || "")));
  return items;
}

async function listAcciones() {
  await fs.mkdir(accionDir, { recursive: true });
  const names = (await fs.readdir(accionDir)).filter((name) => name.endsWith(".soma"));
  const items = [];
  for (const file of names) {
    const text = await fs.readFile(path.join(accionDir, file), "utf8");
    const title = (text.match(/^#\s*(.+)$/m) || [])[1];
    items.push({
      file,
      name: (title || file.replace(/\.soma$/i, "")).trim(),
    });
  }
  items.sort((a, b) => String(a.name).localeCompare(String(b.name), "es"));
  return items;
}

function accionPath(file) {
  const safe = path.basename(file);
  if (!safe.endsWith(".soma") || safe.includes("..")) return null;
  return path.join(accionDir, safe);
}

function prettyCuerpoName(file) {
  return String(file || "")
    .replace(/\.(glb|gltf)$/i, "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[_\+]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "cuerpo";
}

async function listCuerpos() {
  await fs.mkdir(cuerpoDir, { recursive: true });
  const names = (await fs.readdir(cuerpoDir)).filter((name) => /\.(glb|gltf)$/i.test(name));
  names.sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
  return names.map((file) => ({
    id: file,
    file,
    name: prettyCuerpoName(file),
    url: "/cuerpos/" + encodeURIComponent(file),
  }));
}

async function handleApi(req, res, url) {
  if (req.method === "OPTIONS") {
    send(res, 204, "");
    return true;
  }
  if (url.pathname === "/api/poleas-poses" && req.method === "GET") {
    sendJson(res, 200, { ok: true, items: await listPoses() });
    return true;
  }
  if (url.pathname === "/api/poleas-acciones" && req.method === "GET") {
    sendJson(res, 200, { ok: true, items: await listAcciones() });
    return true;
  }
  if (url.pathname === "/api/cuerpos" && req.method === "GET") {
    sendJson(res, 200, { ok: true, items: await listCuerpos() });
    return true;
  }
  const poseMatch = url.pathname.match(/^\/api\/poleas-poses\/([^/]+)$/);
  if (poseMatch) {
    const file = slugify(decodeURIComponent(poseMatch[1])) + ".json";
    const dest = posePath(file);
    if (!dest) {
      sendJson(res, 400, { ok: false, error: "name" });
      return true;
    }
    if (req.method === "PUT") {
      let payload;
      try {
        payload = JSON.parse(await readBody(req));
      } catch {
        sendJson(res, 400, { ok: false, error: "json" });
        return true;
      }
      if (!payload || typeof payload !== "object") {
        sendJson(res, 400, { ok: false, error: "json" });
        return true;
      }
      payload.kind = "soma-poleas-pose";
      payload.version = 1;
      payload.saved = new Date().toISOString();
      if (!payload.name) payload.name = file.replace(/\.json$/i, "");
      await fs.mkdir(poseDir, { recursive: true });
      await fs.writeFile(dest, JSON.stringify(payload, null, 2) + "\n", "utf8");
      sendJson(res, 200, { ok: true, file, name: payload.name });
      return true;
    }
    if (req.method === "DELETE") {
      try {
        await fs.unlink(dest);
      } catch {
        sendJson(res, 404, { ok: false, error: "missing" });
        return true;
      }
      sendJson(res, 200, { ok: true, file });
      return true;
    }
    return false;
  }
  const accionMatch = url.pathname.match(/^\/api\/poleas-acciones\/([^/]+)$/);
  if (!accionMatch) return false;
  const file = slugify(decodeURIComponent(accionMatch[1])) + ".soma";
  const dest = accionPath(file);
  if (!dest) {
    sendJson(res, 400, { ok: false, error: "name" });
    return true;
  }
  if (req.method === "PUT") {
    let payload;
    try {
      payload = JSON.parse(await readBody(req));
    } catch {
      sendJson(res, 400, { ok: false, error: "json" });
      return true;
    }
    const source = String(payload.source ?? payload.text ?? "");
    await fs.mkdir(accionDir, { recursive: true });
    await fs.writeFile(dest, source.endsWith("\n") ? source : source + "\n", "utf8");
    sendJson(res, 200, { ok: true, file, name: payload.name || file.replace(/\.soma$/i, "") });
    return true;
  }
  if (req.method === "DELETE") {
    try {
      await fs.unlink(dest);
    } catch {
      sendJson(res, 404, { ok: false, error: "missing" });
      return true;
    }
    sendJson(res, 200, { ok: true, file });
    return true;
  }
  return false;
}

async function resolveFile(rel) {
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) return null;
  try {
    const stat = await fs.stat(file);
    if (stat.isDirectory()) return path.join(file, "index.html");
    return file;
  } catch {
    if (!path.extname(file)) {
      try {
        await fs.stat(file + ".html");
        return file + ".html";
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function handleStatic(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  const target = await resolveFile(rel);
  if (!target) {
    send(res, 404, "not found", "text/plain; charset=utf-8");
    return;
  }
  try {
    const data = await fs.readFile(target);
    send(res, 200, data, MIME[path.extname(target).toLowerCase()] || "application/octet-stream");
  } catch {
    send(res, 404, "not found", "text/plain; charset=utf-8");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  try {
    if (await handleApi(req, res, url)) return;
    if (req.method !== "GET" && req.method !== "HEAD") {
      send(res, 405, "method", "text/plain; charset=utf-8");
      return;
    }
    await handleStatic(req, res, url);
  } catch (err) {
    sendJson(res, 500, { ok: false, error: String(err && err.message ? err.message : err) });
  }
});

server.listen(port, () => {
  console.log(`Soma en http://127.0.0.1:${port}/poleas`);
});
