/** Config compartida del anuncio 4: ola, logo y formas 2D animadas. */

export const STORAGE_KEY = "ad4-banner";
export const STAGE = { w: 300, h: 250 };

export const BANNER_DEFAULTS = {
  logo: "NEXUS",
  showMark: true,
  logoColor: "#04110e",
  waveTop: "#7af7c5",
  waveMid: "#00f0c8",
  waveBottom: "#6d7cff",
  speed: 2.2,
  amplitude: 5.5,
  height: 56,
  ring: "#6d7cff",
  core: "#00f0c8",
  needle: "#ff3cac",
  shapes: [],
};

export const WAVE_PRESETS = {
  nexus: {
    logo: "NEXUS",
    showMark: true,
    logoColor: "#04110e",
    waveTop: "#7af7c5",
    waveMid: "#00f0c8",
    waveBottom: "#6d7cff",
    ring: "#6d7cff",
    core: "#00f0c8",
    needle: "#ff3cac",
  },
  magenta: {
    logo: "NOVA",
    waveTop: "#ffb3d9",
    waveMid: "#ff3cac",
    waveBottom: "#6d7cff",
    ring: "#ff3cac",
    core: "#ffb3d9",
    needle: "#00f0c8",
  },
  solar: {
    logo: "SOLAR",
    waveTop: "#ffe8a3",
    waveMid: "#ffd166",
    waveBottom: "#ff7b54",
    ring: "#ffd166",
    core: "#ff7b54",
    needle: "#6d7cff",
    logoColor: "#2a1a08",
  },
  ice: {
    logo: "FROST",
    waveTop: "#e8f4ff",
    waveMid: "#4cc9f0",
    waveBottom: "#6d7cff",
    ring: "#4cc9f0",
    core: "#e8f4ff",
    needle: "#ff3cac",
  },
};

export function defaultShapes() {
  return [
    {
      id: uid(),
      type: "diamond",
      fill: "#00f0c8",
      opacity: 0.9,
      x: 150,
      y: 92,
      w: 34,
      h: 34,
      anim: {
        move: false,
        expand: true,
        from: { x: 150, y: 92, scale: 0.4 },
        to: { x: 150, y: 92, scale: 1.35 },
        duration: 1.35,
        delay: 0,
        easing: "easeInOut",
        loop: true,
        alternate: true,
      },
    },
    {
      id: uid(),
      type: "ellipse",
      fill: "#6d7cff",
      opacity: 0.55,
      x: 52,
      y: 78,
      w: 26,
      h: 18,
      anim: {
        move: true,
        expand: false,
        from: { x: 40, y: 70, scale: 1 },
        to: { x: 248, y: 108, scale: 1 },
        duration: 2.6,
        delay: 0,
        easing: "easeInOut",
        loop: true,
        alternate: true,
      },
    },
  ];
}

export function uid() {
  return `s-${Math.random().toString(36).slice(2, 8)}`;
}

export function newShape(type = "rect") {
  return {
    id: uid(),
    type,
    fill: type === "diamond" ? "#00f0c8" : type === "triangle" ? "#ff3cac" : "#6d7cff",
    opacity: 0.85,
    x: 150,
    y: 90,
    w: 32,
    h: 32,
    anim: {
      move: false,
      expand: false,
      from: { x: 120, y: 90, scale: 0.5 },
      to: { x: 180, y: 90, scale: 1.3 },
      duration: 1.4,
      delay: 0,
      easing: "easeInOut",
      loop: true,
      alternate: true,
    },
  };
}

export function loadBanner() {
  const data = { ...BANNER_DEFAULTS, shapes: defaultShapes() };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return data;
    const parsed = JSON.parse(raw);
    Object.assign(data, parsed);
    if (!Array.isArray(data.shapes)) data.shapes = defaultShapes();
  } catch {
    /* ignore */
  }
  return data;
}

export function saveBanner(banner) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(banner));
}

export function applyWaveToDom(root, banner) {
  if (!root) return;
  const name = root.querySelector(".ad-brand-name");
  const mark = root.querySelector(".ad-brand-mark");
  const wave = root.querySelector(".ad-wave");
  const svg = root.querySelector(".ad-wave-svg");
  const stops = root.querySelectorAll("[data-wave-stops] stop, #ad4-wave-fill stop");
  if (name) {
    name.textContent = banner.logo || "NEXUS";
    name.style.color = banner.logoColor;
  }
  if (mark) {
    mark.style.display = banner.showMark ? "" : "none";
    mark.style.background = banner.logoColor;
  }
  if (wave) wave.style.height = `${banner.height}px`;
  if (svg) svg.setAttribute("viewBox", `0 0 300 ${banner.height}`);
  if (stops[0]) stops[0].setAttribute("stop-color", banner.waveTop);
  if (stops[1]) stops[1].setAttribute("stop-color", banner.waveMid);
  if (stops[2]) stops[2].setAttribute("stop-color", banner.waveBottom);
}

function ease(t, name) {
  const x = Math.min(1, Math.max(0, t));
  if (name === "linear") return x;
  if (name === "easeIn") return x * x;
  if (name === "easeOut") return 1 - (1 - x) * (1 - x);
  return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
}

