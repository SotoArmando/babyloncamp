import {
  FORMATS,
  HANDOFF_TRANSITIONS,
  PLAY_MODES,
  PROP_ACTIONS,
  PROP_TRAILS,
  normalizePropTrailChar,
  playPaletteFields,
} from "./ad-catalog.js";
import {
  activeProfile,
  comboPosterMarkup,
  comboShortTitle,
  loadGalleryStore,
  makeCombo,
  seedCombos,
} from "./ad-profile.js";
import { loadStoredStill } from "./browse-still-store.js?v=store1";
import { normalizeBrowseBlit } from "./browse-still.js?v=still2";
import { INDUSTRIES, industryById, industryShowMap, itemsForIndustry } from "./industry-catalog.js?v=ind5";

const FORMAT_NAME = {
  billboard: "Franja",
  leader: "Leaderboard",
  medium: "Clásico",
  large: "Grande",
  mobile: "Móvil",
  sky: "Columna",
  half: "Vertical",
  nexus: "Nexus+",
};

const OBJECTS = [
  ["hamburger", "Stylish Hamburger"],
  ["car", "Orange Sports Car"],
  ["donut", "Pink Frosted Donut"],
  ["shoe", "White Orange Running Shoe"],
  ["fern", "Potted Fern Plant"],
  ["cardbox", "Cute Stylized Cardbox"],
];

const PLAYS_2D = PLAY_MODES.filter((play) => play.id !== "prop");

const draft = { format: "", group: "", motion: "", object: "", trail: "", trailChar: "", hand: "", tones: 3, seeds: [], palette: [], image: null };
const fields = [
  { id: "trail", label: "Estela", invite: "Abrir", line: "La marca antes del objeto. Por ejemplo: partículas, una gota, o la palabra wow." },
  { id: "format", label: "Formato", invite: "Abrir", line: "El tamaño del anuncio. Por ejemplo: Clásico, 300 × 250." },
  { id: "climax", label: "Clímax", invite: "Abrir", line: "El movimiento. Una escena, como Gota o Tormenta, o un objeto que cae." },
  { id: "object", label: "Objeto", invite: "Abrir", line: "El modelo del centro. Por ejemplo: una hamburguesa o un auto.", when: () => draft.group === "obj" },
  { id: "hand", label: "Hand off", invite: "Abrir", line: "Cómo pasa del movimiento al anuncio. Por ejemplo: cortinilla o iris." },
  { id: "palette", label: "Paleta", invite: "Abrir", line: "Los colores. Con 1, 2 o 3 tonos se arman 6 colores." },
];

let pickKey = "";
let climaxStep = "group";
let returnFocus = null;

function motionName(play) {
  return play.label.replace(/^Clímax · /, "");
}

function paletteFields() {
  if (draft.group === "obj") return playPaletteFields("prop");
  if (draft.group === "2d") return playPaletteFields(draft.motion || "climax");
  return [];
}

function valueText(id) {
  if (id === "format") {
    const format = FORMATS.find((item) => item.id === draft.format);
    return format ? (FORMAT_NAME[format.id] || format.label) : "";
  }
  if (id === "climax") {
    if (draft.group === "obj") return PROP_ACTIONS.find((item) => item.id === draft.motion)?.label || "";
    if (draft.group === "2d") {
      const play = PLAYS_2D.find((item) => item.id === draft.motion);
      return play ? motionName(play) : "";
    }
    return "";
  }
  if (id === "object") return OBJECTS.find(([oid]) => oid === draft.object)?.[1] || "";
  if (id === "trail") {
    const trail = PROP_TRAILS.find((item) => item.id === draft.trail);
    if (!trail) return "";
    if (trail.id === "custom") return `Personalizado ${normalizePropTrailChar(draft.trailChar)}`;
    return trail.label;
  }
  if (id === "hand") return HANDOFF_TRANSITIONS.find((item) => item.id === draft.hand)?.label || "";
  return "";
}

function option(name, value, title, line, selected, lead) {
  const label = document.createElement("label");
  label.className = "createLookOpt";
  const input = document.createElement("input");
  input.type = "radio";
  input.name = name;
  input.value = value;
  input.checked = selected;
  const titleEl = document.createElement("span");
  titleEl.className = "createLookOptName";
  titleEl.textContent = title;
  label.append(input);
  if (lead) label.append(lead);
  label.append(titleEl);
  if (line) {
    const lineEl = document.createElement("span");
    lineEl.className = "createLookOptLine";
    lineEl.textContent = line;
    label.append(lineEl);
  }
  return label;
}

