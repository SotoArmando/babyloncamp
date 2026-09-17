import { formatById } from "../../ad-catalog.js?v=cam23";

const HOST_KEY = "gwd-snippet-host";
const PLAY_ASK = "babylon-play-request";
const PLAY_GIVE = "babylon-play-combo";

export function loadGwdSnippetHost() {
  try {
    return localStorage.getItem(HOST_KEY) === "native" ? "native" : "adapter";
  } catch {
    return "adapter";
  }
}

export function setGwdSnippetHost(value) {
  const host = value === "native" ? "native" : "adapter";
  try {
    localStorage.setItem(HOST_KEY, host);
  } catch { /* optional */ }
  return host;
}

export function gwdNativeAdHref(item, profileId = "", spec = null, origin = "") {
  if (!item?.id) return "";
  const parts = [];
  if (profileId) parts.push(`p=${encodeURIComponent(profileId)}`);
  parts.push(`id=${encodeURIComponent(item.id)}`);
  const file = spec?.file;
  if (file) {
    const base = String(origin || "").replace(/\/+$/, "");
    const glb = base ? `${base}/public/gtm/${file}` : `public/gtm/${file}`;
    parts.push(`glb=${encodeURIComponent(glb)}`);
  }
  return `public/player/index.html#${parts.join("&")}`;
}

export function gwdNativeServeHref(item, profileId = "", origin = "", spec = null) {
  const href = gwdNativeAdHref(item, profileId, spec, origin);
  if (!href) return "";
  const base = String(origin || "").replace(/\/+$/, "");
  return base ? `${base}/${href}` : href;
}

export function gwdNativeIframeTag(item, spec, origin, profileId = "") {
  const src = gwdNativeServeHref(item, profileId, origin, spec);
  if (!src) return "";
  const w = Number(spec?.w) || Number(formatById(item?.ad).w) || 300;
  const h = Number(spec?.h) || Number(formatById(item?.ad).h) || 250;
  return `<iframe src="${src}" width="${w}" height="${h}" frameborder="0" scrolling="no" allowfullscreen></iframe>`;
}

function nativeSlug(item, spec) {
  return String(item?.alias || spec?.file || item?.id || "gwd-native")
    .replace(/\.glb$/i, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48) || "gwd-native";
}

function nativePageCss(format) {
  return `        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0px;
        }

        .gwd-page-container {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .gwd-page-content {
            background-color: transparent;
            transform: none;
            position: absolute;
            transform-style: flat;
        }

        .gwd-page-content * {
            transform-style: flat;
        }

        .gwd-page-wrapper {
            background-color: rgb(255, 255, 255);
            position: absolute;
            transform: translateZ(0px);
        }

        .gwd-page-size {
            width: ${format.w}px;
            height: ${format.h}px;
        }

        #gwd-native-frame {
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            border: 0;
            display: block;
        }`;
}

export function gwdNativeInsertGuide(item, spec, origin, profileId = "") {
  const format = spec?.w && spec?.h ? spec : formatById(item?.ad);
  const href = gwdNativeServeHref(item, profileId, origin, spec);
  return `Nuevo proyecto GWD · Banner 3.0 · ${format.w}×${format.h} · galería nativa

El snippet es un iframe al player de gallery.html. No pegues import maps ni model-viewer.
No abras el HTML suelto desde Descargas: GWD no trae gwdpage_style.css. File → New → Code view.
Origen: ${origin}
Ad: ${href}

1. File → New. Banner. Tamaño ${format.w} × ${format.h} px.
2. Code view: pegá el snippet. El iframe carga public/player (Babylon IIFE).
3. Publicar en public/ copia player a public/player y el GLB/foto a public/gtm.
4. Guardá. Preview.`;
}

function bakeComboJson(item) {
  return JSON.stringify(item || null).replace(/</g, "\\u003c");
}

