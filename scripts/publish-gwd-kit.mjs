import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function publishGwdKit() {
  const dest = join(root, "public", "gwd");
  mkdirSync(dest, { recursive: true });
  mkdirSync(join(root, "public", "gtm"), { recursive: true });
  mkdirSync(join(root, "public", "iframe"), { recursive: true });
  copyFileSync(join(root, "ad-play.css"), join(dest, "ad-play.css"));
  copyFileSync(join(root, "gwd/shell.js"), join(dest, "gwd-shell.js"));
  copyFileSync(join(root, "gwd/vendor/model-viewer.min.js"), join(dest, "model-viewer.min.js"));
  copyFileSync(join(root, "assets/3d/env-neutral.hdr"), join(dest, "env-neutral.hdr"));
  copyFileSync(join(root, "play-2d.js"), join(dest, "play-2d.js"));
  copyFileSync(join(root, "ad-catalog.js"), join(dest, "ad-catalog.js"));
  copyFileSync(join(root, "player-origin.js"), join(dest, "player-origin.js"));
  const player = join(root, "public", "player");
  mkdirSync(player, { recursive: true });
  copyFileSync(join(root, "ad-play.css"), join(player, "ad-play.css"));
  copyFileSync(join(root, "gwd/hosts/native-page.html"), join(player, "index.html"));
  const bundle = join(root, "dist", "babylon-ads-player.js");
  if (existsSync(bundle)) copyFileSync(bundle, join(player, "babylon-ads-player.js"));
}

publishGwdKit();
