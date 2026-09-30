import {
  FORMATS,
  HANDOFF_TRANSITIONS,
  IN_TRANSITIONS,
  adPlaceFromPlay,
  adPlaceInnerMarkup,
  adPlaceVars,
  formatById,
  handoffById,
  playById,
  propActionById,
  resolveAdPlace,
  resolvePalette,
  transitionById,
} from "./ad-catalog.js?v=cam50";
import {
  activeProfile,
  comboPosterMarkup,
  comboShortTitle,
  loadGalleryStore,
  makeCombo,
  saveGalleryStore,
  seedCombos,
} from "./ad-profile.js?v=script3";
import { STUDIO_PRESETS, normalizeStudioState } from "./studio-lights.js";
import { loopMarkup, mountHomeLoops } from "./home-loop.js?v=home5";
import { mountPlay, unmountPlay } from "./play-route.js?v=still17";
import { captureComboStill, applyBrowseBlit, normalizeBrowseBlit } from "./browse-still.js?v=still2";
import { loadStoredStill, saveStoredStill } from "./browse-still-store.js?v=store1";
import { mountPinOrbit, unmountPinOrbit } from "./browse-orbit.js?v=orbit5";
import { INDUSTRIES, industriesForItem, industryById, industryShowMap, itemsForIndustry } from "./industry-catalog.js?v=ind5";

const FORMAT_ES = {
  billboard: { label: "Franja", size: "970 × 250" },
  leader: { label: "Leaderboard", size: "728 × 90" },
  medium: { label: "Clásico", size: "300 × 250" },
  large: { label: "Grande", size: "336 × 280" },
  mobile: { label: "Móvil", size: "320 × 50" },
  sky: { label: "Columna", size: "160 × 600" },
  half: { label: "Vertical", size: "300 × 600" },
  nexus: { label: "Nexus+", size: "300 × 250" },
};


function esc(value) {
  return String(value ?? "").replace(/[&<>"]/g, (ch) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]
  ));
}

function norm(value) {
  let text = String(value ?? "").toLowerCase();
  try { text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch { /* skip */ }
  return text;
}

function hslOf(h, s, l) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

INDUSTRIES.forEach((industry, index) => {
  document.documentElement.style.setProperty(`--pal-${index}`, hslOf(industry.hue, industry.sat, industry.light));
});

function hslaOf(h, s, l, a) {
  return `hsl(${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}% / ${a})`;
}

function catalogItems() {
  try {
    const store = loadGalleryStore();
    const items = activeProfile(store)?.items?.filter((item) => !item.off);
    if (items?.length) return items.map((item) => makeCombo(item));
  } catch { /* seed */ }
  return seedCombos().map((item) => makeCombo(item));
}

function casoKey(item) {
  return item.play === "prop" ? `prop:${item.propAct}` : item.play;
}

function casoLabel(item) {
  if (item.play === "prop") return propActionById(item.propAct).label;
  return playById(item.play).label.replace(/^Clímax · /, "");
}

function formatMeta(id) {
  const format = formatById(id);
  return { ...format, ...(FORMAT_ES[format.id] || { label: format.label, size: `${format.w} × ${format.h}` }) };
}

function itemKey(item) {
  return item?.play === "prop" ? `prop:${item.propAct || "drop"}` : String(item?.play || "");
}

function showMap() {
  try {
    return industryShowMap(activeProfile(loadGalleryStore()));
  } catch {
    return null;
  }
}

function industriesOf(item) {
  return industriesForItem(item, ITEMS, showMap());
}

function industryOf(item) {
  if (browse.ind) {
    const current = industriesOf(item).find((industry) => industry.id === browse.ind);
    if (current) return current;
  }
  return industriesOf(item)[0] || null;
}

function itemsOfIndustry(industry) {
  return itemsForIndustry(ITEMS, industry, showMap());
}

function loopHtml(item) {
  return loopMarkup(comboPosterMarkup(item), item);
}

function objectBg(item) {
  if (item.play === "prop") {
    if (String(item.pflat) === "1") {
      const pal = resolvePalette("prop", item.pal);
      return pal.fog || "#121315";
    }
    const studio = normalizeStudioState(item.studio);
    const rgb = STUDIO_PRESETS[studio.preset]?.bg;
    if (rgb) {
      return `rgb(${Math.round(rgb[0] * 255)} ${Math.round(rgb[1] * 255)} ${Math.round(rgb[2] * 255)})`;
    }
    return studio.worldCol || "#121315";
  }
  const pal = resolvePalette(item.play, item.pal);
  return pal.sky || pal.skyNight || pal.skyTop || pal.fog || "#111318";
}

function pinPlace(item) {
  const ph = resolveAdPlace(item.ph);
  if (ph.style !== "play") return ph;
  return {
    ...adPlaceFromPlay(item.play || "climax", item.pal),
    img: ph.img,
    fit: ph.fit,
    fx: ph.fx,
    fy: ph.fy,
    fz: ph.fz,
    fm: ph.fm,
  };
}

function stillObj(item) {
  const wrap = document.createElement("div");
  wrap.className = "pinStill pinObj";
  wrap.style.background = objectBg(item);
  const cached = STILL_CACHE.get(item.id);
  if (cached) {
    const img = document.createElement("img");
    img.src = cached;
    img.alt = "";
    wrap.appendChild(img);
  } else {
    wrap.innerHTML = comboPosterMarkup(item);
  }
  return wrap;
}

function stillAd(item) {
  const wrap = document.createElement("div");
  const format = formatById(item.ad);
  const ph = pinPlace(item);
  const mat = ph.paper || "#efe0c4";
  wrap.className = "pinStill pinAd ad-ph";
  wrap.dataset.style = ph.style;
  wrap.dataset.fit = ph.fit;
  wrap.setAttribute("style", `${adPlaceVars(ph)};--ph-fit-mat:${mat}`);
  wrap.innerHTML = adPlaceInnerMarkup(ph.style, format, ph.img, ph);
  wrap.querySelector("img")?.addEventListener("load", () => requestAnimationFrame(wallLayout), { once: true });
  return wrap;
}

function fillPinStage(stage, item) {
  stage.replaceChildren();
  const cover = browse.cover;
  if (cover === "ad") stage.appendChild(stillAd(item));
  else stage.appendChild(stillObj(item));
  if (cover === "hover" || cover === "orbit") {
    const live = document.createElement("div");
    live.className = cover === "orbit" ? "pinLive pinOrbit" : "pinLive";
    live.innerHTML = cover === "orbit" ? "<canvas></canvas>" : `<div class="fmtScale"></div>`;
    stage.appendChild(live);
    const play = document.createElement("span");
    play.className = cover === "orbit" ? "pinPlay pinOrbitBadge" : "pinPlay";
    play.setAttribute("aria-hidden", "true");
    play.innerHTML = cover === "orbit"
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12a8 8 0 0 1 13.2-6.1"/><path d="M19.2 3.6V9h-5.4"/><path d="M20 12a8 8 0 0 1-13.2 6.1"/><path d="M4.8 20.4V15h5.4"/></svg>`
      : `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M9 6.8v10.4L18.2 12z"/></svg>`;
    stage.appendChild(play);
  }
}

const COVER_KEY = "babylon-ads-browse-cover";
const COLS_KEY = "babylon-ads-browse-cols";
const BLIT_KEY = "babylon-ads-browse-blit";
const COVER_MODES = [
  { id: "obj", label: "Objeto" },
  { id: "ad", label: "Anuncio" },
  { id: "hover", label: "Al pasar" },
  { id: "orbit", label: "Al rotar" },
];
const COLS_MODES = [
  { id: "auto", label: "Auto" },
  { id: "1", label: "1" },
  { id: "2", label: "2" },
  { id: "3", label: "3" },
  { id: "4", label: "4" },
  { id: "5", label: "5" },
  { id: "6", label: "6" },
  { id: "8", label: "8" },
];

function normalizeCover(value) {
  return COVER_MODES.some((mode) => mode.id === value) ? value : "obj";
}

function loadCover() {
  return "ad";
  // try { return normalizeCover(localStorage.getItem(COVER_KEY)); }
  // catch { return "obj"; }
}

function normalizeCols(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw || raw === "auto") return "auto";
  const n = Number(raw);
  return COLS_MODES.some((mode) => mode.id === String(n)) ? String(n) : "auto";
}

