import { propPose } from "./prop-climax.js";

export function freezeClimaxViewer(mv) {
  if (!mv) return;
  const d = Number(mv.duration);
  try {
    if (Number.isFinite(d) && d > 0.05) mv.currentTime = Math.max(0, d - 0.001);
  } catch { /* 1.6 */ }
  try { mv.pause(); } catch { /* 1.6 */ }
  try { mv.removeAttribute("autoplay"); } catch { /* */ }
  if ("animationLoop" in mv) mv.animationLoop = false;
}

export function playSlotIntro(slot) {
  if (!slot) return;
  const id = String(slot.dataset.in || "none");
  if (id === "none") {
    slot.classList.add("is-in");
    return;
  }
  slot.classList.remove("is-in");
  requestAnimationFrame(() => slot.classList.add("is-in"));
}

function splitOrbit(str) {
  const p = String(str || "").trim().split(/\s+/);
  return { th: p[0] || "0deg", ph: p[1] || "75deg", rad: p[2] || "3.2m" };
}

function numUnit(s) {
  const m = String(s).match(/^(-?[\d.]+)(.*)$/);
  return { n: Number(m?.[1]) || 0, u: m?.[2] || "" };
}

export function liveCameraFromClip(box, mv) {
  if (!box || !mv || box.dataset.propCamMode === "pan") return;
  const d = Number(mv.duration) || 0;
  const t = d > 0.05 ? Math.min(1, Math.max(0, (Number(mv.currentTime) || 0) / d)) : 0;
  const pose = propPose(box.dataset.propAct, t, 0.36);
  const base = splitOrbit(box.dataset.gwdOrbit || mv.getAttribute("camera-orbit"));
  const th = numUnit(base.th);
  const rad = numUnit(base.rad);
  const next = `${th.n + pose.camA * (180 / Math.PI)}${th.u || "deg"} ${base.ph} ${rad.n * (pose.camR || 1) * (1 - (pose.punch || 0))}${rad.u || "m"}`;
  if (mv.cameraOrbit !== next) {
    mv.cameraOrbit = next;
    mv.setAttribute("camera-orbit", next);
    mv.jumpCameraToGoal?.();
  }
}

export function clipEnded(mv, lastT) {
  const t = Number(mv?.currentTime) || 0;
  const d = Number(mv?.duration) || 0;
  if (d > 0.2 && t >= d - 0.03) return true;
  if (d > 0.2 && lastT > d * 0.55 && t + 0.12 < lastT) return true;
  return false;
}
