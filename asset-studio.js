import { attachStudioLighting } from "./studio-lights.js?v=thumb6";

export const ASSET_THUMB_PRESET = "estudio";

let BABYLON = null;

async function core() {
  if (!BABYLON) BABYLON = await import("@babylonjs/core");
  const B = BABYLON;
  const mod = await import("@babylonjs/loaders/glTF");
  const Ctor = mod.GLTFFileLoader;
  if (Ctor && !B.SceneLoader.IsPluginForExtensionAvailable(".glb")) {
    B.SceneLoader.RegisterPlugin(new Ctor());
  }
  return B;
}

function pluginExt(name = "") {
  return String(name).toLowerCase().endsWith(".gltf") ? ".gltf" : ".glb";
}

function splitAssetUrl(url) {
  const clean = String(url).split("?")[0];
  const i = clean.lastIndexOf("/") + 1;
  return { root: clean.slice(0, i), file: decodeURIComponent(clean.slice(i)) };
}

function frameCamera(camera, meshes) {
  const { Vector3 } = BABYLON;
  let min = null;
  let max = null;
  for (const mesh of meshes) {
    if (!mesh.getBoundingInfo || mesh.name === "__root__") continue;
    mesh.computeWorldMatrix(true);
    const bi = mesh.getBoundingInfo();
    const bmin = bi.boundingBox.minimumWorld;
    const bmax = bi.boundingBox.maximumWorld;
    min = min ? Vector3.Minimize(min, bmin) : bmin.clone();
    max = max ? Vector3.Maximize(max, bmax) : bmax.clone();
  }
  if (!min || !max) return;
  const center = min.add(max).scale(0.5);
  const radius = max.subtract(min).length() * 0.72 || 1.4;
  camera.setTarget(center);
  camera.radius = Math.min(16, Math.max(0.8, radius * 2.15));
  camera.lowerRadiusLimit = radius * 0.35;
  camera.upperRadiusLimit = radius * 8;
}

export async function createAssetStudio(canvas, opts = {}) {
  const B = await core();
  const engine = new B.Engine(canvas, true, {
    adaptToDeviceRatio: false,
    stencil: true,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: opts.alpha === true,
  }, true);
  const setDpr = (value) => {
    const dpr = Math.min(2.5, Math.max(1, Number(value) || 1));
    engine.setHardwareScalingLevel(1 / dpr);
    engine.resize();
    return dpr;
  };
  setDpr(opts.dpr ?? Math.min(1.5, window.devicePixelRatio || 1));

  const scene = new B.Scene(engine);
  scene.clearColor = opts.alpha
    ? new B.Color4(0, 0, 0, 0)
    : new B.Color4(0.09, 0.09, 0.1, 1);
  scene.imageProcessingConfiguration.toneMappingEnabled = true;
  scene.imageProcessingConfiguration.exposure = 0.92;
  scene.imageProcessingConfiguration.contrast = 1.12;
  scene.environmentIntensity = 0.32;

  const camera = new B.ArcRotateCamera("cam", -2.52, 1.06, 3.4, B.Vector3.Zero(), scene);
  camera.attachControl(canvas, true);
  camera.minZ = 0.2;
  camera.wheelDeltaPercentage = 0.012;
  camera.panningSensibility = 900;
  if (opts.autoRotate === false) {
    camera.useAutoRotationBehavior = false;
  } else {
    camera.useAutoRotationBehavior = true;
    camera.autoRotationBehavior.idleRotationSpeed = 0.16;
    camera.autoRotationBehavior.idleRotationWaitTime = 1800;
  }

  const lights = attachStudioLighting(B, scene, camera, {
    ssao: opts.ssao !== false,
    environment: opts.environment !== false,
    alpha: opts.alpha === true,
    initial: { preset: opts.preset || "catalog" },
  });
  const applyPreset = lights.applyPreset;
  const setChannel = lights.setChannel;

  let lastImport = null;
  let gen = 0;
  let blobUrl = "";

  const disposeImport = (result) => {
    if (!result) return;
    const lists = [
      result.meshes,
      result.transformNodes,
      result.particleSystems,
      result.skeletons,
      result.animationGroups,
      result.lights,
      result.geometries,
    ];
    for (const list of lists) {
      for (const item of list || []) {
        if (item && !item.isDisposed?.()) item.dispose();
      }
    }
  };

  const clearModel = () => {
    disposeImport(lastImport);
    lastImport = null;
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      blobUrl = "";
    }
  };

  const show = async (source) => {
    const token = ++gen;
    clearModel();
    if (!source) return;
    const ext = pluginExt(source.name || source.url || "");
    let result;
    if (source.kind === "file") {
      blobUrl = URL.createObjectURL(source.file);
      result = await B.SceneLoader.ImportMeshAsync("", "", blobUrl, scene, undefined, ext);
    } else {
      const parts = splitAssetUrl(source.url);
      result = await B.SceneLoader.ImportMeshAsync("", parts.root, parts.file, scene, undefined, ext);
    }
    if (token !== gen) {
      disposeImport(result);
      return;
    }
    lastImport = result;
    frameCamera(camera, result.meshes);
    if (opts.thumbPose) {
      camera.alpha = -2.52;
      camera.beta = 1.06;
    }
  };

  engine.runRenderLoop(() => scene.render());
  const onResize = () => engine.resize();
  window.addEventListener("resize", onResize);

  return {
    show,
    setDpr,
    applyPreset,
    setChannel,
    applyConfig: lights.applyConfig,
    addExtra: lights.addExtra,
    setExtra: lights.setExtra,
    removeExtra: lights.removeExtra,
    lights: () => lights.getState(),
    async ready() {
      if (scene.whenReadyAsync) await scene.whenReadyAsync();
      for (let i = 0; i < 8; i += 1) {
        scene.render();
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }
    },
    capture() {
      scene.render();
      return opts.alpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.9);
    },
    resize: onResize,
    dispose() {
      window.removeEventListener("resize", onResize);
      clearModel();
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    },
  };
}

export async function bakeAssetThumb(source, opts = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = 448;
  canvas.height = 448;
  canvas.style.cssText = "position:fixed;left:-9999px;top:0;width:448px;height:448px;opacity:0;pointer-events:none";
  document.body.appendChild(canvas);
  const studio = await createAssetStudio(canvas, {
    dpr: 1.5,
    autoRotate: false,
    thumbPose: true,
    ssao: false,
    alpha: true,
    environment: false,
    preset: opts.preset || ASSET_THUMB_PRESET,
  });
  if (opts.channels) studio.applyConfig(opts.channels);
  else studio.applyPreset(opts.preset || ASSET_THUMB_PRESET);
  await studio.show(source);
  await studio.ready();
  const dataUrl = studio.capture();
  studio.dispose();
  canvas.remove();
  return dataUrl;
}
