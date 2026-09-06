const CLOCK_MASK = 0x10000000;

export const clockLook = {
  on: true,
  style: "sweep",
  tone: "dark",
  size: 100,
  t: 0,
};

export function writeClockLook(next = {}) {
  if (next.on != null) clockLook.on = Boolean(next.on);
  if (next.style) clockLook.style = next.style;
  if (next.tone) clockLook.tone = next.tone;
  if (next.size != null) {
    const n = Number(next.size);
    clockLook.size = Number.isFinite(n) ? Math.min(200, Math.max(50, n)) : 100;
  }
  if (next.t != null) {
    const t = Math.min(1, Math.max(0, Number(next.t) || 0));
    if (t === 0 || t >= clockLook.t) clockLook.t = t;
  }
  return clockLook;
}

function toneColors(tone) {
  const light = tone === "light";
  return {
    ink: light ? [0.08, 0.08, 0.08] : [1, 1, 1],
    void: light ? [0.94, 0.94, 0.94] : [0.06, 0.07, 0.08],
    track: light ? [0.08, 0.08, 0.08] : [1, 1, 1],
    inkCss: light ? "#141414" : "#ffffff",
    voidCss: light ? "rgba(255,255,255,0.9)" : "rgba(12,14,16,0.72)",
    trackCss: light ? "rgba(20,20,20,0.22)" : "rgba(255,255,255,0.22)",
  };
}

function unlit(B, scene, rgb, alpha = 1) {
  const mat = new B.StandardMaterial("clockMat", scene);
  mat.disableLighting = true;
  mat.emissiveColor = new B.Color3(rgb[0], rgb[1], rgb[2]);
  mat.diffuseColor = new B.Color3(0, 0, 0);
  mat.specularColor = new B.Color3(0, 0, 0);
  mat.alpha = alpha;
  if (alpha < 1) mat.transparencyMode = B.Material.MATERIAL_ALPHABLEND;
  mat.backFaceCulling = false;
  return mat;
}

function paintFillTex(tex, t, ink, ring) {
  const ctx = tex.getContext();
  const s = tex.getSize().width;
  const c = s / 2;
  ctx.clearRect(0, 0, s, s);
  if (t <= 0) {
    tex.update();
    return;
  }
  ctx.fillStyle = `rgb(${Math.round(ink[0] * 255)},${Math.round(ink[1] * 255)},${Math.round(ink[2] * 255)})`;
  ctx.beginPath();
  ctx.moveTo(c, c);
  ctx.arc(c, c, c, -Math.PI / 2, -Math.PI / 2 + t * Math.PI * 2, false);
  ctx.closePath();
  ctx.fill();
  if (ring) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(c, c, c * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = "source-over";
  }
  tex.update();
}

function layoutClock(clock, w, h) {
  const aspect = Math.max(0.2, w / Math.max(1, h));
  const halfH = 1;
  const halfW = aspect;
  clock.cam.orthoLeft = -halfW;
  clock.cam.orthoRight = halfW;
  clock.cam.orthoBottom = -halfH;
  clock.cam.orthoTop = halfH;
  const span = Math.min(halfW, halfH);
  const r = span * 0.12;
  const m = span * 0.075;
  clock.root.position.x = halfW - m - r;
  clock.root.position.y = halfH - m - r;
  clock.root.scaling.setAll(r / 0.5);
}

function applyClockMeshes(clock) {
  const { style, tone, t, on } = clockLook;
  const colors = toneColors(tone);
  const show = on && t >= 0;
  clock.root.setEnabled(show);
  if (!show) return;
  clock.voidMesh.setEnabled(style !== "ring");
  clock.fillMesh.setEnabled(style === "sweep" || style === "disc" || style === "ring");
  clock.handPivot.setEnabled(style === "sweep" || style === "ray");
  clock.bead.setEnabled(style === "bead");
  clock.track.setEnabled(style === "ring");
  clock.voidMat.emissiveColor.set(colors.void[0], colors.void[1], colors.void[2]);
  clock.voidMat.alpha = tone === "light" ? 0.9 : 0.72;
  clock.inkMat.emissiveColor.set(colors.ink[0], colors.ink[1], colors.ink[2]);
  clock.trackMat.emissiveColor.set(colors.track[0], colors.track[1], colors.track[2]);
  const sweep = t >= 0.995 ? 1 : t;
  const key = `${style}|${tone}|${sweep.toFixed(3)}`;
  if (clock.lastKey !== key) {
    clock.lastKey = key;
    paintFillTex(clock.fillTex, sweep, colors.ink, style === "ring");
  }
  clock.handPivot.rotation.z = -sweep * Math.PI * 2;
  const bead = style === "bead" ? Math.max(0.04, sweep) : 1;
  clock.bead.scaling.setAll(bead);
}

