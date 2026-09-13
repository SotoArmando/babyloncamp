export const DEFAULT_SOMA = {
  solo: "all",
  activity: { on: true, speed: 0.55 },
  shell: { on: true, opacity: 0.88 },
  breath: { amp: 0.7, rate: 12, center: 0.38, hold: 0.12 },
  rhythm: { bpm: 72, force: 0.75, travel: 0.55 },
  intent: { yaw: 12, pitch: -4, lean: 0.18, reach: 0.22, search: 0.15 },
};

const SKIN = [0.78, 0.62, 0.55];
const SKIN_SHELL = [0.86, 0.68, 0.58];
const SHIRT = [0.40, 0.36, 0.46];
const PANTS = [0.24, 0.28, 0.34];
const BREATH = [0.77, 0.35, 0.48];
const RHYTHM = [0.77, 0.22, 0.28];
const INTENT = [0.78, 0.62, 0.38];
const LIMB = [0.68, 0.52, 0.45];

function mat(scene, name, rgb, opts = {}) {
  const BABYLON = scene._somaB;
  const mat = new BABYLON.StandardMaterial(name, scene);
  mat.diffuseColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
  mat.specularColor = new BABYLON.Color3(0.18, 0.16, 0.14);
  mat.emissiveColor = new BABYLON.Color3(rgb[0] * 0.08, rgb[1] * 0.08, rgb[2] * 0.08);
  if (opts.alpha != null) {
    mat.alpha = opts.alpha;
    mat.transparencyMode = BABYLON.Material.MATERIAL_ALPHABLEND;
    mat.backFaceCulling = false;
  }
  return mat;
}

function node(scene, name, parent) {
  const BABYLON = scene._somaB;
  const t = new BABYLON.TransformNode(name, scene);
  if (parent) t.parent = parent;
  return t;
}

function capsule(scene, name, parent, { h, r, y = 0, x = 0, z = 0, rgb, alpha, tess = 8 }) {
  const BABYLON = scene._somaB;
  const mesh = BABYLON.MeshBuilder.CreateCapsule(name, {
    height: h,
    radius: r,
    tessellation: tess,
    subdivisions: 2,
  }, scene);
  mesh.parent = parent;
  mesh.position.set(x, y, z);
  mesh.material = mat(scene, `${name}Mat`, rgb, { alpha });
  return mesh;
}

const COUPLER = [0.22, 0.2, 0.2];

function cabin(scene, name, parent, {
  len, r, y = 0, x = 0, z = 0, rgb, alpha,
  rotZ = 0, rotX = 0, window = true, lamp = false,
}) {
  const hull = capsule(scene, name, parent, { h: len, r, y, x, z, rgb, alpha, tess: 10 });
  hull.rotation.z = rotZ;
  hull.rotation.x = rotX;
  hull._somaCabin = true;
  const bits = [hull];
  if (window) {
    const band = capsule(scene, `${name}Win`, hull, {
      h: len * 0.48,
      r: r * 0.52,
      z: r * 0.42,
      rgb: [rgb[0] * 0.28, rgb[1] * 0.3, rgb[2] * 0.38],
      alpha: alpha == null ? 0.9 : Math.min(alpha, 0.9),
      tess: 8,
    });
    bits.push(band);
  }
  const coupH = Math.min(0.04, len * 0.14);
  const coupR = r * 0.26;
  bits.push(capsule(scene, `${name}C1`, hull, { h: coupH, r: coupR, y: len * 0.47, rgb: COUPLER, tess: 6 }));
  bits.push(capsule(scene, `${name}C2`, hull, { h: coupH, r: coupR, y: -len * 0.47, rgb: COUPLER, tess: 6 }));
  if (lamp) {
    bits.push(capsule(scene, `${name}Lamp`, hull, {
      h: r * 0.7, r: r * 0.28, z: r * 0.7, rgb: [0.95, 0.88, 0.55], tess: 6,
    }));
  }
  return { hull, bits };
}

