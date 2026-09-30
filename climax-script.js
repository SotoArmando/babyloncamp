import { easeIn, easeInOut, easeOut, lerp, propBallFlight, span } from "./prop-climax.js";

const POSE_KEYS = ["x", "y", "z", "rx", "ry", "rz", "sx", "sy", "sz", "camA", "camR", "punch", "star", "starSpin"];

function freshPose(half) {
  return { x: 0, y: half, z: 0, rx: 0, ry: 0.28, rz: 0, sx: 1, sy: 1, sz: 1, camA: 0, camR: 1, punch: 0, star: 0, starSpin: 0 };
}

function tokenize(source) {
  const tokens = [];
  let i = 0;
  let line = 1;
  const push = (kind, value) => tokens.push({ kind, value, line });
  while (i < source.length) {
    const c = source[i];
    if (c === "#") {
      while (i < source.length && source[i] !== "\n") i += 1;
      continue;
    }
    if (c === " " || c === "\t" || c === "\r") {
      i += 1;
      continue;
    }
    if (c === "\n") {
      push("nl", "\n");
      line += 1;
      i += 1;
      continue;
    }
    const two = source.slice(i, i + 2);
    if (two === ">=" || two === "<=" || two === "==" || two === "!=" || two === "&&" || two === "||") {
      push("op", two);
      i += 2;
      continue;
    }
    if ("+-*/(),.<>?:=".includes(c)) {
      push("op", c);
      i += 1;
      continue;
    }
    if ((c >= "0" && c <= "9") || (c === "." && source[i + 1] >= "0" && source[i + 1] <= "9")) {
      let j = i + 1;
      while (j < source.length && /[0-9.]/.test(source[j])) j += 1;
      push("num", Number(source.slice(i, j)));
      i = j;
      continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i + 1;
      while (j < source.length && /[A-Za-z0-9_]/.test(source[j])) j += 1;
      push("name", source.slice(i, j));
      i = j;
      continue;
    }
    throw new Error(`Carácter inesperado en la línea ${line}: ${c}`);
  }
  const compact = [];
  for (const token of tokens) {
    if (token.kind === "nl" && compact[compact.length - 1]?.kind === "nl") continue;
    compact.push(token);
  }
  while (compact[0]?.kind === "nl") compact.shift();
  return compact;
}

