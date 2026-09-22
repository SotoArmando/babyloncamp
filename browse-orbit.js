import { fitStillCamera, loadComboPropInto } from "./ad-player.js?v=prop108";
import { resolvePalette } from "./ad-catalog.js?v=cam50";
import { attachStudioLighting } from "./studio-lights.js";

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
  try { await import("@babylonjs/loaders/glTF"); } catch { /* until a glb is picked */ }
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
    -Math.PI * 0.42,
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
  const loaded = await loadComboPropInto(scene, root, item);
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
  fitStillCamera(camera, loaded.wrap);
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
      try { engine.stopRenderLoop(); } catch { /* optional */ }
      try { scene.dispose(); } catch { /* optional */ }
      try { engine.dispose(); } catch { /* optional */ }
      canvas.remove();
    },
  };
  return session;
}
