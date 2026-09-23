function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function easeIn(t, p = 2.4) {
  const k = Math.min(1, Math.max(0, t));
  return k ** p;
}

function easeOut(t) {
  const k = Math.min(1, Math.max(0, t));
  return 1 - (1 - k) ** 3;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function noise1(u, seed, freq) {
  return Math.sin(u * freq + seed * 6.2) * 0.55
    + Math.sin(u * freq * 2.15 + seed * 13.7) * 0.28
    + Math.sin(u * freq * 4.4 + seed * 3.1) * 0.12;
}

function isStroke(kind) {
  return kind === "particles" || kind === "tube" || kind === "line"
    || kind === "hearts" || kind === "petals" || kind === "star"
    || kind === "chispa" || kind === "custom";
}

function glyphKind(kind) {
  return kind === "hearts" || kind === "petals" || kind === "star"
    || kind === "chispa" || kind === "particles" || kind === "custom";
}

function glyphPx(base, text) {
  const n = Math.max(1, [...String(text || "")].length);
  return Math.max(8, Math.round(base * Math.min(1, 2.4 / n)));
}

function glyphChar(kind, mark) {
  if (kind === "custom") return mark || "✦";
  if (kind === "hearts") return "♥";
  if (kind === "petals") return "❀";
  if (kind === "star") return "★";
  if (kind === "particles") return "✦";
  return "✦";
}

const TRAIL_FONT = '"DejaVu Sans","Noto Sans Symbols 2","Segoe UI Symbol",sans-serif';
const FAST_CANVAS = typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent);
const glyphSprites = new Map();
let glowLayer = null;
let glowCtx = null;
let trailPaintWarmed = "";

function stampGlyph(ctx, text, px, color) {
  const size = Number(px) || 8;
  if (!FAST_CANVAS) {
    ctx.font = `700 ${size}px ${TRAIL_FONT}`;
    ctx.fillStyle = color;
    ctx.fillText(text, 0, 0);
    return;
  }
  const key = `${text}|${color}`;
  let sprite = glyphSprites.get(key);
  if (!sprite) {
    if (glyphSprites.size > 64) glyphSprites.clear();
    const canon = 64;
    const side = canon * 3;
    const canvas = document.createElement("canvas");
    canvas.width = side;
    canvas.height = side;
    const g = canvas.getContext("2d", { alpha: true });
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.font = `700 ${canon}px ${TRAIL_FONT}`;
    g.fillStyle = color;
    g.fillText(text, side / 2, side / 2);
    sprite = canvas;
    glyphSprites.set(key, sprite);
  }
  const dest = size * 3;
  ctx.drawImage(sprite, -dest / 2, -dest / 2, dest, dest);
}

function withFoxGlow(ctx, draw) {
  if (!FAST_CANVAS) {
    draw(ctx);
    return;
  }
  const w = ctx.canvas.width | 0;
  const h = ctx.canvas.height | 0;
  if (w < 2 || h < 2) return;
  if (!glowLayer || glowLayer.width !== w || glowLayer.height !== h) {
    glowLayer = document.createElement("canvas");
    glowLayer.width = w;
    glowLayer.height = h;
    glowCtx = glowLayer.getContext("2d", { alpha: true });
  }
  const g = glowCtx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = "source-over";
  g.shadowBlur = 0;
  g.clearRect(0, 0, w, h);
  draw(g);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(glowLayer, 0, 0);
  ctx.restore();
}

function trailUsesGpu(kind, draw2d) {
  return Boolean(kind) && kind !== "none" && !draw2d && !glyphKind(kind);
}

export function propTrailUsesGpu(spec) {
  return trailUsesGpu(spec?.kind, spec?.draw2d === true);
}

export async function warmPropTrail(spec) {
  const kind = spec?.kind || "none";
  if (!kind || kind === "none") return;
  const text = glyphChar(kind, spec?.char);
  const key = `${kind}|${text}`;
  if (trailPaintWarmed === key) return;
  const font = `700 ${glyphPx(28, text)}px ${TRAIL_FONT}`;
  try {
    if (document.fonts?.load) {
      await Promise.all(
        ["DejaVu Sans", "Noto Sans Symbols 2", "Segoe UI Symbol"].map((name) =>
          document.fonts.load(`700 28px "${name}"`, text).catch(() => {})
        )
      );
    }
  } catch { /* la fuente del sistema se resuelve al dibujar */ }
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = font;
  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(24,16,28,0.5)";
  ctx.strokeText(text, 64, 48);
  ctx.fillStyle = "rgb(242,41,82)";
  ctx.fillText(text, 64, 48);
  const glow = ctx.createRadialGradient(64, 88, 0, 64, 88, 22);
  glow.addColorStop(0, "rgba(255,255,255,0.95)");
  glow.addColorStop(0.35, "rgba(242,41,82,0.8)");
  glow.addColorStop(1, "rgba(242,41,82,0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(64, 88, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.moveTo(16, 100);
  ctx.lineTo(64, 70);
  ctx.lineTo(112, 96);
  ctx.strokeStyle = "rgba(255,248,255,0.8)";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.getImageData(0, 0, 1, 1);
  trailPaintWarmed = key;
}

export async function warmPropTrailGpu(BABYLON, scene, spec) {
  if (!trailUsesGpu(spec?.kind, spec?.draw2d === true)) return;
  const fx = attachPropTrail(BABYLON, scene);
  try {
    fx.use(spec.kind, { r: 1, g: 1, b: 1 }, false, 1.3, 1, 1, "burst", null, null, 1400, 1);
    fx.tick(0.4, { x: 0, y: 0.4, z: 0 });
    const meshes = scene.meshes.filter((mesh) => mesh?.name === "trailBrush" || mesh?.name === "trailWand" || mesh?.name === "trailDrop" || mesh?.name === "trailSplash");
    await Promise.all(meshes.map((mesh) => {
      mesh.setEnabled(true);
      if (!mesh.material?.forceCompilationAsync) return Promise.resolve();
      return mesh.material.forceCompilationAsync(mesh).catch(() => {});
    }));
    if (scene.activeCamera) scene.render();
  } finally {
    fx.dispose();
  }
}

export function trailFlight(kind, u, target, strand = 0) {
  const k = Math.min(1, Math.max(0, u));
  const seed = 0.17 + strand * 1.37;
  const fade = 1 - k;

  if (isStroke(kind)) {
    const t = easeOut(k);
    const bow = Math.sin(k * Math.PI);
    return {
      x: lerp(target.x - 0.5, target.x, t) + bow * 0.1,
      y: lerp(target.y + 0.68, target.y + 0.04, t) + bow * 0.12,
      z: lerp(target.z + 0.02, target.z, t),
      stretch: 1,
      squash: 0,
      splash: 0,
    };
  }

  if (kind === "gota") {
    const fall = easeIn(Math.min(1, k / 0.76), 2.05);
    const wobble = Math.sin(k * 11.5) * 0.1 * (1 - fall) + Math.sin(k * 23 + 1.2) * 0.04 * fade;
    const splash = k > 0.76 ? easeOut((k - 0.76) / 0.24) : 0;
    return {
      x: lerp(0.08, target.x, fall) + wobble * (1 - splash),
      y: lerp(1.12, target.y, fall) - splash * 0.03,
      z: lerp(0.06, target.z, fall),
      stretch: 1 + (1 - fall) * 0.7 - splash * 0.4,
      squash: splash * 0.62,
      splash,
    };
  }

  if (kind === "liana") {
    const t = k;
    const s = noise1(k, seed, 8.2);
    return {
      x: lerp(target.x + 0.32, target.x, t) + s * 0.1 * fade + Math.sin(k * 5.4) * 0.06 * fade,
      y: lerp(target.y + 0.22, target.y, t) + Math.abs(s) * 0.08 * fade + Math.sin(k * Math.PI) * 0.1,
      z: lerp(-0.15 + strand * 0.08, target.z, t) + noise1(k, seed + 2, 6) * 0.12 * fade,
      stretch: 1,
      squash: 0,
      splash: 0,
    };
  }

  if (kind === "niebla") {
    const t = k;
    const s = noise1(k, seed, 4.4);
    return {
      x: lerp(0.7 - strand * 0.16, target.x, t) + s * 0.1 * fade,
      y: lerp(0.85 + (strand % 3) * 0.16, target.y, t) + Math.sin(k * 3.2 + seed) * 0.1 * fade,
      z: lerp(0.35 - strand * 0.06, target.z, t) + noise1(k, seed + 4, 3.6) * 0.1 * fade,
      stretch: 1,
      squash: 0,
      splash: 0,
    };
  }

  const t = k;
  const side = strand % 2 === 0 ? 1 : -1;
  const amp = kind === "brisa" ? 0.22 : 0.14;
  const s = noise1(k, seed, kind === "chispa" ? 14 : 7.2);
  const gust = Math.sin(k * (5.2 + strand) + seed) * amp * fade;
  return {
    x: lerp(target.x + 0.26 * side, target.x, t) + s * amp * 0.45 * fade + gust * 0.45,
    y: lerp(target.y + 0.32, target.y, t) + Math.sin(k * Math.PI) * 0.06 * fade,
    z: lerp(0.2 + strand * 0.05, target.z, t),
    stretch: 1,
    squash: 0,
    splash: k > 0.88 ? (k - 0.88) / 0.12 : 0,
  };
}

function inkBody(kind) {
  return kind === "line" || kind === "tube" || kind === "liana" || kind === "gota" || kind === "brisa";
}

function markBody(kind) {
  return kind === "particles" || kind === "hearts" || kind === "petals"
    || kind === "star" || kind === "niebla" || kind === "chispa";
}

function strandCount(kind) {
  if (kind === "none") return 0;
  if (kind === "brisa") return 2;
  return 1;
}

function liftColor(color) {
  let r = Number(color?.r);
  let g = Number(color?.g);
  let b = Number(color?.b);
  if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b) || r + g + b < 0.12) {
    r = 0.62;
    g = 0.86;
    b = 1;
  }
  const luma = 0.22 * r + 0.72 * g + 0.06 * b;
  if (luma < 0.55) {
    const add = 0.55 - luma;
    r = Math.min(1, r + add * 0.85);
    g = Math.min(1, g + add);
    b = Math.min(1, b + add * 1.15);
  }
  return { r, g, b };
}