function compileClimaxScript(source) {
  const tokens = tokenize(source);
  let at = 0;
  const peek = () => tokens[at] || { kind: "eof", value: "", line: 0 };
  const eat = (kind, value) => {
    const token = peek();
    if (token.kind !== kind || (value != null && token.value !== value)) return false;
    at += 1;
    return true;
  };
  const skipNl = () => {
    while (eat("nl")) {}
  };
  const expect = (kind, value) => {
    const token = peek();
    if (!eat(kind, value)) {
      throw new Error(`Se esperaba ${value || kind} en la línea ${token.line || "?"}`);
    }
    return token;
  };

  function parseArgs() {
    const args = [];
    expect("op", "(");
    skipNl();
    if (!eat("op", ")")) {
      args.push(parseTernary());
      while (eat("op", ",")) {
        skipNl();
        args.push(parseTernary());
      }
      expect("op", ")");
    }
    return args;
  }

  function parsePrimary() {
    const token = peek();
    if (eat("num")) return { type: "num", value: token.value };
    if (eat("op", "(")) {
      const inner = parseTernary();
      expect("op", ")");
      return inner;
    }
    if (token.kind === "name") {
      at += 1;
      if (peek().kind === "op" && peek().value === "(") {
        return { type: "call", name: token.value, args: parseArgs() };
      }
      let node = { type: "name", name: token.value };
      while (eat("op", ".")) {
        const key = expect("name");
        node = { type: "member", object: node, key: key.value };
      }
      return node;
    }
    throw new Error(`Expresión incompleta en la línea ${token.line || "?"}`);
  }

  function parseUnary() {
    if (eat("op", "-")) return { type: "neg", expr: parseUnary() };
    return parsePrimary();
  }

  function parseMul() {
    let node = parseUnary();
    while (peek().kind === "op" && (peek().value === "*" || peek().value === "/")) {
      const op = peek().value;
      at += 1;
      node = { type: "bin", op, left: node, right: parseUnary() };
    }
    return node;
  }

  function parseAdd() {
    let node = parseMul();
    while (peek().kind === "op" && (peek().value === "+" || peek().value === "-")) {
      const op = peek().value;
      at += 1;
      node = { type: "bin", op, left: node, right: parseMul() };
    }
    return node;
  }

  function parseCmp() {
    let node = parseAdd();
    while (peek().kind === "op" && ["<", ">", "<=", ">=", "==", "!="].includes(peek().value)) {
      const op = peek().value;
      at += 1;
      node = { type: "bin", op, left: node, right: parseAdd() };
    }
    return node;
  }

  function parseAnd() {
    let node = parseCmp();
    while (eat("op", "&&")) node = { type: "bin", op: "&&", left: node, right: parseCmp() };
    return node;
  }

  function parseOr() {
    let node = parseAnd();
    while (eat("op", "||")) node = { type: "bin", op: "||", left: node, right: parseAnd() };
    return node;
  }

  function parseTernary() {
    const test = parseOr();
    if (!eat("op", "?")) return test;
    const yes = parseTernary();
    expect("op", ":");
    return { type: "tern", test, yes, no: parseTernary() };
  }

  function parseBlock(stop) {
    const body = [];
    skipNl();
    while (peek().kind !== "eof" && !(peek().kind === "name" && stop.includes(peek().value))) {
      body.push(parseStmt());
      skipNl();
    }
    return body;
  }

  function parseStmt() {
    const token = peek();
    if (eat("name", "done")) return { type: "done" };
    if (eat("name", "when") || token.value === "if" && eat("name", "if")) {
      const kind = token.value;
      const test = parseTernary();
      expect("nl");
      const yes = parseBlock(kind === "if" ? ["else", "end"] : ["end"]);
      let no = null;
      if (kind === "if" && eat("name", "else")) {
        expect("nl");
        no = parseBlock(["end"]);
      }
      expect("name", "end");
      return { type: kind, test, yes, no };
    }
    if (token.kind === "name") {
      at += 1;
      expect("op", "=");
      const expr = parseTernary();
      return { type: "assign", name: token.value, expr };
    }
    throw new Error(`Frase desconocida en la línea ${token.line || "?"}`);
  }

  const body = parseBlock([]);
  if (peek().kind !== "eof") {
    throw new Error(`Sobran palabras en la línea ${peek().line}`);
  }

  const fns = {
    easeOut,
    easeIn,
    easeInOut,
    span,
    lerp,
    sin: Math.sin,
    cos: Math.cos,
    atan2: Math.atan2,
    min: Math.min,
    max: Math.max,
    sqrt: Math.sqrt,
    abs: Math.abs,
    ballFlight: propBallFlight,
  };

  function evalExpr(node, env) {
    if (node.type === "num") return node.value;
    if (node.type === "name") {
      if (node.name === "t") return env.t;
      if (node.name === "half") return env.half;
      if (node.name === "pi") return Math.PI;
      if (Object.prototype.hasOwnProperty.call(env.locals, node.name)) return env.locals[node.name];
      if (Object.prototype.hasOwnProperty.call(env.pose, node.name)) return env.pose[node.name];
      throw new Error(`Nombre desconocido: ${node.name}`);
    }
    if (node.type === "member") return evalExpr(node.object, env)[node.key];
    if (node.type === "neg") return -evalExpr(node.expr, env);
    if (node.type === "tern") return evalExpr(node.test, env) ? evalExpr(node.yes, env) : evalExpr(node.no, env);
    if (node.type === "call") {
      const fn = fns[node.name];
      if (!fn) throw new Error(`Función desconocida: ${node.name}`);
      return fn(...node.args.map((arg) => evalExpr(arg, env)));
    }
    const left = evalExpr(node.left, env);
    if (node.op === "&&") return left && evalExpr(node.right, env);
    if (node.op === "||") return left || evalExpr(node.right, env);
    const right = evalExpr(node.right, env);
    if (node.op === "+") return left + right;
    if (node.op === "-") return left - right;
    if (node.op === "*") return left * right;
    if (node.op === "/") return left / right;
    if (node.op === "<") return left < right;
    if (node.op === ">") return left > right;
    if (node.op === "<=") return left <= right;
    if (node.op === ">=") return left >= right;
    if (node.op === "==") return left === right;
    if (node.op === "!=") return left !== right;
    throw new Error(`Operador desconocido: ${node.op}`);
  }

  function run(stmts, env) {
    for (const stmt of stmts) {
      if (stmt.type === "done") return true;
      if (stmt.type === "assign") {
        const value = evalExpr(stmt.expr, env);
        if (POSE_KEYS.includes(stmt.name)) {
          env.pose[stmt.name] = value;
          env.wrote = true;
        } else env.locals[stmt.name] = value;
      } else if (stmt.type === "when" || stmt.type === "if") {
        const branch = evalExpr(stmt.test, env) ? stmt.yes : stmt.no;
        if (branch && run(branch, env)) return true;
      }
    }
    return false;
  }

  function poseAt(t, half) {
    const env = { t, half, pose: freshPose(half), locals: {}, wrote: false };
    run(body, env);
    return env;
  }

  // Si este t no asigna ningún canal, la pose es la del último t anterior que sí asignó.
  // Así un script que termina antes de t = 1 se queda en su última pose y no salta al origen.
  function lastWritten(t, half) {
    const steps = 480;
    for (let i = steps - 1; i >= 0; i -= 1) {
      const u = t * (i / steps);
      const env = poseAt(u, half);
      if (env.wrote) return env.pose;
    }
    return null;
  }

  let held = null;
  return (t, half) => {
    const env = poseAt(t, half);
    if (env.wrote) {
      held = { t, half, pose: env.pose };
      return { ...env.pose };
    }
    if (held && held.half === half && held.t <= t && t - held.t <= 0.02) return { ...held.pose };
    const pose = lastWritten(t, half) || env.pose;
    held = { t, half, pose };
    return { ...pose };
  };
}