function arm(scene, side, shoulder) {
  const s = side === "L" ? -1 : 1;
  const upper = node(scene, `upper${side}`, shoulder);
  upper.position.set(s * 0.02, -0.04, 0);
  const upperC = cabin(scene, `upperM${side}`, upper, { len: 0.28, r: 0.048, y: -0.14, rgb: LIMB });
  const elbow = node(scene, `elbow${side}`, upper);
  elbow.position.set(0, -0.28, 0);
  const foreC = cabin(scene, `foreM${side}`, elbow, { len: 0.26, r: 0.04, y: -0.13, rgb: LIMB });
  const handC = cabin(scene, `hand${side}`, elbow, { len: 0.08, r: 0.036, y: -0.28, rgb: INTENT, window: false });
  return { upper, elbow, meshes: [upperC.hull, foreC.hull, handC.hull], pulse: [upperC.hull, foreC.hull, handC.hull] };
}

function leg(scene, side, hips) {
  const s = side === "L" ? -1 : 1;
  const hip = node(scene, `hip${side}`, hips);
  hip.position.set(s * 0.1, -0.06, 0);
  const thighC = cabin(scene, `thighM${side}`, hip, { len: 0.38, r: 0.064, y: -0.2, rgb: LIMB });
  const knee = node(scene, `knee${side}`, hip);
  knee.position.set(0, -0.4, 0);
  const shinC = cabin(scene, `shinM${side}`, knee, { len: 0.4, r: 0.05, y: -0.2, rgb: LIMB });
  const footC = cabin(scene, `foot${side}`, knee, { len: 0.16, r: 0.038, y: -0.42, z: 0.04, rgb: SKIN, rotX: Math.PI / 2, window: false });
  return { hip, knee, meshes: [thighC.hull, shinC.hull, footC.hull], pulse: [thighC.hull, shinC.hull] };
}

export function createSomaFigure(BABYLON, scene) {
  scene._somaB = BABYLON;

  const root = node(scene, "soma");
  const hips = node(scene, "hips", root);
  hips.position.y = 0.92;

  const pelvis = cabin(scene, "pelvis", hips, { len: 0.16, r: 0.1, y: -0.02, rgb: SKIN, rotZ: Math.PI / 2 }).hull;
  const belly = cabin(scene, "belly", hips, { len: 0.22, r: 0.11, y: 0.16, z: 0.02, rgb: BREATH }).hull;

  const thorax = node(scene, "thorax", hips);
  thorax.position.y = 0.34;
  const chest = cabin(scene, "chest", thorax, { len: 0.28, r: 0.13, y: 0.08, z: 0.03, rgb: BREATH, alpha: 0.46 }).hull;
  const heart = cabin(scene, "heart", thorax, { len: 0.1, r: 0.042, y: 0.1, x: -0.03, z: 0.04, rgb: RHYTHM, window: false, lamp: true }).hull;

  const shoulderL = node(scene, "shoulderL", thorax);
  shoulderL.position.set(-0.2, 0.07, 0.01);
  const shoulderR = node(scene, "shoulderR", thorax);
  shoulderR.position.set(0.2, 0.07, 0.01);
  const clavL = cabin(scene, "clavL", thorax, { len: 0.16, r: 0.032, x: -0.12, y: 0.08, rgb: SKIN, rotZ: Math.PI / 2, window: false }).hull;
  const clavR = cabin(scene, "clavR", thorax, { len: 0.16, r: 0.032, x: 0.12, y: 0.08, rgb: SKIN, rotZ: Math.PI / 2, window: false }).hull;

  const neck = node(scene, "neck", thorax);
  neck.position.y = 0.28;
  const neckM = cabin(scene, "neckM", neck, { len: 0.1, r: 0.04, y: 0.04, rgb: SKIN }).hull;
  const head = node(scene, "head", neck);
  head.position.y = 0.16;
  const headM = cabin(scene, "headM", head, { len: 0.18, r: 0.09, y: 0.08, rgb: INTENT, lamp: true }).hull;
  const gaze = headM;

  const leftArm = arm(scene, "L", shoulderL);
  const rightArm = arm(scene, "R", shoulderR);
  const leftLeg = leg(scene, "L", hips);
  const rightLeg = leg(scene, "R", hips);

  const shell = makeBodyShell(scene, {
    hips, thorax, neck, head, leftArm, rightArm, leftLeg, rightLeg,
  });

  const groups = {
    breath: [chest, belly],
    rhythm: [heart, ...leftArm.pulse, ...rightArm.pulse, ...leftLeg.pulse, ...rightLeg.pulse],
    intent: [headM, gaze, neckM, pelvis, leftArm.meshes[2], rightArm.meshes[2]],
    rest: [clavL, clavR, ...leftArm.meshes.slice(0, 2), ...rightArm.meshes.slice(0, 2), ...leftLeg.meshes, ...rightLeg.meshes],
  };

  const baseEmissive = new Map();
  scene.meshes.forEach((mesh) => {
    if (mesh.material?.emissiveColor) {
      baseEmissive.set(mesh, mesh.material.emissiveColor.clone());
    }
  });

  return {
    root,
    hips,
    thorax,
    chest,
    belly,
    heart,
    neck,
    head,
    shoulderL,
    shoulderR,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    clavL,
    clavR,
    shell,
    groups,
    baseEmissive,
    readouts: { breath: "—", rhythm: "—", intent: "—" },
  };
}

