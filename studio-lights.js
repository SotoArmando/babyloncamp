export const STUDIO_PRESETS = {
  catalog: {
    world: 0.7, key: 0.55, fill: 0.42, rim: 0.2, env: 0.85, exposure: 1.02,
    bg: [0.93, 0.91, 0.88],
    worldCol: "#ede8e0",
    keyCol: "#fff7eb",
    fillCol: "#ebf2ff",
    rimCol: "#d9e6ff",
    keyDir: [-0.35, -0.72, -0.55],
    fillDir: [0.62, -0.28, -0.35],
    rimDir: [0.25, -0.12, 0.9],
  },
  highkey: {
    world: 1.05, key: 0.62, fill: 0.88, rim: 0.12, env: 1.05, exposure: 1.16,
    bg: [0.96, 0.95, 0.93],
    worldCol: "#f5f2ed",
    keyCol: "#fffaf2",
    fillCol: "#f3f7ff",
    rimCol: "#e8eeff",
    keyDir: [-0.22, -0.78, -0.5],
    fillDir: [0.7, -0.2, -0.3],
    rimDir: [0.1, -0.2, 0.9],
  },
  lowkey: {
    world: 0.16, key: 0.95, fill: 0.08, rim: 0.42, env: 0.35, exposure: 0.9,
    bg: [0.08, 0.08, 0.09],
    worldCol: "#141416",
    keyCol: "#ffd7a8",
    fillCol: "#6a7a9a",
    rimCol: "#9bb4ff",
    keyDir: [-0.55, -0.45, -0.55],
    fillDir: [0.8, -0.15, 0.1],
    rimDir: [0.15, -0.05, 0.95],
  },
  rembrandt: {
    world: 0.38, key: 0.92, fill: 0.18, rim: 0.28, env: 0.55, exposure: 0.98,
    bg: [0.22, 0.21, 0.2],
    worldCol: "#383430",
    keyCol: "#ffc48a",
    fillCol: "#7a6a58",
    rimCol: "#c4b89a",
    keyDir: [-0.72, -0.42, -0.38],
    fillDir: [0.55, -0.2, -0.15],
    rimDir: [0.35, -0.1, 0.85],
  },
  butterfly: {
    world: 0.55, key: 0.88, fill: 0.32, rim: 0.16, env: 0.7, exposure: 1.06,
    bg: [0.9, 0.88, 0.85],
    worldCol: "#e6e0d8",
    keyCol: "#ffe7c8",
    fillCol: "#f0e6dc",
    rimCol: "#d8e4f0",
    keyDir: [0.05, -0.92, -0.35],
    fillDir: [0.1, 0.35, -0.7],
    rimDir: [0.2, -0.15, 0.9],
  },
  split: {
    world: 0.28, key: 1.05, fill: 0.06, rim: 0.22, env: 0.45, exposure: 0.96,
    bg: [0.14, 0.14, 0.15],
    worldCol: "#242426",
    keyCol: "#ffe0b0",
    fillCol: "#4a5570",
    rimCol: "#a8c0ff",
    keyDir: [-0.95, -0.18, -0.12],
    fillDir: [0.9, -0.1, 0.05],
    rimDir: [0.1, -0.2, 0.9],
  },
  rimshot: {
    world: 0.22, key: 0.22, fill: 0.12, rim: 1.05, env: 0.4, exposure: 0.94,
    bg: [0.1, 0.1, 0.11],
    worldCol: "#1a1a1c",
    keyCol: "#c8b8a0",
    fillCol: "#6a7080",
    rimCol: "#dce8ff",
    keyDir: [-0.2, -0.55, -0.75],
    fillDir: [0.4, -0.2, -0.4],
    rimDir: [0.15, -0.05, 0.98],
  },
  estudio: {
    world: 0.14, key: 1.08, fill: 0.26, rim: 0.88, env: 0.22, exposure: 0.94,
    bg: [0.07, 0.07, 0.08],
    worldCol: "#121318",
    keyCol: "#ffd4a4",
    fillCol: "#7a8aa8",
    rimCol: "#e4eeff",
    keyDir: [-0.5, -0.58, -0.5],
    fillDir: [0.74, -0.2, -0.26],
    rimDir: [0.2, -0.06, 0.94],
  },
};

