(function () {
  if (!document.getElementById("app-drawer")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `<div class="app-nav-scrim" id="app-nav-scrim"></div>
       <aside class="app-drawer" id="app-drawer" aria-label="Navegación">
         <div class="app-drawer-top" aria-hidden="true"></div>
         <nav>
           <a href="gallery.html">Galería</a>
           <a href="gallery-gwd.html">Galería GWD</a>
           <a href="ads.html">Anuncios</a>
           <a href="assets.html">Assets 3D</a>
           <a href="serve.html">Serve</a>
           <a href="many.html">Varios</a>
           <a href="gwd.html">GWD</a>
           <a href="gwd-light.html">GWD ligero</a>
           <a href="gtm.html">GTM preview</a>
           <a href="lab.html">Lab</a>
           <a href="index.html">Artículo</a>
           <a href="editor.html">Editor</a>
         </nav>
         <p class="app-drawer-note">POC de anuncios 3D · formatos IAB</p>
       </aside>`
    );
  }

  const burger = document.getElementById("app-burger");
  const scrim = document.getElementById("app-nav-scrim");
  const drawer = document.getElementById("app-drawer");
  const user = document.getElementById("app-user");
  const avatar = document.getElementById("app-avatar");

  const closeNav = () => {
    document.body.classList.remove("nav-open");
    if (burger) burger.setAttribute("aria-expanded", "false");
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

  const path = (location.pathname || "/").toLowerCase();
  const file = (path.split("/").pop() || "index.html").replace(/\.html$/, "") || "index";
  const visor = new URLSearchParams(location.search).get("visor");
  drawer?.querySelectorAll("a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").split("?")[0].toLowerCase().replace(/\.html$/, "").replace(/^\//, "");
    const gwd = href === "gallery-gwd" && (file === "gallery-gwd" || (file === "gallery" && visor === "gwd"));
    const babylon = href === "gallery" && file === "gallery" && visor !== "gwd" && file !== "gallery-gwd";
    const gtm = href === "gtm" && (file === "gtm" || path === "/gtm" || path.startsWith("/gtm/"));
    if (gtm || gwd || babylon || (href === file && href !== "gallery" && href !== "gallery-gwd" && href !== "gtm") || (file === "" && href === "index")) {
      a.classList.add("is-current");
    }
  });

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