function shellMesh(mesh) {
  mesh._somaShell = true;
  return mesh;
}

function makeBodyShell(scene, rig) {
  const a = 0.88;
  const head = cabin(scene, "shellHead", rig.head, { len: 0.2, r: 0.1, y: 0.08, rgb: SKIN_SHELL, alpha: a, lamp: true });
  const earL = cabin(scene, "shellEarL", rig.head, { len: 0.06, r: 0.024, x: -0.1, y: 0.08, rgb: SKIN_SHELL, alpha: a, rotZ: Math.PI / 2, window: false });
  const earR = cabin(scene, "shellEarR", rig.head, { len: 0.06, r: 0.024, x: 0.1, y: 0.08, rgb: SKIN_SHELL, alpha: a, rotZ: Math.PI / 2, window: false });
  const hair = cabin(scene, "shellHair", rig.head, { len: 0.16, r: 0.092, y: 0.14, z: -0.02, rgb: [0.22, 0.16, 0.14], alpha: a, window: false });
  const neck = cabin(scene, "shellNeck", rig.neck, { len: 0.12, r: 0.052, y: 0.04, rgb: SKIN_SHELL, alpha: a });
  const torso = cabin(scene, "shellTorso", rig.thorax, { len: 0.34, r: 0.16, y: 0.06, z: 0.02, rgb: SHIRT, alpha: a });
  const mid = cabin(scene, "shellMid", rig.hips, { len: 0.24, r: 0.13, y: 0.16, z: 0.02, rgb: SHIRT, alpha: a });
  const hips = cabin(scene, "shellHips", rig.hips, { len: 0.2, r: 0.12, y: -0.02, rgb: PANTS, alpha: a, rotZ: Math.PI / 2 });
  const sleeveL = cabin(scene, "shellSleeveL", rig.leftArm.upper, { len: 0.3, r: 0.064, y: -0.14, rgb: SHIRT, alpha: a });
  const sleeveR = cabin(scene, "shellSleeveR", rig.rightArm.upper, { len: 0.3, r: 0.064, y: -0.14, rgb: SHIRT, alpha: a });
  const foreL = cabin(scene, "shellForeL", rig.leftArm.elbow, { len: 0.27, r: 0.05, y: -0.13, rgb: SKIN_SHELL, alpha: a });
  const foreR = cabin(scene, "shellForeR", rig.rightArm.elbow, { len: 0.27, r: 0.05, y: -0.13, rgb: SKIN_SHELL, alpha: a });
  const handL = cabin(scene, "shellHandL", rig.leftArm.elbow, { len: 0.09, r: 0.04, y: -0.28, rgb: SKIN_SHELL, alpha: a, window: false });
  const handR = cabin(scene, "shellHandR", rig.rightArm.elbow, { len: 0.09, r: 0.04, y: -0.28, rgb: SKIN_SHELL, alpha: a, window: false });
  const thighL = cabin(scene, "shellThighL", rig.leftLeg.hip, { len: 0.4, r: 0.08, y: -0.2, rgb: PANTS, alpha: a });
  const thighR = cabin(scene, "shellThighR", rig.rightLeg.hip, { len: 0.4, r: 0.08, y: -0.2, rgb: PANTS, alpha: a });
  const shinL = cabin(scene, "shellShinL", rig.leftLeg.knee, { len: 0.42, r: 0.06, y: -0.2, rgb: SKIN_SHELL, alpha: a });
  const shinR = cabin(scene, "shellShinR", rig.rightLeg.knee, { len: 0.42, r: 0.06, y: -0.2, rgb: SKIN_SHELL, alpha: a });
  const meshes = [head, earL, earR, hair, neck, torso, mid, hips, sleeveL, sleeveR, foreL, foreR, handL, handR, thighL, thighR, shinL, shinR]
    .flatMap((car) => car.bits)
    .map(shellMesh);
  return { meshes, torso: torso.hull, mid: mid.hull };
}

