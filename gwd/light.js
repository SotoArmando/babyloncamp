import {
  adImageSrc,
  adPlaceFitStyle,
  adPlaceFromPlay,
  adPlaceVars,
  escapeHandoffClaim,
  formatById,
  handoffBandsMarkup,
  handoffById,
  handoffSettingsFrom,
  normalizeAdImg,
  normalizePropCam,
  normalizePropCamMode,
  normalizePropCamPan,
  normalizePropCog,
  normalizePropFlat,
  normalizePropFloor,
  normalizePropSpin,
  playById,
  resolveAdPlace,
  transitionById,
  resolveHandoffClaim,
} from "../ad-catalog.js?v=cam23";
import { playerUrl } from "../player-origin.js";
import { serializeStudioState, STUDIO_CHANNEL_MAX, STUDIO_CHANNEL_MIN, STUDIO_EXPOSURE_MAX, STUDIO_EXPOSURE_MIN } from "../studio-lights.js";
import { bakeClimaxFromUrl } from "./bake.js";
import { applyGwdGaps } from "./gaps.js";
import { paintStudioEnv } from "./gaps/env.js";
import { gwdSceneMarkup, isCanvas2DPlay, isGwdScenePlay } from "./gaps/scene.js";
import { gwdNativePasteSnippet, gwdNativePublicAdHtml } from "./hosts/native.js";
import { zipStore } from "./zip.js";
import { propActionMs } from "../prop-climax.js";

const GWD_KIT_V = "41";
const GWD_ORIGIN_KEY = "gwd-serve-origin";
const GWD_GTM_KEY = "gwd-gtm-container";
let serveOrigin = "";
let serveGtmId = "";

function livePlaceFrom(item, phRaw = item?.ph) {
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
    studioLights: serializeStudioState(item.studio),
  };
}

export function normalizeGwdGtmId(value) {
  const id = String(value || "").trim().toUpperCase();
  return /^(GTM|GT|G|AW)-[A-Z0-9]+$/.test(id) ? id : "";
}

export function gwdGtmHeadHtml(id) {
  const tag = normalizeGwdGtmId(id);
  if (!tag) return "";
  if (tag.startsWith("GTM-")) {
    return `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${tag}');</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${tag}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tag}');</script>
<!-- End Google Tag Manager -->`;
  }
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${tag}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${tag}');</script>`;
}

export function gwdGtmBodyHtml(id) {
  const tag = normalizeGwdGtmId(id);
  if (!tag || !tag.startsWith("GTM-")) return "";
  return `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${tag}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
}

export function setGwdGtmId(value) {
  serveGtmId = normalizeGwdGtmId(value);
  try {
    if (serveGtmId) localStorage.setItem(GWD_GTM_KEY, serveGtmId);
    else localStorage.removeItem(GWD_GTM_KEY);
  } catch { /* optional */ }
  return serveGtmId;
}

export function loadGwdGtmId() {
  try {
    serveGtmId = normalizeGwdGtmId(localStorage.getItem(GWD_GTM_KEY) || "");
  } catch {
    serveGtmId = "";
  }
  return serveGtmId;
}

export function gwdGtmId() {
  return serveGtmId || loadGwdGtmId();
}

export function normalizeGwdServeOrigin(value) {
  let raw = String(value || "").trim();
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.origin;
  } catch {
    return "";
  }
}

export function setGwdServeOrigin(value) {
  serveOrigin = normalizeGwdServeOrigin(value);
  try {
    if (serveOrigin) localStorage.setItem(GWD_ORIGIN_KEY, serveOrigin);
    else localStorage.removeItem(GWD_ORIGIN_KEY);
  } catch { /* optional */ }
  return serveOrigin;
}

export function loadGwdServeOrigin() {
  try {
    serveOrigin = normalizeGwdServeOrigin(localStorage.getItem(GWD_ORIGIN_KEY) || "");
  } catch {
    serveOrigin = "";
  }
  return serveOrigin;
}

/** Origen de los archivos públicos. Vacío = esta página (o 127.0.0.1:8765). */
export function gwdServeOrigin() {
  if (serveOrigin) return serveOrigin;
  if (typeof location !== "undefined" && /^https?:$/i.test(location.protocol) && location.origin && location.origin !== "null") {
    return location.origin;
  }
  return "http://127.0.0.1:8765";
}

export function gwdServeUrl(path, version) {
  const rel = String(path || "").replace(/^\/+/, "");
  const url = `${gwdServeOrigin()}/${rel}`;
  if (version == null || version === "") return url;
  return `${url}?v=${encodeURIComponent(String(version))}`;
}

/** Archivos de la previa blob: esta página, no el origen publicado (túnel/CDN). */
function gwdLiveFileUrl(path) {
  return `${gwdApiOrigin()}/${String(path || "").replace(/^\/+/, "")}`;
}

export function gwdKitUrl(file) {
  const v = /\.(glb|hdr)$/i.test(file) ? "" : GWD_KIT_V;
  return gwdServeUrl(`public/gwd/${file}`, v);
}

function gwdLightGlbName(spec) {
  return String(spec.file || "prop").replace(/\.glb$/i, "") + "-climax.glb";
}

function gwdClimaxRel(spec) {
  return `public/gwd/${gwdLightGlbName(spec)}`;
}

function gtmMeshRel(spec) {
  const file = spec?.file;
  return file ? `public/gtm/${file}` : "";
}

function gtmImgRel(spec) {
  return spec?.img ? `public/gtm/${spec.img}` : "";
}

export function gwdPublishedGlbUrl(spec) {
  return gwdServeUrl(gwdClimaxRel(spec));
}

export function gwdIframeSrc(item, spec = gwdLightFromCombo(item)) {
  if (!spec?.ok || spec.kind === "scene") return "";
  return gwdServeUrl(`public/iframe/${gwdLightSlug(item, spec)}.html`);
}

export function gwdLabAdHref(item, profileId) {
  if (!item?.id) return "";
  const parts = [];
  if (profileId) parts.push(`p=${encodeURIComponent(profileId)}`);
  parts.push(`id=${encodeURIComponent(item.id)}`);
  return `gwd-light-ad.html#${parts.join("&")}`;
}

const previewMeshBlobs = new Map();

export function releaseGwdPreviewUrl(href) {
  if (!href) return;
  const mesh = previewMeshBlobs.get(href);
  if (mesh) {
    previewMeshBlobs.delete(href);
    try { URL.revokeObjectURL(mesh); } catch { /* already gone */ }
  }
  if (String(href).startsWith("blob:")) {
    try { URL.revokeObjectURL(href); } catch { /* already gone */ }
  }
}

export function gwdPreviewDocUrl(item, spec = gwdLightFromCombo(item), opts = {}) {
  const html = gwdIframeHtml(item, spec, {
    includeGtm: false,
    live: true,
    glb: opts.glb,
    cssText: opts.cssText,
  });
  if (!html) return "";
  const href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const mesh = opts.meshBlob || (String(opts.glb || "").startsWith("blob:") ? opts.glb : "");
  if (mesh) previewMeshBlobs.set(href, mesh);
  return href;
}

let liveCssTextCache = "";

async function liveCssText() {
  if (liveCssTextCache) return liveCssTextCache;
  try {
    const res = await fetch(`${gwdApiOrigin()}/ad-play.css?v=${GWD_KIT_V}`, { cache: "force-cache" });
    if (res.ok) liveCssTextCache = await res.text();
  } catch { /* el blob usa el <link> */ }
  return liveCssTextCache;
}

