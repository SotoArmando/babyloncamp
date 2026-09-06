const LUT = 2048;
const TWO_PI = Math.PI * 2;
const DROP_SAMPLES = 30;
const IMPACT_T = 0.55;
const WAVE = { A: 16, k: 0.11, omega: 10, alpha: 0.85, beta: 0.014 };

const sinTab = new Float32Array(LUT);
const expTab = new Float32Array(LUT);
for (let i = 0; i < LUT; i++) {
  sinTab[i] = Math.sin((i / LUT) * TWO_PI);
  expTab[i] = Math.exp(-(i / (LUT - 1)) * 8);
}

function lutSin(x) {
  const u = ((x / TWO_PI) % 1 + 1) % 1;
  return sinTab[(u * LUT) | 0];
}

function lutExp(x) {
  if (x <= 0) return 1;
  if (x >= 8) return 0;
  return expTab[((x / 8) * (LUT - 1)) | 0];
}

function bakeDropPath() {
  const pts = new Float32Array(DROP_SAMPLES);
  for (let i = 0; i < DROP_SAMPLES; i++) {
    const t = (i / (DROP_SAMPLES - 1)) * IMPACT_T;
    pts[i] = (t * t) / (IMPACT_T * IMPACT_T);
  }
  return pts;
}

function dropFall(path, t) {
  if (t <= 0) return 0;
  if (t >= IMPACT_T) return 1;
  const u = (t / IMPACT_T) * (DROP_SAMPLES - 1);
  const i = Math.min(DROP_SAMPLES - 2, u | 0);
  const f = u - i;
  return path[i] + (path[i + 1] - path[i]) * f;
}

function bakeBg(w, h) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) {
    const v = y / Math.max(1, h - 1);
    const sky = v < 0.42;
    for (let x = 0; x < w; x++) {
      const u = x / Math.max(1, w - 1);
      const i = (y * w + x) * 4;
      if (sky) {
        const s = v / 0.42;
        data[i] = 110 + s * 70 + u * 8;
        data[i + 1] = 150 + s * 40;
        data[i + 2] = 168 + s * 12;
      } else {
        const s = (v - 0.42) / 0.58;
        data[i] = 8 + s * 10;
        data[i + 1] = 36 + s * 22 + Math.sin(u * 6) * 4;
        data[i + 2] = 48 + s * 18;
      }
      data[i + 3] = 255;
    }
  }
  return data;
}

function sampleBg(bg, w, h, x, y) {
  const xi = Math.max(0, Math.min(w - 1, x | 0));
  const yi = Math.max(0, Math.min(h - 1, y | 0));
  return (yi * w + xi) * 4;
}

const DROP_PATH = bakeDropPath();

export function attachWave2D(container, unit, timingMs) {
  const canvas = unit.display;
  const accent = container.dataset.accent || "#7ec8e8";
  let raf = 0;
  let buf = null;
  let bg = null;
  let gw = 0;
  let gh = 0;
  const off = document.createElement("canvas");
  const offCtx = off.getContext("2d", { alpha: false });

  const hex = accent.replace("#", "");
  const ar = parseInt(hex.slice(0, 2), 16);
  const ag = parseInt(hex.slice(2, 4), 16);
  const ab = parseInt(hex.slice(4, 6), 16);

  const fit = () => {
    const w = Math.max(2, canvas.clientWidth | 0);
    const h = Math.max(2, canvas.clientHeight | 0);
    const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const bw = Math.round(w * dpr);
    const bh = Math.round(h * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    gw = Math.max(80, Math.min(180, Math.round(w * 0.55)));
    gh = Math.max(80, Math.min(220, Math.round(gw * (h / Math.max(1, w)))));
    buf = new ImageData(gw, gh);
    bg = bakeBg(gw, gh);
    off.width = gw;
    off.height = gh;
  };

  const paint = (elapsed) => {
    if (!buf) fit();
    const { data } = buf;
    const cx = (gw - 1) * 0.5;
    const cy = (gh - 1) * 0.58;
    const tau = elapsed - IMPACT_T;
    const live = tau > 0 && tau < 2.6;
    for (let y = 0; y < gh; y++) {
      for (let x = 0; x < gw; x++) {
        const dx = x - cx;
        const dy = y - cy;
        const r = Math.sqrt(dx * dx + dy * dy);
        let hgt = 0;
        if (live && r < 220) {
          const rr = r < 0.8 ? 0.8 : r;
          hgt = WAVE.A * lutSin(WAVE.k * rr - WAVE.omega * tau) * lutExp(WAVE.alpha * tau) * lutExp(WAVE.beta * rr);
        }
        const inv = r < 0.8 ? 0 : hgt * 0.45 / r;
        const sx = x + dx * inv;
        const sy = y + dy * inv;
        const src = sampleBg(bg, gw, gh, sx, sy);
        const i = (y * gw + x) * 4;
        const shine = hgt > 0 ? hgt * 2.2 : 0;
        data[i] = Math.min(255, bg[src] + shine * 0.55 + (ar / 255) * shine * 0.25);
        data[i + 1] = Math.min(255, bg[src + 1] + shine * 0.7 + (ag / 255) * shine * 0.2);
        data[i + 2] = Math.min(255, bg[src + 2] + shine * 0.85 + (ab / 255) * shine * 0.15);
        data[i + 3] = 255;
      }
    }
    const ctx = canvas.getContext("2d", { alpha: false });
    offCtx.putImageData(buf, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, gw, gh, 0, 0, canvas.width, canvas.height);

    const fall = dropFall(DROP_PATH, elapsed);
    const melt = elapsed <= IMPACT_T ? 0 : Math.min(1, (elapsed - IMPACT_T) / 0.14);
    if (melt < 0.98 && !unit.climax && !unit.adIn) {
      const dx = canvas.width * 0.5;
      const top = canvas.height * 0.08;
      const surface = canvas.height * 0.58;
      const dy = top + (surface - top) * fall;
      const radius = Math.max(4, canvas.width * 0.028) * (1 + melt * 0.45);
      ctx.beginPath();
      ctx.ellipse(dx, dy, radius * (1 + melt * 0.7), radius * (1 - melt * 0.82), 0, 0, TWO_PI);
      ctx.fillStyle = `rgba(${ar},${ag},${ab},${(0.85 * (1 - melt)).toFixed(3)})`;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(dx - radius * 0.25, dy - radius * 0.28, radius * 0.28, radius * 0.18, 0, 0, TWO_PI);
      ctx.fillStyle = `rgba(255,255,255,${(0.45 * (1 - melt)).toFixed(3)})`;
      ctx.fill();
    }
  };

  const reveal = () => {
    if (unit.climax) return;
    unit.climax = true;
    container.classList.add("is-climax");
  };

  const loop = (now) => {
    if (!unit.visible || document.hidden) {
      raf = 0;
      return;
    }
    if (!unit.journeyAt) unit.journeyAt = now;
    const elapsed = (now - unit.journeyAt) / 1000;
    paint(elapsed);
    if (elapsed * 1000 >= timingMs) reveal();
    raf = requestAnimationFrame(loop);
  };

  const skip = () => reveal();
  container.addEventListener("click", skip);
  container.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") skip();
  });
  container.tabIndex = 0;

  unit.start2d = () => {
    if (raf) return;
    unit.journeyAt = 0;
    unit.climax = false;
    container.classList.remove("is-climax", "is-pre-exit", "is-ad-in");
    fit();
    raf = requestAnimationFrame(loop);
  };
  unit.stop2d = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    unit.journeyAt = 0;
    unit.climax = false;
    container.classList.remove("is-climax", "is-pre-exit", "is-ad-in");
  };
}