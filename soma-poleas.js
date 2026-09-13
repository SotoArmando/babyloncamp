export const PULLEY_SLIDERS = [
  { id: "spine", label: "Columna", hint: "Cada vértebra se sienta o se apila en un palo." },
  { id: "neck", label: "Cuello", hint: "Polea invertida: halar manda la cabeza atrás.", invert: true },
  { id: "shoulder", label: "Hombro", hint: "Brazo en la línea del tronco, o se sienta aparte.", pair: true },
  { id: "elbow", label: "Codo", hint: "Antebrazo en línea, o se sienta sobre el brazo.", pair: true },
  { id: "wrist", label: "Muñeca", hint: "Palma en línea, o la mano se sienta.", pair: true },
  { id: "thumb", label: "Pulgar", hint: "El pulgar en línea, o se sienta sobre sí.", pair: true },
  { id: "index", label: "Índice", hint: "Falanges en vara, o se sientan una sobre otra.", pair: true },
  { id: "middle", label: "Medio", hint: "Falanges en vara, o se sientan una sobre otra.", pair: true },
  { id: "ring", label: "Anular", hint: "Falanges en vara, o se sientan una sobre otra.", pair: true },
  { id: "pinky", label: "Meñique", hint: "Falanges en vara, o se sientan una sobre otra.", pair: true },
  { id: "hip", label: "Cadera", hint: "Muslo bajo el tronco, o se sienta.", pair: true },
  { id: "knee", label: "Rodilla", hint: "Pierna estirada, o la canilla se sienta bajo el muslo.", pair: true },
  { id: "ankle", label: "Tobillo", hint: "Pie en la línea de la canilla, o se sienta.", pair: true },
];

export const CASCO_AXES = ["X", "Y", "Z"];

const DEFAULT_TURN = { X: 0.7, Y: 0.7, Z: 0.7 };

export const CASCO_GROUPS = [
  {
    id: "cascoShoulder",
    label: "Casco hombro",
    hint: "X lleva el brazo adelante, atrás y hasta arriba. Y lo tuerce. Z lo abre al lado.",
    pair: true,
    turn: { X: 3.14, Y: 1.55, Z: 1.45 },
  },
  {
    id: "cascoHip",
    label: "Casco cadera",
    hint: "La cadera también es bola: X adelanta o echa la pierna atrás; Y y Z menos que el hombro.",
    pair: true,
    turn: { X: 1.35, Y: 1.05, Z: 0.85 },
  },
  {
    id: "cascoNape",
    label: "Casco nuca",
    hint: "Entre nuca y cabeza. Gira en 3D; la cabeza va sujeta.",
    turn: { X: 0.85, Y: 1.15, Z: 0.65 },
  },
  {
    id: "cascoBase",
    label: "Casco base",
    hint: "En la base de la columna. Gira en 3D; el tronco va sujeto.",
    turn: { X: 0.7, Y: 0.95, Z: 0.45 },
  },
  {
    id: "cascoWrist",
    label: "Casco muñeca",
    hint: "Polea chica en la muñeca. Gira en 3D; la mano va sujeta.",
    pair: true,
    turn: { X: 1.05, Y: 1.4, Z: 0.7 },
  },
  {
    id: "cascoSole",
    label: "Casco suela",
    hint: "Polea chica en la suela. Gira en 3D; el pie va sujeto.",
    pair: true,
    turn: { X: 0.65, Y: 0.5, Z: 0.4 },
  },
];

export const BODY_ZONES = [
  { id: "head", label: "Cabeza", cascos: ["cascoNape"], pulleys: ["neck"] },
  { id: "spine", label: "Columna", cascos: [], pulleys: ["spine"] },
  { id: "base", label: "Base", cascos: ["cascoBase"], pulleys: [] },
  { id: "shoulderL", label: "Hombro izquierdo", side: "L", cascos: ["cascoShoulder"], pulleys: ["shoulder"] },
  { id: "shoulderR", label: "Hombro derecho", side: "R", cascos: ["cascoShoulder"], pulleys: ["shoulder"] },
  { id: "elbowL", label: "Codo izquierdo", side: "L", cascos: [], pulleys: ["elbow"] },
  { id: "elbowR", label: "Codo derecho", side: "R", cascos: [], pulleys: ["elbow"] },
  { id: "handL", label: "Mano izquierda", side: "L", cascos: ["cascoWrist"], pulleys: ["wrist", "thumb", "index", "middle", "ring", "pinky"] },
  { id: "handR", label: "Mano derecha", side: "R", cascos: ["cascoWrist"], pulleys: ["wrist", "thumb", "index", "middle", "ring", "pinky"] },
  { id: "hipL", label: "Cadera izquierda", side: "L", cascos: ["cascoHip"], pulleys: ["hip"] },
  { id: "hipR", label: "Cadera derecha", side: "R", cascos: ["cascoHip"], pulleys: ["hip"] },
  { id: "kneeL", label: "Rodilla izquierda", side: "L", cascos: [], pulleys: ["knee"] },
  { id: "kneeR", label: "Rodilla derecha", side: "R", cascos: [], pulleys: ["knee"] },
  { id: "footL", label: "Pie izquierdo", side: "L", cascos: ["cascoSole"], pulleys: ["ankle"] },
  { id: "footR", label: "Pie derecho", side: "R", cascos: ["cascoSole"], pulleys: ["ankle"] },
];

export const ANATOMY_PARTS = [
  { id: "scale", label: "Escala", hint: "Todo el cuerpo a la vez. Las proporciones no cambian.", min: 0.6, max: 1.7, def: 1 },
  { id: "head", label: "Cabeza", hint: "El cráneo, aparte del cuello.", min: 0.55, max: 1.85, def: 1.02 },
  { id: "neck", label: "Cuello", hint: "Largo del palo que sostiene la cabeza.", min: 0.5, max: 1.8, def: 1.06 },
  { id: "chest", label: "Torso", hint: "Largo de la columna y el pecho, sin las piernas.", min: 0.6, max: 1.7, def: 0.96 },
  { id: "bust", label: "Pecho", hint: "Volumen del busto. No alarga el torso.", min: 0.45, max: 1.9, def: 1.12 },
  { id: "waist", label: "Cintura", hint: "El estrecho entre pecho y cadera.", min: 0.5, max: 1.7, def: 0.82 },
  { id: "belly", label: "Vientre", hint: "Adelante, bajo la cintura.", min: 0.4, max: 1.9, def: 0.92 },
  { id: "hip", label: "Cadera", hint: "Volumen de la cadera. También hincha las montañas de atrás.", min: 0.5, max: 1.85, def: 1.18 },
  { id: "glute", label: "Nalgas", hint: "Dos lomas. Bajo, una almohada; alto, más partidas.", min: 0.4, max: 1.9, def: 1.02 },
  { id: "gluteRise", label: "Arranque", hint: "Desde qué tan arriba empiezan las nalgas. Alto, suben por la espalda baja.", min: 0.5, max: 1.8, def: 1.24 },
  { id: "gluteH", label: "Altura", hint: "Hasta dónde llega la punta. En cero las nalgas quedan planas.", min: 0, max: 1.9, def: 1 },
  { id: "gluteFill", label: "Relleno", hint: "Rellena cada esfera. Alto, más blanda y con boing.", min: 0, max: 1.9, def: 1 },
  { id: "pelvisH", label: "Asiento", hint: "Alto de pelvis y nalgas. Las alarga para no pegarlas a las piernas todavía.", min: 0.7, max: 1.85, def: 1.24 },
  { id: "hair", label: "Pelo", hint: "El volumen del corte.", min: 0.4, max: 1.8, def: 1.05 },
  { id: "shoulderW", label: "Ancho de hombros", hint: "Separación de los brazos. No es altura.", min: 0.55, max: 1.8, def: 0.9 },
  { id: "upper", label: "Brazo", hint: "Del hombro al codo.", min: 0.5, max: 1.9, def: 1 },
  { id: "fore", label: "Antebrazo", hint: "Del codo a la muñeca.", min: 0.5, max: 1.9, def: 1 },
  { id: "hand", label: "Mano", hint: "Palma, aparte de los dedos.", min: 0.55, max: 1.8, def: 1 },
  { id: "finger", label: "Dedos", hint: "Falanges. Sirve para manos largas o cortas.", min: 0.5, max: 1.9, def: 1 },
  { id: "hipW", label: "Ancho de cadera", hint: "Separación de las piernas.", min: 0.55, max: 1.8, def: 1.06 },
  { id: "thigh", label: "Muslo", hint: "De la cadera a la rodilla.", min: 0.5, max: 1.9, def: 1.06 },
  { id: "shin", label: "Canilla", hint: "De la rodilla al tobillo.", min: 0.5, max: 1.9, def: 1 },
  { id: "foot", label: "Pie", hint: "Largo de la suela.", min: 0.5, max: 1.8, def: 1 },
];

export const ANATOMY_PRESETS = [
  { id: "humano", name: "Humano", hint: "Silueta de mujer: hombros más estrechos que la cadera.", values: { head: 1.02, neck: 1.06, chest: 0.96, bust: 1.12, waist: 0.82, belly: 0.92, hip: 1.18, glute: 1.02, gluteRise: 1.24, gluteH: 1, gluteFill: 1, pelvisH: 1.24, hipW: 1.06, shoulderW: 0.9, thigh: 1.06, hair: 1.05 } },
  { id: "alto", name: "Alto", hint: "Piernas y cuello largos, cabeza chica.", values: { head: 0.8, neck: 1.2, chest: 0.95, thigh: 1.22, shin: 1.2, upper: 1.1, fore: 1.08 } },
  { id: "bajo", name: "Bajo", hint: "Piernas cortas, tronco y cabeza más presentes.", values: { head: 1.22, neck: 0.78, chest: 1.12, hipW: 1.18, shoulderW: 1.12, thigh: 0.76, shin: 0.74, upper: 0.92, fore: 0.9 } },
  { id: "ancho", name: "Ancho", hint: "Hombros y cadera más abiertos. La altura no cambia.", values: { shoulderW: 1.42, hipW: 1.35, chest: 1.08, neck: 0.88, hip: 1.18 } },
  { id: "curvy", name: "Curvy", hint: "Pecho y cadera presentes, cintura estrecha.", values: { bust: 1.38, waist: 0.78, hip: 1.32, glute: 1.18, gluteRise: 1.36, gluteH: 1.22, gluteFill: 1.28, pelvisH: 1.32, belly: 0.92, hipW: 1.12 } },
  { id: "delgada", name: "Delgada", hint: "Poco volumen. Las longitudes no cambian.", values: { bust: 0.78, waist: 0.82, hip: 0.8, glute: 0.72, gluteRise: 1.08, gluteH: 0.78, gluteFill: 0.7, pelvisH: 1.1, belly: 0.7, hipW: 0.92, shoulderW: 0.94 } },
  { id: "largo", name: "Brazos largos", hint: "Brazos y dedos más largos que el resto.", values: { upper: 1.38, fore: 1.3, hand: 1.12, finger: 1.2 } },
];

export function defaultAnatomy() {
  const anatomy = {};
  for (const part of ANATOMY_PARTS) anatomy[part.id] = part.def;
  return anatomy;
}

function anatomyValue(anatomy, id) {
  const part = ANATOMY_PARTS.find((item) => item.id === id);
  const n = Number(anatomy?.[id]);
  if (!Number.isFinite(n)) return part?.def ?? 1;
  return Math.min(part?.max ?? 2, Math.max(part?.min ?? 0.4, n));
}

export function applyAnatomyPreset(anatomy, presetId) {
  const preset = ANATOMY_PRESETS.find((item) => item.id === presetId) || ANATOMY_PRESETS[0];
  const keepScale = anatomyValue(anatomy, "scale");
  const next = defaultAnatomy();
  Object.assign(next, preset.values || {});
  if (preset.values?.scale == null) next.scale = keepScale;
  for (const key of Object.keys(next)) anatomy[key] = next[key];
  return anatomy;
}

