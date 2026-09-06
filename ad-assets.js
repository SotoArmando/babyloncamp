const DB_NAME = "babylon-ads-asset-lib";
const STORE = "files";
const THUMB_STORE = "thumbs";
export const ASSET_THUMB_VER = 6;
const FOLDER = "/assets/3d/";
const MESH_EXT = new Set(["glb", "gltf", "obj"]);
const EXTRA_EXT = new Set(["mtl", "bin", "png", "jpg", "jpeg", "webp", "bmp", "tga"]);

function uid() {
  return `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function assetExt(name = "") {
  const m = String(name).toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

export function isAssetFile(name) {
  const ext = assetExt(name);
  return MESH_EXT.has(ext) || EXTRA_EXT.has(ext);
}

export function isMeshFile(name) {
  return MESH_EXT.has(assetExt(name));
}

export function formatBytes(n) {
  const size = Number(n) || 0;
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`;
  return `${(size / (1024 * 1024)).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) {
        req.result.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!req.result.objectStoreNames.contains(THUMB_STORE)) {
        req.result.createObjectStore(THUMB_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbReq(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function recordToItem(rec) {
  return {
    id: rec.id,
    name: rec.name,
    ext: assetExt(rec.name),
    size: rec.size,
    source: "library",
    added: rec.added,
    lastModified: rec.lastModified,
  };
}

export async function listStoredAssets() {
  try {
    const db = await openDb();
    const rows = await idbReq(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
    db.close();
    return (rows || []).map(recordToItem).sort((a, b) => (b.added || 0) - (a.added || 0));
  } catch {
    return [];
  }
}

export async function saveAssetFiles(files) {
  const incoming = [...files].filter((file) => isAssetFile(file.name));
  if (!incoming.length) return { ok: false, error: "empty" };
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  const store = tx.objectStore(STORE);
  const added = Date.now();
  const items = [];
  for (const file of incoming) {
    const rec = {
      id: uid(),
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified,
      added,
      buffer: await file.arrayBuffer(),
    };
    store.put(rec);
    items.push(recordToItem(rec));
  }
  await new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return { ok: true, items };
}

export async function deleteStoredAsset(id) {
  const db = await openDb();
  await idbReq(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
  db.close();
}

export async function loadStoredAssetFile(id) {
  const db = await openDb();
  const rec = await idbReq(db.transaction(STORE, "readonly").objectStore(STORE).get(id));
  db.close();
  if (!rec?.buffer) return null;
  return new File([rec.buffer], rec.name, { type: rec.type, lastModified: rec.lastModified });
}

export function assetBaseName(name = "") {
  return String(name).replace(/\.[^.]+$/, "").toLowerCase();
}

async function assetToFile(item) {
  const source = await getAssetLoadSource(item);
  if (!source) return null;
  if (source.kind === "file") return source.file;
  const res = await fetch(source.url);
  if (!res.ok) return null;
  const buffer = await res.arrayBuffer();
  return new File([buffer], source.name, { type: source.fileType || "", lastModified: item.lastModified || Date.now() });
}

export async function loadAssetFilesForMesh(item, catalog = []) {
  if (!item || !isMeshFile(item.name)) return [];
  const base = assetBaseName(item.name);
  const extras = catalog.filter((entry) => (
    entry.id !== item.id
    && !isMeshFile(entry.name)
    && assetBaseName(entry.name) === base
  ));
  const files = [];
  for (const entry of [item, ...extras]) {
    const file = await assetToFile(entry);
    if (file) files.push(file);
  }
  return files;
}

export async function getAssetLoadSource(item) {
  if (!item) return null;
  if (item.source === "folder" && item.url) return { kind: "url", url: item.url, name: item.name };
  const file = await loadStoredAssetFile(item.id);
  if (!file) return null;
  return { kind: "file", file, name: file.name };
}

function folderItem(name, size = 0) {
  return {
    id: `folder:${name}`,
    name,
    ext: assetExt(name),
    size,
    source: "folder",
    url: `${FOLDER}${encodeURIComponent(name)}`,
    added: 0,
  };
}

async function listFromManifest() {
  const res = await fetch(`${FOLDER}manifest.json`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const names = Array.isArray(data?.files) ? data.files : [];
  return names
    .map((entry) => (typeof entry === "string" ? { name: entry } : entry))
    .filter((entry) => entry?.name && isAssetFile(entry.name))
    .map((entry) => folderItem(entry.name, entry.size || 0));
}

async function listFromDirectoryIndex() {
  const res = await fetch(FOLDER, { cache: "no-store" });
  if (!res.ok) return [];
  const html = await res.text();
  const names = new Set();
  for (const match of html.matchAll(/href=["']([^"'?#]+)["']/gi)) {
    const raw = decodeURIComponent(match[1].split("/").pop() || "");
    if (raw && raw !== "manifest.json" && isAssetFile(raw)) names.add(raw);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "es")).map((name) => folderItem(name));
}

export async function listFolderAssets() {
  const byName = new Map();
  try {
    for (const item of await listFromManifest()) byName.set(item.name.toLowerCase(), item);
  } catch {
    /* optional */
  }
  try {
    for (const item of await listFromDirectoryIndex()) {
      if (!byName.has(item.name.toLowerCase())) byName.set(item.name.toLowerCase(), item);
    }
  } catch {
    /* optional */
  }
  return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export async function listAllAssets() {
  const [folder, stored] = await Promise.all([listFolderAssets(), listStoredAssets()]);
  const folderNames = new Set(folder.map((item) => item.name.toLowerCase()));
  const extra = stored.filter((item) => !folderNames.has(item.name.toLowerCase()));
  return [...folder, ...extra];
}

export async function saveAssetThumb(id, dataUrl, preset = "") {
  const db = await openDb();
  await idbReq(db.transaction(THUMB_STORE, "readwrite").objectStore(THUMB_STORE).put({
    dataUrl,
    preset,
    ver: ASSET_THUMB_VER,
    at: Date.now(),
  }, id));
  db.close();
}

export async function loadAssetThumbs() {
  try {
    const db = await openDb();
    const tx = db.transaction(THUMB_STORE, "readonly");
    const store = tx.objectStore(THUMB_STORE);
    const keys = await idbReq(store.getAllKeys());
    const map = new Map();
    for (const key of keys || []) {
      const rec = await idbReq(store.get(key));
      if (rec?.dataUrl && rec.ver === ASSET_THUMB_VER) map.set(key, rec.dataUrl);
    }
    db.close();
    return map;
  } catch {
    return new Map();
  }
}
