import { adMarkup, formatById, handoffById } from "./ad-catalog.js?v=cam23";
import { loadGalleryStore, loadServeStore, activeProfile, comboShortTitle, makeCombo } from "./ad-profile.js?v=cam26";
import { serializeStudioState } from "./studio-lights.js";
import { bootContainers, comboPropTag, disposeAds, prepareComboMesh } from "./ad-player.js?v=prop50";
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

export function comboPlayExtras(item) {
  if (!item) return {};
  return {
    pal: item.pal,
    ph: item.ph,
    propAct: item.propAct,
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

export async function mountPlay(host, { profileId, playId, slotId, origin } = {}) {
  if (!host) return null;
  if (origin != null) setPlayerOrigin(origin);
  const id = slotId || `ad-${playId}`;
  const item = await resolvePlayCombo(playId, profileId);
  if (!item) return null;
  const propTag = await prepareComboMesh(item);
  const format = formatById(item.ad);
  host.style.setProperty("--ad-w", `${format.w}px`);
  host.style.setProperty("--ad-h", `${format.h}px`);
  host.innerHTML = adMarkup(format, id, item.in || "none", item.play, comboPlayExtras(item));
  host.querySelector(".ad-slot")?.classList.add("is-in");
  const box = host.querySelector(".ad-container");
  if (box && (propTag || comboPropTag(item))) box.dataset.propTag = propTag || comboPropTag(item);
  await bootContainers(host);
  return { item, slotId: id };
}

export function unmountPlay(slotId) {
  disposeAds(slotId);
}

export { formatById };
