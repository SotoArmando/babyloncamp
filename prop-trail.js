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
    || kind === "hearts" || kind === "petals" || kind === "star";
}

export function trailFlight(kind, u, target, strand = 0) {
  const k = Math.min(1, Math.max(0, u));
  const seed = 0.17 + strand * 1.37;
  const fade = 1 - k;

  if (isStroke(kind)) {
    const t = easeOut(k);
    const dip = Math.sin(k * Math.PI);
    return {
      x: lerp(-0.62, target.x, t) + dip * 0.08,
      y: lerp(1.12, target.y, t) - dip * 0.28,
      z: lerp(0.22, target.z, t),
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
      x: lerp(1.05, target.x, t) + s * 0.22 * fade + Math.sin(k * 5.4) * 0.12 * fade,
      y: lerp(0.35, target.y, t) + Math.abs(s) * 0.18 * fade + Math.sin(k * Math.PI) * 0.22,
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
    x: lerp(0.62 * side * (0.7 + strand * 0.08), target.x, t) + s * amp * fade + gust,
    y: lerp(1.02 + hash(seed) * 0.16, target.y, t) + Math.sin(k * Math.PI) * 0.12 * fade,
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
  if (isStroke(kind) || kind === "gota") return 1;
  if (kind === "liana") return 3;
  if (kind === "niebla") return 6;
  if (kind === "brisa") return 4;
  return 3;
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
  const emitters = [];
  const systems = [];
  const ribbons = [];
  const beads = [];
  const markRows = [];
  const puffs = [];
  const MARK_N = 36;
  const STROKE_N = 48;
  const upRef = new BABYLON.Vector3(0, 1, 0);
  const rightRef = new BABYLON.Vector3(1, 0, 0);
  const last = [];
  const world = new BABYLON.Vector3();
  const ident = BABYLON.Matrix.Identity();
  let kind = "none";
  let drop = null;
  let splash = null;
  let splashRate = 0;
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
    if (kind === "hearts" || kind === "petals" || kind === "star") return m * 0.02;
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
    ctx.shadowBlur = (tube ? 32 : 22) * k;
    ctx.shadowColor = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.95 * fade})`;
    ctx.strokeStyle = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.55 * fade})`;
    ctx.lineWidth = wide * 1.85;
    ctx.stroke();
    ctx.shadowBlur = (tube ? 18 : 12) * k;
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
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.beginPath();
    ctx.moveTo(left[0].x, left[0].y);
    for (let i = 1; i < left.length; i += 1) ctx.lineTo(left[i].x, left[i].y);
    for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i].x, right[i].y);
    ctx.closePath();
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${0.55 * fade})`;
    ctx.fill();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = `rgba(${rgb.dr},${rgb.dg},${rgb.db},${0.85 * fade})`;
    ctx.lineWidth = maxW * 0.55;
    trace(ctx, pts);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255,248,255,${(tube ? 0.45 : 0.75) * fade})`;
    ctx.lineWidth = maxW * (tube ? 0.28 : 0.18);
    trace(ctx, pts);
    ctx.stroke();
    const head = pts[pts.length - 1];
    glowBead(ctx, head.x, head.y, maxW * 1.15, rgb, fade);
    ctx.restore();
  }

  function glowBead(ctx, x, y, r, rgb, a) {
    if (a < 0.04 || r < 0.6) return;
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
    const base = mixInk();
    const rgb = alongInk(base, 0.85);
    const n = Math.max(1, Math.min(4, strandCount(kind)));
    const m = Math.min(ink.canvas.width, ink.canvas.height);
    ctx.globalCompositeOperation = "lighter";
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
    const n = Math.max(1, strandCount(kind));
    if (kind === "gota") bootDrop(color, parkAt(kind, 0, park));
    for (let i = 0; i < n; i += 1) {
      const pos = parkAt(kind, i, park);
      if (usesPs(kind) || kind === "particles" || kind === "line" || kind === "tube") {
        bootPs(kind, makeEmitter(pos), color, i);
      }
      if (usesRibbon(kind)) {
        const thick = kind === "tube" ? 0.07 : kind === "line" ? 0.016 : kind === "liana" ? 0.032 : 0.024;
        bootStrokePair(color, thick * (i === 0 ? 1 : 0.62), i);
      }
      if (usesMarks(kind)) bootMarkRow(color);
    }
    armed = true;
  }

  function sprite(name, draw) {
    if (sprites[name]) return sprites[name];
    const size = 128;
    const tex = new BABYLON.DynamicTexture(`trailSpr-${name}`, { width: size, height: size }, scene, false);
    const ctx = tex.getContext();
    ctx.clearRect(0, 0, size, size);
    draw(ctx, size);
    tex.hasAlpha = true;
    tex.update();
    sprites[name] = tex;
    return tex;
  }

  function sparkTex() {
    return sprite("spark", (ctx, size) => {
      const cx = size * 0.5;
      const cy = size * 0.5;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.48);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.16, "rgba(255,255,255,1)");
      g.addColorStop(0.38, "rgba(255,255,255,.7)");
      g.addColorStop(0.7, "rgba(255,255,255,.18)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    });
  }

  function heartTex() {
    return sprite("heart", (ctx, size) => {
      ctx.translate(size * 0.5, size * 0.54);
      ctx.scale(size * 0.038, size * 0.038);
      ctx.beginPath();
      ctx.moveTo(0, 7);
      ctx.bezierCurveTo(-12, -1, -9, -13, 0, -7.2);
      ctx.bezierCurveTo(9, -13, 12, -1, 0, 7);
      ctx.closePath();
      const g = ctx.createLinearGradient(-8, -12, 6, 8);
      g.addColorStop(0, "#ff9ab8");
      g.addColorStop(0.45, "#ff4d73");
      g.addColorStop(1, "#c81e48");
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-3.2, -5.2, 2.4, 1.6, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,.45)";
      ctx.fill();
    });
  }

  function petalTex() {
    return sprite("petal", (ctx, size) => {
      ctx.translate(size * 0.5, size * 0.58);
      ctx.rotate(-0.35);
      ctx.beginPath();
      ctx.ellipse(0, -8, 18, 32, 0, 0, Math.PI * 2);
      const g = ctx.createLinearGradient(0, -36, 8, 22);
      g.addColorStop(0, "#fff6f8");
      g.addColorStop(0.45, "#ffb7c5");
      g.addColorStop(1, "#e25a72");
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  function starTex() {
    return sprite("star", (ctx, size) => {
      const cx = size * 0.5;
      const cy = size * 0.5;
      ctx.beginPath();
      for (let i = 0; i < 12; i += 1) {
        const a = (i * Math.PI) / 6 - Math.PI / 2;
        const rad = i % 2 === 0 ? size * 0.46 : size * 0.2;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      const g = ctx.createRadialGradient(cx, cy, 4, cx, cy, size * 0.46);
      g.addColorStop(0, "#fff8d2");
      g.addColorStop(0.55, "#f0d56a");
      g.addColorStop(1, "#c9a227");
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  function tint(color, air = false) {
    const c = kindTint(color);
    const r = air ? Math.min(1, c.r * 0.55 + 0.55) : c.r;
    const g = air ? Math.min(1, c.g * 0.5 + 0.58) : c.g;
    const b = air ? Math.min(1, c.b * 0.4 + 0.7) : c.b;
    return {
      live: new BABYLON.Color4(r, g, b, air ? 0.7 : 1),
      mid: new BABYLON.Color4(r, g, b, air ? 0.28 : 0.7),
      dead: new BABYLON.Color4(r, g, b, 0),
      rgb: { r, g, b },
    };
  }

  function kindTint(color) {
    const c = liftColor(color);
    if (kind === "hearts") return { r: 0.98, g: 0.28, b: 0.42 };
    if (kind === "petals") return { r: 1, g: 0.62, b: 0.7 };
    if (kind === "star") return { r: 0.98, g: 0.88, b: 0.42 };
    if (kind === "particles") return { r: Math.min(1, c.r * 0.35 + 0.72), g: Math.min(1, c.g * 0.25 + 0.38), b: Math.min(1, c.b * 0.45 + 0.78) };
    if (kind === "tube") return { r: Math.min(1, c.r * 0.2 + 0.35), g: Math.min(1, c.g * 0.45 + 0.88), b: Math.min(1, c.b * 0.4 + 0.86) };
    if (kind === "line") return { r: Math.min(1, c.r * 0.35 + 0.82), g: Math.min(1, c.g * 0.3 + 0.55), b: Math.min(1, c.b * 0.45 + 0.9) };
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
    return mat;
  }

  function clearFx() {
    armed = false;
    for (const ps of systems) {
      ps.stop();
      ps.dispose();
    }
    systems.length = 0;
    for (const ribbon of ribbons) ribbon.dispose();
    ribbons.length = 0;
    for (const bead of beads) bead.dispose();
    beads.length = 0;
    for (const row of markRows) {
      for (const mark of row) mark.dispose();
    }
    markRows.length = 0;
    for (const puff of puffs) puff.dispose();
    puffs.length = 0;
    for (const emitter of emitters) emitter.dispose();
    emitters.length = 0;
    last.length = 0;
    if (splash) {
      splash.stop();
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

  function makeEmitter(pos) {
    const emitter = BABYLON.MeshBuilder.CreateSphere("trailEmit", { diameter: 0.03, segments: 5 }, scene);
    emitter.isVisible = false;
    emitter.position.set(pos.x, pos.y, pos.z);
    emitters.push(emitter);
    last.push(new BABYLON.Vector3(pos.x, pos.y, pos.z));
    return emitter;
  }

  function bootPs(next, emitter, color, i) {
    const air = next === "niebla";
    const pal = tint(color, air);
    const count = next === "niebla" ? 320 : next === "particles" || next === "line" ? 260 : 180;
    const ps = new BABYLON.ParticleSystem(`trailPs-${next}-${i}`, count, scene);
    ps.emitter = emitter;
    ps.blendMode = next === "hearts" || next === "petals" || next === "niebla"
      ? BABYLON.ParticleSystem.BLENDMODE_STANDARD
      : BABYLON.ParticleSystem.BLENDMODE_ADD;
    ps.color1 = pal.live;
    ps.color2 = pal.mid;
    ps.colorDead = pal.dead;
    ps.minEmitBox = new BABYLON.Vector3(-0.04, -0.04, -0.04);
    ps.maxEmitBox = new BABYLON.Vector3(0.04, 0.04, 0.04);
    ps.updateSpeed = 0.01;
    ps.preventAutoStart = true;
    ps.emitRate = 0;
    ps.renderingGroupId = 1;
    if (next === "gota") {
      ps.particleTexture = sparkTex();
      ps._baseRate = 110;
      ps.minSize = 0.05;
      ps.maxSize = 0.11;
      ps.minLifeTime = 0.22;
      ps.maxLifeTime = 0.4;
      ps.gravity = new BABYLON.Vector3(0, -0.55, 0);
    } else if (next === "tube") {
      ps.particleTexture = sparkTex();
      ps._baseRate = 140;
      ps.minSize = 0.16;
      ps.maxSize = 0.28;
      ps.minLifeTime = 0.35;
      ps.maxLifeTime = 0.6;
    } else if (next === "line") {
      ps.particleTexture = sparkTex();
      ps._baseRate = 280;
      ps.minSize = 0.045;
      ps.maxSize = 0.09;
      ps.minLifeTime = 0.28;
      ps.maxLifeTime = 0.48;
    } else if (next === "particles") {
      ps.particleTexture = sparkTex();
      ps._baseRate = 220;
      ps.minSize = 0.07;
      ps.maxSize = 0.16;
      ps.minLifeTime = 0.32;
      ps.maxLifeTime = 0.55;
    } else if (next === "star") {
      ps.particleTexture = starTex();
      ps._baseRate = 70;
      ps.minSize = 0.1;
      ps.maxSize = 0.2;
      ps.minLifeTime = 0.4;
      ps.maxLifeTime = 0.7;
      ps.minAngularSpeed = -2.4;
      ps.maxAngularSpeed = 2.4;
    } else if (next === "liana") {
      ps.particleTexture = sparkTex();
      ps._baseRate = i === 0 ? 90 : 70;
      ps.minSize = i === 0 ? 0.12 : 0.05;
      ps.maxSize = i === 0 ? 0.22 : 0.1;
      ps.minLifeTime = 0.35;
      ps.maxLifeTime = 0.62;
    } else if (next === "niebla") {
      ps.particleTexture = sparkTex();
      ps._baseRate = 90;
      ps.minSize = 0.32;
      ps.maxSize = 0.7;
      ps.minLifeTime = 0.7;
      ps.maxLifeTime = 1.25;
      ps.gravity = new BABYLON.Vector3(0, 0.18, 0);
      ps.minEmitPower = 0.08;
      ps.maxEmitPower = 0.22;
      ps.minEmitBox = new BABYLON.Vector3(-0.12, -0.08, -0.12);
      ps.maxEmitBox = new BABYLON.Vector3(0.12, 0.08, 0.12);
    } else if (next === "hearts") {
      ps.particleTexture = heartTex();
      ps._baseRate = 42;
      ps.minSize = 0.12;
      ps.maxSize = 0.22;
      ps.minLifeTime = 0.55;
      ps.maxLifeTime = 0.95;
      ps.minAngularSpeed = -1.2;
      ps.maxAngularSpeed = 1.2;
      ps.gravity = new BABYLON.Vector3(0, -0.25, 0);
    } else if (next === "petals") {
      ps.particleTexture = petalTex();
      ps._baseRate = 48;
      ps.minSize = 0.1;
      ps.maxSize = 0.2;
      ps.minLifeTime = 0.6;
      ps.maxLifeTime = 1.05;
      ps.minAngularSpeed = -2;
      ps.maxAngularSpeed = 2;
      ps.gravity = new BABYLON.Vector3(0, -0.85, 0);
    } else if (next === "chispa") {
      ps.particleTexture = starTex();
      ps._baseRate = 64;
      ps.minSize = 0.09;
      ps.maxSize = 0.18;
      ps.minLifeTime = 0.3;
      ps.maxLifeTime = 0.55;
      ps.minAngularSpeed = -3;
      ps.maxAngularSpeed = 3;
      ps.gravity = new BABYLON.Vector3(0, -0.7, 0);
    } else {
      ps.particleTexture = sparkTex();
      ps._baseRate = 120;
      ps.minSize = 0.06;
      ps.maxSize = 0.14;
      ps.minLifeTime = 0.3;
      ps.maxLifeTime = 0.55;
    }
    systems.push(ps);
  }

  function emptyStroke(thick) {
    const left = [];
    const right = [];
    for (let i = 0; i <= STROKE_N; i += 1) {
      left.push(new BABYLON.Vector3(0, 0.42, i * 0.002));
      right.push(new BABYLON.Vector3(Math.max(0.01, thick), 0.42, i * 0.002));
    }
    return [left, right];
  }

  function strokeWidth(i, n, dry, strand, base) {
    const t = n <= 0 ? 1 : i / n;
    const belly = kind === "tube"
      ? 0.92 + Math.sin(t * Math.PI) * 0.18
      : 0.42 + Math.sin(t * Math.PI) * 0.72;
    const tail = t < 0.12 ? 0.22 + (t / 0.12) * 0.78 : 1;
    const nose = t > 0.88 ? Math.pow((1 - t) / 0.12, 1.2) : 1;
    const wobble = kind === "line" || kind === "tube"
      ? 1
      : 0.7 + hash(i * 2.1 + strand * 5.3) * 0.5;
    const shrink = 1 - dry * 0.55;
    return Math.max(0.006, base * shrink * belly * tail * nose * wobble);
  }

  function strokeSides(pts, strand, dry, base) {
    const left = [];
    const right = [];
    const n = pts.length;
    const tan = new BABYLON.Vector3();
    const side = new BABYLON.Vector3();
    for (let i = 0; i < n; i += 1) {
      const p = pts[i];
      if (i < n - 1) tan.set(pts[i + 1].x - p.x, pts[i + 1].y - p.y, pts[i + 1].z - p.z);
      else if (i > 0) tan.set(p.x - pts[i - 1].x, p.y - pts[i - 1].y, p.z - pts[i - 1].z);
      else tan.set(0, 0, 1);
      if (tan.lengthSquared() < 1e-8) tan.set(0, 0, 1);
      tan.normalize();
      BABYLON.Vector3.CrossToRef(tan, upRef, side);
      if (side.lengthSquared() < 1e-8) BABYLON.Vector3.CrossToRef(tan, rightRef, side);
      side.normalize();
      const w = i >= n - 1 ? 0 : strokeWidth(i, n - 1, dry, strand, base);
      left.push(new BABYLON.Vector3(p.x + side.x * w, p.y + side.y * w, p.z + side.z * w));
      right.push(new BABYLON.Vector3(p.x - side.x * w, p.y - side.y * w, p.z - side.z * w));
    }
    if (n > 1) {
      const tip = pts[n - 1];
      const jx = (hash(strand + 0.3) - 0.5) * 0.018 * (1 - dry);
      const jy = (hash(strand + 1.1) - 0.5) * 0.012 * (1 - dry);
      const end = new BABYLON.Vector3(tip.x + jx, tip.y + jy, tip.z);
      left[n - 1].copyFrom(end);
      right[n - 1].copyFrom(end);
      const pinch = 0.55 + dry * 0.35;
      left[n - 2] = BABYLON.Vector3.Lerp(left[n - 2], end, pinch * 0.45);
      right[n - 2] = BABYLON.Vector3.Lerp(right[n - 2], end, pinch * 0.45);
    }
    return [left, right];
  }

  function sampleStroke(strand, grow, dry, target) {
    const head = Math.max(0.05, grow);
    const start = head * dry * 0.9;
    const pts = [];
    for (let s = 0; s <= STROKE_N; s += 1) {
      const t = start + (head - start) * (s / STROKE_N);
      const pos = trailFlight(kind, t, target, strand);
      pts.push(new BABYLON.Vector3(pos.x, pos.y, pos.z));
    }
    return pts;
  }

  function bootStroke(color, thick, alpha) {
    const pathArray = emptyStroke(thick);
    const ribbon = BABYLON.MeshBuilder.CreateRibbon("propStroke", {
      pathArray,
      updatable: true,
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
    }, scene);
    ribbon.material = glowMat(color, alpha, true);
    ribbon.renderingGroupId = 1;
    ribbon._strokeThick = thick;
    ribbon._strokePaths = pathArray;
    ribbon._strokeAlpha = alpha;
    ribbons.push(ribbon);
    return ribbon;
  }

  function bootStrokePair(color, thick, strand) {
    const glow = bootStroke(color, thick * 2.35, 0.42);
    const core = bootStroke(color, thick, 0.98);
    glow._strand = strand;
    core._strand = strand;
    const bead = BABYLON.MeshBuilder.CreateSphere("propStrokeBead", {
      diameterX: thick * 2.8,
      diameterY: thick * 2.8,
      diameterZ: thick * 2.4,
      segments: 8,
    }, scene);
    bead.material = glowMat(color, 0.98, true);
    bead.renderingGroupId = 1;
    bead._coreRibbon = core;
    bead._strand = strand;
    beads.push(bead);
  }

  function markTex() {
    if (kind === "hearts") return heartTex();
    if (kind === "petals") return petalTex();
    if (kind === "star" || kind === "chispa") return starTex();
    return sparkTex();
  }

  function markCount() {
    if (kind === "particles") return 36;
    if (kind === "niebla") return 16;
    if (kind === "hearts") return 8;
    if (kind === "petals") return 10;
    if (kind === "star") return 9;
    if (kind === "chispa") return 18;
    return 12;
  }

  function markScale() {
    if (kind === "niebla") return 0.62;
    if (kind === "hearts") return 0.48;
    if (kind === "petals") return 0.44;
    if (kind === "star") return 0.4;
    if (kind === "particles") return 0.18;
    if (kind === "chispa") return 0.22;
    return 0.14;
  }

  function bootMarkRow(color) {
    const tex = markTex();
    const row = [];
    const n = markCount();
    const add = kind === "particles" || kind === "star" || kind === "chispa";
    for (let i = 0; i < n; i += 1) {
      const plane = BABYLON.MeshBuilder.CreatePlane("propStrokeMark", { size: 1 }, scene);
      plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
      plane.renderingGroupId = 1;
      const mat = glowMat(color, kind === "niebla" ? 0.5 : 1, add);
      mat.diffuseTexture = tex;
      mat.emissiveTexture = tex;
      mat.opacityTexture = tex;
      mat.useAlphaFromDiffuseTexture = true;
      plane.material = mat;
      plane.setEnabled(false);
      row.push(plane);
    }
    markRows.push(row);
  }

  function paintMarks(row, strand, grow, dry, target) {
    const head = Math.max(0.06, grow);
    const start = head * dry * 0.9;
    const shown = Math.max(1, Math.round(head * (row.length - 1)));
    const cut = Math.floor(shown * dry * 0.9);
    const base = markScale();
    for (let i = 0; i < row.length; i += 1) {
      const on = i >= cut && i <= shown && dry < 0.94;
      row[i].setEnabled(on);
      if (!on) continue;
      const t = start + (head - start) * (i / Math.max(1, shown));
      const pos = trailFlight(kind, t, target, strand);
      row[i].position.set(pos.x, pos.y, pos.z);
      const live = 1 - dry * 0.55;
      const along = 0.5 + Math.sin((i / Math.max(1, shown)) * Math.PI) * 0.7;
      const wobble = 0.75 + hash(i + strand * 6) * 0.7;
      row[i].scaling.setAll(base * live * along * wobble);
      if (row[i].material) row[i].material.alpha = (kind === "niebla" ? 0.5 : 1) * live;
    }
  }

  function paintStroke(ribbon, bead, strand, grow, dry, target) {
    const wet = grow > 0.04 && dry < 0.96;
    ribbon.setEnabled(wet);
    if (bead) bead.setEnabled(wet && dry < 0.88);
    if (!wet) return;
    const pts = sampleStroke(strand, grow, dry, target);
    const pathArray = strokeSides(pts, strand, dry, ribbon._strokeThick);
    BABYLON.MeshBuilder.CreateRibbon(null, { pathArray, instance: ribbon });
    if (ribbon.material) ribbon.material.alpha = (ribbon._strokeAlpha || 0.92) * (1 - dry * 0.42);
    if (bead) {
      const tip = pts[pts.length - 1];
      const k = (1 - dry * 0.85) * (0.7 + hash(strand) * 0.45);
      bead.position.copyFrom(tip);
      bead.scaling.set(k * (0.85 + hash(strand + 2) * 0.4), k * (1.15 - dry * 0.45), k * 0.9);
      if (bead.material) bead.material.alpha = 0.95 * (1 - dry * 0.4);
    }
  }

  function bootPuff(emitter, color, scale) {
    const puff = BABYLON.MeshBuilder.CreatePlane("trailPuff", { size: 1 }, scene);
    puff.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    puff.parent = emitter;
    puff.scaling.setAll(scale);
    const mat = glowMat(color, 0.42, false);
    mat.diffuseTexture = sparkTex();
    mat.emissiveTexture = sparkTex();
    mat.opacityTexture = sparkTex();
    mat.useAlphaFromDiffuseTexture = true;
    puff.material = mat;
    puff.renderingGroupId = 1;
    puffs.push(puff);
    return puff;
  }

  function bootDrop(color, pos) {
    drop = BABYLON.MeshBuilder.CreateSphere("trailDrop", {
      diameterX: 0.2,
      diameterY: 0.28,
      diameterZ: 0.2,
      segments: 12,
    }, scene);
    const c = liftColor(color);
    const mat = new BABYLON.StandardMaterial("trailDropMat", scene);
    mat.diffuseColor = new BABYLON.Color3(c.r, c.g, c.b);
    mat.specularColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(c.r * 0.55, c.g * 0.6, c.b * 0.7);
    mat.alpha = 0.88;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    drop.material = mat;
    drop.renderingGroupId = 1;
    drop.position.set(pos.x, pos.y, pos.z);
    const pal = tint(color);
    splash = new BABYLON.ParticleSystem("trailSplash", 280, scene);
    splash.emitter = drop;
    splash.particleTexture = sparkTex();
    splash.blendMode = BABYLON.ParticleSystem.BLENDMODE_ADD;
    splash.color1 = pal.live;
    splash.color2 = pal.mid;
    splash.colorDead = pal.dead;
    splash.emitRate = 0;
    splashRate = 520;
    splash.minSize = 0.07;
    splash.maxSize = 0.18;
    splash.minLifeTime = 0.28;
    splash.maxLifeTime = 0.6;
    splash.gravity = new BABYLON.Vector3(0, -2.8, 0);
    splash.direction1 = new BABYLON.Vector3(-1.4, 0.5, -1.4);
    splash.direction2 = new BABYLON.Vector3(1.4, 2.1, 1.4);
    splash.minEmitPower = 0.7;
    splash.maxEmitPower = 1.8;
    splash.updateSpeed = 0.012;
    splash.preventAutoStart = true;
    splash.renderingGroupId = 1;
    splash.start();
  }

  function usesRibbon(k) {
    return k === "line" || k === "tube" || k === "liana" || k === "brisa";
  }

  function usesMarks(k) {
    return k === "particles" || k === "hearts" || k === "petals" || k === "star"
      || k === "niebla" || k === "chispa" || k === "liana";
  }

  function usesPs(k) {
    return k === "niebla" || k === "chispa" || k === "gota";
  }

  function tick3d(u, target) {
    const { grow, dry } = washPhase(u);
    const lead = trailFlight(kind, Math.max(0.04, grow), target, 0);
    inkU = u;
    const live = u > 0.02 && u < 0.99;
    if (!live) {
      for (const ribbon of ribbons) ribbon.setEnabled(false);
      for (const bead of beads) bead.setEnabled(false);
      for (const row of markRows) {
        for (const mark of row) mark.setEnabled(false);
      }
      for (const ps of systems) ps.emitRate = 0;
      if (drop) drop.setEnabled(false);
      return lead;
    }
    const n = Math.max(1, strandCount(kind));
    for (let i = 0; i < n; i += 1) {
      const pos = trailFlight(kind, grow, target, i);
      if (emitters[i]) emitters[i].position.set(pos.x, pos.y, pos.z);
      const ps = systems[i];
      if (ps) {
        const on = grow > 0.05 && dry < 0.82;
        ps.emitRate = on ? (ps._baseRate || 80) * (1 - dry * 0.7) : 0;
        if (on) ps.start();
      }
      if (markRows[i]) paintMarks(markRows[i], i, grow, dry, target);
    }
    for (const ribbon of ribbons) {
      const strand = ribbon._strand || 0;
      const bead = beads.find((b) => b._coreRibbon === ribbon) || null;
      paintStroke(ribbon, bead, strand, grow, dry, target);
    }
    if (drop) {
      drop.setEnabled(true);
      drop.position.set(lead.x, lead.y, lead.z);
      const squash = lead.squash || 0;
      drop.scaling.set(1 + squash * 0.55, Math.max(0.4, (lead.stretch || 1) * (1 - squash * 0.5)), 1 + squash * 0.55);
      if (splash) splash.emitRate = (lead.splash || 0) > 0.08 ? splashRate * lead.splash : 0;
    }
    return lead;
  }

  function applyColor(color, glow, tail) {
    inkColor = color;
    if (glow != null) inkGlow = glow;
    if (tail != null) inkTail = tail;
    const pal = tint(color, kind === "niebla");
    for (const ps of systems) {
      ps.color1 = pal.live;
      ps.color2 = pal.mid;
      ps.colorDead = pal.dead;
    }
    if (drop?.material) {
      const c = liftColor(color);
      drop.material.diffuseColor.set(c.r, c.g, c.b);
      drop.material.emissiveColor.set(c.r * 0.55, c.g * 0.6, c.b * 0.7);
    }
    for (const ribbon of ribbons) {
      if (ribbon.material) ribbon.material.emissiveColor.set(pal.rgb.r, pal.rgb.g, pal.rgb.b);
    }
    for (const bead of beads) {
      if (bead.material) bead.material.emissiveColor.set(pal.rgb.r, pal.rgb.g, pal.rgb.b);
    }
    for (const puff of puffs) {
      if (puff.material) puff.material.emissiveColor.set(pal.rgb.r, pal.rgb.g, pal.rgb.b);
    }
    for (const row of markRows) {
      for (const mark of row) {
        if (mark.material) mark.material.emissiveColor.set(pal.rgb.r, pal.rgb.g, pal.rgb.b);
      }
    }
  }

  return {
    kind() { return kind; },
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
      if (!draw2d) bootFx(color);
    },
    tick(u, target) {
      if (kind === "none") return { x: target.x, y: target.y, z: target.z };
      if (draw2d) return tickInk(u, target);
      return tick3d(u, target);
    },
    composite(ctx) {
      if (!ctx || kind === "none" || !draw2d) return;
      paintTrail(ctx, inkU);
    },
    emit() {},
    move() {},
    fade() {},
    reset() {
      armed = false;
      for (const ps of systems) {
        ps.reset?.();
        ps.emitRate = 0;
        ps.stop?.();
      }
      for (const ribbon of ribbons) ribbon.setEnabled(false);
      for (const bead of beads) bead.setEnabled(false);
      for (const row of markRows) {
        for (const mark of row) mark.setEnabled(false);
      }
      splash?.reset?.();
      const n = strandCount(kind);
      for (let i = 0; i < n; i += 1) {
        const pos = parkAt(kind, i, park);
        if (emitters[i]) emitters[i].position.set(pos.x, pos.y, pos.z);
        last[i]?.set(pos.x, pos.y, pos.z);
      }
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
