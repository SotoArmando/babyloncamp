import {
  PLAY_MODES,
  PROP_ACTIONS,
  playById,
  propActionById,
  propAimLightById,
  propAimPlaceById,
  normalizePropLint,
  normalizePropFloor,
  normalizePropCog,
  normalizePropFlat,
  normalizePropLcol,
  normalizePropLdist,
  normalizePropLhrot,
  normalizePropLvrot,
  normalizePropSpin,
  normalizePropCam,
  normalizePropCamH,
  normalizePropCamV,
  normalizePropCamMode,
  normalizePropCamPan,
  normalizeViewFps,
  normalizeViewBlit,
  normalizeViewShelf,
  normalizeViewSideDlg,
  normalizeViewZoom,
  normalizeViewClock,
  normalizeViewClockStyle,
  normalizeViewClockTone,
  normalizeViewClockSize,
  formatById,
  handoffById,
  normalizeHandoffMs,
  normalizeHandoffBands,
  normalizeHandoffStagger,
  normalizeHandoffHold,
  normalizeHandoffIn,
  normalizeHandoffBeats,
  normalizeHandoffTempo,
  normalizeHandoffText,
  normalizeHandoffEmpty,
  playPaletteKey,
  serializePlayColorState,
  serializeAdPlace,
  resolvePalette,
  resolveAdPlace,
} from "./ad-catalog.js?v=cam25";
import { normalizeStudioState } from "./studio-lights.js";
import { onPlayerOriginChange, playerUrl } from "./player-origin.js";

export const PROFILE_KEY = "babylon-ads-gallery";
export const PROFILE_KEY_GWD = "babylon-ads-gallery-gwd";

export function isGwdGalleryPage() {
  if (typeof document !== "undefined" && document.body?.dataset.visor === "gwd") return true;
  if (typeof location === "undefined") return false;
  const pathname = String(location.pathname || "");
  const file = (pathname.split("/").pop() || "").replace(/\.html$/i, "");
  if (pathname.includes("/gwd/")) return true;
  if (file === "gallery-gwd" || file === "gwd-light" || file === "gwd-light-ad") return true;
  try {
    const q = new URLSearchParams(location.search);
    const hash = String(location.hash || "");
    return q.get("visor") === "gwd" || hash.includes("visor=gwd");
  } catch {
    return false;
  }
}

export function galleryStorageKey() {
  return isGwdGalleryPage() ? PROFILE_KEY_GWD : PROFILE_KEY;
}

