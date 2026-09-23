import { playById, resolvePalette } from "./ad-catalog.js";
import { getAssetLoadSource, listAllAssets } from "./ad-assets.js";
import { loadComboPropFiles } from "./ad-profile.js";
import { attachStudioLighting } from "./studio-lights.js";

const CAM_HOME = -Math.PI * 0.42;
let session = null;

function hexToRgb(value) {
  const m = String(value || "").trim().match(/^#?([0-9a-f]{3,8})$/i);
  if (!m) return { r: 0.07, g: 0.075, b: 0.085 };
  let hex = m[1];
  if (hex.length === 3) hex = hex.split("").map((ch) => ch + ch).join("");
  const n = Number.parseInt(hex.slice(0, 6), 16);
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
  };
}

function applyClimaxLights(BABYLON, scene, camera, item, bg) {
  const pal = resolvePalette(item?.play || "prop", item?.pal);
  const fog = hexToRgb(pal.fog || bg);
  const flatOn = String(item?.pflat) === "1";
  const studio = item?.studio && typeof item.studio === "object" ? item.studio : null;
  if (studio) {
    const rig = attachStudioLighting(BABYLON, scene, camera, {
      initial: studio,
      skyboxSize: 48,
      ssao: false,
      environment: !flatOn,
    });
    scene.clearColor = new BABYLON.Color4(fog.r, fog.g, fog.b, 1);
    const skyMesh = rig.env?.skybox;
    if (skyMesh) skyMesh.setEnabled(!flatOn);
    if (!flatOn && rig.env?.skyboxMaterial?.primaryColor) {
      rig.env.skyboxMaterial.primaryColor.set(fog.r, fog.g, fog.b);
    }
    return;
  }
  scene.clearColor = new BABYLON.Color4(fog.r, fog.g, fog.b, 1);
  const hemi = new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0.2, 1, 0.35), scene);
  hemi.intensity = 0.62;
  hemi.diffuse = new BABYLON.Color3(0.92, 0.93, 0.95);
  hemi.groundColor = new BABYLON.Color3(0.18, 0.17, 0.16);
  const key = new BABYLON.DirectionalLight("key", new BABYLON.Vector3(-0.45, -0.85, -0.3), scene);
  key.position = new BABYLON.Vector3(2.2, 5.4, 1.6);
  key.intensity = 0.9;
  key.diffuse = new BABYLON.Color3(1, 0.97, 0.92);
  const rim = new BABYLON.DirectionalLight("rim", new BABYLON.Vector3(0.6, -0.2, 0.7), scene);
  rim.diffuse = new BABYLON.Color3(0.55, 0.62, 0.75);
  rim.intensity = 0.35;
}

function localBounds(BABYLON, node) {
  node.computeWorldMatrix(true);
  const inv = node.getWorldMatrix().clone();
  inv.invert();
  let min = null;
  let max = null;
  for (const mesh of node.getChildMeshes()) {
    if (!mesh.getTotalVertices || mesh.getTotalVertices() < 1) continue;
    if (mesh.name === "__root__") continue;
    mesh.computeWorldMatrix(true);
    try { mesh.refreshBoundingInfo(true); } catch { mesh.refreshBoundingInfo(); }
    const box = mesh.getBoundingInfo()?.boundingBox;
    if (!box) continue;
    const worlds = box.vectorsWorld || [box.minimumWorld, box.maximumWorld];
    for (const world of worlds) {
      const local = BABYLON.Vector3.TransformCoordinates(world, inv);
      min = min ? BABYLON.Vector3.Minimize(min, local) : local.clone();
      max = max ? BABYLON.Vector3.Maximize(max, local) : local.clone();
    }
  }
  if (!min || !max) {
    const raw = node.getHierarchyBoundingVectors(true);
    const a = BABYLON.Vector3.TransformCoordinates(raw.min, inv);
    const b = BABYLON.Vector3.TransformCoordinates(raw.max, inv);
    min = BABYLON.Vector3.Minimize(a, b);
    max = BABYLON.Vector3.Maximize(a, b);
  }
  return { center: min.add(max).scale(0.5), size: max.subtract(min) };
}