function loadCols() {
  return 4;
  // try { return normalizeCols(localStorage.getItem(COLS_KEY)); }
  // catch { return "auto"; }
}

function loadBlit() {
  try {
    const raw = localStorage.getItem(BLIT_KEY);
    if (raw == null || raw === "") return 0.8;
    return normalizeBrowseBlit(raw);
  } catch {
    return 0.8;
  }
}

const vB = document.getElementById("vBrowse");
const elIndChips = document.getElementById("indChips");
const elCasoChips = document.getElementById("casoChips");
const elCoverChips = document.getElementById("coverChips");
const elColsChips = document.getElementById("colsChips");
const elBlit = document.getElementById("browseBlit");
const elBlitVal = document.getElementById("browseBlitVal");
const elPinGrid = document.getElementById("pinGrid");
const elPreviewCol = document.getElementById("previewCol");
const elPreviewStage = document.getElementById("previewStage");
const elPreviewClose = document.getElementById("previewClose");
const elWallCount = document.getElementById("wallCount");
const elWallEmpty = document.getElementById("wallEmpty");
const elWallReset = document.getElementById("wallReset");
const elSearch = document.getElementById("searchInput");
const elSearchClear = document.getElementById("searchClear");
const elFab = document.getElementById("createBtn");
const elScrim = document.getElementById("scrim");
const elModal = document.getElementById("modal");
const elPanel = document.getElementById("panel");
const elBody = document.getElementById("modalBody");
const elClose = document.getElementById("modalClose");

const ITEMS = catalogItems();
const CASOS = [];
const seenCaso = new Set();
for (const item of ITEMS) {
  const key = casoKey(item);
  if (seenCaso.has(key)) continue;
  seenCaso.add(key);
  CASOS.push({ id: key, name: casoLabel(item) });
}

const browse = { q: "", ind: "", caso: "", cover: loadCover(), cols: loadCols(), blit: loadBlit() };
const state = {
  open: false,
  ind: null,
  base: null,
  draft: null,
  backFn: null,
  liveSlot: null,
  token: 0,
};
let PINS = [];
let lastWallW = 0;
let hoverTimer = 0;
let hoverPin = null;
let hoverToken = 0;
const STILL_CACHE = new Map();
let stillGen = 0;
let stillWarm = null;
const stillPending = new Set();
const stillFails = new Map();
let stillChain = Promise.resolve();
let stillNow = "";
let stillHide = false;
const elStillDlg = document.getElementById("stillDlg");
const elStillStatus = document.getElementById("stillStatus");
const elStillBar = document.getElementById("stillBarFill");
const elStillErrs = document.getElementById("stillErrs");
const elStillClose = document.getElementById("stillDlgClose");

function count(n) {
  return n === 1 ? "1 clímax" : `${n} clímax`;
}

function setAmbience(industry) {
  const root = document.documentElement.style;
  if (!industry) {
    root.setProperty("--accent", "#3E3A34");
    root.setProperty("--accent-a40", "rgba(26,25,22,.22)");
    root.setProperty("--accent-a55", "rgba(26,25,22,.28)");
    root.setProperty("--accent-a12", "rgba(26,25,22,.06)");
    root.setProperty("--wash", "rgba(26,25,22,.028)");
    return;
  }
  const tone = industry;
  root.setProperty("--accent", hslOf(tone.hue, tone.sat, tone.light));
  root.setProperty("--accent-a40", hslaOf(tone.hue, tone.sat, tone.light, 0.5));
  root.setProperty("--accent-a55", hslaOf(tone.hue, tone.sat, tone.light, 0.55));
  root.setProperty("--accent-a12", hslaOf(tone.hue, tone.sat, tone.light, 0.13));
  root.setProperty("--wash", hslaOf(tone.hue, tone.sat, tone.light, 0.055));
}

function go(view) {
  view.classList.add("on");
  void view.offsetHeight;
  requestAnimationFrame(() => view.classList.add("in"));
  window.scrollTo(0, 0);
}

function mkChip(label, dotHsl, on, run, total) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `chip${on ? " on" : ""}${total == null ? "" : " hasCount"}`;
  if (dotHsl) {
    const dot = document.createElement("span");
    dot.className = "cdot";
    dot.style.background = dotHsl;
    button.appendChild(dot);
  }
  const text = document.createElement("span");
  text.className = "chipLabel";
  if (total != null) {
    const badge = document.createElement("span");
    badge.className = "chipCount";
    badge.textContent = String(`(${total})`);
    text.appendChild(badge);
  }
  const name = document.createElement("span");
  name.textContent = label;
  text.appendChild(name);
  button.appendChild(text);
  button.addEventListener("click", run);
  return button;
}

function buildChips() {
  elIndChips.innerHTML = "";
  elIndChips.appendChild(mkChip("Todas", null, !browse.ind, () => setInd(""), ITEMS.length));
  for (const industry of INDUSTRIES) {
    const n = itemsOfIndustry(industry).length;
    elIndChips.appendChild(mkChip(
      industry.name,
      hslOf(industry.hue, industry.sat, industry.light),
      browse.ind === industry.id,
      () => setInd(industry.id),
      n,
    ));
  }
  elCasoChips.innerHTML = "";
  // elCasoChips.appendChild(mkChip("Todos los clímax", null, !browse.caso, () => setCaso("")));
  // for (const caso of CASOS) {
  //   elCasoChips.appendChild(mkChip(caso.name, null, browse.caso === caso.id, () => setCaso(caso.id)));
  // }
  elCoverChips.innerHTML = "";
  // const lab = document.createElement("span");
  // lab.className = "chip chipLab";
  // lab.textContent = "Portada";
  // elCoverChips.appendChild(lab);
  // for (const mode of COVER_MODES) {
  //   elCoverChips.appendChild(mkChip(mode.label, null, browse.cover === mode.id, () => setCover(mode.id)));
  // }
  elColsChips.innerHTML = "";
  // const colsLab = document.createElement("span");
  // colsLab.className = "chip chipLab";
  // colsLab.textContent = "Columnas";
  // elColsChips.appendChild(colsLab);
  // for (const mode of COLS_MODES) {
    // elColsChips.appendChild(mkChip(mode.label, null, browse.cols === mode.id, () => setCols(mode.id)));
  // }
}

