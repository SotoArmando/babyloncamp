(function () {
  const ROUTES = [
    { id: "gallery", href: "gallery.html", label: "Galería" },
    { id: "gallery-gwd", href: "gallery-gwd.html", label: "Galería GWD" },
    { id: "browse", href: "browse.html", label: "Buscar" },
    { id: "review", href: "review.html", label: "Ficha" },
    { id: "ads", href: "ads.html", label: "Anuncios" },
    { id: "assets", href: "assets.html", label: "Assets 3D" },
    { id: "serve", href: "serve.html", label: "Serve" },
    { id: "many", href: "many.html", label: "Varios" },
    { id: "gwd", href: "gwd.html", label: "GWD" },
    { id: "gwd-light", href: "gwd-light.html", label: "GWD ligero" },
    { id: "gtm", href: "gtm.html", label: "GTM preview" },
    { id: "lab", href: "lab.html", label: "Lab" },
    { id: "index", href: "index.html", label: "Artículo" },
    { id: "editor", href: "editor.html", label: "Editor" },
  ];
  const HIDDEN_KEY = "app-nav-hidden";

  const path = (location.pathname || "/").toLowerCase();
  const file = (path.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  const visor = new URLSearchParams(location.search).get("visor");

  function routeIsCurrent(id) {
    const gwd = id === "gallery-gwd" && (file === "gallery-gwd" || (file === "gallery" && visor === "gwd"));
    const babylon = id === "gallery" && file === "gallery" && visor !== "gwd";
    const gtm = id === "gtm" && (file === "gtm" || path === "/gtm" || path.startsWith("/gtm/"));
    return gtm || gwd || babylon || (id === file && id !== "gallery" && id !== "gallery-gwd" && id !== "gtm") || (file === "" && id === "index");
  }

  function readHidden() {
    try {
      const raw = JSON.parse(localStorage.getItem(HIDDEN_KEY) || "[]");
      const known = new Set(ROUTES.map((route) => route.id));
      return new Set(Array.isArray(raw) ? raw.filter((id) => known.has(id)) : []);
    } catch {
      return new Set();
    }
  }

  function writeHidden(hidden) {
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]));
    } catch { /* la preferencia es opcional */ }
  }

  if (!document.getElementById("app-drawer")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="app-nav-scrim" id="app-nav-scrim"></div>
       <aside class="app-drawer" id="app-drawer" aria-label="Navegación">
         <div class="app-drawer-top" aria-hidden="true"></div>
         <button type="button" class="app-drawer-pref" id="app-drawer-pref" aria-expanded="false">Preferencias</button>
         <nav id="app-drawer-nav"></nav>
         <div class="app-drawer-prefs" id="app-drawer-prefs" hidden>
           <p class="app-drawer-prefs-label">Rutas visibles</p>
           <div class="app-drawer-prefs-list" id="app-drawer-prefs-list"></div>
         </div>
         <p class="app-drawer-note">POC de anuncios 3D · formatos IAB</p>
       </aside>`
    );
  }

  const burger = document.getElementById("app-burger");
  const scrim = document.getElementById("app-nav-scrim");
  const drawer = document.getElementById("app-drawer");
  const nav = document.getElementById("app-drawer-nav");
  const prefs = document.getElementById("app-drawer-prefs");
  const prefsList = document.getElementById("app-drawer-prefs-list");
  const prefBtn = document.getElementById("app-drawer-pref");
  const user = document.getElementById("app-user");
  const avatar = document.getElementById("app-avatar");
  const hidden = readHidden();

  function paintLinks() {
    if (!nav) return;
    nav.innerHTML = ROUTES.filter((route) => !hidden.has(route.id) || routeIsCurrent(route.id)).map((route) => {
      const current = routeIsCurrent(route.id) ? ' class="is-current"' : "";
      return `<a href="${route.href}"${current}>${route.label}</a>`;
    }).join("");
  }

  function paintPrefs() {
    if (!prefsList) return;
    prefsList.innerHTML = ROUTES.map((route) => {
      const on = hidden.has(route.id) ? "" : " checked";
      return `<label class="app-drawer-pref-row">
        <input type="checkbox" data-route="${route.id}"${on}>
        <span>${route.label}</span>
      </label>`;
    }).join("");
  }

  function setPrefsOpen(open) {
    if (!prefs || !nav || !prefBtn) return;
    prefs.hidden = !open;
    nav.hidden = open;
    prefBtn.textContent = open ? "Listo" : "Preferencias";
    prefBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }

  paintLinks();
  paintPrefs();

  prefsList?.addEventListener("change", (e) => {
    const input = e.target.closest("input[data-route]");
    if (!input) return;
    const id = input.getAttribute("data-route");
    if (!id) return;
    if (input.checked) hidden.delete(id);
    else hidden.add(id);
    writeHidden(hidden);
    paintLinks();
  });

  prefBtn?.addEventListener("click", () => {
    setPrefsOpen(prefs?.hidden !== false);
  });

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
    setPrefsOpen(false);
  };
  const openNav = () => {
    document.body.classList.add("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    user?.classList.remove("is-open");
  };

  burger?.addEventListener("click", () => {
    if (document.body.classList.contains("nav-open")) closeNav();
    else openNav();
  });
  scrim?.addEventListener("click", closeNav);

  avatar?.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = user.classList.toggle("is-open");
    avatar.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) closeNav();
  });
  document.addEventListener("click", (e) => {
    if (user && !user.contains(e.target)) {
      user.classList.remove("is-open");
      avatar?.setAttribute("aria-expanded", "false");
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeNav();
    user?.classList.remove("is-open");
    avatar?.setAttribute("aria-expanded", "false");
  });
})();
