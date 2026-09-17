import { playerUrl } from "./player-origin.js";

export const FORMATS = [
  { id: "billboard", label: "970×250 · Billboard", w: 970, h: 250, scene: "journey", brand: "Aurora", kicker: "Café de especialidad", offer: "94 °C. Sin prisa.", cta: "Pedir ahora", accent: "#e8a25a", hint: "La gota cae. El anuncio es el ripple." },
  { id: "leader", label: "728×90 · Leaderboard", w: 728, h: 90, scene: "journey", brand: "Norte", kicker: "Banca", offer: "Tu nómina, el mismo día.", cta: "Abrir cuenta", accent: "#7eb6e8", hint: "La gota cae. El anuncio es el ripple." },
  { id: "medium", label: "300×250 · Medium rectangle", w: 300, h: 250, scene: "journey", brand: "Lumen", kicker: "Audio", offer: "Silencio que viaja contigo.", cta: "Escuchar", accent: "#6d7cff", hint: "La gota cae. El anuncio es el ripple." },
  { id: "large", label: "336×280 · Large rectangle", w: 336, h: 280, scene: "journey", brand: "Sola", kicker: "Cuidado solar", offer: "SPF 50. Doce horas.", cta: "Comprar", accent: "#ffd166", hint: "La gota cae. El anuncio es el ripple." },
  { id: "mobile", label: "320×50 · Mobile banner", w: 320, h: 50, scene: "journey", brand: "Via", kicker: "Movilidad", offer: "Un auto en 4 min.", cta: "Pedir viaje", accent: "#7af7c5", hint: "La gota cae. El anuncio es el ripple." },
  { id: "sky", label: "160×600 · Wide skyscraper", w: 160, h: 600, scene: "journey", brand: "Atlas", kicker: "Outdoor", offer: "La ruta empieza aquí.", cta: "Ver botas", accent: "#8fd18a", hint: "La gota cae. El anuncio es el ripple." },
  { id: "half", label: "300×600 · Half-page", w: 300, h: 600, scene: "journey", brand: "Mara", kicker: "Agua de montaña", offer: "De la cumbre a tu mesa.", cta: "Suscribirse", accent: "#4cc9f0", hint: "La gota cae. El anuncio es el ripple." },
  { id: "nexus", label: "300×250 · Nexus+", w: 300, h: 250, scene: "journey", brand: "Nexus+", kicker: "Lectura", offer: "Historias, sin ruido.", cta: "Probar 7 días", accent: "#00f0c8", hint: "La gota cae. El anuncio es el ripple." },
];

export const EXPERIENCES = [
  { id: "inline", label: "En el artículo (inline)", blurb: "El anuncio va en medio del texto, como un rectángulo in-article." },
  { id: "sticky-bottom", label: "Sticky inferior", blurb: "Se queda pegado abajo del viewport mientras sigues leyendo." },
  { id: "sticky-top", label: "Sticky superior", blurb: "Se pega debajo de la barra al hacer scroll." },
  { id: "fixed-bottom", label: "Fijo abajo", blurb: "Siempre visible en la parte inferior (banner móvil)." },
  { id: "fixed-corner", label: "Fijo en esquina", blurb: "Flota abajo a la derecha, encima del contenido." },
  { id: "top-band", label: "Franja superior", blurb: "Encima del artículo, como un billboard o leaderboard." },
];

export function formatById(id) {
  return FORMATS.find((item) => item.id === id) || FORMATS[2];
}

export function experienceById(id) {
  return EXPERIENCES.find((item) => item.id === id) || EXPERIENCES[0];
}

export const IN_TRANSITIONS = [
  { id: "none", label: "Ninguna", blurb: "Aparece al instante." },
  { id: "fade", label: "Fade", blurb: "Solo opacidad." },
  { id: "fade-up", label: "Fade up", blurb: "Entra desde abajo." },
  { id: "fade-down", label: "Fade down", blurb: "Entra desde arriba." },
  { id: "scale", label: "Scale", blurb: "Crece desde el centro." },
  { id: "pop", label: "Pop", blurb: "Escala con un destello." },
  { id: "slide-left", label: "Slide left", blurb: "Entra desde la derecha." },
  { id: "slide-right", label: "Slide right", blurb: "Entra desde la izquierda." },
  { id: "blur", label: "Blur", blurb: "Nitidez al aparecer." },
];

export function transitionById(id) {
  return IN_TRANSITIONS.find((item) => item.id === id) || IN_TRANSITIONS[2];
}

export const HANDOFF_TRANSITIONS = [
  { id: "none", label: "Ninguna", blurb: "El remate actual: el anuncio llega cuando el gesto ya terminó." },
  { id: "wipe", label: "Cortinilla", blurb: "Franjas de marca barren el visual y dejan el anuncio.", claim: true },
  { id: "veil", label: "Velo", blurb: "Franjas se desvanecen en capas y revelan el anuncio.", claim: true },
  { id: "pulse", label: "Pulso", blurb: "Franjas laten con el fenómeno y se disuelven en el anuncio." },
  { id: "iris", label: "Iris", blurb: "El obturador cierra el visual, marca el corte y se abre al anuncio.", claim: true },
  { id: "doors", label: "Puertas", blurb: "Dos hojas se juntan y se abren al anuncio.", claim: true },
  { id: "mist", label: "Niebla", blurb: "La bruma entra, tapa el visual y se levanta sobre el anuncio." },
];

export function handoffById(id) {
  return HANDOFF_TRANSITIONS.find((item) => item.id === id) || HANDOFF_TRANSITIONS[0];
}

export function normalizeHandoffMs(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "2400";
  return String(Math.round(Math.min(4800, Math.max(800, n))));
}

export function normalizeHandoffBands(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "3";
  return String(Math.round(Math.min(8, Math.max(2, n))));
}

export function normalizeHandoffStagger(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "120";
  return String(Math.round(Math.min(280, Math.max(0, n))));
}

export function normalizeHandoffHold(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "700";
  return String(Math.round(Math.min(1800, Math.max(200, n))));
}