function setInd(id) {
  browse.ind = id;
  state.ind = id ? INDUSTRIES.find((industry) => industry.id === id) || null : null;
  if (!state.open) setAmbience(state.ind);
  buildChips();
  applyBrowse();
}

function setCaso(id) {
  browse.caso = id;
  buildChips();
  applyBrowse();
}

function setCols(id) {
  const next = normalizeCols(id);
  if (next === browse.cols) return;
  browse.cols = next;
  rememberAccount("cols", next);
  try { localStorage.setItem(COLS_KEY, next); } catch { /* optional */ }
  buildChips();
  wallLayout();
}

function setCover(id) {
  const next = normalizeCover(id);
  if (next === browse.cover) return;
  browse.cover = next;
  rememberAccount("cover", next);
  try { localStorage.setItem(COVER_KEY, next); } catch { /* optional */ }
  stopPinPlay();
  stillHide = false;
  stillFails.clear();
  stillNow = "";
  buildChips();
  buildWall();
  applyBrowse();
}

function paintBlit(value = browse.blit) {
  const blit = normalizeBrowseBlit(value);
  if (elBlit) elBlit.value = String(blit);
  if (elBlitVal) elBlitVal.value = `${blit}×`;
  return blit;
}

function rememberAccount(key, value) {
  window.dispatchEvent(new CustomEvent("account-save", { detail: { key, value } }));
}

function setBlit(value) {
  const blit = applyBrowseBlit(value);
  browse.blit = blit;
  paintBlit(blit);
  rememberAccount("blit", blit);
  try { localStorage.setItem(BLIT_KEY, String(blit)); } catch { /* optional */ }
  STILL_CACHE.clear();
  stillGen += 1;
  stillWarm = null;
  stillFails.clear();
  stillHide = false;
  stillNow = "";
  stopPinPlay();
  if (needsClimaxStill()) {
    buildWall();
    applyBrowse();
  }
  return blit;
}

function wallCols() {
  if (browse.cols !== "auto") return Number(browse.cols);
  const width = window.innerWidth || 1200;
  if (width >= 1180) return 5;
  if (width >= 900) return 4;
  if (width >= 620) return 3;
  return 2;
}

function wallSpan(format, cols) {
  const span = format.w / format.h >= 2 ? 2 : 1;
  return Math.max(1, Math.min(cols, span));
}

function wallGap(width) {
  return width < 620 ? 12 : Math.min(20, width * 0.015);
}

function wallLayout() {
  const width = elPinGrid.clientWidth;
  if (!width) return;
  lastWallW = width;
  const cols = wallCols();
  const gap = wallGap(width);
  const cell = (width - (cols - 1) * gap) / cols;
  const list = [];
  for (const pin of PINS) {
    if (!pin.el || pin.el.hidden) continue;
    pin.span = wallSpan(formatById(pin.item.ad), cols);
    pin.el.style.width = `${Math.round(pin.span * cell + (pin.span - 1) * gap)}px`;
    list.push(pin);
  }
  for (const pin of list) pin.ph = pin.el.offsetHeight;
  const bottoms = Array(cols).fill(0);
  for (const pin of list) {
    let at = 0;
    let best = Infinity;
    let y = 0;
    for (let k = 0; k <= cols - pin.span; k += 1) {
      let hi = -Infinity;
      let lo = Infinity;
      for (let j = k; j < k + pin.span; j += 1) {
        if (bottoms[j] > hi) hi = bottoms[j];
        if (bottoms[j] < lo) lo = bottoms[j];
      }
      const score = hi + (pin.span > 1 ? (hi - lo) * 1.5 : 0);
      if (score < best - 0.5) {
        best = score;
        at = k;
        y = hi;
      }
    }
    pin.el.style.left = `${Math.round(at * (cell + gap))}px`;
    pin.el.style.top = `${Math.round(y)}px`;
    for (let j = at; j < at + pin.span; j += 1) bottoms[j] = y + pin.ph + gap;
  }
  elPinGrid.style.height = `${Math.max(0, Math.round(Math.max(0, ...bottoms) - gap))}px`;
}

function refreshLoops() {
  mountHomeLoops(document);
  requestAnimationFrame(wallLayout);
}

function objectCover() {
  return browse.cover === "obj" || browse.cover === "hover" || browse.cover === "orbit";
}

function needsClimaxStill() {
  return objectCover();
}

function stillReason(err) {
  const raw = err?.message || String(err || "Error desconocido");
  if (/Failed to resolve module specifier/i.test(raw)) return "Falta Babylon en la página (import map).";
  if (/no hay clímax/i.test(raw)) return "El player no encontró el clímax.";
  if (/no terminó de cargar/i.test(raw)) return "El clímax no terminó de cargar.";
  if (/no hay escena/i.test(raw)) return "No había escena 3D para fotografiar.";
  if (/no puede exportar/i.test(raw)) return "Babylon no pudo sacar el cuadro.";
  if (/sin cuadro/i.test(raw)) return "La captura salió vacía.";
  if (/sigue cargando/i.test(raw)) return "El modelo 3D pesa y aún no termina de entrar.";
  if (/No se pudo cargar el modelo/i.test(raw)) return "No se pudo leer el GLB.";
  return raw;
}

function stillProgress() {
  const shown = PINS.filter((pin) => pin.el && !pin.el.hidden);
  const need = shown.filter((pin) => !STILL_CACHE.has(pin.item.id) && !stillFails.has(pin.item.id));
  const ready = shown.filter((pin) => STILL_CACHE.has(pin.item.id)).length;
  const failed = [...stillFails.keys()].filter((id) => shown.some((pin) => pin.item.id === id)).length;
  return { shown: shown.length, ready, need: need.length, failed, total: ready + need.length + failed };
}