function trailCharField() {
  const label = document.createElement("label");
  label.className = "createLookChar";
  const name = document.createElement("span");
  name.textContent = "Texto";
  const line = document.createElement("span");
  line.className = "createLookOptLine";
  line.textContent = "Escribe la palabra o el emoji que quieres ver brotar en la estela.";
  const input = document.createElement("input");
  input.id = "createLookTrailChar";
  input.type = "text";
  input.value = normalizePropTrailChar(draft.trailChar);
  input.placeholder = "wow o ✨";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "Texto de la estela personalizada");
  input.addEventListener("input", () => {
    const next = normalizePropTrailChar(input.value);
    const editing = input.value !== input.value.trimEnd() || input.value.endsWith(" ");
    if (!editing && input.value !== next) input.value = next;
    draft.trailChar = next;
    paintRows();
  });
  input.addEventListener("blur", () => {
    input.value = normalizePropTrailChar(input.value);
    draft.trailChar = input.value;
    paintRows();
  });
  label.append(name, line, input);
  return label;
}

function trailLead(trail) {
  if (!trail.thumb) return null;
  const img = document.createElement("img");
  img.className = "createLookTrailThumb";
  img.src = trail.thumb;
  img.alt = "";
  return img;
}

function objectLead() {
  const box = document.createElement("span");
  box.className = "createLookSwatchBox";
  box.setAttribute("aria-hidden", "true");
  return box;
}

function swatch(field) {
  const item = document.createElement("div");
  item.className = "createLookSwatch";
  const chip = document.createElement("i");
  chip.style.background = field.def;
  const name = document.createElement("span");
  name.textContent = field.label;
  item.append(chip, name);
  return item;
}

function paintRows() {
  let step = 0;
  document.querySelectorAll(".createLookRow").forEach((row) => {
    const id = row.dataset.pick;
    const field = fields.find((item) => item.id === id);
    if (!field) return;
    row.hidden = Boolean(field.when && !field.when());
    if (!row.hidden) {
      step += 1;
      const mark = row.querySelector(".createLookStep");
      if (mark) mark.textContent = String(step).padStart(2, "0");
    }
    const value = row.querySelector(".createLookRowValue");
    const colors = id === "palette" ? draft.palette.map((hex) => ({ def: hex, label: hex })) : [];
    const text = valueText(id);
    value.replaceChildren();
    if (colors.length) {
      value.classList.remove("is-empty");
      for (const color of colors) {
        const dot = document.createElement("i");
        dot.style.background = color.def;
        dot.title = color.label;
        value.append(dot);
      }
    } else {
      value.textContent = text || field.invite;
      value.classList.toggle("is-empty", !text);
    }
    const chosen = colors.length
      ? colors.map((color) => color.label).join(", ")
      : (text || field.invite);
    row.setAttribute("aria-label", `${field.label}. ${field.line} Ahora: ${chosen}.`);
  });
}

const FLOW = {
  createLookIndustry: 1,
  createLookProto: 2,
  createLook: 3,
  createLookReceive: 4,
  createLookForm: 5,
  createLookPick: 6,
};
const choice = { industry: "", prototype: "" };
const STEP_IDS = Object.keys(FLOW);
let stepTimer = 0;
let shellTimer = 0;

function motionOff() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function go(id) {
  const prev = location.hash.slice(1);
  document.documentElement.dataset.flow = (FLOW[id] || 0) < (FLOW[prev] || 0) ? "back" : "forward";
  if (location.hash !== `#${id}`) location.hash = id;
  else syncShell();
}

