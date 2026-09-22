(function () {
  const NAV_PREFS_KEY = "babylon-ads-nav-routes";
  const NAV_ROUTES = [
    { id: "index", href: "index.html", label: "Inicio", group: "Sitio" },
    { id: "article", href: "article.html", label: "Artículo", group: "Sitio" },
    { id: "gallery", href: "gallery.html", label: "Galería", group: "Play" },
    { id: "gallery-gwd", href: "gallery-gwd.html", label: "Galería GWD", group: "Play" },
    { id: "browse", href: "browse.html", label: "Buscar", group: "Play" },
    { id: "lab", href: "lab.html", label: "Lab", group: "Play" },
    { id: "ads", href: "ads.html", label: "Anuncios", group: "Herramientas" },
    { id: "assets", href: "assets.html", label: "Assets 3D", group: "Herramientas" },
    { id: "serve", href: "serve.html", label: "Serve", group: "Herramientas" },
    { id: "many", href: "many.html", label: "Varios", group: "Herramientas" },
    { id: "gwd", href: "gwd.html", label: "GWD", group: "Herramientas" },
    { id: "gwd-light", href: "gwd-light.html", label: "GWD ligero", group: "Herramientas" },
    { id: "gtm", href: "gtm.html", label: "GTM preview", group: "Herramientas" },
    { id: "editor", href: "editor.html", label: "Editor", group: "Herramientas" },
  ];
  const ALL_IDS = NAV_ROUTES.map((route) => route.id);

  function currentRouteId() {
    const path = (location.pathname || "/").toLowerCase();
    const file = (path.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
    const visor = new URLSearchParams(location.search).get("visor");
    if (file === "gallery" && visor === "gwd") return "gallery-gwd";
    if (file === "gtm" || path === "/gtm" || path.startsWith("/gtm/")) return "gtm";
    if (!file || file === "index") return "index";
    return ALL_IDS.includes(file) ? file : "index";
  }

  function loadNavPrefs() {
    try {
      const raw = JSON.parse(localStorage.getItem(NAV_PREFS_KEY) || "null");
      if (Array.isArray(raw)) {
        const allowed = new Set(ALL_IDS);
        const ids = raw.filter((id) => allowed.has(id));
        if (ids.length) return ids;
      }
    } catch { /* defaults */ }
    return ALL_IDS.slice();
  }

  function saveNavPrefs(ids) {
    const allowed = new Set(ALL_IDS);
    const next = ids.filter((id) => allowed.has(id));
    localStorage.setItem(NAV_PREFS_KEY, JSON.stringify(next.length ? next : ALL_IDS));
  }

  if (!document.getElementById("app-drawer")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="app-nav-scrim" id="app-nav-scrim"></div>
       <aside class="app-drawer" id="app-drawer" aria-label="Navegación">
         <div class="app-drawer-top" aria-hidden="true"></div>
         <nav id="app-drawer-nav"></nav>
         <button type="button" class="app-drawer-prefs" data-app-prefs>Preferencias</button>
         <p class="app-drawer-note">POC de anuncios 3D · formatos IAB</p>
       </aside>`
    );
  }

  if (!document.getElementById("app-prefs")) {
    const groups = [...new Set(NAV_ROUTES.map((route) => route.group))];
    const fields = groups.map((group) => {
      const rows = NAV_ROUTES.filter((route) => route.group === group).map((route) =>
        `<label class="app-prefs-row">
           <input type="checkbox" name="nav-route" value="${route.id}" />
           <span>${route.label}</span>
         </label>`
      ).join("");
      return `<fieldset class="app-prefs-group"><legend>${group}</legend>${rows}</fieldset>`;
    }).join("");
    document.body.insertAdjacentHTML(
      "beforeend",
      `<dialog class="app-prefs" id="app-prefs" aria-labelledby="app-prefs-title">
         <form method="dialog" id="app-prefs-form">
           <h2 id="app-prefs-title">Preferencias</h2>
           <p>Elegí qué rutas aparecen en el menú lateral. La página actual siempre se muestra.</p>
           <div class="app-prefs-list">${fields}</div>
           <div class="app-prefs-actions">
             <button type="button" class="app-prefs-ghost" id="app-prefs-reset">Mostrar todas</button>
             <button type="submit" class="app-prefs-save" value="ok">Listo</button>
           </div>
         </form>
       </dialog>`
    );
  }

  const burger = document.getElementById("app-burger");
  const scrim = document.getElementById("app-nav-scrim");
  const drawer = document.getElementById("app-drawer");
  const drawerNav = document.getElementById("app-drawer-nav") || drawer?.querySelector("nav");
  const user = document.getElementById("app-user");
  const avatar = document.getElementById("app-avatar");
  const prefs = document.getElementById("app-prefs");

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
  };
  const openNav = () => {
    document.body.classList.add("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "true");
    user?.classList.remove("is-open");
  };

  function markCurrent(root = drawerNav) {
    const current = currentRouteId();
    root?.querySelectorAll("a[href]").forEach((a) => {
      const href = (a.getAttribute("href") || "").split("?")[0].toLowerCase().replace(/\.html$/, "").replace(/^\//, "") || "index";
      a.classList.toggle("is-current", href === current);
    });
  }

  function renderDrawer() {
    if (!drawerNav) return;
    const shown = new Set(loadNavPrefs());
    const current = currentRouteId();
    drawerNav.innerHTML = NAV_ROUTES
      .filter((route) => shown.has(route.id) || route.id === current)
      .map((route) => `<a href="${route.href}">${route.label}</a>`)
      .join("");
    markCurrent(drawerNav);
  }

  function syncPrefsForm() {
    if (!prefs) return;
    const shown = new Set(loadNavPrefs());
    const current = currentRouteId();
    prefs.querySelectorAll('input[name="nav-route"]').forEach((input) => {
      input.checked = shown.has(input.value);
      input.disabled = input.value === current;
    });
  }

  function applyPrefsFromForm() {
    const ids = [...prefs.querySelectorAll('input[name="nav-route"]:checked')].map((input) => input.value);
    saveNavPrefs(ids);
    renderDrawer();
  }

  function openPrefs() {
    closeNav();
    user?.classList.remove("is-open");
    avatar?.setAttribute("aria-expanded", "false");
    syncPrefsForm();
    if (typeof prefs.showModal === "function") prefs.showModal();
    else prefs.setAttribute("open", "");
  }

  function closePrefs() {
    if (typeof prefs.close === "function") prefs.close();
    else prefs.removeAttribute("open");
  }

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
    const prefsBtn = e.target.closest("[data-app-prefs]");
    if (prefsBtn) {
      e.preventDefault();
      openPrefs();
      return;
    }
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

  prefs?.addEventListener("change", (e) => {
    if (e.target?.name === "nav-route") applyPrefsFromForm();
  });
  document.getElementById("app-prefs-reset")?.addEventListener("click", () => {
    saveNavPrefs(ALL_IDS.slice());
    syncPrefsForm();
    renderDrawer();
  });
  prefs?.addEventListener("click", (e) => {
    if (e.target === prefs) closePrefs();
  });

  renderDrawer();
})();