export function normalizeHandoffIn(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "420";
  return String(Math.round(Math.min(900, Math.max(80, n)) / 10) * 10);
}

export function normalizeHandoffBeats(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "4";
  return String(Math.round(Math.min(8, Math.max(2, n))));
}

export function normalizeHandoffTempo(value) {
  if (value === "" || value == null) return "0";
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return String(Math.round(Math.min(800, Math.max(200, n))));
}

export function normalizeHandoffText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function normalizeHandoffEmpty(value) {
  if (value === true || value === 1 || value === "1" || value === "on") return "1";
  return "0";
}

export function handoffUsesClaim(id) {
  return Boolean(handoffById(id).claim);
}

export function escapeHandoffClaim(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

export function resolveHandoffClaim(source = {}, format) {
  if (normalizeHandoffEmpty(source.hempty ?? source.handEmpty) === "1") return "";
  const custom = normalizeHandoffText(source.htxt ?? source.handClaim ?? source.handoffClaim);
  if (custom) return custom;
  return String(format?.offer || format?.kicker || format?.brand || "");
}

export function resolveHandoffTempo(play, tempo) {
  const custom = Number(normalizeHandoffTempo(tempo));
  if (custom > 0) return custom;
  if (play === "storm") return 320;
  if (play === "breaker") return 620;
  if (play === "erupt") return 400;
  if (play === "calve") return 480;
  return 440;
}

export function handoffSettingsFrom(source = {}) {
  return {
    hms: normalizeHandoffMs(source.hms ?? source.handMs ?? source.handoffMs),
    hnb: normalizeHandoffBands(source.hnb ?? source.handBands ?? source.handoffBands),
    hst: normalizeHandoffStagger(source.hst ?? source.handStagger ?? source.handoffStagger),
    hhd: normalizeHandoffHold(source.hhd ?? source.handHold ?? source.handoffHold),
    hin: normalizeHandoffIn(source.hin ?? source.handIn ?? source.handoffIn),
    hbt: normalizeHandoffBeats(source.hbt ?? source.handBeats ?? source.handoffBeats),
    htm: normalizeHandoffTempo(source.htm ?? source.handTempo ?? source.handoffTempo),
  };
}

export const VEIL_ENTER_MS = 640;

export function veilHandoffTiming(opts = {}) {
  const settings = handoffSettingsFrom(opts);
  const n = Number(settings.hnb);
  const hold = Number(settings.hhd);
  const stagger = Number(settings.hst);
  const enter = VEIL_ENTER_MS;
  const fade = Math.max(320, (Number(settings.hms) - hold - enter) / n);
  return {
    enter,
    fade: Math.round(fade),
    hold,
    stagger,
    bands: n,
    inMs: enter,
    outMs: Math.round(n * fade),
    total: Math.round(enter + hold + n * fade),
  };
}

export function handoffRuntimeMs(id, opts = {}) {
  const kind = handoffById(id).id;
  if (kind === "none") return 0;
  const settings = handoffSettingsFrom(opts);
  if (kind === "pulse") {
    const tempo = resolveHandoffTempo(opts.play, settings.htm);
    return Number(settings.hbt) * tempo + 720 + 520;
  }
  if (kind === "wipe") {
    return Number(settings.hms) + (Number(settings.hnb) - 1) * Number(settings.hst);
  }
  if (kind === "iris" || kind === "doors" || kind === "mist") {
    return Number(settings.hms);
  }
  return veilHandoffTiming(settings).total;
}

export function handoffDurationMs(id, opts) {
  return handoffRuntimeMs(id, opts);
}

export function handoffBandsMarkup(count, claimHtml = "") {
  const n = Number(normalizeHandoffBands(count));
  const bits = [];
  for (let i = 0; i < n; i += 1) {
    bits.push(i === 0
      ? `<i class="ad-handoff-band" style="--i:${i}"><span class="ad-handoff-claim">${claimHtml}</span></i>`
      : `<i class="ad-handoff-band" style="--i:${i}"></i>`);
  }
  return bits.join("");
}

export function applyHandoffSettings(container, opts = {}) {
  if (!container) return;
  const settings = handoffSettingsFrom({
    hms: opts.hms ?? container.dataset.handoffMs,
    hnb: opts.hnb ?? container.dataset.handoffBands,
    hst: opts.hst ?? container.dataset.handoffStagger,
    hhd: opts.hhd ?? container.dataset.handoffHold,
    hin: opts.hin ?? container.dataset.handoffIn,
    hbt: opts.hbt ?? container.dataset.handoffBeats,
    htm: opts.htm ?? container.dataset.handoffTempo,
  });
  container.dataset.handoffMs = settings.hms;
  container.dataset.handoffBands = settings.hnb;
  container.dataset.handoffStagger = settings.hst;
  container.dataset.handoffHold = settings.hhd;
  container.dataset.handoffIn = settings.hin;
  container.dataset.handoffBeats = settings.hbt;
  container.dataset.handoffTempo = settings.htm;
  const kind = handoffById(opts.hand ?? container.dataset.handoff).id;
  const veil = veilHandoffTiming(settings);
  const fade = kind === "veil"
    ? veil.fade
    : Math.max(280, (Number(settings.hms) - Number(settings.hhd)) / Number(settings.hnb));
  container.style.setProperty("--handoff-ms", `${settings.hms}ms`);
  container.style.setProperty("--handoff-bands", settings.hnb);
  container.style.setProperty("--handoff-stagger", `${settings.hst}ms`);
  container.style.setProperty("--handoff-hold", `${settings.hhd}ms`);
  container.style.setProperty("--handoff-in", `${veil.enter}ms`);
  container.style.setProperty("--handoff-rise", `${settings.hin}ms`);
  container.style.setProperty("--handoff-fade", `${Math.round(fade)}ms`);
  const wrap = container.querySelector(".ad-handoff");
  if (!wrap) return;
  const have = wrap.querySelectorAll(".ad-handoff-band").length;
  const claimHtml = (opts.htxt != null || opts.claim != null)
    ? escapeHandoffClaim(opts.claim ?? resolveHandoffClaim(opts))
    : (wrap.querySelector(".ad-handoff-claim")?.innerHTML ?? "");
  if (have !== Number(settings.hnb)) {
    wrap.innerHTML = handoffBandsMarkup(settings.hnb, claimHtml);
    return;
  }
  wrap.querySelectorAll(".ad-handoff-band").forEach((band, i) => {
    band.style.setProperty("--i", String(i));
  });
  if (opts.htxt != null || opts.claim != null) {
    wrap.querySelectorAll(".ad-handoff-claim").forEach((el) => {
      el.innerHTML = claimHtml;
    });
  }
}

export const PLAY_MODES = [
  { id: "climax", label: "Clímax · Gota", blurb: "Una gota cae, el ripple se abre y el anuncio es el impacto." },
  { id: "pre-enter", label: "Antes de entrar", blurb: "La gota y el ripple abren el agua; luego entra el anuncio." },
  { id: "horizon", label: "Clímax · Amanecer", blurb: "El sol sale. El anuncio llega cuando el día ya está en el cielo: el remate, no el corte." },
  { id: "sundown", label: "Clímax · Atardecer", blurb: "El sol baja. El anuncio llega cuando toca el horizonte: el remate, no el corte." },
  { id: "storm", label: "Clímax · Tormenta", blurb: "El relámpago parte el cielo. El anuncio llega en el silencio que sigue: el remate, no el corte." },
  { id: "aurora", label: "Clímax · Aurora", blurb: "Las luces suben. El anuncio llega cuando el cielo ya está lleno: el remate, no el corte." },
  { id: "erupt", label: "Clímax · Erupción", blurb: "El volcán carga, estalla y se apaga. El anuncio llega cuando ya acabó: el remate, no el corte." },
  { id: "migrate", label: "Clímax · Migración", blurb: "La bandada cruza en V y se va. El anuncio llega cuando el cielo ya está vacío: el remate, no el corte." },
  { id: "breaker", label: "Clímax · Ola", blurb: "La ola se levanta, rompe y se calma. El anuncio llega en el silencio después del golpe: el remate, no el corte." },
  { id: "calve", label: "Clímax · Glaciar", blurb: "El hielo se abre y cae. El anuncio llega cuando el fjordo ya calló: el remate, no el corte." },
  { id: "prop", label: "Clímax · Objeto", blurb: "Un objeto en el centro actúa. El anuncio llega cuando el gesto ya terminó. Después se cambia la caja por el 3D del producto." },
];

export function playById(id) {
  return PLAY_MODES.find((item) => item.id === id) || PLAY_MODES[0];
}

export const PROP_ACTIONS = [
  { id: "drop", label: "Cae al suelo", blurb: "Cae, pega y se queda." },
  { id: "toy", label: "Juguete", blurb: "Da unos saltitos y se para." },
  { id: "torch", label: "Linterna", blurb: "El haz barre el suelo y se detiene." },
  { id: "torch-front", label: "Linterna frente", blurb: "El mismo barrido, pero el haz mira al espectador." },
  { id: "ball", label: "Pelota", blurb: "Rebota de verdad y se agota." },
  { id: "turn", label: "Escaparate", blurb: "Una vuelta lenta, como en un display." },
  { id: "star", label: "Estrella", blurb: "Salta, da vueltas rápidas en el aire y posa, como al tomar una estrella." },
  { id: "cheer", label: "Victoria", blurb: "El mismo salto y las mismas vueltas, sin la estrella." },
  { id: "space", label: "Espacio", blurb: "Salta y da vueltas, pero no cae: el giro se apaga como en ingravidez." },
];

export function propActionById(id) {
  return PROP_ACTIONS.find((item) => item.id === id) || PROP_ACTIONS[0];
}

export const PROP_AIM_LIGHTS = [
  { id: "none", label: "Ninguna", blurb: "Sin focos extra sobre el objeto." },
  { id: "spot", label: "Foco", blurb: "Un haz apunta al objeto." },
  { id: "multi", label: "Varias", blurb: "Tres haces enmarcan el objeto." },
];

export function propAimLightById(id) {
  return PROP_AIM_LIGHTS.find((item) => item.id === id) || PROP_AIM_LIGHTS[0];
}

export const PROP_AIM_PLACES = [
  { id: "arriba", label: "Arriba", blurb: "El haz cae desde arriba del objeto." },
  { id: "frente", label: "Frente", blurb: "El haz viene de cara a la cámara." },
  { id: "detras", label: "Detrás", blurb: "El haz viene desde atrás del objeto." },
];

export function propAimPlaceById(id) {
  return PROP_AIM_PLACES.find((item) => item.id === id) || PROP_AIM_PLACES[1];
}

export function normalizePropCam(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "4.1";
  return String(Math.min(8, Math.max(2.2, Math.round(n * 10) / 10)));
}

export function normalizePropCamH(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(180, Math.max(-180, Math.round(n))));
}

