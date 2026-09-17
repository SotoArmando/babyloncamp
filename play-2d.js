import { resolvePalette } from "./ad-catalog.js";

export const PLAY_2D_IDS = ["horizon", "sundown", "storm", "aurora", "erupt", "migrate", "breaker", "calve"];

export const PLAY_2D_MS = {
  horizonDelayMs: 480,
  horizonRiseMs: 3400,
  horizonHoldMs: 820,
  stormBuildMs: 920,
  stormFlashMs: 150,
  stormSilenceMs: 1080,
  auroraDelayMs: 160,
  auroraRiseMs: 2400,
  auroraHoldMs: 1600,
  eruptBuildMs: 1600,
  eruptBurstMs: 700,
  eruptFallMs: 1400,
  eruptRestMs: 700,
  migrateDelayMs: 220,
  migrateFlyMs: 5200,
  migrateRestMs: 900,
  breakBuildMs: 2400,
  breakHoldMs: 320,
  breakCrashMs: 380,
  breakWashMs: 1100,
  breakRestMs: 650,
  calveLookMs: 1600,
  calvePeelMs: 400,
  calveDropMs: 560,
  calveSplashMs: 480,
  calveSettleMs: 1100,
  calveRestMs: 700,
};

export function isCanvas2DPlay(play) {
  return PLAY_2D_IDS.includes(String(play || ""));
}

export function play2dBodyMs(play) {
  const ms = PLAY_2D_MS;
  if (play === "horizon" || play === "sundown") return ms.horizonDelayMs + ms.horizonRiseMs + ms.horizonHoldMs;
  if (play === "storm") return ms.stormBuildMs + ms.stormFlashMs + ms.stormSilenceMs;
  if (play === "aurora") return ms.auroraDelayMs + ms.auroraRiseMs + ms.auroraHoldMs;
  if (play === "erupt") return ms.eruptBuildMs + ms.eruptBurstMs + ms.eruptFallMs + ms.eruptRestMs;
  if (play === "migrate") return ms.migrateDelayMs + ms.migrateFlyMs + ms.migrateRestMs;
  if (play === "breaker") return ms.breakBuildMs + ms.breakHoldMs + ms.breakCrashMs + ms.breakWashMs + ms.breakRestMs;
  if (play === "calve") return ms.calveLookMs + ms.calvePeelMs + ms.calveDropMs + ms.calveSplashMs + ms.calveSettleMs + ms.calveRestMs;
  return 0;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function hexRgb(hex) {
  const raw = String(hex || "").replace("#", "");
  if (raw.length === 3) {
    return raw.split("").map((c) => parseInt(c + c, 16) || 0);
  }
  return [
    parseInt(raw.slice(0, 2), 16) || 0,
    parseInt(raw.slice(2, 4), 16) || 0,
    parseInt(raw.slice(4, 6), 16) || 0,
  ];
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

function bindSkip(container, skip) {
  container.addEventListener("click", skip);
  container.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") skip();
  });
  container.tabIndex = 0;
}

function dawnEase(t) {
  const x = Math.min(1, Math.max(0, t));
  if (x < 0.42) {
    const k = x / 0.42;
    return 0.32 * k * k * (3 - 2 * k);
  }
  const k = (x - 0.42) / 0.58;
  return 0.32 + 0.68 * k * k * (3 - 2 * k);
}
function paintSunset(ctx, w, h, u, view, down = false, pal) {
  pal = pal || resolvePalette(down ? "sundown" : "horizon");
  const s = Math.min(1, Math.max(0, u));
  const hy = h * (view.wide ? 0.52 : view.tall ? 0.7 : 0.6);
  const r = Math.min(w, h) * 0.14;
  const x = w * 0.5;
  const y = down
    ? lerp(hy - r * 2.35, hy, s)
    : lerp(hy + r * 0.7, hy - r * 2.35, s);
  const rgb = (a, b, t) => {
    const m = (i) => (a[i] + (b[i] - a[i]) * t) | 0;
    return `rgb(${m(0)},${m(1)},${m(2)})`;
  };
  const sky0 = hexRgb(pal.skyNight);
  const sea0 = hexRgb(pal.seaNight);
  const sky1 = hexRgb(pal.skyDay);
  const sea1 = hexRgb(pal.seaDay);

  ctx.fillStyle = rgb(sky0, sky1, s);
  ctx.fillRect(0, 0, w, hy);
  ctx.fillStyle = rgb(sea0, sea1, s);
  ctx.fillRect(0, hy, w, h - hy);

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, hy);
  ctx.clip();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = rgb(hexRgb(pal.sun), hexRgb(pal.sun), s);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.28)";
  ctx.fillRect(0, hy, w, 1);
}