function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}

function breathWave(time, rate, hold) {
  const cpm = Math.max(4, rate);
  const cycle = (time * cpm / 60) % 1;
  const holdSpan = clamp(hold, 0, 0.35);
  const inEnd = 0.38;
  const holdEnd = inEnd + holdSpan;
  if (cycle < inEnd) {
    const u = cycle / inEnd;
    return { inhale: u * u * (3 - 2 * u), phase: "inhalando", cycle };
  }
  if (cycle < holdEnd) return { inhale: 1, phase: "pausando", cycle };
  const u = (cycle - holdEnd) / Math.max(0.08, 1 - holdEnd);
  return { inhale: 1 - u * u * (3 - 2 * u), phase: "soltando", cycle };
}

function beatWave(time, bpm) {
  const cycle = (time * Math.max(32, bpm) / 60) % 1;
  const lub = Math.exp(-(((cycle - 0.1) / 0.045) ** 2));
  const dub = Math.exp(-(((cycle - 0.24) / 0.032) ** 2)) * 0.55;
  const beat = lub + dub;
  return { beat, cycle, phase: beat > 0.35 ? "sístole" : "diástole" };
}

function pulseAt(cycle, delay) {
  const u = cycle - delay;
  if (u < 0 || u > 0.4) return 0;
  return Math.exp(-(((u - 0.08) / 0.05) ** 2));
}

function dimGroups(figure, solo, hover) {
  const focus = hover || (solo === "all" ? null : solo);
  const all = [...figure.groups.breath, ...figure.groups.rhythm, ...figure.groups.intent, ...figure.groups.rest];
  const seen = new Set();
  for (const mesh of all) {
    if (!mesh.material || mesh._somaShell || seen.has(mesh)) continue;
    seen.add(mesh);
    const base = figure.baseEmissive.get(mesh);
    const inFocus = !focus
      || figure.groups[focus]?.includes(mesh)
      || (focus === "rhythm" && mesh === figure.heart);
    const k = inFocus ? 1 : 0.22;
    mesh.material.alpha = mesh === figure.chest ? (inFocus ? 0.5 : 0.18) : (mesh.material.alpha < 1 ? mesh.material.alpha : 1);
    if (base) {
      mesh.material.emissiveColor.set(base.r * k, base.g * k, base.b * k);
    }
    if (mesh.material.diffuseColor) {
      const d = mesh.material.diffuseColor;
      if (!mesh._somaDiff) mesh._somaDiff = d.clone();
      const src = mesh._somaDiff;
      const mix = inFocus ? 1 : 0.35;
      d.set(
        src.r * mix + 0.2 * (1 - mix),
        src.g * mix + 0.18 * (1 - mix),
        src.b * mix + 0.18 * (1 - mix),
      );
    }
    for (const child of mesh.getChildren?.() || []) {
      if (!child.material?.diffuseColor) continue;
      if (!child._somaDiff) child._somaDiff = child.material.diffuseColor.clone();
      const src = child._somaDiff;
      const mix = inFocus ? 1 : 0.35;
      child.material.diffuseColor.set(
        src.r * mix + 0.2 * (1 - mix),
        src.g * mix + 0.18 * (1 - mix),
        src.b * mix + 0.18 * (1 - mix),
      );
    }
  }
}