function showStep(id) {
  const shell = document.getElementById("createShell");
  const stage = document.getElementById("createStage");
  const next = document.getElementById(id);
  if (!shell || !stage || !next) return;
  window.clearTimeout(shellTimer);
  shell.classList.remove("is-closing");
  shell.inert = false;
  shell.removeAttribute("aria-hidden");
  shell.dataset.step = id;
  const labelled = next.querySelector("h2")?.id;
  if (labelled) document.getElementById("createShellPanel")?.setAttribute("aria-labelledby", labelled);
  const back = id === "createLookPick" ? "#createLookForm" : "#vBrowse";
  const backLabel = id === "createLookPick" ? "Volver al creativo" : "Cerrar";
  for (const el of [document.getElementById("createShellClose"), shell.querySelector(".createShellScrim")]) {
    if (!el) continue;
    el.setAttribute("href", back);
    el.setAttribute("aria-label", backLabel);
  }

  const wasOpen = shell.classList.contains("is-open");
  const prev = stage.querySelector(".createLook.is-on");
  shell.classList.add("is-open");
  window.clearTimeout(stepTimer);
  stage.querySelectorAll(".createLook.is-leave").forEach((el) => el.classList.remove("is-leave"));

  const plain = () => {
    stage.style.height = "";
    stage.style.transition = "";
    stage.classList.remove("is-moving");
    stage.querySelectorAll(".createLook").forEach((el) => {
      el.classList.remove("is-on", "is-from", "is-leave", "is-move");
      el.inert = el !== next;
    });
    next.classList.add("is-on");
    next.inert = false;
  };

  if (!wasOpen || !prev || prev === next || motionOff()) {
    plain();
    return;
  }

  const fromH = stage.getBoundingClientRect().height;
  stage.classList.add("is-moving");
  stage.style.transition = "none";
  stage.style.height = `${fromH}px`;
  prev.classList.remove("is-on");
  prev.classList.add("is-leave");
  prev.inert = true;
  next.classList.remove("is-on");
  next.classList.add("is-from");
  next.inert = false;
  const toH = next.offsetHeight;
  void next.offsetWidth;
  next.classList.remove("is-from");
  next.classList.add("is-on", "is-move");
  const panel = document.getElementById("createShellPanel");
  if (panel) panel.scrollTop = 0;
  requestAnimationFrame(() => {
    stage.style.transition = "height .5s cubic-bezier(.16,1,.3,1)";
    stage.style.height = `${toH}px`;
  });
  stepTimer = window.setTimeout(() => {
    prev.classList.remove("is-leave");
    next.classList.remove("is-move");
    stage.classList.remove("is-moving");
    if (stage.querySelector(".createLook.is-on") === next) {
      stage.style.height = "";
      stage.style.transition = "";
    }
  }, 520);
}

function closeShell() {
  const shell = document.getElementById("createShell");
  const stage = document.getElementById("createStage");
  if (!shell) return;
  if (!shell.classList.contains("is-open")) {
    shell.inert = true;
    shell.setAttribute("aria-hidden", "true");
    return;
  }
  window.clearTimeout(stepTimer);
  const finish = () => {
    if (shell.classList.contains("is-open")) return;
    shell.classList.remove("is-closing");
    shell.inert = true;
    shell.setAttribute("aria-hidden", "true");
    stage?.querySelectorAll(".createLook").forEach((el) => {
      el.classList.remove("is-on", "is-from", "is-leave", "is-move");
      el.inert = true;
    });
    if (stage) {
      stage.style.height = "";
      stage.style.transition = "";
    }
  };
  if (motionOff()) {
    shell.classList.remove("is-open");
    finish();
    return;
  }
  shell.classList.add("is-closing");
  shell.classList.remove("is-open");
  shellTimer = window.setTimeout(finish, 420);
}

function syncShell() {
  const id = location.hash.slice(1);
  if (!STEP_IDS.includes(id)) closeShell();
  else showStep(id);
}

const BLIT_KEY = "babylon-ads-browse-blit";

function currentBlit() {
  try { return normalizeBrowseBlit(localStorage.getItem(BLIT_KEY)); }
  catch { return normalizeBrowseBlit(0.8); }
}

let galleryCache = null;

function galleryItems() {
  if (galleryCache) return galleryCache;
  try {
    const store = loadGalleryStore();
    const items = activeProfile(store)?.items?.filter((item) => !item.off);
    if (items?.length) {
      galleryCache = items.map((item) => makeCombo(item));
      return galleryCache;
    }
  } catch { /* gallery file */ }
  galleryCache = seedCombos().map((item) => makeCombo(item));
  return galleryCache;
}

function paintIndustries() {
  const root = document.getElementById("createLookIndustries");
  if (!root) return;
  const items = galleryItems();
  root.replaceChildren(...INDUSTRIES.map((industry) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "createIndustry";
    button.classList.toggle("is-on", choice.industry === industry.id);
    const swatch = document.createElement("img");
    swatch.src = industry.emoji;
    swatch.alt = "";
    swatch.setAttribute("aria-hidden", "true");
    const name = document.createElement("span");
    name.className = "createLookOptName";
    name.textContent = industry.name;
    const count = itemsForIndustry(items, industry, industryShowMap(activeProfile(loadGalleryStore()))).length;
    const line = document.createElement("span");
    line.className = "createLookOptLine";
    line.textContent = count === 1 ? "1 clímax en la galería" : `${count} clímax en la galería`;
    button.append(swatch, name, line);
    button.addEventListener("click", () => {
      if (choice.industry !== industry.id) choice.prototype = "";
      choice.industry = industry.id;
      go("createLookProto");
    });
    return button;
  }));
}