export function normalizePropCamV(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(55, Math.max(-55, Math.round(n))));
}

export function normalizePropCamMode(value) {
  return value === "pan" ? "pan" : "orbit";
}

export function normalizePropCamPan(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(2, Math.max(-2, Math.round(n * 20) / 20)));
}

export function normalizeViewFps(value) {
  const n = Number(value);
  return n === 30 || n === 60 ? n : 0;
}

export function normalizeViewBlit(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1.5;
  return Math.round(Math.min(3, Math.max(1, n)) * 4) / 4;
}

export function normalizeViewShelf(value) {
  return value === "belt" ? "belt" : "column";
}

export function normalizeViewSideDlg(value) {
  return value === true || value === 1 || value === "1" || value === "on";
}

export function normalizeViewZoom(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 1;
  const zoom = n > 2.5 ? n / 100 : n;
  return Math.min(2, Math.max(0.5, Math.round(zoom * 20) / 20));
}

export function normalizeViewClock(value) {
  return !(value === false || value === 0 || value === "0" || value === "off");
}

export const CLOCK_STYLES = [
  { id: "sweep", label: "Barrido", blurb: "Manecilla y el blanco detrás." },
  { id: "disc", label: "Disco", blurb: "El círculo se llena." },
  { id: "ring", label: "Aro", blurb: "Solo el borde avanza." },
  { id: "ray", label: "Rayo", blurb: "Solo la manecilla." },
  { id: "bead", label: "Gota", blurb: "Crece desde el centro." },
];