function paintStillDlg() {
  if (!elStillDlg) return;
  if (!needsClimaxStill()) {
    elStillDlg.hidden = true;
    return;
  }
  const { ready, failed, total } = stillProgress();
  const working = stillPending.size > 0;
  if (stillHide) {
    elStillDlg.hidden = true;
    return;
  }
  if (!working && !failed) {
    if (!elStillDlg.hidden && total && ready >= total) {
      elStillStatus.textContent = `Listas ${ready} de ${total}.`;
      if (elStillBar) elStillBar.style.width = "100%";
      window.setTimeout(() => {
        if (!stillProgress().need && !stillProgress().failed) elStillDlg.hidden = true;
      }, 1800);
    } else {
      elStillDlg.hidden = true;
    }
    return;
  }
  stillHide = false;
  elStillDlg.hidden = false;
  const label = stillNow ? ` · ${stillNow}` : "";
  if (working) elStillStatus.textContent = `Cargando ${ready} de ${total}${label}`;
  else elStillStatus.textContent = failed ? `${failed} captura${failed === 1 ? "" : "s"} no salieron.` : "Cargando…";
  if (elStillBar) elStillBar.style.width = `${total ? Math.round((ready / total) * 100) : 0}%`;
  const rows = [...stillFails.entries()].map(([id, reason]) => {
    const pin = PINS.find((row) => row.item.id === id);
    const name = pin ? comboShortTitle(pin.item) : id;
    return `<li><strong>${esc(name)}</strong>${esc(reason)}</li>`;
  });
  elStillErrs.hidden = !rows.length;
  elStillErrs.innerHTML = rows.join("");
  elStillClose.textContent = working ? "Ocultar" : "Cerrar";
}

function stillErr(pin, err) {
  stillFails.set(pin.item.id, stillReason(err));
  stillHide = false;
  paintStillDlg();
}

function applyPinStill(pin, url) {
  const wrap = pin.stage?.querySelector(".pinObj");
  if (!wrap || !url) return;
  wrap.replaceChildren();
  const img = document.createElement("img");
  img.src = url;
  img.alt = "";
  img.addEventListener("load", () => requestAnimationFrame(wallLayout), { once: true });
  wrap.appendChild(img);
}

function pinByItemId(id) {
  return PINS.find((pin) => pin.item.id === id) || null;
}

function applyStillById(id, url) {
  const pin = pinByItemId(id);
  if (pin?.el?.isConnected) applyPinStill(pin, url);
}

async function bakePinStill(pin, attempt = 0) {
  if (!needsClimaxStill() || !pin?.item) return;
  const key = pin.item.id;
  if (STILL_CACHE.has(key)) {
    applyStillById(key, STILL_CACHE.get(key));
    return;
  }
  stillNow = comboShortTitle(pin.item);
  paintStillDlg();
  while (hoverPin) await new Promise((resolve) => setTimeout(resolve, 280));
  if (!needsClimaxStill()) return;
  try {
    const url = await captureComboStill(pin.item);
    if (!url) throw new Error("sin cuadro");
    STILL_CACHE.set(key, url);
    stillFails.delete(key);
    if (needsClimaxStill()) applyStillById(key, url);
    saveStoredStill(pin.item, browse.blit, url).catch((err) => {
      console.warn("portada guardada", err);
    });
  } catch (err) {
    const slow = /sigue cargando|modelo 3D/i.test(err?.message || "");
    const max = slow ? 3 : 1;
    if (attempt < max) {
      stillNow = `${comboShortTitle(pin.item)} · esperando modelo`;
      paintStillDlg();
      await new Promise((resolve) => setTimeout(resolve, slow ? 1400 * (attempt + 1) : 500));
      return bakePinStill(pinByItemId(key) || pin, attempt + 1);
    }
    const live = pinByItemId(key) || pin;
    stillErr(live, err);
    throw err;
  } finally {
    if (stillNow === comboShortTitle(pin.item)) stillNow = "";
    paintStillDlg();
  }
}

function queuePinStill(pin) {
  if (!needsClimaxStill() || !pin) return;
  const key = pin.item.id;
  if (STILL_CACHE.has(key)) {
    applyPinStill(pin, STILL_CACHE.get(key));
    return;
  }
  if (stillFails.has(key)) return;
  if (stillPending.has(key)) {
    stillChain = stillChain.then(() => {
      const url = STILL_CACHE.get(key);
      if (url) applyStillById(key, url);
    });
    return;
  }
  stillPending.add(key);
  stillChain = stillChain
    .then(() => bakePinStill(pin))
    .catch((err) => {
      console.warn("portada", err);
    })
    .finally(() => {
      stillPending.delete(key);
      const url = STILL_CACHE.get(key);
      if (url) applyStillById(key, url);
      paintStillDlg();
    });
  paintStillDlg();
}

function warmStills() {
  if (stillWarm) return stillWarm;
  const gen = stillGen;
  const blit = browse.blit;
  const items = PINS.map((pin) => pin.item);
  stillWarm = (async () => {
    await Promise.all(items.map(async (item) => {
      if (gen !== stillGen || STILL_CACHE.has(item.id)) return;
      try {
        const url = await loadStoredStill(item, blit);
        if (!url || gen !== stillGen) return;
        STILL_CACHE.set(item.id, url);
      } catch {
        /* si el archivo no se puede leer, se fotografía de nuevo */
      }
    }));
  })();
  return stillWarm;
}

function watchPinStills() {
  if (!needsClimaxStill()) {
    paintStillDlg();
    return;
  }
  const gen = stillGen;
  warmStills().then(() => {
    if (gen !== stillGen || !needsClimaxStill()) return;
    const vh = window.innerHeight || 800;
    const shown = PINS.filter((pin) => pin.el && !pin.el.hidden);
    const near = [];
    const rest = [];
    for (const pin of shown) {
      const box = pin.el.getBoundingClientRect();
      if (box.bottom > -80 && box.top < vh + 480) near.push(pin);
      else rest.push(pin);
    }
    for (const pin of near.concat(rest)) queuePinStill(pin);
    paintStillDlg();
  });
}

function buildWall() {
  elPinGrid.innerHTML = "";
  PINS = ITEMS.map((item) => {
    const industry = industryOf(item);
    const format = formatById(item.ad);
    const hay = norm([
      comboShortTitle(item),
      item.alias,
      playById(item.play).label,
      industry?.name,
      casoLabel(item),
      formatMeta(item.ad).label,
      formatMeta(item.ad).size,
      format.brand,
      format.kicker,
    ].join(" "));
    const card = document.createElement("div");
    card.className = "pin";
    const open = document.createElement("button");
    open.type = "button";
    open.className = "pinOpen";
    open.setAttribute("aria-pressed", "false");
    const stage = document.createElement("div");
    stage.className = "pinStage";
    stage.style.aspectRatio = `${format.w} / ${format.h}`;
    fillPinStage(stage, item);
    const body = document.createElement("div");
    body.className = "pinBody";
    const names = industriesOf(item).map((entry) => entry.name);
    body.innerHTML = `<div class="pinName">${esc(comboShortTitle(item))}</div>
      <div class="pinTags"><span class="pdot"></span><span>${esc(names.length ? `${casoLabel(item)} · ${names.join(" · ")}` : casoLabel(item))}</span></div>`;
    open.append(stage, body);
    const ficha = document.createElement("a");
    ficha.className = "pinFicha";
    ficha.href = `review.html?id=${encodeURIComponent(item.id)}`;
    ficha.textContent = "Ficha";
    card.append(open, ficha);
    const pin = { item, industry, hay, el: card, stage };
    if (browse.cover === "hover" || browse.cover === "orbit") {
      card.addEventListener("pointerenter", () => armPinPlay(pin));
      card.addEventListener("pointerleave", () => disarmPinPlay(pin));
    }
    open.addEventListener("click", (ev) => {
      if (pin.orbitDrag) {
        pin.orbitDrag = false;
        ev.preventDefault();
        return;
      }
      openPreview(item, industry);
    });
    elPinGrid.appendChild(card);
    return pin;
  });
  if (previewItem) {
    const next = PINS.find((pin) => pin.item.id === previewItem.id);
    previewItem = next ? next.item : null;
    if (!previewItem) setPreviewOpen(false);
    markPreviewPins();
  }
  wallLayout();
  refreshLoops();
  watchPinStills();
}

