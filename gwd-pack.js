import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { adMarkup, formatById } from "./ad-catalog.js";
import { propActionMs } from "./prop-climax.js";

const root = dirname(fileURLToPath(import.meta.url));
const dest = process.argv[2];
if (!dest) {
  console.error("uso: node gwd-pack.js \"/ruta/al/proyecto GWD\"");
  process.exit(1);
}

const packed = JSON.parse(readFileSync(join(root, "data/galeria-1.json"), "utf8"));
const item = packed.profile.items.find((entry) => entry.alias === "DONUT") || packed.profile.items[0];
const format = formatById(item.ad);
const imgName = String(item.ph?.img || "").split("/").pop();
const glbName = "Pink_Frosted_Donut_With_Sprinkles-gwd.glb";
const orbit = `${Number(item.pch || 0)}deg ${Math.max(5, 75 - Number(item.pcv || 0))}deg ${Number(item.pcam || 4.1)}m`;
const exposure = String(Math.min(2, Math.max(0.4, Number(item.studio?.exposure ?? 1))));
const shadow = String(Math.round(Math.min(1, Math.max(0, Number(item.studio?.key ?? 0.55))) * 100) / 100);

let inner = adMarkup(format, "gwd-ad", item.in || "none", item.play, {
  pal: item.pal,
  ph: { ...item.ph, img: imgName },
  propAct: item.propAct,
  propCam: item.pcam,
  propCamH: item.pch,
  propCamV: item.pcv,
  propCamMode: item.pcm,
  handoff: item.hand,
  hms: item.hms,
  hnb: item.hnb,
  hst: item.hst,
  hin: item.hin,
  hhd: item.hhd,
  hbt: item.hbt,
  htm: item.htm,
  htxt: item.htxt,
  hempty: item.hempty,
});

const viewer = `<div class="ad-stage"><gwd-3d-model-viewer id="gwd-model" src="${glbName}" autoplay animation-name="climax" camera-orbit="${orbit}" exposure="${exposure}" shadow-intensity="${shadow}" interaction-prompt="none"></gwd-3d-model-viewer></div>`;
inner = inner.replace(/<canvas id="gwd-ad-canvas"[^>]*><\/canvas>/, viewer);
inner = inner.replace(/src="[^"]*assets\/ads\/[^"]+"/, `src="${imgName}"`);
inner = inner.replace(/<canvas class="ad-clock-layer"[\s\S]*?<\/button>\s*/, "");
inner = inner.replace(
  /class="ad-container"/,
  `class="ad-container" data-prop-ms="${propActionMs(item.propAct)}"`,
);

const page = `<!DOCTYPE html>
<html class="gwd-unit">

<head>
  <meta charset="utf-8">
  <title>Prueba donut 1</title>
  <meta name="generator" content="Google Web Designer 16.4.1.0219">
  <meta name="ad.size" content="width=${format.w},height=${format.h}">
  <link href="gwd3dmodelviewer_style.css" rel="stylesheet" data-version="2" data-exports-type="gwd-3d-model-viewer">
  <link href="ad-play.css?v=3" rel="stylesheet">
  <style id="gwd-text-style">
    p { margin: 0px; }
    h1 { margin: 0px; }
    h2 { margin: 0px; }
    h3 { margin: 0px; }
  </style>
  <style>
    html, body {
      width: 100%;
      height: 100%;
      margin: 0px;
    }
    body {
      background-color: #05080f;
      transform: none;
      perspective: none;
      transform-style: flat;
    }
    body *,
    gwd-3d-model-viewer,
    .ad-container,
    .ad-container * { transform-style: flat; }
  </style>
  <script data-source="gwd_webcomponents_v1_min.js" data-version="2" data-exports-type="gwd_webcomponents_v1" src="gwd_webcomponents_v1_min.js"></script>
  <script data-source="https://ajax.googleapis.com/ajax/libs/model-viewer/1.6.0/model-viewer.min.js" data-exports-type="gwd-3d-model-viewer" type="module" src="https://ajax.googleapis.com/ajax/libs/model-viewer/1.6.0/model-viewer.min.js"></script>
  <script data-source="gwd3dmodelviewer_min.js" data-version="2" data-exports-type="gwd-3d-model-viewer" src="gwd3dmodelviewer_min.js"></script>
</head>

<body class="player-embed gwd-unit">
${inner.trim()}
  <script src="gwd-shell.js?v=4"></script>
</body>

</html>
`;

mkdirSync(dest, { recursive: true });
writeFileSync(join(dest, "Prueba donuts.html"), page);
copyFileSync(join(root, "ad-play.css"), join(dest, "ad-play.css"));
copyFileSync(join(root, "gwd-shell.js"), join(dest, "gwd-shell.js"));
copyFileSync(join(root, "assets/ads", imgName), join(dest, imgName));

const preview = join(dest, "gwd_preview_Prueba donuts");
try {
  mkdirSync(preview, { recursive: true });
  writeFileSync(join(preview, "index.html"), page.replace("<html", '<html').replace("<head>", '<head>\n  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate"><meta http-equiv="Pragma" content="no-cache"><meta http-equiv="Expires" content="0">'));
  copyFileSync(join(root, "ad-play.css"), join(preview, "ad-play.css"));
  copyFileSync(join(root, "gwd-shell.js"), join(preview, "gwd-shell.js"));
  copyFileSync(join(root, "assets/ads", imgName), join(preview, imgName));
} catch (err) {
  console.warn("preview no actualizado", err.message);
}

console.log(`GWD pack → ${dest}`);
console.log(`GLB: ${glbName}  imagen: ${imgName}  handoff: ${item.hand}  clip: climax`);