export function applyAnatomy(figure, anatomy) {
  if (!figure?.hips) return;
  const scale = anatomyValue(anatomy, "scale");
  const part = (id) => anatomyValue(anatomy, id) * scale;
  const head = part("head");
  const neck = part("neck");
  const chest = part("chest");
  const shoulderW = part("shoulderW");
  const upper = part("upper");
  const fore = part("fore");
  const hand = part("hand");
  const finger = part("finger");
  const hipW = part("hipW");
  const thigh = part("thigh");
  const shin = part("shin");
  const foot = part("foot");
  const bust = part("bust");
  const waist = part("waist");
  const belly = part("belly");
  const hip = part("hip");
  const glute = anatomyValue(anatomy, "glute");
  const gluteRise = anatomyValue(anatomy, "gluteRise");
  const gluteH = anatomyValue(anatomy, "gluteH");
  const gluteFill = anatomyValue(anatomy, "gluteFill");
  const pelvisH = anatomyValue(anatomy, "pelvisH");
  const hair = part("hair");

  const lens = {
    spine1: 0.11 * chest,
    spine2: 0.12 * chest,
    chest: 0.13 * chest,
    neck: 0.13 * neck,
    head: 0.155 * head,
    upper: 0.27 * upper,
    fore: 0.25 * fore,
    hand: 0.075 * hand,
    thigh: 0.42 * thigh,
    shin: 0.4 * shin,
    ankle: 0.075 * scale,
    foot: 0.15 * foot,
  };

  figure.hips.position.y = lens.thigh + lens.shin + lens.ankle + 0.04;
  figure.spine1.position.y = lens.spine1;
  figure.spine2.position.y = lens.spine2;
  figure.chest.position.y = lens.chest;
  figure.neck.position.y = 0.1 * chest;
  figure.cascos.nape.visuals[0].root.position.y = 0.075 * neck;
  figure.head.position.y = 0.1 * head;
  figure.cascos.shoulder.visuals[0].root.position.set(-0.122 * shoulderW, 0.068 * chest, 0.02 * chest);
  figure.cascos.shoulder.visuals[1].root.position.set(0.122 * shoulderW, 0.068 * chest, 0.02 * chest);
  figure.cascos.hip.visuals[0].root.position.set(-0.142 * hipW, -0.012 * scale, 0.01 * scale);
  figure.cascos.hip.visuals[1].root.position.set(0.142 * hipW, -0.012 * scale, 0.01 * scale);
  figure.cascos.wrist.visuals[0].root.position.set(0, -0.02 * hand, 0);
  figure.cascos.wrist.visuals[1].root.position.set(0, -0.02 * hand, 0);

  figure.elbowL.position.y = -lens.upper;
  figure.elbowR.position.y = -lens.upper;
  figure.wristL.position.y = -lens.fore;
  figure.wristR.position.y = -lens.fore;
  figure.kneeL.position.y = -lens.thigh;
  figure.kneeR.position.y = -lens.thigh;
  figure.ankleL.position.y = -lens.shin;
  figure.ankleR.position.y = -lens.shin;
  figure.cascos.sole.visuals[0].root.position.set(0, -0.02 * scale, 0.05 * foot);
  figure.cascos.sole.visuals[1].root.position.set(0, -0.02 * scale, 0.05 * foot);

  for (const item of FINGER_LAYOUT) {
    for (const handSide of [figure.handL, figure.handR]) {
      const segs = handSide[item.id];
      segs.forEach((seg, i) => {
        seg.len = item.lengths[i] * finger;
        if (i === 0) {
          const ox = handSide === figure.handR ? -item.origin.x : item.origin.x;
          seg.joint.position.set(ox * hand, item.origin.y * hand, item.origin.z * hand);
        } else {
          seg.joint.position.y = -item.lengths[i - 1] * finger;
        }
      });
    }
  }

  const byJoint = new Map();
  for (const item of FINGER_LAYOUT) {
    for (const handSide of [figure.handL, figure.handR]) {
      for (const seg of handSide[item.id]) byJoint.set(seg.joint, seg.len);
    }
  }
  for (const bone of figure.bones) {
    if (byJoint.has(bone.joint)) bone.len = byJoint.get(bone.joint);
    else if (bone.part && lens[bone.part] != null) bone.len = lens[bone.part];
  }

  applyWomanFlesh(figure, {
    scale, head, neck, chest, shoulderW, hipW, hand, finger, foot,
    bust, waist, belly, hip, glute, gluteRise, gluteH, gluteFill, pelvisH, hair, lens,
  });
}

export function defaultPulleyState() {
  const state = {};
  for (const item of PULLEY_SLIDERS) {
    if (item.pair) {
      state[item.id + "L"] = 0.35;
      state[item.id + "R"] = 0.35;
    } else {
      state[item.id] = 0.35;
    }
  }
  for (const item of CASCO_GROUPS) {
    const sides = item.pair ? ["L", "R"] : [""];
    for (const side of sides) {
      for (const axis of CASCO_AXES) state[item.id + side + axis] = 0;
    }
  }
  return state;
}

export function snapshotPulleyPose(state, name = "") {
  const sliders = {};
  const base = defaultPulleyState();
  for (const key of Object.keys(base)) {
    const n = Number(state[key]);
    sliders[key] = Number.isFinite(n) ? n : base[key];
  }
  return {
    kind: "soma-poleas-pose",
    version: 1,
    name: String(name || "").trim() || "pose",
    saved: new Date().toISOString(),
    sliders,
  };
}

export function applyPulleyPose(state, pose) {
  const incoming = pose && typeof pose === "object" ? pose.sliders || pose.state || pose : {};
  const base = defaultPulleyState();
  for (const key of Object.keys(base)) {
    const n = Number(incoming[key]);
    state[key] = Number.isFinite(n) ? n : base[key];
  }
  return state;
}

function lineSliders(extra = {}) {
  const sliders = defaultPulleyState();
  for (const key of Object.keys(sliders)) {
    if (!key.startsWith("casco")) sliders[key] = 1;
  }
  return { ...sliders, ...extra };
}

export const BUILT_IN_POSES = [
  {
    id: "sentado",
    name: "sentado",
    hint: "Poleas a medias: el cuerpo se sienta sobre sí.",
    sliders: defaultPulleyState(),
  },
  {
    id: "de-pie",
    name: "de pie",
    hint: "Todo en línea, brazos caídos.",
    sliders: lineSliders(),
  },
  {
    id: "vitruvio",
    name: "vitruvio",
    hint: "Leonardo: brazos abiertos, piernas en V, palmas al frente.",
    sliders: lineSliders({
      cascoShoulderLZ: -1,
      cascoShoulderRZ: 1,
      cascoShoulderLX: -0.18,
      cascoShoulderRX: -0.18,
      cascoHipLZ: -0.55,
      cascoHipRZ: 0.55,
      cascoWristLY: 0.45,
      cascoWristRY: -0.45,
    }),
  },
  {
    id: "te",
    name: "T",
    hint: "Brazos en cruz, piernas juntas. La vara de medir.",
    sliders: lineSliders({
      cascoShoulderLZ: -0.92,
      cascoShoulderRZ: 0.92,
    }),
  },
  {
    id: "brazos-en-v",
    name: "brazos en V",
    hint: "Brazos altos, como el círculo de Vitruvio.",
    sliders: lineSliders({
      cascoShoulderLZ: -1,
      cascoShoulderRZ: 1,
      cascoShoulderLX: -0.55,
      cascoShoulderRX: -0.55,
    }),
  },
  {
    id: "contrapposto",
    name: "contrapposto",
    hint: "Peso en una pierna, la otra blanda, hombros al contrario.",
    sliders: lineSliders({
      cascoBaseZ: 0.22,
      cascoHipLX: 0.12,
      cascoHipRX: -0.08,
      cascoHipLZ: -0.18,
      cascoHipRZ: 0.08,
      hipR: 0.72,
      kneeR: 0.55,
      cascoShoulderLZ: -0.12,
      cascoShoulderRZ: 0.22,
      cascoShoulderLY: 0.15,
      cascoShoulderRY: -0.1,
    }),
  },
  {
    id: "un-paso",
    name: "un paso",
    hint: "Una pierna adelante, el brazo contrario acompaña.",
    sliders: lineSliders({
      cascoHipLX: 0.42,
      cascoHipRX: -0.28,
      cascoShoulderLX: -0.38,
      cascoShoulderRX: 0.32,
      kneeR: 0.72,
    }),
  },
];

export function builtInPoseByFile(file) {
  const id = String(file || "").replace(/\.json$/i, "");
  return BUILT_IN_POSES.find((item) => item.id === id) || null;
}

export function mergePoseList(diskItems = []) {
  const map = new Map();
  for (const item of BUILT_IN_POSES) {
    map.set(item.id + ".json", {
      file: item.id + ".json",
      name: item.name,
      builtin: true,
      hint: item.hint,
    });
  }
  for (const item of diskItems) {
    const file = item.file;
    const prev = map.get(file) || {};
    map.set(file, {
      file,
      name: item.name || prev.name || file.replace(/\.json$/i, ""),
      saved: item.saved || null,
      builtin: Boolean(prev.builtin),
      hint: prev.hint || "",
    });
  }
  return [...map.values()].sort((a, b) => {
    const ai = BUILT_IN_POSES.findIndex((p) => p.id + ".json" === a.file);
    const bi = BUILT_IN_POSES.findIndex((p) => p.id + ".json" === b.file);
    if (ai !== -1 || bi !== -1) return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    return String(a.name).localeCompare(String(b.name), "es");
  });
}

function node(BABYLON, scene, name, parent, x = 0, y = 0, z = 0) {
  const t = new BABYLON.TransformNode(name, scene);
  if (parent) t.parent = parent;
  t.position.set(x, y, z);
  return t;
}

function color(BABYLON, hex) {
  return BABYLON.Color3.FromHexString(hex);
}

function makeLine(BABYLON, scene, name, col) {
  const z = BABYLON.Vector3.Zero();
  const mesh = BABYLON.MeshBuilder.CreateLines(name, { points: [z, z], updatable: true }, scene);
  mesh.color = col;
  mesh.isPickable = false;
  return mesh;
}

function updateLine(BABYLON, mesh, a, b) {
  BABYLON.MeshBuilder.CreateLines(mesh.name, {
    points: [a, b],
    instance: mesh,
    updatable: true,
  });
}

function makeRing(BABYLON, scene, name, col, radius = 0.048) {
  const pts = [];
  const n = 20;
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    pts.push(new BABYLON.Vector3(0, Math.cos(a) * radius, Math.sin(a) * radius));
  }
  const mesh = BABYLON.MeshBuilder.CreateLines(name, { points: pts }, scene);
  mesh.color = col;
  mesh.isPickable = false;
  return mesh;
}

function makeTick(BABYLON, scene, name, col) {
  return makeLine(BABYLON, scene, name, col);
}

const FINGER_LAYOUT = [
  { id: "thumb", lengths: [0.046, 0.036], origin: { x: -0.034, y: -0.016, z: 0.02 }, col: "#e0c898" },
  { id: "index", lengths: [0.05, 0.036, 0.028], origin: { x: -0.018, y: -0.044, z: 0.01 }, col: "#d8c090" },
  { id: "middle", lengths: [0.054, 0.04, 0.03], origin: { x: -0.002, y: -0.048, z: 0.008 }, col: "#d4b878" },
  { id: "ring", lengths: [0.048, 0.034, 0.026], origin: { x: 0.014, y: -0.045, z: 0.008 }, col: "#d8c090" },
  { id: "pinky", lengths: [0.04, 0.028, 0.022], origin: { x: 0.028, y: -0.038, z: 0.006 }, col: "#c8b070" },
];

