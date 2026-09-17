/* Misma máquina que handoff-run.js + applyHandoffSettings. Sin Babylon. */
(function () {
  const HANDS = ["none", "wipe", "veil", "pulse", "iris", "doors", "mist"];
  const VEIL_ENTER_MS = 640;

  function clamp(n, lo, hi, fallback) {
    if (!Number.isFinite(n)) return fallback;
    return String(Math.round(Math.min(hi, Math.max(lo, n))));
  }
  function handoffById(id) {
    const key = String(id || "");
    return HANDS.includes(key) ? key : "none";
  }
  function normalizeHandoffMs(value) { return clamp(Number(value), 800, 4800, "2400"); }
  function normalizeHandoffBands(value) { return clamp(Number(value), 2, 8, "3"); }
  function normalizeHandoffStagger(value) { return clamp(Number(value), 0, 280, "120"); }
  function normalizeHandoffHold(value) { return clamp(Number(value), 200, 1800, "700"); }
  function normalizeHandoffIn(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return "420";
    return String(Math.round(Math.min(900, Math.max(80, n)) / 10) * 10);
  }
  function normalizeHandoffBeats(value) { return clamp(Number(value), 2, 8, "4"); }
  function normalizeHandoffTempo(value) {
    if (value === "" || value == null) return "0";
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) return "0";
    return String(Math.round(Math.min(800, Math.max(200, n))));
  }
  function handoffSettingsFrom(source = {}) {
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
  function resolveHandoffTempo(play, tempo) {
    const custom = Number(normalizeHandoffTempo(tempo));
    if (custom > 0) return custom;
    if (play === "storm") return 320;
    if (play === "breaker") return 620;
    if (play === "erupt") return 400;
    if (play === "calve") return 480;
    return 440;
  }
  function veilHandoffTiming(opts = {}) {
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
  function handoffRuntimeMs(id, opts = {}) {
    const kind = handoffById(id);
    if (kind === "none") return 0;
    const settings = handoffSettingsFrom(opts);
    if (kind === "pulse") return Number(settings.hbt) * resolveHandoffTempo(opts.play, settings.htm) + 720 + 520;
    if (kind === "wipe") return Number(settings.hms) + (Number(settings.hnb) - 1) * Number(settings.hst);
    if (kind === "iris" || kind === "doors" || kind === "mist") return Number(settings.hms);
    return veilHandoffTiming(settings).total;
  }
  function handoffBandsMarkup(count, claimHtml = "") {
    const n = Number(normalizeHandoffBands(count));
    const bits = [];
    for (let i = 0; i < n; i += 1) {
      bits.push(i === 0
        ? `<i class="ad-handoff-band" style="--i:${i}"><span class="ad-handoff-claim">${claimHtml}</span></i>`
        : `<i class="ad-handoff-band" style="--i:${i}"></i>`);
    }
    return bits.join("");
  }
  function applyHandoffSettings(container, opts = {}) {
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
    const kind = handoffById(opts.hand ?? container.dataset.handoff);
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
    const claimHtml = wrap.querySelector(".ad-handoff-claim")?.innerHTML ?? "";
    if (have !== Number(settings.hnb)) {
      wrap.innerHTML = handoffBandsMarkup(settings.hnb, claimHtml);
      return;
    }
    wrap.querySelectorAll(".ad-handoff-band").forEach((band, i) => {
      band.style.setProperty("--i", String(i));
    });
  }
  function runHandoff(container) {
    const kind = handoffById(container?.dataset.handoff);
    if (!container || kind === "none") return 0;
    applyHandoffSettings(container);
    const beat = resolveHandoffTempo(container.dataset.play, container.dataset.handoffTempo);
    container.style.setProperty("--handoff-beat", `${beat}ms`);
    container.classList.add("is-handoff");
    const opts = {
      play: container.dataset.play,
      hms: container.dataset.handoffMs,
      hnb: container.dataset.handoffBands,
      hst: container.dataset.handoffStagger,
      hhd: container.dataset.handoffHold,
      hbt: container.dataset.handoffBeats,
      htm: container.dataset.handoffTempo,
    };
    if (kind === "pulse") {
      const flashes = Number(opts.hbt) || 4;
      setTimeout(() => {
        container.classList.add("is-handoff-hold");
        setTimeout(() => container.classList.add("is-handoff-done"), 720 + 520);
      }, flashes * beat);
      return flashes * beat + 720 + 520;
    }
    if (kind === "veil") {
      const veil = veilHandoffTiming(opts);
      setTimeout(() => {
        container.classList.add("is-handoff-hold");
        setTimeout(() => container.classList.add("is-handoff-done"), veil.outMs);
      }, veil.inMs + veil.hold);
      return veil.total;
    }
    const ms = handoffRuntimeMs(kind, opts);
    setTimeout(() => container.classList.add("is-handoff-done"), ms);
    return ms;
  }
  function revealPlay(container) {
    if (!container || container.classList.contains("is-climax")) return 0;
    container.classList.add("is-climax");
    return runHandoff(container);
  }
  function propMs(action) {
    if (action === "space") return 7600;
    if (action === "star" || action === "cheer") return 5800;
    if (action === "turn") return 4400;
    if (action === "torch" || action === "torch-front" || action === "ball") return 4000;
    if (action === "toy") return 3800;
    return 3600;
  }
  function easeOut(t) { return 1 - (1 - Math.min(1, Math.max(0, t))) ** 3; }
  function easeIn(t, p = 3) { return Math.min(1, Math.max(0, t)) ** p; }
  function easeInOut(t) {
    const k = Math.min(1, Math.max(0, t));
    return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
  }
  function span(t, a, b) {
    if (b <= a) return t >= b ? 1 : 0;
    return Math.min(1, Math.max(0, (t - a) / (b - a)));
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function propCam(action, t) {
    const p = { a: 0, r: 1, punch: 0 };
    if (action === "torch" || action === "torch-front") {
      const sweep = t < 0.5
        ? lerp(-0.72, 0.78, easeInOut(span(t, 0.1, 0.42)))
        : lerp(0.78, -0.55, easeInOut(span(t, 0.54, 0.88)));
      p.a = sweep * 0.12;
      return p;
    }
    if (action === "turn") {
      p.a = easeInOut(t) * 0.42;
      return p;
    }
    if (action === "star" || action === "cheer" || action === "space") {
      const space = action === "space";
      const load = 0.18;
      const apex = 0.32;
      const spinEnd = space ? 0.55 : 0.68;
      const touch = 0.78;
      const squashEnd = 0.86;
      const air = space
        ? (t < load ? 0 : easeOut(span(t, load, apex)))
        : t < load ? 0 : t < spinEnd ? easeOut(span(t, load, apex)) : 1 - easeIn(span(t, spinEnd, touch), 2);
      p.r = 1 + air * (space ? 0.28 : 0.2);
      p.a = space
        ? easeInOut(span(t, spinEnd, 1)) * 0.16
        : t < touch ? 0 : easeInOut(span(t, touch, 1)) * 0.3;
      if (!space && t >= touch && t < squashEnd) p.punch = Math.sin(span(t, touch, squashEnd) * Math.PI) * 0.045;
      return p;
    }
    return p;
  }
  function splitOrbit(str) {
    const p = String(str || "").trim().split(/\s+/);
    return { th: p[0] || "0deg", ph: p[1] || "75deg", rad: p[2] || "3.2m" };
  }
  function numUnit(s) {
    const m = String(s).match(/^(-?[\d.]+)(.*)$/);
    return { n: Number(m?.[1]) || 0, u: m?.[2] || "" };
  }
  function liveCameraFromClip(box, mv) {
    if (!box || !mv || box.dataset.propCamMode === "pan") return;
    const d = Number(mv.duration) || 0;
    const t = d > 0.05 ? Math.min(1, Math.max(0, (Number(mv.currentTime) || 0) / d)) : 0;
    const cam = propCam(box.dataset.propAct, t);
    const base = splitOrbit(box.dataset.gwdOrbit || mv.getAttribute("camera-orbit"));
    const th = numUnit(base.th);
    const rad = numUnit(base.rad);
    const next = `${th.n + cam.a * (180 / Math.PI)}${th.u || "deg"} ${base.ph} ${rad.n * cam.r * (1 - cam.punch)}${rad.u || "m"}`;
    if (mv.cameraOrbit !== next) {
      mv.cameraOrbit = next;
      mv.setAttribute("camera-orbit", next);
      mv.jumpCameraToGoal?.();
    }
  }
  function freezeClimax(mv) {
    if (!mv) return;
    const d = Number(mv.duration);
    try {
      if (Number.isFinite(d) && d > 0.05) mv.currentTime = Math.max(0, d - 0.001);
    } catch { /* 1.6 */ }
    try { mv.pause(); } catch { /* 1.6 */ }
    try { mv.removeAttribute("autoplay"); } catch { /* */ }
    if ("animationLoop" in mv) mv.animationLoop = false;
  }
  function playSlotIntro(slot) {
    if (!slot) return;
    const id = String(slot.dataset.in || "none");
    if (id === "none") {
      slot.classList.add("is-in");
      return;
    }
    slot.classList.remove("is-in");
    requestAnimationFrame(() => slot.classList.add("is-in"));
  }
  function innerModelViewer(viewer) {
    if (!viewer) return null;
    if (String(viewer.tagName).toLowerCase() === "model-viewer") return viewer;
    return viewer.querySelector("model-viewer");
  }

  function setAttrIf(node, name, value) {
    if (!node) return;
    if (value == null || value === "") {
      if (node.hasAttribute(name)) node.removeAttribute(name);
      return;
    }
    const next = String(value);
    if (node.getAttribute(name) !== next) node.setAttribute(name, next);
  }

  function fillViewerBox(node) {
    if (!node?.style) return;
    node.style.setProperty("position", "absolute", "important");
    node.style.setProperty("inset", "0", "important");
    node.style.setProperty("left", "0", "important");
    node.style.setProperty("top", "0", "important");
    node.style.setProperty("width", "100%", "important");
    node.style.setProperty("height", "100%", "important");
    node.style.setProperty("max-width", "none", "important");
    node.style.setProperty("max-height", "none", "important");
    node.style.setProperty("transform", "none", "important");
  }

  function playClimaxClip(viewer) {
    const mv = innerModelViewer(viewer);
    if (!mv || typeof mv.play !== "function") return false;
    const names = Array.from(mv.availableAnimations || []);
    if (!names.length) return false;
    const name = names.includes("climax") ? "climax" : names[0];
    setAttrIf(mv, "animation-name", name);
    if (mv.animationName !== name) mv.animationName = name;
    if ("animationLoop" in mv) mv.animationLoop = false;
    if (mv.hasAttribute("animation-loop")) mv.removeAttribute("animation-loop");
    if (!mv.hasAttribute("autoplay")) mv.setAttribute("autoplay", "");
    const t = Number(mv.currentTime) || 0;
    if (mv.paused === false) return true;
    try { mv.play(); } catch { /* 1.6 */ }
    return mv.paused === false;
  }

  function pinPlayCamera(box, viewer) {
    const mv = innerModelViewer(viewer);
    if (!box) return;
    fillViewerBox(viewer);
    fillViewerBox(box.querySelector(".ad-stage"));
    if (!mv) return;
    const orbit = box.dataset.gwdOrbit;
    const fov = box.dataset.gwdFov;
    const radius = box.dataset.gwdRadius;
    const target = box.dataset.gwdTarget;
    const orient = box.dataset.gwdOrient;
    const stage = box.style.getPropertyValue("--gwd-stage") || "#f5f2ed";
    if (orbit) {
      setAttrIf(mv, "camera-orbit", orbit);
      mv.cameraOrbit = orbit;
    }
    if (fov) {
      setAttrIf(mv, "field-of-view", fov);
      setAttrIf(mv, "min-field-of-view", fov);
      setAttrIf(mv, "max-field-of-view", fov);
      mv.fieldOfView = fov;
    }
    if (radius) {
      setAttrIf(mv, "min-camera-orbit", `auto auto ${radius}m`);
      setAttrIf(mv, "max-camera-orbit", `auto auto ${radius}m`);
    }
    if (target && target !== "auto") {
      setAttrIf(mv, "camera-target", target);
      mv.cameraTarget = target;
    } else if (mv.hasAttribute("camera-target")) {
      mv.removeAttribute("camera-target");
      if ("cameraTarget" in mv) mv.cameraTarget = "auto";
    }
    if (orient) {
      setAttrIf(mv, "orientation", orient);
      mv.orientation = orient;
    }
    const meshScale = `${box.dataset.propSx || 1} ${box.dataset.propSy || 1} ${box.dataset.propSz || box.dataset.propSx || 1}`;
    if (typeof mv.scale === "string") {
      setAttrIf(mv, "scale", meshScale);
      mv.scale = meshScale;
    }
    fillViewerBox(mv);
    const soft = box.dataset.gwdSoft;
    if (soft) {
      setAttrIf(mv, "shadow-softness", soft);
      mv.shadowSoftness = soft;
    }
    mv.style.setProperty("background", stage);
    mv.style.setProperty("--poster-color", stage);
    if ("interpolationDecay" in mv) mv.interpolationDecay = 0;
    mv.jumpCameraToGoal?.();
  }

  function nestViewer(box) {
    const viewer = document.querySelector("gwd-3d-model-viewer, #gwd-model, #view")
      || box?.querySelector("model-viewer, gwd-3d-model-viewer");
    if (!viewer || !box || box.contains(viewer)) return viewer;
    let stage = box.querySelector(".ad-stage");
    if (!stage) {
      stage = document.createElement("div");
      stage.className = "ad-stage";
      box.prepend(stage);
    }
    stage.append(viewer);
    return viewer;
  }
  function flattenGwdStage() {
    document.documentElement.classList.add("gwd-unit");
    document.body.classList.add("player-embed", "gwd-unit");
    document.body.style.setProperty("transform", "none", "important");
    document.body.style.setProperty("perspective", "none", "important");
    document.body.style.setProperty("transform-style", "flat", "important");
  }

  function clipIsPlaying(mv) {
    if (!mv || typeof mv.play !== "function") return false;
    if (mv.loaded === false) return false;
    if (!Array.from(mv.availableAnimations || []).length) return false;
    if (mv.paused !== false) return false;
    return (Number(mv.currentTime) || 0) > 0.01;
  }

  function emitClipReady(box, mv, reason) {
    const detail = { reason: reason || "ready", time: Number(mv?.currentTime) || 0 };
    box.dispatchEvent(new CustomEvent("gwd-clip-ready", { bubbles: true, detail }));
    window.dispatchEvent(new CustomEvent("gwd-clip-ready", { detail }));
  }

  function boot() {
    flattenGwdStage();
    const box = document.querySelector(".ad-container");
    if (!box) return;
    applyHandoffSettings(box);
    const viewer = nestViewer(box);
    pinPlayCamera(box, viewer);
    let pinnedInner = innerModelViewer(viewer);
    let clipArmed = false;
    let kicking = false;
    let playStarted = 0;
    let handoffTimer = 0;
    let lastT = 0;
    let joined = false;
    const delay = Number(box.dataset.propMs) || propMs(box.dataset.propAct);
    const go = () => {
      if (joined || box.classList.contains("is-climax")) return;
      joined = true;
      if (handoffTimer) clearTimeout(handoffTimer);
      const mv = innerModelViewer(viewer);
      freezeClimax(mv);
      liveCameraFromClip(box, mv);
      revealPlay(box);
    };
    const armHandoff = (reason) => {
      if (handoffTimer) return;
      const mv = innerModelViewer(viewer);
      playStarted = Date.now();
      playSlotIntro(document.querySelector(".ad-slot"));
      emitClipReady(box, mv, reason);
      const clipMs = Number(mv?.duration) > 0.2 ? Math.round(Number(mv.duration) * 1000) : delay;
      handoffTimer = setTimeout(go, clipMs);
    };
    const tryReady = (reason) => {
      if (clipArmed) return;
      const mv = innerModelViewer(viewer);
      if (!clipIsPlaying(mv)) return;
      clipArmed = true;
      armHandoff(reason);
    };
    const kick = () => {
      if (clipArmed || kicking) return;
      kicking = true;
      try {
        const inner = innerModelViewer(viewer);
        if (inner && inner !== pinnedInner) {
          pinPlayCamera(box, viewer);
          pinnedInner = inner;
        }
        playClimaxClip(viewer);
        tryReady("kick");
      } finally {
        kicking = false;
      }
    };
    kick();
    const watch = (node) => {
      if (!node || node.dataset.gwdPlayKick === "1") return;
      node.dataset.gwdPlayKick = "1";
      node.addEventListener("load", () => { kick(); tryReady("load"); });
      node.addEventListener("preload", kick);
      node.addEventListener("model-visibility", (event) => {
        kick();
        if (event.detail?.visible !== false) tryReady("visible");
      });
      node.addEventListener("play", () => tryReady("play"));
      node.addEventListener("scene-rendered", () => tryReady("rendered"));
    };
    watch(viewer);
    watch(innerModelViewer(viewer));
    const obs = viewer && new MutationObserver(() => {
      watch(innerModelViewer(viewer));
      kick();
    });
    if (viewer && obs) obs.observe(viewer, { childList: true, subtree: true });
    window.addEventListener("adinitialized", kick);
    window.addEventListener("WebComponentsReady", kick);
    viewer?.addEventListener("scene-rendered", kick);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) kick();
    });
    [50, 120, 240, 480, 900, 1600, 2800, 4500, 7000].forEach((ms) => setTimeout(() => { kick(); tryReady("poll"); }, ms));
    const pollReady = () => {
      if (joined) return;
      const mv = innerModelViewer(viewer);
      if (!clipArmed) {
        kick();
        tryReady("raf");
      }
      liveCameraFromClip(box, mv);
      const t = Number(mv?.currentTime) || 0;
      const d = Number(mv?.duration) || 0;
      if (clipArmed && d > 0.2 && (t >= d - 0.03 || (lastT > d * 0.55 && t + 0.12 < lastT))) {
        go();
        return;
      }
      lastT = t;
      requestAnimationFrame(pollReady);
    };
    requestAnimationFrame(pollReady);
    box.addEventListener("click", go);
    box.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        go();
      }
    });
    box.tabIndex = 0;
    const onDone = () => go();
    viewer?.addEventListener("finished", onDone);
    const armFinished = () => {
      innerModelViewer(viewer)?.addEventListener("finished", onDone);
    };
    armFinished();
    viewer?.addEventListener("load", armFinished);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