export const STUDIO_PRESET_LIST = [
  { id: "catalog", label: "Catálogo" },
  { id: "highkey", label: "High key" },
  { id: "lowkey", label: "Low key" },
  { id: "rembrandt", label: "Rembrandt" },
  { id: "butterfly", label: "Mariposa" },
  { id: "split", label: "Split" },
  { id: "rimshot", label: "Contra" },
  { id: "estudio", label: "Estudio" },
];

export const MAX_STUDIO_EXTRAS = 4;
export const MAX_STUDIO_EXTRA_INTENSITY = 16;
export const DEFAULT_STUDIO_EXTRA_INTENSITY = 4;
export const STUDIO_CHANNEL_MIN = 0;
export const STUDIO_CHANNEL_MAX = 3;
export const STUDIO_EXPOSURE_MIN = 0.2;
export const STUDIO_EXPOSURE_MAX = 3;

export const STUDIO_CHANNEL_COLORS = {
  world: STUDIO_PRESETS.catalog.worldCol,
  key: STUDIO_PRESETS.catalog.keyCol,
  fill: STUDIO_PRESETS.catalog.fillCol,
  rim: STUDIO_PRESETS.catalog.rimCol,
};

export const STUDIO_EXTRA_PLACES = {
  frente: { label: "Frente", dir: [-0.22, -0.55, -0.78], pos: [2.1, 3.4, 3.8] },
  lado: { label: "Lado", dir: [-0.88, -0.22, -0.12], pos: [4.2, 2.4, 0.6] },
  arriba: { label: "Arriba", dir: [0.04, -0.96, -0.22], pos: [0.4, 5.2, 1.6] },
  atras: { label: "Atrás", dir: [0.18, -0.32, 0.9], pos: [-0.8, 2.6, -4.2] },
  contra: { label: "Contra", dir: [0.12, -0.08, 0.98], pos: [-1.1, 2.4, -4.6] },
};

export const STUDIO_EXTRA_PLACE_LIST = Object.entries(STUDIO_EXTRA_PLACES).map(([id, item]) => ({
  id,
  label: item.label,
}));

const EXTRA_TINTS = ["#ffb347", "#7ad7ff", "#ff6b9d", "#c9f07a"];

export function defaultStudioState() {
  const p = STUDIO_PRESETS.catalog;
  return {
    preset: "catalog",
    world: p.world,
    key: p.key,
    fill: p.fill,
    rim: p.rim,
    exposure: p.exposure,
    worldCol: STUDIO_CHANNEL_COLORS.world,
    keyCol: STUDIO_CHANNEL_COLORS.key,
    fillCol: STUDIO_CHANNEL_COLORS.fill,
    rimCol: STUDIO_CHANNEL_COLORS.rim,
    extras: [],
  };
}

function clamp(n, min, max, fallback) {
  const v = Number(n);
  if (!Number.isFinite(v)) return fallback;
  return Math.min(max, Math.max(min, v));
}

export function normStudioHex(value, fallback = "#fff7eb") {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.slice(1).toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    const a = raw[1];
    const b = raw[2];
    const c = raw[3];
    return `#${a}${a}${b}${b}${c}${c}`.toLowerCase();
  }
  return fallback;
}

function hexToRgb01(hex, fallback) {
  const h = normStudioHex(hex, fallback);
  return [
    parseInt(h.slice(1, 3), 16) / 255,
    parseInt(h.slice(3, 5), 16) / 255,
    parseInt(h.slice(5, 7), 16) / 255,
  ];
}

function extraPlaceId(id) {
  return STUDIO_EXTRA_PLACES[id] ? id : "frente";
}

export function createStudioExtra(index = 0, partial = {}) {
  return {
    id: String(partial.id || `x${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`),
    color: normStudioHex(partial.color, EXTRA_TINTS[index % EXTRA_TINTS.length]),
    intensity: clamp(partial.intensity, 0, MAX_STUDIO_EXTRA_INTENSITY, DEFAULT_STUDIO_EXTRA_INTENSITY),
    place: extraPlaceId(partial.place),
  };
}