function makeFinger(BABYLON, scene, parent, tag, origin, lengths) {
  const joints = [];
  let prev = parent;
  for (let i = 0; i < lengths.length; i += 1) {
    const j = node(
      BABYLON,
      scene,
      tag + i,
      prev,
      i === 0 ? origin.x : 0,
      i === 0 ? origin.y : -lengths[i - 1],
      i === 0 ? origin.z : 0,
    );
    joints.push({ joint: j, len: lengths[i] });
    prev = j;
  }
  return joints;
}

function makeCasco(BABYLON, scene, name, col, radius = 0.09) {
  const teeth = 16;
  const outer = [];
  for (let i = 0; i <= teeth; i += 1) {
    const a0 = (i / teeth) * Math.PI * 2;
    const a1 = ((i + 0.42) / teeth) * Math.PI * 2;
    const rIn = radius * 0.82;
    const rOut = radius * 1.08;
    outer.push(new BABYLON.Vector3(Math.cos(a0) * rIn, Math.sin(a0) * rIn, 0));
    outer.push(new BABYLON.Vector3(Math.cos(a0) * rOut, Math.sin(a0) * rOut, 0));
    outer.push(new BABYLON.Vector3(Math.cos(a1) * rOut, Math.sin(a1) * rOut, 0));
    outer.push(new BABYLON.Vector3(Math.cos(a1) * rIn, Math.sin(a1) * rIn, 0));
  }
  const rim = BABYLON.MeshBuilder.CreateLines(name + "-rim", { points: outer }, scene);
  rim.color = col;
  rim.isPickable = false;

  const groove = [];
  const n = 24;
  const rg = radius * 0.58;
  for (let i = 0; i <= n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    groove.push(new BABYLON.Vector3(Math.cos(a) * rg, Math.sin(a) * rg, 0));
  }
  const well = BABYLON.MeshBuilder.CreateLines(name + "-well", { points: groove }, scene);
  well.color = col;
  well.isPickable = false;

  const marker = makeLine(BABYLON, scene, name + "-mark", color(BABYLON, "#ffe08a"));
  const root = node(BABYLON, scene, name);
  rim.parent = root;
  well.parent = root;
  marker.parent = root;
  updateLine(BABYLON, marker, BABYLON.Vector3.Zero(), new BABYLON.Vector3(0, -radius * 0.85, 0));
  return { root, rim, well, marker, radius };
}

function paintMat(BABYLON, scene, name, rgb, opts = {}) {
  const mat = new BABYLON.StandardMaterial(name, scene);
  mat.diffuseColor = new BABYLON.Color3(rgb[0], rgb[1], rgb[2]);
  const shine = opts.shine ?? 0.16;
  mat.specularColor = new BABYLON.Color3(shine, shine * 0.85, shine * 0.75);
  mat.specularPower = opts.power ?? 40;
  mat.emissiveColor = new BABYLON.Color3(rgb[0] * 0.08, rgb[1] * 0.055, rgb[2] * 0.045);
  return mat;
}

function womanMats(BABYLON, scene) {
  return {
    skin: paintMat(BABYLON, scene, "womanSkin", [0.86, 0.64, 0.54]),
    soft: paintMat(BABYLON, scene, "womanSoft", [0.9, 0.58, 0.54], { shine: 0.22 }),
    lip: paintMat(BABYLON, scene, "womanLip", [0.72, 0.28, 0.34], { shine: 0.32, power: 64 }),
    hair: paintMat(BABYLON, scene, "womanHair", [0.11, 0.06, 0.045], { shine: 0.14, power: 28 }),
    white: paintMat(BABYLON, scene, "womanEye", [0.94, 0.92, 0.9], { shine: 0.38, power: 86 }),
    iris: paintMat(BABYLON, scene, "womanIris", [0.26, 0.15, 0.1], { shine: 0.22 }),
    pupil: paintMat(BABYLON, scene, "womanPupil", [0.04, 0.025, 0.025], { shine: 0.08 }),
  };
}

function addFlesh(flesh, mesh, fit) {
  mesh.isPickable = false;
  flesh.push({ mesh, fit });
  return mesh;
}

const LATHE_R = 0.2;
const CAP_R = 0.18;

function capScale(radius, len, flat = 1) {
  return { x: radius / CAP_R, y: Math.max(len, 0.04), z: (radius * flat) / CAP_R };
}

function womanBall(BABYLON, scene, name, parent, mat) {
  const mesh = BABYLON.MeshBuilder.CreateSphere(name, { diameter: 1, segments: 28 }, scene);
  mesh.parent = parent;
  mesh.material = mat;
  return mesh;
}

function womanCap(BABYLON, scene, name, parent, mat) {
  const mesh = BABYLON.MeshBuilder.CreateCapsule(name, {
    height: 1,
    radius: CAP_R,
    tessellation: 18,
    capSubdivisions: 8,
    subdivisions: 5,
  }, scene);
  mesh.parent = parent;
  mesh.material = mat;
  return mesh;
}

function womanLathe(BABYLON, scene, name, parent, mat, profile) {
  const shape = profile.map((p) => new BABYLON.Vector3(Math.max(p.r, 0.002), -p.t, 0));
  const mesh = BABYLON.MeshBuilder.CreateLathe(name, {
    shape,
    tessellation: 24,
    cap: BABYLON.Mesh.CAP_ALL,
  }, scene);
  mesh.parent = parent;
  mesh.material = mat;
  return mesh;
}

function fitLathe(mesh, radius, len, flat = 1, y = 0) {
  mesh.position.set(0, y, 0);
  mesh.scaling.set(radius / LATHE_R, Math.max(len, 0.04), (radius * flat) / LATHE_R);
}

function fitCap(mesh, x, y, z, radius, len, flat = 1, rx = 0, ry = 0, rz = 0) {
  const sc = capScale(radius, len, flat);
  mesh.position.set(x, y, z);
  mesh.scaling.set(sc.x, sc.y, sc.z);
  mesh.rotation.set(rx, ry, rz);
}

function fromToQuat(BABYLON, from, to) {
  const f = from.normalize();
  const t = to.normalize();
  const axis = BABYLON.Vector3.Cross(f, t);
  const d = BABYLON.Vector3.Dot(f, t);
  if (axis.lengthSquared() < 1e-8) {
    return d < 0
      ? BABYLON.Quaternion.RotationAxis(BABYLON.Axis.X, Math.PI)
      : BABYLON.Quaternion.Identity();
  }
  axis.normalize();
  return BABYLON.Quaternion.RotationAxis(axis, Math.acos(Math.min(1, Math.max(-1, d))));
}

function pelvisHeight(s) {
  const sit = Math.min(1, Math.max(0, s.sit || 0));
  const hip = s.hip || 1;
  return 0.152 * (s.scale || 1) * (s.pelvisH || 1) * (0.94 + 0.06 * hip) * (1 - 0.14 * sit);
}

function torsoSpan(s) {
  const lens = s.lens || {};
  return Math.max(0.2, (lens.spine1 || 0.11) + (lens.spine2 || 0.12) + (lens.chest || 0.13));
}

function gluteProfile(s) {
  const hip = s.hip || 1;
  const hipW = s.hipW || 1;
  const sit = Math.min(1, Math.max(0, s.sit || 0));
  const split = s.glute || 1;
  const lift = s.pelvisH || 1;
  const rise = Math.min(1.8, Math.max(0.5, s.gluteRise || 1.24));
  const tip = Math.min(1.9, Math.max(0, s.gluteH ?? 1));
  const fill = Math.min(1.9, Math.max(0, s.gluteFill ?? 1));
  const plump = Math.min(1, fill);
  const hy = Math.max(0.08, pelvisHeight(s));
  const axisCa = 0.24 + 0.2 * Math.min(1.35, split);
  const rx = (0.34 - 0.02 * Math.min(1.2, split)) * (0.9 + 0.32 * fill);
  const pillowAmt = Math.max(0, 1.12 - split);
  const endU = 0.8 + 0.74 * (rise - 0.5);
  const cy = 0.34 + 0.05 * Math.min(0.5, Math.max(0, lift - 1));
  const ru = Math.max(0.4, endU - cy);
  const rim = 0.148 * hipW * hip;
  const drop = 0.2;
  const depth = 0.1 * hip * (1 - 0.28 * sit) * tip * (0.94 + 0.12 * fill);
  const rY = depth > 1e-4 ? Math.max(0.1, depth / hy) : 0.1;
  const hill = (ca, u) => {
    if (tip <= 0 || u > endU) return 0;
    const dy = u >= cy ? (u - cy) / ru : (u - cy) / rY;
    if (dy < -1.02) return 0;
    let q = Math.min(
      Math.hypot((ca + axisCa) / rx, dy),
      Math.hypot((ca - axisCa) / rx, dy),
    );
    if (split < 0.82) {
      q = Math.min(q, Math.hypot(ca / (rx * (1.15 + 0.2 * pillowAmt)), dy));
    }
    if (q >= 1) return 0;
    return Math.sqrt(1 - q * q);
  };
  const under = (ca, u) => {
    if (u >= cy) return 0;
    const h = hill(ca, u);
    if (h <= 0) return 0;
    return ((cy - u) / rY) * h;
  };
  return {
    hip,
    hipW,
    split,
    tip,
    axisCa,
    cy,
    ru,
    rY,
    hy,
    spread: 0.78 + 0.28 * plump,
    rim,
    drop,
    depth,
    hill,
    under,
    along: (u) => hill(-axisCa, u),
    lateral: (ca, u = cy) => {
      const a = hill(-axisCa, u);
      return a > 1e-5 ? hill(ca, u) / a : 0;
    },
    ring: (a) => {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const front = 0.5 + 0.5 * sa;
      const flat = 0.72 + 0.08 * (1 - front);
      return {
        x: ca * rim,
        z: sa * rim * flat,
        ca,
        sa,
        front,
        yPelvis: 1 - drop * front,
      };
    },
  };
}

function writeTorsoMesh(BABYLON, mesh, s) {
  const rings = mesh.metadata.rings;
  const segs = mesh.metadata.segs;
  const g = gluteProfile(s);
  const th = mesh.scaling.y > 0.08 ? mesh.scaling.y : torsoSpan(s);
  const hy = pelvisHeight(s);
  const dropT = g.drop * hy / th;
  const waist = 0.068 * (s.waist || 1);
  const rib = 0.112 * s.shoulderW * (0.76 + 0.24 * (s.bust || 1));
  const yoke = 0.11 * s.shoulderW;
  const belly = s.belly || 1;
  const bust = s.bust || 1;
  const radiusAt = (t) => {
    if (t <= 0) return g.rim;
    if (t < 0.44) {
      const u = t / 0.44;
      const e = u * u * (3 - 2 * u);
      return g.rim + (waist - g.rim) * e;
    }
    if (t < 0.64) return waist + (rib - waist) * ((t - 0.44) / 0.2);
    if (t < 0.86) return rib + (yoke - rib) * ((t - 0.64) / 0.22);
    return yoke;
  };
  const positions = [];
  const indices = [];
  for (let i = 0; i <= rings; i += 1) {
    const t = i / rings;
    const r = radiusAt(t);
    const k = r / g.rim;
    const swell = t > 0.16 && t < 0.5
      ? Math.sin(((t - 0.16) / 0.34) * Math.PI) * 0.028 * belly
      : t > 0.54 && t < 0.88
        ? Math.sin(((t - 0.54) / 0.34) * Math.PI) * 0.012 * (0.65 + 0.35 * bust)
        : 0;
    for (let j = 0; j <= segs; j += 1) {
      const jn = g.ring((j / segs) * Math.PI * 2);
      const y = -dropT * jn.front + t * (1 + dropT * jn.front);
      let x = jn.x * k;
      let z = jn.z * k + swell * Math.max(0, jn.sa);
      if (jn.sa < 0) {
        const hill = g.hill(jn.ca, 1 + t * (th / hy));
        if (hill > 0) {
          z -= hill * g.depth;
          x += (jn.ca >= 0 ? 1 : -1) * hill * 0.01 * g.hipW * g.split * g.spread;
        }
      }
      positions.push(x, y, z);
    }
  }
  const stride = segs + 1;
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < segs; j += 1) {
      const a = i * stride + j;
      const b = a + stride;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  const top = positions.length / 3;
  positions.push(0, 1, 0);
  for (let j = 0; j < segs; j += 1) {
    const t0 = rings * stride + j;
    indices.push(top, t0 + 1, t0);
  }
  const normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh, true);
}