function applyBrowse() {
  const query = norm(browse.q);
  let shown = 0;
  for (const pin of PINS) {
    const ok = (!browse.ind || industriesOf(pin.item).some((industry) => industry.id === browse.ind))
      && (!browse.caso || casoKey(pin.item) === browse.caso)
      && (!query || pin.hay.includes(query));
    if (pin.el) pin.el.hidden = !ok;
    if (ok) shown += 1;
  }
  elWallCount.textContent = count(shown);
  elWallEmpty.hidden = shown > 0;
  wallLayout();
  watchPinStills();
}

function lockScroll(on) {
  document.body.style.overflow = on ? "hidden" : "";
}

function clearLivePlay() {
  if (state.liveSlot) {
    unmountPlay(state.liveSlot);
    state.liveSlot = null;
  }
}

function pinHasMesh(item) {
  return playById(item.play).id === "prop" && Boolean(item.pmesh);
}

function stopPinPlay() {
  window.clearTimeout(hoverTimer);
  hoverTimer = 0;
  hoverToken += 1;
  if (hoverPin?.el) hoverPin.el.classList.remove("is-live");
  if (hoverPin?.slotId) unmountPlay(hoverPin.slotId);
  if (hoverPin?.releaseOrbit) hoverPin.releaseOrbit();
  unmountPinOrbit();
  if (hoverPin?.stage) {
    const scale = hoverPin.stage.querySelector(".fmtScale");
    if (scale) scale.innerHTML = "";
  }
  hoverPin = null;
}

function armPinPlay(pin) {
  if (state.open) return;
  window.clearTimeout(hoverTimer);
  hoverTimer = window.setTimeout(() => {
    if (browse.cover === "orbit") startPinOrbit(pin);
    else startPinPlay(pin);
  }, 160);
}

function disarmPinPlay(pin) {
  if (pin?.orbitHold) return;
  window.clearTimeout(hoverTimer);
  hoverTimer = 0;
  if (hoverPin === pin) stopPinPlay();
}

async function startPinOrbit(pin) {
  if (state.open || browse.cover !== "orbit" || !pin?.stage) return;
  if (!pinHasMesh(pin.item)) return;
  if (hoverPin === pin && pin.el.classList.contains("is-live")) return;
  stopPinPlay();
  const token = hoverToken;
  const host = pin.stage.querySelector(".pinOrbit");
  if (!host) return;
  hoverPin = pin;
  try {
    const mounted = await mountPinOrbit(host, pin.item, {
      bg: objectBg(pin.item),
      onDrag: () => {
        pin.orbitDrag = true;
        pin.orbitHold = true;
      },
    });
    if (token !== hoverToken || hoverPin !== pin) {
      unmountPinOrbit();
      return;
    }
    if (!mounted) return;
    const release = () => {
      pin.orbitHold = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    pin.releaseOrbit = () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
    pin.el.classList.add("is-live");
  } catch (err) {
    console.warn("pin orbit", err);
    if (token === hoverToken && hoverPin === pin) stopPinPlay();
  }
}

async function startPinPlay(pin) {
  if (state.open || browse.cover !== "hover" || !pin?.stage) return;
  if (hoverPin === pin && pin.el.classList.contains("is-live")) return;
  stopPinPlay();
  const token = hoverToken;
  const inner = pin.stage;
  const host = inner.querySelector(".fmtScale");
  if (!host) return;
  hoverPin = pin;
  pin.slotId = `bpin-${pin.item.id}`;
  const format = formatById(pin.item.ad);
  inner.style.setProperty("--fw", format.w);
  inner.style.setProperty("--fh", format.h);
  try {
    await mountPlay(host, { item: pin.item, slotId: pin.slotId, origin: location.origin });
    if (token !== hoverToken || hoverPin !== pin) {
      unmountPlay(pin.slotId);
      return;
    }
    fitScale(inner);
    pin.el.classList.add("is-live");
  } catch (err) {
    console.warn("pin play", err);
    if (token === hoverToken && hoverPin === pin) stopPinPlay();
  }
}

function fitScale(inner) {
  const host = inner?.querySelector(".fmtScale");
  if (!inner || !host) return;
  const format = {
    w: Number(inner.style.getPropertyValue("--fw") || inner.dataset.fw || 300),
    h: Number(inner.style.getPropertyValue("--fh") || inner.dataset.fh || 250),
  };
  const box = inner.getBoundingClientRect();
  const k = Math.min(box.width / Math.max(1, format.w), box.height / Math.max(1, format.h));
  host.style.setProperty("--ad-w", `${format.w}px`);
  host.style.setProperty("--ad-h", `${format.h}px`);
  host.style.setProperty("--k", String(k));
}

async function showPlay(inner, item) {
  const host = inner.querySelector(".fmtScale");
  if (!host) return null;
  const format = formatById(item.ad);
  inner.style.setProperty("--fw", format.w);
  inner.style.setProperty("--fh", format.h);
  inner.dataset.fw = String(format.w);
  inner.dataset.fh = String(format.h);
  stopPinPlay();
  clearLivePlay();
  const slotId = `browse-${Date.now()}`;
  state.liveSlot = slotId;
  await mountPlay(host, { item, slotId, origin: location.origin });
  if (state.liveSlot !== slotId) return slotId;
  fitScale(inner);
  return slotId;
}

let previewItem = null;
let previewToken = 0;
let previewPlay = Promise.resolve();

function markPreviewPins() {
  const id = previewItem?.id;
  for (const pin of PINS) {
    const on = pin.item.id === id;
    pin.el.classList.toggle("is-on", on);
    pin.el.querySelector(".pinOpen")?.setAttribute("aria-pressed", on ? "true" : "false");
  }
}

let previewHideTimer = 0;

function replayPreviewPlayer() {
  if (!elPreviewCol || !elPreviewStage) return;
  elPreviewCol.classList.remove("is-player");
  elPreviewStage.style.transition = "none";
  void elPreviewStage.offsetWidth;
  elPreviewStage.style.transition = "";
  requestAnimationFrame(() => elPreviewCol.classList.add("is-player"));
}

function setPreviewOpen(on) {
  if (!elPreviewCol) return;
  window.clearTimeout(previewHideTimer);
  if (on) {
    elPreviewCol.hidden = false;
    elPreviewCol.classList.remove("is-open", "is-player");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => elPreviewCol.classList.add("is-open", "is-player"));
    });
    return;
  }
  elPreviewCol.classList.remove("is-player", "is-open");
  previewHideTimer = window.setTimeout(() => {
    if (previewItem || elPreviewCol.classList.contains("is-open")) return;
    if (!state.open) clearLivePlay();
    elPreviewCol.hidden = true;
  }, 560);
}