async function gwdPublishedClimaxUrl(spec) {
  const name = gwdLightGlbName(spec);
  if (await gwdHeadOk(`public/gwd/${name}`)) return gwdLiveFileUrl(`public/gwd/${name}`);
  if (await gwdHeadOk(`public/gtm/${name}`)) return gwdLiveFileUrl(`public/gtm/${name}`);
  return "";
}

export async function gwdPreviewDoc(item, spec = gwdLightFromCombo(item), profileId = "") {
  if (!spec?.ok) return { html: "", url: gwdLabAdHref(item, profileId), meshBlob: "" };
  const cssText = await liveCssText();
  const wrap = (opts = {}) => ({
    html: gwdIframeHtml(item, spec, { includeGtm: false, live: true, cssText, ...opts }) || "",
    url: "",
    meshBlob: opts.meshBlob || "",
  });
  if (spec.kind === "scene") return wrap();
  try {
    const published = await gwdPublishedClimaxUrl(spec);
    if (published) return wrap({ glb: published });
  } catch {
    /* hornear desde assets/3d si public/gwd aún no tiene el clímax */
  }
  try {
    const bytes = await bakeClimaxForGwd(spec, item.propAct || "drop");
    const meshBlob = URL.createObjectURL(new Blob([bytes], { type: "model/gltf-binary" }));
    return wrap({ glb: meshBlob, meshBlob });
  } catch {
    if (spec.src) return wrap({ glb: spec.src });
  }
  return { html: "", url: gwdLabAdHref(item, profileId), meshBlob: "" };
}

export async function gwdPreviewSrc(item, spec = gwdLightFromCombo(item), profileId = "") {
  const doc = await gwdPreviewDoc(item, spec, profileId);
  if (doc.html) {
    const href = URL.createObjectURL(new Blob([doc.html], { type: "text/html" }));
    if (doc.meshBlob) previewMeshBlobs.set(href, doc.meshBlob);
    return href;
  }
  return doc.url || "";
}

export function gwdIframeTag(item, spec = gwdLightFromCombo(item)) {
  const src = gwdIframeSrc(item, spec);
  if (!src) return "";
  const w = Number(spec.w) || 300;
  const h = Number(spec.h) || 250;
  return `<iframe src="${src}" width="${w}" height="${h}" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
}

export function gwdGtmPreviewPath(item, spec = gwdLightFromCombo(item)) {
  const slug = gwdLightSlug(item, spec);
  if (!spec?.ok || !slug) return "";
  const q = new URLSearchParams({ ad: slug });
  const w = Number(spec.w) || 0;
  const h = Number(spec.h) || 0;
  const gtm = gwdGtmId();
  if (w) q.set("w", String(w));
  if (h) q.set("h", String(h));
  if (gtm) q.set("gtm", gtm);
  return `/gtm.html?${q}`;
}

export function gwdGtmPreviewUrl(item, spec = gwdLightFromCombo(item)) {
  const path = gwdGtmPreviewPath(item, spec);
  return path ? `${gwdServeOrigin()}${path}` : "";
}

function gwdSnippetImgHref(spec) {
  if (!spec?.img) return "";
  return spec.img ? gwdServeUrl(gtmImgRel(spec)) : "";
}

export function gwdPublicFiles(item, spec = gwdLightFromCombo(item)) {
  const slug = gwdLightSlug(item, spec);
  return {
    kit: ["ad-play.css", "gwd-shell.js", "env-neutral.hdr"],
    glb: gwdLightGlbName(spec),
    img: spec.img || "",
    iframe: `${slug}.html`,
    snippet: `${slug}-gwd-snippet.html`,
  };
}

function gwdApiOrigin() {
  if (typeof location !== "undefined" && /^https?:$/i.test(location.protocol) && location.origin && location.origin !== "null") {
    return location.origin;
  }
  return gwdServeOrigin();
}

async function gwdHeadOk(path) {
  try {
    const res = await fetch(`${gwdApiOrigin()}/${String(path).replace(/^\/+/, "")}`, {
      method: "HEAD",
      cache: "no-store",
      signal: AbortSignal.timeout(1500),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function gwdCheckPublic(item) {
  const spec = gwdLightFromCombo(item);
  const files = gwdPublicFiles(item, spec);
  const kit = {};
  for (const name of files.kit) kit[name] = await gwdHeadOk(`public/gwd/${name}`);
  const glbGwd = await gwdHeadOk(gwdClimaxRel(spec));
  const glbLegacy = glbGwd ? false : await gwdHeadOk(`public/gtm/${files.glb}`);
  return {
    files,
    kit,
    glb: glbGwd || glbLegacy,
    glbPath: glbGwd || !glbLegacy ? gwdClimaxRel(spec) : `public/gtm/${files.glb}`,
    img: files.img ? await gwdHeadOk(gtmImgRel(spec)) : true,
    iframe: await gwdHeadOk(`public/iframe/${files.iframe}`),
    snippet: await gwdHeadOk(`public/iframe/${files.snippet}`),
  };
}

export function gwdPublicStatusText(status) {
  if (!status?.files) return "";
  const { files } = status;
  const lines = files.kit.map((name) => `${status.kit?.[name] ? "ok   " : "falta"}  public/gwd/${name}`);
  lines.push(`${status.glb ? "ok   " : "falta"}  ${status.glbPath || `public/gwd/${files.glb}`}`);
  if (files.img) lines.push(`${status.img ? "ok   " : "falta"}  public/gtm/${files.img}`);
  lines.push(`${status.iframe ? "ok   " : "falta"}  public/iframe/${files.iframe}`);
  lines.push(`${status.snippet ? "ok   " : "falta"}  public/iframe/${files.snippet}`);
  lines.push(`iframe  ${gwdServeUrl(`public/iframe/${files.iframe}`)}`);
  lines.push(`gtm     ${gwdServeOrigin()}/gtm.html?ad=${files.iframe.replace(/\.html$/i, "")}`);
  return lines.join("\n");
}

export async function gwdCheckNativePublic(item) {
  const spec = item ? gwdLightFromCombo(item) : {};
  const files = ["index.html", "babylon-ads-player.js", "ad-play.css"];
  const kit = {};
  for (const name of files) kit[name] = await gwdHeadOk(`public/player/${name}`);
  const extra = [];
  if (spec.file) extra.push({ path: gtmMeshRel(spec), ok: await gwdHeadOk(gtmMeshRel(spec)) });
  if (spec.img) extra.push({ path: gtmImgRel(spec), ok: await gwdHeadOk(gtmImgRel(spec)) });
  return { files, kit, extra, href: gwdServeUrl("public/player/index.html") };
}

export function gwdNativePublicStatusText(status) {
  if (!status?.files) return "";
  const lines = status.files.map((name) => `${status.kit?.[name] ? "ok   " : "falta"}  public/player/${name}`);
  for (const row of status.extra || []) lines.push(`${row.ok ? "ok   " : "falta"}  ${row.path}`);
  lines.push(`player  ${status.href}`);
  return lines.join("\n");
}

function bytesToBase64(bytes) {
  let bin = "";
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) {
    bin += String.fromCharCode(...bytes.subarray(i, i + step));
  }
  return btoa(bin);
}

function gwdLivePreviewScript() {
  const href = `${gwdApiOrigin()}/gwd/light.js?v=${GWD_KIT_V}`;
  return `<script type="module">
    import { applyGwdModelView, applyGwdStageLayers, gwdLightFromCombo } from ${JSON.stringify(href)};
    window.addEventListener("message", (ev) => {
      if (ev.origin !== location.origin) return;
      if (!ev.data) return;
      if (ev.data.type === "gwd-pause" || ev.data.type === "gwd-resume") {
        const on = ev.data.type === "gwd-pause";
        const box = document.querySelector(".ad-container");
        if (box) {
          box.dataset.gwdPaused = on ? "1" : "0";
          box.classList.toggle("is-paused", on);
        }
        const view = document.querySelector("model-viewer, gwd-3d-model-viewer");
        try { on ? view?.pause() : view?.play(); } catch { /* 1.6 */ }
        return;
      }
      if (ev.data.type !== "gwd-live" || !ev.data.item) return;
      const live = gwdLightFromCombo(ev.data.item);
      const box = document.querySelector(".ad-container");
      const view = document.querySelector("model-viewer, gwd-3d-model-viewer");
      if (view) applyGwdModelView(view, live);
      else if (box) applyGwdStageLayers(box, live);
    });
  </script>`;
}

function gwdModelViewerUrl() {
  return `${gwdApiOrigin()}/gwd/vendor/model-viewer.min.js?v=${GWD_KIT_V}`;
}

function gwdLivePreviewAssets() {
  const origin = gwdApiOrigin();
  return {
    css: `${origin}/ad-play.css?v=${GWD_KIT_V}`,
    shell: `${origin}/gwd/shell.js?v=${GWD_KIT_V}`,
    modelViewer: gwdModelViewerUrl(),
  };
}

export function gwdIframeHtml(item, spec = gwdLightFromCombo(item), opts = {}) {
  if (!spec?.ok) return "";
  const format = formatById(item?.ad);
  const liveMode = Boolean(opts.live);
  const scene = spec.kind === "scene" || isGwdScenePlay(spec.play);
  const glb = scene
    ? ""
    : opts.glb || (liveMode ? gwdLiveFileUrl(gwdClimaxRel(spec)) : gwdPublishedGlbUrl(spec));
  const gtm = opts.includeGtm === false ? "" : gwdGtmId();
  const live = gwdLivePreviewAssets();
  const cssHref = liveMode ? live.css : gwdKitUrl("ad-play.css");
  const cssTag = opts.cssText
    ? `<style>${String(opts.cssText).replace(/<\/style/gi, "<\\/style")}</style>`
    : `<link rel="stylesheet" href="${cssHref}" />`;
  const shellSrc = liveMode ? live.shell : gwdKitUrl("gwd-shell.js");
  const viewer = scene
    ? gwdSceneMarkup(spec.play)
    : `<div class="ad-stage"><model-viewer id="view" src="${glb}" camera-controls autoplay animation-name="climax" interaction-prompt="none" loading="eager" reveal="auto" ${gwdViewerTagAttrs(spec, { live: liveMode })}></model-viewer></div>`;
  const imgHref = liveMode && spec.img
    ? (/^https?:\/\//i.test(adImageSrc(spec.img))
      ? adImageSrc(spec.img)
      : `${gwdApiOrigin()}/${String(adImageSrc(spec.img)).replace(/^\/+/, "")}`)
    : gwdSnippetImgHref(spec);
  const canvas2d = isCanvas2DPlay(spec.play);
  const play2dSrc = canvas2d && liveMode ? `${gwdApiOrigin()}/play-2d.js?v=${GWD_KIT_V}` : "";
  const mvSrc = liveMode ? live.modelViewer : gwdKitUrl("model-viewer.min.js");
  const mvScript = scene
    ? (play2dSrc ? `<script type="module" src="${play2dSrc}" crossorigin></script>` : "")
    : `<script type="module" src="${mvSrc}" crossorigin></script>`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="ad.size" content="width=${format.w},height=${format.h}" />
  <title>${item.alias || spec.file || "GWD iframe"}</title>
  ${gwdGtmHeadHtml(gtm)}
  ${cssTag}
  <style>
    html, body { width: 100%; height: 100%; margin: 0; }
    body.player-embed .ad-container canvas { display: none; }
    body.player-embed .ad-container canvas.ad-gwd-canvas,
    body.player-embed .ad-container #webgl-canvas { display: block; }
  </style>
  ${mvScript}
</head>
<body class="player-embed gwd-unit">
${gwdGtmBodyHtml(gtm)}
${gwdLightInner(item, spec, viewer, { imgHref }).trim()}
  <script src="${shellSrc}"></script>
  ${liveMode ? gwdLivePreviewScript() : ""}
</body>
</html>
`;
}