function womanTorso(BABYLON, scene, name, parent, mat) {
  const mesh = new BABYLON.Mesh(name, scene);
  mesh.parent = parent;
  mesh.material = mat;
  mesh.isPickable = false;
  mesh.metadata = { rings: 16, segs: 28, torsoStamp: null };
  writeTorsoMesh(BABYLON, mesh, {
    scale: 1, hipW: 1, hip: 1, waist: 1, shoulderW: 1, bust: 1, belly: 1, chest: 1,
    glute: 1.02, gluteRise: 1.24, gluteH: 1, gluteFill: 1, pelvisH: 1.24,
    lens: { spine1: 0.11, spine2: 0.12, chest: 0.13 },
  });
  return mesh;
}

function alignTorsoMass(BABYLON, figure) {
  const mesh = figure.torso;
  const base = figure.cascoBase;
  if (!mesh || !base || !figure.shoulderL || figure.bodyMode === "lines") return;
  refreshWorld(figure.root);
  const p1 = worldOf(BABYLON, figure.shoulderL).add(worldOf(BABYLON, figure.shoulderR)).scale(0.5);
  const inv = BABYLON.Matrix.Invert(base.getWorldMatrix());
  const localTop = BABYLON.Vector3.TransformCoordinates(p1, inv);
  const h = Math.max(localTop.length(), 0.08);
  mesh.position.set(0, 0, 0);
  mesh.rotationQuaternion = fromToQuat(BABYLON, BABYLON.Axis.Y, localTop);
  mesh.scaling.set(1, h, 1);
}