function fitPropImport(BABYLON, node, target) {
  node.position.setAll(0);
  node.rotationQuaternion = null;
  node.rotation.setAll(0);
  node.scaling.setAll(1);
  node.computeWorldMatrix(true);
  const ext = localBounds(BABYLON, node);
  const longest = Math.max(ext.size.x, ext.size.y, ext.size.z, 0.001);
  return { fitScale: target / longest, center: ext.center.clone() };
}

function fitStillCamera(BABYLON, camera, node) {
  if (!camera || !node) return false;
  node.computeWorldMatrix(true);
  const { min, max } = node.getHierarchyBoundingVectors(true);
  const longest = Math.max(max.x - min.x, max.y - min.y, max.z - min.z, 0.12);
  camera.target.set((min.x + max.x) * 0.5, (min.y + max.y) * 0.5, (min.z + max.z) * 0.5);
  camera.alpha = CAM_HOME;
  camera.beta = 1.12;
  camera.fov = 0.52;
  camera.radius = (longest * 0.58) / Math.max(0.08, Math.tan(camera.fov * 0.5));
  return true;
}

async function comboMeshSource(item) {
  if (playById(item?.play).id !== "prop" || !item?.pmesh) return null;
  if (item.pmesh.assetId) {
    const catalog = await listAllAssets();
    const asset = catalog.find((entry) => entry.id === item.pmesh.assetId);
    const src = asset ? await getAssetLoadSource(asset) : null;
    if (src?.kind === "url" && src.url) return { url: src.url };
    if (src?.kind === "file" && src.file) return { file: src.file };
  }
  try {
    const files = await loadComboPropFiles(item.id);
    const mesh = (files || []).find((file) => /\.(glb|gltf|obj)$/i.test(file.name));
    if (mesh) return { file: mesh };
  } catch {
    /* el modelo puede vivir solo en la carpeta */
  }
  return null;
}

async function ensureMeshLoader(BABYLON, name) {
  const obj = /\.obj($|\?)/i.test(name);
  const mod = obj
    ? await import("@babylonjs/loaders/OBJ")
    : await import("@babylonjs/loaders/glTF");
  const Ctor = obj ? mod.OBJFileLoader : mod.GLTFFileLoader;
  const ext = obj ? ".obj" : ".gltf";
  if (Ctor && !BABYLON.SceneLoader.IsPluginForExtensionAvailable(ext)) {
    BABYLON.SceneLoader.RegisterPlugin(new Ctor());
  }
}

async function importComboMesh(BABYLON, scene, parent, item) {
  const source = await comboMeshSource(item);
  if (!source) return null;
  let blobUrl = "";
  const filename = source.url || "";
  if (!filename && source.file) blobUrl = URL.createObjectURL(source.file);
  const sceneFile = filename || blobUrl;
  await ensureMeshLoader(BABYLON, source.file?.name || sceneFile);
  try {
    const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", sceneFile, scene);
    const wrap = new BABYLON.TransformNode("propImport", scene);
    wrap.parent = parent;
    const imported = [...(result.transformNodes || []), ...(result.meshes || [])];
    for (const node of imported) {
      if (!node || node === wrap) continue;
      let top = node;
      while (top.parent && top.parent !== scene && top.parent !== wrap) top = top.parent;
      if (top !== wrap) top.parent = wrap;
    }
    for (const light of result.lights || []) light.setEnabled(false);
    const fitted = fitPropImport(BABYLON, wrap, 0.72);
    return { wrap, fitScale: fitted.fitScale, center: fitted.center, blobUrl };
  } catch (err) {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    console.warn("No se pudo cargar el modelo 3D", err);
    return null;
  }
}

export function unmountPinOrbit() {
  if (!session) return;
  try { session.dispose(); } catch { /* engine may be gone */ }
  session = null;
}