function uid() {
  return `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function defaultView() {
  return { cols: "3", size: "m", gap: "md", previewW: null, voidL: 14, zoom: 1, format: "medium", cat: "all", showOff: false, afps: 0, blit: 1.5, shelf: "column", sideDlg: false, clock: true, clockStyle: "sweep", clockTone: "dark", clockSize: 100, ph: resolveAdPlace() };
}

export function comboTitle(item) {
  const play = playById(item.play);
  if (play.id !== "prop") return play.label;
  return `${play.label} · ${propActionById(item.propAct).label}`;
}

export function comboShortTitle(item) {
  if (item?.alias) return item.alias;
  const play = playById(item.play);
  if (play.id === "prop") return propActionById(item.propAct).label;
  return play.label.replace(/^Clímax · /, "");
}

export function comboBlurb(item) {
  const play = playById(item.play);
  if (play.id !== "prop") return play.blurb;
  return propActionById(item.propAct).blurb;
}

function normalizePmesh(pmesh) {
  if (!pmesh || !pmesh.name) return null;
  const extras = Array.isArray(pmesh.extras) ? pmesh.extras.map(String).filter(Boolean) : [];
  const assetId = pmesh.assetId ? String(pmesh.assetId) : "";
  return { name: String(pmesh.name), extras, assetId };
}

export function makeCombo(partial = {}) {
  const play = playById(partial.play);
  return {
    id: partial.id || uid(),
    play: play.id,
    propAct: play.id === "prop" ? propActionById(partial.propAct).id : "",
    ad: formatById(partial.ad).id,
    in: partial.in || "none",
    hand: handoffById(partial.hand).id,
    hms: normalizeHandoffMs(partial.hms),
    hnb: normalizeHandoffBands(partial.hnb),
    hst: normalizeHandoffStagger(partial.hst),
    hhd: normalizeHandoffHold(partial.hhd),
    hin: normalizeHandoffIn(partial.hin),
    hbt: normalizeHandoffBeats(partial.hbt),
    htm: normalizeHandoffTempo(partial.htm),
    htxt: normalizeHandoffText(partial.htxt),
    hempty: normalizeHandoffEmpty(partial.hempty),
    pal: partial.pal && typeof partial.pal === "object" ? { ...partial.pal } : {},
    ph: resolveAdPlace(partial.ph),
    pcam: play.id === "prop" ? normalizePropCam(partial.pcam) : "",
    pch: play.id === "prop" ? normalizePropCamH(partial.pch) : "",
    pcv: play.id === "prop" ? normalizePropCamV(partial.pcv) : "",
    pcm: play.id === "prop" ? normalizePropCamMode(partial.pcm) : "",
    ppx: play.id === "prop" ? normalizePropCamPan(partial.ppx) : "",
    ppy: play.id === "prop" ? normalizePropCamPan(partial.ppy) : "",
    psx: partial.psx || "0.72",
    psy: partial.psy || "0.72",
    psz: partial.psz || "0.72",
    plight: play.id === "prop" ? propAimLightById(partial.plight).id : "",
    plint: play.id === "prop" ? normalizePropLint(partial.plint) : "",
    pfloor: play.id === "prop" ? normalizePropFloor(partial.pfloor ?? "1") : "",
    pflat: play.id === "prop" ? normalizePropFlat(partial.pflat) : "",
    pcog: play.id === "prop" ? normalizePropCog(partial.pcog ?? "1") : "",
    plcol: play.id === "prop" ? normalizePropLcol(partial.plcol) : "",
    pldist: play.id === "prop" ? normalizePropLdist(partial.pldist) : "",
    plpos: play.id === "prop" ? propAimPlaceById(partial.plpos).id : "",
    plhrot: play.id === "prop" ? normalizePropLhrot(partial.plhrot) : "",
    plvrot: play.id === "prop" ? normalizePropLvrot(partial.plvrot) : "",
    prh: play.id === "prop" ? normalizePropSpin(partial.prh) : "",
    prv: play.id === "prop" ? normalizePropSpin(partial.prv) : "",
    studio: play.id === "prop" ? normalizeStudioState(partial.studio) : null,
    alias: String(partial.alias || "").trim(),
    off: Boolean(partial.off),
    pin: Boolean(partial.pin),
    pmesh: normalizePmesh(partial.pmesh),
  };
}

export function seedCombos() {
  const items = [];
  for (const play of PLAY_MODES) {
    if (play.id === "prop") {
      for (const act of PROP_ACTIONS) {
        items.push(makeCombo({ play: play.id, propAct: act.id, ad: "medium", in: "none" }));
      }
    } else {
      items.push(makeCombo({ play: play.id, ad: "medium", in: "none" }));
    }
  }
  return items;
}

function emptyStore() {
  const profile = {
    id: uid(),
    name: "Galería 1",
    createdAt: Date.now(),
    items: seedCombos(),
  };
  return {
    version: 1,
    activeId: profile.id,
    view: defaultView(),
    profiles: [profile],
  };
}

function fillMissingSeedCombos(profile) {
  if (!profile || !Array.isArray(profile.items)) return false;
  const have = new Set(profile.items.map((item) => `${item.play}|${item.propAct || ""}`));
  let added = false;
  for (const seed of seedCombos()) {
    const key = `${seed.play}|${seed.propAct || ""}`;
    if (have.has(key)) continue;
    profile.items.push(seed);
    have.add(key);
    added = true;
  }
  return added;
}

export function galleryStorage() {
  const key = galleryStorageKey();
  try {
    if (window.parent && window.parent !== window) {
      const raw = window.parent.localStorage.getItem(key);
      if (raw) return window.parent.localStorage;
    }
  } catch {
    /* iframe sin acceso al padre */
  }
  return localStorage;
}

export function loadGalleryStore(storage = galleryStorage(), key = galleryStorageKey()) {
  const gwd = key === PROFILE_KEY_GWD;
  try {
    const raw = JSON.parse(storage.getItem(key) || "null");
    if (!raw || !Array.isArray(raw.profiles) || !raw.profiles.length) {
      return gwd
        ? { version: 1, activeId: "", view: defaultView(), profiles: [] }
        : emptyStore();
    }
    if (!raw.view) raw.view = defaultView();
    else raw.view = { ...defaultView(), ...raw.view, ph: resolveAdPlace(raw.view.ph), afps: normalizeViewFps(raw.view.afps), blit: normalizeViewBlit(raw.view.blit), shelf: normalizeViewShelf(raw.view.shelf), sideDlg: normalizeViewSideDlg(raw.view.sideDlg), zoom: normalizeViewZoom(raw.view.zoom), clock: normalizeViewClock(raw.view.clock), clockStyle: normalizeViewClockStyle(raw.view.clockStyle), clockTone: normalizeViewClockTone(raw.view.clockTone), clockSize: normalizeViewClockSize(raw.view.clockSize) };
    if (!raw.activeId || !raw.profiles.some((item) => item.id === raw.activeId)) {
      raw.activeId = raw.profiles[0].id;
    }
    let dirty = false;
    for (const profile of raw.profiles) {
      if (!Array.isArray(profile.items)) continue;
      const before = JSON.stringify(profile.items);
      profile.items = profile.items.map((item) => makeCombo(item));
      if (!gwd && fillMissingSeedCombos(profile)) dirty = true;
      if (orderPinnedFirst(profile.items)) dirty = true;
      if (JSON.stringify(profile.items) !== before) dirty = true;
    }
    if (dirty) saveGalleryStore(raw, storage, key);
    return raw;
  } catch {
    return gwd
      ? { version: 1, activeId: "", view: defaultView(), profiles: [] }
      : emptyStore();
  }
}

export function saveGalleryStore(store, storage = galleryStorage(), key = galleryStorageKey()) {
  storage.setItem(key, JSON.stringify(store));
  return store;
}

function readStoredStore(storage, key) {
  try {
    return JSON.parse(storage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function profilesOnlyStore(raw) {
  const profiles = Array.isArray(raw?.profiles)
    ? raw.profiles.map((profile) => ({
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
      ...(profile.file ? { file: profile.file } : {}),
      ...(profile.packed ? { packed: true } : {}),
      items: Array.isArray(profile.items) ? profile.items : [],
    }))
    : [];
  const activeId = profiles.some((profile) => profile.id === raw?.activeId)
    ? raw.activeId
    : (profiles[0]?.id || "");
  return {
    version: raw?.version || 1,
    activeId,
    view: defaultView(),
    profiles,
  };
}

function wipeStorageExcept(storage, keep) {
  const drop = [];
  for (let i = 0; i < storage.length; i += 1) {
    const key = storage.key(i);
    if (key && !keep.has(key)) drop.push(key);
  }
  for (const key of drop) storage.removeItem(key);
}

export async function resetGalleryCacheAndSettings(store, storage = galleryStorage()) {
  const keep = new Set([PROFILE_KEY, PROFILE_KEY_GWD]);
  const currentKey = galleryStorageKey();
  const current = profilesOnlyStore(store || readStoredStore(storage, currentKey));
  const otherKey = currentKey === PROFILE_KEY ? PROFILE_KEY_GWD : PROFILE_KEY;
  const otherRaw = readStoredStore(storage, otherKey);
  const bags = [storage];
  try {
    if (typeof localStorage !== "undefined" && localStorage !== storage) bags.push(localStorage);
  } catch {
    /* optional */
  }
  try {
    if (window.parent && window.parent !== window && window.parent.localStorage && !bags.includes(window.parent.localStorage)) {
      bags.push(window.parent.localStorage);
    }
  } catch {
    /* iframe sin acceso al padre */
  }
  for (const bag of bags) {
    wipeStorageExcept(bag, keep);
    bag.setItem(currentKey, JSON.stringify(current));
    if (otherRaw) bag.setItem(otherKey, JSON.stringify(profilesOnlyStore(otherRaw)));
    else bag.removeItem(otherKey);
  }
  try { sessionStorage.clear(); } catch { /* optional */ }
  try {
    if (window.parent && window.parent !== window) window.parent.sessionStorage.clear();
  } catch { /* optional */ }
  try {
    const names = await caches.keys();
    await Promise.all(names.map((name) => caches.delete(name)));
  } catch { /* optional */ }
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((reg) => reg.unregister()));
  } catch { /* optional */ }
  serveStoreOnce.live = null;
  serveStoreOnce.gwd = null;
  if (store && typeof store === "object") {
    store.version = current.version;
    store.activeId = current.activeId;
    store.view = current.view;
    store.profiles = current.profiles;
  }
  return current;
}

export function activeProfile(store) {
  return store.profiles.find((item) => item.id === store.activeId) || store.profiles[0];
}

export function createProfile(store, name) {
  const profile = {
    id: uid(),
    name: String(name || "Galería").trim() || "Galería",
    createdAt: Date.now(),
    items: seedCombos(),
  };
  store.profiles.push(profile);
  store.activeId = profile.id;
  return saveGalleryStore(store);
}

export const PROFILE_EXPORT_KIND = "babylon-ads-profile";

function slugName(name) {
  const slug = String(name || "galeria")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "galeria";
}

export function profileExportFilename(profile) {
  return `${slugName(profile?.name)}.json`;
}

export function serializeProfileExport(profile) {
  const src = profile || {};
  return {
    kind: PROFILE_EXPORT_KIND,
    version: 1,
    exportedAt: Date.now(),
    profile: {
      name: String(src.name || "Galería").trim() || "Galería",
      items: (src.items || []).map((item) => {
        const combo = makeCombo(item);
        return { ...combo, id: "" };
      }),
    },
  };
}

export function parseProfileExport(raw) {
  const data = typeof raw === "string" ? JSON.parse(raw) : raw;
  if (!data || data.kind !== PROFILE_EXPORT_KIND || !data.profile || !Array.isArray(data.profile.items)) {
    throw new Error("No es un perfil exportado.");
  }
  return data;
}

export function addProfileFromExport(store, raw, name) {
  const packet = parseProfileExport(raw);
  const src = packet.profile;
  const profile = {
    id: uid(),
    name: String(name || src.name || "Galería").trim() || "Galería",
    createdAt: Date.now(),
    items: src.items.map((item) => makeCombo({ ...item, id: "" })),
  };
  store.profiles.push(profile);
  store.activeId = profile.id;
  return saveGalleryStore(store);
}

export function packedProfileId(filename) {
  const base = String(filename || "").replace(/^.*\//, "").replace(/\.json$/i, "").replace(/[^a-z0-9_-]+/gi, "-");
  return `pack-${base || "perfil"}`;
}

export function profileFromPackedFile(raw, filename) {
  const packet = parseProfileExport(raw);
  const id = packedProfileId(filename);
  return {
    id,
    name: packet.profile.name || "Galería",
    createdAt: packet.exportedAt || Date.now(),
    file: String(filename || ""),
    packed: true,
    items: packet.profile.items.map((item, index) => makeCombo({
      ...item,
      id: item.id || `${id}-${index}`,
    })),
  };
}

const PACKED_FALLBACK = ["galeria-1.json"];
const PACKED_GWD_FALLBACK = ["galeria-gwd.json"];
const serveStoreOnce = { live: null, gwd: null };

onPlayerOriginChange(() => {
  serveStoreOnce.live = null;
  serveStoreOnce.gwd = null;
});

function useGwdPack(kind = "auto") {
  if (kind === "gwd") return true;
  if (kind === "live") return false;
  return isGwdGalleryPage();
}

function packedLocalUrl(file, gwd = false) {
  const folder = gwd ? "data-gwd" : "data";
  try {
    if (import.meta.url) return new URL(`./${folder}/${file}`, import.meta.url).href;
  } catch {
    /* IIFE: import.meta vacío */
  }
  if (typeof location !== "undefined") return new URL(`${folder}/${file}`, location.href).href;
  return `${folder}/${file}`;
}

function packedIndexUrl(gwd = false) {
  const folder = gwd ? "data-gwd" : "data";
  return playerUrl(`${folder}/profiles.json`, packedLocalUrl("profiles.json", gwd));
}

function packedFileUrl(name, gwd = false) {
  const folder = gwd ? "data-gwd" : "data";
  return playerUrl(`${folder}/${name}`, packedLocalUrl(name, gwd));
}

async function fetchJson(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}

async function listPackedFilenames(gwd = false) {
  try {
    const listed = await fetchJson(packedIndexUrl(gwd));
    if (Array.isArray(listed) && listed.length) {
      return listed.map((name) => String(name).replace(/^.*\//, "")).filter((name) => name.endsWith(".json"));
    }
  } catch {
    /* índice opcional */
  }
  return gwd ? PACKED_GWD_FALLBACK : PACKED_FALLBACK;
}

export async function loadPackedProfiles(kind = "auto") {
  const gwd = useGwdPack(kind);
  const names = await listPackedFilenames(gwd);
  const packed = [];
  for (const name of names) {
    try {
      packed.push(profileFromPackedFile(await fetchJson(packedFileUrl(name, gwd)), name));
    } catch {
      /* archivo ausente o inválido */
    }
  }
  return packed;
}

export async function loadServeStore(kind = "auto") {
  const gwd = useGwdPack(kind);
  const cacheKey = gwd ? "gwd" : "live";
  if (serveStoreOnce[cacheKey]) return serveStoreOnce[cacheKey];
  const storeKey = gwd ? PROFILE_KEY_GWD : PROFILE_KEY;
  const live = loadGalleryStore(galleryStorage(), storeKey);
  const packed = await loadPackedProfiles(gwd ? "gwd" : "live");
  const used = new Set((live.profiles || []).map((entry) => entry.id));
  const extra = packed.filter((entry) => !used.has(entry.id));
  const merged = {
    version: live.version || 1,
    activeId: live.activeId,
    view: live.view,
    profiles: [...(live.profiles || []), ...extra],
  };
  if (!merged.activeId || !merged.profiles.some((entry) => entry.id === merged.activeId)) {
    merged.activeId = merged.profiles[0]?.id || "";
  }
  serveStoreOnce[cacheKey] = merged;
  return merged;
}

export function addComboToActive(store, partial) {
  const profile = activeProfile(store);
  const combo = makeCombo(partial);
  const same = profile.items.find((item) => (
    item.play === combo.play
    && item.propAct === combo.propAct
    && item.ad === combo.ad
  ));
  if (same) {
    Object.assign(same, combo, { id: same.id, pin: same.pin });
  } else {
    profile.items.push(combo);
  }
  saveGalleryStore(store);
  return combo;
}

export function removeCombo(store, comboId) {
  const profile = activeProfile(store);
  profile.items = profile.items.filter((item) => item.id !== comboId);
  deleteComboPropFiles(comboId);
  return saveGalleryStore(store);
}

function nextCloneAlias(profile, base) {
  const used = new Set(profile.items.map((item) => comboShortTitle(item)));
  let n = 2;
  let name = `${base} ${n}`;
  while (used.has(name)) {
    n += 1;
    name = `${base} ${n}`;
  }
  return name;
}

export function setComboOff(store, comboId, off) {
  const item = activeProfile(store).items.find((entry) => entry.id === comboId);
  if (item) item.off = Boolean(off);
  return saveGalleryStore(store);
}

export function setComboAlias(store, comboId, alias) {
  const item = activeProfile(store).items.find((entry) => entry.id === comboId);
  if (item) item.alias = String(alias || "").trim();
  return saveGalleryStore(store);
}

function orderPinnedFirst(items) {
  if (!Array.isArray(items) || !items.length) return false;
  const pins = items.filter((item) => item.pin);
  if (!pins.length) return false;
  const rest = items.filter((item) => !item.pin);
  const next = pins.concat(rest);
  if (next.every((item, index) => item === items[index])) return false;
  items.splice(0, items.length, ...next);
  return true;
}

export function setComboPin(store, comboId, pin) {
  const profile = activeProfile(store);
  const at = profile.items.findIndex((entry) => entry.id === comboId);
  if (at < 0) return saveGalleryStore(store);
  const item = profile.items[at];
  item.pin = Boolean(pin);
  profile.items.splice(at, 1);
  if (item.pin) {
    profile.items.unshift(item);
  } else {
    const insert = profile.items.findIndex((entry) => !entry.pin);
    profile.items.splice(insert < 0 ? profile.items.length : insert, 0, item);
  }
  return saveGalleryStore(store);
}

export function setComboPmesh(store, comboId, pmesh) {
  const item = activeProfile(store).items.find((entry) => entry.id === comboId);
  if (item) item.pmesh = normalizePmesh(pmesh);
  return saveGalleryStore(store);
}

export async function cloneCombo(store, comboId) {
  const profile = activeProfile(store);
  const item = profile.items.find((entry) => entry.id === comboId);
  if (!item) return null;
  const copy = makeCombo({
    ...item,
    id: "",
    alias: nextCloneAlias(profile, comboShortTitle(item)),
    off: false,
    pin: false,
  });
  const unpinAt = profile.items.findIndex((entry) => !entry.pin);
  const at = item.pin
    ? (unpinAt < 0 ? profile.items.length : unpinAt)
    : profile.items.indexOf(item) + 1;
  profile.items.splice(at, 0, copy);
  saveGalleryStore(store);
  if (item.pmesh) await copyComboPropFiles(item.id, copy.id);
  return copy;
}

const PROP_FILE_DB = "babylon-ads-prop-files";
const PROP_FILE_STORE = "files";
const propFileMem = new Map();

function openPropFileDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(PROP_FILE_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(PROP_FILE_STORE)) {
        req.result.createObjectStore(PROP_FILE_STORE);
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

function filesToRecords(files) {
  return Promise.all([...files].map(async (file) => ({
    name: file.name,
    type: file.type,
    lastModified: file.lastModified,
    buffer: await file.arrayBuffer(),
  })));
}

function recordsToFiles(records) {
  if (!records?.length) return [];
  return records.map((rec) => new File([rec.buffer], rec.name, {
    type: rec.type,
    lastModified: rec.lastModified,
  }));
}

export async function saveComboPropFiles(comboId, files) {
  const records = await filesToRecords(files);
  propFileMem.set(comboId, records);
  try {
    const db = await openPropFileDb();
    await idbReq(db.transaction(PROP_FILE_STORE, "readwrite").objectStore(PROP_FILE_STORE).put(records, comboId));
    db.close();
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function loadComboPropFiles(comboId) {
  let records = propFileMem.get(comboId);
  if (!records) {
    try {
      const db = await openPropFileDb();
      records = await idbReq(db.transaction(PROP_FILE_STORE, "readonly").objectStore(PROP_FILE_STORE).get(comboId));
      db.close();
      if (records?.length) propFileMem.set(comboId, records);
    } catch {
      records = null;
    }
  }
  return recordsToFiles(records);
}

export async function copyComboPropFiles(fromId, toId) {
  const files = await loadComboPropFiles(fromId);
  if (!files.length) return { ok: true };
  return saveComboPropFiles(toId, files);
}

export async function deleteComboPropFiles(comboId) {
  propFileMem.delete(comboId);
  try {
    const db = await openPropFileDb();
    await idbReq(db.transaction(PROP_FILE_STORE, "readwrite").objectStore(PROP_FILE_STORE).delete(comboId));
    db.close();
  } catch {
    /* optional */
  }
}

export function comboPosterMarkup(item) {
  const play = playById(item.play).id;
  const pal = resolvePalette(play, item.pal);
  const uid = String(item.id || play).replace(/[^a-zA-Z0-9_-]/g, "");
  const g = (name) => `${name}-${uid}`;
  const act = play === "prop" ? propActionById(item.propAct).id : "";
  const svg = (inner) => `<svg viewBox="0 0 160 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${inner}</svg>`;

  if (play === "horizon" || play === "sundown") {
    const sunY = play === "sundown" ? 88 : 52;
    return svg(`
      <defs><linearGradient id="${g("sky")}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${pal.skyNight}"/><stop offset="1" stop-color="${pal.skyDay}"/>
      </linearGradient></defs>
      <rect width="160" height="160" fill="url(#${g("sky")})"/>
      <circle cx="80" cy="${sunY}" r="18" fill="${pal.sun}"/>
      <path d="M0 108 Q80 90 160 108 V160 H0 Z" fill="${play === "sundown" ? pal.seaDay : pal.seaNight}"/>
    `);
  }
  if (play === "storm") {
    return svg(`
      <rect width="160" height="160" fill="${pal.sky}"/>
      <path d="M0 118 H160 V160 H0 Z" fill="${pal.sea}"/>
      <path d="M80 22 L62 68 H88 L68 122 L116 60 H88 Z" fill="${pal.bolt}"/>
    `);
  }
  if (play === "aurora") {
    return svg(`
      <rect width="160" height="160" fill="${pal.sky}"/>
      <path d="M0 160 V78 Q40 40 80 70 T160 56 V160 Z" fill="${pal.bandA}" opacity=".7"/>
      <path d="M0 160 V92 Q50 52 90 82 T160 66 V160 Z" fill="${pal.bandB}" opacity=".55"/>
      <path d="M0 160 V108 Q60 68 100 96 T160 80 V160 Z" fill="${pal.bandC}" opacity=".4"/>
      <rect y="128" width="160" height="32" fill="${pal.sea}"/>
    `);
  }
  if (play === "erupt") {
    return svg(`
      <rect width="160" height="160" fill="${pal.sky}"/>
      <rect y="118" width="160" height="42" fill="${pal.ground}"/>
      <path d="M32 122 L80 48 L128 122 Z" fill="${pal.cone}"/>
      <path d="M66 48 L80 22 L94 48 L80 58 Z" fill="${pal.lava}"/>
      <circle cx="70" cy="32" r="4" fill="${pal.fire}"/>
      <circle cx="92" cy="26" r="3" fill="${pal.fire}"/>
    `);
  }
  if (play === "migrate") {
    return svg(`
      <defs><linearGradient id="${g("sky")}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${pal.skyTop}"/><stop offset=".55" stop-color="${pal.skyMid}"/><stop offset="1" stop-color="${pal.skyHorizon}"/>
      </linearGradient></defs>
      <rect width="160" height="160" fill="url(#${g("sky")})"/>
      <rect y="126" width="160" height="34" fill="${pal.earth}"/>
      <g fill="none" stroke="${pal.birds}" stroke-width="1.6" stroke-linecap="round">
        <path d="M48 48 l8 4 8-6"/><path d="M70 38 l7 4 8-5"/><path d="M90 46 l8 4 8-6"/>
        <path d="M62 62 l7 3 7-5"/><path d="M82 56 l7 3 7-5"/>
      </g>
    `);
  }
  if (play === "breaker") {
    return svg(`
      <rect width="160" height="160" fill="${pal.sky}"/>
      <rect y="128" width="160" height="32" fill="${pal.sand}"/>
      <path d="M0 128 Q40 104 70 114 T130 78 T160 108 V128 Z" fill="${pal.sea}"/>
      <path d="M70 114 Q100 68 138 76 Q118 94 96 104 Z" fill="${pal.wave}"/>
      <path d="M108 76 Q128 66 146 80" fill="none" stroke="${pal.foam}" stroke-width="3"/>
    `);
  }
  if (play === "calve") {
    return svg(`
      <rect width="160" height="160" fill="${pal.sky}"/>
      <rect y="102" width="160" height="58" fill="${pal.water}"/>
      <path d="M18 102 L48 42 L78 102 Z" fill="${pal.ice}"/>
      <path d="M48 42 L78 102 L62 102 Z" fill="${pal.iceShade}"/>
      <path d="M92 128 L108 92 L128 128 Z" fill="${pal.under}" opacity=".85"/>
    `);
  }
  if (play === "prop") {
    const obj = pal.object;
    const floor = pal.floor;
    const fog = pal.fog;
    let figure = `<rect x="64" y="58" width="32" height="32" rx="3" fill="${obj}"/>`;
    if (act === "ball") figure = `<circle cx="80" cy="80" r="18" fill="${pal.ball}"/>`;
    if (act === "star") figure = `<path d="M80 40 L88 68 H116 L94 84 L102 112 L80 96 L58 112 L66 84 L44 68 H72 Z" fill="${pal.star}"/>`;
    if (act === "torch") figure = `${figure}<path d="M80 92 L28 150 H132 Z" fill="${pal.beam}" opacity=".45"/>`;
    if (act === "torch-front") figure = `${figure}<path d="M80 90 L52 128 H108 Z" fill="${pal.beam}" opacity=".5"/>`;
    if (act === "turn" && normalizePropFloor(item.pfloor) === "1") {
      figure = `<rect x="54" y="118" width="52" height="8" rx="2" fill="${pal.stand}"/>${figure}`;
    }
    if (act === "space") figure = `<rect x="64" y="46" width="32" height="32" rx="3" fill="${obj}" transform="rotate(-18 80 62)"/>`;
    const ground = normalizePropFloor(item.pfloor) === "1"
      ? `<ellipse cx="80" cy="130" rx="40" ry="7" fill="${floor}" opacity=".28"/>`
      : "";
    return svg(`
      <rect width="160" height="160" fill="${fog}"/>
      ${ground}
      ${figure}
    `);
  }
  return svg(`
    <defs><linearGradient id="${g("sky")}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${pal.skyTop}"/><stop offset=".45" stop-color="${pal.skyMid}"/>
      <stop offset=".75" stop-color="${pal.skyHorizon}"/><stop offset="1" stop-color="${pal.skyDeep}"/>
    </linearGradient></defs>
    <rect width="160" height="160" fill="url(#${g("sky")})"/>
    <ellipse cx="80" cy="142" rx="92" ry="32" fill="${pal.water}"/>
    <circle cx="80" cy="52" r="9" fill="${pal.sun}"/>
    ${play === "pre-enter" ? `<rect x="68" y="28" width="24" height="6" rx="2" fill="${pal.sun}" opacity=".5"/>` : ""}
  `);
}