function holdWave(phase, pop = 0.55) {
  const s = Math.sin(phase);
  return Math.sign(s) * (Math.abs(s) ** pop);
}

function applyHumanMotion(figure, state, time, { breathOn, intentOn, chestAmt, yaw, pitch, search }) {
  const actOn = state.activity?.on ? 1 : 0;
  const reach = state.intent.reach * intentOn;
  const lean = state.intent.lean * intentOn;
  const rock = holdWave(time * 1.15, 0.7);

  figure.root.scaling.setAll(1);
  figure.shoulderL.position.set(-0.2, 0.1, 0.02);
  figure.shoulderR.position.set(0.2, 0.1, 0.02);
  figure.shoulderL.rotation.set(0, 0, 0);
  figure.shoulderR.rotation.set(0, 0, 0);
  if (figure.clavL) figure.clavL.position.y = 0.1;
  if (figure.clavR) figure.clavR.position.y = 0.1;

  figure.head.rotation.y = (-yaw + search * 0.12 * holdWave(time * 1.3, 0.65)) * intentOn;
  figure.head.rotation.x = -(pitch + 0.02 + search * 0.05 * Math.sin(time * 1.6)) * intentOn;
  figure.neck.rotation.x = -0.02;

  const restX = -0.06 - reach * 0.3;
  const restZ = 0.1;
  const restElbow = 0.22 + reach * 0.08;
  figure.leftArm.upper.rotation.set(restX + rock * 0.05 * (1 - actOn), 0, restZ);
  figure.rightArm.upper.rotation.set(restX - rock * 0.05 * (1 - actOn), 0, -restZ);
  figure.leftArm.elbow.rotation.set(restElbow, 0, 0);
  figure.rightArm.elbow.rotation.set(restElbow, 0, 0);

  figure.leftLeg.hip.rotation.x = -0.02;
  figure.rightLeg.hip.rotation.x = -0.02;
  figure.leftLeg.knee.rotation.x = 0.08;
  figure.rightLeg.knee.rotation.x = 0.08;
  figure.hips.rotation.set(0, -yaw * 0.14 * intentOn, lean * 0.2 + rock * 0.08 * (1 - actOn));
  figure.thorax.rotation.set(-0.04 - reach * 0.12 - chestAmt * 0.03 * breathOn, 0, 0);
  figure.hips.position.y = 0.92 + Math.abs(rock) * 0.012 * (1 - actOn);

  if (!actOn) {
    const squash = 1 - 0.05 * chestAmt * breathOn;
    figure.root.scaling.set(1 + (1 - squash) * 0.6, squash, 1 + (1 - squash) * 0.6);
    return;
  }

  const cadence = 1.15 + (state.activity?.speed ?? 0.55) * 2.2;
  const phase = time * cadence;
  const left = holdWave(phase, 0.5);
  const right = holdWave(phase + Math.PI, 0.5);
  const passing = Math.abs(Math.sin(phase)) ** 1.8;
  const contact = Math.abs(Math.cos(phase)) ** 2.2;
  const leftUp = Math.max(0, holdWave(phase, 0.6));
  const rightUp = Math.max(0, holdWave(phase + Math.PI, 0.6));

  figure.root.scaling.set(1 + 0.1 * contact - 0.04 * passing, 1 - 0.12 * contact + 0.1 * passing, 1 + 0.1 * contact - 0.04 * passing);
  figure.hips.position.y = 0.92 + 0.07 * passing - 0.04 * contact;
  figure.hips.rotation.z = lean * 0.12 + left * 0.14;
  figure.hips.rotation.y = -yaw * 0.1 * intentOn - left * 0.1;
  figure.thorax.rotation.x = -0.08 - reach * 0.08 - 0.06 * passing;
  figure.thorax.rotation.y = -left * 0.12;
  figure.thorax.rotation.z = -left * 0.06;
  figure.head.rotation.x += 0.1 * passing - 0.08 * contact;
  figure.head.rotation.z = -left * 0.08;
  figure.neck.rotation.x = -0.04 * passing;

  figure.leftLeg.hip.rotation.x = -left * 0.62;
  figure.rightLeg.hip.rotation.x = -right * 0.62;
  figure.leftLeg.knee.rotation.x = 0.06 + leftUp * 0.72 + contact * 0.08;
  figure.rightLeg.knee.rotation.x = 0.06 + rightUp * 0.72 + contact * 0.08;

  figure.leftArm.upper.rotation.x = restX + left * 0.62;
  figure.rightArm.upper.rotation.x = restX + right * 0.62;
  figure.leftArm.elbow.rotation.x = restElbow + Math.max(0, left) * 0.4;
  figure.rightArm.elbow.rotation.x = restElbow + Math.max(0, right) * 0.4;
  figure.leftArm.upper.rotation.z = restZ;
  figure.rightArm.upper.rotation.z = -restZ;

  figure.shoulderL.position.y = 0.1 + 0.04 * passing;
  figure.shoulderR.position.y = 0.1 + 0.04 * passing;
}

