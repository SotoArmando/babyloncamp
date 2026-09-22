import { adMarkup, adPlaceFromPlay, formatById, handoffById, handoffRuntimeMs, playById, propTrailMs, resolveAdPlace } from "./ad-catalog.js?v=cam50";
import { loadGalleryStore, loadServeStore, activeProfile, comboShortTitle, makeCombo } from "./ad-profile.js?v=cam26";
import { serializeStudioState } from "./studio-lights.js";
import { bootContainers, comboPropTag, currentPropTag, disposeAds, grabAdStill, playDurationMs, prepareComboMesh, preloadEngine, restorePropTag, setPropModelFiles, startAd, applyAnimCost, CONFIG } from "./ad-player.js?v=prop108";
import { setPlayerOrigin, getPlayerOrigin } from "./player-origin.js";

export { setPlayerOrigin, getPlayerOrigin };

export function profileById(id, store = loadGalleryStore()) {
  const key = String(id || "");
  if (key) return store.profiles.find((entry) => entry.id === key) || null;
  return activeProfile(store);
}

export function listProfiles(store = loadGalleryStore()) {
  return (store.profiles || []).map((entry) => ({
    id: entry.id,
    name: entry.packed ? `${entry.name} · archivo` : (entry.name || "Galería"),
    packed: Boolean(entry.packed),
  }));
}

export function listGalleryPlays(store = loadGalleryStore(), profileId) {
  const profile = profileById(profileId, store);
  return (profile?.items || []).filter((item) => !item.off).map((item) => makeCombo(item));
}

export const PLAY_ASK = "babylon-play-request";
export const PLAY_GIVE = "babylon-play-combo";
export const PLAY_VIEW = "babylon-play-view";

export function postPlayView(win, on) {
  win?.postMessage({ type: PLAY_VIEW, on: Boolean(on) }, "*");
}

export function watchPlayFrame(frame, { rootMargin = "80px" } = {}) {
  let inView = true;
  const send = () => postPlayView(frame.contentWindow, !document.hidden && inView);
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) inView = entry.isIntersecting;
    send();
  }, { threshold: 0, rootMargin });
  io.observe(frame);
  document.addEventListener("visibilitychange", send);
  return { send, disconnect: () => io.disconnect() };
}

export function comboById(id, store = loadGalleryStore(), profileId) {
  const key = String(id || "");
  if (!key) return null;
  const scoped = profileById(profileId, store);
  const hit = (scoped?.items || []).find((entry) => entry.id === key);
  if (hit) return makeCombo(hit);
  for (const profile of store.profiles || []) {
    const item = (profile.items || []).find((entry) => entry.id === key);
    if (item) return makeCombo(item);
  }
  return null;
}

export function askParentCombo(id, profileId, ms = 2000) {
  if (!window.parent || window.parent === window) return Promise.resolve(null);
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", onMsg);
      resolve(null);
    }, ms);
    function onMsg(ev) {
      if (ev.data?.type !== PLAY_GIVE) return;
      clearTimeout(timer);
      window.removeEventListener("message", onMsg);
      resolve(ev.data.item ? makeCombo(ev.data.item) : null);
    }
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: PLAY_ASK, id, profile: profileId || "" }, "*");
  });
}

export async function resolvePlayCombo(id, profileId) {
  const incoming = askParentCombo(id, profileId, 2500);
  try {
    const local = comboById(id, await loadServeStore(), profileId);
    if (local) return local;
  } catch {
    /* el archivo se pide al padre */
  }
  return incoming;
}

export function replyPlayCombo(lookup) {
  window.addEventListener("message", (ev) => {
    if (ev.data?.type !== PLAY_ASK) return;
    const item = typeof lookup === "function"
      ? lookup(ev.data.id, ev.data.profile)
      : (lookup || []).find((entry) => entry.id === ev.data.id) || null;
    ev.source?.postMessage({ type: PLAY_GIVE, item }, "*");
  });
}