function paintProtos() {
  const root = document.getElementById("createLookProtos");
  const guide = document.getElementById("createLookProtoGuide");
  const empty = document.getElementById("createLookProtoEmpty");
  const industry = industryById(choice.industry);
  if (!root) return;
  if (guide) {
    guide.textContent = industry
      ? `Clímax de la galería para ${industry.name}. Elige uno como referencia, o sigue sin elegir.`
      : "Elige una industria para ver sus clímax.";
  }
  const prototypes = industry ? itemsForIndustry(galleryItems(), industry, industryShowMap(activeProfile(loadGalleryStore()))) : [];
  if (choice.prototype && !prototypes.some((item) => item.id === choice.prototype)) choice.prototype = "";
  root.replaceChildren(...prototypes.map((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "createProto";
    button.classList.toggle("is-on", choice.prototype === item.id);
    const stage = document.createElement("span");
    stage.className = "createProtoStage";
    stage.dataset.item = item.id;
    const poster = document.createElement("span");
    poster.className = "createProtoPoster";
    poster.innerHTML = comboPosterMarkup(item);
    stage.append(poster);
    const blit = currentBlit();
    const id = item.id;
    loadStoredStill(item, blit).then((url) => {
      if (!url || !stage.isConnected || stage.dataset.item !== id) return;
      const img = document.createElement("img");
      img.alt = "";
      img.src = url;
      stage.replaceChildren(img);
    }).catch(() => {});
    const name = document.createElement("span");
    name.className = "createLookOptName";
    name.textContent = comboShortTitle(item);
    button.append(stage, name);
    button.addEventListener("click", () => {
      choice.prototype = choice.prototype === item.id ? "" : item.id;
      paintProtos();
    });
    return button;
  }));
  if (empty) empty.hidden = prototypes.length > 0;
  root.hidden = prototypes.length === 0;
}

function paintChoiceNote() {
  const note = document.getElementById("createLookChoiceNote");
  if (!note) return;
  const industry = industryById(choice.industry);
  const prototype = galleryItems().find((item) => item.id === choice.prototype);
  const parts = [];
  if (industry) parts.push(`Industria: ${industry.name}.`);
  if (prototype) parts.push(`Referencia: ${comboShortTitle(prototype)}.`);
  note.hidden = parts.length === 0;
  note.textContent = parts.join(" ");
}

function closePick() {
  go("createLookForm");
}

function choose(apply) {
  apply();
  paintRows();
  closePick();
}