export function tickSomaFigure(figure, state, time) {
  const solo = state.solo || "all";
  dimGroups(figure, solo, state.hover);
  const breathOn = solo === "all" || solo === "breath" ? 1 : 0.06;
  const rhythmOn = solo === "all" || solo === "rhythm" ? 1 : 0.06;
  const intentOn = solo === "all" || solo === "intent" ? 1 : 0.06;

  const b = breathWave(time, state.breath.rate, state.breath.hold);
  const chestAmt = b.inhale * state.breath.amp * (1 - state.breath.center);
  const bellyAmt = b.inhale * state.breath.amp * state.breath.center;
  figure.chest.scaling.set(
    1 + 0.1 * chestAmt * breathOn,
    1 + 0.16 * chestAmt * breathOn,
    1 + 0.14 * chestAmt * breathOn,
  );
  figure.belly.scaling.set(
    1 + 0.16 * bellyAmt * breathOn,
    1 + 0.2 * bellyAmt * breathOn,
    1 + 0.18 * bellyAmt * breathOn,
  );
  applyHumanMotion(figure, state, time, {
    breathOn, intentOn, chestAmt,
    yaw: (state.intent.yaw * Math.PI) / 180,
    pitch: (state.intent.pitch * Math.PI) / 180,
    search: state.intent.search,
  });
  if (figure.chest.material?.emissiveColor) {
    const e = 0.08 + 0.22 * chestAmt * breathOn;
    figure.chest.material.emissiveColor.set(BREATH[0] * e, BREATH[1] * e, BREATH[2] * e);
  }

  const r = beatWave(time, state.rhythm.bpm);
  const force = state.rhythm.force * rhythmOn;
  const hs = 1 + 0.55 * r.beat * force;
  figure.heart.scaling.setAll(hs);
  if (figure.heart.material?.emissiveColor) {
    const e = 0.12 + 0.85 * r.beat * force;
    figure.heart.material.emissiveColor.set(RHYTHM[0] * e, RHYTHM[1] * e, RHYTHM[2] * e);
  }
  const travel = state.rhythm.travel;
  const applyPulse = (mesh, delay) => {
    const p = pulseAt(r.cycle, delay * (0.15 + 0.55 * travel)) * force * travel;
    if (!mesh.material?.emissiveColor) return;
    const base = figure.baseEmissive.get(mesh);
    mesh.material.emissiveColor.set(
      (base?.r || 0.05) + RHYTHM[0] * 0.7 * p,
      (base?.g || 0.04) + RHYTHM[1] * 0.7 * p,
      (base?.b || 0.04) + RHYTHM[2] * 0.7 * p,
    );
  };
  applyPulse(figure.leftArm.pulse[0], 1);
  applyPulse(figure.rightArm.pulse[0], 1);
  applyPulse(figure.leftArm.pulse[1], 1.6);
  applyPulse(figure.rightArm.pulse[1], 1.6);
  applyPulse(figure.leftArm.pulse[2], 2.1);
  applyPulse(figure.rightArm.pulse[2], 2.1);
  applyPulse(figure.leftLeg.pulse[0], 1.3);
  applyPulse(figure.rightLeg.pulse[0], 1.3);
  applyPulse(figure.leftLeg.pulse[1], 2);

  const shellOn = Boolean(state.shell?.on);
  const shellA = clamp(state.shell?.opacity ?? 0.88, 0.12, 1);
  for (const mesh of figure.shell.meshes) {
    mesh.isVisible = shellOn;
    if (mesh.material) mesh.material.alpha = shellA;
  }
  if (shellOn) {
    const breathLift = 1 + 0.06 * chestAmt * breathOn;
    figure.shell.torso.scaling.set(0.92 * breathLift, 1.05 * breathLift, 0.72 * breathLift);
    figure.shell.mid.scaling.set(1.05 * (1 + 0.08 * bellyAmt * breathOn), 0.85 * (1 + 0.1 * bellyAmt * breathOn), 0.78);
  }

  figure.readouts.breath = `${b.phase} · ${Math.round(b.inhale * 100)}% · ${state.breath.rate.toFixed(0)} cpm`;
  figure.readouts.rhythm = `${r.phase} · ${state.rhythm.bpm.toFixed(0)} bpm`;
  figure.readouts.intent = `mira ${state.intent.yaw.toFixed(0)}° · inclina ${state.intent.lean.toFixed(2)} · alcanza ${state.intent.reach.toFixed(2)}`;
}