/** Mismo recorte/colores que Galería GWD (`livePlace` + extras del play). */
export function livePlaceFrom(item, phRaw = item?.ph) {
  const ph = resolveAdPlace(phRaw);
  if (ph.style !== "play") return ph;
  return {
    ...adPlaceFromPlay(item?.play || "climax", item?.pal),
    img: ph.img,
    fit: ph.fit,
    fx: ph.fx,
    fy: ph.fy,
    fz: ph.fz,
    fm: ph.fm,
  };
}

export function comboPlayExtras(item, phRaw) {
  if (!item) return {};
  return {
    pal: item.pal,
    ph: livePlaceFrom(item, phRaw !== undefined ? phRaw : item.ph),
    propAct: item.propAct,
    propTrail: item.ptrail,
    propTrail2d: item.p2d,
    propTrail2dCol: item.p2dcol,
    propTrail2dCon: item.p2dcon,
    propTrailGlow: item.pglo,
    propTrailTail: item.ptl,
    propTrailMark: item.pmk,
    propTrailSpread: item.psp,
    propTrailSpd: item.pvel,
    propTrailPop: item.ppop,
    propTrailJoin: item.pjoin,
    propTrailIn: item.pin,
    propCam: item.pcam,
    propCamH: item.pch,
    propCamV: item.pcv,
    propCamMode: item.pcm,
    propCamPx: item.ppx,
    propCamPy: item.ppy,
    propSx: item.psx,
    propSy: item.psy,
    propSz: item.psz,
    propLight: item.plight,
    propLint: item.plint,
    propFloor: item.pfloor,
    propFlat: item.pflat,
    propCog: item.pcog,
    propLcol: item.plcol,
    propLdist: item.pldist,
    propLpos: item.plpos,
    propLhrot: item.plhrot,
    propLvrot: item.plvrot,
    propRhrot: item.prh,
    propRvrot: item.prv,
    studioLights: serializeStudioState(item.studio),
    handoff: handoffById(item.hand).id,
    hms: item.hms,
    hnb: item.hnb,
    hst: item.hst,
    hin: item.hin,
    hhd: item.hhd,
    hbt: item.hbt,
    htm: item.htm,
    htxt: item.htxt,
    hempty: item.hempty,
  };
}

export function comboPlayLabel(item) {
  if (!item) return "";
  const format = formatById(item.ad);
  return `${comboShortTitle(item)} · ${format.w}×${format.h}`;
}

