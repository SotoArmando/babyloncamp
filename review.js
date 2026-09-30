import { formatById, playById, propTrailById, normalizePropCam } from "./ad-catalog.js";
import { activeProfile, comboShortTitle, loadGalleryStore } from "./ad-profile.js";

const REVIEW_KEY = "babylon-ads-review";
const INDUSTRIES = [
  { id: "bebidas", name: "Bebidas", keys: ["climax", "pre-enter", "breaker"] },
  { id: "comida", name: "Comida", keys: ["prop:drop", "prop:ball"] },
  { id: "moda", name: "Moda", keys: ["prop:turn", "prop:cheer"] },
  { id: "auto", name: "Automotriz", keys: ["prop:drive", "prop:drive-plain"] },
  { id: "tech", name: "Tecnología", keys: ["prop:torch", "prop:torch-front", "prop:space"] },
  { id: "retail", name: "Retail", keys: ["prop:toy", "prop:star"] },
  { id: "salud", name: "Salud", keys: ["aurora", "calve"] },
  { id: "educacion", name: "Educación", keys: ["migrate", "erupt"] },
  { id: "viajes", name: "Viajes", keys: ["horizon", "sundown", "storm"] },
];
const INDUSTRY_BY_KEY = new Map();
for (const industry of INDUSTRIES) {
  for (const key of industry.keys) INDUSTRY_BY_KEY.set(key, industry);
}

const SOURCES = [
  { id: "platform", label: "Plataforma", blurb: "La biblioteca de esta herramienta." },
  { id: "vendor", label: "Vendedor", blurb: "Entra por una integración externa." },
  { id: "client", label: "Cliente", blurb: "Lo manda el cliente." },
];

const elTitle = document.getElementById("title");
const elLede = document.getElementById("lede");
const elPick = document.getElementById("pick");
const elStages = document.getElementById("stages");
const elRevs = document.getElementById("revs");
const elOrigin = document.getElementById("origin");
const elOriginName = document.getElementById("originName");
const elSources = document.getElementById("sources");
const elMore = document.getElementById("more");
const elNote = document.getElementById("note");

const store = loadGalleryStore();
const items = activeProfile(store)?.items || [];
let note = "";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[ch]));
}

function itemKey(item) {
  return item?.play === "prop" ? `prop:${item.propAct || "drop"}` : String(item?.play || "");
}

function industryOf(item) {
  return INDUSTRY_BY_KEY.get(itemKey(item)) || null;
}

function readLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(REVIEW_KEY) || "{}");
    return raw && typeof raw === "object" ? raw : {};
  } catch {
    return {};
  }
}

function writeLog(log) {
  localStorage.setItem(REVIEW_KEY, JSON.stringify(log));
}

function entryOf(log, id) {
  const entry = log[id];
  return {
    source: entry?.source === "vendor" || entry?.source === "client" ? entry.source : "",
    internal: entry?.internal === "passed" ? "passed" : "",
    client: entry?.client === "sent" || entry?.client === "passed" ? entry.client : "",
    requests: Array.isArray(entry?.requests) ? entry.requests : [],
  };
}

function selectedId() {
  const query = new URLSearchParams(location.search).get("id");
  if (query && items.some((item) => item.id === query)) return query;
  return items[0]?.id || "";
}

function clock(at) {
  try {
    return new Intl.DateTimeFormat("es", { hour: "2-digit", minute: "2-digit" }).format(at);
  } catch {
    return "";
  }
}

function assetOf(item, entry) {
  const mesh = item?.pmesh;
  if (item?.play !== "prop") {
    return { status: "done", origin: "none", name: "", scene: true };
  }
  if (mesh?.assetId) return { status: "done", origin: "platform", name: mesh.name || "Asset de la plataforma" };
  if (mesh?.name && (entry.source === "vendor" || entry.source === "client")) {
    return { status: "done", origin: entry.source, name: mesh.name };
  }
  if (mesh?.name) return { status: "done", origin: "file", name: mesh.name };
  const open = [...entry.requests].reverse().find((row) => row.kind === "vendor" || row.kind === "client");
  if (open) return { status: "now", origin: open.kind, name: "", pending: true };
  return { status: "now", origin: "none", name: "" };
}

