/* Misma máquina que handoff-run.js + applyHandoffSettings. Sin Babylon. */
(function () {
  const HANDS = ["none", "wipe", "veil", "pulse", "iris", "doors", "mist"];
  const VEIL_ENTER_MS = 640;

  function clamp(n, lo, hi, fallback) {
    if (!Number.isFinite(n)) return fallback;
    return String(Math.round(Math.min(hi, Math.max(lo, n))));
  }
  function paintStudioEnv(recipe) {
    if (!recipe) return "";
    var W = 256;
    var H = 128;
    var buf = new Float32Array(W * H * 4);
    var ambient = (0.1 + (recipe.wi || 0) * 0.4) * (recipe.ei || 0.85);
    var wr = (recipe.w && recipe.w[0]) || 0.9;
    var wg = (recipe.w && recipe.w[1]) || 0.88;
    var wb = (recipe.w && recipe.w[2]) || 0.84;
    var j;
    var i;
    for (j = 0; j < H; j += 1) {
      var v = (j + 0.5) / H;
      var y = Math.sin((0.5 - v) * Math.PI);
      var hem = y >= 0 ? 0.72 + y * 0.38 : 0.42 + y * 0.18;
      var ar = wr * ambient * hem;
      var ag = wg * ambient * hem;
      var ab = wb * ambient * hem;
      for (i = 0; i < W; i += 1) {
        var k = (j * W + i) * 4;
        buf[k] = ar;
        buf[k + 1] = ag;
        buf[k + 2] = ab;
        buf[k + 3] = 1;
      }
    }
    (recipe.l || []).forEach(function (lamp) {
      var lx = -lamp.d[0];
      var ly = -lamp.d[1];
      var lz = -lamp.d[2];
      var len = Math.hypot(lx, ly, lz) || 1;
      var dx = lx / len;
      var dy = ly / len;
      var dz = lz / len;
      var rad = Math.max(0.02, lamp.r);
      var power = Math.max(14, 1 / (rad * rad));
      var cr = lamp.c[0];
      var cg = lamp.c[1];
      var cb = lamp.c[2];
      var row;
      var col;
      for (row = 0; row < H; row += 1) {
        var lat = (0.5 - (row + 0.5) / H) * Math.PI;
        var sy = Math.sin(lat);
        var xz = Math.cos(lat);
        for (col = 0; col < W; col += 1) {
          var lon = ((col + 0.5) / W - 0.5) * Math.PI * 2;
          var ndot = xz * Math.sin(lon) * dx + sy * dy + xz * Math.cos(lon) * dz;
          if (ndot <= 0.002) continue;
          var fall = Math.pow(ndot, power);
          if (fall < 1e-5) continue;
          var pk = (row * W + col) * 4;
          var gain = lamp.e * fall;
          buf[pk] += cr * gain;
          buf[pk + 1] += cg * gain;
          buf[pk + 2] += cb * gain;
        }
      }
    });
    function rgbe(r, g, b) {
      var peak = Math.max(r, g, b);
      if (!(peak > 1e-32)) return [0, 0, 0, 0];
      var e = Math.floor(Math.log2(peak)) + 1;
      var s = 256 / Math.pow(2, e);
      return [Math.min(255, Math.floor(r * s)), Math.min(255, Math.floor(g * s)), Math.min(255, Math.floor(b * s)), e + 128];
    }
    function rle(values) {
      var out = [];
      var at = 0;
      while (at < values.length) {
        var val = values[at];
        var run = 1;
        while (at + run < values.length && run < 127 && values[at + run] === val) run += 1;
        if (run >= 4) {
          out.push(128 + run, val);
          at += run;
          continue;
        }
        var dumpAt = at;
        var dump = 1;
        at += 1;
        while (at < values.length && dump < 127) {
          var ahead = 1;
          var next = values[at];
          while (at + ahead < values.length && ahead < 4 && values[at + ahead] === next) ahead += 1;
          if (ahead >= 4) break;
          dump += 1;
          at += 1;
        }
        out.push(dump);
        for (var d = 0; d < dump; d += 1) out.push(values[dumpAt + d]);
      }
      return out;
    }
    var header = "#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y " + H + " +X " + W + "\n";
    var body = [];
    for (j = 0; j < H; j += 1) {
      body.push(2, 2, (W >> 8) & 255, W & 255);
      var ch = [[], [], [], []];
      for (i = 0; i < W; i += 1) {
        var pix = rgbe(buf[(j * W + i) * 4], buf[(j * W + i) * 4 + 1], buf[(j * W + i) * 4 + 2]);
        ch[0].push(pix[0]);
        ch[1].push(pix[1]);
        ch[2].push(pix[2]);
        ch[3].push(pix[3]);
      }
      ch.forEach(function (channel) { Array.prototype.push.apply(body, rle(channel)); });
    }
    var bytes = new Uint8Array(header.length + body.length);
    for (i = 0; i < header.length; i += 1) bytes[i] = header.charCodeAt(i);
    bytes.set(body, header.length);
    return URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" })) + "#.hdr";
  }
  function envFromBox(box, mv) {
    if (!mv || !box) return;
    var raw = box.dataset.gwdLights || "";
    var env = "";
    if (raw) {
      if (box._gwdLightsPainted === raw) return;
      try { env = paintStudioEnv(JSON.parse(decodeURIComponent(raw))); } catch (err) { env = ""; }
      if (box._gwdEnvBlob) {
        try { URL.revokeObjectURL(box._gwdEnvBlob); } catch (err) { /* already gone */ }
      }
      box._gwdEnvBlob = env && env.startsWith("blob:") ? env.split("#")[0] : "";
      box._gwdLightsPainted = raw;
    }
    if (!env) env = mv.getAttribute("environment-image") || box.dataset.gwdEnv || "";
    if (!env || env === "neutral") {
      mv.removeAttribute("environment-image");
      return;
    }
    if (mv.getAttribute("environment-image") === env) return;
    setAttrIf(mv, "environment-image", env);
    mv.environmentImage = env;
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
  function sceneOf(mv) {
    if (!mv) return null;
    const key = Object.getOwnPropertySymbols(mv).find((sym) => String(sym) === "Symbol(scene)");
    return key ? mv[key] : null;
  }
  function forceInView(mv) {
    if (!mv) return;
    const key = Object.getOwnPropertySymbols(mv).find((sym) => String(sym) === "Symbol(isElementInViewport)");
    if (key) mv[key] = true;
  }
  function askLoad(mv) {
    if (!mv) return;
    forceInView(mv);
    if (mv.loaded) return;
    const key = Object.getOwnPropertySymbols(mv).find((sym) => String(sym) === "Symbol(updateSource)");
    if (key && typeof mv[key] === "function") {
      try {
        const pending = mv[key]();
        if (pending && typeof pending.catch === "function") pending.catch(() => {});
      } catch { /* 1.6 */ }
    }
  }
  function driveClip(mv, t) {
    if (!mv) return;
    try { mv.currentTime = t; } catch { /* 1.6 */ }
    const scene = sceneOf(mv);
    if (!scene) return;
    try { scene.mixer && scene.mixer.setTime(t); } catch { /* 1.6 */ }
    try { scene.updateMatrixWorld(true); } catch { /* 1.6 */ }
    scene.isDirty = true;
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
    let dirty = false;
    if (mv.cameraOrbit !== next) {
      mv.cameraOrbit = next;
      mv.setAttribute("camera-orbit", next);
      dirty = true;
    }
    const climax = sceneOf(mv)?.getObjectByName?.("climax");
    if (climax) {
      const lookX = climax.position.x * 0.35;
      const lookY = Math.min(0.55, climax.position.y * 0.45 + 0.22);
      const look = `${lookX}m ${lookY}m 0m`;
      if (mv.cameraTarget !== look) {
        mv.cameraTarget = look;
        mv.setAttribute("camera-target", look);
        dirty = true;
      }
    }
    if (dirty) mv.jumpCameraToGoal?.();
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

  function bindClimaxClip(mv) {
    if (!mv || typeof mv.play !== "function") return false;
    if (mv.closest && mv.closest(".ad-container") && mv.closest(".ad-container").classList.contains("is-climax")) {
      return false;
    }
    const names = Array.from(mv.availableAnimations || []);
    if (!names.length) return false;
    const name = names.includes("climax") ? "climax" : names[0];
    setAttrIf(mv, "animation-name", name);
    if (mv.animationName !== name) mv.animationName = name;
    if ("animationLoop" in mv) mv.animationLoop = false;
    if (mv.hasAttribute("animation-loop")) mv.removeAttribute("animation-loop");
    forceInView(mv);
    try { mv.autoplay = true; } catch { /* 1.6 */ }
    if (!mv.hasAttribute("autoplay")) mv.setAttribute("autoplay", "");
    try { mv.play(); } catch { /* 1.6 arma el mixer */ }
    return Number(mv.duration) > 0.05;
  }

  function pinPlayCamera(box, viewer) {
    const mv = innerModelViewer(viewer);
    if (!box) return;
    fillViewerBox(viewer);
    fillViewerBox(box.querySelector(".ad-stage"));
    if (!mv) return;
    if (box.dataset.gwdPlaying === "1") {
      fillViewerBox(mv);
      return;
    }
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
    const sx = box.dataset.propSx || "0.72";
    const sy = box.dataset.propSy || sx;
    const sz = box.dataset.propSz || sx;
    const meshScale = `${sx} ${sy} ${sz}`;
    setAttrIf(mv, "scale", meshScale);
    try { mv.scale = meshScale; } catch { /* 1.6 / wrapper GWD */ }
    fillViewerBox(mv);
    const soft = box.dataset.gwdSoft;
    if (soft) {
      setAttrIf(mv, "shadow-softness", soft);
      mv.shadowSoftness = soft;
    }
    const exposure = box.dataset.gwdExposure;
    if (exposure) {
      setAttrIf(mv, "exposure", exposure);
      try { mv.exposure = exposure; } catch { /* 1.6 */ }
    }
    if (box.dataset.propFloor === "0") {
      setAttrIf(mv, "shadow-intensity", "0");
      try { mv.shadowIntensity = 0; } catch { /* 1.6 */ }
    } else if (box.dataset.gwdShadow) {
      setAttrIf(mv, "shadow-intensity", box.dataset.gwdShadow);
      try { mv.shadowIntensity = box.dataset.gwdShadow; } catch { /* 1.6 */ }
    }
    const floorX = box.dataset.gwdFloorX;
    const floorY = box.dataset.gwdFloorY;
    const floorW = box.dataset.gwdFloorW;
    if (floorX) box.style.setProperty("--gwd-floor-x", floorX);
    if (floorY) box.style.setProperty("--gwd-floor-y", floorY);
    if (floorW) box.style.setProperty("--gwd-floor-w", floorW);
    const ensureLayer = (cls, before) => {
      if (box.querySelector(`.${cls}`)) return;
      const layer = document.createElement("div");
      layer.className = cls;
      layer.setAttribute("aria-hidden", "true");
      if (before && box.contains(before)) box.insertBefore(layer, before);
      else box.append(layer);
    };
    ensureLayer("ad-prop-world", box.querySelector(".ad-prop-floor"));
    ensureLayer("ad-prop-floor");
    ["ad-prop-key", "ad-prop-fill", "ad-prop-rim", "ad-prop-extras", "ad-prop-aim", "ad-prop-pal"].forEach((cls) => ensureLayer(cls));
    const aim = box.querySelector(".ad-prop-aim");
    if (aim) {
      const mode = box.dataset.propAim || "none";
      aim.dataset.aim = mode;
      aim.hidden = mode === "none";
      const n = mode === "multi" ? 3 : mode === "spot" ? 1 : 0;
      if (aim.querySelectorAll(".ad-prop-aim-beam").length !== n) {
        aim.innerHTML = Array.from({ length: n }, (_, i) => `<i class="ad-prop-aim-beam" style="--i:${i}"></i>`).join("");
      }
    }
    const pal = box.querySelector(".ad-prop-pal");
    if (pal && !pal.querySelector(".ad-prop-pal-object")) {
      pal.innerHTML = '<i class="ad-prop-pal-stand"></i><i class="ad-prop-pal-object"></i><i class="ad-prop-pal-ball"></i><i class="ad-prop-pal-beam"></i><i class="ad-prop-pal-star"></i>';
    }
    mv.style.setProperty("background", stage);
    mv.style.setProperty("--poster-color", stage);
    envFromBox(box, mv);
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
    const sceneCanvas = box.querySelector("canvas.ad-gwd-canvas");
    const sceneOnly = Boolean(box.querySelector(".ad-gwd-scene") || sceneCanvas) && !innerModelViewer(viewer);
    if (sceneOnly) {
      playSlotIntro(document.querySelector(".ad-slot"));
      function goScene() {
        revealPlay(box);
      }
      if (sceneCanvas) {
        const startCanvas = () => {
          if (typeof window.bootPlay2D !== "function") return false;
          window.bootPlay2D(box, { canvas: sceneCanvas, onReveal: goScene });
          return true;
        };
        if (!startCanvas()) {
          window.addEventListener("play-2d-ready", startCanvas, { once: true });
          const delay = Number(box.dataset.gwdBodyMs) || Number(box.dataset.propMs) || 2400;
          setTimeout(() => {
            if (typeof window.bootPlay2D !== "function") goScene();
          }, delay);
        }
        return;
      }
      const delay = Number(box.dataset.gwdBodyMs) || Number(box.dataset.propMs) || 2400;
      setTimeout(goScene, delay);
      box.addEventListener("click", goScene);
      box.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          goScene();
        }
      });
      box.tabIndex = 0;
      return;
    }
    let pinnedInner = innerModelViewer(viewer);
    let clipArmed = false;
    let kicking = false;
    let clipOrigin = 0;
    let clipPauseAt = 0;
    let clipSrc = "";
    let joined = false;
    const bootAt = performance.now();
    const delay = Number(box.dataset.propMs) || propMs(box.dataset.propAct);
    playSlotIntro(document.querySelector(".ad-slot"));
    askLoad(innerModelViewer(viewer));
    const go = () => {
      if (joined || box.classList.contains("is-climax")) return;
      joined = true;
      box.dataset.gwdPlaying = "0";
      const mv = innerModelViewer(viewer);
      freezeClimax(mv);
      liveCameraFromClip(box, mv);
      revealPlay(box);
    };
    const failSafe = () => {
      if (joined) return;
      if (box.dataset.gwdPaused === "1") {
        setTimeout(failSafe, 700);
        return;
      }
      const mv = innerModelViewer(viewer);
      const loading = Boolean(mv && mv.src && !mv.loaded && performance.now() - bootAt < 20000);
      if (loading) {
        askLoad(mv);
        setTimeout(failSafe, 700);
        return;
      }
      if (!clipArmed) go();
    };
    setTimeout(failSafe, delay + 1600);
    const stepClip = (mv) => {
      if (!mv || joined) return;
      if (box.dataset.gwdPaused === "1") {
        if (!clipPauseAt) clipPauseAt = performance.now();
        try { mv.pause(); } catch { /* 1.6 */ }
        liveCameraFromClip(box, mv);
        return;
      }
      if (clipPauseAt) {
        if (clipOrigin) clipOrigin += performance.now() - clipPauseAt;
        clipPauseAt = 0;
      }
      askLoad(mv);
      if (!mv.loaded) return;
      if (clipSrc !== String(mv.src || "")) {
        clipSrc = String(mv.src || "");
        clipOrigin = 0;
        clipArmed = false;
      }
      if (!bindClimaxClip(mv)) return;
      const d = Number(mv.duration) || 0;
      if (d < 0.05) return;
      if (!clipOrigin) {
        clipOrigin = performance.now();
        box.dataset.gwdPlaying = "1";
        driveClip(mv, 0);
        try { mv.play(); } catch { /* 1.6 */ }
      }
      const t = Math.min(d, (performance.now() - clipOrigin) / 1000);
      const shown = Number(mv.currentTime) || 0;
      if (mv.paused || Math.abs(shown - t) > 0.12) {
        driveClip(mv, t);
        try { mv.play(); } catch { /* 1.6 */ }
      }
      liveCameraFromClip(box, mv);
      if (!clipArmed && t > 0.01) {
        clipArmed = true;
        emitClipReady(box, mv, "clock");
      }
      if (t >= d - 0.02) go();
    };
    const kick = () => {
      if (joined || kicking) return;
      kicking = true;
      try {
        const inner = innerModelViewer(viewer);
        if (inner && inner !== pinnedInner) {
          pinPlayCamera(box, viewer);
          pinnedInner = inner;
        }
        stepClip(inner);
      } finally {
        kicking = false;
      }
    };
    kick();
    const watch = (node) => {
      if (!node || node.dataset.gwdPlayKick === "1") return;
      node.dataset.gwdPlayKick = "1";
      node.addEventListener("load", () => {
        clipOrigin = 0;
        clipArmed = false;
        clipSrc = "";
        kick();
      });
      node.addEventListener("preload", kick);
      node.addEventListener("model-visibility", kick);
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
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) kick();
    });
    [50, 120, 240, 480, 900, 1600, 2800].forEach((ms) => setTimeout(kick, ms));
    const pollReady = () => {
      if (joined) return;
      stepClip(innerModelViewer(viewer));
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
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