function normalizeExtras(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_STUDIO_EXTRAS).map((item, index) => createStudioExtra(index, item || {}));
}

export function addStudioExtra(raw) {
  const state = normalizeStudioState(raw);
  if (state.extras.length >= MAX_STUDIO_EXTRAS) return state;
  state.extras.push(createStudioExtra(state.extras.length));
  return state;
}

export function updateStudioExtra(raw, id, patch) {
  const state = normalizeStudioState(raw);
  state.extras = state.extras.map((item) => (
    item.id === id ? createStudioExtra(0, { ...item, ...patch, id: item.id }) : item
  ));
  return state;
}

export function removeStudioExtra(raw, id) {
  const state = normalizeStudioState(raw);
  state.extras = state.extras.filter((item) => item.id !== id);
  return state;
}

export function studioStateFromPreset(id, keep) {
  const p = STUDIO_PRESETS[id] || STUDIO_PRESETS.catalog;
  return normalizeStudioState({
    ...(keep && typeof keep === "object" ? keep : {}),
    preset: STUDIO_PRESETS[id] ? id : "catalog",
    world: p.world,
    key: p.key,
    fill: p.fill,
    rim: p.rim,
    exposure: p.exposure,
    worldCol: p.worldCol,
    keyCol: p.keyCol,
    fillCol: p.fillCol,
    rimCol: p.rimCol,
  });
}

export function normalizeStudioState(raw) {
  const base = defaultStudioState();
  const src = raw && typeof raw === "object" ? raw : {};
  const preset = STUDIO_PRESETS[src.preset] ? src.preset : base.preset;
  const fromPreset = STUDIO_PRESETS[preset];
  const catalogCols = STUDIO_PRESETS.catalog;
  const leftoverCatalogTint = preset !== "catalog"
    && !src.worldCol
    && (!src.keyCol || normStudioHex(src.keyCol, catalogCols.keyCol) === catalogCols.keyCol)
    && (!src.fillCol || normStudioHex(src.fillCol, catalogCols.fillCol) === catalogCols.fillCol)
    && (!src.rimCol || normStudioHex(src.rimCol, catalogCols.rimCol) === catalogCols.rimCol);
  return {
    preset,
    world: clamp(src.world, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, fromPreset.world),
    key: clamp(src.key, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, fromPreset.key),
    fill: clamp(src.fill, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, fromPreset.fill),
    rim: clamp(src.rim, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, fromPreset.rim),
    exposure: clamp(src.exposure, STUDIO_EXPOSURE_MIN, STUDIO_EXPOSURE_MAX, fromPreset.exposure),
    worldCol: leftoverCatalogTint ? fromPreset.worldCol : normStudioHex(src.worldCol, fromPreset.worldCol || base.worldCol),
    keyCol: leftoverCatalogTint ? fromPreset.keyCol : normStudioHex(src.keyCol, fromPreset.keyCol || base.keyCol),
    fillCol: leftoverCatalogTint ? fromPreset.fillCol : normStudioHex(src.fillCol, fromPreset.fillCol || base.fillCol),
    rimCol: leftoverCatalogTint ? fromPreset.rimCol : normStudioHex(src.rimCol, fromPreset.rimCol || base.rimCol),
    extras: normalizeExtras(src.extras),
  };
}

export function serializeStudioState(raw) {
  const s = normalizeStudioState(raw);
  return JSON.stringify({
    p: s.preset,
    w: s.world,
    k: s.key,
    f: s.fill,
    r: s.rim,
    e: s.exposure,
    wc: s.worldCol,
    kc: s.keyCol,
    fc: s.fillCol,
    rc: s.rimCol,
    x: s.extras.map((item) => ({ i: item.id, c: item.color, n: item.intensity, p: item.place })),
  });
}