export function attachSceneClock(B, scene, unit) {
  const main = scene.activeCamera;
  const cam = new B.FreeCamera("adClockCam", new B.Vector3(0, 0, -4), scene);
  cam.mode = B.Camera.ORTHOGRAPHIC_CAMERA;
  cam.layerMask = CLOCK_MASK;
  cam.minZ = 0.1;
  cam.maxZ = 20;
  cam.inputs.clear();
  if (main) {
    main.layerMask = 0x0FFFFFFF;
    scene.activeCameras = [main, cam];
  }

  const root = new B.TransformNode("adClock", scene);
  const voidMat = unlit(B, scene, [0.06, 0.07, 0.08], 0.72);
  const inkMat = unlit(B, scene, [1, 1, 1]);
  const trackMat = unlit(B, scene, [1, 1, 1], 0.22);
  const fillTex = new B.DynamicTexture("adClockFill", { width: 128, height: 128 }, scene, false);
  fillTex.hasAlpha = true;
  const fillMat = new B.StandardMaterial("adClockFillMat", scene);
  fillMat.disableLighting = true;
  fillMat.diffuseColor = new B.Color3(0, 0, 0);
  fillMat.specularColor = new B.Color3(0, 0, 0);
  fillMat.emissiveTexture = fillTex;
  fillMat.opacityTexture = fillTex;
  fillMat.useAlphaFromDiffuseTexture = false;
  fillMat.transparencyMode = B.Material.MATERIAL_ALPHABLEND;
  fillMat.backFaceCulling = false;

  const voidMesh = B.MeshBuilder.CreateDisc("adClockVoid", { radius: 0.5, tessellation: 36 }, scene);
  voidMesh.material = voidMat;
  const fillMesh = B.MeshBuilder.CreateDisc("adClockFill", { radius: 0.5, tessellation: 36 }, scene);
  fillMesh.material = fillMat;
  fillMesh.position.z = -0.01;
  const track = B.MeshBuilder.CreateTorus("adClockTrack", { diameter: 0.94, thickness: 0.055, tessellation: 32 }, scene);
  track.rotation.x = Math.PI / 2;
  track.material = trackMat;
  const handPivot = new B.TransformNode("adClockHand", scene);
  const hand = B.MeshBuilder.CreateBox("adClockNeedle", { width: 0.045, height: 0.48, depth: 0.02 }, scene);
  hand.position.y = 0.24;
  hand.position.z = -0.02;
  hand.material = inkMat;
  hand.parent = handPivot;
  const bead = B.MeshBuilder.CreateDisc("adClockBead", { radius: 0.5, tessellation: 28 }, scene);
  bead.material = inkMat;
  bead.position.z = -0.01;

  for (const mesh of [voidMesh, fillMesh, track, hand, bead]) {
    mesh.parent = mesh === hand ? handPivot : root;
    mesh.layerMask = CLOCK_MASK;
    mesh.isPickable = false;
    mesh.alwaysSelectAsActiveMesh = true;
  }
  handPivot.parent = root;
  handPivot.layerMask = CLOCK_MASK;

  const clock = {
    cam,
    root,
    voidMesh,
    fillMesh,
    fillTex,
    fillMat,
    voidMat,
    inkMat,
    track,
    trackMat,
    handPivot,
    bead,
    lastKey: "",
    lastW: 0,
    lastH: 0,
  };
  unit.clock = clock;
  scene.onBeforeRenderObservable.add(() => {
    const host = unit.container;
    clock.root.setEnabled(false);
    return;
    const w = scene.getEngine().getRenderWidth();
    const h = scene.getEngine().getRenderHeight();
    if (w !== clock.lastW || h !== clock.lastH) {
      clock.lastW = w;
      clock.lastH = h;
      layoutClock(clock, w, h);
    }
    applyClockMeshes(clock);
  });
}

export function drawCanvasClock(ctx, w, h) {
  if (!clockLook.on || clockLook.t < 0) return;
  const { style, tone, t, size } = clockLook;
  const colors = toneColors(tone);
  const short = Math.min(w, h);
  const scale = Math.min(2, Math.max(0.5, (Number(size) || 100) / 100));
  const r = short * 0.06 * scale;
  const m = short * 0.038;
  const cx = w - r - m;
  const cy = r + m;
  const sweep = t >= 0.999 ? 1 : t;
  const full = sweep >= 1;
  ctx.save();
  if (style !== "ring") {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = colors.voidCss;
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.trackCss;
    ctx.lineWidth = r * 0.18;
    ctx.stroke();
  }
  if (style === "bead") {
    ctx.beginPath();
    ctx.arc(cx, cy, r * (full ? 1 : Math.max(0.04, sweep)), 0, Math.PI * 2);
    ctx.fillStyle = colors.inkCss;
    ctx.fill();
  } else if (style !== "ray") {
    if (full) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      if (style === "ring") {
        ctx.strokeStyle = colors.inkCss;
        ctx.lineWidth = r * 0.2;
        ctx.stroke();
      } else {
        ctx.fillStyle = colors.inkCss;
        ctx.fill();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2, false);
      ctx.closePath();
      if (style === "ring") {
        ctx.save();
        ctx.clip();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = r * 0.2;
        ctx.strokeStyle = colors.inkCss;
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = colors.inkCss;
        ctx.fill();
      }
    }
  }
  if ((style === "sweep" || style === "ray") && !full) {
    const a = -Math.PI / 2 + sweep * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.strokeStyle = colors.inkCss;
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.lineCap = "round";
    ctx.stroke();
  }
  ctx.restore();
}

export function paintHostClock(container) {
  const layer = container?.querySelector?.(".ad-clock-layer");
  if (!layer) return;
  const idle = container.classList.contains("is-idle");
  const off = !clockLook.on || idle || document.body.classList.contains("clock-off");
  const w = layer.clientWidth | 0;
  const h = layer.clientHeight | 0;
  const ctx = layer.getContext("2d");
  if (!ctx) return;
  if (off || w < 2 || h < 2) {
    ctx.clearRect(0, 0, layer.width, layer.height);
    return;
  }
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const bw = Math.max(2, Math.round(w * dpr));
  const bh = Math.max(2, Math.round(h * dpr));
  if (layer.width !== bw || layer.height !== bh) {
    layer.width = bw;
    layer.height = bh;
  }
  ctx.clearRect(0, 0, bw, bh);
  drawCanvasClock(ctx, bw, bh);
}