function renderPick() {
  const title = document.getElementById("createLookPickTitle");
  const list = document.getElementById("createLookPickList");
  const hint = document.getElementById("createLookPickHint");
  const swatches = document.getElementById("createLookPickSwatches");
  const back = document.getElementById("createLookPickBack");
  if (!title || !list) return;
  const alreadyOn = document.getElementById("createLookPick")?.classList.contains("is-on");
  queueMicrotask(() => {
    if (!alreadyOn || motionOff()) return;
    list.classList.remove("is-swap");
    void list.offsetWidth;
    list.classList.add("is-swap");
  });
  list.hidden = false;
  list.replaceChildren();
  swatches.hidden = true;
  swatches.replaceChildren();
  hint.hidden = false;
  back.hidden = false;
  back.textContent = "volver al creativo";
  back.onclick = () => closePick();

  const kicker = document.getElementById("createLookPickKicker");
  const setGuide = (step, text) => {
    if (kicker) kicker.textContent = step;
    hint.textContent = text;
  };

  if (pickKey === "format") {
    title.textContent = "Formato";
    setGuide("Tamaño del anuncio", "Elige uno. Clásico mide 300 × 250. Columna mide 160 × 600.");
    list.replaceChildren(...FORMATS.map((format) => {
      const card = option("format", format.id, FORMAT_NAME[format.id] || format.label, `${format.w} × ${format.h}`, draft.format === format.id);
      card.querySelector("input").addEventListener("change", () => choose(() => { draft.format = format.id; }));
      return card;
    }));
    return;
  }

  if (pickKey === "climax" && climaxStep === "group") {
    title.textContent = "Clímax";
    setGuide("Tipo de movimiento", "Elige una escena o un objeto. En el siguiente paso ves la lista, con una frase de cada uno.");
    const groups = [
      ["2d", "Escena", "Gota, Amanecer, Tormenta, Ola y las demás. El anuncio entra cuando la escena termina."],
      ["obj", "Objeto", "El objeto cae, rebota o gira. Después eliges cuál modelo se ve."],
    ];
    list.replaceChildren(...groups.map(([id, name, line]) => {
      const card = option("climaxGroup", id, name, line, draft.group === id);
      card.querySelector("input").addEventListener("change", () => {
        if (draft.group !== id) {
          draft.group = id;
          draft.motion = "";
          draft.object = "";
          paintRows();
        }
        climaxStep = "motion";
        renderPick();
        title.focus();
      });
      return card;
    }));
    return;
  }

  if (pickKey === "climax") {
    title.textContent = draft.group === "obj" ? "Gesto del objeto" : "Escena";
    setGuide(
      "Clímax",
      draft.group === "obj"
        ? "Elige un gesto. Por ejemplo: Cae al suelo, Pelota o Escaparate. La frase dice qué hace."
        : "Elige una escena. Por ejemplo: Gota, Tormenta u Ola. La frase dice en qué momento entra el anuncio.",
    );
    back.hidden = false;
    const motions = draft.group === "obj"
      ? PROP_ACTIONS.map((act) => ({ id: act.id, name: act.label, line: act.blurb }))
      : PLAYS_2D.map((play) => ({ id: play.id, name: motionName(play), line: play.blurb }));
    const change = document.createElement("button");
    change.type = "button";
    change.className = "btn quiet createLookChange";
    change.textContent = "Volver a escena u objeto";
    change.addEventListener("click", () => {
      climaxStep = "group";
      renderPick();
      title.focus();
    });
    list.replaceChildren(change, ...motions.map((motion) => {
      const card = option("climaxMotion", motion.id, motion.name, motion.line, draft.motion === motion.id);
      card.querySelector("input").addEventListener("change", () => choose(() => { draft.motion = motion.id; }));
      return card;
    }));
    return;
  }

  if (pickKey === "object") {
    title.textContent = "Objeto";
    setGuide("Modelo del centro", "Elige el modelo que se ve en el gesto. Por ejemplo: hamburguesa, auto o dona.");
    list.replaceChildren(...OBJECTS.map(([id, name]) => {
      const card = option("object", id, name, "", draft.object === id, objectLead());
      card.querySelector("input").addEventListener("change", () => choose(() => { draft.object = id; }));
      return card;
    }));
    return;
  }

  if (pickKey === "trail") {
    title.textContent = "Estela";
    setGuide("Marca antes del objeto", "En Trazo están partículas, línea o corazones. En Naturaleza, gota, brisa o niebla. En Personalizado escribes una palabra o un emoji.");
    const groups = [["trazo", "Trazo"], ["naturaleza", "Naturaleza"]];
    const nodes = [];
    for (const [group, label] of groups) {
      const head = document.createElement("h3");
      head.className = "createLookPickGroup";
      head.textContent = label;
      nodes.push(head);
      for (const trail of PROP_TRAILS.filter((item) => item.group === group)) {
        const card = option("trail", trail.id, trail.label, trail.blurb, draft.trail === trail.id, trailLead(trail));
        card.querySelector("input").addEventListener("change", () => {
          if (trail.id === "custom") {
            draft.trail = "custom";
            draft.trailChar = normalizePropTrailChar(draft.trailChar);
            paintRows();
            renderPick();
            document.getElementById("createLookTrailChar")?.focus();
            return;
          }
          choose(() => { draft.trail = trail.id; });
        });
        nodes.push(card);
      }
    }
    if (draft.trail === "custom") nodes.push(trailCharField());
    list.replaceChildren(...nodes);
    return;
  }

  if (pickKey === "hand") {
    title.textContent = "Hand off";
    setGuide("Paso al anuncio", "Elige cómo aparece el anuncio. Por ejemplo: Cortinilla barre con franjas. Iris cierra y se abre.");
    list.replaceChildren(...HANDOFF_TRANSITIONS.map((hand) => {
      const card = option("hand", hand.id, hand.label, hand.blurb, draft.hand === hand.id);
      card.querySelector("input").addEventListener("change", () => choose(() => { draft.hand = hand.id; }));
      return card;
    }));
    return;
  }

  if (pickKey === "palette") {
    title.textContent = "Paleta";
    setGuide("Seis colores", "Elige 1, 2 o 3 tonos. Con eso se arman 6 colores. Puedes cambiar un tono o pulsar Generar paleta.");
    syncPalette();
    list.replaceChildren(paletteEditor());
    paintRows();
  }
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return lig - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return `#${[0, 8, 4].map((n) => Math.round(255 * f(n)).toString(16).padStart(2, "0")).join("")}`;
}