export async function gwdPublishPublic(item, opts = {}) {
  if (opts.host === "native") {
    const spec = gwdLightFromCombo(item);
    const slug = gwdLightSlug(item, spec);
    const origin = opts.origin || gwdServeOrigin();
    const profileId = opts.profileId || "";
    const payload = {
      iframeName: `${slug}-native.html`,
      iframeHtml: gwdNativePublicAdHtml(item, spec, origin, profileId),
      snippetName: `${slug}-gwd-native.html`,
      snippetHtml: gwdNativePasteSnippet(item, spec, origin, profileId),
      imgName: spec.img || "",
    };
    if (spec.file && spec.src && !(await gwdHeadOk(gtmMeshRel(spec)))) {
      payload.glbName = spec.file;
      payload.glbFolder = "gtm";
      payload.glbBase64 = bytesToBase64(await fetchBytesFromUrl(spec.src));
    }
    const res = await fetch(`${gwdApiOrigin()}/api/gwd-publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || "Reiniciá npm start para publicar en public/");
    }
    return data;
  }
  const spec = gwdLightFromCombo(item);
  if (!spec.ok || spec.kind === "scene") throw new Error("Ese clímax no tiene GLB.");
  const files = gwdPublicFiles(item, spec);
  const payload = {
    iframeName: files.iframe,
    iframeHtml: gwdIframeHtml(item, spec),
    snippetName: files.snippet,
    snippetHtml: gwdPasteSnippet(item, spec),
    imgName: files.img,
  };
  if (!(await gwdHeadOk(gwdClimaxRel(spec)))) {
    payload.glbName = files.glb;
    payload.glbFolder = "gwd";
    if (!(await gwdHeadOk(`public/gtm/${files.glb}`))) {
      payload.glbBase64 = bytesToBase64(await bakeClimaxForGwd(spec, item.propAct || "drop"));
    }
  }
  const res = await fetch(`${gwdApiOrigin()}/api/gwd-publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    throw new Error(data.error || "Reiniciá npm start para publicar en public/");
  }
  return data;
}

function gwdFormatShape(format) {
  const ratio = format.w / format.h;
  if (ratio >= 2.4) return "wide";
  if (ratio <= 0.55) return "tall";
  return "rect";
}

/** Cámara y fondo: misma cuenta que el player (radio wide/tall + FOV en radianes). */
function gwdFramingFromCombo(item, format) {
  const shape = gwdFormatShape(format);
  const pcam = Number(normalizePropCam(item?.pcam));
  const radius = shape === "wide" ? pcam * 0.85 : shape === "tall" ? pcam * 1.12 : pcam;
  const fovRad = shape === "wide" ? 0.4 : shape === "tall" ? 0.48 : 0.52;
  const axis = (n) => Math.min(2.4, Math.max(0.18, Number(n) || 0.72));
  const sx = axis(item?.psx);
  const sy = axis(item?.psy);
  const sz = axis(item?.psz);
  const spinH = Number(normalizePropSpin(item?.prh));
  const spinV = Number(normalizePropSpin(item?.prv));
  return {
    shape,
    radius,
    fov: `${((fovRad * 180) / Math.PI).toFixed(1)}deg`,
    scale: (sx + sy + sz) / 3,
    scaleX: sx,
    scaleY: sy,
    scaleZ: sz,
    spinH,
    spinV,
    orient: `${spinV}deg ${spinH}deg 0deg`,
    stage: String(item?.pal?.fog || item?.studio?.worldCol || "#f5f2ed"),
  };
}

export function gwdLightFromCombo(item) {
  const play = playById(item?.play);
  const format = formatById(item?.ad);
  const file = String(item?.pmesh?.assetId || "").replace(/^folder:/, "") || item?.pmesh?.name || "";
  const src = file ? playerUrl(`assets/3d/${file}`, `/assets/3d/${encodeURIComponent(file)}`) : "";
  const pan = normalizePropCamMode(item?.pcm) === "pan";
  const h = pan ? 0 : Number(item?.pch || 0);
  const v = pan ? 0 : Number(item?.pcv || 0);
  const frame = gwdFramingFromCombo(item, format);
  const px = Number(normalizePropCamPan(item?.ppx));
  const py = Number(normalizePropCamPan(item?.ppy));
  const world = Number(item?.studio?.world ?? 0.7);
  const fill = Math.min(STUDIO_CHANNEL_MAX, Math.max(STUDIO_CHANNEL_MIN, Number(item?.studio?.fill ?? 0.42)));
  const rim = Math.min(STUDIO_CHANNEL_MAX, Math.max(STUDIO_CHANNEL_MIN, Number(item?.studio?.rim ?? 0.2)));
  const exposure = Number(item?.studio?.exposure ?? 1) * (0.62 + Math.min(1, world / STUDIO_CHANNEL_MAX) * 0.38);
  const shadow = Math.min(1, Math.max(0, Number(item?.studio?.key ?? 0.55)));
  const soft = Math.round(Math.min(1, fill) * 100) / 100;
  const flat = normalizePropFlat(item?.pflat) === "1";
  const floor = normalizePropFloor(item?.pfloor) === "1";
  const cog = normalizePropCog(item?.pcog) === "1";
  const env = "";
  const key = Math.min(STUDIO_CHANNEL_MAX, Math.max(STUDIO_CHANNEL_MIN, Number(item?.studio?.key ?? 0.55)));
  const spec = {
    ok: play.id === "prop" ? Boolean(src) : true,
    kind: play.id === "prop" ? "mesh" : "scene",
    play: play.id,
    file,
    src,
    w: format.w,
    h: format.h,
    pan,
    orbit: `${h}deg ${Math.min(175, Math.max(5, 75 + v))}deg ${frame.radius}m`,
    target: pan
      ? `${(-px).toFixed(2)}m ${(0.35 + py).toFixed(2)}m 0m`
      : cog
        ? "auto"
        : "0m 0m 0m",
    fov: frame.fov,
    scale: frame.scale,
    scaleX: frame.scaleX,
    scaleY: frame.scaleY,
    scaleZ: frame.scaleZ,
    spinH: frame.spinH,
    spinV: frame.spinV,
    orient: frame.orient,
    radius: frame.radius,
    flat,
    floor,
    cog,
    env,
    fill,
    rim,
    fillCol: String(item?.studio?.fillCol || "#ebf2ff"),
    rimCol: String(item?.studio?.rimCol || "#d9e6ff"),
    keyCol: String(item?.studio?.keyCol || "#fff7eb"),
    key,
    floorCol: String(item?.pal?.floor || "#3a2a1c"),
    aimMode: "none",
    aimCol: "#fff0d1",
    aimGain: 0,
    aimX: 50,
    aimY: 22,
    aimSize: 1,
    extras: [],
    inId: transitionById(item?.in).id,
    preset: String(item?.studio?.preset || "catalog"),
    soft: String(soft),
    stage: frame.stage,
    exposure: String(Math.min(STUDIO_EXPOSURE_MAX, Math.max(STUDIO_EXPOSURE_MIN, exposure))),
    shadow: String(Math.round(shadow * 100) / 100),
    autoRotate: item?.propAct === "turn",
    handoff: handoffById(item?.hand).id,
    img: normalizeAdImg(livePlaceFrom(item).img),
  };
  return applyGwdGaps(spec, item);
}

function gwdPalInner() {
  return `<i class="ad-prop-pal-stand"></i><i class="ad-prop-pal-object"></i><i class="ad-prop-pal-ball"></i><i class="ad-prop-pal-beam"></i><i class="ad-prop-pal-star"></i>`;
}

function gwdPalMarkup(spec) {
  return `<div class="ad-prop-pal" data-pal-act="${spec?.palAct || "drop"}" aria-hidden="true">${gwdPalInner()}</div>`;
}

function gwdAimMarkup(aimMode) {
  const mode = aimMode || "none";
  const n = mode === "multi" ? 3 : mode === "spot" ? 1 : 0;
  const beams = Array.from({ length: n }, (_, i) => `<i class="ad-prop-aim-beam" style="--i:${i}"></i>`).join("");
  return `<div class="ad-prop-aim" data-aim="${mode}"${mode === "none" ? " hidden" : ""} aria-hidden="true">${beams}</div>`;
}

function gwdExtrasMarkup(list = [], envLit = false) {
  if (!list.length || envLit) return `<div class="ad-prop-extras" hidden></div>`;
  const wash = envLit ? 0 : 1;
  return `<div class="ad-prop-extras" aria-hidden="true">${list.map((ex) =>
    `<i class="ad-prop-extra" data-place="${ex.place || "frente"}" style="--gwd-x:${ex.x}%;--gwd-y:${ex.y}%;--gwd-x-col:${ex.col};--gwd-x-i:${ex.i * wash}"></i>`
  ).join("")}</div>`;
}

function applyGwdSceneVars(host, spec) {
  const ms = Number(spec?.bodyMs);
  if (ms > 0) {
    host.dataset.gwdBodyMs = String(ms);
    host.style.setProperty("--gwd-body-ms", `${ms}ms`);
  }
  const pal = spec?.scene;
  if (!pal || typeof pal !== "object") return;
  host.dataset.pal = encodeURIComponent(JSON.stringify(pal));
  for (const [key, value] of Object.entries(pal)) {
    if (value) host.style.setProperty(`--gwd-sc-${key}`, value);
  }
}

export function applyGwdStageLayers(host, spec) {
  if (!host?.style || !spec) return;
  host.style.setProperty("--gwd-stage", spec.stage);
  host.style.setProperty("--gwd-prop-sx", String(spec.scaleX ?? spec.scale ?? 1));
  host.style.setProperty("--gwd-prop-sy", String(spec.scaleY ?? spec.scale ?? 1));
  host.style.setProperty("--gwd-prop-sz", String(spec.scaleZ ?? spec.scale ?? 1));
  host.style.setProperty("--gwd-fill", spec.fillCol || "#ebf2ff");
  host.style.setProperty("--gwd-rim", spec.rimCol || "#d9e6ff");
  const wash = spec.envLit ? 0 : 1;
  host.style.setProperty("--gwd-fill-i", String((spec.fill ?? 0) * wash));
  host.style.setProperty("--gwd-rim-i", String((spec.rim ?? 0) * wash));
  host.style.setProperty("--gwd-key", spec.keyCol || "#fff7eb");
  host.style.setProperty("--gwd-key-i", String((spec.key ?? 0.55) * wash));
  host.style.setProperty("--gwd-world", spec.worldCol || "#ede8e0");
  host.style.setProperty("--gwd-world-i", String((spec.worldI ?? spec.world ?? 0.7) * wash));
  host.style.setProperty("--gwd-floor", spec.floorCol || "#3a2a1c");
  host.style.setProperty("--gwd-floor-x", spec.floorX || "50%");
  host.style.setProperty("--gwd-floor-y", spec.floorY || "4%");
  host.style.setProperty("--gwd-floor-w", spec.floorW || "80%");
  host.style.setProperty("--gwd-aim", spec.aimCol || "#fff0d1");
  host.style.setProperty("--gwd-aim-i", String(spec.aimGain ?? 0));
  host.style.setProperty("--gwd-aim-x", `${spec.aimX ?? 50}%`);
  host.style.setProperty("--gwd-aim-y", `${spec.aimY ?? 28}%`);
  host.style.setProperty("--gwd-aim-s", String(spec.aimSize ?? 1));
  host.style.setProperty("--gwd-pal-stand", spec.palStand || "#3a3a3e");
  host.style.setProperty("--gwd-pal-object", spec.palObject || "#dbc7a8");
  host.style.setProperty("--gwd-pal-ball", spec.palBall || "#d1472e");
  host.style.setProperty("--gwd-pal-beam", spec.palBeam || "#ffe8b8");
  host.style.setProperty("--gwd-pal-star", spec.palStar || "#ffe566");
  applyGwdSceneVars(host, spec);
  host.dataset.propFloor = spec.floor ? "1" : "0";
  host.dataset.propFlat = spec.flat ? "1" : "0";
  host.dataset.propCog = spec.cog ? "1" : "0";
  host.dataset.propCamMode = spec.pan ? "pan" : "orbit";
  if (spec.orbit) host.dataset.gwdOrbit = spec.orbit;
  if (spec.fov) host.dataset.gwdFov = spec.fov;
  if (spec.radius != null && spec.radius !== "") host.dataset.gwdRadius = String(spec.radius);
  if (spec.target) host.dataset.gwdTarget = spec.target;
  else delete host.dataset.gwdTarget;
  if (spec.orient) host.dataset.gwdOrient = spec.orient;
  else delete host.dataset.gwdOrient;
  host.dataset.propSx = String(spec.scaleX ?? spec.scale ?? 1);
  host.dataset.propSy = String(spec.scaleY ?? spec.scale ?? 1);
  host.dataset.propSz = String(spec.scaleZ ?? spec.scale ?? 1);
  host.dataset.propAim = spec.aimMode || "none";
  if (spec.palAct) host.dataset.propAct = spec.palAct;
  host.dataset.palObject = spec.palObjectOn ? "1" : "0";
  host.dataset.palBall = spec.palBallOn ? "1" : "0";
  host.dataset.palBeam = spec.palBeamOn ? "1" : "0";
  host.dataset.palStar = spec.palStarOn ? "1" : "0";
  host.dataset.gwdExposure = spec.exposure || "1";
  host.dataset.gwdShadow = spec.shadow || "0";
  host.dataset.gwdSoft = spec.soft || "0.4";
  if (spec.lights) host.dataset.gwdLights = encodeURIComponent(JSON.stringify(spec.lights));
  else delete host.dataset.gwdLights;
  let aim = host.querySelector(".ad-prop-aim");
  if (!aim) {
    aim = document.createElement("div");
    aim.className = "ad-prop-aim";
    aim.setAttribute("aria-hidden", "true");
    host.append(aim);
  }
  const mode = spec.aimMode || "none";
  aim.dataset.aim = mode;
  aim.hidden = mode === "none";
  const n = mode === "multi" ? 3 : mode === "spot" ? 1 : 0;
  if (aim.querySelectorAll(".ad-prop-aim-beam").length !== n) {
    aim.innerHTML = Array.from({ length: n }, (_, i) => `<i class="ad-prop-aim-beam" style="--i:${i}"></i>`).join("");
  }
  let extras = host.querySelector(".ad-prop-extras");
  if (!extras) {
    extras = document.createElement("div");
    extras.className = "ad-prop-extras";
    extras.setAttribute("aria-hidden", "true");
    host.append(extras);
  }
  extras.hidden = !spec.extras?.length || Boolean(spec.envLit);
  const extraWash = spec.envLit ? 0 : 1;
  extras.innerHTML = (spec.extras || []).map((ex) =>
    `<i class="ad-prop-extra" data-place="${ex.place || "frente"}" style="--gwd-x:${ex.x}%;--gwd-y:${ex.y}%;--gwd-x-col:${ex.col};--gwd-x-i:${ex.i * extraWash}"></i>`
  ).join("");
  let pal = host.querySelector(".ad-prop-pal");
  if (!pal) {
    pal = document.createElement("div");
    pal.className = "ad-prop-pal";
    pal.setAttribute("aria-hidden", "true");
    host.append(pal);
  }
  pal.dataset.palAct = spec.palAct || "drop";
  if (!pal.querySelector(".ad-prop-pal-object")) pal.innerHTML = gwdPalInner();
}

function gwdInnerModelViewer(el) {
  if (!el) return null;
  if (String(el.tagName).toLowerCase() === "model-viewer") return el;
  return el.querySelector?.("model-viewer") || null;
}

function setGwdEnvAttr(el, url) {
  if (!url) {
    el.removeAttribute("environment-image");
    try { el.environmentImage = ""; } catch { /* 1.6 */ }
    return;
  }
  el.setAttribute("environment-image", url);
  try { el.environmentImage = url; } catch { /* 1.6 */ }
}

function pinGwdEnv(el, spec, host) {
  const inner = gwdInnerModelViewer(el);
  const packed = host?.dataset.gwdLights || (spec.lights ? encodeURIComponent(JSON.stringify(spec.lights)) : "");
  if (packed && host?._gwdLightsPainted === packed && host._gwdEnvBlob) {
    const keep = `${host._gwdEnvBlob}#.hdr`;
    if (el.getAttribute("environment-image") !== keep) setGwdEnvAttr(el, keep);
    if (inner && inner !== el && inner.getAttribute("environment-image") !== keep) setGwdEnvAttr(inner, keep);
    return;
  }
  const url = spec.lights ? paintStudioEnv(spec.lights) : spec.env || "";
  const prev = host?._gwdEnvBlob || el._gwdEnvBlob || "";
  setGwdEnvAttr(el, url);
  if (inner && inner !== el) setGwdEnvAttr(inner, url);
  const blob = url.startsWith("blob:") ? url.split("#")[0] : "";
  if (prev && prev !== blob) {
    try { URL.revokeObjectURL(prev); } catch { /* already gone */ }
  }
  el._gwdEnvBlob = blob;
  if (host) {
    host._gwdEnvBlob = blob;
    host._gwdLightsPainted = packed;
  }
}

function applyGwdModelViewNode(el, spec) {
  if (!el || !spec?.ok) return;
  el.setAttribute("camera-orbit", spec.orbit);
  el.cameraOrbit = spec.orbit;
  el.setAttribute("field-of-view", spec.fov);
  el.setAttribute("min-field-of-view", spec.fov);
  el.setAttribute("max-field-of-view", spec.fov);
  el.setAttribute("min-camera-orbit", `auto auto ${spec.radius}m`);
  el.setAttribute("max-camera-orbit", `auto auto ${spec.radius}m`);
  if ("fieldOfView" in el) el.fieldOfView = spec.fov;
  if ("interpolationDecay" in el) el.interpolationDecay = 0;
  if (spec.orient) {
    el.setAttribute("orientation", spec.orient);
    el.orientation = spec.orient;
  }
  if (spec.target && spec.target !== "auto") {
    el.setAttribute("camera-target", spec.target);
    el.cameraTarget = spec.target;
  } else {
    el.removeAttribute("camera-target");
    if ("cameraTarget" in el) el.cameraTarget = "auto";
  }
  el.setAttribute("exposure", spec.exposure);
  el.exposure = spec.exposure;
  el.setAttribute("shadow-intensity", spec.shadow);
  el.shadowIntensity = spec.shadow;
  if (spec.soft != null) {
    el.setAttribute("shadow-softness", spec.soft);
    el.shadowSoftness = spec.soft;
  }
  const meshScale = spec.scaleAttr || `${spec.scaleX ?? 1} ${spec.scaleY ?? 1} ${spec.scaleZ ?? 1}`;
  el.setAttribute("scale", meshScale);
  try { el.scale = meshScale; } catch { /* 1.6 */ }
  el.style.setProperty("background", spec.stage);
  el.style.setProperty("--poster-color", spec.stage);
  el.jumpCameraToGoal?.();
}

export function applyGwdModelView(el, spec) {
  if (!el || !spec?.ok) return;
  const host = el.closest?.(".ad-container") || el.parentElement;
  applyGwdStageLayers(host, spec);
  applyGwdModelViewNode(el, spec);
  const inner = gwdInnerModelViewer(el);
  if (inner && inner !== el) applyGwdModelViewNode(inner, spec);
  pinGwdEnv(el, spec, host);
}

export function gwdViewerTagAttrs(spec, opts = {}) {
  const bits = [
    `camera-orbit="${spec.orbit}"`,
    `field-of-view="${spec.fov}"`,
    `min-field-of-view="${spec.fov}"`,
    `max-field-of-view="${spec.fov}"`,
    `min-camera-orbit="auto auto ${spec.radius}m"`,
    `max-camera-orbit="auto auto ${spec.radius}m"`,
    `exposure="${spec.exposure}"`,
    `shadow-intensity="${spec.shadow}"`,
    `shadow-softness="${spec.soft || "0.4"}"`,
    `autoplay-duration="12"`,
    `scale="${spec.scaleAttr || `${spec.scaleX ?? 1} ${spec.scaleY ?? 1} ${spec.scaleZ ?? 1}`}"`,
  ];
  if (spec.target && spec.target !== "auto") bits.push(`camera-target="${spec.target}"`);
  if (spec.orient) bits.push(`orientation="${spec.orient}"`);
  if (spec.env && !/^(data:|blob:)/i.test(spec.env)) bits.push(`environment-image="${spec.env}"`);
  bits.push(`style="background:${spec.stage};--poster-color:${spec.stage}"`);
  return bits.join(" ");
}

export function gwdLightSlug(item, spec = gwdLightFromCombo(item)) {
  return String(item?.alias || spec.file || "gwd-light")
    .replace(/\.glb$/i, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "gwd-light";
}

function gwdSceneCss(spec) {
  const bits = [`--gwd-body-ms:${Number(spec?.bodyMs) || 2400}ms`];
  const pal = spec?.scene;
  if (pal && typeof pal === "object") {
    for (const [key, value] of Object.entries(pal)) {
      if (value) bits.push(`--gwd-sc-${key}:${value}`);
    }
  }
  return bits.join(";");
}

export function gwdPlayMarkup(item, spec = gwdLightFromCombo(item), opts = {}) {
  const extras = opts.extras || comboPlayExtras(item);
  const format = formatById(item?.ad);
  const ph = extras.ph;
  const play = item.play || "prop";
  const inId = spec.inId || transitionById(item?.in).id;
  const hand = handoffById(extras.handoff ?? item?.hand).id;
  const handSet = handoffSettingsFrom(extras);
  const fade = Math.max(280, Math.round((Number(handSet.hms) - Number(handSet.hhd)) / Number(handSet.hnb)));
  const imgHref = opts.imgHref !== undefined ? opts.imgHref : spec.img;
  const viewerHtml = opts.viewerHtml || "";
  const shot = imgHref
    ? `<div class="ad-ph-art"><img class="ad-ph-shot" src="${imgHref}" alt="" style="${adPlaceFitStyle(ph)}"></div>`
    : `<div class="ad-ph-art"></div>`;
  const claim = escapeHandoffClaim(resolveHandoffClaim(extras, format));
  return `<aside class="ad-slot" data-in="${inId}" data-play="${play}" style="--ad-w:${format.w}px;--ad-h:${format.h}px;--ad-ratio:${format.w} / ${format.h}">
  <div class="ad-frame">
    <div id="gwd-play" class="ad-container" data-prop-ms="${spec.bodyMs || propActionMs(item.propAct)}" data-gwd-body-ms="${spec.bodyMs || propActionMs(item.propAct)}" data-prop-act="${item.propAct || "drop"}" data-play="${play}"${spec.scene ? ` data-pal="${encodeURIComponent(JSON.stringify(spec.scene))}"` : ""} data-prop-flat="${spec.flat ? "1" : "0"}" data-prop-floor="${spec.floor ? "1" : "0"}" data-prop-cog="${spec.cog ? "1" : "0"}" data-prop-aim="${spec.aimMode || "none"}" data-pal-object="${spec.palObjectOn ? "1" : "0"}" data-pal-ball="${spec.palBallOn ? "1" : "0"}" data-pal-beam="${spec.palBeamOn ? "1" : "0"}" data-pal-star="${spec.palStarOn ? "1" : "0"}" data-prop-cam-mode="${spec.pan ? "pan" : "orbit"}" data-gwd-orbit="${spec.orbit || ""}" data-gwd-fov="${spec.fov || ""}" data-gwd-radius="${spec.radius || ""}" data-gwd-target="${spec.target || "auto"}" data-gwd-env="${!spec.env || /^(data:|blob:)/i.test(String(spec.env)) ? "" : spec.env}" data-gwd-lights="${spec.lights ? encodeURIComponent(JSON.stringify(spec.lights)) : ""}" data-gwd-soft="${spec.soft || "0.4"}" data-gwd-exposure="${spec.exposure || "1"}" data-gwd-shadow="${spec.shadow || "0"}" data-gwd-orient="${spec.orient || ""}" data-gwd-floor-x="${spec.floorX || "50%"}" data-gwd-floor-y="${spec.floorY || "4%"}" data-gwd-floor-w="${spec.floorW || "80%"}" data-prop-sx="${spec.scaleX ?? 1}" data-prop-sy="${spec.scaleY ?? 1}" data-prop-sz="${spec.scaleZ ?? 1}" data-handoff="${hand}" data-handoff-ms="${handSet.hms}" data-handoff-bands="${handSet.hnb}" data-handoff-stagger="${handSet.hst}" data-handoff-hold="${handSet.hhd}" data-handoff-in="${handSet.hin}" data-handoff-beats="${handSet.hbt}" data-handoff-tempo="${handSet.htm}" style="${adPlaceVars(ph)};--gwd-stage:${spec.stage || "#f5f2ed"};--gwd-prop-sx:${spec.scaleX ?? 1};--gwd-prop-sy:${spec.scaleY ?? 1};--gwd-prop-sz:${spec.scaleZ ?? 1};--gwd-fill:${spec.fillCol || "#ebf2ff"};--gwd-rim:${spec.rimCol || "#d9e6ff"};--gwd-fill-i:${(spec.fill ?? 0) * (spec.envLit ? 0 : 1)};--gwd-rim-i:${(spec.rim ?? 0) * (spec.envLit ? 0 : 1)};--gwd-key:${spec.keyCol || "#fff7eb"};--gwd-key-i:${(spec.key ?? 0.55) * (spec.envLit ? 0 : 1)};--gwd-world:${spec.worldCol || "#ede8e0"};--gwd-world-i:${(spec.worldI ?? spec.world ?? 0.7) * (spec.envLit ? 0 : 1)};--gwd-floor:${spec.floorCol || "#3a2a1c"};--gwd-floor-x:${spec.floorX || "50%"};--gwd-floor-y:${spec.floorY || "4%"};--gwd-floor-w:${spec.floorW || "80%"};--gwd-aim:${spec.aimCol || "#fff0d1"};--gwd-aim-i:${spec.aimGain ?? 0};--gwd-aim-x:${spec.aimX ?? 50}%;--gwd-aim-y:${spec.aimY ?? 28}%;--gwd-aim-s:${spec.aimSize ?? 1};--gwd-pal-stand:${spec.palStand || "#3a3a3e"};--gwd-pal-object:${spec.palObject || "#dbc7a8"};--gwd-pal-ball:${spec.palBall || "#d1472e"};--gwd-pal-beam:${spec.palBeam || "#ffe8b8"};--gwd-pal-star:${spec.palStar || "#ffe566"};--handoff-ms:${handSet.hms}ms;--handoff-bands:${handSet.hnb};--handoff-stagger:${handSet.hst}ms;--handoff-hold:${handSet.hhd}ms;--handoff-rise:${handSet.hin}ms;--handoff-fade:${fade}ms;${gwdSceneCss(spec)}">
      ${viewerHtml}
      <div class="ad-prop-world" aria-hidden="true"></div>
      <div class="ad-prop-floor" aria-hidden="true"></div>
      <div class="ad-prop-key" aria-hidden="true"></div>
      <div class="ad-prop-fill" aria-hidden="true"></div>
      <div class="ad-prop-rim" aria-hidden="true"></div>
      ${gwdAimMarkup(spec.aimMode)}
      ${gwdExtrasMarkup(spec.extras, spec.envLit)}
      ${gwdPalMarkup(spec)}
      <div class="ad-handoff" aria-hidden="true">
        ${handoffBandsMarkup(handSet.hnb, claim)}
      </div>
      <article class="ad-creative" aria-label="Anuncio">
        <div class="ad-ph" data-style="${ph.style}" data-fit="${ph.fit}">
          ${shot}
        </div>
      </article>
    </div>
  </div>
</aside>`;
}

function gwdLightInner(item, spec, viewerHtml, opts = {}) {
  return gwdPlayMarkup(item, spec, { viewerHtml, ...opts });
}

export function gwdLightAdHtml(item, spec = gwdLightFromCombo(item)) {
  const format = formatById(item?.ad);
  const glbName = gwdLightGlbName(spec);
  const viewer = `<div class="ad-stage"><model-viewer id="view" src="${glbName}" camera-controls autoplay animation-name="climax" interaction-prompt="none" ${gwdViewerTagAttrs(spec)}></model-viewer></div>`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="ad.size" content="width=${format.w},height=${format.h}" />
  <title>${item.alias || spec.file || "GWD ligero"}</title>
  <link rel="stylesheet" href="ad-play.css" />
  <style>
    html, body { width: 100%; height: 100%; margin: 0; }
    body.player-embed .ad-container canvas { display: none; }
    body.player-embed .ad-container canvas.ad-gwd-canvas,
    body.player-embed .ad-container #webgl-canvas { display: block; }
  </style>
  <script type="module" src="model-viewer.min.js" crossorigin></script>
</head>
<body class="player-embed gwd-unit">
${gwdLightInner(item, spec, viewer).trim()}
  <script src="gwd-shell.js"></script>
</body>
</html>
`;
}

/** HTML de autor que GWD 16 abre con File → Open. */
export function gwdAuthorHtml(item, spec = gwdLightFromCombo(item)) {
  return gwdPasteSnippet(item, spec);
}

export function gwdWorkspaceJson(spec) {
  return `${JSON.stringify({
    "scope.version": "2",
    "timeline.animationMode": "proMode",
    "viewport.width": spec.w,
    "viewport.height": spec.h,
    "stage.mask": false,
    "library.openDirectories": [],
    "library.GroupsPath": {},
    "library.downloadedAssets": {},
    "design.zoom": 1,
    "design.scrollleft": 0,
    "design.scrolltop": 0,
  })}\n`;
}

function gwdBannerPageCss(format) {
  return `        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0px;
        }

        .gwd-page-container {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .gwd-page-content {
            background-color: transparent;
            transform: none;
            position: absolute;
            transform-style: flat;
        }

        .gwd-page-content * {
            transform-style: flat;
        }

        .gwd-page-wrapper {
            background-color: rgb(255, 255, 255);
            position: absolute;
            transform: translateZ(0px);
        }

        .gwd-page-size {
            width: ${format.w}px;
            height: ${format.h}px;
        }

        gwd-3d-model-viewer,
        .ad-container,
        .ad-container * {
            transform-style: flat;
        }`;
}

export function gwdInsertGuide(item, spec = gwdLightFromCombo(item)) {
  if (!spec?.ok || spec.kind === "scene") return "";
  const glbUrl = gwdPublishedGlbUrl(spec);
  const iframeUrl = gwdServeUrl(`public/iframe/${gwdLightSlug(item, spec)}.html`);
  return `Nuevo proyecto GWD · Banner 3.0 · ${spec.w}×${spec.h} · handoff ${spec.handoff}

Kit en public/gwd (clip horneado + shell). Foto y mesh nativo en public/gtm. Snippet en public/iframe.
Iframe: ${iframeUrl}

1. File → New. Banner. Tamaño ${spec.w} × ${spec.h} px.
2. Arrastrá 3D Model Viewer. Clip climax. O un iframe a la URL de arriba.
3. Code view: snippet (también está en public/iframe). src GLB = ${glbUrl}
4. Botón “Publicar en public/” si falta algún archivo.
5. Guardá en Code view. Preview. Origen: ${gwdServeOrigin()}.`;
}

export function gwdPasteSnippet(item, spec = gwdLightFromCombo(item)) {
  if (!spec?.ok || spec.kind === "scene") return "";
  const format = formatById(item?.ad);
  const glb = gwdPublishedGlbUrl(spec);
  const viewer = `<gwd-3d-model-viewer id="gwd-model" src="${glb}" autoplay animation-name="climax" ${gwdViewerTagAttrs(spec)}></gwd-3d-model-viewer>`;
  const inner = gwdLightInner(item, spec, `<div class="ad-stage">${viewer}</div>`, {
    imgHref: gwdSnippetImgHref(spec),
  }).trim().replace(/^/gm, "                ");
  return `<!DOCTYPE html>
<html class="gwd-unit">

<head>
    <meta charset="utf-8">
    <meta name="generator" content="Google Web Designer 16.4.1.0219">
    <meta name="template" content="Banner 3.0.0">
    <meta name="environment" content="gwd-dv360">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="ad.size" content="width=${format.w},height=${format.h}">
    <link href="gwdpage_style.css" rel="stylesheet" data-version="13" data-exports-type="gwd-page">
    <link href="gwdpagedeck_style.css" rel="stylesheet" data-version="14" data-exports-type="gwd-pagedeck">
    <link href="gwdgooglead_style.css" rel="stylesheet" data-version="9" data-exports-type="gwd-google-ad">
    <link href="gwd3dmodelviewer_style.css" rel="stylesheet" data-version="2" data-exports-type="gwd-3d-model-viewer">
    <link href="${gwdKitUrl("ad-play.css")}" rel="stylesheet">
    <style id="gwd-lightbox-style">
        .gwd-lightbox {
            overflow: hidden;
        }
    </style>
    <style id="gwd-text-style">
        p {
            margin: 0px;
        }

        h1 {
            margin: 0px;
        }

        h2 {
            margin: 0px;
        }

        h3 {
            margin: 0px;
        }
    </style>
    <style>
${gwdBannerPageCss(format)}
    </style>
    <script data-source="gwd_webcomponents_v1_min.js" data-version="2" data-exports-type="gwd_webcomponents_v1" src="gwd_webcomponents_v1_min.js"></script>
    <script data-source="gwdpage_min.js" data-version="13" data-exports-type="gwd-page" src="gwdpage_min.js"></script>
    <script data-source="gwdpagedeck_min.js" data-version="14" data-exports-type="gwd-pagedeck" src="gwdpagedeck_min.js"></script>
    <script data-source="https://s0.2mdn.net/ads/studio/Enabler.js" data-exports-type="gwd-google-ad" src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>
    <script data-source="gwdgooglead_min.js" data-version="9" data-exports-type="gwd-google-ad" src="gwdgooglead_min.js"></script>
    <script data-source="https://ajax.googleapis.com/ajax/libs/model-viewer/1.6.0/model-viewer.min.js" data-exports-type="gwd-3d-model-viewer" type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/1.6.0/model-viewer.min.js"></script>
    <script data-source="gwd3dmodelviewer_min.js" data-version="2" data-exports-type="gwd-3d-model-viewer" src="gwd3dmodelviewer_min.js"></script>
</head>

<body class="player-embed gwd-unit">
    <gwd-google-ad id="gwd-ad" polite-load="">
        <gwd-metric-configuration></gwd-metric-configuration>
        <gwd-pagedeck class="gwd-page-container" id="pagedeck">
            <gwd-page id="page1" class="gwd-page-wrapper gwd-page-size gwd-lightbox" data-gwd-width="${format.w}px" data-gwd-height="${format.h}px">
                <div class="gwd-page-content gwd-page-size">
${inner}
                </div>
            </gwd-page>
        </gwd-pagedeck>
    </gwd-google-ad>
    <script src="${gwdKitUrl("gwd-shell.js")}"></script>
    <script type="text/javascript" id="gwd-init-code">
        ( function() {
            var gwdAd = document.getElementById( 'gwd-ad' );

            function handleDomContentLoaded( event ) {

            }

            function handleWebComponentsReady( event ) {
                requestAnimationFrame( function() {
                    setTimeout( function() {
                        gwdAd.initAd();
                    }, 1 );
                } );
            }

            function handleAdInitialized( event ) {}

            window.addEventListener( 'DOMContentLoaded',
                handleDomContentLoaded, false );
            window.addEventListener( 'WebComponentsReady',
                handleWebComponentsReady, false );
            window.addEventListener( 'adinitialized',
                handleAdInitialized, false );
        } )();
    </script>
</body>

</html>
`;
}

export function gwdViewerSnippet(spec, item) {
  return gwdInsertGuide(item, spec);
}

function fetchSource(path) {
  if (path === "gwd-shell.js") return "gwd/shell.js";
  return path;
}

async function fetchBytes(path) {
  const res = await fetch(fetchSource(path));
  if (!res.ok) throw new Error(`No se pudo leer ${path}`);
  return new Uint8Array(await res.arrayBuffer());
}

async function fetchBytesFromUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`No se pudo leer ${url}`);
  return new Uint8Array(await res.arrayBuffer());
}

function clickDownload(name, data, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export async function gwdDownloadPart(item, kind) {
  const spec = gwdLightFromCombo(item);
  if (!spec.ok || spec.kind === "scene") throw new Error("Ese clímax no tiene GLB.");
  if (kind === "snippet") {
    clickDownload(`${gwdLightSlug(item, spec)}-gwd-snippet.html`, gwdPasteSnippet(item, spec), "text/html");
    return;
  }
  if (kind === "glb") {
    clickDownload(gwdLightGlbName(spec), await bakeClimaxForGwd(spec, item.propAct || "drop"), "model/gltf-binary");
    return;
  }
  if (kind === "rest") {
    const files = [
      { name: "ad-play.css", data: await fetchBytes("ad-play.css") },
      { name: "gwd-shell.js", data: await fetchBytes("gwd-shell.js") },
      { name: "gwd-snippet.html", data: gwdPasteSnippet(item, spec) },
      { name: "LEEME.txt", data: gwdInsertGuide(item, spec) },
      { name: "env-neutral.hdr", data: await fetchBytes("assets/3d/env-neutral.hdr") },
    ];
    if (spec.img) files.push({ name: spec.img, data: await fetchBytes(adImageSrc(spec.img)) });
    clickDownload(`${gwdLightSlug(item, spec)}-gwd-resto.zip`, zipStore(files), "application/zip");
    return;
  }
  throw new Error("Archivo desconocido");
}

function gwdSourceCandidates(src) {
  const urls = [src];
  if (/-optimized\.glb$/i.test(src)) urls.push(src.replace(/-optimized\.glb$/i, "-gwd.glb"));
  else {
    const gwd = src.replace(/\.glb$/i, "-gwd.glb");
    if (gwd !== src) urls.push(gwd);
  }
  return [...new Set(urls)];
}

async function bakeClimaxForGwd(spec, action) {
  let lastErr;
  for (const url of gwdSourceCandidates(spec.src)) {
    try {
      return await bakeClimaxFromUrl(url, action);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr || new Error("No se pudo hornear el GLB");
}

export async function gwdLightExportZip(item) {
  const spec = gwdLightFromCombo(item);
  if (!spec.ok || spec.kind === "scene") throw new Error("Ese clímax no tiene GLB.");
  const slug = gwdLightSlug(item, spec);
  const glbName = gwdLightGlbName(spec);
  const imgName = spec.img;
  const files = [
    { name: `${slug}.html`, data: gwdAuthorHtml(item, spec) },
    { name: "gwd_workspace.json", data: gwdWorkspaceJson(spec) },
    { name: `${slug}_groups_archive`, data: await fetchBytes("gwd-runtime/groups_archive.html") },
    { name: "gwd_webcomponents_v1_min.js", data: await fetchBytes("gwd-runtime/gwd_webcomponents_v1_min.js") },
    { name: "gwd3dmodelviewer_min.js", data: await fetchBytes("gwd-runtime/gwd3dmodelviewer_min.js") },
    { name: "gwd3dmodelviewer_style.css", data: await fetchBytes("gwd-runtime/gwd3dmodelviewer_style.css") },
    { name: "ad-play.css", data: await fetchBytes("ad-play.css") },
    { name: "gwd-shell.js", data: await fetchBytes("gwd-shell.js") },
    { name: "env-neutral.hdr", data: await fetchBytes("assets/3d/env-neutral.hdr") },
    { name: glbName, data: await bakeClimaxForGwd(spec, item.propAct || "drop") },
  ];
  if (imgName) {
    files.push({ name: imgName, data: await fetchBytes(adImageSrc(imgName)) });
  }
  return {
    zip: zipStore(files),
    name: `${slug}-gwd.zip`,
    files: files.map((file) => file.name),
  };
}