function estudioTouched(item) {
  if (item?.play !== "prop") return true;
  const trail = propTrailById(item.ptrail).id !== "none";
  const cam = normalizePropCam(item.pcam) !== "4.1";
  const studio = item.studio && item.studio.preset && item.studio.preset !== "catalog";
  return trail || cam || studio;
}

function estudioLine(item) {
  if (item?.play !== "prop") return "La escena ya está en el catálogo.";
  const bits = [];
  const trail = propTrailById(item.ptrail);
  if (trail.id !== "none") bits.push(`estela ${trail.label.toLowerCase()}`);
  if (normalizePropCam(item.pcam) !== "4.1") bits.push(`cámara ${normalizePropCam(item.pcam)}`);
  if (item.studio?.preset && item.studio.preset !== "catalog") bits.push(`luces ${item.studio.preset}`);
  if (!bits.length) return "Cámara, luces y estela siguen en el ajuste de catálogo.";
  return `Ya lleva ${bits.join(", ")}.`;
}

function stagesFor(item, entry) {
  const asset = assetOf(item, entry);
  const rows = [
    { id: "brief", name: "Encargo", text: "El caso ya vive en la galería.", done: true },
    { id: "ref", name: "Referencia", text: `${comboShortTitle(item)} es la base de este clímax.`, done: true },
    {
      id: "asset",
      name: "Asset",
      text: assetCopy(asset),
      done: asset.status === "done",
    },
    { id: "studio", name: "Estudio", text: estudioLine(item), done: asset.status === "done" },
    { id: "internal", name: "Revisión interna", text: entry.internal === "passed" ? "El equipo ya dio el pase." : "Falta el pase del equipo.", done: entry.internal === "passed" },
    {
      id: "client",
      name: "Revisión del cliente",
      text: entry.client === "passed"
        ? "El cliente externo ya aprobó."
        : entry.client === "sent"
          ? "La revisión está con el cliente."
          : "Todavía no sale hacia el cliente.",
      done: entry.client === "passed",
    },
    {
      id: "live",
      name: "Publicación",
      text: entry.client === "passed" ? "Puede usarse como anuncio." : "Se abre cuando el cliente aprueba.",
      done: entry.client === "passed",
    },
  ];
  let open = false;
  return rows.map((row) => {
    if (row.done) return { ...row, state: "done" };
    if (!open) {
      open = true;
      return { ...row, state: "now" };
    }
    return { ...row, state: "wait" };
  });
}

function assetCopy(asset) {
  if (asset.scene) return "Este clímax no usa un modelo. La escena es el propio anuncio.";
  if (asset.origin === "platform") return `Usa un asset de la plataforma: ${asset.name}.`;
  if (asset.origin === "vendor" && asset.name) return `Usa un archivo del vendedor: ${asset.name}.`;
  if (asset.origin === "client" && asset.name) return `Usa un archivo del cliente: ${asset.name}.`;
  if (asset.origin === "file") return `Hay un archivo (${asset.name}) y todavía no dice si vino del vendedor o del cliente.`;
  if (asset.pending && asset.origin === "vendor") return "Hay un pedido abierto al vendedor.";
  if (asset.pending && asset.origin === "client") return "Hay una solicitud abierta al cliente.";
  return "Este objeto todavía no tiene modelo.";
}

function revisionsFor(item, entry) {
  const asset = assetOf(item, entry);
  const rows = [
    { when: "Catálogo", what: `${comboShortTitle(item)} entra como clímax de ${industryOf(item)?.name || "la galería"}.` },
  ];
  if (asset.origin === "platform") rows.push({ when: "Plataforma", what: `El modelo ${asset.name} sale de la biblioteca.` });
  else if (asset.origin === "vendor" && asset.name) rows.push({ when: "Vendedor", what: `El archivo ${asset.name} queda como asset del vendedor.` });
  else if (asset.origin === "client" && asset.name) rows.push({ when: "Cliente", what: `El archivo ${asset.name} queda como asset del cliente.` });
  else if (asset.name) rows.push({ when: "Archivo", what: `${asset.name} está en la galería, sin origen declarado.` });
  if (estudioTouched(item) && item.play === "prop") rows.push({ when: "Estudio", what: estudioLine(item) });
  for (const request of entry.requests) {
    const when = request.kind === "vendor" ? "Integración" : request.kind === "client" ? "Cliente" : "Revisión";
    rows.push({ when: clock(request.at) ? `${when} · ${clock(request.at)}` : when, what: request.text });
  }
  if (entry.internal === "passed") rows.push({ when: "Interna", what: "El equipo dio el pase." });
  if (entry.client === "sent" || entry.client === "passed") rows.push({ when: "Cliente", what: entry.client === "passed" ? "El cliente aprobó la revisión." : "La revisión se envió al cliente." });
  return rows;
}

