import { useEffect, useRef } from "react";

const LIB_EVENT = "gfrm-BabylonAdsPlayerLibLoaded";
const GALLERY_ORIGIN = "https://contentbay.sotoarmando.dev";

function playerApi() {
  return window.BabylonAdsPlayer;
}

export function AdPlay({ profileId, playId }) {
  const hostRef = useRef(null);
  const slotId = `ad-${playId}`;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let cancelled = false;

    const start = (api) => {
      api.setPlayerOrigin(GALLERY_ORIGIN);
      api.mountPlay(host, { profileId, playId, slotId }).then((ok) => {
        if (cancelled) api.unmountPlay(slotId);
        else if (!ok) host.innerHTML = `<p class="player-miss">Ese clímax no está en el perfil.</p>`;
      });
    };

    const existing = playerApi();
    if (existing) {
      start(existing);
      return () => {
        cancelled = true;
        playerApi()?.unmountPlay(slotId);
        host.innerHTML = "";
      };
    }

    const onLoad = () => {
      const api = playerApi();
      if (api) start(api);
    };
    window.document.addEventListener(LIB_EVENT, onLoad);
    return () => {
      cancelled = true;
      window.document.removeEventListener(LIB_EVENT, onLoad);
      playerApi()?.unmountPlay(slotId);
      host.innerHTML = "";
    };
  }, []);

  return <div ref={hostRef} />;
}
