/** Suelo: GWD no tiene ground mesh. Canal: óvalo CSS + shadow-intensity 0 si pfloor=0. No tocar Babylon. */

export const id = "floor";

function on(spec, item) {
  if (spec?.floor === false || spec?.floor === "0") return false;
  const raw = item?.pfloor;
  if (raw === false || raw === 0 || raw === "0" || raw === "off" || raw === "hide") return false;
  return true;
}

export function apply(spec, item) {
  const floor = on(spec, item);
  const pan = Boolean(spec?.pan);
  const px = Number(item?.ppx) || 0;
  const py = Number(item?.ppy) || 0;
  const sx = Number(spec?.scaleX ?? spec?.scale ?? 0.72);
  const x = pan ? Math.min(82, Math.max(18, 50 - px * 16)) : 50;
  const y = pan ? Math.min(18, Math.max(2, 4 + py * 6)) : 4;
  const w = Math.min(88, Math.max(48, 64 + sx * 22));
  return {
    ...spec,
    floor,
    floorCol: String(spec?.floorCol || item?.pal?.floor || "#3a2a1c"),
    floorX: `${x}%`,
    floorY: `${y}%`,
    floorW: `${w}%`,
    shadow: floor ? spec.shadow : "0",
  };
}