function paintPreview(item) {
  const format = formatById(item.ad);
  elPreviewStage.style.setProperty("--fw", format.w);
  elPreviewStage.style.setProperty("--fh", format.h);
  elPreviewStage.dataset.fw = String(format.w);
  elPreviewStage.dataset.fh = String(format.h);
}

function showPreviewPlay() {
  const token = ++previewToken;
  const item = previewItem;
  previewPlay = previewPlay.then(async () => {
    if (token !== previewToken || !item || state.open || elPreviewCol.hidden) return;
    const slotId = await showPlay(elPreviewStage, item);
    if (token !== previewToken || previewItem !== item || state.open) {
      if (slotId) {
        unmountPlay(slotId);
        if (state.liveSlot === slotId) state.liveSlot = null;
      }
      return;
    }
    fitScale(elPreviewStage);
  }).catch((err) => {
    console.warn("vista previa", err);
  });
}

function openPreview(item, industry) {
  stopPinPlay();
  const visible = elPreviewCol && !elPreviewCol.hidden && elPreviewCol.classList.contains("is-open");
  const same = previewItem?.id === item.id && visible;
  previewItem = item;
  state.ind = industry || industryOf(item);
  state.base = item;
  setAmbience(state.ind);
  paintPreview(item);
  if (!visible) setPreviewOpen(true);
  else if (!same) replayPreviewPlayer();
  markPreviewPins();
  requestAnimationFrame(() => {
    if (same) fitScale(elPreviewStage);
    else showPreviewPlay();
  });
}

function closePreview() {
  if (!previewItem && (elPreviewCol?.hidden || !elPreviewCol?.classList.contains("is-open"))) return;
  previewItem = null;
  previewToken += 1;
  setPreviewOpen(false);
  markPreviewPins();
}

function openModal() {
  if (state.open) return;
  state.open = true;
  elScrim.hidden = false;
  elModal.hidden = false;
  lockScroll(true);
  requestAnimationFrame(() => {
    elScrim.classList.add("on");
    elPanel.classList.add("in");
  });
}

function closeModal() {
  if (!state.open) return;
  state.open = false;
  state.token += 1;
  clearLivePlay();
  elScrim.classList.remove("on");
  elPanel.classList.remove("in");
  lockScroll(false);
  setTimeout(() => {
    if (state.open) return;
    elModal.hidden = true;
    elScrim.hidden = true;
    elBody.innerHTML = "";
    elPanel.classList.remove("wide");
    refreshLoops();
    if (previewItem) showPreviewPlay();
  }, 320);
}

function addBack(parent, run) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn quiet";
  button.textContent = "volver";
  button.addEventListener("click", run);
  parent.appendChild(button);
}

function setRow(list, label, value, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "setRow";
  button.innerHTML = `<span class="setLabel">${esc(label)}</span>
    <span class="setValue${value ? "" : " empty"}">${esc(value || "sin elegir")}</span>
    <span class="setChev">›</span>`;
  button.addEventListener("click", onClick);
  list.appendChild(button);
}

function draftCombo() {
  const base = state.base;
  const draft = state.draft || {};
  return makeCombo({
    ...base,
    id: base.id,
    play: base.play,
    propAct: base.propAct,
    ad: draft.ad || base.ad,
    in: draft.in || base.in || "none",
    hand: draft.hand || base.hand || "none",
    pal: base.pal,
    pmesh: base.pmesh,
  });
}

function blankFromIndustry(industry) {
  const match = itemsOfIndustry(industry)[0];
  if (match) return makeCombo({ ...match, ad: match.ad });
  return makeCombo({ play: "climax", ad: "medium" });
}

function stepIndustry() {
  clearLivePlay();
  elPanel.classList.add("wide");
  elBody.innerHTML = "";
  const title = document.createElement("h3");
  title.className = "stepTitle";
  title.textContent = "¿Para quién es este anuncio?";
  const grid = document.createElement("div");
  grid.className = "grid mini";
  for (const industry of INDUSTRIES) {
    const n = itemsOfIndustry(industry).length;
    const button = document.createElement("button");
    button.className = "card mini";
    button.type = "button";
    button.innerHTML = `<div class="swatch" style="--sw:${hslOf(industry.hue, industry.sat, industry.light)}">
        <svg viewBox="0 0 24 24">${industry.icon}</svg>
      </div>
      <div><div class="cardName">${esc(industry.name)}</div><div class="cardCount">${count(n)}</div></div>`;
    button.addEventListener("click", () => {
      setInd(industry.id);
      setAmbience(industry);
      stepAds();
    });
    grid.appendChild(button);
  }
  elBody.append(title, grid);
  elPanel.scrollTop = 0;
}

function stepAds() {
  clearLivePlay();
  elPanel.classList.add("wide");
  elBody.innerHTML = "";
  const industry = state.ind;
  const items = itemsOfIndustry(industry);
  const title = document.createElement("h3");
  title.className = "stepTitle";
  title.textContent = "Estos clímax ya viven aquí.";
  const tiles = document.createElement("div");
  tiles.className = "tiles mini";
  for (const item of items) {
    const button = document.createElement("button");
    button.className = "tile";
    button.type = "button";
    const stage = document.createElement("div");
    stage.className = "tileStage";
    stage.innerHTML = loopHtml(item);
    const meta = document.createElement("div");
    meta.className = "tileMeta";
    meta.innerHTML = `<span class="pdot"></span><span>${esc(comboShortTitle(item))}</span>`;
    button.append(stage, meta);
    button.addEventListener("click", () => {
      state.base = item;
      settingsFromBase();
    });
    tiles.appendChild(button);
  }
  elBody.append(title, tiles);
  const acts = document.createElement("div");
  acts.className = "actions";
  const fresh = document.createElement("button");
  fresh.type = "button";
  fresh.className = "btn";
  fresh.textContent = "Empezar de cero";
  fresh.addEventListener("click", () => settingsFromScratch());
  acts.appendChild(fresh);
  addBack(acts, stepIndustry);
  elBody.appendChild(acts);
  elPanel.scrollTop = 0;
  refreshLoops();
}

