import { loadBanner, applyWaveToDom, startShapePlayer, wavePathD, STORAGE_KEY } from "./ad4-banner.js";
import { playById, resolvePalette, normalizePropLcol, normalizePropLdist, normalizePropLhrot, normalizePropLvrot, normalizePropSpin, normalizePropCam, normalizePropCamH, normalizePropCamV, normalizePropCamMode, normalizePropCamPan, normalizePropCog, propAimPlaceById, handoffById, handoffRuntimeMs, applyHandoffSettings, resolveHandoffTempo, veilHandoffTiming } from "./ad-catalog.js?v=cam18";
import { attachPlay2D, PLAY_2D_MS } from "./play-2d.js";
import { attachStudioLighting, parseStudioState } from "./studio-lights.js";
import { writeClockLook, paintHostClock } from "./ad-clock.js";
import { listFolderAssets, loadAssetFilesForMesh } from "./ad-assets.js";
import { propActionMs, propPose } from "./prop-climax.js";
import { runHandoff } from "./handoff-run.js";

export const CONFIG = {
  particleCount: 140,
  logoOnHover: true,
  speeds: {
    rain: 1.15,
    cubeSpin: 0.9,
    planetSpin: 0.35,
    textureScroll: 22,
    scrollEase: 8,
  },
  colors: {
    particles: ["#00f0c8", "#6d7cff", "#ff3cac", "#f5f7ff"],
    cubeFaces: ["#00f0c8", "#6d7cff", "#ff3cac", "#ffd166", "#7af7c5", "#4cc9f0"],
    planet: { ocean: "#081428", land: "#00f0c8", cloud: "#6d7cff", glow: "#ff3cac" },
    scroll: { ring: "#6d7cff", core: "#00f0c8", needle: "#ff3cac" },
    clear: [0.02, 0.03, 0.06],
  },
  fpsVisible: 0,
  logicHz: 60,
  logicMaxSteps: 5,
  waterSubdivisions: 180,
  mirrorSize: 768,
  mirrorBlur: 6,
  blitDpr: 2.5,
  dropSegments: 16,
  skySegments: 20,
  propShadow: 512,
  propShadowBlur: 8,
  propSsao: false,
  propFog: 0.018,
  propContact: 1,
  propBounds: 1,
  propLights: "full",
  climaxMs: 2400,
  ...PLAY_2D_MS,
  propMs: 3600,
  preEnterMs: 2100,
  preExitMs: 380,
  adRevealMs: 780,
};

function clampNum(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function applyAnimCost(values = {}) {
  CONFIG.waterSubdivisions = Math.round(clampNum(values.waterSubdivisions, 40, 320, CONFIG.waterSubdivisions));
  CONFIG.mirrorSize = Math.round(clampNum(values.mirrorSize, 256, 2048, CONFIG.mirrorSize));
  CONFIG.mirrorBlur = Math.round(clampNum(values.mirrorBlur, 0, 24, CONFIG.mirrorBlur));
  CONFIG.blitDpr = Math.round(clampNum(values.blitDpr, 1, 3, CONFIG.blitDpr) * 4) / 4;
  CONFIG.fpsVisible = Math.round(clampNum(values.fpsVisible, 0, 60, CONFIG.fpsVisible));
  CONFIG.dropSegments = Math.round(clampNum(values.dropSegments, 6, 48, CONFIG.dropSegments));
  CONFIG.skySegments = Math.round(clampNum(values.skySegments, 8, 48, CONFIG.skySegments));
  CONFIG.propShadow = [0, 256, 512].includes(Number(values.propShadow))
    ? Number(values.propShadow)
    : CONFIG.propShadow;
  CONFIG.propShadowBlur = Math.round(clampNum(values.propShadowBlur, 0, 16, CONFIG.propShadowBlur));
  CONFIG.propSsao = values.propSsao === true;
  CONFIG.propFog = Math.round(clampNum(values.propFog, 0, 0.05, CONFIG.propFog) * 1000) / 1000;
  CONFIG.propContact = values.propContact === 0 || values.propContact === false ? 0 : 1;
  CONFIG.propBounds = [1, 2, 4, 8].includes(Number(values.propBounds))
    ? Number(values.propBounds)
    : CONFIG.propBounds;
  CONFIG.propLights = values.propLights === "simple" ? "simple" : "full";
}

export function getDrawFps() {
  return engine ? Math.round(engine.getFps()) : 0;
}

const ads = new Map();
const PROP_MESH_EXT = new Set([".glb", ".gltf", ".obj"]);
const PROP_SIDE_EXT = new Set([".mtl", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tga", ".bin"]);
const propSources = new Map();
let propCurrent = "";
const propModel = { url: "", name: "", ext: ".glb", file: null, files: [], blobs: [] };

function propFileExt(name) {
  return `.${String(name || "").split(".").pop().toLowerCase()}`;
}

function filesCacheKey(files) {
  return (files || []).map((file) => `${file.name}:${file.size}:${file.lastModified}`).join("|");
}

function emptyPropSource(tag = "") {
  return {
    tag,
    url: "",
    name: "",
    ext: ".glb",
    file: null,
    files: [],
    prepared: { key: "", kind: "", data: null, ready: Promise.resolve(null) },
    warmed: "",
    warmToken: 0,
  };
}

function sourceFromFiles(tag, list) {
  const files = [...(list || [])];
  const mesh = files.find((file) => PROP_MESH_EXT.has(propFileExt(file.name)));
  const src = emptyPropSource(tag);
  if (!mesh) return src;
  src.file = mesh;
  src.files = [mesh, ...files.filter((file) => {
    const ext = propFileExt(file.name);
    return file !== mesh && (PROP_MESH_EXT.has(ext) || PROP_SIDE_EXT.has(ext));
  })];
  src.name = mesh.name;
  src.ext = propFileExt(mesh.name);
  src.url = mesh.name;
  return src;
}

function syncLegacyProp(src) {
  propModel.url = src?.url || "";
  propModel.name = src?.name || "";
  propModel.ext = src?.ext || ".glb";
  propModel.file = src?.file || null;
  propModel.files = src?.files || [];
}

function getPropSource(tag) {
  return tag ? propSources.get(tag) || null : null;
}

function currentPropSource() {
  return getPropSource(propCurrent);
}

function propSourceFor(container) {
  return getPropSource(container?.dataset?.propTag) || currentPropSource();
}

function usePropSource(src) {
  if (!src?.tag) {
    propCurrent = "";
    syncLegacyProp(null);
    return;
  }
  propSources.set(src.tag, src);
  propCurrent = src.tag;
  syncLegacyProp(src);
}

export function getPropModel() {
  const src = currentPropSource();
  return {
    url: src?.url || "",
    name: src?.name || "",
    ext: src?.ext || ".glb",
    extras: (src?.files || []).filter((file) => file !== src.file).map((file) => file.name),
  };
}

export function setPropModelFile(file) {
  return setPropModelFiles(file ? [file] : []);
}

export function setPropModelFiles(list) {
  const files = [...(list || [])];
  const tag = files.length ? `files:${filesCacheKey(files)}` : "";
  if (!tag) {
    propCurrent = "";
    syncLegacyProp(null);
    return getPropModel();
  }
  let src = propSources.get(tag);
  if (!src) {
    src = sourceFromFiles(tag, files);
    propSources.set(tag, src);
    preparePropSourceFor(src);
  }
  usePropSource(src);
  return getPropModel();
}

function preparePropSourceFor(src) {
  if (!src?.file) {
    if (src) src.prepared = { key: "", kind: "", data: null, ready: Promise.resolve(null) };
    return Promise.resolve(null);
  }
  const key = filesCacheKey(src.files);
  if (src.prepared.key === key) return src.prepared.ready;
  const kind = src.ext === ".obj" ? "obj" : src.ext === ".glb" ? "glb" : "gltf";
  const ready = kind === "obj"
    ? src.file.text().then((text) => embedObjSidecars(text, src))
    : kind === "glb"
      ? src.file.arrayBuffer()
      : src.file.text().then((text) => embedGltfSidecars(text, src));
  src.prepared = { key, kind, data: null, ready };
  ready.then((data) => {
    if (src.prepared.key === key) src.prepared.data = data;
  }).catch(() => {});
  return ready;
}

export function preparePropSource() {
  return preparePropSourceFor(currentPropSource());
}

export function comboPropTag(item) {
  if (!item || playById(item.play).id !== "prop" || !item.pmesh) return "";
  return item.pmesh.assetId ? `asset:${item.pmesh.assetId}` : `idb:${item.id}:${item.pmesh.name}`;
}

export async function prepareComboMesh(item, { warmup = true } = {}) {
  const tag = comboPropTag(item);
  if (!item?.pmesh?.assetId) return "";
  let src = getPropSource(tag);
  if (!src) {
    const catalog = await listFolderAssets();
    const asset = catalog.find((entry) => entry.id === item.pmesh.assetId);
    const files = asset ? await loadAssetFilesForMesh(asset, catalog) : [];
    if (!files.length) return "";
    src = sourceFromFiles(tag, files);
    propSources.set(tag, src);
    await preparePropSourceFor(src);
  } else {
    await src.prepared.ready;
  }
  usePropSource(src);
  if (warmup) await warmupPropGpu(tag);
  return tag;
}
const AD4_BANNER = loadBanner();
const AD4_FX = { burst: 0 };
let sharedLoop = null;
let engine = null;
let BABYLON = null;
let observer = null;
let stopShapes = null;
let onResize = null;
const propWarm = { key: "", token: 0, scene: null };

function disposePropWarm() {
  propWarm.token += 1;
  propWarm.key = "";
  if (propWarm.scene && !propWarm.scene.isDisposed) propWarm.scene.dispose();
  propWarm.scene = null;
}

async function compileMeshMaterials(root) {
  const jobs = [];
  for (const mesh of root.getChildMeshes?.() || []) {
    if (!mesh.getTotalVertices?.()) continue;
    const mats = mesh.material?.subMaterials || (mesh.material ? [mesh.material] : []);
    for (const mat of mats) {
      if (!mat?.forceCompilationAsync) continue;
      jobs.push(mat.forceCompilationAsync(mesh).catch(() => {}));
    }
  }
  await Promise.all(jobs);
}

function hexToColor4(hex) {
  const n = String(hex || "").replace("#", "");
  return {
    r: parseInt(n.slice(0, 2), 16) / 255 || 0,
    g: parseInt(n.slice(2, 4), 16) / 255 || 0,
    b: parseInt(n.slice(4, 6), 16) / 255 || 0,
    a: 1,
  };
}

function hexRgb(hex) {
  const c = hexToColor4(hex);
  return [Math.round(c.r * 255), Math.round(c.g * 255), Math.round(c.b * 255)];
}

function rgbHex(hex) {
  return `rgb(${hexRgb(hex).join(",")})`;
}

function rgbaHex(hex, a) {
  const [r, g, b] = hexRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

function rgbCsv(hex) {
  return hexRgb(hex).join(",");
}

function hostPalette(host, playId = host?.dataset.play) {
  return resolvePalette(playId, host?.dataset.pal);
}

function adCanvas(scene) {
  return scene.metadata?.displayCanvas || scene.getEngine().getRenderingCanvas();
}

export function syncAdSize(container) {
  const slot = container.closest(".ad-slot") || container;
  const frame = container.closest(".ad-frame");
  const tw = parseFloat(getComputedStyle(slot).getPropertyValue("--ad-w")) || 300;
  const th = parseFloat(getComputedStyle(slot).getPropertyValue("--ad-h")) || 250;
  const width = Math.max(2, Math.round((frame || slot).clientWidth || slot.getBoundingClientRect().width || tw));
  const height = Math.max(2, Math.round((width * th) / tw));
  if (frame && frame.clientHeight < 2) {
    frame.style.paddingBottom = "0";
    frame.style.height = `${height}px`;
  }
  if (container.clientHeight < 2) container.style.height = `${height}px`;
  const canvas = container.querySelector("canvas");
  if (canvas && canvas.clientHeight < 2) {
    canvas.style.width = "100%";
    canvas.style.height = `${height}px`;
  }
  return { width, height };
}

function waitForBox(el) {
  return new Promise((resolve) => {
    syncAdSize(el);
    const box = el.closest(".ad-frame") || el;
    const ready = () => (el.clientHeight > 1 || box.clientHeight > 1) && (el.clientWidth > 1 || box.clientWidth > 1);
    if (ready()) return resolve();
    const ro = new ResizeObserver(() => {
      syncAdSize(el);
      if (!ready()) return;
      ro.disconnect();
      resolve();
    });
    ro.observe(box);
    setTimeout(() => {
      syncAdSize(el);
      ro.disconnect();
      resolve();
    }, 1200);
  });
}

function canvasAspect(scene) {
  const canvas = adCanvas(scene);
  const w = canvas?.clientWidth || scene.metadata?.w || 300;
  const h = canvas?.clientHeight || scene.metadata?.h || 250;
  return { w, h, aspect: w / Math.max(1, h) };
}

function setupCamera(scene, radius = 3.2) {
  const { aspect } = canvasAspect(scene);
  let r = radius;
  if (aspect > 3) r = Math.min(radius, 2.55);
  if (aspect < 0.55) r = radius * 1.28;
  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI / 2, aspect > 3 ? 1.25 : 1.15, r, BABYLON.Vector3.Zero(), scene);
  camera.lowerRadiusLimit = r;
  camera.upperRadiusLimit = r;
  camera.fov = aspect > 6 ? 0.28 : aspect > 3.5 ? 0.42 : 0.8;
  camera.panningSensibility = 0;
  camera.inputs.clear();
  return camera;
}

function makeGlowTexture(scene) {
  const tex = new BABYLON.DynamicTexture("glow", { width: 64, height: 64 }, scene, false);
  const ctx = tex.getContext();
  const grd = ctx.createRadialGradient(32, 32, 1, 32, 32, 31);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.35, "rgba(180,255,240,0.85)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.arc(32, 32, 31, 0, Math.PI * 2);
  ctx.fill();
  tex.hasAlpha = true;
  tex.update();
  return tex;
}

function logoTargets(count) {
  const pts = [];
  const diamond = [[0, 0.72, 0], [0.42, 0, 0], [0, -0.72, 0], [-0.42, 0, 0]];
  for (let i = 0; i < diamond.length; i++) {
    const a = diamond[i];
    const b = diamond[(i + 1) % diamond.length];
    const steps = Math.floor(count * 0.12);
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0]);
    }
  }
  while (pts.length < count) {
    const ang = (pts.length / count) * Math.PI * 2;
    pts.push([Math.cos(ang) * 0.22, Math.sin(ang) * 0.22, 0]);
  }
  return pts.slice(0, count);
}

