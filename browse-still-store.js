import { normalizeBrowseBlit } from "./browse-still.js?v=still2";

const DB_NAME = "babylon-ads-browse-stills";
const STORE = "stills";

let manifestPromise = null;
let manifest = null;
let dbPromise = null;

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== "object") return value;
  const out = {};
  for (const key of Object.keys(value).sort()) out[key] = stable(value[key]);
  return out;
}

function stillLook(item, blit) {
  const mesh = item.pmesh && typeof item.pmesh === "object"
    ? { name: item.pmesh.name || "", assetId: item.pmesh.assetId || "" }
    : null;
  return stable({
    play: item.play,
    propAct: item.propAct,
    ad: item.ad,
    pal: item.pal || {},
    ptrail: item.ptrail,
    p2d: item.p2d,
    p2dcol: item.p2dcol,
    p2dcon: item.p2dcon,
    pglo: item.pglo,
    ptl: item.ptl,
    pmk: item.pmk,
    psp: item.psp,
    pvel: item.pvel,
    ppop: item.ppop,
    pjoin: item.pjoin,
    ptin: item.ptin,
    pchar: item.pchar,
    pcam: item.pcam,
    pch: item.pch,
    pcv: item.pcv,
    pcm: item.pcm,
    ppx: item.ppx,
    ppy: item.ppy,
    psx: item.psx,
    psy: item.psy,
    psz: item.psz,
    plight: item.plight,
    plint: item.plint,
    pfloor: item.pfloor,
    pflat: item.pflat,
    pcog: item.pcog,
    plcol: item.plcol,
    pldist: item.pldist,
    plpos: item.plpos,
    plhrot: item.plhrot,
    plvrot: item.plvrot,
    prh: item.prh,
    prv: item.prv,
    studio: item.studio || null,
    mesh,
    blit: normalizeBrowseBlit(blit),
  });
}

function stillKey(item, blit) {
  const text = JSON.stringify(stillLook(item, blit));
  let a = 2166136261;
  let b = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    a ^= text.charCodeAt(i);
    a = Math.imul(a, 16777619);
    b ^= text.charCodeAt(text.length - 1 - i);
    b = Math.imul(b, 16777619);
  }
  const hex = (n) => (n >>> 0).toString(16).padStart(8, "0");
  return hex(a) + hex(b);
}

function stillFileId(id) {
  const name = String(id || "");
  return /^[\w.-]+$/.test(name) ? name : "";
}

function loadManifest() {
  if (!manifestPromise) {
    manifestPromise = fetch("assets/browse-stills/manifest.json", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : {}))
      .then((data) => {
        manifest = data && typeof data === "object" && !Array.isArray(data) ? data : {};
        return manifest;
      })
      .catch(() => {
        manifest = {};
        return manifest;
      });
  }
  return manifestPromise;
}

function rememberManifest(id, key, file) {
  if (!manifest || typeof manifest !== "object") manifest = {};
  manifest[id] = { key, file: String(file || "").split("/").pop() };
}

async function diskUrl(id, key) {
  const list = await loadManifest();
  const row = list?.[id];
  const file = row && row.key === key ? String(row.file || "") : "";
  if (!/^[\w.-]+\.jpg$/.test(file)) return "";
  const url = `assets/browse-stills/${file}`;
  try {
    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!head.ok) return "";
  } catch {
    return "";
  }
  return `${url}?v=${encodeURIComponent(key)}`;
}

function openDb() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function idbGet(id) {
  return openDb().then((db) => new Promise((resolve) => {
    const req = db.transaction(STORE).objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  })).catch(() => null);
}

function idbPut(id, value) {
  return openDb().then((db) => new Promise((resolve) => {
    const req = db.transaction(STORE, "readwrite").objectStore(STORE).put(value, id);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  })).catch(() => {});
}

export async function loadStoredStill(item, blit) {
  const id = String(item?.id || "");
  if (!id) return "";
  const key = stillKey(item, blit);
  const fileId = stillFileId(id);
  if (fileId) {
    const disk = await diskUrl(fileId, key);
    if (disk) return disk;
  }
  const row = await idbGet(id);
  if (row?.key === key && typeof row.url === "string" && row.url.startsWith("data:image/")) return row.url;
  return "";
}

export async function saveStoredStill(item, blit, dataUrl) {
  const id = String(item?.id || "");
  if (!id || !dataUrl) return;
  const key = stillKey(item, blit);
  await idbPut(id, { key, url: dataUrl });
  const fileId = stillFileId(id);
  if (!fileId) return;
  try {
    const res = await fetch("/api/browse-still", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: fileId, key, jpeg: dataUrl }),
    });
    if (!res.ok) return;
    const body = await res.json().catch(() => ({}));
    rememberManifest(fileId, key, body.file || `${fileId}.jpg`);
  } catch {
    /* un servidor estático no puede escribir el directorio */
  }
}