function stepBase() {
  clearLivePlay();
  elPanel.classList.remove("wide");
  elBody.innerHTML = "";
  const stack = document.createElement("div");
  stack.className = "stack";
  const stage = document.createElement("div");
  stage.className = "qStage";
  stage.innerHTML = loopHtml(state.base);
  const cap = document.createElement("div");
  cap.className = "caption";
  cap.textContent = comboShortTitle(state.base);
  stack.append(stage, cap);
  elBody.appendChild(stack);
  const dialog = document.createElement("div");
  dialog.className = "dialog";
  dialog.innerHTML = `<p class="question">¿Quieres usar este clímax como base?</p>`;
  const acts = document.createElement("div");
  acts.className = "actions";
  const yes = document.createElement("button");
  yes.type = "button";
  yes.className = "btn primary";
  yes.textContent = "Sí, úsalo como base";
  yes.addEventListener("click", settingsFromBase);
  const fresh = document.createElement("button");
  fresh.type = "button";
  fresh.className = "btn";
  fresh.textContent = "Empezar de cero";
  fresh.addEventListener("click", settingsFromScratch);
  acts.append(yes, fresh);
  dialog.appendChild(acts);
  elBody.appendChild(dialog);
  elPanel.scrollTop = 0;
  refreshLoops();
}

function settingsFromBase() {
  const base = state.base;
  state.draft = { ad: base.ad, in: base.in || "none", hand: base.hand || "none" };
  state.backFn = stepBase;
  stepSettings();
}

function settingsFromScratch() {
  const industry = state.ind || industryOf(state.base) || INDUSTRIES[0];
  state.ind = industry;
  state.base = blankFromIndustry(industry);
  state.draft = { ad: null, in: "none", hand: "none" };
  state.backFn = stepAds;
  stepSettings();
}

function stepSettings() {
  clearLivePlay();
  const draft = state.draft;
  elPanel.classList.remove("wide");
  elBody.innerHTML = "";
  const title = document.createElement("h3");
  title.className = "stepTitle";
  title.textContent = "Estos son sus ajustes.";
  const stack = document.createElement("div");
  stack.className = "stack";
  if (draft.ad) {
    const preview = draftCombo();
    const stage = document.createElement("div");
    stage.className = "qStage";
    const format = formatById(preview.ad);
    stage.style.aspectRatio = `${format.w} / ${format.h}`;
    stage.innerHTML = loopHtml(preview);
    stack.appendChild(stage);
  }
  const list = document.createElement("div");
  list.className = "setList";
  setRow(list, "Formato", draft.ad ? formatMeta(draft.ad).label : null, stepFormat);
  setRow(list, "Entrada", draft.in ? transitionById(draft.in).label : null, () => optStep("¿Cómo entra?", "in", IN_TRANSITIONS));
  setRow(list, "Remate", draft.hand ? handoffById(draft.hand).label : null, () => optStep("¿Qué remate?", "hand", HANDOFF_TRANSITIONS));
  stack.appendChild(list);
  elBody.append(title, stack);
  const ready = Boolean(draft.ad);
  const acts = document.createElement("div");
  acts.className = "actions";
  const create = document.createElement("button");
  create.type = "button";
  create.className = "btn primary";
  create.textContent = "Crear";
  create.disabled = !ready;
  create.addEventListener("click", () => { if (ready) stepReady(draftCombo()); });
  acts.appendChild(create);
  addBack(acts, () => (state.backFn || stepAds)());
  elBody.appendChild(acts);
  elPanel.scrollTop = 0;
  refreshLoops();
}

function optStep(titleText, key, options) {
  clearLivePlay();
  elPanel.classList.remove("wide");
  elBody.innerHTML = "";
  const title = document.createElement("h3");
  title.className = "stepTitle";
  title.textContent = titleText;
  const wrap = document.createElement("div");
  wrap.className = "optWrap";
  for (const option of options) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `optCard${state.draft[key] === option.id ? " on" : ""}`;
    button.textContent = option.label;
    button.addEventListener("click", () => {
      state.draft[key] = option.id;
      stepSettings();
    });
    wrap.appendChild(button);
  }
  elBody.append(title, wrap);
  addBack(elBody, stepSettings);
  elPanel.scrollTop = 0;
}

function frameSize(format, max) {
  const ar = format.w / format.h;
  if (ar >= 1) return { width: "100%", height: `${100 / ar}%` };
  return { height: "100%", width: `${ar * 100}%` };
}

async function stepFormat() {
  elPanel.classList.add("wide");
  elBody.innerHTML = "";
  const title = document.createElement("h3");
  title.className = "stepTitle";
  title.textContent = "¿Dónde va a vivir?";
  const combo = draftCombo();
  const hero = document.createElement("div");
  hero.className = "fmtHero";
  hero.innerHTML = `<div class="fmtHeroInner" id="fmtLive"><div class="fmtScale"></div></div>`;
  const inner = hero.querySelector(".fmtHeroInner");
  const grid = document.createElement("div");
  grid.className = "fmtGrid";
  for (const format of FORMATS) {
    const meta = formatMeta(format.id);
    const size = frameSize(format);
    const preview = makeCombo({ ...combo, ad: format.id });
    const button = document.createElement("button");
    button.type = "button";
    button.className = `fmtCard${state.draft.ad === format.id ? " on" : ""}`;
    button.innerHTML = `<div class="fmtStage"><div class="fmtFrame" style="width:${size.width};height:${size.height}">${loopHtml(preview)}</div></div>
      <div><div class="fmtName">${esc(meta.label)}</div><div class="fmtSize">${esc(meta.size)}</div></div>`;
    button.addEventListener("click", async () => {
      state.draft.ad = format.id;
      grid.querySelectorAll(".fmtCard").forEach((card) => card.classList.remove("on"));
      button.classList.add("on");
      await showPlay(inner, draftCombo());
    });
    grid.appendChild(button);
  }
  elBody.append(title, hero, grid);
  addBack(elBody, stepSettings);
  elPanel.scrollTop = 0;
  refreshLoops();
  const token = ++state.token;
  if (!state.draft.ad) state.draft.ad = combo.ad || "medium";
  requestAnimationFrame(async () => {
    if (token !== state.token) return;
    await showPlay(inner, draftCombo());
  });
}

async function stepReady(item) {
  elPanel.classList.add("wide");
  elBody.innerHTML = "";
  const stack = document.createElement("div");
  stack.className = "stack";
  const stage = document.createElement("div");
  stage.className = "heroStage";
  stage.innerHTML = `<div class="fmtScale"></div>`;
  const foot = document.createElement("div");
  foot.className = "prodFoot";
  const note = document.createElement("p");
  note.className = "note reveal show";
  note.textContent = comboShortTitle(item);
  const open = document.createElement("a");
  open.className = "btn primary reveal show";
  open.href = "gallery.html";
  open.textContent = "Ver en galería";
  const back = document.createElement("button");
  back.type = "button";
  back.className = "btn quiet reveal show";
  back.textContent = "Ajustes";
  back.addEventListener("click", stepSettings);
  foot.append(note, open, back);
  stack.append(stage, foot);
  elBody.appendChild(stack);
  elPanel.scrollTop = 0;
  await showPlay(stage, item);
}