function hexToHsl(hex) {
  const raw = String(hex || "").replace("#", "");
  const r = parseInt(raw.slice(0, 2), 16) / 255;
  const g = parseInt(raw.slice(2, 4), 16) / 255;
  const b = parseInt(raw.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lig = (max + min) / 2;
  if (max === min) return { h: 200, s: 18, l: lig * 100 };
  const d = max - min;
  const sat = lig > 0.5 ? d / (2 - max - min) : d / (max + min);
  let hue = 0;
  if (max === r) hue = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) hue = (b - r) / d + 2;
  else hue = (r - g) / d + 4;
  return { h: hue * 60, s: sat * 100, l: lig * 100 };
}

function mixHex(a, b, t = 0.5) {
  const parse = (hex) => {
    const raw = String(hex).replace("#", "");
    return [0, 2, 4].map((i) => parseInt(raw.slice(i, i + 2), 16));
  };
  const left = parse(a);
  const right = parse(b);
  const mixed = left.map((channel, index) => Math.round(channel + (right[index] - channel) * t));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function shiftHex(hex, hue, sat, light) {
  const color = hexToHsl(hex);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  return hslToHex((color.h + hue + 360) % 360, clamp(color.s + sat, 10, 82), clamp(color.l + light, 14, 88));
}

function expandPalette(seeds) {
  const [first, second, third] = seeds;
  if (seeds.length <= 1) {
    return [
      first,
      shiftHex(first, 0, 4, 18),
      shiftHex(first, 0, 6, -18),
      shiftHex(first, 18, 4, 8),
      shiftHex(first, -16, -6, -6),
      shiftHex(first, 8, -24, 4),
    ];
  }
  if (seeds.length === 2) {
    return [
      first,
      shiftHex(first, 0, 2, 16),
      shiftHex(first, 0, 4, -14),
      second,
      shiftHex(second, 0, 2, 14),
      mixHex(first, second),
    ];
  }
  return [first, second, third, mixHex(first, second), mixHex(second, third), mixHex(first, third, 0.4)];
}

function randomSeeds(count) {
  const hue = Math.floor(Math.random() * 360);
  const offsets = count === 1 ? [0] : count === 2 ? [0, 156] : [0, 32, 188];
  const lights = count === 1 ? [46] : count === 2 ? [40, 64] : [36, 50, 66];
  return offsets.map((offset, index) => hslToHex((hue + offset) % 360, 44, lights[index]));
}

function ensureSeeds() {
  const count = draft.tones;
  if (draft.seeds.length > count) draft.seeds = draft.seeds.slice(0, count);
  if (!draft.seeds.length) {
    draft.seeds = paletteFields().map((field) => field.def).slice(0, count);
  }
  while (draft.seeds.length < count) {
    const index = draft.seeds.length;
    const base = draft.seeds[0] ? hexToHsl(draft.seeds[0]) : { h: 198, s: 42, l: 48 };
    draft.seeds.push(hslToHex((base.h + index * 36) % 360, base.s, Math.min(76, base.l + index * 12)));
  }
}

function syncPalette() {
  ensureSeeds();
  draft.palette = expandPalette(draft.seeds);
}

function paintPaletteResult(root) {
  const result = root.querySelector(".createLookResult");
  if (!result) return;
  result.replaceChildren();
  const label = document.createElement("p");
  label.textContent = "Paleta de 6 colores";
  const chips = document.createElement("div");
  chips.className = "createLookResultChips";
  chips.setAttribute("aria-label", draft.palette.join(", "));
  for (const hex of draft.palette) {
    const chip = document.createElement("i");
    chip.style.background = hex;
    chip.title = hex;
    chips.append(chip);
  }
  result.append(label, chips);
}

function paletteEditor() {
  const root = document.createElement("div");
  root.className = "createLookPalette";
  const tones = document.createElement("div");
  tones.className = "createLookTones";
  tones.setAttribute("role", "group");
  tones.setAttribute("aria-label", "Cantidad de tonos");
  const toneLabel = document.createElement("span");
  toneLabel.textContent = "Tonos";
  tones.append(toneLabel);
  for (const count of [1, 2, 3]) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "createLookTone";
    button.dataset.tones = String(count);
    button.textContent = String(count);
    button.setAttribute("aria-pressed", String(draft.tones === count));
    button.setAttribute("aria-label", count === 1 ? "1 tono" : `${count} tonos`);
    button.addEventListener("click", () => {
      draft.tones = count;
      syncPalette();
      paintRows();
      renderPick();
      document.querySelector(`[data-tones="${count}"]`)?.focus();
    });
    tones.append(button);
  }
  const generate = document.createElement("button");
  generate.type = "button";
  generate.className = "btn";
  generate.textContent = "Generar paleta";
  generate.addEventListener("click", () => {
    draft.seeds = randomSeeds(draft.tones);
    draft.palette = expandPalette(draft.seeds);
    paintRows();
    renderPick();
    document.querySelector(".createLookGenerate")?.focus();
  });
  generate.classList.add("createLookGenerate");
  const tuners = document.createElement("div");
  tuners.className = "createLookTuners";
  draft.seeds.forEach((hex, index) => {
    const label = document.createElement("label");
    label.className = "createLookTune";
    const name = document.createElement("span");
    name.textContent = `Tono ${index + 1}`;
    const input = document.createElement("input");
    input.type = "color";
    input.value = hex;
    input.setAttribute("aria-label", `Afinar tono ${index + 1}`);
    input.addEventListener("input", () => {
      draft.seeds[index] = input.value;
      draft.palette = expandPalette(draft.seeds);
      paintPaletteResult(root);
      paintRows();
    });
    label.append(input, name);
    tuners.append(label);
  });
  const result = document.createElement("div");
  result.className = "createLookResult";
  root.append(tones, generate, tuners, result);
  paintPaletteResult(root);
  return root;
}

