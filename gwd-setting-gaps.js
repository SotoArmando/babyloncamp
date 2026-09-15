/** Inventario: settings del play vs lo que GWD / model-viewer aplica de verdad. */

export const GWD_SETTING_ROWS = [
  { id: "ad", group: "play", label: "Formato", fields: ["ad"], status: "truth", start: 0, effort: "—", gwd: "meta ad.size + page size", note: "970×250 sale del clímax." },
  { id: "play-act", group: "play", label: "Play + acción", fields: ["play", "propAct"], status: "truth", start: 0, effort: "—", gwd: "clip climax horneado", note: "" },
  { id: "pmesh", group: "play", label: "Mesh", fields: ["pmesh"], status: "truth", start: 0, effort: "—", gwd: "src del visor", note: "GLB del play, no el default de GWD." },
  { id: "in", group: "play", label: "Entrada 2D", fields: ["in"], status: "truth", start: 0, effort: "—", gwd: "data-in + @keyframes en ad-play.css", note: "Misma máquina que lab/galería." },
  { id: "hand", group: "handoff", label: "Handoff", fields: ["hand", "hms", "hnb", "hst", "hhd", "hin", "hbt", "htm", "htxt", "hempty"], status: "truth", start: 0, effort: "—", gwd: "data-* + gwd-shell + CSS", note: "" },
  { id: "ph", group: "foto", label: "Placeholder / recorte", fields: ["ph"], status: "truth", start: 0, effort: "—", gwd: "--ph-fit* + img", note: "" },

  { id: "pcam", group: "camara", label: "Distancia", fields: ["pcam"], status: "truth", start: 0, effort: "—", gwd: "camera-orbit radius (+ factor wide/tall)", note: "Ya no es el auto-zoom de GWD." },
  { id: "porbit", group: "camara", label: "Órbita H/V", fields: ["pch", "pcv"], status: "truth", start: 0, effort: "—", gwd: "orbit yaw / 75−v", note: "Fórmula, no el yaw/pitch del panel GWD." },
  { id: "ppan", group: "camara", label: "Mover en plano", fields: ["pcm", "ppx", "ppy"], status: "truth", start: 0, effort: "—", gwd: "camera-target", note: "" },
  { id: "fov", group: "camara", label: "FOV por formato", fields: ["ad"], status: "truth", start: 0, effort: "—", gwd: "field-of-view fijo (0.4/0.48/0.52 rad)", note: "Antes: auto distinto en MV 1.6 vs 3.5." },

  { id: "scale", group: "objeto", label: "Escala del objeto", fields: ["psx", "psy", "psz"], status: "partial", start: 2, effort: "S", gwd: "atributo scale del mesh; canvas a 100%", note: "GWD 1.6 puede ignorar scale; el visor igual llena el anuncio." },
  { id: "spin", group: "objeto", label: "Giro del objeto", fields: ["prh", "prv"], status: "truth", start: 0, effort: "—", gwd: "orientation en model-viewer", note: "gwd-shell lo reaplica en el MV interno." },
  { id: "cog", group: "objeto", label: "Alinear a la caja", fields: ["pcog"], status: "truth", start: 0, effort: "—", gwd: "camera-target auto vs 0m 0m 0m", note: "No mueve el pivot del mesh; sí el look-at." },
  { id: "floor", group: "objeto", label: "Suelo", fields: ["pfloor"], status: "partial", start: 2, effort: "L", gwd: "óvalo CSS", note: "No hay ground mesh en MV." },
  { id: "flat", group: "objeto", label: "Fondo 2D", fields: ["pflat"], status: "truth", start: 0, effort: "—", gwd: "sin IBL + CSS", note: "" },

  { id: "pal-fog", group: "estudio", label: "Color de escena (fog)", fields: ["pal.fog"], status: "truth", start: 0, effort: "—", gwd: "--gwd-stage siempre", note: "Fondo del visor aunque Fondo 2D esté off." },
  { id: "pal-rest", group: "estudio", label: "Resto de paleta del play", fields: ["pal"], status: "partial", start: 3, effort: "L", gwd: "pal.floor en el óvalo; fog en el stage", note: "No recolorea el GLB (object/ball/sky)." },
  { id: "st-world", group: "estudio", label: "Luz ambiente (intensidad)", fields: ["studio.world"], status: "partial", start: 2, effort: "M", gwd: "mezcla en exposure", note: "No hay hemispheric; world empuja el IBL." },
  { id: "st-world-col", group: "estudio", label: "Color ambiente", fields: ["studio.worldCol"], status: "partial", start: 2, effort: "S", gwd: "fallback si no hay pal.fog", note: "No tiñe el IBL." },
  { id: "st-key", group: "estudio", label: "Key", fields: ["studio.key"], status: "partial", start: 2, effort: "M", gwd: "shadow-intensity (proxy)", note: "No es una luz key; es sombra." },
  { id: "st-key-col", group: "estudio", label: "Color key", fields: ["studio.keyCol"], status: "partial", start: 2, effort: "L", gwd: "glow CSS desde arriba", note: "No es una luz 3D." },
  { id: "st-fill", group: "estudio", label: "Fill + color", fields: ["studio.fill", "studio.fillCol"], status: "partial", start: 2, effort: "L", gwd: "glow CSS + shadow-softness", note: "No es una luz 3D." },
  { id: "st-rim", group: "estudio", label: "Rim + color", fields: ["studio.rim", "studio.rimCol"], status: "partial", start: 2, effort: "L", gwd: "glow CSS", note: "No es una luz 3D." },
  { id: "st-exp", group: "estudio", label: "Exposición", fields: ["studio.exposure"], status: "truth", start: 0, effort: "—", gwd: "exposure", note: "Clamp 0.4–2." },
  { id: "st-preset", group: "estudio", label: "Preset de estudio", fields: ["studio.preset"], status: "truth", start: 0, effort: "—", gwd: "canales ya resueltos en el JSON", note: "El preset no se reaplica; world/key/fill/rim sí." },
  { id: "st-extras", group: "estudio", label: "Luces extra", fields: ["studio.extras"], status: "partial", start: 3, effort: "L", gwd: "glows CSS por place", note: "Hasta 4; no son luces 3D." },
  { id: "aim", group: "estudio", label: "Luces de color / aim", fields: ["plight", "plint", "plcol", "pldist", "plpos", "plhrot", "plvrot"], status: "partial", start: 3, effort: "L", gwd: "conos CSS", note: "spot/multi/none + pose 2D." },

  { id: "env-ibl", group: "gwd-default", label: "Environment / IBL", fields: ["environment-image"], status: "truth", start: 0, effort: "—", gwd: "env-neutral.hdr local", note: "Nunca el token neutral en GWD 1.6." },
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