export function createSomaStudio(BABYLON, engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.1, 0.07, 0.08, 1);
  scene.ambientColor = new BABYLON.Color3(0.35, 0.28, 0.28);

  const camera = new BABYLON.ArcRotateCamera("cam", Math.PI / 2.15, 1.22, 3.35, new BABYLON.Vector3(0, 0.95, 0), scene);
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 2.1;
  camera.upperRadiusLimit = 5.4;
  camera.wheelPrecision = 40;
  camera.minZ = 0.05;

  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0.2, 1, 0.15), scene);
  hemi.intensity = 0.72;
  hemi.groundColor = new BABYLON.Color3(0.18, 0.1, 0.1);
  const key = new BABYLON.DirectionalLight("key", new BABYLON.Vector3(-0.2, -0.85, -0.4), scene);
  key.intensity = 0.85;
  key.position = new BABYLON.Vector3(1.4, 4.2, 2.6);

  const ground = BABYLON.MeshBuilder.CreateDisc("ground", { radius: 1.35, tessellation: 36 }, scene);
  ground.rotation.x = Math.PI / 2;
  const gmat = new BABYLON.StandardMaterial("gmat", scene);
  gmat.diffuseColor = new BABYLON.Color3(0.16, 0.12, 0.12);
  gmat.specularColor = new BABYLON.Color3(0, 0, 0);
  ground.material = gmat;

  const figure = createSomaFigure(BABYLON, scene);
  return { scene, camera, figure };
}
