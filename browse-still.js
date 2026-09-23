import { formatById, playById, propTrailById, propTrailMs } from "./ad-catalog.js";
import { applyAnimCost, startAd } from "./ad-player.js";
import { mountPlay, unmountPlay } from "./play-route.js";

export function normalizeBrowseBlit(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0.8;
  return Math.round(Math.min(1.5, Math.max(0.1, n)) * 20) / 20;
}

export function applyBrowseBlit(value) {
  const blit = normalizeBrowseBlit(value);
  applyAnimCost({ blitDpr: blit });
  return blit;
}

function stillBakeHost() {
  let host = document.getElementById("browse-still-host");
  if (host) return host;
  host = document.createElement("div");
  host.id = "browse-still-host";
  host.setAttribute("aria-hidden", "true");
  host.style.cssText = "position:fixed;left:0;top:0;width:520px;height:520px;opacity:0.02;z-index:-1;overflow:hidden;pointer-events:none;";
  document.body.appendChild(host);
  return host;
}

function waitFrames(count) {
  return new Promise((resolve) => {
    let left = count;
    const step = () => {
      left -= 1;
      if (left <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function frameSpread(canvas) {
  const ctx = canvas.getContext("2d");
  if (!ctx || canvas.width < 2 || canvas.height < 2) return 0;
  let data;
  try {
    data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  } catch {
    return 0;
  }
  let min = 255;
  let max = 0;
  const step = Math.max(16, Math.floor(data.length / 4000) & ~3);
  for (let i = 0; i < data.length; i += step) {
    const y = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return max - min;
}

export async function captureComboStill(item) {
  if (!item) return "";
  const format = formatById(item.ad);
  const host = stillBakeHost();
  const id = "browse-still";
  host.style.width = `${format.w}px`;
  host.style.height = `${format.h}px`;
  try {
    const mounted = await mountPlay(host, { item, slotId: id, origin: location.origin });
    if (!mounted) throw new Error("No hay clímax para exportar.");
    const box = host.querySelector(".ad-container");
    if (box) await startAd(box);
    const canvas = host.querySelector("canvas");
    if (!canvas) throw new Error("sin cuadro");
    const trailId = propTrailById(item.ptrail).id;
    const trailMs = playById(item.play).id === "prop" && trailId !== "none"
      ? propTrailMs(trailId, item.pvel)
      : 0;
    const hold = trailMs ? Math.max(8, Math.round((trailMs * 0.45) / 32)) : 6;
    let best = null;
    for (let i = 0; i < 90; i += 1) {
      await waitFrames(2);
      const spread = frameSpread(canvas);
      if (!best || spread > best.spread) {
        try {
          best = { spread, url: canvas.toDataURL("image/jpeg", 0.82) };
        } catch {
          /* el cuadro todavía no se puede leer */
        }
      }
      if (best?.spread >= 18 && i > hold) break;
    }
    if (!best?.url || best.spread < 4) {
      if (playById(item.play).id === "prop" && item.pmesh) {
        throw new Error("El modelo 3D sigue cargando.");
      }
      throw new Error("sin cuadro");
    }
    return best.url;
  } finally {
    unmountPlay(id);
    host.innerHTML = "";
  }
}
