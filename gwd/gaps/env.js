/** Estudio Babylon → environment-image HDR (lightingandenv 1.6). Receta compacta; RGBE en runtime. No tocar Babylon. */

import { STUDIO_PRESETS, STUDIO_CHANNEL_MAX, STUDIO_CHANNEL_MIN } from "../../studio-lights.js";

export const id = "env";

const W = 256;
const H = 128;

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, lo, hi, fallback) {
  return Math.min(hi, Math.max(lo, num(value, fallback)));
}

function hex(value, fallback) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.slice(1).toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
  }
  return fallback;
}

function rgb(hexCol) {
  const h = hex(hexCol, "#ffffff").slice(1);
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
}

function presetOf(item) {
  const id = String(item?.studio?.preset || "catalog");
  return STUDIO_PRESETS[id] || STUDIO_PRESETS.catalog;
}

function light(dir, col, energy, radius) {
  return {
    d: dir.map((n) => Math.round(n * 1000) / 1000),
    c: rgb(col),
    e: Math.round(Math.max(0, energy) * 1000) / 1000,
    r: Math.round(radius * 1000) / 1000,
  };
}

export function studioEnvRecipe(item, spec = {}) {
  const st = item?.studio || {};
  const p = presetOf(item);
  const world = clamp(st.world ?? spec.world, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, p.world);
  const key = clamp(st.key ?? spec.key, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, p.key);
  const fill = clamp(st.fill ?? spec.fill, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, p.fill);
  const rim = clamp(st.rim ?? spec.rim, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, p.rim);
  return {
    w: rgb(hex(st.worldCol || spec.worldCol, p.worldCol)),
    wi: Math.round(world * 1000) / 1000,
    ei: Math.round(num(p.env, 0.85) * 1000) / 1000,
    l: [
      light(p.keyDir, hex(st.keyCol || spec.keyCol, p.keyCol), key * 2.4, 0.16),
      light(p.fillDir, hex(st.fillCol || spec.fillCol, p.fillCol), fill * 1.5, 0.34),
      light(p.rimDir, hex(st.rimCol || spec.rimCol, p.rimCol), rim * 2.2, 0.12),
    ],
  };
}

function toRgbe(r, g, b) {
  const peak = Math.max(r, g, b);
  if (!(peak > 1e-32)) return [0, 0, 0, 0];
  const e = Math.floor(Math.log2(peak)) + 1;
  const s = 256 / 2 ** e;
  return [
    Math.min(255, Math.floor(r * s)),
    Math.min(255, Math.floor(g * s)),
    Math.min(255, Math.floor(b * s)),
    e + 128,
  ];
}

function rle(values) {
  const out = [];
  let at = 0;
  while (at < values.length) {
    const val = values[at];
    let run = 1;
    while (at + run < values.length && run < 127 && values[at + run] === val) run += 1;
    if (run >= 4) {
      out.push(128 + run, val);
      at += run;
      continue;
    }
    const dumpAt = at;
    let dump = 1;
    at += 1;
    while (at < values.length && dump < 127) {
      let ahead = 1;
      const next = values[at];
      while (at + ahead < values.length && ahead < 4 && values[at + ahead] === next) ahead += 1;
      if (ahead >= 4) break;
      dump += 1;
      at += 1;
    }
    out.push(dump);
    for (let d = 0; d < dump; d += 1) out.push(values[dumpAt + d]);
  }
  return out;
}

function encodeHdr(buf) {
  const header = `#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y ${H} +X ${W}\n`;
  const body = [];
  for (let j = 0; j < H; j += 1) {
    body.push(2, 2, (W >> 8) & 255, W & 255);
    const ch = [[], [], [], []];
    for (let i = 0; i < W; i += 1) {
      const k = (j * W + i) * 4;
      const pix = toRgbe(buf[k], buf[k + 1], buf[k + 2]);
      ch[0].push(pix[0]);
      ch[1].push(pix[1]);
      ch[2].push(pix[2]);
      ch[3].push(pix[3]);
    }
    for (const channel of ch) body.push(...rle(channel));
  }
  const bytes = new Uint8Array(header.length + body.length);
  for (let i = 0; i < header.length; i += 1) bytes[i] = header.charCodeAt(i);
  bytes.set(body, header.length);
  return bytes;
}

export function paintStudioEnv(recipe) {
  if (!recipe || typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return "";
  const buf = new Float32Array(W * H * 4);
  const ambient = (0.1 + (recipe.wi || 0) * 0.4) * (recipe.ei || 0.85);
  const [wr, wg, wb] = recipe.w || [0.9, 0.88, 0.84];
  for (let j = 0; j < H; j += 1) {
    const v = (j + 0.5) / H;
    const y = Math.sin((0.5 - v) * Math.PI);
    const hem = y >= 0 ? 0.72 + y * 0.38 : 0.42 + y * 0.18;
    const ar = wr * ambient * hem;
    const ag = wg * ambient * hem;
    const ab = wb * ambient * hem;
    for (let i = 0; i < W; i += 1) {
      const k = (j * W + i) * 4;
      buf[k] = ar;
      buf[k + 1] = ag;
      buf[k + 2] = ab;
      buf[k + 3] = 1;
    }
  }
  for (const lamp of recipe.l || []) {
    const lx = -lamp.d[0];
    const ly = -lamp.d[1];
    const lz = -lamp.d[2];
    const len = Math.hypot(lx, ly, lz) || 1;
    const dx = lx / len;
    const dy = ly / len;
    const dz = lz / len;
    const rad = Math.max(0.02, lamp.r || 0.16);
    const power = Math.max(14, 1 / (rad * rad));
    const [cr, cg, cb] = lamp.c;
    for (let row = 0; row < H; row += 1) {
      const lat = (0.5 - (row + 0.5) / H) * Math.PI;
      const sy = Math.sin(lat);
      const xz = Math.cos(lat);
      for (let col = 0; col < W; col += 1) {
        const lon = ((col + 0.5) / W - 0.5) * Math.PI * 2;
        const ndot = xz * Math.sin(lon) * dx + sy * dy + xz * Math.cos(lon) * dz;
        if (ndot <= 0.002) continue;
        const fall = ndot ** power;
        if (fall < 1e-5) continue;
        const k = (row * W + col) * 4;
        const gain = lamp.e * fall;
        buf[k] += cr * gain;
        buf[k + 1] += cg * gain;
        buf[k + 2] += cb * gain;
      }
    }
  }
  try {
    return URL.createObjectURL(new Blob([encodeHdr(buf)], { type: "application/octet-stream" })) + "#.hdr";
  } catch {
    return "";
  }
}

export function apply(spec, item) {
  if (spec?.kind === "scene") {
    return { ...spec, env: "", envLit: false, lights: null };
  }
  const lights = studioEnvRecipe(item, spec);
  const exp = clamp(item?.studio?.exposure, 0.4, 2, 1);
  return {
    ...spec,
    env: "",
    envLit: true,
    lights,
    exposure: String(Math.round(exp * 1000) / 1000),
  };
}