function paintPick(currentId) {
  elPick.replaceChildren();
  for (const item of items) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `chip${item.id === currentId ? " on" : ""}`;
    button.textContent = comboShortTitle(item);
    button.addEventListener("click", () => {
      const url = new URL(location.href);
      url.searchParams.set("id", item.id);
      history.replaceState(null, "", url);
      note = "";
      paint();
    });
    elPick.appendChild(button);
  }
}

function paintSources(asset) {
  elSources.replaceChildren();
  for (const source of SOURCES) {
    const row = document.createElement("li");
    const on = asset.origin === source.id;
    const label = on ? (asset.pending ? "Pedido" : "En uso") : "Sin usar";
    row.className = `source${on ? " is-on" : ""}`;
    row.innerHTML = `<b>${esc(source.label)}</b><span>${esc(label)}</span>`;
    elSources.appendChild(row);
  }
}

function addButton(label, run, disabled) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn";
  button.textContent = label;
  button.disabled = disabled;
  button.addEventListener("click", run);
  elMore.appendChild(button);
}

function patch(id, change, message) {
  const log = readLog();
  const entry = entryOf(log, id);
  change(entry);
  log[id] = entry;
  writeLog(log);
  note = message;
  paint();
}

function paintActions(item, entry, asset) {
  elMore.replaceChildren();
  const link = document.createElement("a");
  link.className = "btn";
  link.href = "assets.html";
  link.textContent = "Traer de la plataforma";
  elMore.appendChild(link);
  addButton("Pedir al vendedor", () => {
    patch(item.id, (row) => {
      if (!asset.origin || asset.origin === "file" || asset.origin === "none") row.source = item.pmesh?.name ? "vendor" : row.source;
      row.requests.push({ kind: "vendor", at: Date.now(), text: "Pedido al vendedor para sumar otro modelo a este clímax." });
    }, "Quedó anotado un pedido al vendedor. La integración traería otro modelo a este clímax.");
  });
  addButton("Pedir archivo al cliente", () => {
    patch(item.id, (row) => {
      if (!item.pmesh?.assetId && item.pmesh?.name) row.source = "client";
      row.requests.push({ kind: "client", at: Date.now(), text: "Solicitud al cliente externo para que envíe su archivo." });
    }, "Quedó anotada una solicitud al cliente externo para que envíe su archivo.");
  });
  const studioReady = stagesFor(item, entry).find((row) => row.id === "studio")?.done;
  addButton("Dar el pase interno", () => {
    patch(item.id, (row) => { row.internal = "passed"; }, "El equipo dio el pase interno.");
  }, !studioReady || entry.internal === "passed");
  addButton("Enviar revisión al cliente", () => {
    patch(item.id, (row) => { row.client = "sent"; }, "La revisión quedó enviada al cliente.");
  }, entry.internal !== "passed" || entry.client === "sent" || entry.client === "passed");
  addButton("El cliente ya aprobó", () => {
    patch(item.id, (row) => { row.client = "passed"; }, "El cliente dio el pase. Este clímax puede publicarse.");
  }, entry.client !== "sent");
}

