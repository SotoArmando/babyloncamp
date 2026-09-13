import { defaultPulleyState, builtInPoseByFile } from "./soma-poleas.js";

const PARTS = {
  hombro: { pulley: "shoulder", casco: "cascoShoulder", pair: true },
  codo: { pulley: "elbow", pair: true },
  muneca: { pulley: "wrist", casco: "cascoWrist", pair: true },
  muñeca: { pulley: "wrist", casco: "cascoWrist", pair: true },
  cadera: { pulley: "hip", casco: "cascoHip", pair: true },
  rodilla: { pulley: "knee", pair: true },
  tobillo: { pulley: "ankle", pair: true },
  suela: { casco: "cascoSole", pair: true },
  pulgar: { pulley: "thumb", pair: true },
  indice: { pulley: "index", pair: true },
  índice: { pulley: "index", pair: true },
  medio: { pulley: "middle", pair: true },
  anular: { pulley: "ring", pair: true },
  menique: { pulley: "pinky", pair: true },
  meñique: { pulley: "pinky", pair: true },
  columna: { pulley: "spine", pair: false },
  cuello: { pulley: "neck", pair: false },
  nuca: { casco: "cascoNape", pair: false },
  base: { casco: "cascoBase", pair: false },
};

const SIDES = {
  i: "L",
  izq: "L",
  izquierda: "L",
  l: "L",
  d: "R",
  der: "R",
  derecha: "R",
  r: "R",
};

export const ACCION_EXAMPLE = `# saludo
# Brazo I arriba, el codo agita, y otra vez. Parar corta el ciclo.

pose de-pie en 0.35

repite siempre
  junto
    casco hombro I x a -0.62 en 0.4
    casco hombro I z a -0.28 en 0.4
    polea codo I a 0.22 en 0.32
  fin
  casco hombro I z a -0.72 en 0.16
  casco hombro I z a -0.18 en 0.16
  casco hombro I z a -0.72 en 0.16
  casco hombro I z a -0.18 en 0.16
  junto
    casco hombro I x a 0 en 0.38
    casco hombro I z a 0 en 0.38
    polea codo I a 1 en 0.3
  fin
  espera 0.22
fin
`;