export function playRouteParams() {
  const query = new URLSearchParams(location.search);
  const hash = new URLSearchParams(String(location.hash || "").replace(/^#/, ""));
  return {
    id: query.get("id") || hash.get("id") || "",
    profile: query.get("p") || hash.get("p") || "",
  };
}

export function playComboId() {
  return playRouteParams().id;
}

export function playerHref(id, profileId) {
  const parts = [];
  if (profileId) parts.push(`p=${encodeURIComponent(profileId)}`);
  parts.push(`id=${encodeURIComponent(id)}`);
  return `player.html#${parts.join("&")}`;
}

export function profileName(profileId, store = loadGalleryStore()) {
  return profileById(profileId, store)?.name || "Galería";
}

async function loadMeshFromUrl(url, name = "prop.glb") {
  const res = await fetch(url);
  if (!res.ok) return "";
  const file = new File([await res.arrayBuffer()], name, { type: "model/gltf-binary" });
  setPropModelFiles([file]);
  return "url";
}

export async function mountPlay(host, { profileId, playId, slotId, origin, item: given, meshUrl, watch = true } = {}) {
  if (!host) return null;
  if (origin != null) setPlayerOrigin(origin);
  const id = slotId || `ad-${playId || given?.id || "ad"}`;
  const item = given ? makeCombo(given) : await resolvePlayCombo(playId, profileId);
  if (!item) return null;
  let propTag = "";
  if (meshUrl) {
    const loaded = await loadMeshFromUrl(meshUrl, item?.pmesh?.name || "prop.glb");
    if (loaded) propTag = comboPropTag(item) || "url";
  }
  if (!propTag) propTag = await prepareComboMesh(item);
  const format = formatById(item.ad);
  host.style.setProperty("--ad-w", `${format.w}px`);
  host.style.setProperty("--ad-h", `${format.h}px`);
  host.innerHTML = adMarkup(format, id, item.in || "none", item.play, comboPlayExtras(item));
  host.querySelector(".ad-slot")?.classList.add("is-in");
  const box = host.querySelector(".ad-container");
  if (box && (propTag || comboPropTag(item))) box.dataset.propTag = propTag || comboPropTag(item);
  await bootContainers(host, { watch });
  return { item, slotId: id };
}

export function unmountPlay(slotId) {
  disposeAds(slotId);
}

const STILL_SIDE = 520;

function stillBakeHost() {
  let host = document.getElementById("browse-still-host");
  if (host) return host;
  host = document.createElement("div");
  host.id = "browse-still-host";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:0;top:0;width:520px;height:520px;opacity:0.02;z-index:-1;overflow:hidden;pointer-events:none;";
  document.body.appendChild(host);
  return host;
}

function stillSampleMs(item) {
  const play = playById(item.play).id;
  const extras = comboPlayExtras(item);
  const total = playDurationMs(play, item.propAct, item.hand, extras);
  const reveal = 780 + handoffRuntimeMs(item.hand, { play, ...extras });
  const journey = Math.max(480, total - reveal);
  if (play === "prop") {
    const trail = propTrailMs(extras.propTrail, extras.propTrailSpd);
    const action = Math.max(400, journey - trail);
    const drive = String(item.propAct || extras.propAct || "").startsWith("drive");
    const marks = drive ? [0.22, 0.38, 0.52, 0.7, 0.88, 0.98] : [0.52, 0.68, 0.82, 0.94];
    return marks.map((p) => Math.round(trail + action * p));
  }
  const marks = play === "pre-enter"
    ? [0.28, 0.4, 0.52, 0.64]
    : [0.34, 0.44, 0.54, 0.66];
  return marks.map((p) => Math.round(journey * p));
}

export function normalizeBrowseBlit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0.8;
  return Math.round(Math.min(1.5, Math.max(0.1, n)) * 20) / 20;
}

export function applyBrowseBlit(value) {
  const blit = normalizeBrowseBlit(value);
  applyAnimCost({ blitDpr: blit });
  return blit;
}

export async function captureComboStill(item, { scale } = {}) {
  if (!item) return "";
  const format = formatById(item.ad);
  const host = stillBakeHost();
  const prevTag = currentPropTag();
  const id = "browse-still";
  const cap = Number.isFinite(Number(scale)) ? Number(scale) : CONFIG.blitDpr;
  const side = `${STILL_SIDE}px`;
  host.style.width = side;
  host.style.height = side;
  host.style.setProperty("--ad-w", side);
  host.style.setProperty("--ad-h", side);
  try {
    await preloadEngine();
    const propTag = await prepareComboMesh(item, { warmup: false, activate: true });
    if (playById(item.play).id === "prop" && item.pmesh && !propTag) {
      throw new Error("No se pudo cargar el modelo 3D.");
    }
    host.innerHTML = adMarkup({ ...format, w: STILL_SIDE, h: STILL_SIDE }, id, "none", item.play, comboPlayExtras(item));
    const slot = host.querySelector(".ad-slot");
    if (slot) slot.classList.add("is-in");
    const box = host.querySelector(".ad-container");
    if (box && (propTag || comboPropTag(item))) box.dataset.propTag = propTag || comboPropTag(item);
    await bootContainers(host, { watch: false });
    if (box) await startAd(box);
    await new Promise((resolve) => setTimeout(resolve, 80));
    return await grabAdStill({ root: host, atMs: stillSampleMs(item), scale: cap, overlays: false, frameMesh: true });
  } finally {
    disposeAds(id);
    host.innerHTML = "";
    restorePropTag(prevTag);
  }
}

export { formatById };