function openAd(item, industry) {
  openPreview(item, industry);
}

elSearch.addEventListener("input", () => {
  browse.q = elSearch.value;
  elSearchClear.hidden = !elSearch.value;
  applyBrowse();
});
elSearchClear.addEventListener("click", () => {
  elSearch.value = "";
  browse.q = "";
  elSearchClear.hidden = true;
  applyBrowse();
  elSearch.focus();
});
elWallReset.addEventListener("click", () => {
  browse.q = "";
  browse.caso = "";
  elSearch.value = "";
  elSearchClear.hidden = true;
  setInd("");
});
elFab.addEventListener("click", () => {
  if (state.open) closeModal();
  location.hash = "createLookIndustry";
});
elStillClose?.addEventListener("click", () => {
  stillHide = true;
  paintStillDlg();
});
elBlit?.addEventListener("input", () => paintBlit(elBlit.value));
elBlit?.addEventListener("change", () => setBlit(elBlit.value));
elClose.addEventListener("click", closeModal);
elPreviewClose?.addEventListener("click", closePreview);
elModal.addEventListener("click", (event) => {
  if (event.target === elModal) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (state.open) {
    closeModal();
    return;
  }
  if (previewItem) {
    closePreview();
    return;
  }
  if (elStillDlg && !elStillDlg.hidden) {
    stillHide = true;
    paintStillDlg();
  }
});
function syncBrowseBar() {
  const bar = document.querySelector(".app-bar");
  if (!bar) return;
  const height = Math.max(0, bar.getBoundingClientRect().height - 1);
  document.documentElement.style.setProperty("--app-bar-h", `${height}px`);
  const browseBar = document.getElementById("browseBar");
  if (browseBar) {
    document.documentElement.style.setProperty("--browse-bar-h", `${Math.round(browseBar.getBoundingClientRect().height)}px`);
  }
}

window.addEventListener("resize", () => {
  syncBrowseBar();
  wallLayout();
  document.querySelectorAll(".fmtHeroInner, .heroStage, .pin.is-live .pinStage").forEach(fitScale);
});

window.addEventListener("account-settings", (event) => {
  const settings = event.detail || {};
  let dirty = false;
  if (settings.cover && settings.cover !== browse.cover) {
    browse.cover = settings.cover;
    dirty = true;
  }
  if (settings.cols && String(settings.cols) !== String(browse.cols)) {
    browse.cols = String(settings.cols);
    dirty = true;
  }
  if (settings.blit != null && Number(settings.blit) !== browse.blit) {
    browse.blit = applyBrowseBlit(settings.blit);
    paintBlit(browse.blit);
    dirty = true;
  }
  if (dirty) {
    buildChips();
    buildWall();
    applyBrowse();
  }
  const profile = activeProfile(loadGalleryStore());
  if (profile?.id) {
    fetch(`${location.protocol}//${location.hostname}:8780/api/profiles`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ galleryId: profile.id, title: profile.name || "" }),
    }).catch(() => {});
  }
});

function mountIndustryDialog() {
  const dlg = document.getElementById("industryDlg");
  const nav = document.getElementById("industryDlgNav");
  const list = document.getElementById("industryDlgItems");
  const search = document.getElementById("industryDlgSearch");
  const openBtn = document.getElementById("industryEdit");
  if (!dlg || !nav || !list || !search || !openBtn) return;
  let draft = {};
  let current = INDUSTRIES[0].id;

  function idsFor(industryId) {
    const map = { ...(showMap() || {}) };
    if (Object.prototype.hasOwnProperty.call(draft, industryId)) {
      if (draft[industryId] == null) delete map[industryId];
      else return draft[industryId];
    }
    return itemsForIndustry(ITEMS, industryById(industryId), map).map((item) => item.id);
  }

  function paintNav() {
    nav.replaceChildren(...INDUSTRIES.map((industry) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `industryDlgInd${industry.id === current ? " is-on" : ""}`;
      button.setAttribute("role", "tab");
      button.setAttribute("aria-selected", industry.id === current ? "true" : "false");
      button.textContent = `${industry.name} (${idsFor(industry.id).length})`;
      button.addEventListener("click", () => {
        current = industry.id;
        paintNav();
        paintItems();
      });
      return button;
    }));
  }

  function paintItems() {
    const query = norm(search.value);
    const chosen = new Set(idsFor(current));
    const rows = ITEMS.filter((item) => {
      const hay = norm(`${comboShortTitle(item)} ${casoLabel(item)}`);
      return !query || hay.includes(query);
    });
    list.replaceChildren(...rows.map((item) => {
      const row = document.createElement("label");
      row.className = "industryDlgRow";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = chosen.has(item.id);
      input.addEventListener("change", () => {
        const next = new Set(idsFor(current));
        if (input.checked) next.add(item.id);
        else next.delete(item.id);
        draft[current] = ITEMS.map((entry) => entry.id).filter((id) => next.has(id));
        paintNav();
      });
      const name = document.createElement("span");
      name.textContent = `${comboShortTitle(item)} · ${casoLabel(item)}`;
      row.append(input, name);
      return row;
    }));
  }

  openBtn.addEventListener("click", () => {
    draft = {};
    current = browse.ind && industryById(browse.ind) ? browse.ind : INDUSTRIES[0].id;
    search.value = "";
    paintNav();
    paintItems();
    dlg.showModal();
  });
  search.addEventListener("input", paintItems);
  document.getElementById("industryDlgClose")?.addEventListener("click", () => dlg.close());
  document.getElementById("industryDlgReset")?.addEventListener("click", () => {
    draft[current] = null;
    paintNav();
    paintItems();
  });
  document.getElementById("industryDlgSave")?.addEventListener("click", () => {
    const store = loadGalleryStore();
    const profile = activeProfile(store);
    if (!profile) return;
    const next = { ...(profile.industryShows || {}) };
    for (const [id, value] of Object.entries(draft)) {
      if (value == null) delete next[id];
      else next[id] = value;
    }
    profile.industryShows = next;
    saveGalleryStore(store);
    draft = {};
    dlg.close();
    buildChips();
    buildWall();
    applyBrowse();
  });
  dlg.addEventListener("click", (event) => {
    if (event.target === dlg) dlg.close();
  });
}

mountIndustryDialog();
syncBrowseBar();
setAmbience(null);
buildChips();
paintBlit(applyBrowseBlit(browse.blit));
go(vB);
buildWall();
applyBrowse();

let wallPending = false;
if (window.ResizeObserver) {
  new ResizeObserver(() => {
    if (wallPending || !elPinGrid.clientWidth || elPinGrid.clientWidth === lastWallW) return;
    wallPending = true;
    requestAnimationFrame(() => {
      wallPending = false;
      wallLayout();
    });
  }).observe(elPinGrid);
}
