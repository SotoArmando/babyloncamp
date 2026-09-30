import { playById } from "./ad-catalog.js";
import { bootPlay2D, isCanvas2DPlay } from "./play-2d.js";

const MAX_CANVAS = 8;

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function loopMarkup(posterHtml, item) {
  const play = playById(item.play).id;
  const act = play === "prop" ? String(item.propAct || "drop") : "";
  const pal = item.pal && typeof item.pal === "object" ? JSON.stringify(item.pal) : "";
  return `<div class="loop" data-play="${esc(play)}" data-act="${esc(act)}" data-pal="${esc(pal)}">${posterHtml}<span class="loop-drop" aria-hidden="true"></span><span class="loop-ring" aria-hidden="true"></span></div>`;
}

function stopLive(el) {
  const stop = el._homeStop;
  if (typeof stop === "function") stop();
  el._homeStop = null;
  el.querySelector(".loop-2d")?.remove();
  el.querySelector("canvas.loop-film")?.remove();
  el.classList.remove("is-live", "is-canvas");
}

function startCss(el) {
  el.classList.add("is-live");
}

function startCanvas(el) {
  const play = el.dataset.play;
  if (!isCanvas2DPlay(play)) {
    startCss(el);
    return false;
  }
  const host = document.createElement("div");
  host.className = "loop-2d";
  host.dataset.play = play;
  host.dataset.pal = el.dataset.pal || "";
  host.dataset.loopPassive = "1";
  const canvas = document.createElement("canvas");
  canvas.className = "loop-film";
  canvas.setAttribute("aria-hidden", "true");
  host.append(canvas);
  el.append(host);
  el.classList.add("is-live", "is-canvas");
  const dpr = Math.min(1.25, window.devicePixelRatio || 1);
  const stop = bootPlay2D(host, { canvas, loop: true, dpr });
  if (!stop) {
    host.remove();
    el.classList.remove("is-canvas");
    startCss(el);
    return false;
  }
  el._homeStop = () => {
    if (typeof stop === "function") stop();
    host.remove();
  };
  return true;
}

function visibleEnough(el) {
  const box = el.getBoundingClientRect();
  if (box.width < 8 || box.height < 8) return false;
  const vh = window.innerHeight || 1;
  const visible = Math.min(box.bottom, vh) - Math.max(box.top, 0);
  return visible / box.height >= 0.22;
}

function modalOpenEl() {
  const ids = ["previewModal", "modal"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && !el.hidden) return el;
  }
  return null;
}

function homeState() {
  return document._homeLoopState || null;
}

export function mountHomeLoops(root = document) {
  const nodes = [...root.querySelectorAll(".loop")].filter((el) => !el.closest("#createShell"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prev = homeState();
  if (prev) {
    prev.io?.disconnect();
    prev.nodes.forEach(stopLive);
    window.removeEventListener("scroll", prev.sync, true);
    window.removeEventListener("resize", prev.sync);
    document._homeLoopState = null;
  }
  if (reduced || !nodes.length) return;

  const state = {
    io: null,
    nodes,
    canvases: 0,
    sync: () => {},
  };

  const stealCanvas = (keep) => {
    const victim = state.nodes.find((el) => el !== keep && el.classList.contains("is-canvas"));
    if (!victim) return false;
    stopLive(victim);
    state.canvases = Math.max(0, state.canvases - 1);
    startCss(victim);
    return true;
  };

  const setOn = (el, on) => {
    const live = el.classList.contains("is-live");
    if (on && !live) {
      const modal = modalOpenEl();
      const prefer = modal && modal.contains(el);
      if (prefer && state.canvases >= MAX_CANVAS) stealCanvas(el);
      if (state.canvases < MAX_CANVAS && startCanvas(el)) state.canvases += 1;
      else startCss(el);
    } else if (!on && live) {
      if (el.classList.contains("is-canvas")) state.canvases = Math.max(0, state.canvases - 1);
      stopLive(el);
    }
  };

  const sync = () => {
    const modal = modalOpenEl();
    state.nodes.forEach((el) => {
      if (!el.isConnected) return;
      const allowed = !modal || modal.contains(el);
      setOn(el, allowed && visibleEnough(el));
    });
  };

  const io = new IntersectionObserver(() => sync(), {
    threshold: [0, 0.22, 0.5, 1],
    rootMargin: "80px 0px",
  });
  nodes.forEach((el) => io.observe(el));
  window.addEventListener("scroll", sync, { capture: true, passive: true });
  window.addEventListener("resize", sync, { passive: true });
  state.io = io;
  state.sync = sync;
  document._homeLoopState = state;
  requestAnimationFrame(() => requestAnimationFrame(sync));
  setTimeout(sync, 40);
  setTimeout(sync, 160);
}

export function watchHomeLoop(el) {
  const state = homeState();
  if (!el || !state) return;
  if (!state.nodes.includes(el)) state.nodes.push(el);
  state.io?.observe(el);
  requestAnimationFrame(() => requestAnimationFrame(state.sync));
  setTimeout(state.sync, 40);
}

export function unwatchHomeLoop(el) {
  const state = homeState();
  if (!el || !state) return;
  state.io?.unobserve(el);
  if (el.classList.contains("is-canvas")) state.canvases = Math.max(0, state.canvases - 1);
  stopLive(el);
  state.nodes = state.nodes.filter((node) => node !== el);
  state.sync();
}
