/** Clímax de escena (gota / cielo / tierra / hielo): GWD no corre Babylon. Canal: capas CSS + handoff. No tocar Babylon. */

import { resolvePalette } from "../../ad-catalog.js?v=cam23";

export const id = "scene";

const BODY_MS = {
  climax: 2400,
  "pre-enter": 2480,
  horizon: 4700,
  sundown: 4700,
  storm: 2150,
  aurora: 4160,
  erupt: 4400,
  migrate: 6320,
  breaker: 4850,
  calve: 4840,
};

export function gwdSceneBodyMs(play) {
  const key = String(play || "");
  if (key === "prop") return 0;
  return BODY_MS[key] || BODY_MS.climax;
}

export function isGwdScenePlay(play) {
  const key = String(play || "");
  return key !== "prop" && key !== "";
}

const CANVAS_2D_PLAYS = ["horizon", "sundown", "storm", "aurora", "erupt", "migrate", "breaker", "calve"];

export function isCanvas2DPlay(play) {
  return CANVAS_2D_PLAYS.includes(String(play || ""));
}

export function gwdSceneMarkup(play) {
  if (isCanvas2DPlay(play)) {
    return `<canvas class="ad-gwd-canvas" aria-hidden="true"></canvas>`;
  }
  const birds = Array.from({ length: 5 }, (_, i) => `<i class="ad-gwd-bird" style="--i:${i}"></i>`).join("");
  const bands = Array.from({ length: 3 }, (_, i) => `<i class="ad-gwd-band" style="--i:${i}"></i>`).join("");
  return `<div class="ad-gwd-scene" aria-hidden="true"><i class="ad-gwd-sky"></i><i class="ad-gwd-ground"></i><i class="ad-gwd-sun"></i><i class="ad-gwd-drop"></i><i class="ad-gwd-ripple"></i><i class="ad-gwd-flash"></i><i class="ad-gwd-bolt"></i>${bands}<i class="ad-gwd-cone"></i><i class="ad-gwd-lava"></i>${birds}<i class="ad-gwd-wave"></i><i class="ad-gwd-foam"></i><i class="ad-gwd-ice"></i></div>`;
}

export function apply(spec, item) {
  const play = spec.play || item?.play || "prop";
  if (!isGwdScenePlay(play)) {
    return { ...spec, kind: spec.kind || "mesh", bodyMs: spec.bodyMs };
  }
  const pal = resolvePalette(play, item?.pal);
  return {
    ...spec,
    ok: true,
    kind: "scene",
    bodyMs: gwdSceneBodyMs(play),
    stage: pal.skyDeep || pal.skyNight || pal.sky || pal.skyTop || spec.stage,
    scene: pal,
  };
}