function writePelvisMesh(BABYLON, mesh, s) {
  const rings = mesh.metadata.rings;
  const segs = mesh.metadata.segs;
  const g = gluteProfile(s);
  const hip = g.hip;
  const hipW = g.hipW;
  const sit = Math.min(1, Math.max(0, s.sit || 0));
  const hy = g.hy;
  const mid = 0.152 * hipW * hip * (1 + 0.06 * sit);
  const frontBot = 0.08 * hipW * hip;
  const radiusAt = (t, front) => {
    const f = Math.max(0, Math.min(1, front));
    if (t >= 0.68) {
      const u = (t - 0.68) / 0.32;
      const e = u * u * (3 - 2 * u);
      return mid + (g.rim - mid) * e;
    }
    if (t >= 0.18) return mid;
    const u = Math.max(0, t) / 0.18;
    const e = u * u * (3 - 2 * u);
    const bot = frontBot * f + mid * 0.94 * (1 - f);
    return bot + (mid - bot) * e;
  };
  const seatWorld = 0.044 * hip;
  const tSeat = -seatWorld / hy;
  const tPole = g.tip > 0 ? g.cy - g.rY : tSeat;
  const tMin = Math.min(tSeat, tPole);
  const body = (t, jn) => {
    const front = Math.max(0, jn.sa);
    const tt = Math.max(0, t);
    const hill = jn.sa < 0 ? g.hill(jn.ca, tt) : 0;
    let widen = radiusAt(tt, front) / g.rim;
    if (hill > 0) widen = Math.max(widen, 0.74 + 0.26 * hill);
    let x = jn.x * widen;
    let y = tt * jn.yPelvis;
    let z = jn.z * widen;
    if (hill > 0) {
      z -= hill * g.depth;
      x += (jn.ca >= 0 ? 1 : -1) * hill * 0.012 * hipW * g.spread;
    }
    if (Math.abs(jn.ca) > 0.55 && tt > 0.2 && tt < 0.64) {
      const side = (Math.abs(jn.ca) - 0.55) / 0.45;
      const pad = Math.sin(((tt - 0.2) / 0.44) * Math.PI);
      x += Math.sign(jn.ca) * side * pad * 0.018 * hipW * hip;
    }
    if (Math.abs(jn.ca) > 0.72 && tt > 0.28 && tt < 0.88) {
      const side = (Math.abs(jn.ca) - 0.72) / 0.28;
      const pad = Math.sin(((tt - 0.28) / 0.6) * Math.PI);
      x += Math.sign(jn.ca) * side * pad * 0.016 * hipW * hip * g.along(tt);
    }
    if (tt < 0.26 && front > 0) {
      const k = (1 - tt / 0.26) * (1 - Math.abs(jn.ca));
      z -= k * 0.038;
      x *= 1 - k * 0.12;
    }
    if (tt > 0.3 && tt < 0.68 && jn.sa > 0.28) {
      z += Math.sin(((tt - 0.3) / 0.38) * Math.PI) * 0.012 * hip;
    }
    return [x, y, z];
  };
  const loft = (t, jn) => {
    const front = Math.max(0, jn.sa);
    const back = Math.max(0, -jn.sa);
    let [x, y, z] = body(Math.max(0, t), jn);
    if (t >= 0) return [x, y, z];
    const kSeat = tSeat < -1e-5 ? Math.min(1, t / tSeat) : 1;
    const phi = kSeat * Math.PI * 0.5;
    const sphi = Math.sin(phi);
    const cphi = Math.cos(phi);
    let xB = x * (1 - 0.2 * sphi * front);
    let yB = -(seatWorld / hy) * sphi * (0.32 + 0.68 * back);
    let zB = z * (0.62 + 0.38 * cphi) + (0.014 * front - 0.006 * back) * sphi;
    if (t < tSeat && front > 0.08) {
      const freeze = body(0, jn);
      xB = freeze[0] * 0.8;
      yB = -(seatWorld / hy) * 0.32;
      zB = freeze[2] * 0.72 + 0.014;
    }
    const eqHill = g.hill(jn.ca, 0);
    if (back > 0 && eqHill > 0 && g.depth > 1e-4 && tPole < tSeat * 0.35) {
      const R = g.depth;
      const seam = body(0, jn);
      const dyW = -g.cy * hy;
      const remain = Math.sqrt(Math.max(0, R * R - dyW * dyW));
      const zC = seam[2] + remain;
      const cx = (jn.ca >= 0 ? 1 : -1) * g.axisCa * g.rim * 0.92;
      const a0 = Math.atan2(Math.max(0, -dyW), Math.max(1e-5, remain));
      const kSph = tMin < -1e-5 ? Math.max(0, Math.min(1, t / tMin)) : 1;
      const a = a0 + (Math.PI * 0.5 - a0) * kSph;
      const cos0 = Math.max(0.2, Math.cos(a0));
      const xS = cx + (seam[0] - cx) * (Math.cos(a) / cos0);
      const yS = g.cy - g.rY * Math.sin(a);
      const zS = zC - R * Math.cos(a);
      const w = eqHill * (0.35 + 0.65 * Math.min(1, g.tip));
      xB += (xS - xB) * w;
      yB += (yS - yB) * w;
      zB += (zS - zB) * w;
    }
    return [xB, yB, zB];
  };
  const positions = [];
  const indices = [];
  for (let i = 0; i <= rings; i += 1) {
    const t = tMin + (i / rings) * (1 - tMin);
    for (let j = 0; j <= segs; j += 1) {
      const [x, y, z] = loft(t, g.ring((j / segs) * Math.PI * 2));
      positions.push(x, y, z);
    }
  }
  const stride = segs + 1;
  for (let i = 0; i < rings; i += 1) {
    for (let j = 0; j < segs; j += 1) {
      const a = i * stride + j;
      const b = a + stride;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
  }
  let fx = 0;
  let fy = 0;
  let fz = 0;
  for (let j = 0; j < segs; j += 1) {
    fx += positions[j * 3];
    fy += positions[j * 3 + 1];
    fz += positions[j * 3 + 2];
  }
  const floorI = positions.length / 3;
  positions.push(fx / segs, fy / segs + 0.028, fz / segs * 0.35);
  for (let j = 0; j < segs; j += 1) {
    indices.push(floorI, j, j + 1);
  }
  const normals = [];
  BABYLON.VertexData.ComputeNormals(positions, indices, normals);
  const vertexData = new BABYLON.VertexData();
  vertexData.positions = positions;
  vertexData.indices = indices;
  vertexData.normals = normals;
  vertexData.applyToMesh(mesh, true);
  mesh.refreshBoundingInfo();
}

function womanPelvis(BABYLON, scene, name, parent, mat) {
  const mesh = new BABYLON.Mesh(name, scene);
  mesh.parent = parent;
  mesh.material = mat;
  mesh.isPickable = false;
  mesh.metadata = { rings: 28, segs: 32, pelvisStamp: null };
  writePelvisMesh(BABYLON, mesh, {
    scale: 1, hipW: 1, hip: 1, glute: 1.02, gluteRise: 1.24, gluteH: 1, gluteFill: 1, pelvisH: 1.24, sit: 0,
  });
  return mesh;
}

function hipSitAmount(figure) {
  const one = (node) => Math.min(1, Math.max(0, (-node.rotation.x - 0.04) / 1.1));
  return 0.5 * (one(figure.hipL) + one(figure.hipR));
}

function curveBreastPyramid(BABYLON, mesh) {
  const data = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
  if (!data) return;
  for (let i = 0; i < data.length; i += 3) {
    let x = data[i];
    let y = data[i + 1];
    let z = data[i + 2];
    const t = Math.min(1, Math.max(0, y + 0.5));
    const along = Math.sin(t * Math.PI);
    if (z > 0.02) {
      z += along * 0.42 * z;
      y -= along * 0.12 * z;
    }
    if (Math.abs(x) > 0.12) {
      x += Math.sign(x) * along * 0.08 * (Math.abs(x) - 0.12);
    }
    data[i] = x;
    data[i + 1] = y;
    data[i + 2] = z;
  }
  mesh.updateVerticesData(BABYLON.VertexBuffer.PositionKind, data);
  mesh.createNormals(true);
  mesh.refreshBoundingInfo();
}

function womanBreast(BABYLON, scene, name, parent, mat) {
  const mesh = BABYLON.MeshBuilder.CreateCylinder(name, {
    height: 1,
    diameterTop: 0.04,
    diameterBottom: 1,
    tessellation: 4,
    cap: BABYLON.Mesh.CAP_END ?? 2,
    updatable: true,
  }, scene);
  mesh.parent = parent;
  mesh.material = mat;
  mesh.isPickable = false;
  curveBreastPyramid(BABYLON, mesh);
  return mesh;
}

function fitBreastPyramid(mesh, s, side) {
  const bust = s.bust || 1;
  const width = 0.148 * bust;
  const proj = 0.128 * bust;
  const tall = 0.118 * bust;
  mesh.position.set(
    side * (0.048 * s.shoulderW + 0.012 * bust),
    -0.072 * s.chest,
    0.058 * s.chest + 0.052 * bust,
  );
  mesh.rotation.set(Math.PI / 2 + 0.32, side * 0.24, side * 0.1);
  mesh.scaling.set(width, proj, tall);
}

function createWomanFlesh(BABYLON, scene, figure) {
  const mats = womanMats(BABYLON, scene);
  const flesh = [];
  const ball = (name, parent, mat, fit) => addFlesh(flesh, womanBall(BABYLON, scene, name, parent, mat), fit);
  const cap = (name, parent, mat, fit) => addFlesh(flesh, womanCap(BABYLON, scene, name, parent, mat), fit);

  const torso = womanTorso(BABYLON, scene, "wTorso", figure.cascos.base.visuals[0].root, mats.skin);
  addFlesh(flesh, torso, (mesh, s) => {
    const sit = hipSitAmount(figure);
    const a = anatomyStamp(s) * 32 + ((sit * 16) | 0) + (((mesh.scaling.y * 40) | 0) * 1024);
    if (mesh.metadata.torsoStamp !== a) {
      mesh.metadata.torsoStamp = a;
      writeTorsoMesh(BABYLON, mesh, { ...s, sit });
    }
  });
  figure.torso = torso;
  figure.cascoBase = figure.cascos.base.visuals[0].root;

  addFlesh(flesh, womanBreast(BABYLON, scene, "wBreastL", figure.chest, mats.soft), (mesh, s) => {
    fitBreastPyramid(mesh, s, -1);
  });
  addFlesh(flesh, womanBreast(BABYLON, scene, "wBreastR", figure.chest, mats.soft), (mesh, s) => {
    fitBreastPyramid(mesh, s, 1);
  });

  const pelvis = womanPelvis(BABYLON, scene, "wPelvis", figure.hips, mats.skin);
  addFlesh(flesh, pelvis, (mesh, s) => {
    const sit = hipSitAmount(figure);
    const a = anatomyStamp(s) * 32 + ((sit * 16) | 0);
    if (mesh.metadata.pelvisStamp !== a) {
      mesh.metadata.pelvisStamp = a;
      writePelvisMesh(BABYLON, mesh, { ...s, sit });
    }
    const hip = s.hip || 1;
    const lift = s.pelvisH || 1;
    const h = 0.152 * s.scale * lift * (0.94 + 0.06 * hip);
    const hy = h * (1 - 0.14 * sit);
    mesh.position.set(0, 0.024 * s.scale - hy, 0.006 * s.scale);
    mesh.scaling.set(1, hy, 1);
  });
  figure.pelvis = pelvis;

  cap("wNeck", figure.neck, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, s.lens.neck * 0.38, 0.008 * s.scale, 0.036 * s.neck, s.lens.neck * 0.95, 0.9);
  });

  ball("wSkull", figure.head, mats.skin, (mesh, s) => {
    mesh.position.set(0, 0.1 * s.head, 0.018 * s.head);
    mesh.scaling.set(0.27 * s.head, 0.3 * s.head, 0.255 * s.head);
  });
  ball("wJaw", figure.head, mats.skin, (mesh, s) => {
    mesh.position.set(0, 0.028 * s.head, 0.048 * s.head);
    mesh.scaling.set(0.155 * s.head, 0.11 * s.head, 0.13 * s.head);
  });
  ball("wChin", figure.head, mats.skin, (mesh, s) => {
    mesh.position.set(0, 0.004 * s.head, 0.07 * s.head);
    mesh.scaling.set(0.07 * s.head, 0.055 * s.head, 0.062 * s.head);
  });
  ball("wBrow", figure.head, mats.skin, (mesh, s) => {
    mesh.position.set(0, 0.112 * s.head, 0.09 * s.head);
    mesh.scaling.set(0.175 * s.head, 0.038 * s.head, 0.052 * s.head);
  });
  ball("wNose", figure.head, mats.soft, (mesh, s) => {
    mesh.position.set(0, 0.072 * s.head, 0.122 * s.head);
    mesh.scaling.set(0.038 * s.head, 0.062 * s.head, 0.068 * s.head);
  });
  ball("wLipUp", figure.head, mats.lip, (mesh, s) => {
    mesh.position.set(0, 0.044 * s.head, 0.118 * s.head);
    mesh.scaling.set(0.092 * s.head, 0.024 * s.head, 0.04 * s.head);
  });
  ball("wLipDn", figure.head, mats.lip, (mesh, s) => {
    mesh.position.set(0, 0.028 * s.head, 0.116 * s.head);
    mesh.scaling.set(0.078 * s.head, 0.022 * s.head, 0.038 * s.head);
  });
  for (const side of [-1, 1]) {
    const tag = side < 0 ? "L" : "R";
    ball("wEye" + tag, figure.head, mats.white, (mesh, s) => {
      mesh.position.set(side * 0.046 * s.head, 0.094 * s.head, 0.12 * s.head);
      mesh.scaling.set(0.044 * s.head, 0.028 * s.head, 0.022 * s.head);
    });
    ball("wIris" + tag, figure.head, mats.iris, (mesh, s) => {
      mesh.position.set(side * 0.044 * s.head, 0.092 * s.head, 0.128 * s.head);
      mesh.scaling.set(0.02 * s.head, 0.02 * s.head, 0.012 * s.head);
    });
    ball("wPupil" + tag, figure.head, mats.pupil, (mesh, s) => {
      mesh.position.set(side * 0.044 * s.head, 0.092 * s.head, 0.134 * s.head);
      mesh.scaling.set(0.01 * s.head, 0.01 * s.head, 0.006 * s.head);
    });
    ball("wEar" + tag, figure.head, mats.soft, (mesh, s) => {
      mesh.position.set(side * 0.112 * s.head, 0.078 * s.head, 0.006 * s.head);
      mesh.scaling.set(0.032 * s.head, 0.062 * s.head, 0.044 * s.head);
    });
  }
  ball("wHairCap", figure.head, mats.hair, (mesh, s) => {
    const hair = s.hair || 1;
    mesh.position.set(0, 0.125 * s.head, -0.008 * s.head);
    mesh.scaling.set(0.27 * s.head * hair, 0.2 * s.head * hair, 0.25 * s.head * hair);
  });
  cap("wHairFall", figure.head, mats.hair, (mesh, s) => {
    const hair = s.hair || 1;
    fitCap(mesh, 0, 0.02 * s.head, -0.07 * s.head * hair, 0.092 * s.head * hair, 0.38 * s.head * hair, 0.7, 0.28);
  });
  cap("wHairL", figure.head, mats.hair, (mesh, s) => {
    const hair = s.hair || 1;
    fitCap(mesh, -0.078 * s.head, 0.03 * s.head, -0.02 * s.head, 0.034 * s.head * hair, 0.28 * s.head * hair, 0.62, 0.22, 0, 0.18);
  });
  cap("wHairR", figure.head, mats.hair, (mesh, s) => {
    const hair = s.hair || 1;
    fitCap(mesh, 0.078 * s.head, 0.03 * s.head, -0.02 * s.head, 0.034 * s.head * hair, 0.28 * s.head * hair, 0.62, 0.22, 0, -0.18);
  });
  ball("wBangs", figure.head, mats.hair, (mesh, s) => {
    const hair = s.hair || 1;
    mesh.position.set(0, 0.138 * s.head, 0.08 * s.head);
    mesh.scaling.set(0.13 * s.head * hair, 0.032 * s.head * hair, 0.04 * s.head);
  });

  cap("wShoulderL", figure.shoulderL, mats.skin, (mesh, s) => {
    fitCap(mesh, 0.006 * s.scale, -s.lens.upper * 0.42, 0, 0.052 * s.scale, s.lens.upper * 0.96, 0.9);
  });
  cap("wShoulderR", figure.shoulderR, mats.skin, (mesh, s) => {
    fitCap(mesh, -0.006 * s.scale, -s.lens.upper * 0.42, 0, 0.052 * s.scale, s.lens.upper * 0.96, 0.9);
  });
  cap("wForeL", figure.elbowL, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, -s.lens.fore * 0.48, 0, 0.038 * s.scale, s.lens.fore * 0.98, 0.86);
  });
  cap("wForeR", figure.elbowR, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, -s.lens.fore * 0.48, 0, 0.038 * s.scale, s.lens.fore * 0.98, 0.86);
  });
  cap("wHandL", figure.wristL, mats.skin, (mesh, s) => {
    const len = s.lens.hand * 1.22;
    fitCap(mesh, 0, -len * 0.38, 0.008 * s.hand, 0.022 * s.hand, len, 0.58);
    mesh.scaling.x = (0.062 * s.hand) / CAP_R;
  });
  cap("wHandR", figure.wristR, mats.skin, (mesh, s) => {
    const len = s.lens.hand * 1.22;
    fitCap(mesh, 0, -len * 0.38, 0.008 * s.hand, 0.022 * s.hand, len, 0.58);
    mesh.scaling.x = (0.062 * s.hand) / CAP_R;
  });

  cap("wThighL", figure.hipL, mats.skin, (mesh, s) => {
    const hip = s.hip || 1;
    fitCap(mesh, 0, -s.lens.thigh * 0.48, 0.008 * s.scale, 0.055 * s.hipW * hip, s.lens.thigh * 0.97, 0.82);
  });
  cap("wThighR", figure.hipR, mats.skin, (mesh, s) => {
    const hip = s.hip || 1;
    fitCap(mesh, 0, -s.lens.thigh * 0.48, 0.008 * s.scale, 0.055 * s.hipW * hip, s.lens.thigh * 0.97, 0.82);
  });
  cap("wShinL", figure.kneeL, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, -s.lens.shin * 0.48, 0.01 * s.scale, 0.042 * s.scale, s.lens.shin * 0.97, 0.8);
  });
  cap("wShinR", figure.kneeR, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, -s.lens.shin * 0.48, 0.01 * s.scale, 0.042 * s.scale, s.lens.shin * 0.97, 0.8);
  });
  cap("wAnkleL", figure.ankleL, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, -0.02 * s.scale, 0.01 * s.scale, 0.03 * s.scale, 0.072 * s.scale, 0.88);
  });
  cap("wAnkleR", figure.ankleR, mats.skin, (mesh, s) => {
    fitCap(mesh, 0, -0.02 * s.scale, 0.01 * s.scale, 0.03 * s.scale, 0.072 * s.scale, 0.88);
  });
  cap("wFootL", figure.ankleL, mats.skin, (mesh, s) => {
    const len = s.lens.foot * 1.18;
    fitCap(mesh, 0, -0.028 * s.scale, 0.07 * s.foot, 0.026 * s.foot, len, 0.58, Math.PI / 2);
    mesh.scaling.x = (0.054 * s.foot) / CAP_R;
  });
  cap("wFootR", figure.ankleR, mats.skin, (mesh, s) => {
    const len = s.lens.foot * 1.18;
    fitCap(mesh, 0, -0.028 * s.scale, 0.07 * s.foot, 0.026 * s.foot, len, 0.58, Math.PI / 2);
    mesh.scaling.x = (0.054 * s.foot) / CAP_R;
  });

  for (const item of FINGER_LAYOUT) {
    for (const [side, handSide] of [["L", figure.handL], ["R", figure.handR]]) {
      handSide[item.id].forEach((seg, i) => {
        cap("w" + side + item.id + i, seg.joint, mats.skin, (mesh, s) => {
          const len = item.lengths[i] * s.finger;
          const r = (item.id === "thumb" ? 0.011 : 0.0085) * s.finger;
          const sc = capScale(r, len * 1.08);
          mesh.position.set(0, -len * 0.48, 0);
          mesh.scaling.set(sc.x, sc.y, sc.z);
        });
      });
    }
  }

  figure.flesh = flesh;
  figure.bodyMode = "flesh";
  figure.skin = createWomanSkin(BABYLON, scene, figure, mats.skin);
  applyWomanFlesh(figure, {
    scale: 1,
    head: 1,
    neck: 1,
    chest: 1,
    shoulderW: 1,
    hipW: 1,
    hand: 1,
    finger: 1,
    foot: 1,
    bust: 1,
    waist: 1,
    belly: 1,
    hip: 1,
    glute: 1.02,
    gluteRise: 1.24,
    gluteH: 1,
    gluteFill: 1,
    pelvisH: 1.24,
    hair: 1,
    lens: {
      spine1: 0.11, spine2: 0.12, chest: 0.13, neck: 0.13, head: 0.155,
      upper: 0.27, fore: 0.25, hand: 0.075, thigh: 0.42, shin: 0.4, ankle: 0.075, foot: 0.15,
    },
  });
  setPulleyBodyMode(figure, "flesh");
}

function applyWomanFlesh(figure, sizes) {
  if (!figure.flesh) return;
  figure.skinSizes = sizes;
  for (const piece of figure.flesh) piece.fit(piece.mesh, sizes);
}

const SKIN_JOINTS = [
  "hips", "spine1", "spine2", "chest", "neck", "head",
  "shoulderL", "elbowL", "wristL",
  "shoulderR", "elbowR", "wristR",
  "hipL", "kneeL", "ankleL",
  "hipR", "kneeR", "ankleR",
];