const DROP_SCRIPT = `
# copia de drop
when t < 0.16
  y = 1.68
  rx = 0.1
  ry = 0.22
  done
end
when t < 0.4
  k = easeIn(span(t, 0.16, 0.4), 2.6)
  y = lerp(1.68, half, k)
  rx = 0.1 + k * 0.18
  ry = 0.22 + k * 0.12
  done
end
when t < 0.5
  k = span(t, 0.4, 0.5)
  squash = sin(k * pi) * 0.26
  sy = 1 - squash
  sx = 1 + squash * 0.55
  sz = 1 + squash * 0.55
  y = half * sy
  rx = 0.28 * (1 - k)
  ry = 0.34
  punch = (1 - k) * 0.07
  done
end
when t < 0.7
  k = span(t, 0.5, 0.7)
  y = half + sin(k * pi) * 0.3 * (1 - k * 0.35)
  rx = 0.05
  ry = 0.34 + k * 0.15
  land = k > 0.82 ? (k - 0.82) / 0.18 : k < 0.12 ? 1 - k / 0.12 : 0
  squash = land * 0.14
  sy = 1 - squash
  sx = 1 + squash * 0.4
  sz = 1 + squash * 0.4
  if squash > 0 && y < half + 0.06
    y = half * sy
  end
  done
end
when t < 0.84
  k = span(t, 0.7, 0.84)
  y = half + sin(k * pi) * 0.1 * (1 - k)
  ry = 0.49 + k * 0.08
  done
end
y = half
ry = 0.57 + easeOut(span(t, 0.84, 1)) * 0.22
rx = 0.04
`;

