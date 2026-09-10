import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await esbuild.build({
  absWorkingDir: root,
  entryPoints: ["player-lib.js"],
  bundle: true,
  format: "iife",
  globalName: "BabylonAdsPlayer",
  outfile: "dist/babylon-ads-player.js",
  platform: "browser",
  target: ["es2022"],
  sourcemap: true,
  legalComments: "none",
  loader: { ".css": "text" },
  plugins: [
    {
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
    },
  ],
});

const libDir = path.join(root, "lib");
mkdirSync(libDir, { recursive: true });
copyFileSync(path.join(root, "dist/babylon-ads-player.js"), path.join(libDir, "babylon-ads-player.js"));
copyFileSync(path.join(root, "dist/babylon-ads-player.js.map"), path.join(libDir, "babylon-ads-player.js.map"));

console.log("dist/babylon-ads-player.js");
console.log("lib/babylon-ads-player.js");