function openPick(key, button) {
  pickKey = key;
  climaxStep = key === "climax" && draft.group ? "motion" : "group";
  returnFocus = button;
  renderPick();
  if (location.hash === "#createLookPick") renderPick();
  go("createLookPick");
}

function buildRows() {
  const root = document.getElementById("createLookRows");
  if (!root) return;
  root.replaceChildren(...fields.map((field, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "createLookRow";
    button.dataset.pick = field.id;
    button.setAttribute("aria-haspopup", "dialog");
    const step = document.createElement("span");
    step.className = "createLookStep";
    step.textContent = String(index + 1).padStart(2, "0");
    const main = document.createElement("span");
    main.className = "createLookRowMain";
    const label = document.createElement("span");
    label.className = "createLookRowLabel";
    label.textContent = field.label;
    const line = document.createElement("span");
    line.className = "createLookRowLine";
    line.textContent = field.line;
    main.append(label, line);
    const value = document.createElement("span");
    value.className = "createLookRowValue is-empty";
    value.textContent = field.invite;
    const chev = document.createElement("span");
    chev.className = "createLookRowChev";
    chev.setAttribute("aria-hidden", "true");
    chev.textContent = "›";
    button.append(step, main, value, chev);
    button.addEventListener("click", () => openPick(field.id, button));
    return button;
  }));
  paintRows();
}

function focusDialog() {
  const id = location.hash.slice(1);
  const dialog = document.getElementById(id);
  if (!dialog?.classList.contains("createLook")) {
    const back = returnFocus?.isConnected && returnFocus.offsetParent ? returnFocus : document.getElementById("createBtn");
    returnFocus = null;
    back?.focus?.();
    return;
  }
  dialog.querySelector("h2")?.focus();
}

function paintImageNote() {
  const note = document.getElementById("createLookImageNote");
  if (!note) return;
  const parts = [];
  if (draft.image?.name) parts.push(`Foto de este equipo: ${draft.image.name}`);
  if (draft.image?.link) {
    parts.push(draft.image.text ? `Enlace listo. Pedido: ${draft.image.text}` : "Enlace listo para que otra persona suba la foto.");
  }
  note.hidden = parts.length === 0;
  note.textContent = parts.join(" ");
}

buildRows();
document.getElementById("createLookPickBack")?.addEventListener("click", closePick);
document.getElementById("createBtn")?.addEventListener("click", () => {
  document.documentElement.dataset.flow = "forward";
  returnFocus = document.getElementById("createBtn");
}, true);
document.addEventListener("click", (event) => {
  const link = event.target.closest?.("a[href^='#']");
  if (!link?.closest(".createShell")) return;
  event.preventDefault();
  go(link.getAttribute("href").slice(1));
}, true);
document.getElementById("createLookFile")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  const name = document.getElementById("createLookFileName");
  if (!name) return;
  name.hidden = !file;
  name.textContent = file ? `Archivo elegido: ${file.name}` : "";
});
document.getElementById("createLookProtoNext")?.addEventListener("click", () => {
  paintChoiceNote();
  go("createLook");
});
document.getElementById("createLookNext")?.addEventListener("click", () => {
  paintChoiceNote();
  publishPedido();
  syncRequestLink();
  const file = document.getElementById("createLookFile")?.files?.[0];
  draft.image = {
    name: file ? file.name : "",
    text: requestNote(),
    link: requestLink(),
  };
  paintImageNote();
  go("createLookForm");
});
function requestNote() {
  return document.getElementById("createLookAskText")?.value.trim() || "";
}