export async function mountPinOrbit(host, item, { bg = "#121315", onDrag } = {}) {
  if (!host || !item) return null;
  unmountPinOrbit();
  const canvas = host.querySelector("canvas") || document.createElement("canvas");
  if (!canvas.parentNode) host.appendChild(canvas);
  const BABYLON = await import("@babylonjs/core");
  const engine = new BABYLON.Engine(canvas, true, {
    antialias: true,
    adaptToDeviceRatio: true,
    preserveDrawingBuffer: false,
    stencil: false,
  });
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1);
  const camera = new BABYLON.ArcRotateCamera(
    "orbitCam",
    CAM_HOME,
    1.12,
    2.4,
    BABYLON.Vector3.Zero(),
    scene
  );
  camera.minZ = 0.05;
  camera.panningSensibility = 0;
  camera.wheelPrecision = 48;
  camera.pinchPrecision = 36;
  camera.attachControl(canvas, true);
  if (BABYLON.Camera?.FOVMODE_VERTICAL_FIXED != null) {
    camera.fovMode = BABYLON.Camera.FOVMODE_VERTICAL_FIXED;
  }
  host.style.background = bg;
  applyClimaxLights(BABYLON, scene, camera, item, bg);
  const root = new BABYLON.TransformNode("orbitRoot", scene);
  const loaded = await importComboMesh(BABYLON, scene, root, item);
  if (!loaded?.wrap) {
    engine.dispose();
    canvas.remove();
    return null;
  }
  const baseScale = loaded.fitScale || 1;
  const center = loaded.center;
  loaded.wrap.scaling.setAll(baseScale);
  if (center) {
    loaded.wrap.position.set(-center.x * baseScale, -center.y * baseScale, -center.z * baseScale);
  }
  fitStillCamera(BABYLON, camera, loaded.wrap);
  camera.lowerRadiusLimit = camera.radius * 0.55;
  camera.upperRadiusLimit = camera.radius * 2.6;
  const born = performance.now();
  const alpha0 = camera.alpha;
  const SPIN_MS = 1600;
  let userTurn = false;
  scene.onBeforeRenderObservable.add(() => {
    const elapsed = performance.now() - born;
    const popT = Math.min(1, elapsed / 380);
    const pop = 0.84 + (1 - (1 - popT) ** 3) * 0.16;
    const s = baseScale * pop;
    loaded.wrap.scaling.setAll(s);
    if (center) {
      loaded.wrap.position.set(-center.x * s, -center.y * s, -center.z * s);
    }
    if (!userTurn) {
      const t = Math.min(1, elapsed / SPIN_MS);
      const ease = 1 - (1 - t) ** 2.4;
      camera.alpha = alpha0 + ease * Math.PI * 2;
    }
  });
  const markDrag = (ev) => {
    userTurn = true;
    onDrag?.();
    if (ev?.pointerId != null) canvas.setPointerCapture?.(ev.pointerId);
  };
  canvas.addEventListener("pointerdown", markDrag);
  canvas.addEventListener("wheel", markDrag, { passive: true });
  const resize = () => {
    const box = host.getBoundingClientRect();
    const side = Math.max(2, Math.min(box.width, box.height));
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const px = Math.max(2, Math.round(side * dpr));
    canvas.style.width = `${side}px`;
    canvas.style.height = `${side}px`;
    engine.setSize(px, px);
  };
  resize();
  const ro = typeof ResizeObserver === "function" ? new ResizeObserver(resize) : null;
  ro?.observe(host);
  engine.runRenderLoop(() => scene.render());
  session = {
    dispose() {
      canvas.removeEventListener("pointerdown", markDrag);
      canvas.removeEventListener("wheel", markDrag);
      ro?.disconnect();
      if (loaded.blobUrl) URL.revokeObjectURL(loaded.blobUrl);
      try { engine.stopRenderLoop(); } catch { /* optional */ }
      try { scene.dispose(); } catch { /* optional */ }
      try { engine.dispose(); } catch { /* optional */ }
      canvas.remove();
    },
  };
  return session;
}