export function shapeTransform(shape, elapsedMs) {
  const a = shape.anim || {};
  const rest = { x: shape.x, y: shape.y, scale: 1 };
  if (!a.move && !a.expand) return rest;

  const duration = Math.max(0.08, Number(a.duration) || 1);
  const delay = Math.max(0, Number(a.delay) || 0);
  let t = (elapsedMs / 1000 - delay) / duration;
  if (t < 0) return {
    x: a.move ? a.from.x : rest.x,
    y: a.move ? a.from.y : rest.y,
    scale: a.expand ? a.from.scale : 1,
  };

  if (a.loop) {
    if (a.alternate) {
      const cycle = Math.floor(t);
      t -= cycle;
      if (cycle % 2) t = 1 - t;
    } else {
      t -= Math.floor(t);
    }
  } else {
    t = Math.min(1, t);
  }

  const k = ease(t, a.easing || "easeInOut");
  const from = a.from || rest;
  const to = a.to || rest;
  return {
    x: a.move ? from.x + (to.x - from.x) * k : rest.x,
    y: a.move ? from.y + (to.y - from.y) * k : rest.y,
    scale: a.expand ? from.scale + (to.scale - from.scale) * k : 1,
  };
}

function shapeInner(svg, shape) {
  const ns = "http://www.w3.org/2000/svg";
  const hw = shape.w / 2;
  const hh = shape.h / 2;
  let node;
  if (shape.type === "ellipse") {
    node = document.createElementNS(ns, "ellipse");
    node.setAttribute("rx", hw);
    node.setAttribute("ry", hh);
  } else if (shape.type === "diamond") {
    node = document.createElementNS(ns, "polygon");
    node.setAttribute("points", `0,${-hh} ${hw},0 0,${hh} ${-hw},0`);
  } else if (shape.type === "triangle") {
    node = document.createElementNS(ns, "polygon");
    node.setAttribute("points", `0,${-hh} ${hw},${hh} ${-hw},${hh}`);
  } else {
    node = document.createElementNS(ns, "rect");
    node.setAttribute("x", -hw);
    node.setAttribute("y", -hh);
    node.setAttribute("width", shape.w);
    node.setAttribute("height", shape.h);
  }
  node.setAttribute("fill", shape.fill);
  node.setAttribute("fill-opacity", String(shape.opacity ?? 1));
  node.dataset.shapeId = shape.id;
  node.dataset.shapeType = shape.type;
  svg.appendChild(node);
  return node;
}

export function renderShapeLayer(svg, shapes, elapsedMs, selectedId = null) {
  const ids = new Set(shapes.map((s) => s.id));
  [...svg.querySelectorAll("[data-shape-id]")].forEach((el) => {
    if (!ids.has(el.dataset.shapeId)) el.remove();
  });

  for (const shape of shapes) {
    let node = svg.querySelector(`[data-shape-id="${shape.id}"]`);
    if (!node || node.dataset.shapeType !== shape.type) {
      node?.remove();
      node = shapeInner(svg, shape);
      node.dataset.shapeType = shape.type;
    }
    const hw = shape.w / 2;
    const hh = shape.h / 2;
    if (shape.type === "ellipse") {
      node.setAttribute("rx", hw);
      node.setAttribute("ry", hh);
    } else if (shape.type === "diamond") {
      node.setAttribute("points", `0,${-hh} ${hw},0 0,${hh} ${-hw},0`);
    } else if (shape.type === "triangle") {
      node.setAttribute("points", `0,${-hh} ${hw},${hh} ${-hw},${hh}`);
    } else {
      node.setAttribute("x", -hw);
      node.setAttribute("y", -hh);
      node.setAttribute("width", shape.w);
      node.setAttribute("height", shape.h);
    }
    const tr = shapeTransform(shape, elapsedMs);
    node.setAttribute("fill", shape.fill);
    node.setAttribute("fill-opacity", String(shape.opacity ?? 1));
    node.setAttribute("transform", `translate(${tr.x} ${tr.y}) scale(${tr.scale})`);
    node.setAttribute("stroke", shape.id === selectedId ? "#f5f7ff" : "none");
    node.setAttribute("stroke-width", shape.id === selectedId ? "1.5" : "0");
    node.style.vectorEffect = "non-scaling-stroke";
  }
}

export function startShapePlayer(svg, getBanner, getSelectedId = () => null, isPlaying = () => true) {
  const t0 = performance.now();
  let raf = 0;
  const loop = (now) => {
    raf = requestAnimationFrame(loop);
    if (!isPlaying()) return;
    const banner = getBanner();
    renderShapeLayer(svg, banner.shapes || [], now - t0, getSelectedId());
  };
  raf = requestAnimationFrame(loop);
  return () => cancelAnimationFrame(raf);
}

export function wavePathD(phase, amp, lift, height) {
  const w = 300;
  const h = height;
  const base = h * 0.54 - lift * 10;
  let d = `M 0 ${h} L 0 ${base + Math.sin(phase) * amp}`;
  for (let x = 6; x <= w; x += 6) {
    d += ` L ${x} ${base + Math.sin(x * 0.048 + phase) * amp}`;
  }
  return `${d} L ${w} ${h} Z`;
}