const TURN_SCRIPT = `
# copia de turn
spin = easeInOut(span(t, 0.06, 0.84))
settle = easeOut(span(t, 0.84, 1))
y = half + 0.055
rx = 0.14
ry = spin * pi * 2 + settle * 0.08
camA = easeInOut(t) * 0.42
`;

const TORCH_SCRIPT = `
# copia de torch
sweep = t < 0.5 ? lerp(-0.72, 0.78, easeInOut(span(t, 0.1, 0.42))) : lerp(0.78, -0.55, easeInOut(span(t, 0.54, 0.88)))
y = 0.52
rx = 0.62 + sin(t * pi) * 0.06
ry = sweep
rz = sweep * 0.08
camA = sweep * 0.12
`;

const TORCH_FRONT_SCRIPT = `
# copia de torch-front
sweep = t < 0.5 ? lerp(-0.72, 0.78, easeInOut(span(t, 0.1, 0.42))) : lerp(0.78, -0.55, easeInOut(span(t, 0.54, 0.88)))
face = pi
y = 0.52
rx = 0.62 + sin(t * pi) * 0.06
ry = face + sweep
rz = sweep * 0.08
camA = sweep * 0.12
`;

const DRIVE_PLAIN_SCRIPT = `
# copia de drive-plain
x0 = -1
z0 = 1.18
along = t < 0.4 ? span(t, 0, 0.4) * 0.84 : t < 0.84 ? 0.84 + easeOut(span(t, 0.4, 0.84)) * 0.16 : 1
x = lerp(x0, 0, along)
z = lerp(z0, 0, along)
y = half
ry = atan2(-x0, -z0)
camA = 0
camR = 1
punch = 0
`;

const DRIVE_SCRIPT = `
# copia de drive
x0 = -1
z0 = 1.18
along = t < 0.4 ? span(t, 0, 0.4) * 0.84 : t < 0.84 ? 0.84 + easeOut(span(t, 0.4, 0.84)) * 0.16 : 1
x = lerp(x0, 0, along)
z = lerp(z0, 0, along)
y = half
ry = atan2(-x0, -z0)
camA = 0
camR = lerp(1.1, 1, along)
punch = 0
if t >= 0.38 && t < 0.86
  rx = -0.08 * sin(span(t, 0.38, 0.86) * pi)
end
`;

const BALL_SCRIPT = `
# copia de ball
when t <= 0.1
  y = 1.72
  rx = 0.2
  done
end
r = half * 0.92
flight = ballFlight((t - 0.1) * 3.55, 1.72 - r, 16.5, 0.58)
squash = flight.squash
y = r * (1 - squash) + flight.y
x = easeOut(span(t, 0.1, 0.92)) * 0.28
rx = flight.spin
ry = 0.4
sy = 1 - squash
sx = 1 + squash * 0.42
sz = 1 + squash * 0.42
`;

export const CLIMAX_SCRIPT_COPIES = [
  { id: "drop", source: "drop", label: "Caída", sourceText: DROP_SCRIPT },
  { id: "turn", source: "turn", label: "Giro", sourceText: TURN_SCRIPT },
  { id: "torch", source: "torch", label: "Antorcha", sourceText: TORCH_SCRIPT },
  { id: "torch-front", source: "torch-front", label: "Antorcha de frente", sourceText: TORCH_FRONT_SCRIPT },
  { id: "drive-plain", source: "drive-plain", label: "Recorrido", sourceText: DRIVE_PLAIN_SCRIPT },
  { id: "drive", source: "drive", label: "Recorrido con cámara", sourceText: DRIVE_SCRIPT },
  { id: "ball", source: "ball", label: "Pelota", sourceText: BALL_SCRIPT },
];

const compiled = new Map(CLIMAX_SCRIPT_COPIES.map((copy) => [copy.id, compileClimaxScript(copy.sourceText)]));

export function scriptPose(id, t, half) {
  const play = compiled.get(id);
  if (!play) throw new Error(`No hay un clímax escrito para ${id}`);
  return play(t, half);
}

export function compileClimaxSource(source) {
  return compileClimaxScript(source);
}
