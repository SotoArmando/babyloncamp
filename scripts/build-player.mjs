import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BABYLON_VER = "7.54.3";

function babylonCdn(spec) {
  const id = String(spec || "");
  if (id === "@babylonjs/core" || id.startsWith("@babylonjs/core/")) {
    return id.replace("@babylonjs/core", `https://esm.sh/@babylonjs/core@${BABYLON_VER}`);
  }
  if (id === "@babylonjs/loaders" || id.startsWith("@babylonjs/loaders/")) {
    const rest = id.slice("@babylonjs/loaders".length);
    return `https://esm.sh/@babylonjs/loaders@${BABYLON_VER}${rest}?external=@babylonjs/core`;
  }
  return id;
}

const stripQuery = {
  name: "strip-query",
  setup(build) {
    build.onResolve({ filter: /\?/ }, (args) => {
      const bare = args.path.replace(/\?.*$/, "");
      if (bare.startsWith(".") || bare.startsWith("/")) {
        return { path: path.resolve(args.resolveDir, bare) };
      }
      return { path: bare, external: true };
    });
  },
};

const babylonExternal = {
  name: "babylon-cdn",
  setup(build) {
    build.onResolve({ filter: /^@babylonjs\// }, (args) => ({
      path: babylonCdn(args.path),
      external: true,
    }));
  },
};

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["player-lib.js"],
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "BabylonAdsPlayer",
  outfile: "dist/babylon-ads-player.js",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  legalComments: "none",
  loader: { ".css": "text" },
  plugins: [stripQuery, babylonExternal],
});

const libDir = path.join(root, "lib");
mkdirSync(libDir, { recursive: true });
copyFileSync(path.join(root, "dist/babylon-ads-player.js"), path.join(libDir, "babylon-ads-player.js"));
copyFileSync(path.join(root, "dist/babylon-ads-player.js.map"), path.join(libDir, "babylon-ads-player.js.map"));

const out = path.join(root, "dist/babylon-ads-player.js");
const bytes = readFileSync(out);
const gzip = gzipSync(bytes).length;
const raw = statSync(out).size;
console.log("dist/babylon-ads-player.js");
console.log("lib/babylon-ads-player.js");
console.log(`${(raw / 1024).toFixed(1)} KB  gzip ${(gzip / 1024).toFixed(1)} KB  (Babylon por esm.sh)`);
