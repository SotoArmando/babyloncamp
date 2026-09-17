/** Luces extra: GWD no tiene spots 3D. Canal: blobs en el IBL por place (hasta 4). No tocar Babylon. */

export const id = "extras";

const PLACES = {
  frente: [50, 22],
  lado: [0, 46],
  arriba: [50, 0],
  atras: [50, 100],
  contra: [100, 38],
};

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function hex(value, fallback) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.slice(1).toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
  }
  return fallback;
}

export function extraPlaceId(place) {
  const key = String(place || "").trim();
  if (key === "detras") return "atras";
  return PLACES[key] ? key : "frente";
}

export function extraPlaceAt(place) {
  return PLACES[extraPlaceId(place)];
}

export function apply(spec, item) {
  const list = Array.isArray(item?.studio?.extras) ? item.studio.extras : [];
  const extras = list.slice(0, 4).map((ex, index) => {
    const [x, y] = extraPlaceAt(ex?.place);
    const intensity = Math.min(16, Math.max(0, num(ex?.intensity, 4)));
    return {
      id: String(ex?.id || `x${index}`),
      col: hex(ex?.color, "#ffb347"),
      i: Math.round((intensity / 16) * 1000) / 1000,
      x,
      y,
      place: extraPlaceId(ex?.place),
    };
  });
  return { ...spec, extras };
}
