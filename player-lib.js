import css from "./ad-play.css";
import { setPlayerOrigin, getPlayerOrigin, mountPlay, unmountPlay } from "./play-route.js";
import { startAd } from "./ad-player.js";

function ensurePlayerStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById("babylon-ads-player-css")) return;
  const style = document.createElement("style");
  style.id = "babylon-ads-player-css";
  style.textContent = css;
  document.head.appendChild(style);
}

const api = { setPlayerOrigin, getPlayerOrigin, mountPlay, unmountPlay, startAd };

if (typeof window !== "undefined") {
  ensurePlayerStyles();
  window.BabylonAdsPlayer = api;
}

export { setPlayerOrigin, getPlayerOrigin, mountPlay, unmountPlay, startAd };
