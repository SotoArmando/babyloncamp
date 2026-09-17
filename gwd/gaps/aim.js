/** Aim / luces de color: GWD no tiene spots 3D. Canal: conos CSS (spot/multi) + pose 2D. No tocar Babylon. */

import { extraPlaceAt } from "./extras.js";

export const id = "aim";

const MODES = { none: true, spot: true, multi: true };
const PLACES = { arriba: true, frente: true, detras: true };

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

function aimModeId(value) {
  const key = String(value || "").trim();
  return MODES[key] ? key : "none";
}

function aimPlaceId(place) {
  const key = String(place || "").trim();
  if (key === "atras") return "detras";
  return PLACES[key] ? key : "frente";
}

export function apply(spec, item) {
  const studioOn = item?.studio && typeof item.studio === "object";
  const mode = studioOn ? "none" : aimModeId(item?.plight);
  const gain = mode === "none" ? 0 : clamp(item?.plint, 0, 1, 0.35);
  const dist = clamp(item?.pldist, 1.2, 7, 3.3);
  const h = clamp(item?.plhrot, -180, 180, 0);
  const v = clamp(item?.plvrot, -70, 70, 0);
  const [bx, by] = extraPlaceAt(aimPlaceId(item?.plpos));
  return {
    ...spec,
    aimMode: mode,
    aimCol: hex(item?.plcol, "#fff0d1"),
    aimGain: Math.round(gain * 1000) / 1000,
    aimX: Math.min(94, Math.max(6, bx + h / 180 * 40)),
    aimY: Math.min(88, Math.max(4, by - v / 55 * 16)),
    aimSize: Math.round(Math.min(1.35, Math.max(0.45, 3.3 / dist)) * 1000) / 1000,
  };
}
