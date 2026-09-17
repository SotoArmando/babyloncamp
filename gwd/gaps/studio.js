/** Luces de estudio: GWD no tiene key/fill/rim 3D. Canal: recipe IBL + exposure + shadow. No tocar Babylon. */

import { STUDIO_CHANNEL_MAX, STUDIO_CHANNEL_MIN, STUDIO_EXPOSURE_MAX, STUDIO_EXPOSURE_MIN } from "../../studio-lights.js";

export const id = "studio";

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, lo, hi, fallback) {
  return Math.min(hi, Math.max(lo, num(value, fallback)));
}

function hex(value, fallback) {
  const raw = String(value || "").trim();
  return /^#[0-9a-fA-F]{6}$/.test(raw) ? raw : fallback;
}

export function apply(spec, item) {
  const st = item?.studio || {};
  const world = clamp(st.world ?? spec.world, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, 0.7);
  const key = clamp(st.key ?? spec.key, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, 0.55);
  const fill = clamp(st.fill ?? spec.fill, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, 0.42);
  const rim = clamp(st.rim ?? spec.rim, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, 0.2);
  const exp = clamp(st.exposure, STUDIO_EXPOSURE_MIN, STUDIO_EXPOSURE_MAX, 1);
  const worldCol = hex(st.worldCol || spec.worldCol, "#ede8e0");
  const fog = String(item?.pal?.fog || "").trim();
  const wash = Math.min(1, world / STUDIO_CHANNEL_MAX);
  return {
    ...spec,
    world,
    worldCol,
    worldI: world,
    key,
    fill,
    rim,
    keyCol: hex(st.keyCol || spec.keyCol, "#fff7eb"),
    fillCol: hex(st.fillCol || spec.fillCol, "#ebf2ff"),
    rimCol: hex(st.rimCol || spec.rimCol, "#d9e6ff"),
    exposure: String(Math.round(Math.min(STUDIO_EXPOSURE_MAX, Math.max(STUDIO_EXPOSURE_MIN, exp * (0.62 + wash * 0.38))) * 1000) / 1000),
    shadow: spec.floor ? String(Math.round(Math.min(1, key) * 100) / 100) : "0",
    soft: String(Math.round(Math.min(1, fill) * 100) / 100),
    stage: fog || worldCol || spec.stage || "#f5f2ed",
  };
}
