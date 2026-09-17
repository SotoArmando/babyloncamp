import { adImageSrc, applyHandoffSettings, formatById, handoffRuntimeMs } from "./ad-catalog.js?v=cam23";
import { gwdLightFromCombo, gwdPlayMarkup, gwdPreviewSrc, loadGwdServeOrigin } from "./gwd-light.js";
import { propActionMs } from "./prop-climax.js";

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
  const file = (location.pathname.split("/").pop() || "").replace(/\.html$/i, "");
  const hash = String(location.hash || "");
  return document.body.dataset.visor === "gwd"
    || file === "gallery-gwd"
    || new URLSearchParams(location.search).get("visor") === "gwd"
    || hash.includes("visor=gwd");
}

export function gwdPlayDurationMs(item) {
  if (!item) return REVEAL_MS;
  const hand = handoffRuntimeMs(item.hand, { ...item, play: item.play });
  const body = item.play === "prop" ? propActionMs(item.propAct) : 2400;
  return body + REVEAL_MS + hand;
}

export function disposeGwdPlay(host) {
  if (state.blob) URL.revokeObjectURL(state.blob);
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
}

export async function rewindGwdPlay() {
  if (!state.host || !state.item) return false;
  await mountGwdPlay(state.host, state.item, state.extras, state.format || formatById(state.item.ad));
  return true;
}

export async function mountGwdPlay(host, item, extras = {}, format = formatById(item?.ad)) {
  disposeGwdPlay(host);
  if (!host || !item) return null;
  const spec = gwdLightFromCombo(item);
  state.host = host;
  state.item = item;
  state.extras = extras;
  state.format = format;
  if (!spec.ok) {
    host.innerHTML = gwdPlayMarkup(item, spec, {
      extras,
      imgHref: spec.img ? adImageSrc(spec.img) : "",
    });
    applyHandoffSettings(host.querySelector(".ad-container"), extras);
    return { box: host.querySelector(".ad-container"), view: null, frame: null };
  }
  const src = await gwdPreviewSrc(item, spec, extras.profileId || "");
  if (src.startsWith("blob:")) state.blob = src;
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
  markSel(root, "#pal-panel-title");
  mark(root.querySelector("#asset-pick-clear"));
}

export function markGwdCats(nav) {
  if (!nav) return;
  nav.querySelectorAll("[data-cat]").forEach((btn) => {
    if (btn.dataset.cat === "all" || btn.dataset.cat === "objeto") return;
    mark(btn);
  });
}