export function gwdNativePasteSnippet(item, spec, origin, profileId = "") {
  if (!item?.id) return "";
  const format = spec?.w && spec?.h ? spec : formatById(item?.ad);
  const src = gwdNativeServeHref(item, profileId, origin, spec);
  const baked = bakeComboJson(item);
  return `<!DOCTYPE html>
<html class="gwd-unit">

<head>
    <meta charset="utf-8">
    <meta name="generator" content="Google Web Designer 16.4.1.0219">
    <meta name="template" content="Banner 3.0.0">
    <meta name="environment" content="gwd-dv360">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="ad.size" content="width=${format.w},height=${format.h}">
    <link href="gwdpage_style.css" rel="stylesheet" data-version="13" data-exports-type="gwd-page">
    <link href="gwdpagedeck_style.css" rel="stylesheet" data-version="14" data-exports-type="gwd-pagedeck">
    <link href="gwdgooglead_style.css" rel="stylesheet" data-version="9" data-exports-type="gwd-google-ad">
    <style id="gwd-lightbox-style">
        .gwd-lightbox {
            overflow: hidden;
        }
    </style>
    <style id="gwd-text-style">
        p {
            margin: 0px;
        }

        h1 {
            margin: 0px;
        }

        h2 {
            margin: 0px;
        }

        h3 {
            margin: 0px;
        }
    </style>
    <style>
${nativePageCss(format)}
    </style>
    <script data-source="gwd_webcomponents_v1_min.js" data-version="2" data-exports-type="gwd_webcomponents_v1" src="gwd_webcomponents_v1_min.js"></script>
    <script data-source="gwdpage_min.js" data-version="13" data-exports-type="gwd-page" src="gwdpage_min.js"></script>
    <script data-source="gwdpagedeck_min.js" data-version="14" data-exports-type="gwd-pagedeck" src="gwdpagedeck_min.js"></script>
    <script data-source="https://s0.2mdn.net/ads/studio/Enabler.js" data-exports-type="gwd-google-ad" src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>
    <script data-source="gwdgooglead_min.js" data-version="9" data-exports-type="gwd-google-ad" src="gwdgooglead_min.js"></script>
    <script type="text/javascript" id="gwd-native-combo">
        window.addEventListener("message", function(ev) {
            if (!ev.data || ev.data.type !== "${PLAY_ASK}") return;
            ev.source && ev.source.postMessage({ type: "${PLAY_GIVE}", item: ${baked} }, "*");
        }, false);
    </script>
</head>

<body class="player-embed gwd-unit gwd-ad">
    <gwd-google-ad id="gwd-ad" polite-load="">
        <gwd-metric-configuration></gwd-metric-configuration>
        <gwd-pagedeck class="gwd-page-container" id="pagedeck">
            <gwd-page id="page1" class="gwd-page-wrapper gwd-page-size gwd-lightbox" data-gwd-width="${format.w}px" data-gwd-height="${format.h}px">
                <div class="gwd-page-content gwd-page-size">
                    <iframe id="gwd-native-frame" src="${src}" title="ad" width="${format.w}" height="${format.h}" frameborder="0" scrolling="no" allowfullscreen></iframe>
                </div>
            </gwd-page>
        </gwd-pagedeck>
    </gwd-google-ad>
    <script type="text/javascript" id="gwd-init-code">
        ( function() {
            var gwdAd = document.getElementById( 'gwd-ad' );

            function handleDomContentLoaded( event ) {

            }

            function handleWebComponentsReady( event ) {
                requestAnimationFrame( function() {
                    setTimeout( function() {
                        gwdAd.initAd();
                    }, 1 );
                } );
            }

            function handleAdInitialized( event ) {}

            window.addEventListener( 'DOMContentLoaded',
                handleDomContentLoaded, false );
            window.addEventListener( 'WebComponentsReady',
                handleWebComponentsReady, false );
            window.addEventListener( 'adinitialized',
                handleAdInitialized, false );
        } )();
    </script>
</body>

</html>
`;
}

export function gwdNativePublicAdHtml(item, spec, origin, profileId = "") {
  if (!item?.id) return "";
  const format = spec?.w && spec?.h ? spec : formatById(item?.ad);
  const base = String(origin || "").replace(/\/+$/, "");
  const player = `${base}/public/player/babylon-ads-player.js?v=prop51`;
  const baked = bakeComboJson(item);
  const profile = JSON.stringify(String(profileId || ""));
  const serve = JSON.stringify(base);
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="ad.size" content="width=${format.w},height=${format.h}" />
  <title>${item.alias || item.id || "Player nativo"}</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: #111; }
    #gwd-slot { width: 100%; height: 100%; }
    body.gwd-ad .ad-label, body.gwd-ad .ad-hint { display: none; }
    .player-miss { margin: 0; padding: 1rem; color: #d8d0c4; font: 650 0.8rem/1.4 ui-sans-serif, system-ui, sans-serif; text-align: center; }
  </style>
</head>
<body class="player-embed gwd-ad">
  <div id="gwd-slot"></div>
  <script src="${player}"></script>
  <script>
    (async function () {
      var api = window.BabylonAdsPlayer;
      var host = document.getElementById("gwd-slot");
      if (!api || !api.mountPlay) {
        host.innerHTML = "<p class=\\"player-miss\\">Falta el player en public/player.</p>";
        return;
      }
      var item = ${baked};
      var origin = ${serve} || location.origin;
      var meshUrl = ${JSON.stringify(spec?.file ? `${String(origin || "").replace(/\/+$/, "")}/public/gtm/${spec.file}` : "")};
      api.setPlayerOrigin(origin);
      var ok = await api.mountPlay(host, { item: item, playId: item.id, profileId: ${profile}, slotId: "gwd-ad", origin: origin, meshUrl: meshUrl || undefined });
      if (!ok) {
        host.innerHTML = "<p class=\\"player-miss\\">Ese clímax no está en el perfil.</p>";
        return;
      }
      var box = host.querySelector(".ad-container");
      if (box && api.startAd) await api.startAd(box);
    })();
  </script>
</body>
</html>
`;
}

function clickDownload(name, data, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function gwdDownloadNativeSnippet(item, spec, origin, profileId = "") {
  const html = gwdNativePasteSnippet(item, spec, origin, profileId);
  if (!html) throw new Error("Ese clímax no tiene id.");
  clickDownload(`${nativeSlug(item, spec)}-gwd-native.html`, html, "text/html");
}