function isVisible(id) {
  return Boolean(ads.get(id)?.visible);
}

function bindSkip(container, skip) {
  container.addEventListener("click", skip);
  container.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") skip();
  });
  container.tabIndex = 0;
}

function startHandoff(container, unit) {
  if (unit.handoffTimer) clearTimeout(unit.handoffTimer);
  return runHandoff(container, (id) => {
    unit.handoffTimer = id;
  });
}

function finishClimax(container, unit) {
  if (unit.climax) return;
  unit.climax = true;
  container.classList.add("is-climax");
  startHandoff(container, unit);
}

function resetPlay(container, unit) {
  if (unit.exitTimer) {
    clearTimeout(unit.exitTimer);
    unit.exitTimer = 0;
  }
  if (unit.handoffTimer) {
    clearTimeout(unit.handoffTimer);
    unit.handoffTimer = 0;
  }
  unit.climax = false;
  unit.adIn = false;
  unit.journeyAt = 0;
  unit.clockStarted = 0;
  container.classList.remove("is-climax", "is-pre-exit", "is-ad-in", "is-handoff", "is-handoff-hold", "is-handoff-done");
}

function attachTimedClimax(container, scene, ms) {
  const unit = ads.get(container.id);
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    finishClimax(container, unit);
  };
  bindSkip(container, reveal);
  scene.onBeforeRenderObservable.add(() => {
    if (unit.frozen || unit.paused) return;
    if (!unit.visible) {
      resetPlay(container, unit);
      return;
    }
    if (container.dataset.play === "prop") {
      if (unit.propRewind) return;
      if (typeof unit.propT === "number") {
        if (unit.propT >= 1) reveal();
        return;
      }
    }
    if (!unit.clockStarted) unit.clockStarted = performance.now();
    if (performance.now() - unit.clockStarted >= ms) reveal();
  });
}

function attachPlay(container, scene) {
  if (container.dataset.play === "pre-enter") attachPreEnter(container, scene);
  else if (container.dataset.play === "prop") attachTimedClimax(container, scene, propActionMs(container.dataset.propAct));
  else attachTimedClimax(container, scene, CONFIG.climaxMs);
}

function attachPreEnter(container, scene) {
  const unit = ads.get(container.id);
  if (!unit) return;
  const enterAd = () => {
    if (unit.adIn || unit.exitTimer) return;
    container.classList.add("is-pre-exit");
    const wait = Math.max(CONFIG.preExitMs, startHandoff(container, unit));
    unit.exitTimer = setTimeout(() => {
      unit.exitTimer = 0;
      unit.adIn = true;
      container.classList.add("is-ad-in");
    }, wait);
  };
  bindSkip(container, enterAd);
  scene.onBeforeRenderObservable.add(() => {
    if (unit.frozen || unit.paused) return;
    if (!unit.visible) {
      resetPlay(container, unit);
      return;
    }
    if (!unit.clockStarted) unit.clockStarted = performance.now();
    if (performance.now() - unit.clockStarted >= CONFIG.preEnterMs) enterAd();
  });
}

function easeOut(t) {
  return 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
}

function easeIn(t, p = 3) {
  const k = Math.min(1, Math.max(0, t));
  return k ** p;
}

function easeInOut(t) {
  const k = Math.min(1, Math.max(0, t));
  return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
}

function span(t, a, b) {
  if (b <= a) return t >= b ? 1 : 0;
  return Math.min(1, Math.max(0, (t - a) / (b - a)));
}

