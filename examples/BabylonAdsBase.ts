import { BaseClientSideModule } from "./base";
import { appendScript } from "./helpers";

const GALLERY_ORIGIN = "https://galeria.tudominio.com";

function scriptUrl(): string {
  return `${GALLERY_ORIGIN}/lib/babylon-ads-player.js`;
}

export class BabylonAdsBase extends BaseClientSideModule {
  load() {
    appendScript(
      {
        "data-ot-ignore": "true",
        src: scriptUrl(),
        defer: "true",
      },
      () => {
        window.document.dispatchEvent(
          new CustomEvent("gfrm-BabylonAdsPlayerLibLoaded")
        );
      }
    );
  }

  onUpdate() {
    // No-op for now; keep for parity with other Base modules
  }
}

export default BabylonAdsBase;