function refreshWorld(node) {
  node.computeWorldMatrix(true);
  const kids = node.getChildren();
  for (let i = 0; i < kids.length; i += 1) {
    if (kids[i].getTotalVertices && kids[i].getTotalVertices() > 0) continue;
    refreshWorld(kids[i]);
  }
}

function worldOf(BABYLON, node, x = 0, y = 0, z = 0) {
  return BABYLON.Vector3.TransformCoordinates(new BABYLON.Vector3(x, y, z), node.getWorldMatrix());
}

function poseStamp(figure) {
  let h = 0;
  const add = (node) => {
    if (!node) return;
    const r = node.rotation;
    const p = node.position;
    h = (h * 33 + r.x * 1000 + r.y * 173 + r.z * 41 + p.x * 19 + p.y * 71 + p.z * 13) | 0;
  };
  for (const name of SKIN_JOINTS) add(figure[name]);
  return h;
}

function anatomyStamp(sizes) {
  if (!sizes) return 0;
  const l = sizes.lens || {};
  return (
    sizes.scale * 97 + sizes.chest * 53 + sizes.hipW * 29 + sizes.head * 11 +
    (sizes.shoulderW || 0) * 23 + (l.thigh || 0) * 7 + (l.shin || 0) * 5 +
    (l.upper || 0) * 3 + (l.foot || 0) * 13 + (sizes.neck || 0) * 17 +
    (sizes.bust || 0) * 31 + (sizes.waist || 0) * 37 + (sizes.belly || 0) * 41 +
    (sizes.hip || 0) * 43 + (sizes.glute || 0) * 59 + (sizes.gluteRise || 0) * 67 + (sizes.gluteH || 0) * 71 + (sizes.gluteFill || 0) * 73 + (sizes.pelvisH || 0) * 61 + (sizes.hair || 0) * 47
  ) | 0;
}

const SKIN_EXTRA = 2;

function skinChains(BABYLON, figure, s) {
  const w = (node, x, y, z) => worldOf(BABYLON, node, x, y, z);
  const hip = s.hip || 1;
  return [
    {
      bones: ["hipL", "kneeL", "ankleL", "ankleL"],
      points: [
        w(figure.hipL),
        w(figure.kneeL),
        w(figure.ankleL),
        w(figure.ankleL, 0, -0.018 * s.scale, 0.11 * s.foot),
      ],
      radii: [0.062 * s.scale * hip, 0.05 * s.scale, 0.036 * s.foot, 0.026 * s.foot],
    },
    {
      bones: ["hipR", "kneeR", "ankleR", "ankleR"],
      points: [
        w(figure.hipR),
        w(figure.kneeR),
        w(figure.ankleR),
        w(figure.ankleR, 0, -0.018 * s.scale, 0.11 * s.foot),
      ],
      radii: [0.062 * s.scale * hip, 0.05 * s.scale, 0.036 * s.foot, 0.026 * s.foot],
    },
  ];
}

function chainCount(keys) {
  return keys + (keys - 1) * SKIN_EXTRA;
}

function sampleChain(BABYLON, points) {
  const path = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    path.push(points[i]);
    for (let k = 1; k <= SKIN_EXTRA; k += 1) {
      path.push(BABYLON.Vector3.Lerp(points[i], points[i + 1], k / (SKIN_EXTRA + 1)));
    }
  }
  path.push(points[points.length - 1]);
  return path;
}

function sampleRadii(keys) {
  const out = [];
  for (let i = 0; i < keys.length - 1; i += 1) {
    out.push(keys[i]);
    for (let k = 1; k <= SKIN_EXTRA; k += 1) {
      const t = k / (SKIN_EXTRA + 1);
      out.push(keys[i] * (1 - t) + keys[i + 1] * t);
    }
  }
  out.push(keys[keys.length - 1]);
  return out;
}

function makeSkinTube(BABYLON, scene, name, mat, count) {
  const path = Array.from({ length: count }, (_, i) => new BABYLON.Vector3(0, 0.05 * i, 0));
  const mesh = BABYLON.MeshBuilder.CreateTube(name, {
    path,
    tessellation: 16,
    radiusFunction: () => 0.06,
    cap: BABYLON.Mesh.CAP_ALL,
    updatable: true,
  }, scene);
  mesh.material = mat;
  mesh.isPickable = false;
  return mesh;
}

function writeSkinTube(BABYLON, mesh, path, radii) {
  BABYLON.MeshBuilder.CreateTube(mesh.name, {
    path,
    radiusFunction: (i) => radii[Math.min(i, radii.length - 1)],
    instance: mesh,
  }, mesh.getScene());
}

function createWomanSkin(BABYLON, scene, figure, mat) {
  return {};
}

function updateWomanSkin(BABYLON, figure) {
  const skin = figure.skin;
  const s = figure.skinSizes;
  if (!skin || !s || figure.bodyMode === "lines") return;
  const keys = Object.keys(skin);
  if (!keys.length) return;
  const stamp = poseStamp(figure);
  const a = anatomyStamp(s);
  if (stamp === figure.skinStamp && a === figure.skinBindStamp) return;
  figure.skinStamp = stamp;
  figure.skinBindStamp = a;
  refreshWorld(figure.root);
  const chains = skinChains(BABYLON, figure, s);
  for (let i = 0; i < keys.length; i += 1) {
    writeSkinTube(BABYLON, skin[keys[i]], sampleChain(BABYLON, chains[i].points), sampleRadii(chains[i].radii));
  }
}

const SCULPT_URL = "./assets/3d/mongolian-woman.glb";

const SCULPT_BONE_JOINT = {
  hips: "hips",
  hip: "hips",
  spine: "spine1",
  spine1: "spine1",
  spine01: "spine2",
  spine2: "spine2",
  spine02: "chest",
  chest: "chest",
  neck: "neck",
  head: "head",
  leftarm: "upperL",
  rightarm: "upperR",
  leftforearm: "elbowL",
  rightforearm: "elbowR",
  leftupleg: "hipL",
  rightupleg: "hipR",
  leftleg: "kneeL",
  rightleg: "kneeR",
  leftfoot: "ankleL",
  rightfoot: "ankleR",
  shoulderl: "upperL",
  shoulderr: "upperR",
  elbowl: "elbowL",
  elbowr: "elbowR",
  wristl: "wristL",
  wristr: "wristR",
  hipl: "hipL",
  hipr: "hipR",
  kneel: "kneeL",
  kneer: "kneeR",
  anklel: "ankleL",
  ankler: "ankleR",
  footl: "footL",
  footr: "footR",
};

function sculptBoneName(name) {
  return String(name || "")
    .replace(/^Poleas_?/i, "")
    .replace(/^Armature[_.]?/i, "")
    .replace(/_end$/i, "")
    .replace(/[\s_\-]/g, "")
    .toLowerCase();
}

function sculptJointName(boneName) {
  const key = sculptBoneName(boneName);
  return SCULPT_BONE_JOINT[key] || null;
}

const SCULPT_HINGE_LOCAL = new Set(["leftforearm", "rightforearm"]);
const SCULPT_FOLLOW_LOCAL = new Set(["lefthand", "righthand"]);

function nodeQuat(BABYLON, node) {
  if (node.rotationQuaternion) return node.rotationQuaternion.clone();
  return BABYLON.Quaternion.FromEulerAngles(node.rotation.x, node.rotation.y, node.rotation.z);
}

function boneWorldMatrix(bone) {
  if (typeof bone.getAbsoluteMatrix === "function") return bone.getAbsoluteMatrix().clone();
  if (typeof bone.getWorldMatrix === "function") return bone.getWorldMatrix().clone();
  return bone.getAbsoluteTransform().clone();
}

function sculptBoneByKey(skeleton, key) {
  return skeleton.bones.find((bone) => sculptBoneName(bone.name) === key) || null;
}

function parentSculptHands(skeleton) {
  const pairs = [
    ["leftforearm", "lefthand"],
    ["rightforearm", "righthand"],
  ];
  for (let i = 0; i < pairs.length; i += 1) {
    const arm = sculptBoneByKey(skeleton, pairs[i][0]);
    const hand = sculptBoneByKey(skeleton, pairs[i][1]);
    const armTn = arm?.getTransformNode();
    const handTn = hand?.getTransformNode();
    if (!arm || !hand || !armTn || !handTn) continue;
    if (typeof hand.getParent === "function" && hand.getParent() !== arm && typeof hand.setParent === "function") {
      hand.setParent(arm);
    }
    if (handTn.parent !== armTn) handTn.setParent(armTn);
  }
}

function applySculptLocalRest(tn, rest) {
  if (!tn || !rest) return;
  if (!tn.rotationQuaternion) tn.rotationQuaternion = rest.rotation.clone();
  tn.position.copyFrom(rest.position);
  tn.scaling.copyFrom(rest.scaling);
  tn.rotationQuaternion.copyFrom(rest.rotation);
  tn.computeWorldMatrix(true);
}

function sculptBoneDepth(bone) {
  let depth = 0;
  let node = typeof bone.getTransformNode === "function" ? bone.getTransformNode() : null;
  while (node && node.parent) {
    depth += 1;
    node = node.parent;
  }
  return depth;
}

function driveSculptFromPulleys(BABYLON, figure) {
  const sculpt = figure.sculpt;
  if (!sculpt?.skeleton) return;
  refreshWorld(figure.root);
  const ident = BABYLON.Matrix.Identity();
  const bones = sculpt.skeleton.bones.slice().sort((a, b) => sculptBoneDepth(a) - sculptBoneDepth(b));
  for (const bone of bones) {
    const key = sculptBoneName(bone.name);
    const joint = sculpt.joints.get(bone.name);
    const jointRest = sculpt.jointRests.get(key);
    const boneRest = sculpt.boneRests.get(bone.name);
    const tn = bone.getTransformNode();
    const localRest = sculpt.boneLocalRests?.get(bone.name);
    if (SCULPT_FOLLOW_LOCAL.has(key) && localRest && tn) {
      applySculptLocalRest(tn, localRest);
      continue;
    }
    if (!joint || !tn) continue;
    const hingeRest = sculpt.jointLocalRests?.get(key);
    if (SCULPT_HINGE_LOCAL.has(key) && localRest && hingeRest) {
      if (!tn.rotationQuaternion) tn.rotationQuaternion = new BABYLON.Quaternion();
      tn.position.copyFrom(localRest.position);
      tn.scaling.copyFrom(localRest.scaling);
      tn.rotationQuaternion.copyFrom(
        localRest.rotation.multiply(BABYLON.Quaternion.Inverse(hingeRest)).multiply(nodeQuat(BABYLON, joint)),
      );
      tn.computeWorldMatrix(true);
      continue;
    }
    if (!jointRest || !boneRest) continue;
    const boneWorld = boneRest.clone().multiply(jointRest.clone().invert()).multiply(joint.getWorldMatrix());
    const parentWorld = tn.parent ? tn.parent.computeWorldMatrix(true) : ident;
    const local = boneWorld.multiply(parentWorld.clone().invert());
    if (!tn.rotationQuaternion) tn.rotationQuaternion = new BABYLON.Quaternion();
    local.decompose(tn.scaling, tn.rotationQuaternion, tn.position);
    tn.computeWorldMatrix(true);
  }
  if (typeof sculpt.skeleton.computeAbsoluteMatrices === "function") sculpt.skeleton.computeAbsoluteMatrices();
  else sculpt.skeleton.prepare();
  for (const bone of sculpt.skeleton.bones) {
    const tn = bone.getTransformNode();
    if (tn && typeof bone.updateMatrix === "function") bone.updateMatrix(tn.getWorldMatrix(), false, true);
  }
}