export function parseStudioState(raw) {
  if (!raw) return defaultStudioState();
  if (typeof raw === "object") return normalizeStudioState(raw);
  try {
    const packed = JSON.parse(raw);
    if (!packed || typeof packed !== "object") return defaultStudioState();
    return normalizeStudioState({
      preset: packed.p || packed.preset,
      world: packed.w ?? packed.world,
      key: packed.k ?? packed.key,
      fill: packed.f ?? packed.fill,
      rim: packed.r ?? packed.rim,
      exposure: packed.e ?? packed.exposure,
      worldCol: packed.wc || packed.worldCol,
      keyCol: packed.kc || packed.keyCol,
      fillCol: packed.fc || packed.fillCol,
      rimCol: packed.rc || packed.rimCol,
      extras: Array.isArray(packed.x)
        ? packed.x.map((item) => ({
          id: item.i || item.id,
          color: item.c || item.color,
          intensity: item.n ?? item.intensity,
          place: item.p || item.place,
        }))
        : packed.extras,
    });
  } catch {
    return defaultStudioState();
  }
}

export function attachStudioLighting(B, scene, camera, opts = {}) {
  const world = new B.HemisphericLight("world", new B.Vector3(0.18, 1, 0.28), scene);
  world.diffuse = new B.Color3(1, 0.98, 0.95);
  world.groundColor = new B.Color3(0.74, 0.72, 0.69);

  const key = new B.DirectionalLight("key", new B.Vector3(-0.35, -0.72, -0.55), scene);
  key.position = new B.Vector3(2.4, 4.2, 3.2);
  key.diffuse = new B.Color3(1, 0.97, 0.92);

  const fill = new B.DirectionalLight("fill", new B.Vector3(0.62, -0.28, -0.35), scene);
  fill.position = new B.Vector3(-3.2, 2.2, 2.4);
  fill.diffuse = new B.Color3(0.92, 0.95, 1);

  const rim = new B.DirectionalLight("rim", new B.Vector3(0.25, -0.12, 0.9), scene);
  rim.position = new B.Vector3(-1.2, 2.8, -4.4);
  rim.diffuse = new B.Color3(0.85, 0.9, 1);

  let env = null;
  if (opts.environment !== false) {
    env = scene.createDefaultEnvironment({
      createSkybox: true,
      createGround: false,
      skyboxSize: opts.skyboxSize || 70,
      skyboxColor: new B.Color3(0.94, 0.92, 0.89),
    });
  }

  if (opts.ssao !== false && camera) {
    try {
      const ssao = new B.SSAO2RenderingPipeline("ssao", scene, 1);
      ssao.totalStrength = 0.28;
      ssao.radius = 0.8;
      ssao.expensiveBlur = true;
      ssao.samples = 8;
      ssao.maxZ = 40;
      scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao", camera);
    } catch {
      /* optional */
    }
  }

  if (scene.imageProcessingConfiguration) {
    scene.imageProcessingConfiguration.toneMappingEnabled = true;
    scene.imageProcessingConfiguration.contrast = 1.02;
  }

  let lastPacked = "";
  const state = defaultStudioState();
  const extraLights = Array.from({ length: MAX_STUDIO_EXTRAS }, (_, index) => {
    const light = new B.DirectionalLight(`extra${index}`, new B.Vector3(-0.22, -0.55, -0.78), scene);
    light.intensity = 0;
    light.setEnabled(false);
    return light;
  });

  const paintLight = (light, hex, fallback) => {
    const [r, g, b] = hexToRgb01(hex, fallback);
    light.diffuse = new B.Color3(r, g, b);
  };

  const snapshot = () => ({
    ...state,
    extras: state.extras.map((item) => ({ ...item })),
  });

  const applyState = () => {
    world.intensity = state.world;
    key.intensity = state.key;
    fill.intensity = state.fill;
    rim.intensity = state.rim;
    const [wr, wg, wb] = hexToRgb01(state.worldCol, STUDIO_CHANNEL_COLORS.world);
    world.diffuse = new B.Color3(wr, wg, wb);
    world.groundColor = new B.Color3(wr * 0.74, wg * 0.73, wb * 0.72);
    scene.clearColor = opts.alpha
      ? new B.Color4(0, 0, 0, 0)
      : new B.Color4(wr, wg, wb, 1);
    if (env?.skyboxMaterial) env.skyboxMaterial.primaryColor = new B.Color3(wr, wg, wb);
    paintLight(key, state.keyCol, STUDIO_CHANNEL_COLORS.key);
    paintLight(fill, state.fillCol, STUDIO_CHANNEL_COLORS.fill);
    paintLight(rim, state.rimCol, STUDIO_CHANNEL_COLORS.rim);
    if (scene.imageProcessingConfiguration) {
      scene.imageProcessingConfiguration.exposure = state.exposure;
    }
    extraLights.forEach((light, index) => {
      const extra = state.extras[index];
      if (!extra) {
        light.intensity = 0;
        light.setEnabled(false);
        return;
      }
      const place = STUDIO_EXTRA_PLACES[extra.place] || STUDIO_EXTRA_PLACES.frente;
      light.setEnabled(true);
      light.intensity = extra.intensity;
      light.direction = new B.Vector3(...place.dir);
      light.position = new B.Vector3(...place.pos);
      paintLight(light, extra.color, EXTRA_TINTS[index]);
    });
  };

  const applyPreset = (id) => {
    const p = STUDIO_PRESETS[id] || STUDIO_PRESETS.catalog;
    state.preset = STUDIO_PRESETS[id] ? id : "catalog";
    state.world = p.world;
    state.key = p.key;
    state.fill = p.fill;
    state.rim = p.rim;
    state.exposure = p.exposure;
    state.worldCol = p.worldCol;
    state.keyCol = p.keyCol;
    state.fillCol = p.fillCol;
    state.rimCol = p.rimCol;
    key.direction = new B.Vector3(...p.keyDir);
    fill.direction = new B.Vector3(...p.fillDir);
    rim.direction = new B.Vector3(...p.rimDir);
    scene.environmentIntensity = p.env;
    applyState();
    return snapshot();
  };

  const setChannel = (name, value) => {
    if (name === "worldCol" || name === "keyCol" || name === "fillCol" || name === "rimCol") {
      state[name] = normStudioHex(value, state[name]);
      applyState();
      return snapshot();
    }
    const v = Number(value);
    if (!Number.isFinite(v)) return snapshot();
    if (name === "world") state.world = clamp(v, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, state.world);
    if (name === "key") state.key = clamp(v, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, state.key);
    if (name === "fill") state.fill = clamp(v, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, state.fill);
    if (name === "rim") state.rim = clamp(v, STUDIO_CHANNEL_MIN, STUDIO_CHANNEL_MAX, state.rim);
    if (name === "exposure") state.exposure = clamp(v, STUDIO_EXPOSURE_MIN, STUDIO_EXPOSURE_MAX, state.exposure);
    applyState();
    return snapshot();
  };

  const applyConfig = (raw) => {
    const next = normalizeStudioState(raw);
    applyPreset(next.preset);
    state.world = next.world;
    state.key = next.key;
    state.fill = next.fill;
    state.rim = next.rim;
    state.exposure = next.exposure;
    state.worldCol = next.worldCol;
    state.keyCol = next.keyCol;
    state.fillCol = next.fillCol;
    state.rimCol = next.rimCol;
    state.extras = next.extras.map((item) => ({ ...item }));
    applyState();
    return snapshot();
  };

  const syncFromHost = (host) => {
    let packed = host?.dataset?.studioLights || "";
    if (packed.includes("%")) {
      try { packed = decodeURIComponent(packed); } catch { /* keep packed */ }
    }
    if (packed === lastPacked) return { ...state };
    lastPacked = packed;
    return applyConfig(parseStudioState(packed));
  };

  const getState = () => snapshot();

  applyPreset((opts.initial && opts.initial.preset) || "catalog");
  if (opts.initial) applyConfig(opts.initial);

  return {
    world,
    key,
    fill,
    rim,
    extras: extraLights,
    env,
    applyPreset,
    setChannel,
    applyConfig,
    syncFromHost,
    getState,
    addExtra() {
      Object.assign(state, addStudioExtra(state));
      applyState();
      return snapshot();
    },
    setExtra(id, patch) {
      Object.assign(state, updateStudioExtra(state, id, patch));
      applyState();
      return snapshot();
    },
    removeExtra(id) {
      Object.assign(state, removeStudioExtra(state, id));
      applyState();
      return snapshot();
    },
  };
}