export const CLOCK_TONES = [
  { id: "dark", label: "Oscuro" },
  { id: "light", label: "Claro" },
];

export function clockStyleById(value) {
  return CLOCK_STYLES.find((item) => item.id === value) || CLOCK_STYLES[0];
}

export function clockToneById(value) {
  return CLOCK_TONES.find((item) => item.id === value) || CLOCK_TONES[0];
}

export function normalizeViewClockStyle(value) {
  return clockStyleById(value).id;
}

export function normalizeViewClockTone(value) {
  return clockToneById(value).id;
}

export function normalizeViewClockSize(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 100;
  return Math.round(Math.min(200, Math.max(50, n)) / 5) * 5;
}

export function applyClockLook(root, look = {}) {
  const el = root || document.body;
  const on = normalizeViewClock(look.on);
  const style = normalizeViewClockStyle(look.style);
  const tone = normalizeViewClockTone(look.tone);
  const size = normalizeViewClockSize(look.size);
  el.classList.toggle("clock-off", !on);
  el.dataset.clockStyle = style;
  el.dataset.clockTone = tone;
  el.dataset.clockSize = String(size);
  el.style.setProperty("--clock-size", String(size / 100));
  return { on, style, tone, size };
}

export function adClockMarkup() {
  return `<canvas class="ad-clock-layer" aria-hidden="true"></canvas>
          <button type="button" class="ad-clock" aria-label="Tiempo restante del anuncio" title="Ocultar reloj"></button>`;
}

export function normalizePropLint(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0.35";
  return String(Math.min(1, Math.max(0.05, Math.round(n * 100) / 100)));
}

export function normalizePropFloor(value) {
  if (value === false || value === 0 || value === "0" || value === "off" || value === "hide") return "0";
  return "1";
}

export function normalizePropCog(value) {
  if (value === false || value === 0 || value === "0" || value === "off") return "0";
  return "1";
}

export function normalizePropFlat(value) {
  if (value === true || value === 1 || value === "1" || value === "on" || value === "flat") return "1";
  return "0";
}

export const DEFAULT_PROP_LCOL = "#fff0d1";

export function normalizePropLcol(value) {
  if (value == null || value === "") return DEFAULT_PROP_LCOL;
  return normHex(value, DEFAULT_PROP_LCOL);
}

export const DEFAULT_PROP_LDIST = "3.3";

export function normalizePropLdist(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return DEFAULT_PROP_LDIST;
  return String(Math.min(7, Math.max(1.2, Math.round(n * 10) / 10)));
}

export function normalizePropLhrot(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(180, Math.max(-180, Math.round(n))));
}

export function normalizePropLvrot(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(70, Math.max(-70, Math.round(n))));
}

export function normalizePropSpin(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return String(Math.min(180, Math.max(-180, Math.round(n))));
}

export const PLAY_PALETTES = {
  water: [
    { id: "skyTop", label: "Cielo alto", def: "#8ec4d4" },
    { id: "skyMid", label: "Cielo medio", def: "#c5d6c8" },
    { id: "skyHorizon", label: "Horizonte", def: "#e8d5b5" },
    { id: "skyDeep", label: "Cielo profundo", def: "#0a1418" },
    { id: "sun", label: "Sol", def: "#fff4d6" },
    { id: "water", label: "Agua", def: "#081a1f" },
  ],
  horizon: [
    { id: "skyNight", label: "Cielo noche", def: "#203052" },
    { id: "skyDay", label: "Cielo día", def: "#ec844e" },
    { id: "seaNight", label: "Mar noche", def: "#0e1624" },
    { id: "seaDay", label: "Mar día", def: "#2a181c" },
    { id: "sun", label: "Sol", def: "#ffd682" },
  ],
  storm: [
    { id: "sky", label: "Cielo", def: "#141824" },
    { id: "skyFlash", label: "Destello", def: "#d6e0f0" },
    { id: "sea", label: "Mar", def: "#0a0c12" },
    { id: "bolt", label: "Rayo", def: "#ffffff" },
  ],
  aurora: [
    { id: "sky", label: "Cielo", def: "#060812" },
    { id: "sea", label: "Tierra", def: "#05070c" },
    { id: "bandA", label: "Cortina 1", def: "#30ec80" },
    { id: "bandB", label: "Cortina 2", def: "#46ffc4" },
    { id: "bandC", label: "Cortina 3", def: "#d25cff" },
  ],
  erupt: [
    { id: "sky", label: "Cielo", def: "#080a16" },
    { id: "fire", label: "Cielo en fuego", def: "#ff601c" },
    { id: "ground", label: "Tierra", def: "#0e0c10" },
    { id: "cone", label: "Volcán", def: "#181416" },
    { id: "lava", label: "Lava", def: "#ff5a20" },
  ],
  migrate: [
    { id: "skyTop", label: "Cielo alto", def: "#6a8ab8" },
    { id: "skyMid", label: "Cielo medio", def: "#c4a078" },
    { id: "skyHorizon", label: "Horizonte", def: "#e8b86a" },
    { id: "earth", label: "Tierra", def: "#2a2c28" },
    { id: "birds", label: "Bandada", def: "#0c0d10" },
  ],
  breaker: [
    { id: "sky", label: "Cielo", def: "#9eb6ce" },
    { id: "sea", label: "Mar", def: "#164048" },
    { id: "wave", label: "Ola", def: "#1a6a7c" },
    { id: "sand", label: "Arena", def: "#c4b089" },
    { id: "foam", label: "Espuma", def: "#f8fcff" },
  ],
  calve: [
    { id: "sky", label: "Cielo", def: "#7d93a8" },
    { id: "water", label: "Agua", def: "#0c242c" },
    { id: "ice", label: "Hielo", def: "#dce8f0" },
    { id: "iceShade", label: "Hielo sombra", def: "#b3c4d0" },
    { id: "under", label: "Bajo el agua", def: "#2a7c8c" },
  ],
  prop: [
    { id: "floor", label: "Suelo", def: "#29292b" },
    { id: "stand", label: "Escaparate", def: "#3a3a3e" },
    { id: "object", label: "Objeto", def: "#dbc7a8" },
    { id: "ball", label: "Pelota", def: "#d1472e" },
    { id: "beam", label: "Haz", def: "#ffe8b8" },
    { id: "star", label: "Estrella", def: "#ffe566" },
    { id: "fog", label: "Fondo", def: "#121315" },
  ],
};