function standingPulleySliders() {
  const sliders = {};
  for (const item of PULLEY_SLIDERS) {
    if (item.pair) {
      sliders[item.id + "L"] = 1;
      sliders[item.id + "R"] = 1;
    } else {
      sliders[item.id] = 1;
    }
  }
  for (const finger of FINGER_LAYOUT) {
    sliders[finger.id + "L"] = 1;
    sliders[finger.id + "R"] = 1;
  }
  for (const group of CASCO_GROUPS) {
    const sides = group.pair ? ["L", "R"] : [""];
    for (const side of sides) {
      for (const axis of CASCO_AXES) sliders[group.id + side + axis] = 0;
    }
  }
  return sliders;
}

export async function hangWomanSculpt(BABYLON, scene, figure, url = SCULPT_URL) {
  const mod = await import("@babylonjs/loaders/glTF");
  const Ctor = mod.GLTFFileLoader;
  if (Ctor && !BABYLON.SceneLoader.IsPluginForExtensionAvailable(".glb")) {
    BABYLON.SceneLoader.RegisterPlugin(new Ctor());
  }
  const result = await BABYLON.SceneLoader.ImportMeshAsync("", "", url, scene);
  for (const group of result.animationGroups || []) group.stop();
  const root = result.meshes[0] || null;
  const skeleton = result.skeletons[0] || null;
  const meshes = result.meshes.filter((mesh) => mesh.getTotalVertices && mesh.getTotalVertices() > 0);
  for (const mesh of meshes) {
    mesh.isPickable = false;
    if (skeleton && !mesh.skeleton) mesh.skeleton = skeleton;
  }

  posePulleyFigure(figure, standingPulleySliders());
  refreshWorld(figure.root);

  const joints = new Map();
  const boneRests = new Map();
  const jointRests = new Map();
  const boneLocalRests = new Map();
  const jointLocalRests = new Map();
  if (skeleton) {
    parentSculptHands(skeleton);
    if (typeof skeleton.computeAbsoluteMatrices === "function") skeleton.computeAbsoluteMatrices();
    else skeleton.prepare();
    for (const bone of skeleton.bones) {
      const jointName = sculptJointName(bone.name);
      if (jointName && figure[jointName]) joints.set(bone.name, figure[jointName]);
      const tn = bone.getTransformNode();
      if (tn) {
        tn.computeWorldMatrix(true);
        boneRests.set(bone.name, tn.getWorldMatrix().clone());
        if (!tn.rotationQuaternion) {
          tn.rotationQuaternion = BABYLON.Quaternion.FromEulerAngles(tn.rotation.x, tn.rotation.y, tn.rotation.z);
        }
        boneLocalRests.set(bone.name, {
          position: tn.position.clone(),
          rotation: tn.rotationQuaternion.clone(),
          scaling: tn.scaling.clone(),
        });
      } else {
        boneRests.set(bone.name, boneWorldMatrix(bone));
      }
    }
  }
  for (const [boneName, jointName] of Object.entries(SCULPT_BONE_JOINT)) {
    const joint = figure[jointName];
    if (!joint) continue;
    joint.computeWorldMatrix(true);
    jointRests.set(boneName, joint.getWorldMatrix().clone());
    if (SCULPT_HINGE_LOCAL.has(boneName)) jointLocalRests.set(boneName, nodeQuat(BABYLON, joint));
  }
  figure.sculpt = { root, meshes, skeleton, joints, jointRests, boneRests, boneLocalRests, jointLocalRests };
  setPulleyBodyMode(figure, figure.bodyMode || "flesh");
  return figure.sculpt;
}

export function setPulleyBodyMode(figure, mode) {
  const next = mode === "lines" || mode === "both" ? mode : "flesh";
  figure.bodyMode = next;
  figure.skinStamp = null;
  const hasSculpt = Boolean(figure.sculpt?.meshes?.length);
  const sculptOn = next !== "lines" && hasSculpt;
  const fleshOn = next !== "lines" && !hasSculpt;
  const linesOn = next !== "flesh";
  if (figure.sculpt?.meshes) {
    for (const mesh of figure.sculpt.meshes) mesh.isVisible = sculptOn;
  }
  if (figure.flesh) {
    for (const piece of figure.flesh) piece.mesh.isVisible = fleshOn;
  }
  if (figure.skin) {
    for (const mesh of Object.values(figure.skin)) {
      if (mesh && mesh.isVisible !== undefined) mesh.isVisible = fleshOn;
    }
  }
  for (const bone of figure.bones || []) bone.line.isVisible = linesOn;
  for (const group of Object.values(figure.cascos || {})) {
    for (const visual of group.visuals) {
      if (visual.rim) visual.rim.isVisible = linesOn;
      if (visual.well) visual.well.isVisible = linesOn;
      if (visual.marker) visual.marker.isVisible = linesOn;
    }
  }
  for (const pulley of figure.pulleys || []) {
    for (const ring of pulley.rings) {
      ring.isVisible = linesOn;
      ring.scaling.setAll(1);
    }
    for (const { tick } of pulley.ticks) tick.isVisible = linesOn;
  }
}