export function attachPropTrail(BABYLON, scene) {
  const sprites = {};
  const brushes = [];
  let wand = null;
  let wandTex = null;
  const ahead = new BABYLON.Vector3();
  let paintLead = -1;
  let paintTail = -1;
  let glyphAim = { x: 0, y: 0.4, z: 0 };
  let wandHold = null;
  const world = new BABYLON.Vector3();
  const ident = BABYLON.Matrix.Identity();
  let kind = "none";
  let glyphMark = "✦";
  let drop = null;
  let splash = null;
  let armed = false;
  let ink = null;
  let inkColor = null;
  let inkGlow = null;
  let inkTail = null;
  let inkU = 0;
  let inkCon = 1.3;
  let inkMark = 1;
  let inkSpread = 1;
  let inkJoin = "burst";
  let inkPop = 1;
  let draw2d = false;
  let clock0 = 0;
  let loop = 0;
  let stampU = 0;
  let stampAt = 0;
  let settled = false;
  let aim = { x: 0, y: 0.5, z: 0 };
  let inkMs = 1500;

  const park = { x: 0, y: 0.5, z: 0 };

  function hostEl() {
    return scene.metadata?.host || adHostFallback();
  }

  function adHostFallback() {
    const canvas = scene.metadata?.displayCanvas || scene.getEngine()?.getRenderingCanvas?.();
    return canvas?.closest?.(".ad-container") || canvas?.parentElement || null;
  }

  function dropInk() {
    if (!ink) return;
    ink.canvas.remove();
    ink = null;
  }

  function ensureInk() {
    const host = hostEl();
    if (!host) return null;
    if (ink?.host === host && ink.canvas.isConnected) return ink;
    dropInk();
    const canvas = document.createElement("canvas");
    canvas.className = "ad-trail-2d";
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:8;background:transparent;mix-blend-mode:normal";
    host.appendChild(canvas);
    ink = { host, canvas, ctx: canvas.getContext("2d", { alpha: true, desynchronized: true }) };
    return ink;
  }

  function sizeInk() {
    if (!ink) return;
    const engine = scene.getEngine();
    const bw = Math.max(2, Math.round(engine?.getRenderWidth?.() || ink.host.clientWidth || 300));
    const bh = Math.max(2, Math.round(engine?.getRenderHeight?.() || ink.host.clientHeight || 250));
    if (ink.canvas.width !== bw || ink.canvas.height !== bh) {
      ink.canvas.width = bw;
      ink.canvas.height = bh;
    }
  }

  let projPack = null;
  function project(pos) {
    const cam = scene.activeCamera;
    const engine = scene.getEngine();
    if (!ink || !cam || !engine) return {
      x: (0.5 + pos.x * 0.2) * (ink?.canvas.width || 300),
      y: (0.58 - pos.y * 0.22) * (ink?.canvas.height || 250),
    };
    world.set(pos.x, pos.y, pos.z);
    const vw = projPack?.vw || Math.max(1, engine.getRenderWidth());
    const vh = projPack?.vh || Math.max(1, engine.getRenderHeight());
    const p = BABYLON.Vector3.Project(
      world,
      ident,
      projPack?.tm || scene.getTransformMatrix(),
      projPack?.vp || cam.viewport.toGlobal(vw, vh)
    );
    let x = (p.x / vw) * ink.canvas.width;
    let y = (p.y / vh) * ink.canvas.height;
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < -48 || y < -48
      || x > ink.canvas.width + 48 || y > ink.canvas.height + 48) {
      x = (0.5 + pos.x * 0.2) * ink.canvas.width;
      y = (0.58 - pos.y * 0.22) * ink.canvas.height;
    }
    return { x, y };
  }

  function inkRgb(color, fallback) {
    let r = Number(color?.r);
    let g = Number(color?.g);
    let b = Number(color?.b);
    if (!Number.isFinite(r) || !Number.isFinite(g) || !Number.isFinite(b)) {
      r = fallback?.r ?? 0.96;
      g = fallback?.g ?? 0.98;
      b = fallback?.b ?? 1;
    }
    return {
      r: Math.min(1, Math.max(0, r)),
      g: Math.min(1, Math.max(0, g)),
      b: Math.min(1, Math.max(0, b)),
    };
  }

  function mixInk() {
    const c = inkRgb(inkColor);
    const glow0 = inkRgb(inkGlow, { r: Math.min(1, c.r * 0.5 + 0.5), g: Math.min(1, c.g * 0.5 + 0.5), b: Math.min(1, c.b * 0.5 + 0.5) });
    const tail0 = inkRgb(inkTail, { r: c.r * 0.45, g: c.g * 0.5, b: c.b * 0.55 });
    const u = (Math.max(0.5, Math.min(2.2, inkCon)) - 1.3) * 0.55;
    const glow = {
      r: Math.min(1, Math.max(0, glow0.r + u * (1 - glow0.r))),
      g: Math.min(1, Math.max(0, glow0.g + u * (1 - glow0.g))),
      b: Math.min(1, Math.max(0, glow0.b + u * (1 - glow0.b))),
    };
    const tail = {
      r: Math.min(1, Math.max(0, tail0.r - u * tail0.r * 0.55)),
      g: Math.min(1, Math.max(0, tail0.g - u * tail0.g * 0.55)),
      b: Math.min(1, Math.max(0, tail0.b - u * tail0.b * 0.55)),
    };
    return {
      r: Math.round(c.r * 255),
      g: Math.round(c.g * 255),
      b: Math.round(c.b * 255),
      a: 1,
      dr: Math.round(glow.r * 255),
      dg: Math.round(glow.g * 255),
      db: Math.round(glow.b * 255),
      tr: Math.round(tail.r * 255),
      tg: Math.round(tail.g * 255),
      tb: Math.round(tail.b * 255),
    };
  }

  function alongInk(rgb, along) {
    const a = Math.max(0, Math.min(1, along));
    return {
      r: Math.round(rgb.tr + (rgb.r - rgb.tr) * a),
      g: Math.round(rgb.tg + (rgb.g - rgb.tg) * a),
      b: Math.round(rgb.tb + (rgb.b - rgb.tb) * a),
      dr: rgb.dr,
      dg: rgb.dg,
      db: rgb.db,
      a: rgb.a,
    };
  }

  function blob(ctx, x, y, rx, ry, rgb, rot, a) {
    const alpha = a == null ? rgb.a : a;
    if (alpha <= 0.02 || rx < 0.4 || ry < 0.4) return;
    ctx.beginPath();
    ctx.ellipse(x, y, rx * 1.2, ry * 1.2, rot || 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${alpha})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
    ctx.fill();
  }

  function joinFly() {
    const p = Number.isFinite(inkPop) ? inkPop : 1;
    return Math.min(0.92, Math.max(0.8, 0.83 + (p - 1) * 0.035));
  }

  function washPhase(u) {
    const fly = joinFly();
    const head = Math.min(1, Math.max(0, u / fly));
    const fade = u < fly ? 1 : Math.max(0, 1 - (u - fly) / (1 - fly));
    const tailLen = 0.2 + 0.28 * inkSpread;
    const tail = Math.max(0, head - tailLen);
    return { head, tail, fade };
  }

  function natureOff() {
    const m = Math.min(ink.canvas.width, ink.canvas.height);
    if (kind === "line" || kind === "tube") return 0;
    if (kind === "niebla") return m * 0.07;
    if (kind === "brisa") return m * 0.04;
    if (kind === "hearts" || kind === "petals" || kind === "star" || kind === "custom") return m * 0.02;
    if (kind === "particles") return m * 0.012;
    return m * 0.018;
  }

  function paintStroke2d(ctx, pts, rgb, dry) {
    if (pts.length < 2) return;
    const k = Math.min(ink.canvas.width, ink.canvas.height) / 250;
    const fade = 1 - dry;
    const tube = kind === "tube" || kind === "liana";
    const wide = (tube ? 22 : 11) * k * fade;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
    if (FAST_CANVAS) {
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.45 * fade})`;
      ctx.lineWidth = wide * 2.2;
      ctx.stroke();
    } else {
      ctx.shadowBlur = (tube ? 32 : 22) * k;
      ctx.shadowColor = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.95 * fade})`;
      ctx.strokeStyle = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.55 * fade})`;
      ctx.lineWidth = wide * 1.85;
      ctx.stroke();
      ctx.shadowBlur = (tube ? 18 : 12) * k;
    }
    ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.95 * fade})`;
    ctx.lineWidth = wide;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${(tube ? 0.55 : 0.7) * fade})`;
    ctx.lineWidth = wide * (tube ? 0.38 : 0.28);
    ctx.stroke();
    const head = pts[pts.length - 1];
    blob(ctx, head.x, head.y, wide * 0.7, wide * (tube ? 0.7 : 0.55), rgb, 0, rgb.a * fade);
    ctx.restore();
  }

  function paintMarks2d(ctx, pts, rgb, dry, strand, u) {
    if (!pts.length) return;
    if (kind === "line" || kind === "tube" || kind === "liana" || kind === "brisa") {
      paintStroke2d(ctx, pts, rgb, dry);
      return;
    }
    const k = Math.min(ink.canvas.width, ink.canvas.height) / 250;
    const fade = 1 - dry;
    const n = pts.length;
    const head = pts[n - 1];

    if (kind === "gota") {
      for (let i = 0; i < n - 1; i += 1) {
        const live = fade * (0.25 + i / n);
        blob(ctx, pts[i].x, pts[i].y, 3.2 * k * live, 5.5 * k * live, rgb, 0, rgb.a * live * 0.55);
      }
      const squash = dry > 0.35 ? 0.55 + (1 - dry) * 0.5 : 1.25 - u * 0.2;
      blob(ctx, head.x, head.y, 16 * k * fade, 24 * k * squash * fade, rgb, 0, rgb.a);
      if (dry > 0.18) {
        const splash = (dry - 0.18) / 0.82;
        for (let i = 0; i < 7; i += 1) {
          const a = (i / 7) * Math.PI * 2 + hash(strand);
          const d = (8 + hash(i) * 18) * splash * k * fade;
          blob(ctx, head.x + Math.cos(a) * d, head.y + Math.sin(a) * d * 0.42, 3 * k * fade, 2.4 * k * fade, rgb, 0, rgb.a * (1 - splash));
        }
      }
      return;
    }

    if (kind === "niebla") {
      for (let i = 0; i < n; i += 1) {
        const bloom = fade * (0.65 + hash(i + strand) * 0.5);
        blob(ctx, pts[i].x, pts[i].y, 32 * k * bloom, 20 * k * bloom, rgb, hash(i), rgb.a * 0.32 * fade);
        blob(ctx, pts[i].x + (hash(i + 3) - 0.5) * 12 * k, pts[i].y, 18 * k * bloom, 12 * k * bloom, rgb, 0, rgb.a * 0.2 * fade);
      }
      return;
    }

    for (let i = 0; i < n; i += 1) {
      const p = pts[i];
      const along = n === 1 ? 1 : i / (n - 1);
      const live = fade * (0.35 + along * 0.65) * (1 - dry * (1 - along) * 0.85);
      if (live < 0.1) continue;
      const rot = hash(i + strand * 4) * Math.PI;
      if (kind === "hearts") {
        const h = 28 * k * live * (0.78 + hash(i) * 0.5);
        ctx.globalAlpha = rgb.a * live;
        const g = ctx.createLinearGradient(p.x, p.y - h, p.x, p.y + h);
        g.addColorStop(0, `rgb(${rgb.dr},${rgb.dg},${rgb.db})`);
        g.addColorStop(1, `rgb(${rgb.r},${rgb.g},${rgb.b})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y + h * 0.38);
        ctx.bezierCurveTo(p.x - h * 0.82, p.y + h * 0.02, p.x - h * 0.48, p.y - h * 0.82, p.x, p.y - h * 0.28);
        ctx.bezierCurveTo(p.x + h * 0.48, p.y - h * 0.82, p.x + h * 0.82, p.y + h * 0.02, p.x, p.y + h * 0.38);
        ctx.fill();
      } else if (kind === "petals") {
        const rx = 11 * k * live * (0.8 + hash(i) * 0.45);
        const ry = 22 * k * live * (0.8 + hash(i + 2) * 0.4);
        blob(ctx, p.x, p.y, rx, ry, rgb, rot, rgb.a * live);
      } else if (kind === "star" || kind === "chispa") {
        const s = (kind === "chispa" ? 11 : 22) * k * live * (0.7 + hash(i) * 0.55);
        ctx.globalAlpha = rgb.a * live;
        ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.beginPath();
        for (let t = 0; t < 12; t += 1) {
          const ang = (t * Math.PI) / 6 - Math.PI / 2 + rot;
          const rad = (t % 2 === 0 ? s : s * 0.42);
          const x = p.x + Math.cos(ang) * rad;
          const y = p.y + Math.sin(ang) * rad;
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      } else if (kind === "particles") {
        const r = (7 + hash(i) * 9) * k * live * (0.55 + along);
        blob(ctx, p.x, p.y, r, r, rgb, 0, rgb.a * live);
        blob(ctx, p.x, p.y, r * 0.42, r * 0.42, { ...rgb, r: 255, g: 255, b: 255 }, 0, rgb.a * live * 0.85);
      } else {
        blob(ctx, p.x, p.y, (6 + hash(i) * 7) * k * live, (6 + hash(i) * 7) * k * live, rgb, 0, rgb.a * live);
      }
    }
    ctx.globalAlpha = 1;
  }

  function sampleWash(strand, grow, target) {
    const spread = natureOff();
    const dens = kind === "line" || kind === "tube" ? 42 : isStroke(kind) ? 32 : 18;
    const n = Math.max(2, Math.ceil(dens * Math.max(0.18, grow)));
    const pts = [];
    for (let s = 0; s <= n; s += 1) {
      const t = (s / n) * grow;
      const pos = trailFlight(kind, t, target, strand);
      const pt = project(pos);
      const seed = strand * 4.2 + s;
      pts.push({
        x: pt.x + (hash(seed) - 0.5) * spread,
        y: pt.y + (hash(seed + 2) - 0.5) * spread * 0.7,
      });
    }
    return pts;
  }

  function bez(t, a, b, c) {
    const u = 1 - t;
    return u * u * a + 2 * u * t * b + t * t * c;
  }

  function screenAt(t, strand) {
    const w = ink.canvas.width;
    const h = ink.canvas.height;
    const land = project(aim);
    const j = hash(strand + 1) - 0.5;
    let x0 = -w * 0.12 * inkSpread;
    let y0 = h * 0.06 + strand * h * 0.03 * inkSpread;
    let x1 = w * (0.5 + 0.12 * inkSpread) + j * w * 0.1 * inkSpread;
    let y1 = h * (0.62 + 0.16 * inkSpread);
    let x2 = land.x;
    let y2 = land.y;
    if (kind === "gota") {
      x0 = x2 = land.x + j * w * 0.04 * inkSpread;
      y0 = -h * 0.08;
      x1 = land.x + j * w * 0.08 * inkSpread;
      y1 = h * 0.4;
    } else if (kind === "niebla") {
      x0 = w * (0.08 + strand * 0.06 * inkSpread);
      y0 = h * (0.2 + (strand % 3) * 0.12 * inkSpread);
      x1 = w * (0.4 + j * 0.1 * inkSpread);
      y1 = h * (0.55 + strand * 0.05 * inkSpread);
    } else if (kind === "liana") {
      x0 = w * (1.05 - strand * 0.06 * inkSpread);
      y0 = h * (0.92 - strand * 0.1 * inkSpread);
      x1 = w * (0.35 + j * 0.16 * inkSpread);
      y1 = h * (0.18 + strand * 0.1 * inkSpread);
    } else if (kind === "brisa" || kind === "chispa") {
      x0 = -w * 0.04 * inkSpread;
      y0 = h * (0.08 + strand * 0.14 * inkSpread);
      x1 = w * (0.4 + j * 0.14 * inkSpread);
      y1 = h * (0.5 + strand * 0.06 * inkSpread);
    }
    const wob = kind === "gota" ? Math.sin(t * 14) * (1 - t) * w * 0.025 * inkSpread : 0;
    return {
      x: bez(t, x0, x1, x2) + wob,
      y: bez(t, y0, y1, y2),
    };
  }

  function cometPts(tail, head, strand) {
    const span = Math.max(0.04, head - tail);
    const n = 16;
    const pts = [];
    for (let i = 0; i <= n; i += 1) {
      pts.push(screenAt(tail + (i / n) * span, strand));
    }
    return pts;
  }

  function trace(ctx, pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i += 1) {
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + pts[i + 1].x) * 0.5, (pts[i].y + pts[i + 1].y) * 0.5);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function paintRibbonGlow(ctx, pts, left, right, rgb, maxW, fade, whiteWidth, whiteAlpha, tipR, tipA, traceCenter) {
    if (pts.length < 2) return;
    const tip = pts[pts.length - 1];
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (FAST_CANVAS) {
      const lift = (c) => Math.min(255, Math.round(c + (255 - c) * 0.28));
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${Math.min(1, 0.72 * fade)})`;
      ctx.lineWidth = maxW * 1.55;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);
      for (let i = 1; i < left.length; i += 1) ctx.lineTo(left[i].x, left[i].y);
      for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i].x, right[i].y);
      ctx.closePath();
      ctx.fillStyle = `rgba(${lift(rgb.r)},${lift(rgb.g)},${lift(rgb.b)},${Math.min(1, 0.9 * fade)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = `rgba(255,252,255,${Math.min(1, fade)})`;
      ctx.lineWidth = whiteWidth;
      ctx.stroke();
      glowBead(ctx, tip.x, tip.y, tipR, rgb, tipA);
      ctx.restore();
      return;
    }
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i += 1) ctx.lineTo(left[i].x, left[i].y);
    for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.55 * fade})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.85 * fade})`;
    ctx.lineWidth = maxW * 0.55;
    traceCenter();
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,248,255,${whiteAlpha})`;
    ctx.lineWidth = whiteWidth;
    traceCenter();
    ctx.stroke();
    glowBead(ctx, tip.x, tip.y, tipR, rgb, tipA);
    ctx.restore();
  }

  function glowStroke(ctx, pts, rgb, fade, tube) {
    if (pts.length < 2) return;
    const m = Math.min(ink.canvas.width, ink.canvas.height);
    const maxW = (tube ? 0.1 : 0.048) * m * fade * inkMark;
    const left = [];
    const right = [];
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i === 0 ? 0 : i - 1];
      const b = pts[i === pts.length - 1 ? i : i + 1];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const along = i / (pts.length - 1);
      const half = maxW * (0.08 + along * along * 0.92) * 0.5;
      dx /= len;
      dy /= len;
      left.push({ x: pts[i].x - dy * half, y: pts[i].y + dx * half });
      right.push({ x: pts[i].x + dy * half, y: pts[i].y - dx * half });
    }
    paintRibbonGlow(
      ctx, pts, left, right, rgb, maxW, fade,
      maxW * (tube ? 0.28 : 0.18),
      (tube ? 0.45 : 0.75) * fade,
      maxW * 1.15,
      fade,
      () => trace(ctx, pts)
    );
  }

  function glowBead(ctx, x, y, r, rgb, a) {
    if (a < 0.04 || r < 0.6) return;
    if (FAST_CANVAS) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${Math.min(1, a * 0.55)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.38, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,252,255,${Math.min(1, a)})`;
      ctx.fill();
      return;
    }
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb.dr},${rgb.dg},${rgb.db},${a})`);
    g.addColorStop(0.22, `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`);
    g.addColorStop(0.55, `rgba(${rgb.r},${rgb.g},${rgb.b},${a * 0.45})`);
    g.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHeartFx(ctx, x, y, s, rgb, a, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = a;
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-16, -2, -12, -18, 0, -10);
    ctx.bezierCurveTo(12, -18, 16, -2, 0, 10);
    ctx.closePath();
    const g = ctx.createLinearGradient(-8, -16, 8, 12);
    g.addColorStop(0, `rgb(${Math.min(255, rgb.r + 40)},${Math.min(255, rgb.g + 20)},${Math.min(255, rgb.b + 20)})`);
    g.addColorStop(1, `rgb(${rgb.r},${rgb.g},${rgb.b})`);
    ctx.fillStyle = g;
    ctx.shadowBlur = 0;
    ctx.fill();
    ctx.restore();
  }

  function drawStarFx(ctx, x, y, s, rgb, a, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = a;
    ctx.beginPath();
    for (let i = 0; i < 12; i += 1) {
      const ang = (i * Math.PI) / 6 - Math.PI / 2;
      const rad = i % 2 === 0 ? s : s * 0.42;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
    ctx.fill();
    ctx.restore();
  }

  function drawPetalFx(ctx, x, y, s, rgb, a, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = a;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s, 0, 0, Math.PI * 2);
    const g = ctx.createLinearGradient(0, -s, s * 0.2, s);
    g.addColorStop(0, `rgb(${rgb.dr},${rgb.dg},${rgb.db})`);
    g.addColorStop(0.45, `rgb(${rgb.r},${rgb.g},${rgb.b})`);
    g.addColorStop(1, `rgb(${Math.max(0, rgb.tr ?? rgb.r - 40)},${Math.max(0, rgb.tg ?? rgb.g - 50)},${Math.max(0, rgb.tb ?? rgb.b - 40)})`);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.restore();
  }

  function scatter(pts, i, m) {
    if (!pts.length) return { x: 0, y: 0 };
    const p = pts[Math.min(pts.length - 1, Math.max(0, i))];
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    let dx = b.x - a.x;
    let dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const k = (hash(i * 1.7 + 3) - 0.5) * m * 0.09 * inkSpread;
    return { x: p.x - (dy / len) * k, y: p.y + (dx / len) * k };
  }

  function paintFx(ctx, tail, head, fade) {
    if (fade < 0.04 || head <= tail) return;
    withFoxGlow(ctx, (g) => paintFxOn(g, tail, head, fade));
  }

  function paintFxOn(ctx, tail, head, fade) {
    const base = mixInk();
    const rgb = alongInk(base, 0.85);
    const n = Math.max(1, Math.min(4, strandCount(kind)));
    const m = Math.min(ink.canvas.width, ink.canvas.height);
    ctx.globalCompositeOperation = FAST_CANVAS ? "source-over" : "lighter";
    for (let s = 0; s < n; s += 1) {
      const vis = cometPts(tail, head, s);
      if (vis.length < 2) continue;
      const stroke = kind === "line" || kind === "tube" || kind === "liana" || kind === "brisa" || kind === "gota";
      if (stroke) glowStroke(ctx, vis, rgb, fade, kind === "tube" || (kind === "liana" && s === 0));
      if (kind === "particles" || kind === "chispa") {
        const marks = Math.round(6 + 8 * inkSpread);
        for (let i = 0; i < marks; i += 1) {
          const along = i / (marks - 1);
          const idx = Math.round(along * (vis.length - 1));
          const p = scatter(vis, idx, m);
          const live = fade * (0.2 + along * 0.8);
          const r = (kind === "chispa" ? 0.03 : 0.042) * m * live * (0.45 + along) * inkMark;
          const tint = alongInk(base, along);
          glowBead(ctx, p.x, p.y, r * 2.1, tint, live * 0.5);
          glowBead(ctx, p.x, p.y, r, tint, live);
        }
      }
      if (kind === "niebla") {
        for (let i = 0; i < vis.length; i += 3) {
          const along = i / (vis.length - 1);
          const p = scatter(vis, i, m);
          glowBead(ctx, p.x, p.y, 0.14 * m * fade * (0.4 + along) * inkMark, alongInk(base, along), fade * 0.2);
        }
      }
      if (kind === "gota") {
        const tip = vis[vis.length - 1];
        glowBead(ctx, tip.x, tip.y, 0.07 * m * fade * inkMark, rgb, fade);
      }
      if (kind === "hearts" || kind === "petals" || kind === "star") {
        const marks = Math.round(4 + 5 * inkSpread);
        for (let i = 0; i < marks; i += 1) {
          const along = (i + 1) / marks;
          const idx = Math.round(along * (vis.length - 1));
          const p = scatter(vis, idx, m);
          const live = fade * (0.35 + along * 0.65);
          const rot = (hash(i + s) - 0.5) * 0.8;
          const sc = (0.05 + along * 0.045) * m * live * inkMark;
          const tint = alongInk(base, along);
          if (kind === "hearts") drawHeartFx(ctx, p.x, p.y, sc / 14, tint, live, rot);
          else if (kind === "star") drawStarFx(ctx, p.x, p.y, sc, tint, live, rot);
          else drawPetalFx(ctx, p.x, p.y, sc, tint, live, rot + along);
        }
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  function paintJoin(ctx, k) {
    if (k < 0.02) return;
    const rgb = mixInk();
    const m = Math.min(ink.canvas.width, ink.canvas.height);
    const land = project(aim);
    const pop = Math.max(0.6, inkPop || 1);
    const snap = Math.min(1, k / Math.max(0.28, 0.62 - 0.12 * pop));
    const hold = Math.max(0, 1 - k / Math.max(0.42, 0.78 - 0.12 * pop));
    if (inkJoin === "morph") {
      const gather = (1 - snap) ** (1.2 + 0.25 * pop);
      const bw = m * (0.1 + gather * 0.08) * inkMark * (0.85 + 0.15 * pop);
      const bh = m * (0.13 + gather * 0.09) * inkMark * (0.85 + 0.15 * pop);
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = Math.min(1, 0.42 + 0.22 * pop) * hold;
      ctx.beginPath();
      ctx.ellipse(land.x, land.y, bw, bh, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},0.95)`;
      ctx.lineWidth = Math.max(1.4, m * 0.01 * inkMark * gather * pop);
      ctx.stroke();
      ctx.restore();
      const n = Math.round(8 + 5 * inkSpread + 4 * (pop - 1));
      for (let i = 0; i < n; i += 1) {
        const ang = (i / n) * Math.PI * 2;
        const orbit = gather * m * 0.16 * inkSpread * pop;
        const x = land.x + Math.cos(ang) * (bw * 0.78 + orbit);
        const y = land.y + Math.sin(ang) * (bh * 0.78 + orbit * 0.65);
        const live = hold * (0.35 + gather * 0.65);
        const sc = 0.032 * m * inkMark * live * (0.85 + 0.2 * pop);
        if (kind === "hearts") drawHeartFx(ctx, x, y, sc / 14, rgb, live, ang * 0.3);
        else if (kind === "star") drawStarFx(ctx, x, y, sc, rgb, live, ang);
        else if (kind === "petals") drawPetalFx(ctx, x, y, sc, rgb, live, ang);
        else glowBead(ctx, x, y, sc, rgb, live);
      }
    } else {
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      const rings = pop > 1.5 ? 3 : 2;
      for (let r = 0; r < rings; r += 1) {
        const along = Math.min(1, snap * (1.05 + 0.2 * pop) + r * 0.14);
        const rad = m * 0.07 * inkMark + along * m * 0.16 * inkSpread * pop;
        ctx.globalAlpha = Math.max(0, 0.95 - along * 0.85) * hold;
        ctx.beginPath();
        ctx.ellipse(land.x, land.y, rad, rad * 0.7, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgb(${rgb.r},${rgb.g},${rgb.b})`;
        ctx.lineWidth = Math.max(1.4, m * 0.014 * (1 - along) * inkMark * (0.75 + 0.35 * pop));
        ctx.stroke();
      }
      ctx.restore();
      const n = Math.round(8 + 4 * inkSpread + 6 * (pop - 1));
      const boom = Math.sin(Math.min(1, snap) * Math.PI);
      for (let i = 0; i < n; i += 1) {
        const ang = (i / n) * Math.PI * 2 + 0.18;
        const dist = boom * m * 0.18 * inkSpread * pop * (0.7 + hash(i) * 0.4);
        const x = land.x + Math.cos(ang) * dist;
        const y = land.y + Math.sin(ang) * dist * 0.66;
        glowBead(ctx, x, y, 0.022 * m * inkMark * hold * (0.8 + 0.25 * pop), rgb, Math.min(1, 0.7 * hold * pop));
      }
    }
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
  }

  function paintTrail(ctx, u) {
    if (!ctx || kind === "none") return;
    if (!(u > 0.012 && u < 0.995)) return;
    const cam = scene.activeCamera;
    const engine = scene.getEngine();
    if (cam && engine) {
      const vw = Math.max(1, engine.getRenderWidth());
      const vh = Math.max(1, engine.getRenderHeight());
      projPack = {
        vw,
        vh,
        tm: scene.getTransformMatrix(),
        vp: cam.viewport.toGlobal(vw, vh),
      };
    } else {
      projPack = null;
    }
    const prev = ink;
    ink = { host: hostEl(), canvas: ctx.canvas, ctx };
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    const { head, tail, fade } = washPhase(u);
    const fly = joinFly();
    const landK = u <= fly ? 0 : Math.min(1, (u - fly) / (1 - fly));
    paintFx(ctx, tail, head, fade * (1 - landK * 0.7));
    if (landK > 0.02) paintJoin(ctx, landK);
    ctx.restore();
    ink = prev;
  }

  function paintFrame(u) {
    if (!ensureInk()) return;
    sizeInk();
    const ctx = ink.ctx;
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, ink.canvas.width, ink.canvas.height);
    paintTrail(ctx, u);
  }

  function stopLoop() {
    if (loop) cancelAnimationFrame(loop);
    loop = 0;
  }

  function kick() {
    if (loop || kind === "none") return;
    loop = requestAnimationFrame(pump);
  }

  function pump(now) {
    loop = 0;
    if (kind === "none") return;
    inkU = Math.min(1, Math.max(0, stampU + (now - stampAt) / inkMs));
    if (stampU < 0.995) inkU = Math.min(inkU, 0.99);
    paintFrame(inkU);
    if (inkU < 1 && stampU < 1) kick();
  }

  function trailOnEngineCanvas() {
    const gl = scene.getEngine()?.getRenderingCanvas?.();
    const host = hostEl();
    return Boolean(draw2d && gl && host?.contains(gl));
  }

  function tickInk(u, target) {
    if (target) {
      aim.x = target.x;
      aim.y = target.y;
      aim.z = target.z;
    }
    stampU = u;
    stampAt = performance.now();
    if (u >= 0.995) {
      stopLoop();
      settled = true;
      inkU = 1;
      if (trailOnEngineCanvas()) paintFrame(1);
      return trailFlight(kind, 1, aim);
    }
    settled = false;
    inkU = u;
    if (trailOnEngineCanvas()) kick();
    return trailFlight(kind, inkU || u, aim);
  }

  function bootFx(color) {
    if (kind === "gota") bootDrop(color, parkAt(kind, 0, park));
    else {
      const n = Math.max(1, strandCount(kind));
      for (let i = 0; i < n; i += 1) bootBrush(color, i);
      if (!glyphKind(kind)) bootWand();
    }
    armed = true;
  }

  function cssTint() {
    const c = kindTint(inkColor);
    return {
      r: Math.round(c.r * 255),
      g: Math.round(c.g * 255),
      b: Math.round(c.b * 255),
    };
  }

  function dab(ctx, x, y, rad, ink, a) {
    if (rad < 1.5 || a <= 0.02) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(0.2, `rgba(${ink.r},${ink.g},${ink.b},${a})`);
    g.addColorStop(0.58, `rgba(${ink.r},${ink.g},${ink.b},${(a * 0.42).toFixed(3)})`);
    g.addColorStop(1, `rgba(${ink.r},${ink.g},${ink.b},0)`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  function arcAt(w, h, t) {
    const bow = Math.sin(t * Math.PI);
    return [
      w * (0.1 + 0.8 * t),
      h * (0.72 - t * 0.42) - bow * h * 0.16,
    ];
  }

  function brushDims() {
    return glyphKind(kind) ? [512, 280] : [256, 128];
  }

  function paintGlyphStroke(ctx, w, h, from, to, ink) {
    if (to <= 0.02) return;
    const count = kind === "particles" ? 8 : 6;
    const ch = glyphChar(kind, glyphMark);
    const font = '"DejaVu Sans","Noto Sans Symbols 2","Segoe UI Symbol",sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    for (let i = 0; i < count; i += 1) {
      const t = (i + 0.5) / count;
      if (t > to + 0.001 || t < from - 0.02) continue;
      const p = arcAt(w, h, t);
      const wob = (hash(i * 3.1 + 1) - 0.5) * h * 0.12;
      const rot = (hash(i * 5.7 + 2) - 0.5) * 0.7;
      const atTip = to - t < 0.5 / count;
      const alpha = t < from + 0.06 ? 0.28 : 1;
      const size = h * (atTip ? 0.42 : 0.28 + hash(i + 4) * 0.08);
      ctx.save();
      ctx.translate(p[0], p[1] + wob);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.font = `700 ${glyphPx(size, ch)}px ${font}`;
      ctx.lineWidth = Math.max(3, size * 0.09);
      ctx.strokeStyle = "rgba(24,16,28,0.5)";
      ctx.strokeText(ch, 0, 0);
      ctx.fillStyle = `rgb(${ink.r},${ink.g},${ink.b})`;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
    const slot = Math.round(to * count - 0.5);
    const slotT = (Math.max(0, slot) + 0.5) / count;
    if (to < 0.97 && Math.abs(to - slotT) > 0.045) {
      const p = arcAt(w, h, to);
      const size = h * 0.46;
      ctx.save();
      ctx.translate(p[0], p[1]);
      ctx.rotate(Math.sin(to * 14) * 0.28);
      ctx.font = `700 ${glyphPx(size, ch)}px ${font}`;
      ctx.lineWidth = Math.max(3, size * 0.09);
      ctx.strokeStyle = "rgba(24,16,28,0.5)";
      ctx.strokeText(ch, 0, 0);
      ctx.fillStyle = `rgb(${ink.r},${ink.g},${ink.b})`;
      ctx.fillText(ch, 0, 0);
      ctx.restore();
    }
  }

  function paintBrush(ctx, w, h, lead, tailAt) {
    ctx.clearRect(0, 0, w, h);
    const ink = cssTint();
    const from = Math.max(0, Math.min(1, tailAt || 0));
    const to = Math.max(from, Math.min(1, lead == null ? 1 : lead));
    if (kind === "gota") {
      dab(ctx, w * 0.5, h * 0.5, h * 0.46, ink, 0.95);
      return;
    }
    if (glyphKind(kind)) {
      paintGlyphStroke(ctx, w, h, from, to, ink);
      return;
    }
    if (to <= 0.02) return;
    const marks = kind === "particles" || kind === "hearts" || kind === "petals"
      || kind === "star" || kind === "niebla" || kind === "chispa";
    const steps = marks ? (kind === "particles" ? 10 : kind === "niebla" ? 8 : 5) : 26;
    const thin = kind === "line" || kind === "brisa" ? h * 0.08 : h * 0.12;
    const fat = kind === "tube" ? h * 0.36
      : kind === "liana" ? h * 0.28
        : kind === "line" || kind === "brisa" ? h * 0.16
          : kind === "niebla" ? h * 0.38
            : h * 0.24;
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      if (t < from - 0.03 || t > to) continue;
      const p = arcAt(w, h, t);
      const swell = Math.sin(Math.min(1, t / Math.max(0.08, to)) * Math.PI);
      const rad = thin + (fat - thin) * (0.28 + 0.72 * swell);
      const press = 0.7 + 0.3 * swell;
      const nxt = arcAt(w, h, Math.min(1, t + 0.05));
      const tx = nxt[0] - p[0];
      const ty = nxt[1] - p[1];
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl;
      const ny = tx / tl;
      const hairs = marks ? 1 : 5;
      for (let hair = 0; hair < hairs; hair += 1) {
        const u = hairs === 1 ? 0 : (hair / (hairs - 1) - 0.5) * rad * 1.15;
        const wob = Math.sin(t * 16 + hair * 1.7) * rad * 0.06;
        dab(ctx, p[0] + nx * u, p[1] + ny * u + wob, rad * (marks ? 0.55 : 0.2), ink, press * (kind === "niebla" ? 0.45 : 0.9));
      }
      dab(ctx, p[0], p[1], rad * 0.16, { r: 255, g: 255, b: 255 }, 0.55 * press);
      if (kind === "hearts" || kind === "petals" || kind === "star" || kind === "chispa") {
        stampMark(ctx, p[0], p[1], rad * 0.72, ink);
      }
    }
    const tip = arcAt(w, h, to);
    dab(ctx, tip[0], tip[1], fat * 0.22, ink, 0.95);
  }

  function stampMark(ctx, x, y, rad, ink) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = `rgb(${ink.r},${ink.g},${ink.b})`;
    if (kind === "hearts") {
      ctx.scale(rad * 0.11, rad * 0.11);
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.bezierCurveTo(-12, -1, -8, -12, 0, -6);
      ctx.bezierCurveTo(8, -12, 12, -1, 0, 7);
      ctx.fill();
    } else if (kind === "petals") {
      ctx.rotate(-0.45);
      ctx.beginPath();
      ctx.ellipse(0, 0, rad * 0.42, rad, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.beginPath();
      ctx.ellipse(-rad * 0.12, -rad * 0.2, rad * 0.14, rad * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      for (let k = 0; k < 10; k += 1) {
        const a = (k * Math.PI) / 5 - Math.PI / 2;
        const rr = k % 2 === 0 ? rad : rad * 0.42;
        const px = Math.cos(a) * rr;
        const py = Math.sin(a) * rr;
        if (k === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function brushTex() {
    const name = `brush-${kind}`;
    if (sprites[name]) return sprites[name];
    const [w, h] = brushDims();
    const tex = new BABYLON.DynamicTexture(`trailBrush-${kind}`, { width: w, height: h }, scene, false);
    paintBrush(tex.getContext(), w, h, 0, 0);
    tex.hasAlpha = true;
    tex.update();
    sprites[name] = tex;
    return tex;
  }

  function writeBrush(lead, tailAt, force) {
    const tex = sprites[`brush-${kind}`];
    if (!tex) return;
    const qL = Math.round(Math.max(0, Math.min(1, lead)) * 28) / 28;
    const qT = Math.round(Math.max(0, Math.min(1, tailAt)) * 28) / 28;
    if (!force && qL === paintLead && qT === paintTail) return;
    paintLead = qL;
    paintTail = qT;
    const [w, h] = brushDims();
    paintBrush(tex.getContext(), w, h, qL, qT);
    tex.update();
  }

  function bootBrush(color, strand) {
    const plane = BABYLON.MeshBuilder.CreatePlane("trailBrush", { size: 1 }, scene);
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    plane.renderingGroupId = 1;
    const mat = glowMat(color, 1, false);
    mat.emissiveColor.set(1, 1, 1);
    mat.diffuseColor.set(1, 1, 1);
    const tex = brushTex();
    mat.diffuseTexture = tex;
    mat.emissiveTexture = tex;
    mat.useAlphaFromDiffuseTexture = true;
    plane.material = mat;
    plane._strand = strand;
    plane.setEnabled(false);
    brushes.push(plane);
  }

  function paintTool(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    const ink = cssTint();
    const cx = w * 0.5;
    const tipY = h * 0.05;
    const ferY = h * 0.3;
    ctx.lineCap = "round";
    for (let i = -3; i <= 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(cx + i * w * 0.035, ferY);
      ctx.quadraticCurveTo(cx + i * w * 0.055, (tipY + ferY) * 0.55, cx + i * w * 0.07, tipY + h * 0.03);
      ctx.strokeStyle = Math.abs(i) < 2 ? "#f7f1e4" : "#c8b48a";
      ctx.lineWidth = w * 0.045;
      ctx.stroke();
    }
    ctx.fillStyle = `rgba(${ink.r},${ink.g},${ink.b},0.95)`;
    ctx.beginPath();
    ctx.ellipse(cx, tipY + h * 0.045, w * 0.16, h * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d5dde6";
    ctx.fillRect(cx - w * 0.13, ferY, w * 0.26, h * 0.09);
    ctx.fillStyle = "#8b97a6";
    ctx.fillRect(cx - w * 0.13, ferY, w * 0.26, h * 0.018);
    ctx.fillStyle = "#c56b2d";
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.1, ferY + h * 0.09);
    ctx.lineTo(cx - w * 0.07, h * 0.9);
    ctx.quadraticCurveTo(cx, h * 0.97, cx + w * 0.07, h * 0.9);
    ctx.lineTo(cx + w * 0.1, ferY + h * 0.09);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(255,214,160,0.85)";
    ctx.lineWidth = w * 0.03;
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.03, ferY + h * 0.16);
    ctx.lineTo(cx - w * 0.02, h * 0.82);
    ctx.stroke();
  }

  function bootWand() {
    const w = 128;
    const h = 320;
    wandTex = new BABYLON.DynamicTexture("trailWand", { width: w, height: h }, scene, false);
    paintTool(wandTex.getContext(), w, h);
    wandTex.hasAlpha = true;
    wandTex.update();
    wand = BABYLON.MeshBuilder.CreatePlane("trailWand", { size: 1 }, scene);
    wand.billboardMode = 0;
    wand.renderingGroupId = 1;
    wand.setPivotPoint(new BABYLON.Vector3(0, 0.46, 0));
    const mat = glowMat(inkColor, 1, false);
    mat.emissiveColor.set(1, 1, 1);
    mat.diffuseColor.set(1, 1, 1);
    mat.diffuseTexture = wandTex;
    mat.emissiveTexture = wandTex;
    mat.useAlphaFromDiffuseTexture = true;
    wand.material = mat;
    wand.scaling.set(0.38, 0.86, 1);
    wand.setEnabled(false);
  }

  function placeBrush(plane, grow, dry, target) {
    const wet = grow > 0.03 && dry < 0.98;
    plane.setEnabled(wet);
    if (!wet) return;
    const strand = plane._strand || 0;
    if (strand === 0) writeBrush(grow, Math.min(grow, grow * dry));
    const a = trailFlight(kind, 0, target, strand);
    const b = trailFlight(kind, 1, target, strand);
    const span = Math.hypot(b.x - a.x, b.y - a.y, b.z - a.z);
    const glyphs = glyphKind(kind);
    const len = glyphs
      ? Math.min(1.62, Math.max(1.28, span * 1.6))
      : Math.min(1.28, Math.max(1.05, span * 1.45));
    plane.position.set((a.x + b.x) * 0.5, (a.y + b.y) * 0.5, (a.z + b.z) * 0.5);
    const cam = scene.activeCamera?.position;
    if (cam) {
      plane.position.x += (cam.x - plane.position.x) * 0.06;
      plane.position.y += (cam.y - plane.position.y) * 0.06;
      plane.position.z += (cam.z - plane.position.z) * 0.06;
    }
    plane.scaling.set(len, len * (glyphs ? 0.62 : 0.5), 1);
    if (plane.material) plane.material.alpha = dry > 0.82 ? Math.max(0, 1 - (dry - 0.82) / 0.18) : 1;
  }

  function placeWand(grow, target) {
    if (!wand || !scene.activeCamera) return;
    const on = grow > 0.02 && grow < 0.97;
    wand.setEnabled(on);
    if (!on) return;
    const cam = scene.activeCamera;
    const tip = trailFlight(kind, grow, target, 0);
    const nxt = trailFlight(kind, Math.min(1, grow + 0.07), target, 0);
    wand.position.set(tip.x, tip.y, tip.z);
    wand.position.x += (cam.position.x - tip.x) * 0.1;
    wand.position.y += (cam.position.y - tip.y) * 0.1;
    wand.position.z += (cam.position.z - tip.z) * 0.1;
    wand.lookAt(cam.position);
    const viewProj = cam.getTransformationMatrix();
    const a = BABYLON.Vector3.TransformCoordinates(wand.position, viewProj);
    ahead.set(nxt.x, nxt.y, nxt.z);
    const b = BABYLON.Vector3.TransformCoordinates(ahead, viewProj);
    const ang = Math.atan2(b.y - a.y, b.x - a.x);
    wand.rotate(BABYLON.Axis.Z, ang - Math.PI / 2, BABYLON.Space.LOCAL);
  }

  function kindTint(color) {
    const c = liftColor(color);
    if (kind === "hearts") return { r: 0.95, g: 0.16, b: 0.32 };
    if (kind === "petals") return { r: 1, g: 0.45, b: 0.62 };
    if (kind === "star" || kind === "chispa") return { r: 1, g: 0.78, b: 0.2 };
    if (kind === "particles") return { r: 1, g: 0.28, b: 0.62 };
    if (kind === "tube") return { r: 0.15, g: 0.92, b: 0.95 };
    if (kind === "line" || kind === "brisa") return { r: 1, g: 0.45, b: 0.82 };
    if (kind === "liana") return { r: 0.25, g: 0.78, b: 0.38 };
    if (kind === "niebla") return { r: 0.82, g: 0.88, b: 0.96 };
    if (kind === "gota") return { r: 0.25, g: 0.62, b: 1 };
    return c;
  }

  function glowMat(color, alpha, add) {
    const c = kindTint(color);
    const mat = new BABYLON.StandardMaterial("trailGlow", scene);
    mat.disableLighting = true;
    mat.emissiveColor = new BABYLON.Color3(c.r, c.g, c.b);
    mat.diffuseColor = new BABYLON.Color3(c.r, c.g, c.b);
    mat.alpha = alpha;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    if (add && BABYLON.Engine?.ALPHA_ADD != null) mat.alphaMode = BABYLON.Engine.ALPHA_ADD;
    mat.backFaceCulling = false;
    mat.disableDepthWrite = true;
    mat.fogEnabled = false;
    return mat;
  }

  function clearFx() {
    armed = false;
    for (const brush of brushes) brush.dispose();
    brushes.length = 0;
    if (wand) {
      wand.dispose();
      wand = null;
    }
    if (wandTex) {
      wandTex.dispose();
      wandTex = null;
    }
    paintLead = -1;
    paintTail = -1;
    wandHold = null;
    if (splash) {
      splash.dispose();
      splash = null;
    }
    if (drop) {
      drop.dispose();
      drop = null;
    }
    dropInk();
  }

  function parkAt(kind, i, target) {
    const pos = trailFlight(kind, 0, target, i);
    return pos;
  }

  function bootDrop(color, pos) {
    drop = BABYLON.MeshBuilder.CreateSphere("trailDrop", {
      diameterX: 0.2,
      diameterY: 0.28,
      diameterZ: 0.2,
      segments: 6,
    }, scene);
    const c = liftColor(color);
    const mat = new BABYLON.StandardMaterial("trailDropMat", scene);
    mat.diffuseColor = new BABYLON.Color3(c.r, c.g, c.b);
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(c.r * 0.55, c.g * 0.6, c.b * 0.7);
    mat.alpha = 0.88;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    mat.fogEnabled = false;
    drop.material = mat;
    drop.renderingGroupId = 1;
    drop.position.set(pos.x, pos.y, pos.z);
    splash = BABYLON.MeshBuilder.CreatePlane("trailSplash", { size: 1 }, scene);
    splash.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    splash.renderingGroupId = 1;
    const sm = glowMat(color, 0.9, false);
    sm.emissiveColor.set(1, 1, 1);
    sm.diffuseColor.set(1, 1, 1);
    const tex = brushTex();
    sm.diffuseTexture = tex;
    sm.emissiveTexture = tex;
    sm.useAlphaFromDiffuseTexture = true;
    splash.material = sm;
    splash.setEnabled(false);
  }

  function smooth01(t) {
    const x = t < 0 ? 0 : t > 1 ? 1 : t;
    return x * x * (3 - 2 * x);
  }

  function cometPhase(u) {
    if (u < 0.008 || u >= 0.5) return null;
    const born = smooth01((u - 0.008) / 0.04);
    if (born <= 0.001) return null;
    const head = Math.min(1, Math.max(0, (u - 0.008) / 0.2));
    const retract = head >= 0.999 ? smooth01((u - 0.22) / 0.18) : 0;
    if (retract >= 0.995) return null;
    const wink = retract > 0.9 ? (retract - 0.9) / 0.1 : 0;
    const tail = 0.34 * (1 - retract);
    return {
      head,
      from: Math.max(0, head - tail),
      fade: born * (1 - wink * wink),
      spark: born * (1 - wink),
      boom: head >= 0.9 ? smooth01((u - 0.18) / 0.1) : 0,
    };
  }

  function paintGlyphOverlay(ctx, u) {
    if (u <= 0.008 || u >= 0.992) return;
    const phase = cometPhase(u);
    const headNow = Math.min(1, Math.max(0, (u - 0.008) / 0.2));
    if (headNow < 0.02) return;
    const ink = cssTint();
    const h = ctx.canvas.height;
    holdWand(ctx);
    ctx.save();
    if (phase && phase.head - phase.from > 0.012 && phase.head >= 0.02) {
    const from = phase.from;
    const span = Math.max(0.001, phase.head - from);
    const steps = FAST_CANVAS ? 32 : 48;
    const pts = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = from + span * (i / steps);
      const p = fissureAt(ctx, t);
      pts.push({ x: p.x, y: p.y, t, along: (t - from) / span });
    }
    if (pts.length >= 2) {
    const rgb = mixInk();
    const m = Math.min(ctx.canvas.width, ctx.canvas.height);
    const mark = Math.max(0.55, Math.min(2.6, Number(inkMark) || 1));
    const maxW = 0.048 * m * mark * Math.max(0.35, phase.spark);
    const left = [];
    const right = [];
    for (let i = 0; i < pts.length; i += 1) {
      const a = pts[i === 0 ? 0 : i - 1];
      const b = pts[i === pts.length - 1 ? i : i + 1];
      let dx = b.x - a.x;
      let dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const along = i / (pts.length - 1);
      const half = maxW * (0.08 + along * along * 0.92) * 0.5;
      dx /= len;
      dy /= len;
      left.push({ x: pts[i].x - dy * half, y: pts[i].y + dx * half });
      right.push({ x: pts[i].x + dy * half, y: pts[i].y - dx * half });
    }
    const tip = pts[pts.length - 1];
    const whiteWidth = Math.max(0.8, maxW * 0.16);
    withFoxGlow(ctx, (g) => {
      paintRibbonGlow(
        g, pts, left, right, rgb, maxW, phase.fade,
        whiteWidth,
        0.75 * phase.fade,
        maxW * 1.05,
        phase.spark,
        () => {
          g.beginPath();
          g.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i += 1) g.lineTo(pts[i].x, pts[i].y);
        }
      );
      paintCometBurst(g, h, tip, phase, ink, "glow");
    });
    paintCometBurst(ctx, h, tip, phase, ink, "marks");
    }
    }
    ctx.globalCompositeOperation = "source-over";
    const ch = glyphChar(kind, glyphMark);
    const spread = Math.max(0.6, Number(inkSpread) || 1);
    const extra = Math.max(0, spread - 0.55);
    const count = Math.max(3, Math.round(4 + extra * extra * 16));
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const buds = [];
    for (let i = 0; i < count; i += 1) {
      buds.push({
        i,
        t: Math.min(0.97, Math.max(0.03, (i + 0.5) / count + (hash(i * 2.17 + 0.4) - 0.5) * (1.15 / count))),
      });
    }
    const byPos = buds.slice().sort((a, b) => a.t - b.t);
    const when = new Array(count);
    const toneOf = new Array(count);
    for (let rank = 0; rank < byPos.length; rank += 1) {
      const bud = byPos[rank];
      const prev = rank ? bud.t - byPos[rank - 1].t : 1;
      const next = rank + 1 < byPos.length ? byPos[rank + 1].t - bud.t : 1;
      when[bud.i] = (rank * 0.6180339887) % 1;
      toneOf[bud.i] = Math.min(prev, next) < 4 / count ? (rank % 3) - 1 : 0;
    }
    for (let i = 0; i < count; i += 1) {
      const t = buds[i].t;
      if (t > headNow + 0.02) continue;
      const bornU = 0.008 + t * 0.2 + when[i] * 0.07;
      const lifeLen = 0.52 + hash(i * 1.31 + 0.6) * 0.12;
      const life = (u - bornU) / lifeLen;
      if (life <= 0.02 || life >= 1) continue;
      const growEnd = 0.4;
      const ripeEnd = 0.5;
      let scale = 1;
      let lift = 0;
      let alpha = 1;
      if (life < growEnd) {
        const g = life / growEnd;
        const eased = g * g * (3 - 2 * g);
        scale = 0.1 + eased * 0.98;
        lift = 0;
        alpha = Math.min(1, 0.15 + g * 0.9);
      } else if (life < ripeEnd) {
        scale = 1.08;
        lift = 0;
        alpha = 1;
      } else {
        const f = (life - ripeEnd) / (1 - ripeEnd);
        const shot = 1 - (1 - f) ** 2.2;
        scale = 1.08;
        lift = shot;
        alpha = 1 - f * f;
      }
      if (alpha <= 0.02) continue;
      const bud = budAt(ctx, t);
      const side = hash(i * 9.1 + 1.2) > 0.48 ? 1 : -1;
      const angOff = (hash(i * 4.4 + 0.8) - 0.5) * 0.9;
      const dirx = bud.nx * Math.cos(angOff) - bud.ny * Math.sin(angOff);
      const diry = bud.nx * Math.sin(angOff) + bud.ny * Math.cos(angOff);
      const reach = h * (0.16 + hash(i * 8.2 + 0.3) * 0.06);
      const ripe = h * (0.145 + hash(i * 6.4 + 1.1) * 0.04);
      const x = bud.x + dirx * side * reach * lift;
      const y = bud.y + diry * side * reach * lift;
      const tone = toneOf[i];
      let tr = ink.r;
      let tg = ink.g;
      let tb = ink.b;
      if (tone > 0.4) {
        tr = Math.round(ink.r + (255 - ink.r) * 0.18);
        tg = Math.round(ink.g + (170 - ink.g) * 0.32);
        tb = Math.round(ink.b + (190 - ink.b) * 0.28);
      } else if (tone < -0.4) {
        tr = Math.round(ink.r + (168 - ink.r) * 0.28);
        tg = Math.round(ink.g + (22 - ink.g) * 0.3);
        tb = Math.round(ink.b + (48 - ink.b) * 0.28);
      }
      const opening = life < growEnd ? 1 - life / growEnd : 0;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((hash(i * 3.7 + 0.9) - 0.5) * 0.7 * lift);
      ctx.scale(scale * (1 - opening * 0.22), scale * (1 + opening * 0.4));
      ctx.globalAlpha = alpha;
      stampGlyph(ctx, ch, glyphPx(ripe, ch), `rgb(${tr},${tg},${tb})`);
      ctx.restore();
    }
    ctx.restore();
  }

  function paintCometBurst(ctx, h, tip, phase, ink, part) {
    const boom = phase.boom;
    if (boom <= 0.02) return;
    const pop = Math.max(0.6, Math.min(2.6, inkPop || 1));
    const spread = Math.max(0.6, inkSpread || 1);
    const flash = Math.sin(Math.min(1, boom) * Math.PI);
    const n = Math.max(8, Math.round(5 + spread * spread * 6));
    const ch = glyphChar(kind, glyphMark);
    if (part !== "marks") {
      ctx.save();
      ctx.globalCompositeOperation = FAST_CANVAS ? "source-over" : "lighter";
      const rad = h * (0.02 + 0.18 * boom) * (0.75 + 0.25 * pop);
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, rad, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,255,255,${(0.9 * flash).toFixed(3)})`;
      ctx.lineWidth = Math.max(1.4, h * 0.01 * (1 - boom));
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(tip.x, tip.y, rad * 0.58, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ink.r},${ink.g},${ink.b},${(0.8 * flash).toFixed(3)})`;
      ctx.lineWidth = Math.max(2, h * 0.018 * (1 - boom * 0.65));
      ctx.stroke();
      const glow = h * (0.05 + 0.12 * flash);
      if (FAST_CANVAS) {
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, glow * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,252,255,${Math.min(1, 0.95 * flash)})`;
        ctx.fill();
      } else {
        const g = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, glow);
        g.addColorStop(0, `rgba(255,255,255,${(0.95 * flash).toFixed(3)})`);
        g.addColorStop(0.35, `rgba(${ink.r},${ink.g},${ink.b},${(0.8 * flash).toFixed(3)})`);
        g.addColorStop(1, `rgba(${ink.r},${ink.g},${ink.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(tip.x, tip.y, glow, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (part === "glow") return;
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (let i = 0; i < n; i += 1) {
      const ang = (i / n) * Math.PI * 2 + hash(i + 0.4) * 0.5;
      const dist = boom * h * 0.12 * pop * (0.55 + hash(i * 1.7) * 0.5);
      const x = tip.x + Math.cos(ang) * dist;
      const y = tip.y + Math.sin(ang) * dist * 0.7;
      const size = h * 0.055 * (1 - boom * 0.3);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(ang * 0.35);
      ctx.globalAlpha = flash;
      stampGlyph(ctx, ch, glyphPx(size, ch), `rgb(${ink.r},${ink.g},${ink.b})`);
      ctx.restore();
    }
    ctx.restore();
  }

  function holdWand(ctx) {
    if (wandHold && wandHold.w === ctx.canvas.width && wandHold.h === ctx.canvas.height) return wandHold;
    const end = projectOn(ctx, glyphAim);
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    const margin = h * 0.16;
    const ex = Math.min(w - margin, Math.max(margin, end.x));
    const ey = Math.min(h - margin, Math.max(margin, end.y));
    const seed = Math.random();
    const far = ex > w * 0.5;
    const sx = far ? w * 0.02 : w * 0.98;
    const sy = Math.min(h * 0.72, Math.max(h * 0.28, ey + (ey < h * 0.5 ? h * 0.34 : -h * 0.34)));
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.hypot(dx, dy) || 1;
    const bow0 = h * (0.2 + hash(seed + 2) * 0.08);
    const sign = hash(seed + 3) > 0.5 ? 1 : -1;
    const pad = h * 0.08;
    let bow = bow0;
    let cx = (sx + ex) / 2 + (-dy / len) * bow * sign;
    let cy = (sy + ey) / 2 + (dx / len) * bow * sign;
    let guard = 0;
    while ((cx < pad || cx > w - pad || cy < pad || cy > h - pad) && guard < 8) {
      bow *= 0.72;
      cx = (sx + ex) / 2 + (-dy / len) * bow * sign;
      cy = (sy + ey) / 2 + (dx / len) * bow * sign;
      guard += 1;
    }
    const p0 = { x: sx, y: sy };
    const p1 = { x: cx, y: cy };
    const p2 = { x: ex, y: ey };
    const n = 72;
    const pts = [];
    for (let i = 0; i <= n; i += 1) {
      const t = i / n;
      const u = 1 - t;
      pts.push({
        x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
        y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
        press: 0.25 + 0.75 * t,
      });
    }
    wandHold = { pts, w, h, p0, p1, p2 };
    return wandHold;
  }

  function lerpPt(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
  }

  function splitQuad(p0, p1, p2, t) {
    const q1 = lerpPt(p0, p1, t);
    const r1 = lerpPt(p1, p2, t);
    const mid = lerpPt(q1, r1, t);
    return { left: [p0, q1, mid], right: [mid, r1, p2] };
  }

  function subQuad(p0, p1, p2, a, b) {
    const start = Math.min(0.999, Math.max(0, a));
    const end = Math.min(1, Math.max(start + 0.001, b));
    const right = splitQuad(p0, p1, p2, start).right;
    const u = (end - start) / (1 - start);
    return splitQuad(right[0], right[1], right[2], u).left;
  }

  function sampleWand(ctx, t) {
    const pts = holdWand(ctx).pts;
    const k = Math.min(1, Math.max(0, t)) * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(k));
    const f = k - i;
    return { a: pts[i], b: pts[i + 1], f };
  }

  function pressAt(ctx, t) {
    const s = sampleWand(ctx, t);
    return s.a.press + (s.b.press - s.a.press) * s.f;
  }

  function budAt(ctx, t) {
    const p = fissureAt(ctx, t);
    const q = fissureAt(ctx, Math.min(1, t + 0.015));
    const dx = q.x - p.x;
    const dy = q.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    return {
      x: p.x,
      y: p.y,
      nx: -dy / len,
      ny: dx / len,
      ang: Math.atan2(dy, dx),
    };
  }

  function fissureAt(ctx, t) {
    const s = sampleWand(ctx, t);
    return {
      x: s.a.x + (s.b.x - s.a.x) * s.f,
      y: s.a.y + (s.b.y - s.a.y) * s.f,
    };
  }

  function projectOn(ctx, pos) {
    const cam = scene.activeCamera;
    const engine = scene.getEngine();
    const cw = ctx.canvas.width;
    const ch = ctx.canvas.height;
    if (!cam || !engine) {
      return {
        x: (0.5 + pos.x * 0.22) * cw,
        y: (0.62 - pos.y * 0.28) * ch,
      };
    }
    world.set(pos.x, pos.y, pos.z);
    const vw = Math.max(1, engine.getRenderWidth());
    const vh = Math.max(1, engine.getRenderHeight());
    const p = BABYLON.Vector3.Project(
      world,
      ident,
      scene.getTransformMatrix(),
      cam.viewport.toGlobal(vw, vh)
    );
    const x = (p.x / vw) * cw;
    const y = (p.y / vh) * ch;
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { x: cw * 0.5, y: ch * 0.45 };
    }
    return { x, y };
  }

  function tick3d(u, target) {
    if (target) glyphAim = target;
    const phase = washPhase(u);
    const grow = phase.head;
    let dry = grow > 0.001 ? phase.tail / (grow * 0.9) : 0;
    if (phase.fade < 1) dry = Math.max(dry, 1 - phase.fade);
    dry = Math.min(1, Math.max(0, dry));
    const lead = trailFlight(kind, Math.max(0.04, grow), target, 0);
    inkU = u;
    const live = u > 0.02 && u < 0.99;
    if (!live) {
      for (const brush of brushes) brush.setEnabled(false);
      if (wand) wand.setEnabled(false);
      if (drop) drop.setEnabled(false);
      if (splash) splash.setEnabled(false);
      return lead;
    }
    for (const brush of brushes) placeBrush(brush, grow, dry, target);
    placeWand(grow, target);
    if (drop) {
      drop.setEnabled(true);
      drop.position.set(lead.x, lead.y, lead.z);
      const squash = lead.squash || 0;
      drop.scaling.set(1 + squash * 0.55, Math.max(0.4, (lead.stretch || 1) * (1 - squash * 0.5)), 1 + squash * 0.55);
      const burst = lead.splash || 0;
      if (splash) {
        splash.setEnabled(burst > 0.08);
        if (burst > 0.08) {
          splash.position.set(lead.x, lead.y, lead.z);
          splash.scaling.setAll(0.25 + burst * 0.85);
          if (splash.material) splash.material.alpha = 0.7 * (1 - burst * 0.25);
        }
      }
    }
    return lead;
  }

  function applyColor(color, glow, tail) {
    inkColor = color;
    if (glow != null) inkGlow = glow;
    if (tail != null) inkTail = tail;
    if (drop?.material) {
      const c = liftColor(color);
      drop.material.diffuseColor.set(c.r, c.g, c.b);
      drop.material.emissiveColor.set(c.r * 0.55, c.g * 0.6, c.b * 0.7);
    }
    writeBrush(paintLead < 0 ? 0 : paintLead, paintTail < 0 ? 0 : paintTail, true);
    if (wandTex) {
      paintTool(wandTex.getContext(), 128, 320);
      wandTex.update();
    }
    for (const brush of brushes) {
      if (brush.material) brush.material.emissiveColor.set(1, 1, 1);
    }
    if (splash?.material) splash.material.emissiveColor.set(1, 1, 1);
  }

  return {
    kind() { return kind; },
    mark(ch) {
      if (typeof ch === "string" && ch) glyphMark = ch;
    },
    use(next, color, as2d, con, mark, spread, join, glow, tail, ms, pop) {
      const id = next || "none";
      if (id === kind && id === "none") return;
      if (con != null && Number.isFinite(Number(con))) inkCon = Number(con);
      if (mark != null && Number.isFinite(Number(mark))) inkMark = Number(mark);
      if (spread != null && Number.isFinite(Number(spread))) inkSpread = Number(spread);
      if (ms != null && Number.isFinite(Number(ms)) && Number(ms) > 0) inkMs = Number(ms);
      if (pop != null && Number.isFinite(Number(pop))) inkPop = Number(pop);
      if (join === "burst" || join === "morph") inkJoin = join;
      const want2d = id !== "none" && as2d === true;
      if (id === kind && want2d === draw2d) {
        if (id !== "none") applyColor(color, glow, tail);
        return;
      }
      kind = id;
      draw2d = want2d;
      settled = false;
      stopLoop();
      clock0 = 0;
      inkU = 0;
      stampU = 0;
      stampAt = 0;
      clearFx();
      if (kind === "none") {
        dropInk();
        return;
      }
      inkColor = color;
      inkGlow = glow || null;
      inkTail = tail || null;
      if (!draw2d && !glyphKind(kind)) bootFx(color);
    },
    tick(u, target) {
      if (kind === "none") return { x: target.x, y: target.y, z: target.z };
      if (draw2d) return tickInk(u, target);
      return tick3d(u, target);
    },
    composite(ctx) {
      if (!ctx || kind === "none") return;
      if (glyphKind(kind) && !draw2d) {
        paintGlyphOverlay(ctx, inkU);
        return;
      }
      if (!draw2d) return;
      paintTrail(ctx, inkU);
    },
    emit() {},
    move() {},
    fade() {},
    reset() {
      armed = false;
      for (const brush of brushes) brush.setEnabled(false);
      if (wand) wand.setEnabled(false);
      paintLead = -1;
      paintTail = -1;
      wandHold = null;
      if (splash) splash.setEnabled(false);
      if (drop) {
        const pos = parkAt(kind, 0, park);
        drop.position.set(pos.x, pos.y, pos.z);
        drop.setEnabled(true);
      }
      inkU = 0;
      clock0 = 0;
      stampU = 0;
      stampAt = 0;
      settled = false;
      stopLoop();
      if (ink) {
        const ctx = ink.ctx;
        if (ctx) ctx.clearRect(0, 0, ink.canvas.width, ink.canvas.height);
      }
    },
    dispose() {
      stopLoop();
      clearFx();
    },
  };
}
