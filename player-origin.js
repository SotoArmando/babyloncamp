let origin = "";
const listeners = [];

export function setPlayerOrigin(value) {
  const next = String(value || "").trim().replace(/\/+$/, "");
  if (next === origin) return;
  origin = next;
  for (const fn of listeners) fn(origin);
}

export function getPlayerOrigin() {
  return origin;
}

export function onPlayerOriginChange(fn) {
  listeners.push(fn);
  return () => {
    const at = listeners.indexOf(fn);
    if (at >= 0) listeners.splice(at, 1);
  };
}

/** URL en el origen de la galería. Sin setPlayerOrigin, usa fallback (mismo sitio). */
export function playerUrl(path, fallback) {
  const raw = String(path || "");
  if (origin) return `${origin}/${raw.replace(/^\/+/, "")}`;
  if (fallback != null && fallback !== "") return fallback;
  return raw.startsWith("/") ? raw : `/${raw}`;
}