export function playDurationMs(play, propAct, hand, handOpts) {
  const reveal = CONFIG.adRevealMs + handoffRuntimeMs(hand, { ...handOpts, play });
  if (play === "pre-enter") return CONFIG.preEnterMs + CONFIG.preExitMs + reveal;
  if (play === "prop") return propActionMs(propAct) + reveal;
  if (play === "horizon" || play === "sundown") {
    return CONFIG.horizonDelayMs + CONFIG.horizonRiseMs + CONFIG.horizonHoldMs + reveal;
  }
  if (play === "storm") return CONFIG.stormBuildMs + CONFIG.stormFlashMs + CONFIG.stormSilenceMs + reveal;
  if (play === "aurora") return CONFIG.auroraDelayMs + CONFIG.auroraRiseMs + CONFIG.auroraHoldMs + reveal;
  if (play === "erupt") return CONFIG.eruptBuildMs + CONFIG.eruptBurstMs + CONFIG.eruptFallMs + CONFIG.eruptRestMs + reveal;
  if (play === "migrate") return CONFIG.migrateDelayMs + CONFIG.migrateFlyMs + CONFIG.migrateRestMs + reveal;
  if (play === "breaker") {
    return CONFIG.breakBuildMs + CONFIG.breakHoldMs + CONFIG.breakCrashMs + CONFIG.breakWashMs + CONFIG.breakRestMs + reveal;
  }
  if (play === "calve") {
    return CONFIG.calveLookMs + CONFIG.calvePeelMs + CONFIG.calveDropMs + CONFIG.calveSplashMs + CONFIG.calveSettleMs + CONFIG.calveRestMs + reveal;
  }
  return CONFIG.climaxMs + reveal;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mixPose(a, b, u) {
  if (!a) return b;
  const out = { ...b };
  for (const key of Object.keys(b)) {
    if (typeof b[key] === "number") out[key] = lerp(a[key] ?? b[key], b[key], u);
  }
  return out;
}

function mix3(a, b, t) {
  return new BABYLON.Color3(lerp(a.r, b.r, t), lerp(a.g, b.g, t), lerp(a.b, b.b, t));
}

function journeyView(scene) {
  const { w, h, aspect } = canvasAspect(scene);
  return { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
}

function paintSkyTexture(tex, pal) {
  const ctx = tex.getContext();
  const grd = ctx.createLinearGradient(0, 0, 0, 512);
  grd.addColorStop(0, pal.skyTop);
  grd.addColorStop(0.42, pal.skyMid);
  grd.addColorStop(0.55, pal.skyHorizon);
  grd.addColorStop(0.68, pal.skyDeep);
  grd.addColorStop(1, pal.skyDeep);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 512, 512);
  const sun = ctx.createRadialGradient(360, 210, 4, 360, 210, 90);
  sun.addColorStop(0, rgbaHex(pal.sun, 0.95));
  sun.addColorStop(0.2, rgbaHex(pal.sun, 0.45));
  sun.addColorStop(1, rgbaHex(pal.sun, 0));
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  for (const cloud of [[120, 160, 90], [210, 140, 70], [400, 170, 80]]) {
    ctx.beginPath();
    ctx.ellipse(cloud[0], cloud[1], cloud[2], cloud[2] * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  tex.update();
}

function makeSkyTexture(scene, pal) {
  const tex = new BABYLON.DynamicTexture("sky", { width: 512, height: 512 }, scene, false);
  paintSkyTexture(tex, pal || resolvePalette("climax"));
  return tex;
}

function waveRing(r, t, speed, width, freq, amp) {
  if (t <= 0) return 0;
  const d = r - t * speed;
  const env = Math.exp(-(d * d) / (width * width)) * Math.exp(-r * 0.12) * Math.exp(-t * 0.2);
  return Math.sin(r * freq - t * 14) * env * amp;
}

function waterHeight(x, z, clock, time, hit) {
  let h = Math.sin(x * 3.2 + clock * 0.9) * Math.sin(z * 2.8 + clock * 0.7) * 0.012;
  if (hit < 0.01) return h;
  const r = Math.hypot(x, z);
  h += waveRing(r, time, 1.7, 0.26, 11, 0.11) * hit;
  h += waveRing(r, time - 0.08, 1.55, 0.18, 18, 0.055) * hit;
  h += waveRing(r, time - 0.16, 1.4, 0.12, 28, 0.028) * hit;
  h += Math.exp(-r * r * 8) * (-0.07) * Math.exp(-time * 1.6) * hit;
  return h;
}

function propCamRadius(host, view) {
  const r = Number(normalizePropCam(host?.dataset.propCam));
  return view.tall ? r * 1.12 : view.wide ? r * 0.85 : r;
}

function propBoxSize(host) {
  const axis = (key) => {
    const n = Number(host?.dataset[key]);
    return Number.isFinite(n) && n > 0 ? Math.min(2.4, Math.max(0.18, n)) : 0.72;
  };
  return { x: axis("propSx"), y: axis("propSy"), z: axis("propSz") };
}

function propImportLocalBounds(node) {
  node.computeWorldMatrix(true);
  const inv = node.getWorldMatrix().clone();
  inv.invert();
  let min = null;
  let max = null;
  for (const mesh of node.getChildMeshes()) {
    if (!mesh.getTotalVertices || mesh.getTotalVertices() < 1) continue;
    if (mesh.name === "__root__") continue;
    mesh.computeWorldMatrix(true);
    try {
      mesh.refreshBoundingInfo(true);
    } catch {
      mesh.refreshBoundingInfo();
    }
    const box = mesh.getBoundingInfo()?.boundingBox;
    if (!box) continue;
    const worlds = box.vectorsWorld || [box.minimumWorld, box.maximumWorld];
    for (const world of worlds) {
      const local = BABYLON.Vector3.TransformCoordinates(world, inv);
      min = min ? BABYLON.Vector3.Minimize(min, local) : local.clone();
      max = max ? BABYLON.Vector3.Maximize(max, local) : local.clone();
    }
  }
  if (!min || !max) {
    const raw = node.getHierarchyBoundingVectors(true);
    const a = BABYLON.Vector3.TransformCoordinates(raw.min, inv);
    const b = BABYLON.Vector3.TransformCoordinates(raw.max, inv);
    min = BABYLON.Vector3.Minimize(a, b);
    max = BABYLON.Vector3.Maximize(a, b);
  }
  return {
    min,
    max,
    center: min.add(max).scale(0.5),
    size: max.subtract(min),
  };
}

function fitPropImport(node, target) {
  node.position.setAll(0);
  node.rotationQuaternion = null;
  node.rotation.setAll(0);
  node.scaling.setAll(1);
  node.computeWorldMatrix(true);
  const ext = propImportLocalBounds(node);
  const longest = Math.max(ext.size.x, ext.size.y, ext.size.z, 0.001);
  const fitScale = target / longest;
  return {
    fitScale,
    half: Math.max(0.08, ext.size.y * fitScale * 0.5),
    center: ext.center.clone(),
  };
}

function propBaseName(name) {
  return String(name || "").split(/[/\\]/).pop();
}

function rewriteAssetRefs(text, filename, url) {
  const base = propBaseName(filename).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(^|\\s)(?:\\./)?(?:\\S*/)?${base}(?=\\s|$)`, "gmi"), `$1${url}`);
}

function fileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function textAsDataUrl(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const byte of bytes) bin += String.fromCharCode(byte);
  return `data:text/plain;base64,${btoa(bin)}`;
}

async function embedObjSidecars(objText, src = currentPropSource()) {
  const files = src?.files || [];
  const lib = objText.match(/^\s*mtllib\s+(\S+)/im);
  if (!lib) return objText.replace(/^\s*mtllib\s+\S+/gim, "");
  const mtlFile = files.find((file) => (
    propBaseName(file.name).toLowerCase() === propBaseName(lib[1]).toLowerCase()
  ));
  if (!mtlFile) return objText.replace(/^\s*mtllib\s+\S+/gim, "");
  let mtlText = await mtlFile.text();
  for (const file of files) {
    const ext = propFileExt(file.name);
    if (file === src.file || file === mtlFile || ext === ".mtl" || ext === ".obj") continue;
    mtlText = rewriteAssetRefs(mtlText, file.name, await fileAsDataUrl(file));
  }
  return objText.replace(/^\s*mtllib\s+\S+/gim, `mtllib ${textAsDataUrl(mtlText)}`);
}

async function ensurePropLoader(ext) {
  if (ext === ".obj") {
    const mod = await import("@babylonjs/loaders/OBJ");
    const Ctor = mod.OBJFileLoader;
    if (Ctor && !BABYLON.SceneLoader.IsPluginForExtensionAvailable(".obj")) {
      BABYLON.SceneLoader.RegisterPlugin(new Ctor());
    }
    return mod;
  }
  const mod = await import("@babylonjs/loaders/glTF");
  const Ctor = mod.GLTFFileLoader;
  if (Ctor && !BABYLON.SceneLoader.IsPluginForExtensionAvailable(".gltf")) {
    BABYLON.SceneLoader.RegisterPlugin(new Ctor());
  }
  return mod;
}

async function loadObjResult(scene, src) {
  const mod = await ensurePropLoader(".obj");
  const objText = await preparePropSourceFor(src);
  return new mod.OBJFileLoader().importMeshAsync(null, scene, objText, "");
}

function sidecarByUri(uri, src) {
  if (!uri || String(uri).startsWith("data:")) return null;
  const base = propBaseName(String(uri).split("?")[0]).toLowerCase();
  return (src?.files || []).find((file) => propBaseName(file.name).toLowerCase() === base) || null;
}

async function embedGltfSidecars(json, src = currentPropSource()) {
  const gltf = JSON.parse(json);
  for (const list of [gltf.buffers, gltf.images]) {
    if (!Array.isArray(list)) continue;
    for (const item of list) {
      const file = sidecarByUri(item.uri, src);
      if (file) item.uri = await fileAsDataUrl(file);
    }
  }
  return gltf;
}

function gltfLoaderData(loader, scene, fileOrView, asBinary) {
  return new Promise((resolve, reject) => {
    const fail = (_, err) => reject(err || new Error("No se pudo leer el glTF"));
    loader.loadFile(scene, fileOrView, "", resolve, undefined, asBinary, fail);
  });
}

async function loadGltfResult(scene, src) {
  const mod = await ensurePropLoader(src.ext);
  const loader = new mod.GLTFFileLoader();
  loader.validate = false;
  const payload = await preparePropSourceFor(src);
  if (src.ext === ".glb") {
    const data = await gltfLoaderData(loader, scene, new Uint8Array(payload), true);
    return loader.importMeshAsync(null, scene, data, "");
  }
  return loader.importMeshAsync(null, scene, { json: structuredClone(payload), bin: null }, "");
}

async function loadPropImport(scene, parent, shadows, src = currentPropSource()) {
  if (!src?.file) return null;
  try {
    const result = src.ext === ".obj"
      ? await loadObjResult(scene, src)
      : await loadGltfResult(scene, src);
    const wrap = new BABYLON.TransformNode("propImport", scene);
    wrap.parent = parent;
    const imported = [...(result.transformNodes || []), ...(result.meshes || [])];
    for (const node of imported) {
      if (!node || node === wrap) continue;
      let top = node;
      while (top.parent && top.parent !== scene && top.parent !== wrap) top = top.parent;
      if (top !== wrap) top.parent = wrap;
    }
    const fitted = fitPropImport(wrap, 0.72);
    for (const light of result.lights || []) light.setEnabled(false);
    tuneImportedMaterials(wrap);
    if (shadows) {
      for (const mesh of wrap.getChildMeshes()) {
        if (mesh.getTotalVertices?.() > 0) {
          shadows.addShadowCaster(mesh);
          mesh.receiveShadows = true;
        }
      }
    }
    return { wrap, half: fitted.half, fitScale: fitted.fitScale, center: fitted.center };
  } catch (err) {
    console.warn("No se pudo cargar el modelo 3D", err);
    return null;
  }
}

function propAimMode(host) {
  const id = host?.dataset.propLight;
  return id === "spot" || id === "multi" ? id : "none";
}

function propAimGain(host) {
  const n = Number(host?.dataset.propLint);
  if (!Number.isFinite(n)) return 0.35;
  return Math.min(1, Math.max(0.05, n));
}

function propAimDist(host) {
  return Number(normalizePropLdist(host?.dataset.propLdist));
}

function studioLight(light) {
  if (BABYLON.Light?.FALLOFF_STANDARD != null) light.falloffType = BABYLON.Light.FALLOFF_STANDARD;
  return light;
}

function eachMaterial(root, fn) {
  for (const mesh of root.getChildMeshes?.() || []) {
    const mats = mesh.material?.subMaterials || (mesh.material ? [mesh.material] : []);
    for (const mat of mats) {
      if (mat) fn(mat, mesh);
    }
  }
}

function tuneImportedMaterials(wrap) {
  eachMaterial(wrap, (mat, mesh) => {
    mat.maxSimultaneousLights = 12;
    if ("disableLighting" in mat) mat.disableLighting = false;
    if ("unlit" in mat) mat.unlit = false;
    if ("usePhysicalLightFalloff" in mat) mat.usePhysicalLightFalloff = false;
    if ("directIntensity" in mat) mat.directIntensity = Math.max(mat.directIntensity || 0, 1.15);
    mesh.receiveShadows = true;
  });
}

function softLightDisc(scene, name) {
  const size = 256;
  const tex = new BABYLON.DynamicTexture(`${name}Tex`, { width: size, height: size }, scene, false);
  const ctx = tex.getContext();
  const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 0, size * 0.5, size * 0.5, size * 0.5);
  grad.addColorStop(0, "rgba(255,255,255,0.95)");
  grad.addColorStop(0.28, "rgba(255,255,255,0.42)");
  grad.addColorStop(0.62, "rgba(255,255,255,0.1)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  tex.hasAlpha = true;
  tex.update();
  const mat = new BABYLON.StandardMaterial(`${name}Mat`, scene);
  mat.disableLighting = true;
  mat.diffuseTexture = tex;
  mat.emissiveTexture = tex;
  mat.opacityTexture = tex;
  mat.useAlphaFromDiffuseTexture = true;
  mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  mat.backFaceCulling = false;
  mat.emissiveColor = new BABYLON.Color3(1, 0.92, 0.74);
  return mat;
}

function softenSpot(light, angle, innerRatio, exponent) {
  light.angle = angle;
  if ("innerAngle" in light) light.innerAngle = angle * innerRatio;
  light.exponent = exponent;
}

function aimLightAt(light, from, target, dir) {
  light.position.copyFrom(from);
  dir.copyFrom(target).subtractInPlace(from);
  if (dir.lengthSquared() < 1e-6) return;
  dir.normalize();
  light.direction.copyFrom(dir);
}

const CAM_HOME = -Math.PI * 0.42;

const AIM_PLACE = {
  arriba: { h: 0, v: 80 },
  frente: { h: 0, v: 36 },
  detras: { h: 180, v: 36 },
};

const AIM_RIG = {
  spot: { h: 0, v: 0 },
  key: { h: -32, v: 6 },
  fill: { h: 40, v: -12 },
  rim: { h: 168, v: 4 },
};

function propAimPose(host) {
  const base = AIM_PLACE[propAimPlaceById(host?.dataset.propLpos).id] || AIM_PLACE.frente;
  return {
    h: base.h + Number(normalizePropLhrot(host?.dataset.propLhrot)),
    v: base.v + Number(normalizePropLvrot(host?.dataset.propLvrot)),
  };
}

function placeAimPolar(light, target, dist, hDeg, vDeg, from, dir) {
  const v = Math.min(1.48, Math.max(0.08, vDeg * Math.PI / 180));
  const h = CAM_HOME + hDeg * Math.PI / 180;
  const ch = Math.cos(v);
  from.set(
    target.x + Math.sin(h) * ch * dist,
    target.y + Math.sin(v) * dist,
    target.z + Math.cos(h) * ch * dist
  );
  aimLightAt(light, from, target, dir);
  light.range = dist * 2.6 + 2.4;
}

function buildPropScene(scene) {
  const id = scene.metadata.containerId;
  const host = scene.metadata.host || document.getElementById(id);
  const accent = hexToColor4(host?.dataset.accent || "#00f0c8");
  scene.clearColor = new BABYLON.Color4(0.07, 0.075, 0.085, 1);
  const fogOn = CONFIG.propFog > 0.0005;
  scene.fogMode = fogOn ? BABYLON.Scene.FOGMODE_EXP2 : BABYLON.Scene.FOGMODE_NONE;
  scene.fogDensity = CONFIG.propFog;
  scene.fogColor = new BABYLON.Color3(0.07, 0.075, 0.085);
  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    CAM_HOME,
    1.12,
    4.1,
    new BABYLON.Vector3(0, 0.38, 0),
    scene
  );
  camera.minZ = 0.05;
  camera.fov = 0.52;
  camera.inputs.clear();
  const studioRig = host?.dataset.studioLights
    ? attachStudioLighting(BABYLON, scene, camera, {
        initial: parseStudioState(host.dataset.studioLights),
        skyboxSize: 48,
        ssao: CONFIG.propSsao,
      })
    : null;
  if (studioRig) {
    scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
    studioLight(studioRig.world);
    studioLight(studioRig.key);
    studioLight(studioRig.fill);
    studioLight(studioRig.rim);
  }
  const hemi = studioRig
    ? studioRig.world
    : studioLight(new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0.2, 1, 0.35), scene));
  if (!studioRig) {
    hemi.diffuse = new BABYLON.Color3(0.92, 0.93, 0.95);
    hemi.groundColor = new BABYLON.Color3(0.18, 0.17, 0.16);
  }
  const simpleLights = !studioRig && CONFIG.propLights === "simple";
  const key = studioRig
    ? studioRig.key
    : studioLight(new BABYLON.DirectionalLight("key", new BABYLON.Vector3(-0.45, -0.85, -0.3), scene));
  if (!studioRig) {
    key.position = new BABYLON.Vector3(2.2, 5.4, 1.6);
    key.diffuse = new BABYLON.Color3(1, 0.97, 0.92);
    key.setEnabled(!simpleLights);
  }
  const rim = studioRig
    ? studioRig.rim
    : studioLight(new BABYLON.DirectionalLight("rim", new BABYLON.Vector3(0.6, -0.2, 0.7), scene));
  if (!studioRig) {
    rim.diffuse = new BABYLON.Color3(0.55, 0.62, 0.75);
    rim.intensity = 0.35;
    rim.setEnabled(!simpleLights);
    if (simpleLights) hemi.intensity = 0.95;
  }
  const ground = BABYLON.MeshBuilder.CreateGround("floor", { width: 10, height: 10 }, scene);
  const floorMat = new BABYLON.StandardMaterial("floorMat", scene);
  floorMat.diffuseColor = new BABYLON.Color3(0.16, 0.16, 0.17);
  floorMat.specularColor = new BABYLON.Color3(0.06, 0.06, 0.06);
  floorMat.maxSimultaneousLights = 12;
  ground.material = floorMat;
  ground.receiveShadows = CONFIG.propShadow > 0 && !simpleLights;
  const blob = BABYLON.MeshBuilder.CreateDisc("contact", { radius: 0.48, tessellation: 28 }, scene);
  blob.rotation.x = Math.PI / 2;
  blob.position.y = 0.01;
  const blobMat = new BABYLON.StandardMaterial("contactMat", scene);
  blobMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
  blobMat.specularColor = new BABYLON.Color3(0, 0, 0);
  blobMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
  blobMat.alpha = 0.38;
  blobMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  blobMat.backFaceCulling = false;
  blob.material = blobMat;
  const stand = BABYLON.MeshBuilder.CreateCylinder("stand", { diameter: 0.95, height: 0.05, tessellation: 32 }, scene);
  stand.position.y = 0.025;
  const standMat = new BABYLON.StandardMaterial("standMat", scene);
  standMat.diffuseColor = new BABYLON.Color3(0.22, 0.22, 0.23);
  standMat.specularColor = new BABYLON.Color3(0.28, 0.28, 0.28);
  standMat.maxSimultaneousLights = 12;
  stand.material = standMat;
  const floorLite = studioRig
    ? studioLight(new BABYLON.HemisphericLight("floorLite", new BABYLON.Vector3(0.08, 1, 0.12), scene))
    : null;
  if (floorLite) {
    floorLite.diffuse = new BABYLON.Color3(1, 1, 1);
    floorLite.groundColor = new BABYLON.Color3(1, 1, 1);
    floorLite.includedOnlyMeshes.push(ground, stand);
  }
  const keepFloorNeutral = (light) => {
    if (!light || light === floorLite) return;
    if (light.includedOnlyMeshes?.length) return;
    if (!light.excludedMeshes.includes(ground)) {
      light.excludedMeshes.push(ground, stand, blob);
    }
  };
  const trophy = BABYLON.MeshBuilder.CreatePolyhedron("starTrophy", { type: 1, size: 0.16 }, scene);
  const trophyMat = new BABYLON.StandardMaterial("starTrophyMat", scene);
  trophyMat.diffuseColor = new BABYLON.Color3(1, 0.88, 0.32);
  trophyMat.specularColor = new BABYLON.Color3(1, 0.95, 0.62);
  trophyMat.emissiveColor = new BABYLON.Color3(0.42, 0.3, 0.06);
  trophyMat.specularPower = 96;
  trophy.material = trophyMat;
  const size = 0.72;
  const half = size * 0.5;
  const root = new BABYLON.TransformNode("propRoot", scene);
  const box = BABYLON.MeshBuilder.CreateBox("prop", { size }, scene);
  box.parent = root;
  const ball = BABYLON.MeshBuilder.CreateSphere("propBall", { diameter: size * 0.92, segments: 18 }, scene);
  ball.parent = root;
  const mat = new BABYLON.StandardMaterial("propMat", scene);
  mat.diffuseColor = new BABYLON.Color3(0.86, 0.78, 0.66);
  mat.specularColor = new BABYLON.Color3(0.22, 0.2, 0.18);
  mat.specularPower = 48;
  mat.maxSimultaneousLights = 12;
  mat.emissiveColor = new BABYLON.Color3(accent.r * 0.08, accent.g * 0.08, accent.b * 0.08);
  box.material = mat;
  const ballMat = new BABYLON.StandardMaterial("ballMat", scene);
  ballMat.diffuseColor = new BABYLON.Color3(0.82, 0.28, 0.18);
  ballMat.specularColor = new BABYLON.Color3(0.35, 0.3, 0.28);
  ballMat.specularPower = 64;
  ballMat.maxSimultaneousLights = 12;
  ball.material = ballMat;
  const cone = BABYLON.MeshBuilder.CreateCylinder("beamCone", {
    height: 2.1,
    diameterTop: 0.04,
    diameterBottom: 1.15,
    tessellation: 20,
  }, scene);
  cone.parent = root;
  cone.position.set(0, -0.12, 0.95);
  cone.rotation.x = Math.PI * 0.38;
  const coneMat = new BABYLON.StandardMaterial("beamConeMat", scene);
  coneMat.disableLighting = true;
  coneMat.emissiveColor = new BABYLON.Color3(1, 0.92, 0.72);
  coneMat.alpha = 0.13;
  coneMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  cone.material = coneMat;
  const pool = BABYLON.MeshBuilder.CreateDisc("pool", { radius: 0.95, tessellation: 36 }, scene);
  pool.rotation.x = Math.PI / 2;
  pool.position.y = 0.012;
  const poolMat = softLightDisc(scene, "pool");
  pool.material = poolMat;
  const beam = new BABYLON.SpotLight(
    "propBeam",
    new BABYLON.Vector3(0, 0.05, 0.08),
    new BABYLON.Vector3(0, -0.55, 1),
    Math.PI / 2.6,
    4,
    scene
  );
  beam.parent = root;
  beam.diffuse = new BABYLON.Color3(1, 0.93, 0.75);
  softenSpot(beam, Math.PI / 2.6, 0.28, 4);
  studioLight(beam);
  const aimDir = new BABYLON.Vector3();
  const aimTarget = new BABYLON.Vector3();
  const aimFrom = new BABYLON.Vector3();
  const makeAimSpot = (name, angle, inner, exp, color) => {
    const light = new BABYLON.SpotLight(
      name,
      new BABYLON.Vector3(0, 2.6, -1.4),
      new BABYLON.Vector3(0, -1, 0.4),
      angle,
      exp,
      scene
    );
    light.diffuse = color;
    light.intensity = 0;
    light.setEnabled(false);
    softenSpot(light, angle, inner, exp);
    return studioLight(light);
  };
  const aimSpot = makeAimSpot("aimSpot", Math.PI / 3.2, 0.22, 3.2, new BABYLON.Color3(1, 0.94, 0.82));
  const aimKey = makeAimSpot("aimKey", Math.PI / 2.8, 0.24, 2.8, new BABYLON.Color3(1, 0.93, 0.84));
  const aimFill = makeAimSpot("aimFill", Math.PI / 2.4, 0.18, 2.2, new BABYLON.Color3(0.78, 0.86, 1));
  const aimRim = makeAimSpot("aimRim", Math.PI / 3.1, 0.2, 3, new BABYLON.Color3(0.72, 0.8, 1));
  const aimFloor = makeAimSpot("aimFloor", Math.PI / 2.35, 0.12, 2.1, new BABYLON.Color3(1, 0.94, 0.82));
  for (const light of [aimSpot, aimKey, aimFill, aimRim]) {
    light.excludedMeshes.push(ground, blob);
  }
  aimFloor.includedOnlyMeshes.push(ground, stand);
  const aimPool = BABYLON.MeshBuilder.CreateDisc("aimPool", { radius: 1.15, tessellation: 36 }, scene);
  aimPool.rotation.x = Math.PI / 2;
  aimPool.position.y = 0.013;
  const aimPoolMat = softLightDisc(scene, "aimPool");
  aimPool.material = aimPoolMat;
  aimPool.setEnabled(false);
  const rotM = new BABYLON.Matrix();
  const supportY = (p, sphere, dim) => {
    const hx = dim.x * 0.5;
    const hy = dim.y * 0.5;
    const hz = dim.z * 0.5;
    if (sphere) return hy * 0.92 * p.sy;
    BABYLON.Matrix.RotationYawPitchRollToRef(p.ry, p.rx, p.rz, rotM);
    return Math.abs(rotM.m[1]) * hx * p.sx
      + Math.abs(rotM.m[5]) * hy * p.sy
      + Math.abs(rotM.m[9]) * hz * p.sz;
  };
  let shadows = null;
  if (CONFIG.propShadow > 0 && !simpleLights) {
    try {
      shadows = new BABYLON.ShadowGenerator(CONFIG.propShadow, key);
      shadows.useBlurExponentialShadowMap = CONFIG.propShadowBlur > 0;
      shadows.blurKernel = CONFIG.propShadowBlur;
      shadows.addShadowCaster(box);
      shadows.addShadowCaster(ball);
      shadows.addShadowCaster(trophy);
    } catch {
      /* shadows optional */
    }
  }
  let custom = null;
  let customFit = 1;
  let customHalf = half;
  const customCenter = new BABYLON.Vector3(0, 0, 0);
  const unit0 = ads.get(id);
  const propSrc = propSourceFor(host);
  if (unit0) {
    unit0.propTag = host?.dataset?.propTag || propSrc?.tag || "";
    unit0.waitProp = Boolean(propSrc?.file);
    unit0.propReady = !propSrc?.file;
  }
  let logicAcc = 0;
  let logicT = 0;
  let logicNow = 0;
  let logicAction = "";
  let posePrev = null;
  let poseCurr = null;
  loadPropImport(scene, root, shadows, propSrc).then((loaded) => {
    if (loaded) {
      if (scene.isDisposed) {
        loaded.wrap.dispose();
        return;
      }
      custom = loaded.wrap;
      customFit = loaded.fitScale;
      customHalf = loaded.half;
      if (loaded.center) customCenter.copyFrom(loaded.center);
    }
    const unit = ads.get(id);
    if (unit) {
      unit.propReady = true;
      unit.journeyAt = 0;
    }
  });
  scene.onBeforeRenderObservable.add(() => {
    const view = journeyView(scene);
    const action = host?.dataset.propAct || "drop";
    const torch = action === "torch" || action === "torch-front";
    const sphere = action === "ball";
    const useCustom = Boolean(custom);
    const aimMode = studioRig || torch ? "none" : propAimMode(host);
    const aimOn = aimMode !== "none";
    const aimGain = aimOn ? propAimGain(host) : 0;
    const aimDist = aimOn ? propAimDist(host) : 3.3;
    const aimPose = aimOn ? propAimPose(host) : { h: 0, v: 36 };
    const aimPunch = aimGain * (0.85 + 0.55 * (3.3 / aimDist));
    const pal = hostPalette(host, "prop");
    const fogC = hexToColor4(pal.fog);
    const flatOn = host?.dataset.propFlat === "1";
    if (studioRig) {
      studioRig.syncFromHost(host);
      keepFloorNeutral(studioRig.world);
      keepFloorNeutral(studioRig.key);
      keepFloorNeutral(studioRig.fill);
      keepFloorNeutral(studioRig.rim);
      for (const extra of studioRig.extras || []) keepFloorNeutral(extra);
      scene.clearColor = new BABYLON.Color4(fogC.r, fogC.g, fogC.b, 1);
      const skyMesh = studioRig.env?.skybox;
      const sky = studioRig.env?.skyboxMaterial;
      if (skyMesh) skyMesh.setEnabled(!flatOn);
      if (!flatOn && sky?.primaryColor) sky.primaryColor.set(fogC.r, fogC.g, fogC.b);
      if (floorLite) floorLite.intensity = Math.max(0.45, (studioRig.getState().world || 0.7) * 0.95);
    } else {
      const baseHemi = simpleLights ? 0.95 : 0.62;
      hemi.intensity = torch
        ? 0.16
        : aimOn
          ? baseHemi * (1 - 0.28 * aimGain)
          : baseHemi;
      key.intensity = torch || aimOn ? 0.1 : 0.9;
      rim.intensity = torch || aimOn ? 0.05 : 0.32;
    }
    beam.intensity = torch ? 4.4 : 0;
    const floorOn = host?.dataset.propFloor !== "0";
    const floorAim = 0.58 + 0.42 * Math.cos(Math.min(1.45, (aimOn ? aimPose.v : 36) * Math.PI / 180));
    aimSpot.setEnabled(aimMode === "spot");
    aimKey.setEnabled(aimMode === "multi");
    aimFill.setEnabled(aimMode === "multi");
    aimRim.setEnabled(aimMode === "multi");
    aimFloor.setEnabled(aimOn && floorOn);
    aimSpot.intensity = aimMode === "spot" ? 16 * aimPunch : 0;
    aimKey.intensity = aimMode === "multi" ? 11 * aimPunch : 0;
    aimFill.intensity = aimMode === "multi" ? 6.5 * aimPunch : 0;
    aimRim.intensity = aimMode === "multi" ? 8.5 * aimPunch : 0;
    aimFloor.intensity = aimOn && floorOn ? 1.7 * aimPunch * floorAim : 0;
    aimPool.setEnabled(aimOn && floorOn);
    box.setEnabled(!useCustom && !sphere);
    ball.setEnabled(!useCustom && sphere);
    custom?.setEnabled(useCustom);
    ground.setEnabled(floorOn);
    blob.setEnabled(floorOn && CONFIG.propContact === 1);
    stand.setEnabled(floorOn && action === "turn");
    trophy.setEnabled(action === "star");
    cone.setEnabled(torch);
    pool.setEnabled(torch && floorOn);
    const floorC = hexToColor4(pal.floor);
    const standC = hexToColor4(pal.stand);
    const objC = hexToColor4(pal.object);
    const ballC = hexToColor4(pal.ball);
    const beamC = hexToColor4(pal.beam);
    const aimC = hexToColor4(normalizePropLcol(host?.dataset.propLcol));
    const starC = hexToColor4(pal.star || "#ffe566");
    const floorShade = studioRig ? 1 : aimOn ? 0.68 : 1;
    floorMat.diffuseColor.set(floorC.r * floorShade, floorC.g * floorShade, floorC.b * floorShade);
    floorMat.specularColor.set(aimOn ? 0.02 : 0.06, aimOn ? 0.02 : 0.06, aimOn ? 0.02 : 0.06);
    standMat.diffuseColor.set(standC.r, standC.g, standC.b);
    standMat.emissiveColor.set(standC.r * 0.08, standC.g * 0.08, standC.b * 0.08);
    mat.diffuseColor.set(objC.r, objC.g, objC.b);
    ballMat.diffuseColor.set(ballC.r, ballC.g, ballC.b);
    coneMat.emissiveColor.set(beamC.r, beamC.g, beamC.b);
    poolMat.emissiveColor.set(beamC.r, beamC.g, beamC.b);
    aimPoolMat.emissiveColor.set(aimC.r, aimC.g, aimC.b);
    aimSpot.diffuse.set(aimC.r, aimC.g, aimC.b);
    aimKey.diffuse.set(aimC.r, aimC.g * 0.98, aimC.b * 0.9);
    aimFill.diffuse.set(aimC.r * 0.78 + 0.16, aimC.g * 0.86 + 0.1, Math.min(1, aimC.b * 1.08 + 0.08));
    aimRim.diffuse.set(aimC.r * 0.7 + 0.1, aimC.g * 0.8 + 0.12, Math.min(1, aimC.b * 1.14 + 0.1));
    trophyMat.diffuseColor.set(starC.r, starC.g, starC.b);
    trophyMat.emissiveColor.set(starC.r * 0.48, starC.g * 0.38, starC.b * 0.1);
    beam.diffuse.set(beamC.r, beamC.g, beamC.b);
    if (!studioRig) {
      scene.fogColor.set(fogC.r, fogC.g, fogC.b);
      scene.clearColor = flatOn || (!torch && !aimOn)
        ? new BABYLON.Color4(fogC.r, fogC.g, fogC.b, 1)
        : torch
          ? new BABYLON.Color4(fogC.r * 0.35, fogC.g * 0.35, fogC.b * 0.4, 1)
          : new BABYLON.Color4(fogC.r * 0.55, fogC.g * 0.55, fogC.b * 0.58, 1);
    } else if (flatOn) {
      scene.fogMode = BABYLON.Scene.FOGMODE_NONE;
      scene.clearColor = new BABYLON.Color4(fogC.r, fogC.g, fogC.b, 1);
    }
    const unit = ads.get(id);
    const hold = Boolean(unit?.paused || unit?.frozen);
    if (unit?.propRewind) {
      unit.propRewind = false;
      logicAcc = 0;
      logicT = 0;
      logicNow = 0;
      posePrev = null;
      poseCurr = null;
      unit.propT = 0;
      unit.journeyAt = 0;
    }
    const ms = propActionMs(action) / 1000;
    const dim = propBoxSize(host);
    box.scaling.set(dim.x / size, dim.y / size, dim.z / size);
    ball.scaling.set(dim.x / size, dim.y / size, dim.z / size);
    if (custom) {
      const kx = dim.x / size;
      const ky = dim.y / size;
      const kz = dim.z / size;
      custom.scaling.set(customFit * kx, customFit * ky, customFit * kz);
      if (normalizePropCog(host?.dataset.propCog) === "1") {
        custom.position.set(
          -customCenter.x * custom.scaling.x,
          -customCenter.y * custom.scaling.y,
          -customCenter.z * custom.scaling.z
        );
      } else {
        custom.position.setAll(0);
      }
    }
    const poseHalf = useCustom ? customHalf * (dim.y / size) : dim.y * 0.5;
    const step = 1 / CONFIG.logicHz;
    const ready = Boolean(unit?.visible) || hold;
    if (!ready) {
      logicAcc = 0;
      logicT = 0;
      logicNow = 0;
      posePrev = null;
      poseCurr = null;
      if (unit) {
        unit.journeyAt = 0;
        unit.propT = 0;
      }
    } else {
      const now = performance.now();
      if (!logicNow) logicNow = now;
      if (hold) {
        logicNow = now;
        if (!poseCurr) {
          poseCurr = propPose(action, logicT, poseHalf);
          posePrev = poseCurr;
        }
      } else {
        let dt = (now - logicNow) / 1000;
        logicNow = now;
        if (dt > 0.25) dt = 0.25;
        if (action !== logicAction) {
          logicAction = action;
          logicAcc = 0;
          logicT = 0;
          posePrev = null;
          poseCurr = null;
        }
        logicAcc += dt;
        let steps = 0;
        if (!poseCurr) {
          poseCurr = propPose(action, 0, poseHalf);
          posePrev = poseCurr;
        }
        while (logicAcc >= step && steps < CONFIG.logicMaxSteps) {
          posePrev = poseCurr;
          logicT = Math.min(1, logicT + step / ms);
          poseCurr = propPose(action, logicT, poseHalf);
          logicAcc -= step;
          steps += 1;
        }
        if (logicAcc > step * CONFIG.logicMaxSteps) logicAcc = 0;
      }
      if (unit) {
        unit.propT = logicT;
        if (!unit.journeyAt) unit.journeyAt = now;
      }
    }
    const alpha = !ready || !poseCurr || logicT >= 1 ? 1 : logicAcc / step;
    const p = mixPose(posePrev, poseCurr || propPose(action, 0, poseHalf), alpha);
    const spinH = Number(normalizePropSpin(host?.dataset.propRhrot)) * Math.PI / 180;
    const spinV = Number(normalizePropSpin(host?.dataset.propRvrot)) * Math.PI / 180;
    p.ry += spinH;
    p.rx += spinV;
    const floor = supportY(p, sphere, useCustom
      ? { x: dim.x, y: poseHalf * 2, z: dim.z }
      : dim) + 0.012;
    p.y = Math.max(p.y, floor);
    root.position.set(p.x, p.y, p.z);
    root.rotation.set(p.rx, p.ry, p.rz);
    root.scaling.set(p.sx, p.sy, p.sz);
    if (aimOn) {
      aimTarget.set(p.x, Math.max(0.22, p.y), p.z);
      if (aimMode === "spot") {
        placeAimPolar(aimSpot, aimTarget, aimDist, aimPose.h + AIM_RIG.spot.h, aimPose.v + AIM_RIG.spot.v, aimFrom, aimDir);
        aimPool.position.set(p.x, 0.013, p.z);
        aimPool.scaling.setAll(1.05 + aimGain * 0.22);
        aimPoolMat.alpha = 0.08 + aimGain * 0.1;
      } else {
        placeAimPolar(aimKey, aimTarget, aimDist, aimPose.h + AIM_RIG.key.h, aimPose.v + AIM_RIG.key.v, aimFrom, aimDir);
        placeAimPolar(aimFill, aimTarget, aimDist, aimPose.h + AIM_RIG.fill.h, aimPose.v + AIM_RIG.fill.v, aimFrom, aimDir);
        placeAimPolar(aimRim, aimTarget, aimDist, aimPose.h + AIM_RIG.rim.h, aimPose.v + AIM_RIG.rim.v, aimFrom, aimDir);
        aimPool.position.set(p.x, 0.013, p.z);
        aimPool.scaling.setAll(1.2 + aimGain * 0.28);
        aimPoolMat.alpha = 0.06 + aimGain * 0.08;
      }
      if (floorOn) {
        placeAimPolar(aimFloor, aimTarget, aimDist, aimPose.h, aimPose.v, aimFrom, aimDir);
      }
    }
    const lift = Math.max(0, p.y - floor);
    blob.position.x = p.x;
    blob.position.z = p.z;
    blob.scaling.setAll((sphere ? 0.48 : 0.7) + lift * 1.05);
    blobMat.alpha = 0.4 / (1 + lift * 2.6);
    if (torch) {
      const reach = 1.55;
      const yaw = action === "torch-front" ? p.ry - Math.PI : p.ry;
      pool.position.x = p.x + Math.sin(p.ry) * reach;
      pool.position.z = p.z + Math.cos(p.ry) * reach;
      pool.scaling.setAll(0.85 + Math.abs(yaw) * 0.15);
      coneMat.alpha = 0.08 + 0.07 * Math.min(1, logicT / 0.12);
      poolMat.alpha = 0.18 + 0.16 * Math.min(1, logicT / 0.12);
    }
    if (action === "star") {
      const appear = Math.max(0, p.star);
      trophy.position.set(p.x, p.y + poseHalf * p.sy + 0.26 + Math.sin(p.starSpin * 1.2) * 0.025, p.z);
      trophy.rotation.set(0.32, p.starSpin, 0.08);
      trophy.scaling.set(appear * 0.78, appear, appear * 0.78);
    }
    camera.radius = propCamRadius(host, view) * (1 - p.punch) * (p.camR || 1);
    const camPan = normalizePropCamMode(host?.dataset.propCamMode) === "pan";
    const camH = camPan ? 0 : Number(normalizePropCamH(host?.dataset.propCamH)) * Math.PI / 180;
    const camV = camPan ? 0 : Number(normalizePropCamV(host?.dataset.propCamV)) * Math.PI / 180;
    camera.alpha = CAM_HOME + p.camA + camH;
    const beta0 = (view.wide ? 1.22 : 1.12) + p.punch * 0.4 - ((p.camR || 1) - 1) * 0.7;
    camera.beta = Math.min(Math.PI - 0.12, Math.max(0.12, beta0 + camV));
    camera.fov = view.tall ? 0.48 : view.wide ? 0.4 : 0.52;
    const lookX = p.x * 0.35;
    const lookY = (action === "star" || action === "cheer" || action === "space")
      ? 0.14 + p.y * 0.55
      : Math.min(0.55, p.y * 0.45 + 0.22);
    if (camPan) {
      const px = Number(normalizePropCamPan(host?.dataset.propCamPx));
      const py = Number(normalizePropCamPan(host?.dataset.propCamPy));
      camera.target.x = lookX - Math.cos(camera.alpha) * px;
      camera.target.y = lookY + py;
      camera.target.z = Math.sin(camera.alpha) * px;
    } else {
      camera.target.x = lookX;
      camera.target.y = lookY;
      camera.target.z = 0;
    }
  });
}

function buildJourneyScene(scene) {
  const id = scene.metadata.containerId;
  const host = document.getElementById(id);
  const play = host?.dataset.play || "climax";
  const accent = hexToColor4(host?.dataset.accent || "#7ec8e8");
  const pal0 = hostPalette(host, play);
  const deep = hexToColor4(pal0.skyDeep);
  scene.clearColor = new BABYLON.Color4(deep.r * 0.25, deep.g * 0.25, deep.b * 0.35, 1);
  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    -Math.PI / 2,
    0.74,
    2.85,
    new BABYLON.Vector3(0, 0.04, 0.1),
    scene
  );
  camera.minZ = 0.03;
  camera.maxZ = 80;
  camera.fov = 0.64;
  camera.inputs.clear();
  const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.55, -0.65, -0.35), scene);
  sun.intensity = 1.15;
  sun.diffuse = new BABYLON.Color3(1, 0.94, 0.82);
  const hemi = new BABYLON.HemisphericLight("skyLight", new BABYLON.Vector3(0.2, 1, 0.3), scene);
  hemi.intensity = 0.45;
  hemi.diffuse = new BABYLON.Color3(0.72, 0.84, 0.9);
  hemi.groundColor = new BABYLON.Color3(0.04, 0.07, 0.08);
  const sky = BABYLON.MeshBuilder.CreateSphere("sky", { diameter: 46, segments: CONFIG.skySegments }, scene);
  sky.infiniteDistance = true;
  const skyMat = new BABYLON.StandardMaterial("skyMat", scene);
  skyMat.backFaceCulling = false;
  skyMat.disableLighting = true;
  skyMat.emissiveTexture = makeSkyTexture(scene, pal0);
  skyMat.emissiveColor = new BABYLON.Color3(1, 1, 1);
  sky.material = skyMat;
  const water = BABYLON.MeshBuilder.CreateGround("water", {
    width: 6.4,
    height: 6.4,
    subdivisions: CONFIG.waterSubdivisions,
    updatable: true,
  }, scene);
  const waterMat = new BABYLON.StandardMaterial("waterMat", scene);
  const water0 = hexToColor4(pal0.water);
  waterMat.diffuseColor = new BABYLON.Color3(water0.r, water0.g, water0.b);
  waterMat.specularColor = new BABYLON.Color3(1, 1, 1);
  waterMat.specularPower = 96;
  waterMat.alpha = 0.92;
  waterMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  waterMat.backFaceCulling = false;
  const mirror = new BABYLON.MirrorTexture("waterMirror", CONFIG.mirrorSize, scene, true);
  mirror.mirrorPlane = new BABYLON.Plane(0, -1, 0, 0);
  mirror.adaptiveBlurKernel = CONFIG.mirrorBlur;
  mirror.level = 0.82;
  mirror.renderList = [sky];
  waterMat.reflectionTexture = mirror;
  const fresnel = new BABYLON.FresnelParameters();
  fresnel.bias = 0.12;
  fresnel.power = 2.4;
  fresnel.leftColor = BABYLON.Color3.White();
  fresnel.rightColor = new BABYLON.Color3(0.12, 0.18, 0.2);
  waterMat.reflectionFresnelParameters = fresnel;
  water.material = waterMat;
  const rest = water.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  const pos = new Float32Array(rest);
  const indices = water.getIndices();
  const normals = new Float32Array(pos.length);
  const drop = BABYLON.MeshBuilder.CreateSphere("drop", { diameter: 0.16, segments: CONFIG.dropSegments }, scene);
  const dropMat = new BABYLON.StandardMaterial("dropMat", scene);
  dropMat.diffuseColor = new BABYLON.Color3(accent.r * 0.25, accent.g * 0.3, accent.b * 0.35);
  dropMat.emissiveColor = new BABYLON.Color3(accent.r * 0.12, accent.g * 0.14, accent.b * 0.16);
  dropMat.specularColor = new BABYLON.Color3(1, 1, 1);
  dropMat.specularPower = 180;
  dropMat.alpha = 0.55;
  dropMat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
  drop.material = dropMat;
  mirror.renderList.push(drop);

  const deform = (clock, time, hit) => {
    for (let i = 0; i < pos.length; i += 3) {
      pos[i] = rest[i];
      pos[i + 2] = rest[i + 2];
      pos[i + 1] = waterHeight(rest[i], rest[i + 2], clock, time, hit);
    }
    BABYLON.VertexData.ComputeNormals(pos, indices, normals);
    water.updateVerticesData(BABYLON.VertexBuffer.PositionKind, pos);
    water.updateVerticesData(BABYLON.VertexBuffer.NormalKind, normals);
  };

  let unitPalStamp = host?.dataset.pal;
  scene.onBeforeRenderObservable.add(() => {
    const pal = hostPalette(host, play);
    if (unitPalStamp !== host?.dataset.pal) {
      unitPalStamp = host?.dataset.pal;
      paintSkyTexture(skyMat.emissiveTexture, pal);
      const deepNow = hexToColor4(pal.skyDeep);
      scene.clearColor = new BABYLON.Color4(deepNow.r * 0.25, deepNow.g * 0.25, deepNow.b * 0.35, 1);
    }
    const wc = hexToColor4(pal.water);
    waterMat.diffuseColor.set(wc.r, wc.g, wc.b);
    const view = journeyView(scene);
    camera.radius = view.tall ? 3.35 : view.wide ? 2.55 : 2.85;
    camera.beta = view.wide ? 0.9 : 0.74;
    camera.fov = view.tall ? 0.56 : view.wide ? 0.44 : 0.62;
    const startY = view.wide ? 1.05 : view.tall ? 1.4 : 1.25;
    const hitY = 0.06;
    const unit = ads.get(id);
    const hold = Boolean(unit?.paused || unit?.frozen);
    if (!unit?.visible && !hold) {
      if (unit) unit.journeyAt = 0;
      drop.position.set(0, startY, 0);
      drop.scaling.setAll(1);
      drop.visibility = 1;
      drop.isVisible = true;
      deform(0, 0, 0);
      return;
    }
    if (hold) return;
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = (performance.now() - unit.journeyAt) / 1000;
    const span = play === "pre-enter" ? CONFIG.preEnterMs : CONFIG.climaxMs;
    const t = Math.min(1.15, (performance.now() - unit.journeyAt) / span);
    const fall = Math.min(1, t / 0.4);
    const didHit = t >= 0.4;
    drop.position.set(0, lerp(startY, hitY, fall * fall * fall), 0);
    drop.scaling.setAll(1);
    drop.visibility = 1;
    drop.isVisible = true;
    let hit = 0;
    let rippleT = 0;
    if (didHit) {
      const melt = easeOut(Math.min(1, (t - 0.4) / 0.16));
      drop.scaling.set(lerp(1, 1.4, melt), lerp(1, 0.2, melt), lerp(1, 1.4, melt));
      drop.visibility = 1 - melt;
      drop.position.y = hitY;
      drop.isVisible = melt < 0.98 && !unit.climax && !unit.adIn;
      hit = unit.climax || unit.adIn ? 0.65 : 1;
      rippleT = elapsed - (span * 0.4) / 1000;
    }
    deform(elapsed, rippleT, hit);
  });
}

function buildParticleScene(scene) {
  scene.clearColor = new BABYLON.Color4(...CONFIG.colors.clear, 1);
  setupCamera(scene, 3.4);
  const light = new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;
  const plane = BABYLON.MeshBuilder.CreatePlane("pt", { size: 0.09 }, scene);
  const sps = new BABYLON.SolidParticleSystem("sps", scene, { useModelMaterial: true });
  sps.billboard = true;
  sps.addShape(plane, CONFIG.particleCount);
  const mesh = sps.buildMesh();
  plane.dispose();
  const mat = new BABYLON.StandardMaterial("pm", scene);
  mat.diffuseTexture = makeGlowTexture(scene);
  mat.diffuseTexture.hasAlpha = true;
  mat.useAlphaFromDiffuseTexture = true;
  mat.emissiveColor = new BABYLON.Color3(0.4, 1, 0.9);
  mat.disableLighting = true;
  mat.backFaceCulling = false;
  mesh.material = mat;
  const palette = CONFIG.colors.particles.map(hexToColor4);
  const targets = logoTargets(CONFIG.particleCount);
  const cursor = { x: 0, y: 0, active: false };
  const hover = { value: 0 };
  sps.initParticles = () => {
    for (let i = 0; i < sps.nbParticles; i++) {
      const p = sps.particles[i];
      p.position.set((Math.random() - 0.5) * 2.4, Math.random() * 2.2 + 0.4, (Math.random() - 0.5) * 0.6);
      p.velocity = new BABYLON.Vector3((Math.random() - 0.5) * 0.15, -0.35 - Math.random() * 0.55, 0);
      const c = palette[i % palette.length];
      p.color = new BABYLON.Color4(c.r, c.g, c.b, 0.95);
    }
  };
  sps.buildParticle = (p) => p;
  sps.initParticles();
  sps.setParticles();
  const canvas = adCanvas(scene);
  const id = scene.metadata.containerId;
  canvas.addEventListener("pointermove", (ev) => {
    const rect = canvas.getBoundingClientRect();
    cursor.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1.4;
    cursor.y = -(((ev.clientY - rect.top) / rect.height) * 2 - 1) * 1.05;
    cursor.active = true;
  });
  canvas.addEventListener("pointerleave", () => {
    cursor.active = false;
    hover.value = 0;
  });
  canvas.addEventListener("pointerenter", () => {
    hover.value = 1;
  });
  scene.onBeforeRenderObservable.add(() => {
    if (!isVisible(id)) return;
    const dt = Math.min(0.05, scene.getEngine().getDeltaTime() / 1000);
    for (let i = 0; i < sps.nbParticles; i++) {
      const p = sps.particles[i];
      const logo = targets[i];
      if (hover.value > 0.5 && CONFIG.logoOnHover) {
        p.position.x += (logo[0] - p.position.x) * 4.5 * dt;
        p.position.y += (logo[1] - p.position.y) * 4.5 * dt;
      } else {
        p.position.x += p.velocity.x * CONFIG.speeds.rain * dt * 2.2;
        p.position.y += p.velocity.y * CONFIG.speeds.rain * dt * 2.2;
        if (p.position.y < -1.25) {
          p.position.y = 1.35;
          p.position.x = (Math.random() - 0.5) * 2.4;
        }
      }
      if (cursor.active) {
        const dx = cursor.x - p.position.x;
        const dy = cursor.y - p.position.y;
        const d2 = dx * dx + dy * dy + 0.08;
        p.position.x += (dx / d2) * 0.55 * dt;
        p.position.y += (dy / d2) * 0.55 * dt;
      }
    }
    sps.setParticles();
  });
}

function buildCubeScene(scene) {
  scene.clearColor = new BABYLON.Color4(...CONFIG.colors.clear, 1);
  const camera = setupCamera(scene, 3.1);
  camera.beta = 1.05;
  new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0.4, 1, 0.3), scene).intensity = 0.95;
  const faceColors = CONFIG.colors.cubeFaces.map((hex) => {
    const c = hexToColor4(hex);
    return new BABYLON.Color4(c.r, c.g, c.b, 1);
  });
  const unit = {
    mesh: BABYLON.MeshBuilder.CreateBox("cube", { size: 1.25, faceColors, updatable: true }, scene),
    spin: CONFIG.speeds.cubeSpin,
  };
  const mat = new BABYLON.StandardMaterial("cm", scene);
  mat.emissiveColor = new BABYLON.Color3(0.08, 0.1, 0.14);
  unit.mesh.material = mat;
  const canvas = adCanvas(scene);
  const id = scene.metadata.containerId;
  canvas.style.cursor = "pointer";
  canvas.addEventListener("click", () => {
    const colors = Array.from({ length: 6 }, () => new BABYLON.Color4(Math.random(), Math.random(), Math.random(), 1));
    const old = unit.mesh.rotation.clone();
    unit.mesh.dispose();
    unit.mesh = BABYLON.MeshBuilder.CreateBox("cube", { size: 1.25, faceColors: colors, updatable: true }, scene);
    unit.mesh.material = mat;
    unit.mesh.rotation.copyFrom(old);
  });
  scene.onBeforeRenderObservable.add(() => {
    if (!isVisible(id) || !unit.mesh) return;
    const dt = scene.getEngine().getDeltaTime() / 1000;
    unit.mesh.rotation.y += dt * unit.spin;
    unit.mesh.rotation.x += dt * unit.spin * 0.45;
  });
}

function buildSphereScene(scene) {
  scene.clearColor = new BABYLON.Color4(...CONFIG.colors.clear, 1);
  setupCamera(scene, 3.15);
  new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0.2, 1, 0.6), scene).intensity = 1.05;
  const sphere = BABYLON.MeshBuilder.CreateSphere("planet", { diameter: 1.7, segments: 12, updatable: true }, scene);
  const size = 256;
  const dyn = new BABYLON.DynamicTexture("planetTex", { width: size, height: size }, scene, false);
  const ctx = dyn.getContext();
  const mat = new BABYLON.StandardMaterial("sm", scene);
  mat.diffuseTexture = dyn;
  mat.emissiveColor = new BABYLON.Color3(0.12, 0.18, 0.22);
  sphere.material = mat;
  const basePos = Float32Array.from(sphere.getVerticesData(BABYLON.VertexBuffer.PositionKind));
  const deform = { amount: 0, target: 0 };
  let texOffset = 0;
  const id = scene.metadata.containerId;
  function paintTexture(offset) {
    const { ocean, land, cloud } = CONFIG.colors.planet;
    ctx.fillStyle = ocean;
    ctx.fillRect(0, 0, size, size);
    for (let y = 0; y < size; y += 4) {
      const band = 0.5 + 0.5 * Math.sin((y + offset) * 0.04);
      ctx.fillStyle = band > 0.55 ? land : cloud;
      ctx.globalAlpha = 0.35 + band * 0.4;
      ctx.fillRect(0, y, size, 4);
    }
    ctx.globalAlpha = 1;
    dyn.update();
  }
  paintTexture(0);
  window.addEventListener("scroll", () => {
    if (isVisible(id)) deform.target = Math.min(0.28, deform.target + 0.045);
  }, { passive: true });
  scene.onBeforeRenderObservable.add(() => {
    if (!isVisible(id)) return;
    const dt = scene.getEngine().getDeltaTime() / 1000;
    sphere.rotation.y += dt * CONFIG.speeds.planetSpin;
    texOffset += dt * CONFIG.speeds.textureScroll;
    paintTexture(texOffset);
    deform.target *= 0.92;
    deform.amount += (deform.target - deform.amount) * 0.12;
    const pos = sphere.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    for (let i = 0; i < pos.length; i += 3) {
      const bx = basePos[i], by = basePos[i + 1], bz = basePos[i + 2];
      const n = Math.hypot(bx, by, bz) || 1;
      const wave = 1 + deform.amount * Math.sin(by * 8 + texOffset * 0.08) * Math.cos(bx * 6);
      pos[i] = (bx / n) * (0.85 * wave);
      pos[i + 1] = (by / n) * (0.85 * wave);
      pos[i + 2] = (bz / n) * (0.85 * wave);
    }
    sphere.updateVerticesData(BABYLON.VertexBuffer.PositionKind, pos);
  });
}

function pageScrollProgress() {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
}

function buildScrollScene(scene) {
  scene.clearColor = new BABYLON.Color4(...CONFIG.colors.clear, 1);
  const camera = setupCamera(scene, 3.35);
  camera.beta = 1.05;
  new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0.3, 1, 0.4), scene).intensity = 1.05;
  const torus = BABYLON.MeshBuilder.CreateTorus("ring", { diameter: 1.85, thickness: 0.16, tessellation: 16 }, scene);
  const ringMat = new BABYLON.StandardMaterial("rm", scene);
  torus.material = ringMat;
  const core = BABYLON.MeshBuilder.CreatePolyhedron("logo", { type: 1, size: 0.38 }, scene);
  const coreMat = new BABYLON.StandardMaterial("cm4", scene);
  core.material = coreMat;
  const needle = BABYLON.MeshBuilder.CreateBox("needle", { size: 0.18 }, scene);
  const needleMat = new BABYLON.StandardMaterial("nm", scene);
  needle.material = needleMat;
  const state = { progress: 0, target: pageScrollProgress(), phase: 0 };
  const brandHost = adCanvas(scene)?.closest(".ad-container");
  const wavePath = brandHost?.querySelector(".ad-wave-path");
  const id = scene.metadata.containerId;
  window.addEventListener("scroll", () => {
    state.target = pageScrollProgress();
  }, { passive: true });
  scene.onBeforeRenderObservable.add(() => {
    if (!isVisible(id)) return;
    const dt = Math.min(0.05, scene.getEngine().getDeltaTime() / 1000);
    state.progress += (state.target - state.progress) * Math.min(1, CONFIG.speeds.scrollEase * dt);
    const t = state.progress;
    torus.rotation.x = t * Math.PI * 2;
    core.rotation.y += dt * (0.4 + t * 1.8 + AD4_FX.burst * 4);
    core.scaling.setAll(0.85 + t * 0.45 + AD4_FX.burst * 0.4);
    AD4_FX.burst *= 0.9;
    const ang = t * Math.PI * 2;
    needle.position.set(Math.cos(ang) * 0.925, Math.sin(ang * 2) * 0.12, Math.sin(ang) * 0.925);
    state.phase += dt * (AD4_BANNER.speed + t * 3.2);
    if (wavePath) wavePath.setAttribute("d", wavePathD(state.phase, AD4_BANNER.amplitude + t * 5 + AD4_FX.burst * 14, t, AD4_BANNER.height));
    if (brandHost) {
      brandHost.style.setProperty("--logo-spin", `${t * 360}deg`);
      brandHost.style.setProperty("--wave-bob", `${Math.sin(state.phase + 1.2) * (2.5 + t * 2)}px`);
    }
    const ringHex = hexToColor4(AD4_BANNER.ring);
    const coreHex = hexToColor4(AD4_BANNER.core);
    const needleHex = hexToColor4(AD4_BANNER.needle);
    ringMat.emissiveColor.set(ringHex.r, ringHex.g, ringHex.b);
    coreMat.emissiveColor.set(coreHex.r * 0.7, coreHex.g * 0.7, coreHex.b * 0.7);
    coreMat.diffuseColor.set(coreHex.r, coreHex.g, coreHex.b);
    needleMat.emissiveColor.set(needleHex.r, needleHex.g, needleHex.b);
  });
}

function buildBannerScene(scene) {
  scene.clearColor = new BABYLON.Color4(...CONFIG.colors.clear, 1);
  const { aspect } = canvasAspect(scene);
  const wide = aspect >= 1;
  const camera = setupCamera(scene, wide ? 2.7 : 4.1);
  camera.alpha = wide ? Math.PI * 0.5 : Math.PI * 0.62;
  new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0.3, 1, 0.4), scene).intensity = 1.05;
  const palette = CONFIG.colors.cubeFaces.map(hexToColor4);
  const count = wide ? (aspect > 5 ? 5 : 7) : 8;
  const span = wide ? (aspect > 5 ? 2.4 : 3.1) : 2.6;
  const size = wide && aspect > 5 ? 0.22 : wide ? 0.32 : 0.42;
  const core = BABYLON.MeshBuilder.CreatePolyhedron("mark", { type: 1, size: size * 0.85 }, scene);
  const coreMat = new BABYLON.StandardMaterial("bannerCore", scene);
  const coreHex = hexToColor4(CONFIG.colors.scroll.core);
  coreMat.emissiveColor = new BABYLON.Color3(coreHex.r * 0.7, coreHex.g * 0.7, coreHex.b * 0.7);
  core.material = coreMat;
  const items = [];
  for (let i = 0; i < count; i++) {
    const box = BABYLON.MeshBuilder.CreateBox(`b${i}`, { size }, scene);
    const mat = new BABYLON.StandardMaterial(`bm${i}`, scene);
    const c = palette[i % palette.length];
    mat.emissiveColor = new BABYLON.Color3(c.r * 0.55, c.g * 0.55, c.b * 0.55);
    mat.diffuseColor = new BABYLON.Color3(c.r, c.g, c.b);
    box.material = mat;
    items.push({ mesh: box, offset: (i / count) * Math.PI * 2, spin: 0.6 + i * 0.08 });
  }
  const id = scene.metadata.containerId;
  scene.onBeforeRenderObservable.add(() => {
    if (!isVisible(id)) return;
    const dt = Math.min(0.05, scene.getEngine().getDeltaTime() / 1000);
    const t = performance.now() * 0.001;
    core.rotation.y += dt * 1.2;
    for (const item of items) {
      const a = t * 0.7 + item.offset;
      if (wide) {
        item.mesh.position.set(Math.sin(a) * span, Math.sin(a * 2) * (aspect > 5 ? 0.08 : 0.28), Math.cos(a) * 0.35);
      } else {
        item.mesh.position.set(Math.sin(a * 1.6) * 0.28, Math.sin(a) * span, Math.cos(a) * 0.32);
      }
      item.mesh.rotation.y += dt * item.spin;
    }
  });
}

function visibleAdCount() {
  let n = 0;
  for (const unit of ads.values()) {
    if (unit.visible && (unit.scene || unit.paint2d)) n += 1;
  }
  return n;
}

let pageShown = true;

export function setPageShown(on) {
  pageShown = Boolean(on);
  for (const unit of ads.values()) {
    setAdVisible(unit.container, true);
  }
}

function isAdPlayable(container, intersecting) {
  if (!pageShown || !intersecting || document.hidden) return false;
  const sticky = container.closest(".sticky-ad.hide-until-stuck");
  if (sticky && !sticky.classList.contains("is-stuck")) return false;
  return true;
}

function blitAdUnit(unit, now, gl, force = false) {
  if (!unit?.display) return false;
  if (!force && (!unit.visible || unit.frozen)) return false;
  const dest = unit.display;
  const w = dest.clientWidth | 0;
  const h = dest.clientHeight | 0;
  if (w < 2 || h < 2) return false;
  if (!force && CONFIG.fpsVisible > 0 && now - unit.lastFrame < 1000 / CONFIG.fpsVisible) return false;
  unit.lastFrame = now;
  const dpr = CONFIG.blitDpr;
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (dest.width !== bw || dest.height !== bh) {
    dest.width = bw;
    dest.height = bh;
    unit.ctx = null;
  }
  if (!unit.ctx) unit.ctx = dest.getContext("2d", { alpha: false });
  if (unit.paint2d) {
    unit.paint2d(unit.ctx, bw, bh);
    return true;
  }
  if (!unit.scene || !gl) return false;
  if (gl.width !== bw || gl.height !== bh) {
    gl.style.width = `${w}px`;
    gl.style.height = `${h}px`;
    engine.setSize(bw, bh);
  }
  unit.scene.render();
  unit.ctx.drawImage(gl, 0, 0, gl.width || bw, gl.height || bh, 0, 0, bw, bh);
  return true;
}

export function nudgeAds() {
  if (!engine) return false;
  const gl = engine.getRenderingCanvas();
  const now = performance.now();
  let any = false;
  for (const unit of ads.values()) {
    if (!unit.scene && !unit.paint2d) continue;
    holdPausedClocks(unit, now);
    unit.lastFrame = 0;
    if (blitAdUnit(unit, now, gl, true)) any = true;
  }
  return any;
}

function attachSharedLoop() {
  const gl = engine.getRenderingCanvas();
  let running = false;
  const tick = () => {
    if (document.hidden || !visibleAdCount()) {
      running = false;
      engine.stopRenderLoop();
      return;
    }
    const now = performance.now();
    for (const unit of ads.values()) {
      holdPausedClocks(unit, now);
      blitAdUnit(unit, now, gl, false);
    }
  };
  return {
    startLoop() {
      if (running || document.hidden || !visibleAdCount()) return;
      running = true;
      engine.runRenderLoop(tick);
    },
    stopLoop() {
      if (!running) return;
      running = false;
      engine.stopRenderLoop();
    },
  };
}

export function setAdVisible(container, intersecting) {
  const unit = ads.get(container.id);
  const on = isAdPlayable(container, intersecting);
  container.classList.toggle("is-visible", on);
  if (!unit || unit.frozen) return;
  const was = unit.visible;
  unit.visible = on;
  if (on && !was) unit.lastFrame = 0;
  if (on) sharedLoop?.startLoop();
  else if (!visibleAdCount()) sharedLoop?.stopLoop();
}

function paintAllHostClocks() {
  for (const unit of ads.values()) paintHostClock(unit.container);
}

export function setAdClockLook(look) {
  writeClockLook(look);
  paintAllHostClocks();
}

export function setAdClockT(t) {
  writeClockLook({ t });
  paintAllHostClocks();
}

function holdPausedClocks(unit, now) {
  if (!unit?.paused) {
    unit.pauseClock = 0;
    return;
  }
  if (!unit.pauseClock) {
    unit.pauseClock = now;
    return;
  }
  const dt = now - unit.pauseClock;
  unit.pauseClock = now;
  if (unit.journeyAt) unit.journeyAt += dt;
  if (unit.clockStarted) unit.clockStarted += dt;
}

export function pauseAds() {
  let any = false;
  for (const unit of ads.values()) {
    if (!unit.scene && !unit.paint2d) continue;
    unit.paused = true;
    unit.pauseClock = 0;
    if (unit.frozen) {
      unit.frozen = false;
      unit.visible = true;
      unit.lastFrame = 0;
    }
    unit.container.classList.add("is-paused");
    any = true;
  }
  if (any) sharedLoop?.startLoop();
  return any;
}

export function resumeAds() {
  for (const unit of ads.values()) {
    unit.paused = false;
    unit.pauseClock = 0;
    unit.container.classList.remove("is-paused");
  }
}

export function restAds() {
  let any = false;
  for (const unit of ads.values()) {
    if (unit.frozen && !unit.scene && !unit.paint2d) continue;
    unit.frozen = true;
    unit.visible = false;
    any = true;
  }
  if (any) sharedLoop?.stopLoop();
}

export function rewindAds() {
  let any = false;
  for (const unit of ads.values()) {
    if (!unit.scene) return false;
    unit.frozen = false;
    unit.paused = false;
    unit.pauseClock = 0;
    unit.container.classList.remove("is-paused");
    unit.lastFrame = 0;
    resetPlay(unit.container, unit);
    if (unit.container.dataset.play === "prop") unit.propRewind = true;
    unit.propT = 0;
    unit.clockStarted = 0;
    setAdVisible(unit.container, true);
    any = true;
  }
  if (any) sharedLoop?.startLoop();
  return any;
}

export function burstSticky() {
  AD4_FX.burst = 1;
}

export async function preloadEngine() {
  await ensureEngine();
}

export async function warmupPropGpu(tag = propCurrent) {
  await ensureEngine();
  const src = getPropSource(tag) || currentPropSource();
  if (!src?.file) return;
  const key = filesCacheKey(src.files);
  if (src.warmed === key) return;
  const token = ++src.warmToken;
  await preparePropSourceFor(src);
  if (token !== src.warmToken) return;
  const scene = new BABYLON.Scene(engine);
  scene.autoClear = true;
  const camera = new BABYLON.ArcRotateCamera(
    "warmCam",
    CAM_HOME,
    1.12,
    4.1,
    new BABYLON.Vector3(0, 0.38, 0),
    scene
  );
  camera.minZ = 0.05;
  camera.fov = 0.52;
  camera.inputs.clear();
  attachStudioLighting(BABYLON, scene, camera, { ssao: false, skyboxSize: 48 });
  const root = new BABYLON.TransformNode("warmRoot", scene);
  try {
    const loaded = await loadPropImport(scene, root, null, src);
    if (token !== src.warmToken) {
      scene.dispose();
      return;
    }
    if (loaded?.wrap) {
      if (scene.whenReadyAsync) {
        await Promise.race([
          scene.whenReadyAsync(),
          new Promise((resolve) => setTimeout(resolve, 8000)),
        ]);
      }
      if (token !== src.warmToken) {
        scene.dispose();
        return;
      }
      await compileMeshMaterials(loaded.wrap);
      for (let i = 0; i < 3; i += 1) scene.render();
    }
    scene.dispose();
    if (token !== src.warmToken) return;
    src.warmed = key;
  } catch (err) {
    scene.dispose();
    console.warn("No se pudo precalentar el modelo 3D", err);
  }
}

async function ensureEngine() {
  if (engine) return;
  BABYLON = await import("@babylonjs/core");
  try {
    await import("@babylonjs/loaders/glTF");
  } catch {
    /* glTF loader optional until a file is picked */
  }
  const gl = document.createElement("canvas");
  gl.width = 300;
  gl.height = 250;
  gl.setAttribute("aria-hidden", "true");
  Object.assign(gl.style, { position: "fixed", left: "-4000px", top: "0", width: "300px", height: "250px", pointerEvents: "none" });
  document.body.appendChild(gl);
  engine = new BABYLON.Engine(gl, true, {
    antialias: true,
    adaptToDeviceRatio: false,
    preserveDrawingBuffer: true,
    stencil: false,
    powerPreference: "high-performance",
  });
  engine.setHardwareScalingLevel(1);
  sharedLoop = attachSharedLoop();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) sharedLoop.stopLoop();
    else sharedLoop.startLoop();
  });
}

let propBootChain = Promise.resolve();
let propBootToken = 0;

function enqueuePropBoot(work) {
  const next = propBootChain.then(work, work);
  propBootChain = next.catch(() => {});
  return next;
}

function adUnitAlive(unit) {
  return Boolean(unit) && !unit.dead && ads.get(unit.container?.id) === unit;
}

async function bootAdUnit(container) {
  const unit = ads.get(container.id);
  if (!unit || unit.booted || unit.booting || unit.frozen || unit.dead) return;
  unit.booting = true;
  const canvas = unit.display;
  const token = propBootToken;
  try {
    await waitForBox(container);
    if (token !== propBootToken || !container.isConnected || !adUnitAlive(unit)) return;
    const sized = syncAdSize(container);
    const attach2d = attachPlay2D(container, unit, {
      onReveal: () => finishClimax(container, unit),
      onReset: () => resetPlay(container, unit),
    });
    const start3d = async () => {
      if (token !== propBootToken || !container.isConnected || !adUnitAlive(unit)) return;
      const scene = new BABYLON.Scene(engine);
      if (!adUnitAlive(unit)) {
        scene.dispose();
        return;
      }
      scene.metadata = { displayCanvas: canvas, w: sized.width, h: sized.height, containerId: container.id, host: container };
      unit.scene = scene;
      if (container.dataset.play === "prop") buildPropScene(scene);
      else buildJourneyScene(scene);
      attachPlay(container, scene);
    };
    if (!attach2d) {
      if (container.dataset.play === "prop") await enqueuePropBoot(start3d);
      else await start3d();
    }
    if (token !== propBootToken || !container.isConnected || !adUnitAlive(unit)) {
      if (unit.scene && unit.dead) {
        unit.scene.dispose();
        unit.scene = null;
      }
      return;
    }
    if (container.querySelector(".ad-wave")) applyWaveToDom(container, AD4_BANNER);
    const shapeSvg = container.querySelector(".ad-2d");
    if (shapeSvg) {
      stopShapes = startShapePlayer(shapeSvg, () => AD4_BANNER, () => null, () => isVisible(container.id));
    }
    unit.booted = true;
    if (unit.visible) sharedLoop?.startLoop();
  } catch (err) {
    console.error("No se pudo iniciar", container.id, err);
    container.classList.add("is-error");
  } finally {
    unit.booting = false;
  }
}

function adUnitKey(id) {
  if (id == null || id === "") return "";
  if (typeof id === "object") return String(id.id || "");
  return String(id);
}

function teardownAdUnit(unit) {
  if (!unit || unit.dead) return;
  unit.dead = true;
  unit.frozen = true;
  unit.visible = false;
  unit.booted = false;
  if (unit.exitTimer) {
    clearTimeout(unit.exitTimer);
    unit.exitTimer = 0;
  }
  if (unit.handoffTimer) {
    clearTimeout(unit.handoffTimer);
    unit.handoffTimer = 0;
  }
  const container = unit.container;
  if (container) observer?.unobserve(container);
  unit.scene?.dispose();
  unit.scene = null;
  if (container?.id) ads.delete(container.id);
}

function releasePlayerIfEmpty() {
  if (ads.size) {
    if (!visibleAdCount()) sharedLoop?.stopLoop();
    return;
  }
  stopShapes?.();
  stopShapes = null;
  observer?.disconnect();
  observer = null;
  if (onResize) {
    window.removeEventListener("resize", onResize);
    onResize = null;
  }
  sharedLoop?.stopLoop();
}

export function disposeAds(id) {
  const key = adUnitKey(id);
  if (key) {
    const unit = ads.get(key);
    if (!unit) return;
    teardownAdUnit(unit);
    releasePlayerIfEmpty();
    return;
  }
  propBootToken += 1;
  for (const unit of [...ads.values()]) teardownAdUnit(unit);
  releasePlayerIfEmpty();
}

export async function bootContainers(root = document) {
  await ensureEngine();
  const nodes = [...root.querySelectorAll(".ad-container")];
  for (const container of nodes) {
    if (ads.has(container.id)) continue;
    const canvas = container.querySelector("canvas");
    ads.set(container.id, {
      scene: null,
      visible: false,
      frozen: false,
      dead: false,
      container,
      display: canvas,
      lastFrame: 0,
      booted: false,
      booting: false,
    });
  }
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) bootAdUnit(entry.target);
        setAdVisible(entry.target, entry.isIntersecting);
      }
    }, { threshold: 0, rootMargin: "120px" });
  }
  nodes.forEach((el) => observer.observe(el));
  if (!onResize) {
    onResize = () => document.querySelectorAll(".ad-container").forEach(syncAdSize);
    window.addEventListener("resize", onResize);
  }
}

export async function startAd(container) {
  if (!container) return;
  await bootAdUnit(container);
  setAdVisible(container, true);
  syncAdSize(container);
}

window.addEventListener("storage", (ev) => {
  if (ev.key !== STORAGE_KEY) return;
  Object.assign(AD4_BANNER, loadBanner());
  document.querySelectorAll(".ad-container").forEach((el) => {
    if (el.querySelector(".ad-wave")) applyWaveToDom(el, AD4_BANNER);
  });
});
