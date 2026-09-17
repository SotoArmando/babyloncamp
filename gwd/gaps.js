/** Inventario: settings del play vs lo que GWD / model-viewer aplica de verdad. */
import { apply as applyFloor } from "./gaps/floor.js";
import { apply as applyScale } from "./gaps/scale.js";
import { apply as applyStudio } from "./gaps/studio.js";
import { apply as applyExtras } from "./gaps/extras.js";
import { apply as applyEnv } from "./gaps/env.js";
import { apply as applyAim } from "./gaps/aim.js";
import { apply as applyPal } from "./gaps/pal.js";
import { apply as applyScene } from "./gaps/scene.js";

const APPLIERS = [applyFloor, applyScale, applyStudio, applyExtras, applyEnv, applyAim, applyPal, applyScene];

export function applyGwdGaps(spec, item) {
  let next = spec;
  for (const apply of APPLIERS) next = apply(next, item) || next;
  return next;
}


export const GWD_SETTING_ROWS = [
  { id: "ad", group: "play", label: "Formato", fields: ["ad"], status: "truth", start: 0, effort: "—", gwd: "meta ad.size + page size", note: "970×250 sale del clímax." },
  { id: "play-act", group: "play", label: "Play + acción", fields: ["play", "propAct"], status: "truth", start: 0, effort: "—", gwd: "clip climax horneado o escena 2D", note: "prop = GLB. cielo/tierra/hielo = mismos painters canvas que la galería. gota = capas CSS + handoff." },
  { id: "scene", group: "play", label: "Clímax 2D / caja", fields: ["play"], status: "truth", start: 0, effort: "—", gwd: "play-2d.js canvas (amanecer…deshielo) + CSS gota", note: "Los 8 plays canvas usan los mismos attachHorizon2D / paintStorm / etc. Gota sigue 3D nativo; en GWD es cartel CSS." },
  { id: "pmesh", group: "play", label: "Mesh", fields: ["pmesh"], status: "truth", start: 0, effort: "—", gwd: "src del visor", note: "GLB del play, no el default de GWD." },
  { id: "in", group: "play", label: "Entrada 2D", fields: ["in"], status: "truth", start: 0, effort: "—", gwd: "data-in + @keyframes en ad-play.css", note: "Misma máquina que lab/galería." },
  { id: "hand", group: "handoff", label: "Handoff", fields: ["hand", "hms", "hnb", "hst", "hhd", "hin", "hbt", "htm", "htxt", "hempty"], status: "truth", start: 0, effort: "—", gwd: "data-* + gwd-shell + CSS", note: "" },
  { id: "ph", group: "foto", label: "Placeholder / recorte", fields: ["ph"], status: "truth", start: 0, effort: "—", gwd: "--ph-fit* + img", note: "" },

  { id: "pcam", group: "camara", label: "Distancia", fields: ["pcam"], status: "truth", start: 0, effort: "—", gwd: "camera-orbit radius (+ factor wide/tall)", note: "Ya no es el auto-zoom de GWD." },
  { id: "porbit", group: "camara", label: "Órbita H/V", fields: ["pch", "pcv"], status: "truth", start: 0, effort: "—", gwd: "orbit yaw / 75+v", note: "Mismo signo que Babylon beta0+pcv. Negativo mira desde arriba." },
  { id: "ppan", group: "camara", label: "Mover en plano", fields: ["pcm", "ppx", "ppy"], status: "truth", start: 0, effort: "—", gwd: "camera-target", note: "" },
  { id: "fov", group: "camara", label: "FOV por formato", fields: ["ad"], status: "truth", start: 0, effort: "—", gwd: "field-of-view fijo (0.4/0.48/0.52 rad)", note: "Antes: auto distinto en MV 1.6 vs 3.5." },

  { id: "scale", group: "objeto", label: "Escala del objeto", fields: ["psx", "psy", "psz"], status: "truth", start: 0, effort: "—", gwd: "atributo scale + pin en gwd/shell", note: "El canvas llena el anuncio; el mesh no. 1.6 a veces no tiene .scale string: se setea igual." },
  { id: "spin", group: "objeto", label: "Giro del objeto", fields: ["prh", "prv"], status: "truth", start: 0, effort: "—", gwd: "orientation en model-viewer", note: "gwd-shell lo reaplica en el MV interno." },
  { id: "cog", group: "objeto", label: "Alinear a la caja", fields: ["pcog"], status: "truth", start: 0, effort: "—", gwd: "camera-target auto vs 0m 0m 0m", note: "No mueve el pivot del mesh; sí el look-at." },
  { id: "floor", group: "objeto", label: "Suelo", fields: ["pfloor"], status: "partial", start: 2, effort: "L", gwd: "óvalo CSS + shadow-intensity 0 si off", note: "No hay ground mesh en MV. El óvalo es 2D; la sombra de contacto se apaga con el suelo." },
  { id: "flat", group: "objeto", label: "Fondo 2D", fields: ["pflat"], status: "truth", start: 0, effort: "—", gwd: "sin skybox; el IBL sigue (como Babylon)", note: "environment-image ilumina el mesh; pal.fog es el fondo CSS." },

  { id: "pal-fog", group: "estudio", label: "Color de escena (fog)", fields: ["pal.fog"], status: "truth", start: 0, effort: "—", gwd: "--gwd-stage siempre", note: "Fondo del visor aunque Fondo 2D esté off." },
  { id: "pal-rest", group: "estudio", label: "Resto de paleta del play", fields: ["pal"], status: "partial", start: 3, effort: "L", gwd: "fog stage; floor óvalo; stand/object/ball/beam/star CSS + pin en gwd/shell", note: "No recolorea el GLB. stand solo suelo+giro; ball/beam/star según acción." },
  { id: "st-world", group: "estudio", label: "Luz ambiente (intensidad)", fields: ["studio.world"], status: "partial", start: 2, effort: "M", gwd: "hemi del environment-image (HDR)", note: "MV no tiene hemispheric. World pinta el equirect. Sin glow CSS." },
  { id: "st-world-col", group: "estudio", label: "Color ambiente", fields: ["studio.worldCol"], status: "partial", start: 2, effort: "S", gwd: "tinte hemi del IBL + stage si no hay pal.fog", note: "RGBE HDR; no es un hemispheric 3D." },
  { id: "st-key", group: "estudio", label: "Key", fields: ["studio.key"], status: "partial", start: 2, effort: "M", gwd: "blob IBL + shadow-intensity", note: "Misma dirección del preset. No es un directional 3D." },
  { id: "st-key-col", group: "estudio", label: "Color key", fields: ["studio.keyCol"], status: "partial", start: 2, effort: "S", gwd: "color del blob IBL", note: "" },
  { id: "st-fill", group: "estudio", label: "Fill + color", fields: ["studio.fill", "studio.fillCol"], status: "partial", start: 2, effort: "S", gwd: "blob IBL + shadow-softness", note: "" },
  { id: "st-rim", group: "estudio", label: "Rim + color", fields: ["studio.rim", "studio.rimCol"], status: "partial", start: 2, effort: "S", gwd: "blob IBL detrás", note: "" },
  { id: "st-exp", group: "estudio", label: "Exposición", fields: ["studio.exposure"], status: "truth", start: 0, effort: "—", gwd: "exposure", note: "Clamp 0.2–3. El slider nativo ya no corta en 1.4." },
  { id: "st-preset", group: "estudio", label: "Preset de estudio", fields: ["studio.preset"], status: "truth", start: 0, effort: "—", gwd: "canales ya resueltos en el JSON", note: "El preset no se reaplica; world/key/fill/rim sí." },
  { id: "st-extras", group: "estudio", label: "Luces extra", fields: ["studio.extras"], status: "partial", start: 3, effort: "M", gwd: "no entra al IBL ni al glow CSS", note: "Hasta 4 en nativo. En GWD no se pintan: el blob extra se leía como mancha. Key/fill/rim sí van al HDR." },
  { id: "aim", group: "estudio", label: "Luces de color / aim", fields: ["plight", "plint", "plcol", "pldist", "plpos", "plhrot", "plvrot"], status: "partial", start: 3, effort: "L", gwd: "conos CSS; off si hay studio (como nativo)", note: "spot/multi/none + pose 2D. Con luces de estudio no pinta, igual que Babylon." },

  { id: "env-ibl", group: "gwd-default", label: "Environment / IBL", fields: ["environment-image"], status: "truth", start: 0, effort: "—", gwd: "RGBE HDR de world/key/fill/rim", note: "lightingandenv 1.6: blob#.hdr + exposure + sombra. Receta en data-gwd-lights. Sin skybox (pal.fog). Nunca el token neutral. Sin extras." },
  { id: "shadow-soft", group: "gwd-default", label: "Shadow softness", fields: ["studio.fill"], status: "truth", start: 0, effort: "—", gwd: "shadow-softness = fill", note: "Proxy; el play no tiene slider de soft." },
  { id: "gwd-zoom", group: "gwd-default", label: "Zoom/yaw del componente GWD", fields: [], status: "truth", start: 0, effort: "—", gwd: "gwd-shell pinPlayCamera", note: "Reescribe orbit/FOV tras initAd." },
  { id: "mv-interp", group: "gwd-default", label: "Interpolación de cámara", fields: [], status: "truth", start: 0, effort: "—", gwd: "decay 0 + jump + pin", note: "" },
];

export function gwdSettingGapStats(rows = GWD_SETTING_ROWS) {
  const by = { truth: 0, partial: 0, gap: 0 };
  let fieldGaps = 0;
  for (const row of rows) {
    by[row.status] += 1;
    if (row.status !== "truth") fieldGaps += row.fields.length || 1;
  }
  return {
    rows: rows.length,
    truth: by.truth,
    partial: by.partial,
    gap: by.gap,
    open: by.partial + by.gap,
    fieldGaps,
    start: rows.filter((row) => row.status !== "truth").sort((a, b) => a.start - b.start || a.id.localeCompare(b.id)),
  };
}

export function gwdSettingGapReport() {
  const stats = gwdSettingGapStats();
  const lines = [
    `GWD settings · ${stats.truth} ok · ${stats.partial} parciales · ${stats.gap} huecos · ${stats.open} abiertos (${stats.fieldGaps} campos)`,
    "",
    "Empezar por:",
    ...stats.start.map((row) => `  ${row.start}. [${row.status}] ${row.label} · ${row.effort} · default GWD: ${row.gwd}`),
  ];
  return lines.join("\n");
}
