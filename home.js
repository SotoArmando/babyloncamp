import { api, session, saveSetting } from "./account.js?v=acct1";

const form = document.getElementById("authForm");
const homeIn = document.getElementById("homeIn");
const title = document.getElementById("homeTitle");
const lede = document.getElementById("homeLede");
const error = document.getElementById("authError");
const nameField = form.querySelector("[name=name]");
const nameLabel = nameField.closest("label");
nameLabel.hidden = true;
let mode = "login";

function showError(text) {
  error.hidden = !text;
  error.textContent = text || "";
}

document.getElementById("authSwitch").addEventListener("click", () => {
  mode = mode === "login" ? "register" : "login";
  document.getElementById("authTitle").textContent = mode === "login" ? "Entrar" : "Crear cuenta";
  form.querySelector("[type=submit]").textContent = mode === "login" ? "Entrar" : "Crear cuenta";
  document.getElementById("authSwitch").textContent = mode === "login" ? "Crear cuenta" : "Ya tengo cuenta";
  nameLabel.hidden = mode === "login";
  nameField.required = mode !== "login";
  showError("");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showError("");
  const data = Object.fromEntries(new FormData(form));
  const res = await api(mode === "login" ? "/api/login" : "/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    showError(body.error || "No se pudo entrar.");
    return;
  }
  location.reload();
});

function paintHome(payload) {
  const user = payload.user;
  title.textContent = user ? `Hola, ${user.name.split(" ")[0]}` : "Tu espacio";
  lede.textContent = user ? "Perfiles, personas del espacio y preferencias de Buscar." : "Entra para guardar preferencias, perfiles y enlaces.";
  form.hidden = Boolean(user);
  homeIn.hidden = !user;
  if (!user) return;
  const org = user.orgs?.[0];
  document.getElementById("orgName").textContent = org ? `${org.name} · ${org.role === "owner" ? "dueño" : "miembro"}` : "";
  const settings = payload.settings || {};
  const blit = document.getElementById("blit");
  blit.value = settings.blit || "0.8";
  document.getElementById("blitOut").textContent = `${blit.value}×`;
  document.getElementById("cover").value = settings.cover || "ad";
  document.getElementById("cols").value = settings.cols || "4";
  document.getElementById("members").innerHTML = (payload.members || []).map((person) =>
    `<li><span>${person.name} · ${person.role === "owner" ? "dueño" : "miembro"}</span>${person.role === "owner" ? "" : `<button type="button" data-out="${person.id}">Quitar</button>`}</li>`
  ).join("");
  document.getElementById("profiles").innerHTML = (payload.profiles || []).map((profile) =>
    `<li><a href="review.html?id=${encodeURIComponent(profile.gallery_id)}">${profile.title || profile.gallery_id}</a><span>${profile.owner_type === "org" ? "organización" : "espacio"}</span></li>`
  ).join("") || "<li><span>Todavía no hay un perfil ligado. Abre Buscar con la sesión iniciada.</span></li>";
}

session().then(async (me) => {
  if (!me.user) {
    paintHome({ user: null });
    return;
  }
  const res = await api("/api/home");
  paintHome(res.ok ? await res.json() : me);
});

document.getElementById("blit").addEventListener("change", (event) => {
  document.getElementById("blitOut").textContent = `${event.target.value}×`;
  saveSetting("blit", event.target.value);
});
document.getElementById("cover").addEventListener("change", (event) => saveSetting("cover", event.target.value));
document.getElementById("cols").addEventListener("change", (event) => saveSetting("cols", event.target.value));

document.getElementById("inviteForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  const res = await api("/api/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
  if (!res.ok) return;
  location.reload();
});

document.getElementById("members").addEventListener("click", async (event) => {
  const id = event.target?.dataset?.out;
  if (!id) return;
  await api(`/api/members/${id}`, { method: "DELETE" });
  location.reload();
});

document.getElementById("tokenBtn").addEventListener("click", async () => {
  const res = await api("/api/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: "Externo" }) });
  const body = await res.json();
  const out = document.getElementById("tokenOut");
  out.hidden = false;
  out.textContent = body.token || body.error || "";
});