export function createPulleyFigure(BABYLON, scene) {
  const gold = color(BABYLON, "#d4a24a");
  const mauve = color(BABYLON, "#9a7088");
  const rose = color(BABYLON, "#e07088");
  const wine = color(BABYLON, "#c45a7a");
  const sand = color(BABYLON, "#c4b07a");
  const clay = color(BABYLON, "#a07080");

  const root = node(BABYLON, scene, "pRoot");
  const hips = node(BABYLON, scene, "pHips", root, 0, 0.935, 0);

  const cascoBase = makeCasco(BABYLON, scene, "cascoBase", wine, 0.05);
  cascoBase.root.parent = hips;
  cascoBase.root.position.set(0, 0.02, 0);

  const spine1 = node(BABYLON, scene, "pSpine1", cascoBase.root, 0, 0.11, 0);
  const spine2 = node(BABYLON, scene, "pSpine2", spine1, 0, 0.12, 0);
  const chest = node(BABYLON, scene, "pChest", spine2, 0, 0.13, 0);
  const neck = node(BABYLON, scene, "pNeck", chest, 0, 0.1, 0);

  const cascoNape = makeCasco(BABYLON, scene, "cascoNape", rose, 0.036);
  cascoNape.root.parent = neck;
  cascoNape.root.position.set(0, 0.075, 0);
  const head = node(BABYLON, scene, "pHead", cascoNape.root, 0, 0.12, 0);

  const cascoShL = makeCasco(BABYLON, scene, "cascoShL", gold, 0.038);
  cascoShL.root.parent = chest;
  cascoShL.root.position.set(-0.122, 0.068, 0.02);
  const shoulderL = cascoShL.root;
  const upperL = node(BABYLON, scene, "pUpL", shoulderL, 0, 0, 0);
  const elbowL = node(BABYLON, scene, "pElL", upperL, 0, -0.28, 0);
  const wristL = node(BABYLON, scene, "pWrL", elbowL, 0, -0.26, 0);
  const cascoWrL = makeCasco(BABYLON, scene, "cascoWrL", sand, 0.026);
  cascoWrL.root.parent = wristL;
  cascoWrL.root.position.set(0, -0.02, 0);
  const handL = {};
  for (const finger of FINGER_LAYOUT) {
    handL[finger.id] = makeFinger(BABYLON, scene, cascoWrL.root, "pL" + finger.id, finger.origin, finger.lengths);
  }

  const cascoShR = makeCasco(BABYLON, scene, "cascoShR", gold, 0.038);
  cascoShR.root.parent = chest;
  cascoShR.root.position.set(0.122, 0.068, 0.02);
  const shoulderR = cascoShR.root;
  const upperR = node(BABYLON, scene, "pUpR", shoulderR, 0, 0, 0);
  const elbowR = node(BABYLON, scene, "pElR", upperR, 0, -0.28, 0);
  const wristR = node(BABYLON, scene, "pWrR", elbowR, 0, -0.26, 0);
  const cascoWrR = makeCasco(BABYLON, scene, "cascoWrR", sand, 0.026);
  cascoWrR.root.parent = wristR;
  cascoWrR.root.position.set(0, -0.02, 0);
  const handR = {};
  for (const finger of FINGER_LAYOUT) {
    handR[finger.id] = makeFinger(
      BABYLON,
      scene,
      cascoWrR.root,
      "pR" + finger.id,
      { x: -finger.origin.x, y: finger.origin.y, z: finger.origin.z },
      finger.lengths,
    );
  }

  const cascoHpL = makeCasco(BABYLON, scene, "cascoHpL", mauve, 0.04);
  cascoHpL.root.parent = hips;
  cascoHpL.root.position.set(-0.142, -0.012, 0.01);
  const hipL = node(BABYLON, scene, "pHpL", cascoHpL.root, 0, 0, 0);
  const kneeL = node(BABYLON, scene, "pKnL", hipL, 0, -0.4, 0);
  const ankleL = node(BABYLON, scene, "pAnL", kneeL, 0, -0.4, 0);
  const cascoSoleL = makeCasco(BABYLON, scene, "cascoSoleL", clay, 0.03);
  cascoSoleL.root.parent = ankleL;
  cascoSoleL.root.position.set(0, -0.02, 0.05);
  const footL = node(BABYLON, scene, "pFtL", cascoSoleL.root, 0, 0, 0);

  const cascoHpR = makeCasco(BABYLON, scene, "cascoHpR", mauve, 0.04);
  cascoHpR.root.parent = hips;
  cascoHpR.root.position.set(0.142, -0.012, 0.01);
  const hipR = node(BABYLON, scene, "pHpR", cascoHpR.root, 0, 0, 0);
  const kneeR = node(BABYLON, scene, "pKnR", hipR, 0, -0.4, 0);
  const ankleR = node(BABYLON, scene, "pAnR", kneeR, 0, -0.4, 0);
  const cascoSoleR = makeCasco(BABYLON, scene, "cascoSoleR", clay, 0.03);
  cascoSoleR.root.parent = ankleR;
  cascoSoleR.root.position.set(0, -0.02, 0.05);
  const footR = node(BABYLON, scene, "pFtR", cascoSoleR.root, 0, 0, 0);

  const boneCol = color(BABYLON, "#f0d2c4");
  const bones = [
    { part: "spine1", joint: spine1, len: 0.12, line: makeLine(BABYLON, scene, "bS1", boneCol) },
    { part: "spine2", joint: spine2, len: 0.13, line: makeLine(BABYLON, scene, "bS2", boneCol) },
    { part: "chest", joint: chest, len: 0.14, line: makeLine(BABYLON, scene, "bCh", boneCol) },
    { part: "neck", joint: neck, len: 0.12, line: makeLine(BABYLON, scene, "bNk", boneCol) },
    { part: "head", joint: head, len: 0.16, line: makeLine(BABYLON, scene, "bHd", boneCol) },
    { part: "upper", joint: upperL, len: 0.28, line: makeLine(BABYLON, scene, "bUL", boneCol) },
    { part: "fore", joint: elbowL, len: 0.26, line: makeLine(BABYLON, scene, "bEL", boneCol) },
    { part: "hand", joint: wristL, len: 0.08, line: makeLine(BABYLON, scene, "bWL", boneCol) },
    ...FINGER_LAYOUT.flatMap((finger) =>
      handL[finger.id].map((seg, i) => ({
        joint: seg.joint,
        len: seg.len,
        line: makeLine(BABYLON, scene, "bL" + finger.id + i, boneCol),
      })),
    ),
    { part: "upper", joint: upperR, len: 0.28, line: makeLine(BABYLON, scene, "bUR", boneCol) },
    { part: "fore", joint: elbowR, len: 0.26, line: makeLine(BABYLON, scene, "bER", boneCol) },
    { part: "hand", joint: wristR, len: 0.08, line: makeLine(BABYLON, scene, "bWR", boneCol) },
    ...FINGER_LAYOUT.flatMap((finger) =>
      handR[finger.id].map((seg, i) => ({
        joint: seg.joint,
        len: seg.len,
        line: makeLine(BABYLON, scene, "bR" + finger.id + i, boneCol),
      })),
    ),
    { part: "thigh", joint: hipL, len: 0.4, line: makeLine(BABYLON, scene, "bHL", boneCol) },
    { part: "shin", joint: kneeL, len: 0.4, line: makeLine(BABYLON, scene, "bKL", boneCol) },
    { part: "ankle", joint: ankleL, len: 0.08, line: makeLine(BABYLON, scene, "bAL", color(BABYLON, "#e8c8b0")) },
    { part: "foot", joint: footL, len: 0.16, line: makeLine(BABYLON, scene, "bFL", color(BABYLON, "#e8c8b0")), foot: true },
    { part: "thigh", joint: hipR, len: 0.4, line: makeLine(BABYLON, scene, "bHR", boneCol) },
    { part: "shin", joint: kneeR, len: 0.4, line: makeLine(BABYLON, scene, "bKR", boneCol) },
    { part: "ankle", joint: ankleR, len: 0.08, line: makeLine(BABYLON, scene, "bAR", color(BABYLON, "#e8c8b0")) },
    { part: "foot", joint: footR, len: 0.16, line: makeLine(BABYLON, scene, "bFR", color(BABYLON, "#e8c8b0")), foot: true },
  ];

  const pulleys = [
    { id: "spine", joints: [spine1, spine2, chest], pull: new BABYLON.Vector3(0, 0, -1), col: "#c45a7a" },
    { id: "neck", joints: [neck], pull: new BABYLON.Vector3(0, 0, -1), col: "#e07088", invert: true },
    { id: "shoulder", joints: [shoulderL, shoulderR], pull: new BABYLON.Vector3(0, 0, 1), col: "#c49a4a" },
    { id: "elbow", joints: [elbowL, elbowR], pull: new BABYLON.Vector3(0, 0, 1), col: "#d4a06a" },
    { id: "wrist", joints: [wristL, wristR], pull: new BABYLON.Vector3(0, 0, 1), col: "#c4b07a" },
    ...FINGER_LAYOUT.map((finger) => ({
      id: finger.id,
      joints: [...handL[finger.id], ...handR[finger.id]].map((seg) => seg.joint),
      pull: new BABYLON.Vector3(0, 0, 1),
      col: finger.col,
      ring: 0.02,
    })),
    { id: "hip", joints: [hipL, hipR], pull: new BABYLON.Vector3(0, 0, 1), col: "#8a6a7a" },
    { id: "knee", joints: [kneeL, kneeR], pull: new BABYLON.Vector3(0, 0, -1), col: "#c43a3a" },
    { id: "ankle", joints: [ankleL, ankleR], pull: new BABYLON.Vector3(0, 0, 1), col: "#a07080" },
  ].map((entry, i) => ({
    ...entry,
    rings: entry.joints.map((joint, j) => {
      const ring = makeRing(BABYLON, scene, `pulley-${i}-${j}`, color(BABYLON, entry.col), entry.ring || 0.048);
      ring.parent = joint;
      return ring;
    }),
    ticks: entry.joints.map((joint, j) => {
      const tick = makeTick(BABYLON, scene, `tick-${i}-${j}`, color(BABYLON, "#ffe08a"));
      tick.parent = joint;
      return { tick, joint, pull: entry.pull };
    }),
  }));

  const cascos = {
    shoulder: { id: "cascoShoulder", visuals: [cascoShL, cascoShR], pair: true },
    hip: { id: "cascoHip", visuals: [cascoHpL, cascoHpR], pair: true },
    nape: { id: "cascoNape", visuals: [cascoNape] },
    base: { id: "cascoBase", visuals: [cascoBase] },
    wrist: { id: "cascoWrist", visuals: [cascoWrL, cascoWrR], pair: true },
    sole: { id: "cascoSole", visuals: [cascoSoleL, cascoSoleR], pair: true },
  };

  const figure = {
    root,
    hips,
    cascoBase: cascoBase.root,
    spine1,
    spine2,
    chest,
    neck,
    head,
    shoulderL,
    shoulderR,
    upperL,
    upperR,
    elbowL,
    elbowR,
    wristL,
    wristR,
    handL,
    handR,
    hipL,
    hipR,
    kneeL,
    kneeR,
    ankleL,
    ankleR,
    footL,
    footR,
    bones,
    pulleys,
    cascos,
  };
  createWomanFlesh(BABYLON, scene, figure);
  return figure;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function posePulleyFigure(figure, sliders) {
  const t = (id, fallback = 0.35) => {
    const n = Number(sliders[id]);
    return Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;
  };

  const spine = t("spine");
  const sitSpine = 0.42;
  figure.spine1.rotation.set(lerp(sitSpine, -0.1, spine), 0, 0);
  figure.spine2.rotation.set(lerp(sitSpine, -0.05, spine), 0, 0);
  figure.chest.rotation.set(lerp(sitSpine * 0.65, 0.12, spine), 0, 0);

  const neck = t("neck");
  figure.neck.rotation.set(lerp(-0.85, 0.35, neck), 0, 0);
  figure.head.rotation.set(lerp(-0.25, 0.12, neck), 0, 0);

  const shL = t("shoulderL");
  const shR = t("shoulderR");
  figure.upperL.rotation.set(lerp(-1.05, -0.14, shL), 0, lerp(0.2, 0.1, shL));
  figure.upperR.rotation.set(lerp(-1.05, -0.14, shR), 0, lerp(-0.2, -0.1, shR));

  figure.elbowL.rotation.set(lerp(-1.45, -0.06, t("elbowL")), 0, 0);
  figure.elbowR.rotation.set(lerp(-1.45, -0.06, t("elbowR")), 0, 0);

  figure.wristL.rotation.set(lerp(-0.7, 0.02, t("wristL")), 0, 0);
  figure.wristR.rotation.set(lerp(-0.7, 0.02, t("wristR")), 0, 0);

  const fingerSit = 1.15;
  for (const finger of FINGER_LAYOUT) {
    const foldL = t(finger.id + "L");
    const foldR = t(finger.id + "R");
    figure.handL[finger.id].forEach((seg, i) => {
      if (finger.id === "thumb" && i === 0) {
        seg.joint.rotation.set(lerp(0.55, 0.12, foldL), 0, lerp(-0.85, -0.28, foldL));
      } else {
        seg.joint.rotation.set(lerp(fingerSit, 0.04, foldL), 0, 0);
      }
    });
    figure.handR[finger.id].forEach((seg, i) => {
      if (finger.id === "thumb" && i === 0) {
        seg.joint.rotation.set(lerp(0.55, 0.12, foldR), 0, lerp(0.85, 0.28, foldR));
      } else {
        seg.joint.rotation.set(lerp(fingerSit, 0.04, foldR), 0, 0);
      }
    });
  }

  const hpL = t("hipL");
  const hpR = t("hipR");
  figure.hipL.rotation.set(lerp(-1.15, -0.06, hpL), 0, lerp(0.08, 0.028, hpL));
  figure.hipR.rotation.set(lerp(-1.15, -0.06, hpR), 0, lerp(-0.08, -0.028, hpR));

  figure.kneeL.rotation.set(lerp(1.45, 0.06, t("kneeL")), 0, 0);
  figure.kneeR.rotation.set(lerp(1.45, 0.06, t("kneeR")), 0, 0);

  figure.ankleL.rotation.set(lerp(0.55, 0.04, t("ankleL")), 0, 0);
  figure.ankleR.rotation.set(lerp(0.55, 0.04, t("ankleR")), 0, 0);

  const spin = (id, fallback = 0) => {
    const n = Number(sliders[id]);
    return Number.isFinite(n) ? Math.min(1, Math.max(-1, n)) : fallback;
  };
  if (figure.cascos) {
    for (const group of Object.values(figure.cascos)) {
      const spec = CASCO_GROUPS.find((item) => item.id === group.id);
      const turn = spec?.turn || DEFAULT_TURN;
      group.visuals.forEach((visual, index) => {
        const side = group.pair ? (index === 0 ? "L" : "R") : "";
        visual.root.rotation.set(
          spin(group.id + side + "X") * turn.X,
          spin(group.id + side + "Y") * turn.Y,
          spin(group.id + side + "Z") * turn.Z,
        );
      });
    }
  }
}

export function drawPulleyFigure(BABYLON, figure) {
  if (figure.sculpt && figure.sculpt.drive !== false) driveSculptFromPulleys(BABYLON, figure);
  else if (!figure.sculpt && figure.bodyMode !== "lines") {
    updateWomanSkin(BABYLON, figure);
    alignTorsoMass(BABYLON, figure);
  }
  if (figure.bodyMode === "flesh") return;
  for (const bone of figure.bones) {
    bone.joint.computeWorldMatrix(true);
    const start = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Zero(), bone.joint.getWorldMatrix());
    const localEnd = bone.foot ? new BABYLON.Vector3(0, -0.02, bone.len) : new BABYLON.Vector3(0, -bone.len, 0);
    const end = BABYLON.Vector3.TransformCoordinates(localEnd, bone.joint.getWorldMatrix());
    updateLine(BABYLON, bone.line, start, end);
  }
  for (const pulley of figure.pulleys) {
    for (const { tick, joint, pull } of pulley.ticks) {
      joint.computeWorldMatrix(true);
      const origin = BABYLON.Vector3.Zero();
      const out = pull.scale(0.07);
      updateLine(BABYLON, tick, origin, out);
    }
  }
}

export function createPulleyStudio(BABYLON, engine, canvas) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0.09, 0.07, 0.08, 1);

  const camera = new BABYLON.ArcRotateCamera(
    "cam",
    Math.PI / 2 - 0.28,
    1.02,
    2.55,
    new BABYLON.Vector3(0, 0.96, 0),
    scene,
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 1.8;
  camera.upperRadiusLimit = 6;
  camera.wheelPrecision = 40;
  camera.minZ = 0.05;

  const hemi = new BABYLON.HemisphericLight("hemi", new BABYLON.Vector3(0.2, 1, 0.28), scene);
  hemi.intensity = 0.78;
  hemi.groundColor = new BABYLON.Color3(0.32, 0.16, 0.14);
  const key = new BABYLON.DirectionalLight("key", new BABYLON.Vector3(-0.35, -0.85, 0.55), scene);
  key.intensity = 0.82;
  const fill = new BABYLON.DirectionalLight("fill", new BABYLON.Vector3(0.85, -0.15, -0.25), scene);
  fill.intensity = 0.32;
  const rim = new BABYLON.DirectionalLight("rim", new BABYLON.Vector3(0.15, 0.15, -1), scene);
  rim.intensity = 0.22;

  const ground = BABYLON.MeshBuilder.CreateLines("g", {
    points: [
      new BABYLON.Vector3(-0.7, 0, -0.4), new BABYLON.Vector3(0.7, 0, -0.4),
      new BABYLON.Vector3(0.7, 0, 0.4), new BABYLON.Vector3(-0.7, 0, 0.4),
      new BABYLON.Vector3(-0.7, 0, -0.4),
    ],
  }, scene);
  ground.color = new BABYLON.Color3(0.25, 0.18, 0.18);

  const figure = createPulleyFigure(BABYLON, scene);
  return { scene, camera, figure, ground };
}

export function applyPulleyBackdrop(BABYLON, scene, figure, ground, amount) {
  const t = Math.min(1, Math.max(0, Number(amount) || 0));
  scene.clearColor = new BABYLON.Color4(0.09 + 0.87 * t, 0.07 + 0.86 * t, 0.08 + 0.83 * t, 1);
  if (ground) {
    ground.color = new BABYLON.Color3(0.25 + 0.32 * t, 0.18 + 0.26 * t, 0.18 + 0.26 * t);
  }
  const bone = new BABYLON.Color3(0.94 - 0.58 * t, 0.82 - 0.58 * t, 0.77 - 0.54 * t);
  const foot = new BABYLON.Color3(0.91 - 0.52 * t, 0.78 - 0.52 * t, 0.69 - 0.44 * t);
  for (const item of figure.bones) {
    item.line.color = item.foot ? foot : bone;
  }
}