export function playPaletteKey(playId) {
  if (playId === "pre-enter" || playId === "climax") return "water";
  if (playId === "sundown") return "horizon";
  if (PLAY_PALETTES[playId]) return playId;
  return "water";
}

export function playPaletteFields(playId) {
  return PLAY_PALETTES[playPaletteKey(playId)];
}

export function normHex(value, fallback = "#000000") {
  const raw = String(value || "").trim();
  const h = raw.startsWith("#") ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{6}$/.test(h)) return `#${h.toLowerCase()}`;
  if (/^[0-9a-fA-F]{3}$/.test(h)) return `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase();
  return fallback;
}

export function playStageHex(item, fallback = "#f5f2ed") {
  const pal = item?.pal && typeof item.pal === "object" ? item.pal : {};
  const studio = item?.studio && typeof item.studio === "object" ? item.studio : {};
  const ph = item?.ph && typeof item.ph === "object" ? item.ph : {};
  if (pal.fog) return normHex(pal.fog, fallback);
  if (studio.worldCol) return normHex(studio.worldCol, fallback);
  if (ph.bg) return normHex(ph.bg, fallback);
  if (ph.fm) return normHex(ph.fm, fallback);
  return fallback;
}

export function resolvePalette(playId, raw) {
  const fields = playPaletteFields(playId);
  let parsed = {};
  if (typeof raw === "string" && raw) {
    try {
      parsed = JSON.parse(raw.includes("%") ? decodeURIComponent(raw) : raw);
    } catch {
      parsed = {};
    }
  } else if (raw && typeof raw === "object") {
    parsed = raw;
  }
  const out = {};
  for (const field of fields) out[field.id] = normHex(parsed[field.id], field.def);
  return out;
}

export function parsePlayColorState(text) {
  const state = {};
  if (!text) return state;
  for (const part of String(text).split(",")) {
    const split = part.indexOf(":");
    if (split < 1) continue;
    const left = part.slice(0, split);
    const hex = part.slice(split + 1);
    const dot = left.indexOf(".");
    if (dot < 1) continue;
    const play = left.slice(0, dot);
    const key = left.slice(dot + 1);
    if (!PLAY_PALETTES[play]) continue;
    state[play] ??= {};
    state[play][key] = normHex(hex, "#000000");
  }
  return state;
}

export function serializePlayColorState(state) {
  const parts = [];
  for (const [play, map] of Object.entries(state || {})) {
    const fields = PLAY_PALETTES[play];
    if (!fields) continue;
    const defs = Object.fromEntries(fields.map((field) => [field.id, normHex(field.def)]));
    for (const [key, value] of Object.entries(map || {})) {
      const hex = normHex(value, defs[key] || "#000000");
      if (defs[key] && hex === defs[key]) continue;
      parts.push(`${play}.${key}:${hex.slice(1)}`);
    }
  }
  return parts.join(",");
}

export const AD_PLACE_FIELDS = [
  { id: "bg", label: "Fondo", def: "#b89a6e" },
  { id: "paper", label: "Papel", def: "#efe0c4" },
  { id: "ink", label: "Icono", def: "#3d2a18" },
  { id: "accent", label: "Acento", def: "#8b5a2b" },
];

export const AD_PLACE_STYLES = [
  { id: "photo", label: "Foto" },
  { id: "blank", label: "Liso" },
  { id: "frame", label: "Marco" },
  { id: "bars", label: "Bandas" },
  { id: "grid", label: "Trama" },
  { id: "mark", label: "Marca" },
  { id: "play", label: "Play" },
];

const PLAY_PLACE_KEYS = {
  water: { bg: "water", paper: "skyHorizon", ink: "skyDeep", accent: "sun" },
  horizon: { bg: "skyNight", paper: "skyDay", ink: "seaNight", accent: "sun" },
  storm: { bg: "sky", paper: "skyFlash", ink: "sea", accent: "bolt" },
  aurora: { bg: "sky", paper: "bandB", ink: "sea", accent: "bandA" },
  erupt: { bg: "ground", paper: "fire", ink: "sky", accent: "lava" },
  migrate: { bg: "earth", paper: "skyHorizon", ink: "birds", accent: "skyMid" },
  breaker: { bg: "sea", paper: "sand", ink: "wave", accent: "foam" },
  calve: { bg: "water", paper: "ice", ink: "sky", accent: "under" },
  prop: { bg: "fog", paper: "floor", ink: "object", accent: "star" },
};

export function adPlaceFromPlay(playId, palRaw) {
  const pal = resolvePalette(playId, palRaw);
  const keys = PLAY_PLACE_KEYS[playPaletteKey(playId)] || PLAY_PLACE_KEYS.water;
  return {
    style: "play",
    bg: pal[keys.bg] || AD_PLACE_FIELDS[0].def,
    paper: pal[keys.paper] || AD_PLACE_FIELDS[1].def,
    ink: pal[keys.ink] || AD_PLACE_FIELDS[2].def,
    accent: pal[keys.accent] || AD_PLACE_FIELDS[3].def,
  };
}

export const AD_PLACE_PALETTES = [
  { id: "cream", label: "Crema", bg: "#b89a6e", paper: "#efe0c4", ink: "#3d2a18", accent: "#8b5a2b" },
  { id: "linen", label: "Lino", bg: "#d7c09a", paper: "#f7efe2", ink: "#3f2c16", accent: "#c4a06a" },
  { id: "sand", label: "Arena", bg: "#c4882e", paper: "#f3d9a0", ink: "#3a240c", accent: "#e8b84a" },
  { id: "clay", label: "Arcilla", bg: "#b85c38", paper: "#f0c4a8", ink: "#3a1c12", accent: "#e07a4a" },
  { id: "stone", label: "Piedra", bg: "#7a746c", paper: "#e8e4dc", ink: "#1c1916", accent: "#c4b8a4" },
  { id: "olive", label: "Oliva", bg: "#6e702c", paper: "#e4e0a8", ink: "#22240c", accent: "#c4c44a" },
  { id: "rose", label: "Rosa", bg: "#b45c64", paper: "#f4d8d4", ink: "#3a1418", accent: "#e87888" },
  { id: "mist", label: "Humo", bg: "#5c5854", paper: "#ddd8d0", ink: "#161412", accent: "#9a948c" },
  { id: "ink", label: "Tinta", bg: "#161210", paper: "#2a221c", ink: "#f2e6d4", accent: "#c4a06a" },
  { id: "night", label: "Noche", bg: "#10141c", paper: "#1c2434", ink: "#dce8f8", accent: "#5a82d4" },
  { id: "ember", label: "Brasa", bg: "#240c08", paper: "#4a180c", ink: "#ffe0b8", accent: "#ff6a28" },
  { id: "wine", label: "Vino", bg: "#2c0c14", paper: "#541824", ink: "#f8dce4", accent: "#e04a6a" },
  { id: "forest", label: "Bosque", bg: "#0c1c14", paper: "#163024", ink: "#d8f4dc", accent: "#2ec878" },
  { id: "cobalt", label: "Cobalto", bg: "#0c1424", paper: "#182848", ink: "#d8e8ff", accent: "#3a78ff" },
  { id: "gold", label: "Oro", bg: "#181208", paper: "#2a1e0c", ink: "#ffe7a0", accent: "#e8b020" },
  { id: "bone", label: "Hueso", bg: "#e8dcc8", paper: "#faf4ea", ink: "#14100c", accent: "#9a1c28" },
];

export function adPlaceById(id) {
  return AD_PLACE_PALETTES.find((item) => item.id === id) || AD_PLACE_PALETTES[0];
}

export function adPlaceStyleById(id) {
  return AD_PLACE_STYLES.find((item) => item.id === id) || AD_PLACE_STYLES[0];
}

const AD_IMG_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

export function normalizeAdImg(raw) {
  const name = decodeURIComponent(String(raw || "")).split(/[/\\]/).pop().trim();
  if (!name || name.includes("..") || !AD_IMG_EXT.test(name)) return "";
  return name;
}

export function normalizeAdImgRef(raw) {
  const value = String(raw || "").trim();
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      return url.href;
    } catch {
      return "";
    }
  }
  return normalizeAdImg(value);
}

export const AD_PLACE_FITS = [
  { id: "cover", label: "Cubrir" },
  { id: "contain", label: "Caber" },
  { id: "fill", label: "Estirar" },
];

export function normalizeAdFit(value) {
  return AD_PLACE_FITS.some((item) => item.id === value) ? value : "cover";
}

export function normalizeAdFitAxis(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "50";
  return String(Math.round(Math.min(100, Math.max(0, n))));
}

export function normalizeAdFitZoom(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "100";
  return String(Math.round(Math.min(220, Math.max(80, n)) / 5) * 5);
}

export const DEFAULT_AD_FIT_MAT = "#111111";

export function normalizeAdFitMat(value) {
  return normHex(value, DEFAULT_AD_FIT_MAT);
}

export function adImageSrc(name) {
  const img = normalizeAdImgRef(name);
  if (/^https?:\/\//i.test(img)) return img;
  return img ? playerUrl(`assets/ads/${encodeURIComponent(img)}`, `assets/ads/${encodeURIComponent(img)}`) : "";
}

export async function listAdImages() {
  try {
    const res = await fetch(playerUrl("assets/ads/manifest.json", "assets/ads/manifest.json"), { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map((item) => normalizeAdImg(item.name)).filter(Boolean);
  } catch {
    return [];
  }
}

function peelAdPlaceExtras(raw) {
  const extras = { img: "", fit: "", fx: "", fy: "", fz: "", fm: "" };
  if (raw && typeof raw === "object") {
    extras.img = normalizeAdImgRef(raw.img);
    extras.fit = raw.fit;
    extras.fx = raw.fx;
    extras.fy = raw.fy;
    extras.fz = raw.fz;
    extras.fm = raw.fm;
    return { body: raw, extras };
  }
  if (typeof raw !== "string" || !raw) return { body: raw, extras };
  const bits = raw.split(",");
  const rest = [];
  for (const part of bits) {
    if (part.startsWith("img:")) extras.img = normalizeAdImgRef(decodeURIComponent(part.slice(4)));
    else if (part.startsWith("fit:")) extras.fit = part.slice(4);
    else if (part.startsWith("fx:")) extras.fx = part.slice(3);
    else if (part.startsWith("fy:")) extras.fy = part.slice(3);
    else if (part.startsWith("fz:")) extras.fz = part.slice(3);
    else if (part.startsWith("fm:")) extras.fm = part.slice(3);
    else rest.push(part);
  }
  return { body: rest.join(","), extras };
}

export function resolveAdPlace(raw) {
  const defs = Object.fromEntries(AD_PLACE_FIELDS.map((field) => [field.id, field.def]));
  const peeled = peelAdPlaceExtras(raw);
  let parsed = {};
  const body = peeled.body;
  if (typeof body === "string" && body) {
    if (body === "play") parsed = { style: "play" };
    const parts = body.split(".");
    if (parts.length === 2 && AD_PLACE_STYLES.some((item) => item.id === parts[0])) {
      parsed.style = parts[0];
      const named = AD_PLACE_PALETTES.find((item) => item.id === parts[1]);
      if (named) parsed = { ...named, style: parts[0] };
    } else {
      const named = AD_PLACE_PALETTES.find((item) => item.id === body);
      if (named) parsed = named;
      else {
        for (const part of body.split(",")) {
          const split = part.indexOf(":");
          if (split < 1) continue;
          parsed[part.slice(0, split)] = part.slice(split + 1);
        }
      }
    }
  } else if (body && typeof body === "object") {
    parsed = body;
  }
  const extras = peeled.extras || {};
  const out = {
    style: adPlaceStyleById(parsed.style).id,
    img: extras.img || normalizeAdImgRef(parsed.img),
    fit: normalizeAdFit(extras.fit ?? parsed.fit),
    fx: normalizeAdFitAxis(extras.fx ?? parsed.fx),
    fy: normalizeAdFitAxis(extras.fy ?? parsed.fy),
    fz: normalizeAdFitZoom(extras.fz ?? parsed.fz),
    fm: normalizeAdFitMat(extras.fm ?? parsed.fm),
  };
  for (const field of AD_PLACE_FIELDS) out[field.id] = normHex(parsed[field.id], defs[field.id]);
  return out;
}

export function matchAdPlaceId(map) {
  const colors = resolveAdPlace(map);
  const found = AD_PLACE_PALETTES.find((item) => (
    normHex(item.bg) === colors.bg
    && normHex(item.paper) === colors.paper
    && normHex(item.ink) === colors.ink
    && normHex(item.accent) === colors.accent
  ));
  return found ? found.id : "";
}

export function serializeAdPlace(map) {
  const colors = resolveAdPlace(map);
  let packed = "";
  if (colors.style === "play") packed = "play";
  else {
    const palId = matchAdPlaceId(colors);
    if (palId && colors.style === "photo") packed = palId;
    else if (palId) packed = `${colors.style}.${palId}`;
    else packed = [`style:${colors.style}`, ...AD_PLACE_FIELDS.map((field) => `${field.id}:${colors[field.id].slice(1)}`)].join(",");
  }
  if (colors.img) packed = packed ? `${packed},img:${encodeURIComponent(colors.img)}` : `img:${encodeURIComponent(colors.img)}`;
  if (colors.fit !== "cover") packed = packed ? `${packed},fit:${colors.fit}` : `fit:${colors.fit}`;
  if (colors.fx !== "50") packed = packed ? `${packed},fx:${colors.fx}` : `fx:${colors.fx}`;
  if (colors.fy !== "50") packed = packed ? `${packed},fy:${colors.fy}` : `fy:${colors.fy}`;
  if (colors.fz !== "100") packed = packed ? `${packed},fz:${colors.fz}` : `fz:${colors.fz}`;
  if (colors.fm !== DEFAULT_AD_FIT_MAT) packed = packed ? `${packed},fm:${colors.fm.slice(1)}` : `fm:${colors.fm.slice(1)}`;
  return packed;
}

export function adPlaceIconMarkup() {
  return `<svg class="ad-ph-icon" viewBox="0 0 72 56" aria-hidden="true">
    <rect x="3.5" y="3.5" width="65" height="49" rx="4" fill="var(--ph-paper)" stroke="currentColor" stroke-width="2"/>
    <circle cx="24" cy="20" r="6" fill="currentColor"/>
    <path d="M8 46 L26 26 L38 36 L48 28 L64 46 Z" fill="currentColor"/>
  </svg>`;
}

export function adPlaceSizeLabel(format) {
  const w = Math.round(Number(format?.w) || 300);
  const h = Math.round(Number(format?.h) || 250);
  return `${w} × ${h}`;
}

export function adPlaceFitStyle(map = {}) {
  const fit = normalizeAdFit(map.fit);
  const fx = normalizeAdFitAxis(map.fx);
  const fy = normalizeAdFitAxis(map.fy);
  const z = Number(normalizeAdFitZoom(map.fz)) / 100;
  return `object-fit:${fit};object-position:${fx}% ${fy}%;transform:scale(${z});transform-origin:${fx}% ${fy}%`;
}

export function adPlaceInnerMarkup(styleId, format, img, fitMap) {
  const shot = normalizeAdImg(img);
  if (shot) {
    return `<div class="ad-ph-art"><img class="ad-ph-shot" src="${adImageSrc(shot)}" alt="" style="${adPlaceFitStyle(fitMap)}"></div>`;
  }
  const style = adPlaceStyleById(styleId).id;
  const size = `<span class="ad-ph-size">${adPlaceSizeLabel(format)}</span>`;
  let art = "";
  if (style === "photo" || style === "play") art = adPlaceIconMarkup();
  else if (style === "frame") art = `<div class="ad-ph-frame"></div>`;
  else if (style === "bars") art = `<div class="ad-ph-bars" aria-hidden="true"><i></i><i></i><i></i></div>`;
  else if (style === "grid") art = `<div class="ad-ph-grid" aria-hidden="true"></div>`;
  return `<div class="ad-ph-art">${art}</div>${size}`;
}

export function adPlaceVars(map) {
  const ph = resolveAdPlace(map);
  return `--ph-bg:${ph.bg};--ph-paper:${ph.paper};--ph-ink:${ph.ink};--ph-accent:${ph.accent};--ph-fit:${ph.fit};--ph-fit-x:${ph.fx}%;--ph-fit-y:${ph.fy}%;--ph-fit-z:${Number(ph.fz) / 100};--ph-fit-mat:${ph.fm}`;
}

function adLayout(format) {
  const ratio = format.w / format.h;
  if (ratio >= 2.4) return "wide";
  if (ratio <= 0.55) return "tall";
  return "rect";
}

export function adMarkup(format, adId = "lab-ad", inId = "fade-up", playId = "climax", extras = {}) {
  const layout = adLayout(format);
  const play = playById(playId);
  const ph = resolveAdPlace(extras.ph);
  const phId = matchAdPlaceId(ph) || "custom";
  const propAct = propActionById(extras.propAct);
  const propCam = extras.propCam ?? "4.1";
  const propCamH = extras.propCamH ?? extras.pch ?? "0";
  const propCamV = extras.propCamV ?? extras.pcv ?? "0";
  const propCamMode = extras.propCamMode ?? extras.pcm ?? "orbit";
  const propCamPx = extras.propCamPx ?? extras.ppx ?? "0";
  const propCamPy = extras.propCamPy ?? extras.ppy ?? "0";
  const propSx = extras.propSx ?? "0.72";
  const propSy = extras.propSy ?? "0.72";
  const propSz = extras.propSz ?? "0.72";
  const propLight = extras.propLight ?? extras.plight ?? "none";
  const propLint = extras.propLint ?? extras.plint ?? "0.35";
  const propFloor = extras.propFloor ?? extras.pfloor ?? "1";
  const propCog = extras.propCog ?? extras.pcog ?? "1";
  const propFlat = extras.propFlat ?? extras.pflat ?? "0";
  const propLcol = extras.propLcol ?? extras.plcol ?? DEFAULT_PROP_LCOL;
  const propLdist = extras.propLdist ?? extras.pldist ?? DEFAULT_PROP_LDIST;
  const propLpos = extras.propLpos ?? extras.plpos ?? "frente";
  const propLhrot = extras.propLhrot ?? extras.plhrot ?? "0";
  const propLvrot = extras.propLvrot ?? extras.plvrot ?? "0";
  const propRhrot = extras.propRhrot ?? extras.prh ?? "0";
  const propRvrot = extras.propRvrot ?? extras.prv ?? "0";
  let studioLights = extras.studioLights || "";
  if (studioLights && typeof studioLights === "object") {
    studioLights = JSON.stringify(studioLights);
  }
  const studioAttr = play.id === "prop" && studioLights
    ? ` data-studio-lights="${String(studioLights).replace(/&/g, "&amp;").replace(/"/g, "&quot;")}"`
    : "";
  const propAttrs = play.id === "prop"
    ? ` data-prop-act="${propAct.id}" data-prop-cam="${propCam}" data-prop-cam-h="${propCamH}" data-prop-cam-v="${propCamV}" data-prop-cam-mode="${propCamMode}" data-prop-cam-px="${propCamPx}" data-prop-cam-py="${propCamPy}" data-prop-cog="${propCog}" data-prop-sx="${propSx}" data-prop-sy="${propSy}" data-prop-sz="${propSz}" data-prop-light="${propLight}" data-prop-lint="${propLint}" data-prop-floor="${propFloor}" data-prop-flat="${propFlat}" data-prop-lcol="${propLcol}" data-prop-ldist="${propLdist}" data-prop-lpos="${propLpos}" data-prop-lhrot="${propLhrot}" data-prop-lvrot="${propLvrot}" data-prop-rhrot="${propRhrot}" data-prop-rvrot="${propRvrot}"${studioAttr}`
    : "";
  const handoff = handoffById(extras.handoff ?? extras.hand).id;
  const handSet = handoffSettingsFrom(extras);
  const claim = escapeHandoffClaim(resolveHandoffClaim(extras, format));
  const hint = play.id === "pre-enter"
    ? "La escena abre paso al anuncio"
    : play.id === "horizon"
      ? "El sol sale. El anuncio es el remate."
      : play.id === "sundown"
        ? "El sol toca el horizonte. El anuncio es el remate."
      : play.id === "storm"
        ? "El relámpago calla. El anuncio es el remate."
        : play.id === "aurora"
          ? "Las luces llenan el cielo. El anuncio es el remate."
          : play.id === "erupt"
            ? "El volcán calla. El anuncio es el remate."
            : play.id === "migrate"
              ? "La bandada se fue. El anuncio es el remate."
              : play.id === "breaker"
                ? "La ola ya rompió. El anuncio es el remate."
                : play.id === "calve"
                  ? "El hielo ya cayó. El anuncio es el remate."
                  : play.id === "prop"
                    ? `${propAct.blurb} El anuncio es el remate.`
                    : format.hint;
  return `
    <aside class="ad-slot" data-in="${inId}" data-play="${play.id}" style="--ad-w:${format.w}px;--ad-h:${format.h}px;--ad-ratio:${format.w} / ${format.h}">
      <div class="ad-label">Publicidad · ${format.w}×${format.h}</div>
      <div class="ad-frame">
        <div id="${adId}" class="ad-container" data-scene="${format.scene}" data-layout="${layout}" data-play="${play.id}" data-in="${inId}" data-handoff="${handoff}" data-handoff-ms="${handSet.hms}" data-handoff-bands="${handSet.hnb}" data-handoff-stagger="${handSet.hst}" data-handoff-hold="${handSet.hhd}" data-handoff-in="${handSet.hin}" data-handoff-beats="${handSet.hbt}" data-handoff-tempo="${handSet.htm}" data-ph="${phId}" data-ph-style="${ph.style}" data-pal="${encodeURIComponent(JSON.stringify(resolvePalette(play.id, extras.pal)))}" style="${adPlaceVars(ph)};--handoff-ms:${handSet.hms}ms;--handoff-bands:${handSet.hnb};--handoff-stagger:${handSet.hst}ms;--handoff-hold:${handSet.hhd}ms;--handoff-rise:${handSet.hin}ms;--handoff-fade:${Math.max(280, Math.round((Number(handSet.hms) - Number(handSet.hhd)) / Number(handSet.hnb)))}ms"${propAttrs}>
          <canvas id="${adId}-canvas" width="${format.w}" height="${format.h}" aria-label="Placeholder de imagen"></canvas>
          <div class="ad-fallback">Anuncio no disponible</div>
          <div class="ad-hint">${hint}</div>
          <div class="ad-handoff" aria-hidden="true">
            ${handoffBandsMarkup(handSet.hnb, claim)}
          </div>
          <article class="ad-creative" aria-label="Placeholder de imagen">
            <div class="ad-ph" data-style="${ph.style}" data-fit="${ph.fit}">${adPlaceInnerMarkup(ph.style, format, ph.img, ph)}</div>
          </article>
          ${adClockMarkup()}
        </div>
      </div>
    </aside>`;
}
