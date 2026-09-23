import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

export function publishGwdKit() {
  const dest = join(root, "public", "gwd");
  mkdirSync(dest, { recursive: true });
  mkdirSync(join(root, "public", "gtm"), { recursive: true });
  mkdirSync(join(root, "public", "iframe"), { recursive: true });
  const copyKit = (src, file) => {
    if (!existsSync(src)) return;
    copyFileSync(src, join(dest, file));
  };
  copyKit(join(root, "ad-play.css"), "ad-play.css");
  copyKit(join(root, "gwd-shell.js"), "gwd-shell.js");
  copyKit(join(root, "assets/3d/env-neutral.hdr"), "env-neutral.hdr");
}

publishGwdKit();