function requestLink() {
  const url = new URL(location.href);
  const note = requestNote();
  if (note) url.searchParams.set("pedido", note);
  else url.searchParams.delete("pedido");
  url.hash = "createLookReceive";
  return url.toString();
}

function syncRequestLink() {
  const field = document.getElementById("createLookLink");
  const local = requestLink();
  if (field) field.value = local;
  const api = `${location.protocol}//${location.hostname}:8780`;
  fetch(`${api}/api/drops`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      galleryId: choice.prototype || "",
      note: requestNote(),
      password: document.getElementById("createLookPass")?.value || "",
    }),
  }).then(async (res) => {
    if (!res.ok || !field) return;
    const data = await res.json();
    if (data.url) field.value = data.url;
  }).catch(() => {});
}

function publishPedido() {
  const url = new URL(requestLink());
  const next = `${url.pathname}${url.search}`;
  if (`${location.pathname}${location.search}` !== next) {
    history.replaceState(null, "", next);
  }
}

let receivePreviewUrl = "";

function paintReceive() {
  const params = new URLSearchParams(location.search);
  const note = params.get("pedido") || "";
  const ask = document.getElementById("createLookReceiveAsk");
  if (ask) {
    ask.hidden = !note;
    ask.textContent = note ? `Foto pedida: ${note}` : "";
  }
}

function resetReceivePreview() {
  if (receivePreviewUrl) URL.revokeObjectURL(receivePreviewUrl);
  receivePreviewUrl = "";
}

document.getElementById("createLookAskText")?.addEventListener("input", () => {
  const note = document.getElementById("createLookCopyNote");
  if (note) note.hidden = true;
  syncRequestLink();
});
document.getElementById("createLookCopy")?.addEventListener("click", async () => {
  syncRequestLink();
  const value = document.getElementById("createLookLink")?.value || "";
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    document.getElementById("createLookLink")?.select();
  }
  const note = document.getElementById("createLookCopyNote");
  if (note) note.hidden = false;
});
document.getElementById("createLookPreview")?.addEventListener("click", () => {
  publishPedido();
  go("createLookReceive");
});

document.getElementById("createLookReceiveFile")?.addEventListener("change", (event) => {
  const file = event.target.files?.[0];
  const preview = document.getElementById("createLookReceivePreview");
  const name = document.getElementById("createLookReceiveName");
  const send = document.getElementById("createLookReceiveSend");
  const done = document.getElementById("createLookReceiveDone");
  if (done) done.hidden = true;
  resetReceivePreview();
  if (!file || !preview || !name || !send) return;
  receivePreviewUrl = URL.createObjectURL(file);
  preview.src = receivePreviewUrl;
  preview.hidden = false;
  name.hidden = false;
  name.textContent = file.name;
  send.disabled = false;
  const hold = document.getElementById("createLookPreviewHold");
  if (hold) hold.hidden = true;
});
document.getElementById("createLookReceiveSend")?.addEventListener("click", () => {
  const done = document.getElementById("createLookReceiveDone");
  const send = document.getElementById("createLookReceiveSend");
  const steps = document.getElementById("createLookReceiveSteps");
  const drop = document.getElementById("createLookReceiveDrop");
  if (done) done.hidden = false;
  if (send) send.disabled = true;
  if (steps) steps.hidden = true;
  if (drop) drop.hidden = true;
  done?.focus?.();
});
window.addEventListener("hashchange", () => {
  if (location.hash === "#createLookPick") renderPick();
  if (location.hash === "#createLookIndustry") paintIndustries();
  if (location.hash === "#createLookProto") paintProtos();
  if (location.hash === "#createLook") syncRequestLink();
  if (location.hash === "#createLookForm") paintChoiceNote();
  if (location.hash === "#createLookReceive") paintReceive();
  syncShell();
  focusDialog();
});
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const hash = location.hash;
  if (!FLOW[hash.slice(1)]) return;
  event.stopImmediatePropagation();
  if (hash === "#createLookPick") closePick();
  else if (hash === "#createLookForm") go("createLook");
  else if (hash === "#createLook" || hash === "#createLookReceive") go("createLookProto");
  else if (hash === "#createLookProto") go("createLookIndustry");
  else go("vBrowse");
}, true);
syncRequestLink();
if (location.hash === "#createLookReceive") paintReceive();
if (location.hash === "#createLookPick") renderPick();
if (location.hash === "#createLookIndustry") paintIndustries();
if (location.hash === "#createLookProto") paintProtos();
if (location.hash === "#createLookForm") paintChoiceNote();
syncShell();
if (STEP_IDS.includes(location.hash.slice(1))) focusDialog();
