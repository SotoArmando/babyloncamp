const API = `${location.protocol}//${location.hostname}:8780`;

export function api(path, options = {}) {
  return fetch(`${API}${path}`, { credentials: "include", ...options });
}

export async function session() {
  try {
    const res = await api("/api/me");
    if (!res.ok) return { user: null, settings: {} };
    return res.json();
  } catch {
    return { user: null, settings: {}, offline: true };
  }
}

export function paintAccount(root) {
  if (!root) return;
  const button = root.querySelector(".app-avatar");
  const menu = root.querySelector(".app-user-menu");
  if (!button || !menu) return;
  session().then(({ user, settings }) => {
    if (settings) window.dispatchEvent(new CustomEvent("account-settings", { detail: settings }));
    if (!user) {
      button.textContent = "→";
      button.style.backgroundImage = "";
      button.setAttribute("aria-label", "Entrar");
      menu.innerHTML = `<a href="home.html">Entrar</a>`;
      return;
    }
    const letters = user.name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
    button.textContent = user.avatar ? "" : letters || "•";
    button.style.backgroundImage = user.avatar ? `url("${user.avatar}")` : "";
    button.style.backgroundSize = "cover";
    menu.innerHTML = `
      <div class="app-user-head"><strong>${user.name}</strong><span>${user.email}</span></div>
      <a href="home.html">Inicio</a>
      <button type="button" id="accountPrefs">Preferencias</button>
      <button type="button" class="danger" id="accountOut">Salir</button>`;
    menu.querySelector("#accountOut")?.addEventListener("click", async () => {
      await api("/api/logout", { method: "POST" });
      location.href = "home.html";
    });
    menu.querySelector("#accountPrefs")?.addEventListener("click", () => {
      location.href = "home.html#preferencias";
    });
    window.dispatchEvent(new CustomEvent("account-ready", { detail: user }));
  });
}

export async function saveSetting(key, value, scope = "user") {
  const res = await api("/api/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, value, scope }),
  });
  return res.ok ? res.json() : null;
}

window.addEventListener("account-save", (event) => {
  const detail = event.detail || {};
  if (!detail.key) return;
  saveSetting(detail.key, detail.value, detail.scope || "user");
});

if (document.getElementById("app-user")) paintAccount(document.getElementById("app-user"));