function paintStorm(ctx, w, h, beat, view, pal) {
  pal = pal || resolvePalette("storm");
  const hy = h * (view.wide ? 0.52 : view.tall ? 0.7 : 0.6);
  const flash = beat.flash;
  const rgb = (a, b, t) => {
    const m = (i) => (a[i] + (b[i] - a[i]) * t) | 0;
    return `rgb(${m(0)},${m(1)},${m(2)})`;
  };

  ctx.fillStyle = rgb(hexRgb(pal.sky), hexRgb(pal.skyFlash), flash);
  ctx.fillRect(0, 0, w, hy);
  ctx.fillStyle = rgb(hexRgb(pal.sea), hexRgb(pal.skyFlash), flash * 0.55);
  ctx.fillRect(0, hy, w, h - hy);

  if (beat.bolt > 0.02) {
    const x0 = w * (view.tall ? 0.5 : 0.58);
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, hy);
    ctx.clip();
    ctx.beginPath();
    ctx.moveTo(x0, 0);
    ctx.lineTo(x0 - w * 0.05, hy * 0.28);
    ctx.lineTo(x0 + w * 0.07, hy * 0.34);
    ctx.lineTo(x0 - w * 0.03, hy * 0.64);
    ctx.lineTo(x0 + w * 0.02, hy);
    ctx.strokeStyle = rgbaHex(pal.bolt, 0.35 + beat.bolt * 0.65);
    ctx.lineWidth = Math.max(1.5, Math.min(w, h) * 0.012);
    ctx.lineJoin = "miter";
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.fillRect(0, hy, w, 1);
}

function attachHorizon2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintSunset(ctx, bw, bh, 0, view, false, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const delay = PLAY_2D_MS.horizonDelayMs;
    const rise = PLAY_2D_MS.horizonRiseMs;
    const hold = PLAY_2D_MS.horizonHoldMs;
    if (elapsed >= delay + rise + hold) reveal();
    let u = 0;
    if (elapsed > delay) u = dawnEase((elapsed - delay) / rise);
    if (unit.climax || elapsed >= delay + rise) u = 1;
    paintSunset(ctx, bw, bh, u, view, false, hostPalette(container));
  };
}

function duskEase(t) {
  const x = Math.min(1, Math.max(0, t));
  if (x < 0.58) {
    const k = x / 0.58;
    return 0.68 * k * k * (3 - 2 * k);
  }
  const k = (x - 0.58) / 0.42;
  return 0.68 + 0.32 * k * k * (3 - 2 * k);
}

function attachSundown2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintSunset(ctx, bw, bh, 0, view, true, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const delay = PLAY_2D_MS.horizonDelayMs;
    const drop = PLAY_2D_MS.horizonRiseMs;
    const hold = PLAY_2D_MS.horizonHoldMs;
    if (elapsed >= delay + drop + hold) reveal();
    let u = 0;
    if (elapsed > delay) u = duskEase((elapsed - delay) / drop);
    if (unit.climax || elapsed >= delay + drop) u = 1;
    paintSunset(ctx, bw, bh, u, view, true, hostPalette(container));
  };
}

function stormBeat(elapsed) {
  const build = PLAY_2D_MS.stormBuildMs;
  const flash = PLAY_2D_MS.stormFlashMs;
  const silence = PLAY_2D_MS.stormSilenceMs;
  const pre = 180;
  if (elapsed < build - pre) return { flash: 0, bolt: 0, done: false };
  if (elapsed < build) {
    const t = (elapsed - (build - pre)) / pre;
    const pulse = t < 0.45 ? Math.sin((t / 0.45) * Math.PI) * 0.22 : 0;
    return { flash: pulse, bolt: 0, done: false };
  }
  if (elapsed < build + flash) {
    const t = (elapsed - build) / flash;
    const pulse = Math.sin(t * Math.PI);
    return { flash: pulse, bolt: pulse, done: false };
  }
  const after = (elapsed - build - flash) / 420;
  const glow = Math.max(0, 1 - after) * 0.1;
  return { flash: glow, bolt: 0, done: elapsed >= build + flash + silence };
}

