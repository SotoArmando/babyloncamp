import { adImageSrc, applyHandoffSettings, formatById, handoffRuntimeMs } from "../ad-catalog.js?v=cam23";
import { gwdLightFromCombo, gwdPlayMarkup, gwdPreviewSrc, loadGwdServeOrigin, releaseGwdPreviewUrl } from "./light.js?v=gwd39";
import { propActionMs } from "../prop-climax.js";
import { gwdSceneBodyMs } from "./gaps/scene.js";

const NOTE = " (no hay soporte aun)";
const REVEAL_MS = 780;

loadGwdServeOrigin();

const state = {
  host: null,
  frame: null,
  item: null,
  extras: {},
  format: null,
  blob: "",
};

export function ensureModelViewer() {
  return Promise.resolve();
}

export function isGwdGallery() {
  const pathname = String(location.pathname || "");
  const file = (pathname.split("/").pop() || "").replace(/\.html$/i, "");
  const hash = String(location.hash || "");
  return document.body.dataset.visor === "gwd"
    || file === "gallery-gwd"
    || pathname.includes("/gwd/")
    || new URLSearchParams(location.search).get("visor") === "gwd"
    || hash.includes("visor=gwd");
}

export function gwdPlayDurationMs(item) {
  if (!item) return REVEAL_MS;
  const hand = handoffRuntimeMs(item.hand, { ...item, play: item.play });
  const body = item.play === "prop" ? propActionMs(item.propAct) : gwdSceneBodyMs(item.play);
  return body + REVEAL_MS + hand;
}

export function disposeGwdPlay(host) {
  if (state.blob) releaseGwdPreviewUrl(state.blob);
  state.blob = "";
  state.frame = null;
  state.item = null;
  state.host = null;
  state.extras = {};
  state.format = null;
  host?.replaceChildren();
}

export function applyGwdViewerLive(item) {
  if (item) state.item = item;
  const win = state.frame?.contentWindow;
  if (!win || !item) return;
  try {
    win.postMessage({ type: "gwd-live", item }, location.origin || "*");
  } catch { /* iframe aún no lista */ }
}

export function pauseGwdPlay(on) {
  const paused = Boolean(on);
  const box = state.host?.querySelector(".ad-container");
  box?.classList.toggle("is-paused", paused);
  if (box) box.dataset.gwdPaused = paused ? "1" : "0";
  const win = state.frame?.contentWindow;
  if (!win) return paused;
  try {
    win.postMessage({ type: paused ? "gwd-pause" : "gwd-resume" }, location.origin || "*");
  } catch { /* iframe aún no lista */ }
  return paused;
}

export async function rewindGwdPlay() {
  if (!state.host || !state.item) return false;
  await mountGwdPlay(state.host, state.item, state.extras, state.format || formatById(state.item.ad));
  return true;
}

export async function mountGwdPlay(host, item, extras = {}, format = formatById(item?.ad)) {
  if (!host || !item) return null;
  const spec = gwdLightFromCombo(item);
  host.dataset.gwdWait = "1";
  if (!spec.ok) {
    disposeGwdPlay(host);
    host.innerHTML = gwdPlayMarkup(item, spec, {
      extras,
      imgHref: spec.img ? adImageSrc(spec.img) : "",
    });
    applyHandoffSettings(host.querySelector(".ad-container"), extras);
    host.dataset.gwdWait = "0";
    return { box: host.querySelector(".ad-container"), view: null, frame: null };
  }
  let src = "";
  try {
    src = await gwdPreviewSrc(item, spec, extras.profileId || "");
  } catch {
    src = "";
  }
  const oldBlob = state.blob;
  state.host = host;
  state.item = item;
  state.extras = extras;
  state.format = format;
  state.blob = src.startsWith("blob:") ? src : "";
  const frame = document.createElement("iframe");
  frame.className = "gwd-play-frame";
  frame.title = item.alias || "GWD";
  frame.setAttribute("scrolling", "no");
  frame.setAttribute("allowfullscreen", "");
  frame.width = String(format.w);
  frame.height = String(format.h);
  frame.style.cssText = `border:0;display:block;width:${format.w}px;height:${format.h}px;max-width:100%;background:transparent`;
  host.replaceChildren(frame);
  state.frame = frame;
  frame.src = src;
  host.dataset.gwdWait = "0";
  if (oldBlob && oldBlob !== src) releaseGwdPreviewUrl(oldBlob);
  return { box: null, view: null, frame };
}

function mark(node) {
  if (!node || node.dataset.gwdNs === "1") return;
  node.dataset.gwdNs = "1";
  const text = [...node.childNodes].find((part) => part.nodeType === 3 && part.textContent.trim());
  if (text) {
    text.textContent = `${text.textContent.replace(/\s+$/, "")}${NOTE} `;
    return;
  }
  if (!node.childElementCount) {
    node.textContent = `${String(node.textContent || "").trim()}${NOTE}`;
    return;
  }
  node.append(NOTE);
}

function markSel(root, selector) {
  mark(root.querySelector(selector));
}

export function markGwdUnsupported(root = document) {
  markSel(root, "#sel-clock + span, label:has(#sel-clock) > span");
  root.querySelectorAll(".clock-look-label").forEach(mark);
  mark(root.querySelector("#sel-clock-size")?.closest("label")?.querySelector("span"));
  mark(root.querySelector("#sel-blit")?.closest(".nav-field")?.querySelector(":scope > span"));
  mark(root.querySelector("#sel-afps")?.closest(".nav-field")?.querySelector(":scope > span"));
  mark(root.querySelector("#asset-pick-clear"));
}

export function markGwdCats(nav) {
  if (!nav) return;
}