function fold(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

function parseTime(raw) {
  const m = String(raw || "").match(/^(-?[\d.]+)s?$/i);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? Math.max(0, n) : null;
}

function parseNumber(raw) {
  const word = fold(raw);
  if (word === "linea" || word === "enlinea") return 1;
  if (word === "sentado" || word === "sentados") return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function takeDuration(tokens, index, fallback = 0.5) {
  if (tokens[index] === "en") {
    const t = parseTime(tokens[index + 1]);
    if (t == null) return { error: "tiempo", duration: fallback, next: index };
    return { duration: t, next: index + 2 };
  }
  return { duration: fallback, next: index };
}

function poseSlug(name) {
  return fold(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "pose";
}

const POSE_FILES = {
  t: "te.json",
  te: "te.json",
};

function poseFile(name) {
  const slug = poseSlug(name);
  return POSE_FILES[slug] || slug + ".json";
}

function resolvePart(name) {
  return PARTS[fold(name)] || null;
}

function resolveSide(token, pair) {
  if (!pair) return "";
  const side = SIDES[fold(token || "")];
  return side || null;
}

function pulleyKey(part, side) {
  return part.pulley + (part.pair ? side : "");
}

function cascoKey(part, side, axis) {
  return part.casco + (part.pair ? side : "") + axis.toUpperCase();
}

function knownKey(key) {
  return Object.prototype.hasOwnProperty.call(defaultPulleyState(), key);
}

function parseLine(line, lineNo) {
  const tokens = line.split(/\s+/).filter(Boolean);
  if (!tokens.length) return null;
  const cmd = fold(tokens[0]);

  if (cmd === "espera" || cmd === "hold") {
    const t = parseTime(tokens[1]);
    if (t == null) return { error: `linea ${lineNo}: espera necesita un tiempo`, line: lineNo };
    return { type: "wait", duration: t, line: lineNo };
  }

  if (cmd === "reposo" || cmd === "standby") {
    const time = takeDuration(tokens, 1, 0.4);
    if (time.error) return { error: `linea ${lineNo}: tiempo inválido`, line: lineNo };
    return { type: "reposo", duration: time.duration, line: lineNo };
  }

  if (cmd === "pose") {
    const rest = tokens.slice(1);
    let en = rest.lastIndexOf("en");
    let nameTokens = rest;
    let duration = 0.5;
    if (en > 0) {
      const time = takeDuration(rest, en, 0.5);
      if (time.error) return { error: `linea ${lineNo}: tiempo inválido`, line: lineNo };
      duration = time.duration;
      nameTokens = rest.slice(0, en);
    }
    const name = nameTokens.join(" ");
    if (!name) return { error: `linea ${lineNo}: pose sin nombre`, line: lineNo };
    return { type: "pose", name, file: poseFile(name), duration, line: lineNo };
  }

  if (cmd === "congela") {
    const name = tokens.slice(1).join(" ");
    if (!name) return { error: `linea ${lineNo}: congela necesita un nombre`, line: lineNo };
    return { type: "freeze", name, file: poseSlug(name) + ".json", line: lineNo };
  }

  if (cmd === "casco") {
    const part = resolvePart(tokens[1]);
    if (!part?.casco) return { error: `linea ${lineNo}: casco de qué parte`, line: lineNo };
    let i = 2;
    let side = "";
    if (part.pair) {
      side = resolveSide(tokens[i], true);
      if (!side) return { error: `linea ${lineNo}: casco pide I o D`, line: lineNo };
      i += 1;
    }
    const axis = fold(tokens[i] || "");
    if (!"xyz".includes(axis)) return { error: `linea ${lineNo}: casco pide eje x y o z`, line: lineNo };
    i += 1;
    if (fold(tokens[i] || "") !== "a") return { error: `linea ${lineNo}: falta "a" y el valor`, line: lineNo };
    const value = parseNumber(tokens[i + 1]);
    if (value == null) return { error: `linea ${lineNo}: valor de casco`, line: lineNo };
    const time = takeDuration(tokens, i + 2, 0.45);
    if (time.error) return { error: `linea ${lineNo}: tiempo inválido`, line: lineNo };
    const key = cascoKey(part, side, axis);
    if (!knownKey(key)) return { error: `linea ${lineNo}: no existe ${key}`, line: lineNo };
    return { type: "tween", duration: time.duration, keys: { [key]: value }, line: lineNo };
  }

  if (cmd === "polea") {
    const part = resolvePart(tokens[1]);
    if (!part?.pulley) return { error: `linea ${lineNo}: polea de qué parte`, line: lineNo };
    let i = 2;
    let side = "";
    if (part.pair) {
      side = resolveSide(tokens[i], true);
      if (!side) return { error: `linea ${lineNo}: polea pide I o D`, line: lineNo };
      i += 1;
    }
    if (fold(tokens[i] || "") !== "a") return { error: `linea ${lineNo}: falta "a" y el valor`, line: lineNo };
    const value = parseNumber(tokens[i + 1]);
    if (value == null) return { error: `linea ${lineNo}: valor de polea`, line: lineNo };
    const time = takeDuration(tokens, i + 2, 0.45);
    if (time.error) return { error: `linea ${lineNo}: tiempo inválido`, line: lineNo };
    const key = pulleyKey(part, side);
    if (!knownKey(key)) return { error: `linea ${lineNo}: no existe ${key}`, line: lineNo };
    return { type: "tween", duration: time.duration, keys: { [key]: Math.min(1, Math.max(0, value)) }, line: lineNo };
  }

  if (cmd === "junto" || cmd === "fin") return { type: cmd, line: lineNo };
  if (cmd === "repite") {
    const word = fold(tokens[1] || "");
    if (word === "siempre" || word === "infinito" || word === "otra") {
      return { type: "repite", count: Infinity, line: lineNo };
    }
    const n = Number(tokens[1]);
    return { type: "repite", count: Number.isFinite(n) ? n : 2, line: lineNo };
  }

  return { error: `linea ${lineNo}: no entiendo "${tokens[0]}"`, line: lineNo };
}

function expandBlocks(ops) {
  const out = [];
  let i = 0;
  while (i < ops.length) {
    const op = ops[i];
    if (op.type === "junto" || op.type === "repite") {
      const inner = [];
      i += 1;
      let depth = 1;
      while (i < ops.length && depth) {
        if (ops[i].type === "junto" || ops[i].type === "repite") depth += 1;
        else if (ops[i].type === "fin") depth -= 1;
        if (depth) inner.push(ops[i]);
        i += 1;
      }
      const kids = expandBlocks(inner);
      if (op.type === "junto") {
        out.push({
          type: "parallel",
          duration: kids.reduce((max, kid) => Math.max(max, kid.duration || 0), 0),
          kids,
          line: op.line,
        });
      } else if (op.count === Infinity) {
        out.push({ type: "cycle", kids, line: op.line });
      } else {
        const n = Math.min(24, Math.max(1, Math.round(op.count)));
        for (let r = 0; r < n; r += 1) out.push(...kids);
      }
    } else if (op.type !== "fin") {
      out.push(op);
      i += 1;
    } else {
      i += 1;
    }
  }
  return out;
}

export function parseAccion(source) {
  const errors = [];
  const raw = [];
  String(source || "")
    .replace(/\r/g, "")
    .split("\n")
    .forEach((text, index) => {
      const line = text.replace(/#.*$/, "").trim();
      if (!line) return;
      const op = parseLine(line, index + 1);
      if (!op) return;
      if (op.error) errors.push(op);
      else raw.push(op);
    });
  if (errors.length) return { ok: false, errors, ops: [] };
  return { ok: true, errors: [], ops: expandBlocks(raw) };
}

export function copyPulleySliders(state) {
  const out = defaultPulleyState();
  for (const key of Object.keys(out)) {
    const n = Number(state[key]);
    if (Number.isFinite(n)) out[key] = n;
  }
  return out;
}

export function mixPulleySliders(from, toKeys, amount, state) {
  const u = amount * amount * (3 - 2 * amount);
  for (const [key, value] of Object.entries(toKeys)) {
    const a = Number(from[key]);
    const b = Number(value);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    state[key] = a + (b - a) * u;
  }
}

export async function fetchPoseSliders(file, loader) {
  const built = builtInPoseByFile(file);
  if (loader) {
    const loaded = await loader(file);
    if (loaded?.sliders) return loaded.sliders;
  }
  return built ? built.sliders : null;
}

function flattenPlay(ops) {
  return ops.map((op) => {
    if (op.type === "parallel") {
      return {
        type: "parallel",
        duration: op.duration,
        line: op.line,
        kids: op.kids.filter((kid) => kid.type === "tween" || kid.type === "pose" || kid.type === "reposo"),
      };
    }
    if (op.type === "cycle") {
      return { type: "cycle", line: op.line, kids: flattenPlay(op.kids) };
    }
    return op;
  });
}

export function createAccionPlayer(ctx) {
  let queue = [];
  let index = 0;
  let elapsed = 0;
  let from = null;
  let playing = false;
  let loopFrom = -1;

  function snapshot() {
    from = copyPulleySliders(ctx.state);
  }

  function keysFor(op) {
    if (op.type === "tween") return op.keys;
    if (op.type === "pose" || op.type === "reposo") return op.sliders || {};
    return {};
  }

  function begin(op) {
    snapshot();
    if (op.type === "parallel") snapshot();
    ctx.onStep?.(op);
  }

  function applyOp(op, t) {
    if (op.type === "wait") return;
    if (op.type === "parallel") {
      for (const kid of op.kids) {
        const u = op.duration ? Math.min(1, (t * op.duration) / Math.max(0.0001, kid.duration || 0)) : 1;
        mixPulleySliders(from, keysFor(kid), Number.isFinite(u) ? u : 1, ctx.state);
      }
      return;
    }
    if (op.type === "tween" || op.type === "pose" || op.type === "reposo") {
      mixPulleySliders(from, keysFor(op), t, ctx.state);
    }
  }

  return {
    get playing() {
      return playing;
    },
    get line() {
      return queue[index]?.line || 0;
    },
    stop() {
      playing = false;
      queue = [];
      index = 0;
      loopFrom = -1;
      ctx.onStop?.();
    },
    async play(source) {
      const parsed = parseAccion(source);
      if (!parsed.ok) {
        ctx.onError?.(parsed.errors);
        return parsed;
      }
      const cues = { ...ctx.cues };

      async function prepareList(ops) {
        const prepared = [];
        for (const op of ops) {
          if (op.type === "freeze") {
            cues[poseSlug(op.name)] = copyPulleySliders(ctx.state);
            ctx.onFreeze?.(op.name, cues[poseSlug(op.name)]);
            continue;
          }
          if (op.type === "cycle") {
            const kids = await prepareList(op.kids);
            if (kids.error) return kids;
            prepared.push({ type: "cycle", kids, line: op.line });
            continue;
          }
          if (op.type === "reposo") {
            const sliders = ctx.standbySliders ? await ctx.standbySliders() : null;
            if (!sliders) return { error: true, errors: [{ error: "no hay standby", line: op.line }] };
            prepared.push({ ...op, sliders });
            continue;
          }
          if (op.type === "pose") {
            const slug = poseSlug(op.name);
            const sliders = cues[slug] || (await fetchPoseSliders(op.file, ctx.loadPose));
            if (!sliders) {
              return { error: true, errors: [{ error: `no encuentro la pose ${op.name}`, line: op.line }] };
            }
            prepared.push({ ...op, sliders });
            continue;
          }
          if (op.type === "parallel") {
            const kids = [];
            for (const kid of op.kids) {
              if (kid.type === "pose") {
                const sliders = await fetchPoseSliders(kid.file, ctx.loadPose);
                if (!sliders) {
                  return { error: true, errors: [{ error: `no encuentro la pose ${kid.name}`, line: kid.line }] };
                }
                kids.push({ ...kid, sliders });
              } else if (kid.type === "reposo") {
                const sliders = ctx.standbySliders ? await ctx.standbySliders() : null;
                if (!sliders) return { error: true, errors: [{ error: "no hay standby", line: kid.line }] };
                kids.push({ ...kid, sliders });
              } else {
                kids.push(kid);
              }
            }
            prepared.push({ ...op, kids, duration: kids.reduce((max, kid) => Math.max(max, kid.duration || 0), 0) });
            continue;
          }
          prepared.push(op);
        }
        return prepared;
      }

      const packed = await prepareList(flattenPlay(parsed.ops));
      if (packed.error) {
        ctx.onError?.(packed.errors);
        return { ok: false, errors: packed.errors };
      }
      const prepared = [];
      loopFrom = -1;
      for (const op of packed) {
        if (op.type === "cycle") {
          loopFrom = prepared.length;
          prepared.push(...op.kids);
          continue;
        }
        prepared.push(op);
      }
      queue = prepared;
      index = 0;
      elapsed = 0;
      playing = true;
      if (queue[0]) begin(queue[0]);
      ctx.onStart?.();
      return { ok: true, errors: [] };
    },
    tick(dt) {
      if (!playing || !queue.length) return;
      const op = queue[index];
      if (!op) {
        playing = false;
        ctx.onStop?.();
        return;
      }
      elapsed += Math.max(0, dt);
      const duration = op.duration || 0;
      const t = duration <= 0 ? 1 : Math.min(1, elapsed / duration);
      applyOp(op, t);
      if (t >= 1) {
        applyOp(op, 1);
        index += 1;
        elapsed = 0;
        if (queue[index]) begin(queue[index]);
        else if (loopFrom >= 0 && queue[loopFrom]) {
          index = loopFrom;
          begin(queue[index]);
        } else {
          playing = false;
          ctx.onDone?.();
          ctx.onStop?.();
        }
      }
    },
  };
}