function paint() {
  const id = selectedId();
  const item = items.find((entry) => entry.id === id);
  paintPick(id);
  if (!item) {
    elTitle.textContent = "Sin clímax";
    elLede.textContent = "La galería todavía no tiene plays.";
    return;
  }
  const entry = entryOf(readLog(), item.id);
  const asset = assetOf(item, entry);
  const industry = industryOf(item);
  const format = formatById(item.ad);
  const play = playById(item.play);
  elTitle.textContent = comboShortTitle(item);
  const kind = play.id === "prop" ? "Objeto" : play.label.replace(/^Clímax · /, "");
  const bits = [industry?.name, kind, `${format.w}×${format.h}`];
  elLede.textContent = bits.filter(Boolean).join(" · ");
  const stages = stagesFor(item, entry);
  elStages.innerHTML = stages.map((row) => `
    <li class="stage is-${row.state}">
      <span class="stageMark" aria-hidden="true"></span>
      <div>
        <p class="stageName">${esc(row.name)}</p>
        <p class="stageText">${esc(row.text)}</p>
      </div>
    </li>`).join("");
  elRevs.innerHTML = revisionsFor(item, entry).map((row) => `
    <li class="rev">
      <span class="revWhen">${esc(row.when)}</span>
      <p class="revWhat">${esc(row.what)}</p>
    </li>`).join("");
  const originLabel = SOURCES.find((source) => source.id === asset.origin)?.label
    || (asset.scene ? "Sin modelo" : asset.origin === "file" ? "Archivo sin origen" : "Todavía no");
  elOrigin.textContent = originLabel;
  elOriginName.textContent = assetCopy(asset);
  paintSources(asset);
  paintActions(item, entry, asset);
  paintProgress(stages);
  loadPart();
  elNote.textContent = note;
}

const API = `${location.protocol}//${location.hostname}:8780`;
let partLevel = "user";

function paintProgress(stages) {
  const label = document.getElementById("progressLabel");
  const wait = document.getElementById("progressWait");
  if (!label || !wait) return;
  const done = stages.filter((row) => row.state === "done").length;
  const now = stages.find((row) => row.state === "now");
  const later = stages.filter((row) => row.state === "wait").length;
  label.textContent = `${done} de ${stages.length} listas`;
  wait.textContent = now
    ? `Ahora: ${now.name}.${later ? ` ${later} todavía esperan.` : ""}`
    : "La ficha está completa.";
}

async function loadPart() {
  const log = document.getElementById("partLog");
  const like = document.getElementById("likeBtn");
  const id = selectedId();
  if (!log || !id) return;
  try {
    const res = await fetch(`${API}/api/ficha/${encodeURIComponent(id)}`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    if (like) like.textContent = data.likes ? `Like · ${data.likes}` : "Like";
    log.innerHTML = (data.events || []).map((row) => `
      <li class="rev">
        <span class="revWhen">${esc(row.actor)} · ${esc(row.level)} · ${esc(row.kind)}</span>
        ${row.kind === "image" && row.body.startsWith("data:") ? `<img class="partImg" alt="" src="${esc(row.body)}">` : row.kind === "image" ? `<img class="partImg" alt="" src="${API}${row.body}">` : `<p class="revWhat">${esc(row.body)}</p>`}
      </li>`).join("");
  } catch { /* sin servicio de cuentas */ }
}

async function postPart(kind, body) {
  await fetch(`${API}/api/ficha/${encodeURIComponent(selectedId())}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind, body, level: partLevel }),
  });
  loadPart();
}

document.getElementById("partLevel")?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-level]");
  if (!button) return;
  partLevel = button.dataset.level;
  document.querySelectorAll("#partLevel .chip").forEach((chip) => chip.classList.toggle("on", chip === button));
});
document.getElementById("likeBtn")?.addEventListener("click", () => postPart("like", "Like"));
document.getElementById("commentBtn")?.addEventListener("click", () => {
  const text = document.getElementById("partComment")?.value.trim();
  if (!text) return;
  postPart("comment", text);
  document.getElementById("partComment").value = "";
});
document.getElementById("partImage")?.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  await postPart("image", `data:${file.type || "image/jpeg"};base64,${btoa(binary)}`);
});

function syncBar() {
  const bar = document.querySelector(".app-bar");
  if (!bar) return;
  const height = Math.max(0, bar.getBoundingClientRect().height - 1);
  document.documentElement.style.setProperty("--app-bar-h", `${height}px`);
}

syncBar();
window.addEventListener("resize", syncBar);
paint();