export function comboToLabHref(item, adId) {
  const params = new URLSearchParams();
  params.set("play", playById(item.play).id);
  params.set("ad", formatById(adId || item.ad).id);
  params.set("in", item.in || "none");
  if (handoffById(item.hand).id !== "none") params.set("hand", handoffById(item.hand).id);
  params.set("xp", "inline");
  if (playById(item.play).id === "prop") {
    params.set("pact", propActionById(item.propAct).id);
    params.set("pcam", normalizePropCam(item.pcam));
    if (normalizePropCamH(item.pch) !== "0") params.set("pch", normalizePropCamH(item.pch));
    if (normalizePropCamV(item.pcv) !== "0") params.set("pcv", normalizePropCamV(item.pcv));
    if (normalizePropCamMode(item.pcm) === "pan") params.set("pcm", "pan");
    if (normalizePropCamPan(item.ppx) !== "0") params.set("ppx", normalizePropCamPan(item.ppx));
    if (normalizePropCamPan(item.ppy) !== "0") params.set("ppy", normalizePropCamPan(item.ppy));
    params.set("psx", item.psx || "0.72");
    params.set("psy", item.psy || "0.72");
    params.set("psz", item.psz || "0.72");
    params.set("plight", propAimLightById(item.plight).id);
    params.set("plint", normalizePropLint(item.plint));
    if (normalizePropFloor(item.pfloor) === "0") params.set("pfloor", "0");
    if (normalizePropFlat(item.pflat) === "1") params.set("pflat", "1");
    if (normalizePropCog(item.pcog) === "0") params.set("pcog", "0");
    params.set("plcol", normalizePropLcol(item.plcol));
    params.set("pldist", normalizePropLdist(item.pldist));
    params.set("plpos", propAimPlaceById(item.plpos).id);
    params.set("plhrot", normalizePropLhrot(item.plhrot));
    params.set("plvrot", normalizePropLvrot(item.plvrot));
    params.set("prh", normalizePropSpin(item.prh));
    params.set("prv", normalizePropSpin(item.prv));
  }
  const packed = serializePlayColorState({ [playPaletteKey(item.play)]: item.pal || {} });
  if (packed) params.set("pal", packed);
  const packedPh = serializeAdPlace(item.ph);
  if (packedPh && packedPh !== "cream") params.set("ph", packedPh);
  return `lab.html?${params.toString()}`;
}
