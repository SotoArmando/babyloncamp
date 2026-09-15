import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function publishGwdKit() {
  const dest = join(root, "public", "gwd");
  mkdirSync(dest, { recursive: true });
  mkdirSync(join(root, "public", "gtm"), { recursive: true });
  mkdirSync(join(root, "public", "iframe"), { recursive: true });
  copyFileSync(join(root, "ad-play.css"), join(dest, "ad-play.css"));
  copyFileSync(join(root, "gwd-shell.js"), join(dest, "gwd-shell.js"));
  copyFileSync(join(root, "assets/3d/env-neutral.hdr"), join(dest, "env-neutral.hdr"));
}

publishGwdKit();