function attachStorm2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintStorm(ctx, bw, bh, { flash: 0, bolt: 0 }, view, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const beat = stormBeat(elapsed);
    if (beat.done) reveal();
    paintStorm(ctx, bw, bh, unit.climax ? { flash: 0.04, bolt: 0 } : beat, view, hostPalette(container));
  };
}

function paintAurora(ctx, w, h, u, view, elapsed = 0, pal) {
  pal = pal || resolvePalette("aurora");
  const s = Math.min(1, Math.max(0, u));
  const hy = h * (view.wide ? 0.58 : view.tall ? 0.72 : 0.62);
  const clock = elapsed * 0.00105;
  const rgbMix = (a, b, t) => {
    const m = (i) => (a[i] + (b[i] - a[i]) * t) | 0;
    return `rgb(${m(0)},${m(1)},${m(2)})`;
  };

  ctx.fillStyle = rgbMix(hexRgb(pal.sky), hexRgb(pal.sky), s);
  ctx.fillRect(0, 0, w, hy);
  ctx.fillStyle = rgbMix(hexRgb(pal.sea), hexRgb(pal.sea), s);
  ctx.fillRect(0, hy, w, h - hy);

  if (!view.wide) {
    ctx.fillStyle = `rgba(220,230,255,${0.22 + s * 0.18})`;
    for (const st of [[0.1, 0.16], [0.2, 0.38], [0.38, 0.1], [0.55, 0.22], [0.72, 0.14], [0.86, 0.32], [0.14, 0.52], [0.91, 0.08]]) {
      ctx.fillRect(st[0] * w, st[1] * hy, 1.5, 1.5);
    }
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, hy);
  ctx.clip();
  const bottom = hy * 0.98;
  const top = lerp(hy * 0.42, hy * 0.04, s);
  const curtains = [
    { cx: 0.3, width: 0.16, amp: 0.05, freq: 3.1, speed: 0.72, rgb: rgbCsv(pal.bandA), a: 0.78 },
    { cx: 0.5, width: 0.22, amp: 0.07, freq: 2.4, speed: 0.5, rgb: rgbCsv(pal.bandB), a: 0.7 },
    { cx: 0.68, width: 0.14, amp: 0.055, freq: 3.6, speed: 0.9, rgb: rgbCsv(pal.bandC), a: 0.55 },
  ];
  const steps = 28;
  for (const band of curtains) {
    const cx = band.cx * w;
    const half = band.width * w * 0.5;
    const amp = band.amp * w;
    const phase = clock * band.speed + band.cx * 8;
    const alpha = band.a * (0.28 + 0.72 * s);
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = lerp(bottom, top, t);
      const sway = Math.sin(t * band.freq + phase) * amp;
      const taper = 0.4 + 0.6 * Math.sin(t * Math.PI);
      const x = cx + sway - half * taper;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const y = lerp(bottom, top, t);
      const sway = Math.sin(t * band.freq + phase) * amp;
      const taper = 0.4 + 0.6 * Math.sin(t * Math.PI);
      ctx.lineTo(cx + sway + half * taper, y);
    }
    ctx.closePath();
    const grad = ctx.createLinearGradient(cx, bottom, cx, top);
    grad.addColorStop(0, `rgba(${band.rgb},0)`);
    grad.addColorStop(0.2, `rgba(${band.rgb},${alpha * 0.55})`);
    grad.addColorStop(0.5, `rgba(${band.rgb},${alpha})`);
    grad.addColorStop(1, `rgba(${band.rgb},0)`);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const y = lerp(bottom, top, t);
      const x = cx + Math.sin(t * band.freq + phase) * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(255,255,245,${0.18 + 0.42 * s})`;
    ctx.lineWidth = Math.max(1.25, Math.min(w, h) * 0.008);
    ctx.stroke();
  }
  ctx.restore();

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(0, hy, w, 1);
}

function attachAurora2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintAurora(ctx, bw, bh, 0, view, 0, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const delay = PLAY_2D_MS.auroraDelayMs;
    const rise = PLAY_2D_MS.auroraRiseMs;
    const hold = PLAY_2D_MS.auroraHoldMs;
    if (elapsed >= delay + rise + hold) reveal();
    let u = 0;
    if (elapsed > delay) {
      const k = Math.min(1, Math.max(0, (elapsed - delay) / rise));
      u = Math.pow(k, 0.55);
    }
    if (unit.climax || elapsed >= delay + rise) u = 1;
    paintAurora(ctx, bw, bh, u, view, elapsed, hostPalette(container));
  };
}

function eruptBeat(elapsed) {
  const build = PLAY_2D_MS.eruptBuildMs;
  const burst = PLAY_2D_MS.eruptBurstMs;
  const fall = PLAY_2D_MS.eruptFallMs;
  const rest = PLAY_2D_MS.eruptRestMs;
  if (elapsed < build) {
    const t = Math.min(1, elapsed / build);
    return { glow: Math.pow(t, 0.65), burst: 0, plume: t * 0.1, fade: 0, done: false };
  }
  if (elapsed < build + burst) {
    const t = (elapsed - build) / burst;
    const pulse = Math.sin(Math.min(1, t) * Math.PI);
    return { glow: 1, burst: Math.pow(pulse, 0.7), plume: 0.15 + t * 0.85, fade: 0, done: false };
  }
  if (elapsed < build + burst + fall) {
    const t = (elapsed - build - burst) / fall;
    return { glow: Math.max(0.08, 1 - t), burst: 0, plume: Math.max(0, 1 - t * 0.85), fade: t, done: false };
  }
  return { glow: 0.06, burst: 0, plume: 0, fade: 1, done: elapsed >= build + burst + fall + rest };
}

function paintEruption(ctx, w, h, beat, view, pal) {
  pal = pal || resolvePalette("erupt");
  const groundY = h * (view.wide ? 0.8 : view.tall ? 0.78 : 0.76);
  const mountH = h * (view.wide ? 0.58 : view.tall ? 0.44 : 0.48);
  const peakY = groundY - mountH;
  const cx = w * 0.5;
  const half = w * (view.wide ? 0.2 : view.tall ? 0.36 : 0.28);
  const left = cx - half;
  const right = cx + half;
  const crater = Math.max(6, half * 0.14);
  const glow = beat.glow;
  const burst = beat.burst;
  const plume = beat.plume;
  const fade = beat.fade || 0;
  const live = 1 - fade;
  const rgb = (a, b, t) => {
    const m = (i) => (a[i] + (b[i] - a[i]) * t) | 0;
    return `rgb(${m(0)},${m(1)},${m(2)})`;
  };
  const heat = Math.min(1, glow * 0.4 * live + burst);

  ctx.fillStyle = rgb(hexRgb(pal.sky), hexRgb(pal.fire), heat);
  ctx.fillRect(0, 0, w, groundY);
  if (burst > 0.35) {
    ctx.fillStyle = `rgba(255,230,160,${(burst - 0.35) * 1.4})`;
    ctx.fillRect(0, 0, w, groundY);
  }
  ctx.fillStyle = rgb(hexRgb(pal.ground), hexRgb(pal.lava), heat * 0.4 * live);
  ctx.fillRect(0, groundY, w, h - groundY);

  if (plume > 0.06 && live > 0.04) {
    const colH = Math.max(8, peakY * (0.25 + plume * 0.9) * (0.55 + 0.45 * live));
    const stemW = crater * (1.6 + burst * 3.5 + plume * 1.2) * live;
    const capW = Math.min(w * 0.48, crater * (4 + burst * 10 + plume * 5)) * live;
    const capY = peakY - colH * 0.82 - fade * peakY * 0.25;
    const stemY = peakY - colH * 0.38;
    ctx.beginPath();
    ctx.ellipse(cx, capY, capW, Math.max(6, colH * 0.28 * live), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(48,36,38,${(0.45 + plume * 0.4) * live})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, stemY, stemW, colH * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,${(90 + burst * 110) | 0},32,${(0.25 + glow * 0.25 + burst * 0.55) * live})`;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, capY + colH * 0.04, capW * 0.45, Math.max(4, colH * 0.12), 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,220,140,${burst * 0.85 * live})`;
    ctx.fill();
  }

  if (burst > 0.05) {
    const rad = Math.min(w, h) * (0.12 + burst * 0.38);
    ctx.beginPath();
    ctx.arc(cx, peakY, rad, Math.PI, 0);
    ctx.fillStyle = `rgba(255,244,200,${burst * 0.95})`;
    ctx.fill();
  }

  const cut = burst > 0.12;
  ctx.beginPath();
  ctx.moveTo(left, groundY);
  ctx.lineTo(cx, peakY);
  ctx.lineTo(cx, groundY);
  ctx.closePath();
  ctx.fillStyle = cut ? pal.ground : rgb(hexRgb(pal.cone), hexRgb(pal.lava), glow * 0.35);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, groundY);
  ctx.lineTo(cx, peakY);
  ctx.lineTo(right, groundY);
  ctx.closePath();
  ctx.fillStyle = cut ? pal.cone : rgb(hexRgb(pal.cone), hexRgb(pal.lava), glow * 0.55);
  ctx.fill();

  if (glow > 0.04 && live > 0.08) {
    const thick = Math.max(2.5, half * 0.055) * (0.35 + glow) * live;
    ctx.beginPath();
    ctx.moveTo(cx + crater * 0.15, peakY + mountH * 0.05);
    ctx.lineTo(cx + crater * 0.15 + thick * 0.6, peakY + mountH * 0.05);
    ctx.lineTo(cx + half * 0.58 + thick, groundY);
    ctx.lineTo(cx + half * 0.58 - thick * 0.15, groundY);
    ctx.closePath();
    ctx.fillStyle = `rgba(255,${(60 + glow * 100) | 0},18,${(0.4 + glow * 0.6) * live})`;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.moveTo(cx - crater, peakY + 2);
  ctx.lineTo(cx, peakY - crater * (0.4 + burst * 0.8));
  ctx.lineTo(cx + crater, peakY + 2);
  ctx.closePath();
  ctx.fillStyle = `rgba(255,${(70 + glow * 90 + burst * 80) | 0},28,${0.2 + glow * 0.55 * live + burst * 0.4})`;
  ctx.fill();
}

function attachErupt2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintEruption(ctx, bw, bh, { glow: 0, burst: 0, plume: 0, fade: 1 }, view, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const beat = eruptBeat(elapsed);
    if (beat.done) reveal();
    paintEruption(ctx, bw, bh, unit.climax ? { glow: 0.06, burst: 0, plume: 0, fade: 1 } : beat, view, hostPalette(container));
  };
}

function paintMigrate(ctx, w, h, t, view, elapsed, pal) {
  pal = pal || resolvePalette("migrate");
  const hy = h * (view.wide ? 0.72 : view.tall ? 0.8 : 0.7);
  const sky = ctx.createLinearGradient(0, 0, 0, hy);
  sky.addColorStop(0, pal.skyTop);
  sky.addColorStop(0.55, pal.skyMid);
  sky.addColorStop(1, pal.skyHorizon);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, hy);
  ctx.fillStyle = pal.earth;
  ctx.beginPath();
  ctx.moveTo(0, h);
  ctx.lineTo(0, hy);
  ctx.lineTo(w * 0.22, hy - h * 0.04);
  ctx.lineTo(w * 0.48, hy + h * 0.01);
  ctx.lineTo(w * 0.78, hy - h * 0.05);
  ctx.lineTo(w, hy);
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
  if (t <= 0 || t >= 1) return;

  const tall = view.tall;
  const size0 = Math.max(9, Math.min(w, hy) * (view.wide ? 0.16 : 0.075));
  const wingN = view.wide ? 5 : tall ? 8 : 7;
  const gapAlong = size0 * 2.15;
  const gapSide = size0 * 1.55;
  const trail = wingN * gapAlong;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, hy);
  ctx.clip();
  ctx.fillStyle = pal.birds;
  const dart = (x, y, s, flap, up) => {
    const spread = s * (0.7 + flap * 0.38);
    ctx.beginPath();
    if (up) {
      ctx.moveTo(x, y - s);
      ctx.lineTo(x - spread, y + s * 0.38);
      ctx.lineTo(x, y + s * 0.08);
      ctx.lineTo(x + spread, y + s * 0.38);
    } else {
      ctx.moveTo(x + s, y);
      ctx.lineTo(x - s * 0.38, y - spread);
      ctx.lineTo(x - s * 0.08, y);
      ctx.lineTo(x - s * 0.38, y + spread);
    }
    ctx.closePath();
    ctx.fill();
  };
  let fx;
  let fy;
  let bx;
  let by;
  let sx;
  let sy;
  if (tall) {
    fx = w * 0.5;
    fy = lerp(h + size0, -trail - size0, t);
    bx = 0;
    by = gapAlong;
    sx = gapSide;
    sy = 0;
  } else {
    fx = lerp(-size0, w + trail + size0, t);
    fy = hy * 0.38;
    bx = -gapAlong;
    by = 0;
    sx = 0;
    sy = gapSide;
  }
  const place = (i, side) => {
    const s = size0 * (1 - i * 0.07);
    const flap = 0.5 + 0.5 * Math.sin(elapsed * 0.011 + i * 0.7 + side);
    dart(fx + bx * i + sx * side, fy + by * i + sy * side, s, flap, tall);
  };
  place(0, 0);
  for (let i = 1; i <= wingN; i++) {
    place(i, -1);
    place(i, 1);
  }
  ctx.restore();
}

function attachMigrate2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintMigrate(ctx, bw, bh, 0, view, 0, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const delay = PLAY_2D_MS.migrateDelayMs;
    const fly = PLAY_2D_MS.migrateFlyMs;
    const rest = PLAY_2D_MS.migrateRestMs;
    if (elapsed >= delay + fly + rest) reveal();
    let u = 0;
    if (elapsed > delay) u = Math.min(1, (elapsed - delay) / fly);
    let t = 0;
    if (u < 0.16) t = (u / 0.16) * 0.26;
    else if (u < 0.78) t = 0.26 + ((u - 0.16) / 0.62) * 0.48;
    else t = 0.74 + ((u - 0.78) / 0.22) * 0.26;
    if (unit.climax || elapsed >= delay + fly) t = 1;
    paintMigrate(ctx, bw, bh, t, view, elapsed, hostPalette(container));
  };
}

function breakerBeat(elapsed) {
  const build = PLAY_2D_MS.breakBuildMs;
  const hold = PLAY_2D_MS.breakHoldMs;
  const crash = PLAY_2D_MS.breakCrashMs;
  const wash = PLAY_2D_MS.breakWashMs;
  const rest = PLAY_2D_MS.breakRestMs;
  if (elapsed < build) {
    const t = Math.min(1, elapsed / build);
    return { amp: Math.pow(t, 2.2), foam: t * 0.06, done: false };
  }
  if (elapsed < build + hold) {
    return { amp: 1, foam: 0.1, done: false };
  }
  if (elapsed < build + hold + crash) {
    const t = (elapsed - build - hold) / crash;
    return { amp: 1 - t * 0.35, foam: 0.1 + 0.9 * t, done: false };
  }
  if (elapsed < build + hold + crash + wash) {
    const t = (elapsed - build - hold - crash) / wash;
    return { amp: Math.max(0, 0.65 * (1 - t)), foam: Math.max(0, 1 - t), done: false };
  }
  return { amp: 0, foam: 0, done: elapsed >= build + hold + crash + wash + rest };
}

function paintBreaker(ctx, w, h, beat, view, pal) {
  pal = pal || resolvePalette("breaker");
  const hy = h * (view.wide ? 0.42 : view.tall ? 0.38 : 0.4);
  const sand = h * (view.wide ? 0.9 : 0.88);
  const a = Math.min(1, Math.max(0, beat.amp));
  const foam = Math.min(1, Math.max(0, beat.foam));
  const n = 28;
  const maxH = h * (view.wide ? 0.36 : 0.5);

  ctx.fillStyle = pal.sky;
  ctx.fillRect(0, 0, w, hy);
  ctx.fillStyle = pal.sea;
  ctx.fillRect(0, hy, w, sand - hy);
  ctx.fillStyle = pal.sand;
  ctx.fillRect(0, sand, w, h - sand);
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.fillRect(0, hy, w, 1);

  if (a < 0.02 && foam < 0.04) return;

  const xAt = (i) => (i / n) * w;
  const riseAt = (i) => {
    const u = i / n;
    const ridge = 0.78 + 0.22 * Math.sin(u * Math.PI);
    return maxH * a * ridge;
  };
  const crestAt = (i) => hy - riseAt(i);
  const foot = hy + h * 0.012;

  ctx.beginPath();
  ctx.moveTo(0, foot);
  for (let i = 0; i <= n; i++) ctx.lineTo(xAt(i), crestAt(i));
  ctx.lineTo(w, foot);
  ctx.closePath();
  const wall = ctx.createLinearGradient(0, hy - maxH, 0, foot);
  wall.addColorStop(0, pal.sea);
  wall.addColorStop(0.28, pal.wave);
  wall.addColorStop(1, pal.sea);
  ctx.fillStyle = wall;
  ctx.fill();

  const lip = Math.max(3.5, h * (0.022 + a * 0.028));
  ctx.beginPath();
  for (let i = 0; i <= n; i++) {
    const y = crestAt(i) - lip * 0.2 + Math.sin(i * 1.35) * lip * 0.12;
    if (i === 0) ctx.moveTo(xAt(i), y);
    else ctx.lineTo(xAt(i), y);
  }
  for (let i = n; i >= 0; i--) ctx.lineTo(xAt(i), crestAt(i) + lip * 0.85);
  ctx.closePath();
  ctx.fillStyle = rgbaHex(pal.foam, 0.62 + a * 0.38);
  ctx.fill();

  if (foam > 0.12) {
    const dump = Math.min(1, (foam - 0.12) / 0.88);
    ctx.beginPath();
    ctx.moveTo(0, crestAt(0) + lip);
    for (let i = 1; i <= n; i++) ctx.lineTo(xAt(i), crestAt(i) + lip);
    for (let i = n; i >= 0; i--) ctx.lineTo(xAt(i), lerp(crestAt(i) + lip, foot, dump));
    ctx.closePath();
    ctx.fillStyle = rgbaHex(pal.foam, 0.35 + dump * 0.55);
    ctx.fill();
  }
}

function attachBreaker2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintBreaker(ctx, bw, bh, { amp: 0, foam: 0 }, view, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const beat = breakerBeat(elapsed);
    if (beat.done) reveal();
    paintBreaker(ctx, bw, bh, unit.climax ? { amp: 0, foam: 0 } : beat, view, hostPalette(container));
  };
}

function calveBeat(elapsed) {
  const look = PLAY_2D_MS.calveLookMs;
  const peel = PLAY_2D_MS.calvePeelMs;
  const drop = PLAY_2D_MS.calveDropMs;
  const splash = PLAY_2D_MS.calveSplashMs;
  const settle = PLAY_2D_MS.calveSettleMs;
  const rest = PLAY_2D_MS.calveRestMs;
  if (elapsed < look) return { peel: 0, fall: 0, splash: 0, done: false };
  if (elapsed < look + peel) {
    return { peel: (elapsed - look) / peel, fall: 0, splash: 0, done: false };
  }
  if (elapsed < look + peel + drop) {
    const t = (elapsed - look - peel) / drop;
    return { peel: 1, fall: t * t, splash: t > 0.8 ? (t - 0.8) / 0.2 : 0, done: false };
  }
  if (elapsed < look + peel + drop + splash) {
    const t = (elapsed - look - peel - drop) / splash;
    return { peel: 1, fall: 1, splash: Math.sin(t * Math.PI), done: false };
  }
  if (elapsed < look + peel + drop + splash + settle) {
    const t = (elapsed - look - peel - drop - splash) / settle;
    return { peel: 1, fall: 1, splash: 0.12 * (1 - t), done: false };
  }
  return { peel: 1, fall: 1, splash: 0, done: elapsed >= look + peel + drop + splash + settle + rest };
}

function paintCalve(ctx, w, h, beat, view, pal) {
  pal = pal || resolvePalette("calve");
  const waterY = h * (view.wide ? 0.7 : 0.72);
  const peel = beat.peel;
  const fall = beat.fall;
  const splash = beat.splash;
  const nL = w * 0.36;
  const nR = w * 0.64;
  const nEdge = h * (view.wide ? 0.2 : 0.18);
  const nPeak = h * 0.07;
  const nW = nR - nL;
  const nH = waterY - nPeak;
  const moving = peel > 0.02 || fall > 0.01;
  const gap = moving ? peel * w * 0.012 : 0;
  const lean = Math.min(1, peel * 0.75 + fall * 0.2);
  const cx = (nL + nR) * 0.5;
  const dy = lerp(0, waterY - nH * 0.22 - nPeak, fall);
  const spread = lean * nW * 0.2;

  ctx.fillStyle = pal.sky;
  ctx.fillRect(0, 0, w, waterY);
  ctx.fillStyle = pal.water;
  ctx.fillRect(0, waterY, w, h - waterY);

  ctx.beginPath();
  ctx.moveTo(0, waterY);
  ctx.lineTo(w * 0.04, h * 0.4);
  ctx.lineTo(w * 0.15, h * 0.14);
  ctx.lineTo(w * 0.26, h * 0.22);
  ctx.lineTo(nL - gap, nEdge);
  ctx.lineTo(nL - gap, waterY);
  ctx.closePath();
  ctx.fillStyle = pal.iceShade;
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(nR + gap, waterY);
  ctx.lineTo(nR + gap, nEdge);
  ctx.lineTo(w * 0.74, h * 0.12);
  ctx.lineTo(w * 0.86, h * 0.2);
  ctx.lineTo(w * 0.97, h * 0.38);
  ctx.lineTo(w, waterY);
  ctx.closePath();
  ctx.fillStyle = pal.ice;
  ctx.fill();

  const slabPath = () => {
    ctx.beginPath();
    ctx.moveTo(nL - spread, nEdge + dy);
    ctx.lineTo(cx, nPeak + dy);
    ctx.lineTo(nR + spread, nEdge + dy);
    ctx.lineTo(nR - nW * 0.06 + spread * 0.25, waterY + dy);
    ctx.lineTo(nL + nW * 0.06 - spread * 0.25, waterY + dy);
    ctx.closePath();
  };

  slabPath();
  ctx.fillStyle = moving ? pal.ice : pal.iceShade;
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, waterY, w, h - waterY);
  ctx.clip();
  slabPath();
  ctx.fillStyle = pal.under;
  ctx.fill();
  ctx.restore();

  if (splash > 0.05) {
    ctx.fillStyle = `rgba(236,246,252,${0.5 + splash * 0.5})`;
    ctx.beginPath();
    ctx.moveTo(cx - nW, waterY);
    ctx.lineTo(cx, waterY - h * (0.1 + splash * 0.28));
    ctx.lineTo(cx + nW, waterY);
    ctx.closePath();
    ctx.fill();
  }
}

function attachCalve2D(container, unit, api) {
  if (!unit) return;
  const reveal = () => {
    if (unit.climax) return;
    api.onReveal();
  };
  bindSkip(container, reveal);
  unit.paint2d = (ctx, bw, bh) => {
    const aspect = bw / Math.max(1, bh);
    const view = { aspect, wide: aspect > 2.4, tall: aspect < 0.6 };
    if (!unit.visible) {
      unit.journeyAt = 0;
      api.onReset();
      paintCalve(ctx, bw, bh, { peel: 0, fall: 0, splash: 0 }, view, hostPalette(container));
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = performance.now();
    const elapsed = performance.now() - unit.journeyAt;
    const beat = calveBeat(elapsed);
    if (beat.done) reveal();
    paintCalve(ctx, bw, bh, unit.climax ? { peel: 1, fall: 1, splash: 0 } : beat, view, hostPalette(container));
  };
}

const ATTACH = {
  horizon: attachHorizon2D,
  sundown: attachSundown2D,
  storm: attachStorm2D,
  aurora: attachAurora2D,
  erupt: attachErupt2D,
  migrate: attachMigrate2D,
  breaker: attachBreaker2D,
  calve: attachCalve2D,
};

export function attachPlay2D(container, unit, api = {}) {
  const attach = ATTACH[container?.dataset.play];
  if (!attach || !unit) return false;
  attach(container, unit, {
    onReveal: api.onReveal || (() => {}),
    onReset: api.onReset || (() => {}),
  });
  return true;
}

export function bootPlay2D(container, opts = {}) {
  const canvas = opts.canvas || container?.querySelector("canvas");
  if (!container || !canvas) return false;
  const unit = {
    visible: true,
    climax: false,
    journeyAt: 0,
    paint2d: null,
  };
  const ok = attachPlay2D(container, unit, {
    onReveal() {
      if (unit.climax) return;
      unit.climax = true;
      opts.onReveal?.();
    },
    onReset() {
      unit.climax = false;
      unit.journeyAt = 0;
    },
  });
  if (!ok) return false;
  const dpr = Number(opts.dpr) > 0 ? Number(opts.dpr) : 2.5;
  let ctx = null;
  const tick = () => {
    if (!container.isConnected) return;
    const w = canvas.clientWidth | 0;
    const h = canvas.clientHeight | 0;
    if (w >= 2 && h >= 2) {
      const bw = Math.max(2, Math.round(w * dpr));
      const bh = Math.max(2, Math.round(h * dpr));
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
        ctx = null;
      }
      if (!ctx) ctx = canvas.getContext("2d", { alpha: false });
      unit.paint2d?.(ctx, bw, bh);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  return true;
}

if (typeof window !== "undefined") {
  window.bootPlay2D = bootPlay2D;
  window.dispatchEvent(new Event("play-2d-ready"));
}
