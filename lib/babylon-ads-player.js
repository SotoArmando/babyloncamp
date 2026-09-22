var BabylonAdsPlayer=(()=>{var fn=Object.create;var Lt=Object.defineProperty;var pn=Object.getOwnPropertyDescriptor;var un=Object.getOwnPropertyNames;var hn=Object.getPrototypeOf,mn=Object.prototype.hasOwnProperty;var Tt=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,a)=>(typeof require<"u"?require:t)[a]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')});var bn=(e,t)=>{for(var a in t)Lt(e,a,{get:t[a],enumerable:!0})},fo=(e,t,a,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of un(t))!mn.call(e,r)&&r!==a&&Lt(e,r,{get:()=>t[r],enumerable:!(o=pn(t,r))||o.enumerable});return e};var Et=(e,t,a)=>(a=e!=null?fn(hn(e)):{},fo(t||!e||!e.__esModule?Lt(a,"default",{value:e,enumerable:!0}):a,e)),gn=e=>fo(Lt({},"__esModule",{value:!0}),e);var Ns={};bn(Ns,{getPlayerOrigin:()=>Rt,mountPlay:()=>eo,setPlayerOrigin:()=>it,startAd:()=>Qa,unmountPlay:()=>to});var po=`/* Shared ad-unit styles (from gallery) */
:root { --void-l: 10; --item-line: rgba(0,0,0,.12); --neon: #101514; }
.ad-container { container-type: inline-size; }

    .ad-slot { --ad-w: 300px; --ad-h: 250px; width: min(100%, var(--ad-w)); max-width: 100%; }
    .ad-label {
      font-size: 0.62rem;
      font-weight: 650;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: color-mix(in srgb, rgba(226, 232, 238, 0.62) calc(100% - var(--void-l) * 1%), #5c6b7a calc(var(--void-l) * 1%));
      text-align: center;
      margin-bottom: 0.4rem;
    }
    .ad-frame {
      position: relative;
      width: 100%;
      height: auto;
      aspect-ratio: var(--ad-ratio, var(--ad-w) / var(--ad-h));
      padding-bottom: 0;
      box-shadow: none;
      outline: calc(1px / var(--preview-zoom, 1)) solid var(--item-line);
      outline-offset: 0;
    }
    .ad-container {
      position: absolute;
      inset: 0;
      overflow: clip;
      isolation: isolate;
      background: color-mix(in srgb, #05080f calc(100% - var(--void-l) * 1%), #e4e6e2 calc(var(--void-l) * 1%));
      cursor: pointer;
    }
    .ad-container.is-idle canvas,
    .ad-container.is-idle model-viewer,
    .ad-container.is-idle .ad-hint,
    .ad-container.is-idle .ad-fallback {
      visibility: hidden;
    }
    .ad-container.is-idle .ad-creative {
      opacity: 1;
      transform: none;
      animation: none;
      pointer-events: none;
    }
    .ad-container.is-paused,
    .ad-container.is-paused * {
      animation-play-state: paused !important;
    }
    .ad-clock-layer {
      position: absolute;
      inset: 0;
      z-index: 40;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
    .ad-clock {
      appearance: none;
      position: absolute;
      z-index: 41;
      top: 0.38rem;
      right: 0.38rem;
      width: calc(2.2rem * var(--clock-size, 1));
      height: calc(2.2rem * var(--clock-size, 1));
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
    }
    .clock-look {
      display: grid;
      gap: 0.45rem;
    }
    .clock-look-label {
      font-size: 0.72rem;
      color: var(--muted);
    }
    .clock-size-row {
      display: grid;
      gap: 0.28rem;
      font-size: 0.85rem;
    }
    .clock-size-row span {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .clock-size-row output { font-weight: 650; }
    .clock-size-row input[type="range"] {
      width: 100%;
      accent-color: var(--neon);
    }
    .clock-style-picks,
    .clock-tone-picks {
      grid-template-columns: 1fr 1fr;
    }
    .g-modal .clock-style-picks .layout-pick,
    .g-modal .clock-tone-picks .layout-pick {
      min-height: 0;
      padding: 0.55rem 0.5rem;
    }
    .ad-slot.is-in .ad-clock,
    .ad-container.is-visible .ad-clock {
      opacity: 1;
      pointer-events: auto;
    }
    .ad-container.is-idle .ad-clock,
    .ad-container.is-idle .ad-clock-layer,
    body.clock-off .ad-clock,
    body.clock-off .ad-clock-layer {
      display: none;
    }
    .ad-container canvas,
    .ad-container model-viewer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: block;
      transition: opacity 0.45s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease;
    }
    .ad-fallback { display: none; }
    .ad-hint {
      position: absolute; left: 8px; bottom: 6px; z-index: 3;
      font-size: 0.65rem;
      color: color-mix(in srgb, rgba(215, 226, 242, 0.75) calc(100% - var(--void-l) * 1%), #3a4450 calc(var(--void-l) * 1%));
      pointer-events: none;
    }
    .ad-container.is-climax .ad-hint,
    .ad-container.is-ad-in .ad-hint { opacity: 0; }
    .ad-container.is-climax canvas,
    .ad-container.is-climax model-viewer { opacity: 0.42; }
    .ad-container[data-play="horizon"].is-climax canvas,
    .ad-container[data-play="horizon"].is-climax model-viewer,
    .ad-container[data-play="sundown"].is-climax canvas,
    .ad-container[data-play="sundown"].is-climax model-viewer,
    .ad-container[data-play="storm"].is-climax canvas,
    .ad-container[data-play="storm"].is-climax model-viewer,
    .ad-container[data-play="aurora"].is-climax canvas,
    .ad-container[data-play="aurora"].is-climax model-viewer,
    .ad-container[data-play="erupt"].is-climax canvas,
    .ad-container[data-play="erupt"].is-climax model-viewer,
    .ad-container[data-play="migrate"].is-climax canvas,
    .ad-container[data-play="migrate"].is-climax model-viewer,
    .ad-container[data-play="breaker"].is-climax canvas,
    .ad-container[data-play="breaker"].is-climax model-viewer,
    .ad-container[data-play="calve"].is-climax canvas,
    .ad-container[data-play="calve"].is-climax model-viewer,
    .ad-container[data-play="prop"].is-climax canvas,
    .ad-container[data-play="prop"].is-climax model-viewer { opacity: 0.72; }
    .ad-container[data-play="pre-enter"].is-pre-exit canvas,
    .ad-container[data-play="pre-enter"].is-pre-exit model-viewer {
      opacity: 0; transform: scale(1.14); filter: blur(10px);
    }
    .ad-creative {
      position: absolute; inset: 0; z-index: 4;
      display: grid; place-items: center; padding: 0;
      color: var(--ph-ink, #6f5d45);
      background: var(--ph-bg, #c4b191);
      opacity: 0; transform: translateY(14px); pointer-events: none;
      transition: opacity 0.65s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .ad-ph {
      position: relative;
      width: 100%; height: 100%;
      display: grid; place-items: center;
      overflow: hidden;
      color: var(--ph-ink, #3d2a18);
      background:
        radial-gradient(120% 85% at 12% 8%, color-mix(in srgb, var(--ph-paper, #efe0c4) 78%, transparent) 0%, transparent 46%),
        radial-gradient(82% 72% at 94% 100%, color-mix(in srgb, var(--ph-accent, #8b5a2b) 64%, transparent) 0%, transparent 54%),
        linear-gradient(165deg, var(--ph-paper, #efe0c4) 0%, var(--ph-bg, #b89a6e) 48%, color-mix(in srgb, var(--ph-ink, #3d2a18) 24%, var(--ph-bg, #b89a6e)) 100%);
    }
    .ad-ph::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      box-shadow:
        inset 0 0 0 1px color-mix(in srgb, var(--ph-ink, #3d2a18) 18%, transparent),
        inset 0 -34% 50% color-mix(in srgb, var(--ph-accent, #8b5a2b) 26%, transparent);
    }
    .ad-ph-art {
      grid-area: 1 / 1;
      position: relative;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      display: grid;
      place-items: center;
      overflow: hidden;
    }
    .ad-ph-shot {
      display: block;
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      min-width: 0;
      min-height: 0;
      object-fit: cover;
      object-position: var(--ph-fit-x, 50%) var(--ph-fit-y, 50%);
      transform: scale(var(--ph-fit-z, 1));
      transform-origin: var(--ph-fit-x, 50%) var(--ph-fit-y, 50%);
    }
    .ad-ph[data-fit="contain"] .ad-ph-shot { object-fit: contain; }
    .ad-ph[data-fit="fill"] .ad-ph-shot { object-fit: fill; }
    .ad-ph[data-fit="cover"] .ad-ph-shot { object-fit: cover; }
    .ad-ph:has(.ad-ph-shot),
    .ad-ph-art:has(.ad-ph-shot),
    .ad-ph-shot {
      background: var(--ph-fit-mat, #111);
    }
    .ad-ph:has(.ad-ph-shot)::after { display: none; }
    .ad-ph-size {
      grid-area: 1 / 1;
      z-index: 1;
      font-size: clamp(0.72rem, 5.6cqw, 1.2rem);
      font-weight: 750;
      letter-spacing: 0.06em;
      line-height: 1;
      white-space: nowrap;
      color: var(--ph-ink, #6f5d45);
      pointer-events: none;
    }
    .ad-ph-icon {
      display: block;
      width: min(46%, 7.2rem);
      height: auto;
      max-height: 58%;
      opacity: 0.55;
    }
    .ad-ph-frame {
      width: 72%;
      height: 72%;
      border: 2px solid var(--ph-ink, #3d2a18);
      background: var(--ph-paper, #efe0c4);
      box-shadow: 0 0 0 1px color-mix(in srgb, var(--ph-accent, #8b5a2b) 55%, transparent);
      border-radius: 4px;
    }
    .ad-ph-bars {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }
    .ad-ph-bars i { flex: 1; display: block; }
    .ad-ph-bars i:nth-child(1) { background: var(--ph-bg, #c4b191); }
    .ad-ph-bars i:nth-child(2) { background: var(--ph-paper, #d6c6ab); }
    .ad-ph-bars i:nth-child(3) { background: var(--ph-accent, #8b5a2b); }
    .ad-ph-grid {
      width: 100%;
      height: 100%;
      background:
        repeating-linear-gradient(0deg, transparent 0 18px, color-mix(in srgb, var(--ph-accent, #8b5a2b) 42%, transparent) 18px 19px),
        repeating-linear-gradient(90deg, transparent 0 18px, color-mix(in srgb, var(--ph-ink, #3d2a18) 28%, transparent) 18px 19px),
        var(--ph-paper, #efe0c4);
    }
    .ad-container.is-climax .ad-creative {
      opacity: 1;
      transform: none;
      pointer-events: auto;
      animation: ad-climax-arrive 0.78s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    @keyframes ad-climax-arrive {
      0% { opacity: 0; transform: scale(0.78); filter: brightness(2.4); }
      52% { opacity: 1; transform: scale(1.03); filter: brightness(1.12); }
      100% { opacity: 1; transform: none; filter: none; }
    }
    .ad-container[data-play="pre-enter"] .ad-creative {
      opacity: 0;
      transform: none;
    }
    .ad-container[data-play="pre-enter"].is-ad-in .ad-creative {
      opacity: 1;
      transform: none;
      pointer-events: auto;
      animation: ad-climax-arrive 0.78s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .ad-handoff {
      position: absolute;
      inset: 0;
      z-index: 30;
      display: none;
      pointer-events: none;
      overflow: hidden;
    }
    .ad-container.is-handoff .ad-handoff {
      display: grid;
    }
    .ad-container[data-handoff="wipe"].is-handoff .ad-handoff,
    .ad-container[data-handoff="pulse"].is-handoff .ad-handoff {
      grid-template-rows: repeat(var(--handoff-bands, 3), minmax(0, 1fr));
      gap: 0;
      background: none;
    }
    .ad-container[data-handoff="wipe"] .ad-handoff-band,
    .ad-container[data-handoff="pulse"] .ad-handoff-band {
      min-height: 0;
      align-self: stretch;
      box-shadow: 0 1px 0 var(--band, var(--ph-accent, #8b5a2b));
    }
    .ad-container[data-handoff="veil"].is-handoff .ad-handoff {
      display: block;
      animation: handoff-veil-cover var(--handoff-in, 0.64s) cubic-bezier(0.22, 0.72, 0.18, 1) both;
    }
    .ad-container[data-handoff="veil"] .ad-handoff-band {
      position: absolute;
      inset: 0;
    }
    .ad-handoff-band {
      --band: var(--ph-accent, #8b5a2b);
      position: relative;
      display: block;
      min-height: 0;
      background: var(--band);
    }
    .ad-handoff-band:nth-child(4n+1) { --band: var(--ph-ink, #3d2a18); }
    .ad-handoff-band:nth-child(4n+2) { --band: var(--ph-accent, #8b5a2b); }
    .ad-handoff-band:nth-child(4n+3) { --band: var(--ph-paper, #efe0c4); }
    .ad-handoff-band:nth-child(4n+4) { --band: var(--ph-bg, #c4b191); }
    .ad-handoff-claim {
      display: none;
      height: 100%;
      place-items: center;
      padding: 0 0.85rem;
      font-size: clamp(0.78rem, 6.2cqw, 1.15rem);
      font-weight: 750;
      letter-spacing: 0.06em;
      line-height: 1.2;
      text-align: center;
      color: var(--ph-paper, #efe0c4);
      text-wrap: balance;
    }
    .ad-container.is-handoff.is-climax:not([data-handoff="none"]):not(.is-handoff-done) canvas,
    .ad-container.is-handoff.is-climax:not([data-handoff="none"]):not(.is-handoff-done) model-viewer,
    .ad-container.is-handoff.is-pre-exit:not([data-handoff="none"]):not(.is-handoff-done) canvas,
    .ad-container.is-handoff.is-pre-exit:not([data-handoff="none"]):not(.is-handoff-done) model-viewer {
      opacity: 1;
      transform: none;
      filter: none;
    }
    .ad-container.is-handoff.is-climax:not([data-handoff="none"]):not([data-handoff="veil"]) .ad-creative,
    .ad-container.is-handoff.is-ad-in:not([data-handoff="none"]) .ad-creative {
      animation: none;
      opacity: 1;
      transform: none;
      filter: none;
    }
    .ad-container[data-handoff="veil"].is-climax:not(.is-handoff-hold):not(.is-handoff-done) .ad-creative {
      animation: none;
      opacity: 0;
      transform: none;
      filter: none;
    }
    .ad-container[data-handoff="veil"].is-climax.is-handoff-hold .ad-creative,
    .ad-container[data-handoff="veil"].is-climax.is-handoff-done .ad-creative {
      animation: none;
      opacity: 1;
      transform: none;
      filter: none;
    }
    .ad-container[data-handoff="wipe"].is-handoff .ad-handoff-band {
      transform: translateX(-104%);
      opacity: 0;
      animation:
        handoff-wipe var(--handoff-ms, 2.25s) cubic-bezier(0.16, 0.84, 0.22, 1) both,
        handoff-wipe-rise var(--handoff-rise, 0.42s) ease-out both;
      animation-delay: calc(var(--i, 0) * var(--handoff-stagger, 120ms));
    }
    .ad-container[data-handoff="wipe"] .ad-handoff-band:nth-child(1) .ad-handoff-claim {
      display: grid;
    }
    @keyframes handoff-wipe-rise {
      0% { opacity: 0; filter: blur(10px); }
      100% { opacity: 1; filter: none; }
    }
    @keyframes handoff-wipe {
      0% { transform: translateX(-104%); }
      34% { transform: translateX(0); }
      62% { transform: translateX(0); }
      100% { transform: translateX(104%); }
    }
    .ad-container[data-handoff="pulse"].is-handoff .ad-handoff {
      animation: handoff-wipe-rise var(--handoff-rise, 0.42s) ease-out both;
    }
    .ad-container[data-handoff="veil"].is-handoff .ad-handoff-band {
      opacity: 1;
      z-index: calc(30 - var(--i, 0));
      animation: none;
    }
    .ad-container[data-handoff="veil"].is-handoff-hold:not(.is-handoff-done) .ad-handoff-band {
      animation: handoff-veil var(--handoff-fade, 0.7s) cubic-bezier(0.4, 0.05, 0.2, 1) forwards;
      animation-delay: calc(var(--i, 0) * var(--handoff-fade, 0.7s));
    }
    .ad-container[data-handoff="veil"] .ad-handoff-band:nth-child(1) .ad-handoff-claim {
      display: grid;
    }
    @keyframes handoff-veil-cover {
      0% { opacity: 0; filter: blur(16px); }
      100% { opacity: 1; filter: blur(0); }
    }
    @keyframes handoff-veil {
      0% { opacity: 1; filter: none; transform: scale(1); }
      100% { opacity: 0; filter: blur(10px); transform: scale(1.03); }
    }
    .ad-container[data-handoff="pulse"].is-handoff:not(.is-handoff-hold):not(.is-handoff-done) .ad-handoff-band {
      animation: handoff-pulse-hit var(--handoff-beat, 440ms) ease-out infinite;
    }
    .ad-container[data-handoff="pulse"].is-handoff .ad-handoff-band {
      animation-delay: calc(var(--i, 0) * 50ms);
    }
    .ad-container[data-handoff="pulse"].is-handoff-hold:not(.is-handoff-done) .ad-handoff-band {
      animation: none;
      opacity: 1;
    }
    .ad-container[data-handoff="pulse"].is-handoff-done .ad-handoff-band {
      animation: handoff-veil 0.52s ease forwards;
    }
    @keyframes handoff-pulse-hit {
      0% { opacity: 0.06; }
      14% { opacity: 1; }
      42% { opacity: 0.42; }
      100% { opacity: 0.1; }
    }
    .ad-container[data-handoff="iris"].is-handoff .ad-handoff,
    .ad-container[data-handoff="mist"].is-handoff .ad-handoff,
    .ad-container[data-handoff="doors"].is-handoff .ad-handoff {
      display: block;
    }
    .ad-container[data-handoff="iris"] .ad-handoff-band:nth-child(n+2),
    .ad-container[data-handoff="mist"] .ad-handoff-band:nth-child(n+2),
    .ad-container[data-handoff="doors"] .ad-handoff-band:nth-child(n+3) {
      display: none;
    }
    .ad-container[data-handoff="iris"].is-handoff .ad-handoff {
      background: transparent;
      animation: handoff-iris-plate var(--handoff-ms, 2.25s) cubic-bezier(0.2, 0.72, 0.18, 1) both;
    }
    .ad-container[data-handoff="iris"].is-handoff .ad-handoff::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 50%;
      width: 220%;
      aspect-ratio: 1;
      border-radius: 50%;
      border: 3px solid color-mix(in srgb, var(--ph-paper, #efe0c4) 72%, var(--ph-accent, #8b5a2b));
      box-shadow:
        0 0 0 2px color-mix(in srgb, var(--ph-ink, #3d2a18) 55%, transparent),
        0 0 0 140vmax var(--ph-ink, #3d2a18);
      transform: translate(-50%, -50%) scale(1.08);
      animation: handoff-iris-shutter var(--handoff-ms, 2.25s) cubic-bezier(0.18, 0.82, 0.16, 1) both;
    }
    .ad-container[data-handoff="iris"] .ad-handoff-band:first-child {
      position: absolute;
      inset: 0;
      z-index: 2;
      background: transparent;
      animation: handoff-iris-hold var(--handoff-ms, 2.25s) ease both;
    }
    .ad-container[data-handoff="iris"] .ad-handoff-band:first-child .ad-handoff-claim {
      display: grid;
      animation: handoff-iris-claim var(--handoff-ms, 2.25s) ease both;
    }
    @keyframes handoff-iris-shutter {
      0% { transform: translate(-50%, -50%) scale(1.12); }
      26% { transform: translate(-50%, -50%) scale(0.03); }
      58% { transform: translate(-50%, -50%) scale(0.03); }
      100% { transform: translate(-50%, -50%) scale(1.18); }
    }
    @keyframes handoff-iris-plate {
      0%, 20% { background: transparent; }
      28%, 56% { background: var(--ph-ink, #3d2a18); }
      70%, 100% { background: transparent; }
    }
    @keyframes handoff-iris-hold {
      0%, 22% { opacity: 0; }
      30%, 56% { opacity: 1; }
      68%, 100% { opacity: 0; }
    }
    @keyframes handoff-iris-claim {
      0%, 24% { opacity: 0; letter-spacing: 0.2em; filter: blur(6px); }
      34%, 54% { opacity: 1; letter-spacing: 0.07em; filter: none; }
      68%, 100% { opacity: 0; letter-spacing: 0.16em; filter: blur(4px); }
    }
    .ad-container[data-handoff="mist"].is-handoff .ad-handoff {
      background: color-mix(in srgb, var(--ph-paper, #efe0c4) 22%, transparent);
      animation: handoff-mist-air var(--handoff-ms, 2.25s) ease both;
    }
    .ad-container[data-handoff="mist"].is-handoff .ad-handoff::before,
    .ad-container[data-handoff="mist"].is-handoff .ad-handoff::after,
    .ad-container[data-handoff="mist"] .ad-handoff-band:first-child {
      position: absolute;
      inset: -38%;
      background: transparent;
    }
    .ad-container[data-handoff="mist"].is-handoff .ad-handoff::before {
      content: "";
      background:
        radial-gradient(ellipse 72% 54% at 18% 38%, color-mix(in srgb, var(--ph-paper, #efe0c4) 92%, white) 0%, transparent 62%),
        radial-gradient(ellipse 58% 48% at 62% 22%, color-mix(in srgb, var(--ph-paper, #efe0c4) 78%, var(--ph-accent, #8b5a2b)) 0%, transparent 60%);
      animation: handoff-mist-a var(--handoff-ms, 2.25s) cubic-bezier(0.22, 0.6, 0.2, 1) both;
    }
    .ad-container[data-handoff="mist"].is-handoff .ad-handoff::after {
      content: "";
      background:
        radial-gradient(ellipse 80% 60% at 82% 58%, color-mix(in srgb, var(--ph-paper, #efe0c4) 88%, var(--ph-ink, #3d2a18)) 0%, transparent 64%),
        radial-gradient(ellipse 50% 42% at 40% 78%, color-mix(in srgb, var(--ph-paper, #efe0c4) 70%, white) 0%, transparent 58%);
      animation: handoff-mist-b var(--handoff-ms, 2.25s) cubic-bezier(0.22, 0.6, 0.2, 1) both;
    }
    .ad-container[data-handoff="mist"] .ad-handoff-band:first-child {
      background:
        radial-gradient(ellipse 90% 70% at 50% 48%, color-mix(in srgb, var(--ph-paper, #efe0c4) 62%, transparent) 0%, transparent 70%);
      animation: handoff-mist-c var(--handoff-ms, 2.25s) ease both;
    }
    @keyframes handoff-mist-air {
      0% { opacity: 0; backdrop-filter: blur(0); }
      20% { opacity: 1; backdrop-filter: blur(12px); }
      52% { opacity: 1; backdrop-filter: blur(16px); }
      100% { opacity: 0; backdrop-filter: blur(2px); }
    }
    @keyframes handoff-mist-a {
      0% { opacity: 0; transform: translate(-10%, 8%) scale(1.18); }
      24% { opacity: 1; transform: translate(-2%, 1%) scale(1.04); }
      54% { opacity: 1; transform: translate(2%, -2%) scale(1.08); }
      100% { opacity: 0; transform: translate(12%, -10%) scale(1.28); }
    }
    @keyframes handoff-mist-b {
      0% { opacity: 0; transform: translate(12%, 6%) scale(1.2); }
      26% { opacity: 0.95; transform: translate(3%, 0) scale(1.06); }
      56% { opacity: 0.9; transform: translate(-4%, -3%) scale(1.1); }
      100% { opacity: 0; transform: translate(-14%, -8%) scale(1.3); }
    }
    @keyframes handoff-mist-c {
      0% { opacity: 0; transform: scale(1.08); }
      28% { opacity: 0.85; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.04); }
      100% { opacity: 0; transform: translateY(-8%) scale(1.22); }
    }
    .ad-container[data-handoff="doors"] .ad-handoff-band:nth-child(1),
    .ad-container[data-handoff="doors"] .ad-handoff-band:nth-child(2) {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 52%;
      overflow: hidden;
    }
    .ad-container[data-handoff="doors"] .ad-handoff-band:nth-child(1) {
      left: 0;
      animation:
        handoff-door-l var(--handoff-ms, 2.25s) cubic-bezier(0.16, 0.84, 0.22, 1) both,
        handoff-wipe-rise var(--handoff-rise, 0.42s) ease-out both;
    }
    .ad-container[data-handoff="doors"] .ad-handoff-band:nth-child(2) {
      right: 0;
      animation:
        handoff-door-r var(--handoff-ms, 2.25s) cubic-bezier(0.16, 0.84, 0.22, 1) both,
        handoff-wipe-rise var(--handoff-rise, 0.42s) ease-out both;
    }
    .ad-container[data-handoff="doors"] .ad-handoff-band:nth-child(1) .ad-handoff-claim {
      display: grid;
    }
    @keyframes handoff-door-l {
      0% { transform: translateX(-102%); }
      32% { transform: translateX(0); }
      60% { transform: translateX(0); }
      100% { transform: translateX(-102%); }
    }
    @keyframes handoff-door-r {
      0% { transform: translateX(102%); }
      32% { transform: translateX(0); }
      60% { transform: translateX(0); }
      100% { transform: translateX(102%); }
    }
    .ad-container.is-handoff-done:not([data-handoff="pulse"]) .ad-handoff {
      display: none;
    }
.ad-2d { position: absolute; inset: 0; z-index: 1; width: 100%; height: 100%; pointer-events: none; }
body.player-embed { margin: 0; height: 100%; overflow: hidden; background: #05080f; }
body.player-embed .ad-label,
body.player-embed .ad-hint { display: none; }
body.player-embed .ad-slot { width: 100%; max-width: 100%; margin: 0; }
body.player-embed .ad-frame { box-shadow: none; }
body.player-embed .ad-clock,
body.player-embed .ad-clock-layer { display: none; }
.ad-container .ad-stage,
.ad-container model-viewer,
.ad-container gwd-3d-model-viewer,
.ad-container gwd-3d-model-viewer > model-viewer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  max-width: none;
  max-height: none;
  display: block;
  z-index: 0;
  transform: none;
  transform-style: flat;
}
.ad-container gwd-3d-model-viewer {
  transition: opacity 0.45s ease, transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), filter 0.45s ease;
}
.ad-container.is-idle gwd-3d-model-viewer { visibility: hidden; }
.ad-container.is-climax gwd-3d-model-viewer { opacity: 0.42; }
.ad-container[data-play="prop"].is-climax gwd-3d-model-viewer { opacity: 0.72; }
.ad-container.is-handoff.is-climax:not([data-handoff="none"]):not(.is-handoff-done) gwd-3d-model-viewer,
.ad-container.is-handoff.is-climax:not([data-handoff="none"]):not(.is-handoff-done) gwd-3d-model-viewer > model-viewer {
  opacity: 1;
  transform: none;
  filter: none;
}
html.gwd-unit,
body.gwd-unit,
body.player-embed.gwd-unit {
  width: 100%;
  height: 100%;
  transform: none !important;
  -webkit-transform: none !important;
  perspective: none !important;
  -webkit-perspective: none !important;
  transform-style: flat !important;
}
body.gwd-unit gwd-google-ad,
body.gwd-unit gwd-pagedeck,
body.gwd-unit gwd-page,
body.gwd-unit .gwd-page-content,
body.gwd-unit .ad-container,
body.gwd-unit .ad-container *,
gwd-page .ad-container,
gwd-page .ad-container * {
  transform-style: flat !important;
}
body.gwd-unit .ad-handoff,
gwd-page .ad-handoff {
  z-index: 50;
  isolation: isolate;
  transform: translateZ(0);
}
body.gwd-unit .ad-slot,
body.gwd-unit .ad-frame,
gwd-page .ad-slot,
gwd-page .ad-frame {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  max-width: none;
  aspect-ratio: auto;
}
body.gwd-unit .ad-creative,
body.gwd-unit .ad-ph,
body.gwd-unit .ad-ph-art,
gwd-page .ad-creative,
gwd-page .ad-ph,
gwd-page .ad-ph-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  place-items: stretch;
}
body.gwd-unit .ad-creative,
gwd-page .ad-creative {
  z-index: 4;
  isolation: isolate;
  display: grid;
  padding: 0;
}
body.gwd-unit .ad-container.is-handoff-done .ad-creative,
gwd-page .ad-container.is-handoff-done .ad-creative {
  z-index: 40;
}
body.gwd-unit .ad-ph-shot,
gwd-page .ad-ph-shot,
body.gwd-visor .stage-slot .ad-ph-shot,
body.gwd-unit .ad-ph img,
gwd-page .ad-ph img,
body.gwd-visor .stage-slot .ad-ph img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--ph-fit-x, 50%) var(--ph-fit-y, 50%);
  transform: scale(var(--ph-fit-z, 1));
  transform-origin: var(--ph-fit-x, 50%) var(--ph-fit-y, 50%);
}
body.gwd-unit .ad-ph[data-fit="contain"] .ad-ph-shot,
body.gwd-unit .ad-ph[data-fit="contain"] img,
gwd-page .ad-ph[data-fit="contain"] .ad-ph-shot,
gwd-page .ad-ph[data-fit="contain"] img,
body.gwd-visor .stage-slot .ad-ph[data-fit="contain"] .ad-ph-shot,
body.gwd-visor .stage-slot .ad-ph[data-fit="contain"] img {
  object-fit: contain;
}
body.gwd-unit .ad-ph[data-fit="fill"] .ad-ph-shot,
body.gwd-unit .ad-ph[data-fit="fill"] img,
gwd-page .ad-ph[data-fit="fill"] .ad-ph-shot,
gwd-page .ad-ph[data-fit="fill"] img,
body.gwd-visor .stage-slot .ad-ph[data-fit="fill"] .ad-ph-shot,
body.gwd-visor .stage-slot .ad-ph[data-fit="fill"] img {
  object-fit: fill;
}
body.gwd-unit .ad-ph[data-fit="cover"] .ad-ph-shot,
body.gwd-unit .ad-ph[data-fit="cover"] img,
gwd-page .ad-ph[data-fit="cover"] .ad-ph-shot,
gwd-page .ad-ph[data-fit="cover"] img,
body.gwd-visor .stage-slot .ad-ph[data-fit="cover"] .ad-ph-shot,
body.gwd-visor .stage-slot .ad-ph[data-fit="cover"] img {
  object-fit: cover;
}
body.gwd-unit .ad-container.is-handoff-done .ad-stage,
body.gwd-unit .ad-container.is-handoff-done .ad-gwd-scene,
body.gwd-unit .ad-container.is-handoff-done .ad-gwd-canvas,
body.gwd-unit .ad-container.is-handoff-done gwd-3d-model-viewer,
gwd-page .ad-container.is-handoff-done .ad-stage,
gwd-page .ad-container.is-handoff-done .ad-gwd-scene,
gwd-page .ad-container.is-handoff-done .ad-gwd-canvas,
gwd-page .ad-container.is-handoff-done gwd-3d-model-viewer {
  z-index: 0;
  visibility: hidden;
}
body.gwd-unit .ad-stage,
body.gwd-unit .ad-gwd-scene,
body.gwd-unit .ad-gwd-canvas,
body.gwd-unit gwd-3d-model-viewer,
body.gwd-unit gwd-3d-model-viewer > model-viewer,
body.gwd-unit .ad-container model-viewer,
gwd-page .ad-stage,
gwd-page .ad-gwd-scene,
gwd-page .ad-gwd-canvas,
gwd-page gwd-3d-model-viewer,
body.gwd-unit gwd-3d-model-viewer > model-viewer,
body.gwd-unit .ad-container model-viewer,
gwd-page .ad-stage,
gwd-page .ad-gwd-scene,
gwd-page .ad-gwd-canvas,
gwd-page gwd-3d-model-viewer,
gwd-page gwd-3d-model-viewer > model-viewer,
gwd-page .ad-container model-viewer {
  position: absolute !important;
  inset: 0 !important;
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  transform: none !important;
}
body.gwd-unit gwd-3d-model-viewer .gesture-cue-container,
gwd-page gwd-3d-model-viewer .gesture-cue-container {
  display: none !important;
}
body.gwd-visor .stage-slot {
  position: relative;
  width: var(--ad-w);
  height: var(--ad-h);
}
body.gwd-visor .stage-slot .ad-slot,
body.gwd-visor .stage-slot .ad-frame {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  max-width: none;
  aspect-ratio: auto;
}
body.gwd-visor .stage-slot .ad-creative,
body.gwd-visor .stage-slot .ad-ph,
body.gwd-visor .stage-slot .ad-ph-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  place-items: stretch;
}
.ad-container .ad-stage,
.ad-container model-viewer,
.ad-container gwd-3d-model-viewer {
  background: var(--gwd-stage, #f5f2ed);
}
.ad-container .ad-prop-floor,
.ad-container .ad-prop-world,
.ad-container .ad-prop-fill,
.ad-container .ad-prop-rim,
.ad-container .ad-prop-key,
.ad-container .ad-prop-aim,
.ad-container .ad-prop-extras,
.ad-container .ad-prop-pal {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}
.ad-container .ad-prop-floor {
  left: calc(var(--gwd-floor-x, 50%) - var(--gwd-floor-w, 80%) / 2);
  width: var(--gwd-floor-w, 80%);
  right: auto;
  bottom: var(--gwd-floor-y, 4%);
  height: 22%;
  border-radius: 50%;
  background: radial-gradient(ellipse at 50% 38%, color-mix(in srgb, var(--gwd-floor, #3a2a1c) 42%, transparent), transparent 72%);
  opacity: 0;
}
.ad-container[data-prop-floor="1"] .ad-prop-floor {
  opacity: 1;
}
.ad-container .ad-prop-world {
  inset: 0;
  background: color-mix(in srgb, var(--gwd-world, #ede8e0) calc(var(--gwd-world-i, 0.7) * 22%), transparent);
}
.ad-container .ad-prop-fill {
  inset: 0;
  background: radial-gradient(ellipse at 16% 44%, color-mix(in srgb, var(--gwd-fill, #ebf2ff) calc(var(--gwd-fill-i, 0) * 58%), transparent), transparent 64%);
}
.ad-container .ad-prop-rim {
  inset: 0;
  background: radial-gradient(ellipse at 90% 22%, color-mix(in srgb, var(--gwd-rim, #d9e6ff) calc(var(--gwd-rim-i, 0) * 50%), transparent), transparent 58%);
}
.ad-container .ad-prop-key {
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, var(--gwd-key, #fff7eb) calc(var(--gwd-key-i, 0) * 40%), transparent), transparent 56%);
}
.ad-container .ad-prop-aim[hidden],
.ad-container .ad-prop-aim[data-aim="none"],
.ad-container .ad-prop-extras[hidden] {
  display: none;
}
.ad-container .ad-prop-aim,
.ad-container .ad-prop-extras,
.ad-container .ad-prop-pal {
  inset: 0;
}
.ad-container .ad-prop-aim-beam {
  position: absolute;
  inset: 0;
  transform-origin: calc(var(--gwd-aim-x, 50%) + (var(--i, 0) - 1) * 16%) var(--gwd-aim-y, 22%);
  transform: scale(var(--gwd-aim-s, 1));
  background: radial-gradient(ellipse at calc(var(--gwd-aim-x, 50%) + (var(--i, 0) - 1) * 16%) var(--gwd-aim-y, 22%), color-mix(in srgb, var(--gwd-aim, #fff0d1) calc(var(--gwd-aim-i, 0) * 36%), transparent), transparent calc(48% + var(--gwd-aim-s, 1) * 14%));
}
.ad-container .ad-prop-extra {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at var(--gwd-x, 50%) var(--gwd-y, 0%), color-mix(in srgb, var(--gwd-x-col, #ffb347) calc(var(--gwd-x-i, 0) * 28%), transparent), transparent 62%);
}
.ad-container .ad-prop-pal-stand,
.ad-container .ad-prop-pal-object,
.ad-container .ad-prop-pal-ball,
.ad-container .ad-prop-pal-beam,
.ad-container .ad-prop-pal-star {
  position: absolute;
  pointer-events: none;
}
.ad-container .ad-prop-pal-stand {
  left: calc(var(--gwd-floor-x, 50%) - 14%);
  width: 28%;
  bottom: calc(var(--gwd-floor-y, 4%) + 10%);
  height: 8%;
  border-radius: 3px;
  background: color-mix(in srgb, var(--gwd-pal-stand, #3a3a3e) 62%, transparent);
  opacity: 0;
}
.ad-container[data-prop-floor="1"][data-prop-act="turn"] .ad-prop-pal-stand {
  opacity: 1;
}
.ad-container .ad-prop-pal-object {
  display: none;
  inset: 22% 18% 28%;
  border-radius: 46%;
  background: radial-gradient(ellipse at 50% 48%, color-mix(in srgb, var(--gwd-pal-object, #dbc7a8) 22%, transparent), transparent 68%);
}
.ad-container[data-pal-object="1"] .ad-prop-pal-object {
  display: block;
}
.ad-container .ad-prop-pal-ball {
  display: none;
  left: 32%;
  top: 28%;
  width: 36%;
  height: 36%;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--gwd-pal-ball, #d1472e) 38%, transparent), transparent 70%);
}
.ad-container[data-prop-act="ball"][data-pal-ball="1"] .ad-prop-pal-ball {
  display: block;
}
.ad-container .ad-prop-pal-beam {
  display: none;
  left: 38%;
  top: 8%;
  width: 24%;
  height: 70%;
  background: linear-gradient(180deg, color-mix(in srgb, var(--gwd-pal-beam, #ffe8b8) 48%, transparent), transparent 78%);
  clip-path: polygon(42% 0, 58% 0, 88% 100%, 12% 100%);
}
.ad-container[data-prop-act="torch"][data-pal-beam="1"] .ad-prop-pal-beam,
.ad-container[data-prop-act="torch-front"][data-pal-beam="1"] .ad-prop-pal-beam {
  display: block;
}
.ad-container .ad-prop-pal-star {
  display: none;
  left: 42%;
  top: 12%;
  width: 16%;
  height: 16%;
  background: radial-gradient(circle, color-mix(in srgb, var(--gwd-pal-star, #ffe566) 70%, transparent), transparent 72%);
}
.ad-container[data-prop-act="star"][data-pal-star="1"] .ad-prop-pal-star {
  display: block;
}
.ad-container:not([data-play="prop"]) .ad-prop-world,
.ad-container:not([data-play="prop"]) .ad-prop-floor,
.ad-container:not([data-play="prop"]) .ad-prop-key,
.ad-container:not([data-play="prop"]) .ad-prop-fill,
.ad-container:not([data-play="prop"]) .ad-prop-rim,
.ad-container:not([data-play="prop"]) .ad-prop-aim,
.ad-container:not([data-play="prop"]) .ad-prop-extras,
.ad-container:not([data-play="prop"]) .ad-prop-pal {
  display: none;
}
.ad-gwd-scene {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
  background: var(--gwd-stage, #0a1418);
}
.ad-gwd-scene i {
  display: none;
  position: absolute;
  pointer-events: none;
}
.ad-gwd-scene .ad-gwd-sky,
.ad-gwd-scene .ad-gwd-ground {
  display: block;
}
.ad-gwd-sky {
  inset: 0;
  background:
    linear-gradient(180deg,
      var(--gwd-sc-skyTop, var(--gwd-sc-sky, var(--gwd-sc-skyNight, #203052))) 0%,
      var(--gwd-sc-skyMid, var(--gwd-sc-skyDay, #c5d6c8)) 48%,
      var(--gwd-sc-skyHorizon, var(--gwd-sc-sky, #e8d5b5)) 100%);
}
.ad-gwd-ground {
  left: 0;
  right: 0;
  bottom: 0;
  height: 42%;
  background: linear-gradient(180deg, transparent, var(--gwd-sc-water, var(--gwd-sc-sea, var(--gwd-sc-seaNight, var(--gwd-sc-earth, var(--gwd-sc-ground, #0e1624))))) 28%);
}
.ad-container[data-play="climax"] .ad-gwd-drop,
.ad-container[data-play="pre-enter"] .ad-gwd-drop,
.ad-container[data-play="climax"] .ad-gwd-ripple,
.ad-container[data-play="pre-enter"] .ad-gwd-ripple {
  display: block;
}
.ad-gwd-drop {
  left: 50%;
  top: 8%;
  width: 4.6%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, var(--gwd-sc-sun, #7ec8e8) 42%, var(--gwd-sc-water, #081a1f));
  transform: translateX(-50%);
  animation: gwd-drop-fall var(--gwd-body-ms, 2.4s) cubic-bezier(0.55, 0.06, 0.9, 0.4) both;
}
.ad-gwd-ripple {
  left: 50%;
  top: 58%;
  width: 8%;
  height: 4%;
  border: 2px solid color-mix(in srgb, var(--gwd-sc-sun, #fff) 55%, transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: gwd-ripple var(--gwd-body-ms, 2.4s) ease-out both;
}
.ad-container[data-play="horizon"] .ad-gwd-sun,
.ad-container[data-play="sundown"] .ad-gwd-sun {
  display: block;
}
.ad-gwd-sun {
  left: 50%;
  width: 18%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle at 40% 35%, #fff, var(--gwd-sc-sun, #ffd682) 46%, transparent 72%);
  transform: translateX(-50%);
  filter: blur(0.4px);
  animation: gwd-sun-rise var(--gwd-body-ms, 4.7s) cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ad-container[data-play="sundown"] .ad-gwd-sun {
  animation-name: gwd-sun-set;
}
.ad-container[data-play="horizon"] .ad-gwd-sky,
.ad-container[data-play="sundown"] .ad-gwd-sky {
  animation: gwd-horizon-sky var(--gwd-body-ms, 4.7s) ease both;
}
.ad-container[data-play="sundown"] .ad-gwd-sky {
  animation-direction: reverse;
}
.ad-container[data-play="storm"] .ad-gwd-flash,
.ad-container[data-play="storm"] .ad-gwd-bolt {
  display: block;
}
.ad-gwd-flash {
  inset: 0;
  background: var(--gwd-sc-skyFlash, #d6e0f0);
  animation: gwd-storm-flash var(--gwd-body-ms, 2.15s) steps(2, end) both;
}
.ad-gwd-bolt {
  left: 46%;
  top: 0;
  width: 8%;
  height: 62%;
  clip-path: polygon(42% 0, 70% 0, 48% 42%, 78% 42%, 22% 100%, 38% 48%, 18% 48%);
  background: var(--gwd-sc-bolt, #fff);
  filter: drop-shadow(0 0 8px var(--gwd-sc-skyFlash, #d6e0f0));
  animation: gwd-bolt var(--gwd-body-ms, 2.15s) ease both;
}
.ad-container[data-play="aurora"] .ad-gwd-band { display: block; }
.ad-gwd-band {
  left: calc(8% + var(--i, 0) * 18%);
  top: 4%;
  width: 38%;
  height: 78%;
  background: linear-gradient(180deg, color-mix(in srgb, var(--gwd-sc-bandA, #30ec80) 70%, transparent), transparent 86%);
  filter: blur(10px);
  transform-origin: 50% 100%;
  animation: gwd-aurora var(--gwd-body-ms, 4.16s) ease-in-out both;
  animation-delay: calc(var(--i, 0) * 180ms);
}
.ad-gwd-band[style*="--i:1"] {
  background: linear-gradient(180deg, color-mix(in srgb, var(--gwd-sc-bandB, #46ffc4) 70%, transparent), transparent 86%);
}
.ad-gwd-band[style*="--i:2"] {
  background: linear-gradient(180deg, color-mix(in srgb, var(--gwd-sc-bandC, #d25cff) 62%, transparent), transparent 86%);
}
.ad-container[data-play="erupt"] .ad-gwd-cone,
.ad-container[data-play="erupt"] .ad-gwd-lava { display: block; }
.ad-gwd-cone {
  left: 50%;
  bottom: 8%;
  width: 46%;
  height: 38%;
  transform: translateX(-50%);
  clip-path: polygon(50% 0, 100% 100%, 0 100%);
  background: var(--gwd-sc-cone, #181416);
}
.ad-gwd-lava {
  left: 50%;
  bottom: 36%;
  width: 10%;
  height: 0;
  transform: translateX(-50%);
  background: radial-gradient(circle, var(--gwd-sc-lava, #ff5a20), transparent 70%);
  animation: gwd-lava var(--gwd-body-ms, 4.4s) cubic-bezier(0.2, 0.8, 0.2, 1) both;
}
.ad-container[data-play="migrate"] .ad-gwd-bird { display: block; }
.ad-gwd-bird {
  top: calc(22% + var(--i, 0) * 6%);
  left: -8%;
  width: 7%;
  height: 2%;
  background: var(--gwd-sc-birds, #0c0d10);
  clip-path: polygon(0 50%, 48% 0, 50% 40%, 100% 50%, 50% 60%, 48% 100%);
  animation: gwd-birds var(--gwd-body-ms, 6.32s) linear both;
  animation-delay: calc(var(--i, 0) * 90ms);
}
.ad-container[data-play="breaker"] .ad-gwd-wave,
.ad-container[data-play="breaker"] .ad-gwd-foam { display: block; }
.ad-gwd-wave {
  left: -10%;
  bottom: 18%;
  width: 70%;
  height: 42%;
  border-radius: 50% 50% 40% 60%;
  background: var(--gwd-sc-wave, #1a6a7c);
  animation: gwd-wave var(--gwd-body-ms, 4.85s) cubic-bezier(0.22, 1, 0.36, 1) both;
}
.ad-gwd-foam {
  left: 18%;
  bottom: 22%;
  width: 40%;
  height: 10%;
  border-radius: 50%;
  background: var(--gwd-sc-foam, #f8fcff);
  opacity: 0;
  animation: gwd-foam var(--gwd-body-ms, 4.85s) ease both;
}
.ad-container[data-play="calve"] .ad-gwd-ice { display: block; }
.ad-gwd-ice {
  left: 58%;
  top: 12%;
  width: 22%;
  height: 38%;
  background: linear-gradient(160deg, var(--gwd-sc-ice, #dce8f0), var(--gwd-sc-iceShade, #b3c4d0));
  clip-path: polygon(12% 0, 100% 8%, 86% 100%, 0 88%);
  animation: gwd-ice var(--gwd-body-ms, 4.84s) cubic-bezier(0.55, 0.06, 0.9, 0.3) both;
}
.ad-container.is-handoff-done .ad-gwd-scene {
  visibility: hidden;
}
@keyframes gwd-drop-fall {
  0% { top: 6%; opacity: 1; }
  52% { top: 56%; opacity: 1; }
  58% { top: 58%; opacity: 0; transform: translateX(-50%) scale(1.6, 0.35); }
  100% { top: 58%; opacity: 0; }
}
@keyframes gwd-ripple {
  0%, 50% { opacity: 0; width: 6%; }
  58% { opacity: 0.8; width: 10%; }
  100% { opacity: 0; width: 70%; }
}
@keyframes gwd-sun-rise {
  0% { top: 62%; opacity: 0.35; }
  100% { top: 18%; opacity: 1; }
}
@keyframes gwd-sun-set {
  0% { top: 18%; opacity: 1; }
  100% { top: 64%; opacity: 0.4; }
}
@keyframes gwd-horizon-sky {
  0% { filter: brightness(0.45) saturate(0.8); }
  100% { filter: brightness(1.08) saturate(1.1); }
}
@keyframes gwd-storm-flash {
  0%, 38%, 48%, 100% { opacity: 0; }
  42%, 44% { opacity: 0.82; }
}
@keyframes gwd-bolt {
  0%, 38%, 48%, 100% { opacity: 0; }
  42%, 44% { opacity: 1; }
}
@keyframes gwd-aurora {
  0% { opacity: 0; transform: skewX(-8deg) scaleY(0.4); }
  35% { opacity: 0.9; transform: skewX(6deg) scaleY(1); }
  100% { opacity: 0.7; transform: skewX(-4deg) scaleY(0.92); }
}
@keyframes gwd-lava {
  0%, 28% { height: 0; opacity: 0; }
  42% { height: 48%; opacity: 1; }
  100% { height: 12%; opacity: 0.55; }
}
@keyframes gwd-birds {
  0% { left: -10%; }
  80% { left: 110%; }
  100% { left: 118%; }
}
@keyframes gwd-wave {
  0% { transform: translateX(-20%) scale(0.7); }
  48% { transform: translateX(18%) scale(1.15); }
  100% { transform: translateX(40%) scale(0.9); }
}
@keyframes gwd-foam {
  0%, 46% { opacity: 0; transform: scale(0.4); }
  58% { opacity: 0.9; transform: scale(1.2); }
  100% { opacity: 0; }
}
@keyframes gwd-ice {
  0%, 28% { top: 12%; transform: rotate(0deg); }
  42% { top: 18%; transform: rotate(8deg); }
  58% { top: 52%; transform: rotate(18deg); }
  100% { top: 62%; opacity: 0.35; }
}
.ad-container.is-handoff-done .ad-prop-floor,
.ad-container.is-handoff-done .ad-prop-world,
.ad-container.is-handoff-done .ad-prop-fill,
.ad-container.is-handoff-done .ad-prop-rim,
.ad-container.is-handoff-done .ad-prop-key,
.ad-container.is-handoff-done .ad-prop-aim,
.ad-container.is-handoff-done .ad-prop-extras,
.ad-container.is-handoff-done .ad-prop-pal {
  visibility: hidden;
}
.ad-slot[data-in]:not([data-in="none"]) .ad-frame { will-change: transform, opacity, filter; }
.ad-slot.is-in[data-in="fade"] .ad-frame { animation: ad-in-fade 0.45s ease both; }
.ad-slot.is-in[data-in="fade-up"] .ad-frame { animation: ad-in-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
.ad-slot.is-in[data-in="fade-down"] .ad-frame { animation: ad-in-fade-down 0.55s cubic-bezier(0.22, 1, 0.36, 1) both; }
.ad-slot.is-in[data-in="scale"] .ad-frame { animation: ad-in-scale 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.ad-slot.is-in[data-in="pop"] .ad-frame { animation: ad-in-pop 0.7s ease both; }
.ad-slot.is-in[data-in="slide-left"] .ad-frame { animation: ad-in-slide-left 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.ad-slot.is-in[data-in="slide-right"] .ad-frame { animation: ad-in-slide-right 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.ad-slot.is-in[data-in="blur"] .ad-frame { animation: ad-in-blur 0.55s ease both; }
@keyframes ad-in-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes ad-in-fade-up { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: none; } }
@keyframes ad-in-fade-down { from { opacity: 0; transform: translateY(-28px); } to { opacity: 1; transform: none; } }
@keyframes ad-in-scale { from { opacity: 0; transform: scale(0.84); } to { opacity: 1; transform: none; } }
@keyframes ad-in-pop {
  0% { opacity: 0; transform: scale(0.72); }
  62% { opacity: 1; transform: scale(1.06); }
  100% { opacity: 1; transform: none; }
}
@keyframes ad-in-slide-left { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: none; } }
@keyframes ad-in-slide-right { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
@keyframes ad-in-blur { from { opacity: 0; filter: blur(14px); } to { opacity: 1; filter: none; } }
`;var We="",It=[];function it(e){let t=String(e||"").trim().replace(/\/+$/,"");if(t!==We){We=t;for(let a of It)a(We)}}function Rt(){return We}function uo(e){return It.push(e),()=>{let t=It.indexOf(e);t>=0&&It.splice(t,1)}}function He(e,t){let a=String(e||"");return We?`${We}/${a.replace(/^\/+/,"")}`:t!=null&&t!==""?t:a.startsWith("/")?a:`/${a}`}var ho=[{id:"billboard",label:"970\xD7250 \xB7 Billboard",w:970,h:250,scene:"journey",brand:"Aurora",kicker:"Caf\xE9 de especialidad",offer:"94 \xB0C. Sin prisa.",cta:"Pedir ahora",accent:"#e8a25a",hint:"La gota cae. El anuncio es el ripple."},{id:"leader",label:"728\xD790 \xB7 Leaderboard",w:728,h:90,scene:"journey",brand:"Norte",kicker:"Banca",offer:"Tu n\xF3mina, el mismo d\xEDa.",cta:"Abrir cuenta",accent:"#7eb6e8",hint:"La gota cae. El anuncio es el ripple."},{id:"medium",label:"300\xD7250 \xB7 Medium rectangle",w:300,h:250,scene:"journey",brand:"Lumen",kicker:"Audio",offer:"Silencio que viaja contigo.",cta:"Escuchar",accent:"#6d7cff",hint:"La gota cae. El anuncio es el ripple."},{id:"large",label:"336\xD7280 \xB7 Large rectangle",w:336,h:280,scene:"journey",brand:"Sola",kicker:"Cuidado solar",offer:"SPF 50. Doce horas.",cta:"Comprar",accent:"#ffd166",hint:"La gota cae. El anuncio es el ripple."},{id:"mobile",label:"320\xD750 \xB7 Mobile banner",w:320,h:50,scene:"journey",brand:"Via",kicker:"Movilidad",offer:"Un auto en 4 min.",cta:"Pedir viaje",accent:"#7af7c5",hint:"La gota cae. El anuncio es el ripple."},{id:"sky",label:"160\xD7600 \xB7 Wide skyscraper",w:160,h:600,scene:"journey",brand:"Atlas",kicker:"Outdoor",offer:"La ruta empieza aqu\xED.",cta:"Ver botas",accent:"#8fd18a",hint:"La gota cae. El anuncio es el ripple."},{id:"half",label:"300\xD7600 \xB7 Half-page",w:300,h:600,scene:"journey",brand:"Mara",kicker:"Agua de monta\xF1a",offer:"De la cumbre a tu mesa.",cta:"Suscribirse",accent:"#4cc9f0",hint:"La gota cae. El anuncio es el ripple."},{id:"nexus",label:"300\xD7250 \xB7 Nexus+",w:300,h:250,scene:"journey",brand:"Nexus+",kicker:"Lectura",offer:"Historias, sin ruido.",cta:"Probar 7 d\xEDas",accent:"#00f0c8",hint:"La gota cae. El anuncio es el ripple."}];function jt(e){return ho.find(t=>t.id===e)||ho[2]}var mo=[{id:"none",label:"Ninguna",blurb:"El remate actual: el anuncio llega cuando el gesto ya termin\xF3."},{id:"wipe",label:"Cortinilla",blurb:"Franjas de marca barren el visual y dejan el anuncio.",claim:!0},{id:"veil",label:"Velo",blurb:"Franjas se desvanecen en capas y revelan el anuncio.",claim:!0},{id:"pulse",label:"Pulso",blurb:"Franjas laten con el fen\xF3meno y se disuelven en el anuncio."},{id:"iris",label:"Iris",blurb:"El obturador cierra el visual, marca el corte y se abre al anuncio.",claim:!0},{id:"doors",label:"Puertas",blurb:"Dos hojas se juntan y se abren al anuncio.",claim:!0},{id:"mist",label:"Niebla",blurb:"La bruma entra, tapa el visual y se levanta sobre el anuncio."}];function Ce(e){return mo.find(t=>t.id===e)||mo[0]}function ga(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(4800,Math.max(800,t)))):"2400"}function Ht(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(8,Math.max(2,t)))):"3"}function ya(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(280,Math.max(0,t)))):"120"}function wa(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(1800,Math.max(200,t)))):"700"}function va(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(900,Math.max(80,t))/10)*10):"420"}function xa(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(8,Math.max(2,t)))):"4"}function Ot(e){if(e===""||e==null)return"0";let t=Number(e);return!Number.isFinite(t)||t<=0?"0":String(Math.round(Math.min(800,Math.max(200,t))))}function Ma(e){return String(e??"").replace(/\s+/g," ").trim().slice(0,80)}function ka(e){return e===!0||e===1||e==="1"||e==="on"?"1":"0"}function xo(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;")}function Mo(e={},t){if(ka(e.hempty??e.handEmpty)==="1")return"";let a=Ma(e.htxt??e.handClaim??e.handoffClaim);return a||String(t?.offer||t?.kicker||t?.brand||"")}function Ca(e,t){let a=Number(Ot(t));return a>0?a:e==="storm"?320:e==="breaker"?620:e==="erupt"?400:e==="calve"?480:440}function Vt(e={}){return{hms:ga(e.hms??e.handMs??e.handoffMs),hnb:Ht(e.hnb??e.handBands??e.handoffBands),hst:ya(e.hst??e.handStagger??e.handoffStagger),hhd:wa(e.hhd??e.handHold??e.handoffHold),hin:va(e.hin??e.handIn??e.handoffIn),hbt:xa(e.hbt??e.handBeats??e.handoffBeats),htm:Ot(e.htm??e.handTempo??e.handoffTempo)}}var wn=640;function _t(e={}){let t=Vt(e),a=Number(t.hnb),o=Number(t.hhd),r=Number(t.hst),i=wn,n=Math.max(320,(Number(t.hms)-o-i)/a);return{enter:i,fade:Math.round(n),hold:o,stagger:r,bands:a,inMs:i,outMs:Math.round(a*n),total:Math.round(i+o+a*n)}}function Sa(e,t={}){let a=Ce(e).id;if(a==="none")return 0;let o=Vt(t);if(a==="pulse"){let r=Ca(t.play,o.htm);return Number(o.hbt)*r+720+520}return a==="wipe"?Number(o.hms)+(Number(o.hnb)-1)*Number(o.hst):a==="iris"||a==="doors"||a==="mist"?Number(o.hms):_t(o).total}function ko(e,t=""){let a=Number(Ht(e)),o=[];for(let r=0;r<a;r+=1)o.push(r===0?`<i class="ad-handoff-band" style="--i:${r}"><span class="ad-handoff-claim">${t}</span></i>`:`<i class="ad-handoff-band" style="--i:${r}"></i>`);return o.join("")}function Co(e,t={}){if(!e)return;let a=Vt({hms:t.hms??e.dataset.handoffMs,hnb:t.hnb??e.dataset.handoffBands,hst:t.hst??e.dataset.handoffStagger,hhd:t.hhd??e.dataset.handoffHold,hin:t.hin??e.dataset.handoffIn,hbt:t.hbt??e.dataset.handoffBeats,htm:t.htm??e.dataset.handoffTempo});e.dataset.handoffMs=a.hms,e.dataset.handoffBands=a.hnb,e.dataset.handoffStagger=a.hst,e.dataset.handoffHold=a.hhd,e.dataset.handoffIn=a.hin,e.dataset.handoffBeats=a.hbt,e.dataset.handoffTempo=a.htm;let o=Ce(t.hand??e.dataset.handoff).id,r=_t(a),i=o==="veil"?r.fade:Math.max(280,(Number(a.hms)-Number(a.hhd))/Number(a.hnb));e.style.setProperty("--handoff-ms",`${a.hms}ms`),e.style.setProperty("--handoff-bands",a.hnb),e.style.setProperty("--handoff-stagger",`${a.hst}ms`),e.style.setProperty("--handoff-hold",`${a.hhd}ms`),e.style.setProperty("--handoff-in",`${r.enter}ms`),e.style.setProperty("--handoff-rise",`${a.hin}ms`),e.style.setProperty("--handoff-fade",`${Math.round(i)}ms`);let n=e.querySelector(".ad-handoff");if(!n)return;let s=n.querySelectorAll(".ad-handoff-band").length,l=t.htxt!=null||t.claim!=null?xo(t.claim??Mo(t)):n.querySelector(".ad-handoff-claim")?.innerHTML??"";if(s!==Number(a.hnb)){n.innerHTML=ko(a.hnb,l);return}n.querySelectorAll(".ad-handoff-band").forEach((d,c)=>{d.style.setProperty("--i",String(c))}),(t.htxt!=null||t.claim!=null)&&n.querySelectorAll(".ad-handoff-claim").forEach(d=>{d.innerHTML=l})}var Ft=[{id:"climax",label:"Cl\xEDmax \xB7 Gota",blurb:"Una gota cae, el ripple se abre y el anuncio es el impacto."},{id:"pre-enter",label:"Antes de entrar",blurb:"La gota y el ripple abren el agua; luego entra el anuncio."},{id:"horizon",label:"Cl\xEDmax \xB7 Amanecer",blurb:"El sol sale. El anuncio llega cuando el d\xEDa ya est\xE1 en el cielo: el remate, no el corte."},{id:"sundown",label:"Cl\xEDmax \xB7 Atardecer",blurb:"El sol baja. El anuncio llega cuando toca el horizonte: el remate, no el corte."},{id:"storm",label:"Cl\xEDmax \xB7 Tormenta",blurb:"El rel\xE1mpago parte el cielo. El anuncio llega en el silencio que sigue: el remate, no el corte."},{id:"aurora",label:"Cl\xEDmax \xB7 Aurora",blurb:"Las luces suben. El anuncio llega cuando el cielo ya est\xE1 lleno: el remate, no el corte."},{id:"erupt",label:"Cl\xEDmax \xB7 Erupci\xF3n",blurb:"El volc\xE1n carga, estalla y se apaga. El anuncio llega cuando ya acab\xF3: el remate, no el corte."},{id:"migrate",label:"Cl\xEDmax \xB7 Migraci\xF3n",blurb:"La bandada cruza en V y se va. El anuncio llega cuando el cielo ya est\xE1 vac\xEDo: el remate, no el corte."},{id:"breaker",label:"Cl\xEDmax \xB7 Ola",blurb:"La ola se levanta, rompe y se calma. El anuncio llega en el silencio despu\xE9s del golpe: el remate, no el corte."},{id:"calve",label:"Cl\xEDmax \xB7 Glaciar",blurb:"El hielo se abre y cae. El anuncio llega cuando el fjordo ya call\xF3: el remate, no el corte."},{id:"prop",label:"Cl\xEDmax \xB7 Objeto",blurb:"Un objeto en el centro act\xFAa. El anuncio llega cuando el gesto ya termin\xF3. Despu\xE9s se cambia la caja por el 3D del producto."}];function st(e){return Ft.find(t=>t.id===e)||Ft[0]}var Dt=[{id:"drop",label:"Cae al suelo",blurb:"Cae, pega y se queda."},{id:"toy",label:"Juguete",blurb:"Da unos saltitos y se para."},{id:"torch",label:"Linterna",blurb:"El haz barre el suelo y se detiene."},{id:"torch-front",label:"Linterna frente",blurb:"El mismo barrido, pero el haz mira al espectador."},{id:"ball",label:"Pelota",blurb:"Rebota de verdad y se agota."},{id:"turn",label:"Escaparate",blurb:"Una vuelta lenta, como en un display."},{id:"star",label:"Estrella",blurb:"Salta, da vueltas r\xE1pidas en el aire y posa, como al tomar una estrella."},{id:"cheer",label:"Victoria",blurb:"El mismo salto y las mismas vueltas, sin la estrella."},{id:"space",label:"Espacio",blurb:"Salta y da vueltas, pero no cae: el giro se apaga como en ingravidez."}];function Pa(e){return Dt.find(t=>t.id===e)||Dt[0]}var bo=[{id:"none",label:"Ninguna",blurb:"Sin focos extra sobre el objeto."},{id:"spot",label:"Foco",blurb:"Un haz apunta al objeto."},{id:"multi",label:"Varias",blurb:"Tres haces enmarcan el objeto."}];function So(e){return bo.find(t=>t.id===e)||bo[0]}var go=[{id:"arriba",label:"Arriba",blurb:"El haz cae desde arriba del objeto."},{id:"frente",label:"Frente",blurb:"El haz viene de cara a la c\xE1mara."},{id:"detras",label:"Detr\xE1s",blurb:"El haz viene desde atr\xE1s del objeto."}];function Ut(e){return go.find(t=>t.id===e)||go[1]}function qt(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(8,Math.max(2.2,Math.round(t*10)/10))):"4.1"}function Gt(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(180,Math.max(-180,Math.round(t)))):"0"}function Xt(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(55,Math.max(-55,Math.round(t)))):"0"}function Wt(e){return e==="pan"?"pan":"orbit"}function Ke(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(2,Math.max(-2,Math.round(t*20)/20))):"0"}function Po(e){let t=Number(e);return t===30||t===60?t:0}function Ao(e){let t=Number(e);return Number.isFinite(t)?Math.round(Math.min(3,Math.max(1,t))*4)/4:1.5}function zo(e){return e==="belt"?"belt":"column"}function $o(e){return e===!0||e===1||e==="1"||e==="on"}function Lo(e){let t=Number(e);if(!Number.isFinite(t))return 1;let a=t>2.5?t/100:t;return Math.min(2,Math.max(.5,Math.round(a*20)/20))}function To(e){return!(e===!1||e===0||e==="0"||e==="off")}var yo=[{id:"sweep",label:"Barrido",blurb:"Manecilla y el blanco detr\xE1s."},{id:"disc",label:"Disco",blurb:"El c\xEDrculo se llena."},{id:"ring",label:"Aro",blurb:"Solo el borde avanza."},{id:"ray",label:"Rayo",blurb:"Solo la manecilla."},{id:"bead",label:"Gota",blurb:"Crece desde el centro."}],wo=[{id:"dark",label:"Oscuro"},{id:"light",label:"Claro"}];function vn(e){return yo.find(t=>t.id===e)||yo[0]}function xn(e){return wo.find(t=>t.id===e)||wo[0]}function Eo(e){return vn(e).id}function Io(e){return xn(e).id}function Ro(e){let t=Number(e);return Number.isFinite(t)?Math.round(Math.min(200,Math.max(50,t))/5)*5:100}function Mn(){return`<canvas class="ad-clock-layer" aria-hidden="true"></canvas>
          <button type="button" class="ad-clock" aria-label="Tiempo restante del anuncio" title="Ocultar reloj"></button>`}function Fo(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(1,Math.max(.05,Math.round(t*100)/100))):"0.35"}function Do(e){return e===!1||e===0||e==="0"||e==="off"||e==="hide"?"0":"1"}function Yt(e){return e===!1||e===0||e==="0"||e==="off"?"0":"1"}function No(e){return e===!0||e===1||e==="1"||e==="on"||e==="flat"?"1":"0"}var ha="#fff0d1";function Kt(e){return e==null||e===""?ha:Le(e,ha)}var Bo="3.3";function Zt(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(7,Math.max(1.2,Math.round(t*10)/10))):Bo}function Jt(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(180,Math.max(-180,Math.round(t)))):"0"}function Qt(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(70,Math.max(-70,Math.round(t)))):"0"}function Ze(e){let t=Number(e);return Number.isFinite(t)?String(Math.min(180,Math.max(-180,Math.round(t)))):"0"}var jo={water:[{id:"skyTop",label:"Cielo alto",def:"#8ec4d4"},{id:"skyMid",label:"Cielo medio",def:"#c5d6c8"},{id:"skyHorizon",label:"Horizonte",def:"#e8d5b5"},{id:"skyDeep",label:"Cielo profundo",def:"#0a1418"},{id:"sun",label:"Sol",def:"#fff4d6"},{id:"water",label:"Agua",def:"#081a1f"}],horizon:[{id:"skyNight",label:"Cielo noche",def:"#203052"},{id:"skyDay",label:"Cielo d\xEDa",def:"#ec844e"},{id:"seaNight",label:"Mar noche",def:"#0e1624"},{id:"seaDay",label:"Mar d\xEDa",def:"#2a181c"},{id:"sun",label:"Sol",def:"#ffd682"}],storm:[{id:"sky",label:"Cielo",def:"#141824"},{id:"skyFlash",label:"Destello",def:"#d6e0f0"},{id:"sea",label:"Mar",def:"#0a0c12"},{id:"bolt",label:"Rayo",def:"#ffffff"}],aurora:[{id:"sky",label:"Cielo",def:"#060812"},{id:"sea",label:"Tierra",def:"#05070c"},{id:"bandA",label:"Cortina 1",def:"#30ec80"},{id:"bandB",label:"Cortina 2",def:"#46ffc4"},{id:"bandC",label:"Cortina 3",def:"#d25cff"}],erupt:[{id:"sky",label:"Cielo",def:"#080a16"},{id:"fire",label:"Cielo en fuego",def:"#ff601c"},{id:"ground",label:"Tierra",def:"#0e0c10"},{id:"cone",label:"Volc\xE1n",def:"#181416"},{id:"lava",label:"Lava",def:"#ff5a20"}],migrate:[{id:"skyTop",label:"Cielo alto",def:"#6a8ab8"},{id:"skyMid",label:"Cielo medio",def:"#c4a078"},{id:"skyHorizon",label:"Horizonte",def:"#e8b86a"},{id:"earth",label:"Tierra",def:"#2a2c28"},{id:"birds",label:"Bandada",def:"#0c0d10"}],breaker:[{id:"sky",label:"Cielo",def:"#9eb6ce"},{id:"sea",label:"Mar",def:"#164048"},{id:"wave",label:"Ola",def:"#1a6a7c"},{id:"sand",label:"Arena",def:"#c4b089"},{id:"foam",label:"Espuma",def:"#f8fcff"}],calve:[{id:"sky",label:"Cielo",def:"#7d93a8"},{id:"water",label:"Agua",def:"#0c242c"},{id:"ice",label:"Hielo",def:"#dce8f0"},{id:"iceShade",label:"Hielo sombra",def:"#b3c4d0"},{id:"under",label:"Bajo el agua",def:"#2a7c8c"}],prop:[{id:"floor",label:"Suelo",def:"#29292b"},{id:"stand",label:"Escaparate",def:"#3a3a3e"},{id:"object",label:"Objeto",def:"#dbc7a8"},{id:"ball",label:"Pelota",def:"#d1472e"},{id:"beam",label:"Haz",def:"#ffe8b8"},{id:"star",label:"Estrella",def:"#ffe566"},{id:"fog",label:"Fondo",def:"#121315"}]};function Aa(e){return e==="pre-enter"||e==="climax"?"water":e==="sundown"?"horizon":jo[e]?e:"water"}function kn(e){return jo[Aa(e)]}function Le(e,t="#000000"){let a=String(e||"").trim(),o=a.startsWith("#")?a.slice(1):a;return/^[0-9a-fA-F]{6}$/.test(o)?`#${o.toLowerCase()}`:/^[0-9a-fA-F]{3}$/.test(o)?`#${o[0]}${o[0]}${o[1]}${o[1]}${o[2]}${o[2]}`.toLowerCase():t}function K(e,t){let a=kn(e),o={};if(typeof t=="string"&&t)try{o=JSON.parse(t.includes("%")?decodeURIComponent(t):t)}catch{o={}}else t&&typeof t=="object"&&(o=t);let r={};for(let i of a)r[i.id]=Le(o[i.id],i.def);return r}var Ye=[{id:"bg",label:"Fondo",def:"#b89a6e"},{id:"paper",label:"Papel",def:"#efe0c4"},{id:"ink",label:"Icono",def:"#3d2a18"},{id:"accent",label:"Acento",def:"#8b5a2b"}],ma=[{id:"photo",label:"Foto"},{id:"blank",label:"Liso"},{id:"frame",label:"Marco"},{id:"bars",label:"Bandas"},{id:"grid",label:"Trama"},{id:"mark",label:"Marca"},{id:"play",label:"Play"}],vo={water:{bg:"water",paper:"skyHorizon",ink:"skyDeep",accent:"sun"},horizon:{bg:"skyNight",paper:"skyDay",ink:"seaNight",accent:"sun"},storm:{bg:"sky",paper:"skyFlash",ink:"sea",accent:"bolt"},aurora:{bg:"sky",paper:"bandB",ink:"sea",accent:"bandA"},erupt:{bg:"ground",paper:"fire",ink:"sky",accent:"lava"},migrate:{bg:"earth",paper:"skyHorizon",ink:"birds",accent:"skyMid"},breaker:{bg:"sea",paper:"sand",ink:"wave",accent:"foam"},calve:{bg:"water",paper:"ice",ink:"sky",accent:"under"},prop:{bg:"fog",paper:"floor",ink:"object",accent:"star"}};function Ho(e,t){let a=K(e,t),o=vo[Aa(e)]||vo.water;return{style:"play",bg:a[o.bg]||Ye[0].def,paper:a[o.paper]||Ye[1].def,ink:a[o.ink]||Ye[2].def,accent:a[o.accent]||Ye[3].def}}var ba=[{id:"cream",label:"Crema",bg:"#b89a6e",paper:"#efe0c4",ink:"#3d2a18",accent:"#8b5a2b"},{id:"linen",label:"Lino",bg:"#d7c09a",paper:"#f7efe2",ink:"#3f2c16",accent:"#c4a06a"},{id:"sand",label:"Arena",bg:"#c4882e",paper:"#f3d9a0",ink:"#3a240c",accent:"#e8b84a"},{id:"clay",label:"Arcilla",bg:"#b85c38",paper:"#f0c4a8",ink:"#3a1c12",accent:"#e07a4a"},{id:"stone",label:"Piedra",bg:"#7a746c",paper:"#e8e4dc",ink:"#1c1916",accent:"#c4b8a4"},{id:"olive",label:"Oliva",bg:"#6e702c",paper:"#e4e0a8",ink:"#22240c",accent:"#c4c44a"},{id:"rose",label:"Rosa",bg:"#b45c64",paper:"#f4d8d4",ink:"#3a1418",accent:"#e87888"},{id:"mist",label:"Humo",bg:"#5c5854",paper:"#ddd8d0",ink:"#161412",accent:"#9a948c"},{id:"ink",label:"Tinta",bg:"#161210",paper:"#2a221c",ink:"#f2e6d4",accent:"#c4a06a"},{id:"night",label:"Noche",bg:"#10141c",paper:"#1c2434",ink:"#dce8f8",accent:"#5a82d4"},{id:"ember",label:"Brasa",bg:"#240c08",paper:"#4a180c",ink:"#ffe0b8",accent:"#ff6a28"},{id:"wine",label:"Vino",bg:"#2c0c14",paper:"#541824",ink:"#f8dce4",accent:"#e04a6a"},{id:"forest",label:"Bosque",bg:"#0c1c14",paper:"#163024",ink:"#d8f4dc",accent:"#2ec878"},{id:"cobalt",label:"Cobalto",bg:"#0c1424",paper:"#182848",ink:"#d8e8ff",accent:"#3a78ff"},{id:"gold",label:"Oro",bg:"#181208",paper:"#2a1e0c",ink:"#ffe7a0",accent:"#e8b020"},{id:"bone",label:"Hueso",bg:"#e8dcc8",paper:"#faf4ea",ink:"#14100c",accent:"#9a1c28"}];function Oo(e){return ma.find(t=>t.id===e)||ma[0]}var Cn=/\.(jpe?g|png|webp|gif|avif)$/i;function Vo(e){let t=decodeURIComponent(String(e||"")).split(/[/\\]/).pop().trim();return!t||t.includes("..")||!Cn.test(t)?"":t}function Nt(e){let t=String(e||"").trim();if(/^https?:\/\//i.test(t))try{let a=new URL(t);return a.protocol!=="http:"&&a.protocol!=="https:"?"":a.href}catch{return""}return Vo(t)}var Sn=[{id:"cover",label:"Cubrir"},{id:"contain",label:"Caber"},{id:"fill",label:"Estirar"}];function _o(e){return Sn.some(t=>t.id===e)?e:"cover"}function Bt(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(100,Math.max(0,t)))):"50"}function Uo(e){let t=Number(e);return Number.isFinite(t)?String(Math.round(Math.min(220,Math.max(80,t))/5)*5):"100"}var Pn="#111111";function An(e){return Le(e,Pn)}function zn(e){let t=Nt(e);return/^https?:\/\//i.test(t)?t:t?He(`assets/ads/${encodeURIComponent(t)}`,`assets/ads/${encodeURIComponent(t)}`):""}function $n(e){let t={img:"",fit:"",fx:"",fy:"",fz:"",fm:""};if(e&&typeof e=="object")return t.img=Nt(e.img),t.fit=e.fit,t.fx=e.fx,t.fy=e.fy,t.fz=e.fz,t.fm=e.fm,{body:e,extras:t};if(typeof e!="string"||!e)return{body:e,extras:t};let a=e.split(","),o=[];for(let r of a)r.startsWith("img:")?t.img=Nt(decodeURIComponent(r.slice(4))):r.startsWith("fit:")?t.fit=r.slice(4):r.startsWith("fx:")?t.fx=r.slice(3):r.startsWith("fy:")?t.fy=r.slice(3):r.startsWith("fz:")?t.fz=r.slice(3):r.startsWith("fm:")?t.fm=r.slice(3):o.push(r);return{body:o.join(","),extras:t}}function Se(e){let t=Object.fromEntries(Ye.map(s=>[s.id,s.def])),a=$n(e),o={},r=a.body;if(typeof r=="string"&&r){r==="play"&&(o={style:"play"});let s=r.split(".");if(s.length===2&&ma.some(l=>l.id===s[0])){o.style=s[0];let l=ba.find(d=>d.id===s[1]);l&&(o={...l,style:s[0]})}else{let l=ba.find(d=>d.id===r);if(l)o=l;else for(let d of r.split(",")){let c=d.indexOf(":");c<1||(o[d.slice(0,c)]=d.slice(c+1))}}}else r&&typeof r=="object"&&(o=r);let i=a.extras||{},n={style:Oo(o.style).id,img:i.img||Nt(o.img),fit:_o(i.fit??o.fit),fx:Bt(i.fx??o.fx),fy:Bt(i.fy??o.fy),fz:Uo(i.fz??o.fz),fm:An(i.fm??o.fm)};for(let s of Ye)n[s.id]=Le(o[s.id],t[s.id]);return n}function Ln(e){let t=Se(e),a=ba.find(o=>Le(o.bg)===t.bg&&Le(o.paper)===t.paper&&Le(o.ink)===t.ink&&Le(o.accent)===t.accent);return a?a.id:""}function Tn(){return`<svg class="ad-ph-icon" viewBox="0 0 72 56" aria-hidden="true">
    <rect x="3.5" y="3.5" width="65" height="49" rx="4" fill="var(--ph-paper)" stroke="currentColor" stroke-width="2"/>
    <circle cx="24" cy="20" r="6" fill="currentColor"/>
    <path d="M8 46 L26 26 L38 36 L48 28 L64 46 Z" fill="currentColor"/>
  </svg>`}function En(e){let t=Math.round(Number(e?.w)||300),a=Math.round(Number(e?.h)||250);return`${t} \xD7 ${a}`}function In(e={}){let t=_o(e.fit),a=Bt(e.fx),o=Bt(e.fy),r=Number(Uo(e.fz))/100;return`object-fit:${t};object-position:${a}% ${o}%;transform:scale(${r});transform-origin:${a}% ${o}%`}function Rn(e,t,a,o){let r=Vo(a);if(r)return`<div class="ad-ph-art"><img class="ad-ph-shot" src="${zn(r)}" alt="" style="${In(o)}"></div>`;let i=Oo(e).id,n=`<span class="ad-ph-size">${En(t)}</span>`,s="";return i==="photo"||i==="play"?s=Tn():i==="frame"?s='<div class="ad-ph-frame"></div>':i==="bars"?s='<div class="ad-ph-bars" aria-hidden="true"><i></i><i></i><i></i></div>':i==="grid"&&(s='<div class="ad-ph-grid" aria-hidden="true"></div>'),`<div class="ad-ph-art">${s}</div>${n}`}function Fn(e){let t=Se(e);return`--ph-bg:${t.bg};--ph-paper:${t.paper};--ph-ink:${t.ink};--ph-accent:${t.accent};--ph-fit:${t.fit};--ph-fit-x:${t.fx}%;--ph-fit-y:${t.fy}%;--ph-fit-z:${Number(t.fz)/100};--ph-fit-mat:${t.fm}`}function Dn(e){let t=e.w/e.h;return t>=2.4?"wide":t<=.55?"tall":"rect"}function qo(e,t="lab-ad",a="fade-up",o="climax",r={}){let i=Dn(e),n=st(o),s=Se(r.ph),l=Ln(s)||"custom",d=Pa(r.propAct),c=r.propCam??"4.1",h=r.propCamH??r.pch??"0",v=r.propCamV??r.pcv??"0",u=r.propCamMode??r.pcm??"orbit",y=r.propCamPx??r.ppx??"0",g=r.propCamPy??r.ppy??"0",S=r.propSx??"0.72",k=r.propSy??"0.72",m=r.propSz??"0.72",x=r.propLight??r.plight??"none",b=r.propLint??r.plint??"0.35",p=r.propFloor??r.pfloor??"1",w=r.propCog??r.pcog??"1",M=r.propFlat??r.pflat??"0",A=r.propLcol??r.plcol??ha,C=r.propLdist??r.pldist??Bo,L=r.propLpos??r.plpos??"frente",N=r.propLhrot??r.plhrot??"0",F=r.propLvrot??r.plvrot??"0",ae=r.propRhrot??r.prh??"0",B=r.propRvrot??r.prv??"0",ee=r.studioLights||"";ee&&typeof ee=="object"&&(ee=JSON.stringify(ee));let se=n.id==="prop"&&ee?` data-studio-lights="${String(ee).replace(/&/g,"&amp;").replace(/"/g,"&quot;")}"`:"",pe=n.id==="prop"?` data-prop-act="${d.id}" data-prop-cam="${c}" data-prop-cam-h="${h}" data-prop-cam-v="${v}" data-prop-cam-mode="${u}" data-prop-cam-px="${y}" data-prop-cam-py="${g}" data-prop-cog="${w}" data-prop-sx="${S}" data-prop-sy="${k}" data-prop-sz="${m}" data-prop-light="${x}" data-prop-lint="${b}" data-prop-floor="${p}" data-prop-flat="${M}" data-prop-lcol="${A}" data-prop-ldist="${C}" data-prop-lpos="${L}" data-prop-lhrot="${N}" data-prop-lvrot="${F}" data-prop-rhrot="${ae}" data-prop-rvrot="${B}"${se}`:"",oe=Ce(r.handoff??r.hand).id,E=Vt(r),we=xo(Mo(r,e)),ue=n.id==="pre-enter"?"La escena abre paso al anuncio":n.id==="horizon"?"El sol sale. El anuncio es el remate.":n.id==="sundown"?"El sol toca el horizonte. El anuncio es el remate.":n.id==="storm"?"El rel\xE1mpago calla. El anuncio es el remate.":n.id==="aurora"?"Las luces llenan el cielo. El anuncio es el remate.":n.id==="erupt"?"El volc\xE1n calla. El anuncio es el remate.":n.id==="migrate"?"La bandada se fue. El anuncio es el remate.":n.id==="breaker"?"La ola ya rompi\xF3. El anuncio es el remate.":n.id==="calve"?"El hielo ya cay\xF3. El anuncio es el remate.":n.id==="prop"?`${d.blurb} El anuncio es el remate.`:e.hint;return`
    <aside class="ad-slot" data-in="${a}" data-play="${n.id}" style="--ad-w:${e.w}px;--ad-h:${e.h}px;--ad-ratio:${e.w} / ${e.h}">
      <div class="ad-label">Publicidad \xB7 ${e.w}\xD7${e.h}</div>
      <div class="ad-frame">
        <div id="${t}" class="ad-container" data-scene="${e.scene}" data-layout="${i}" data-play="${n.id}" data-in="${a}" data-handoff="${oe}" data-handoff-ms="${E.hms}" data-handoff-bands="${E.hnb}" data-handoff-stagger="${E.hst}" data-handoff-hold="${E.hhd}" data-handoff-in="${E.hin}" data-handoff-beats="${E.hbt}" data-handoff-tempo="${E.htm}" data-ph="${l}" data-ph-style="${s.style}" data-pal="${encodeURIComponent(JSON.stringify(K(n.id,r.pal)))}" style="${Fn(s)};--handoff-ms:${E.hms}ms;--handoff-bands:${E.hnb};--handoff-stagger:${E.hst}ms;--handoff-hold:${E.hhd}ms;--handoff-rise:${E.hin}ms;--handoff-fade:${Math.max(280,Math.round((Number(E.hms)-Number(E.hhd))/Number(E.hnb)))}ms"${pe}>
          <canvas id="${t}-canvas" width="${e.w}" height="${e.h}" aria-label="Placeholder de imagen"></canvas>
          <div class="ad-fallback">Anuncio no disponible</div>
          <div class="ad-hint">${ue}</div>
          <div class="ad-handoff" aria-hidden="true">
            ${ko(E.hnb,we)}
          </div>
          <article class="ad-creative" aria-label="Placeholder de imagen">
            <div class="ad-ph" data-style="${s.style}" data-fit="${s.fit}">${Rn(s.style,e,s.img,s)}</div>
          </article>
          ${Mn()}
        </div>
      </div>
    </aside>`}var fe={catalog:{world:.7,key:.55,fill:.42,rim:.2,env:.85,exposure:1.02,bg:[.93,.91,.88],worldCol:"#ede8e0",keyCol:"#fff7eb",fillCol:"#ebf2ff",rimCol:"#d9e6ff",keyDir:[-.35,-.72,-.55],fillDir:[.62,-.28,-.35],rimDir:[.25,-.12,.9]},highkey:{world:1.05,key:.62,fill:.88,rim:.12,env:1.05,exposure:1.16,bg:[.96,.95,.93],worldCol:"#f5f2ed",keyCol:"#fffaf2",fillCol:"#f3f7ff",rimCol:"#e8eeff",keyDir:[-.22,-.78,-.5],fillDir:[.7,-.2,-.3],rimDir:[.1,-.2,.9]},lowkey:{world:.16,key:.95,fill:.08,rim:.42,env:.35,exposure:.9,bg:[.08,.08,.09],worldCol:"#141416",keyCol:"#ffd7a8",fillCol:"#6a7a9a",rimCol:"#9bb4ff",keyDir:[-.55,-.45,-.55],fillDir:[.8,-.15,.1],rimDir:[.15,-.05,.95]},rembrandt:{world:.38,key:.92,fill:.18,rim:.28,env:.55,exposure:.98,bg:[.22,.21,.2],worldCol:"#383430",keyCol:"#ffc48a",fillCol:"#7a6a58",rimCol:"#c4b89a",keyDir:[-.72,-.42,-.38],fillDir:[.55,-.2,-.15],rimDir:[.35,-.1,.85]},butterfly:{world:.55,key:.88,fill:.32,rim:.16,env:.7,exposure:1.06,bg:[.9,.88,.85],worldCol:"#e6e0d8",keyCol:"#ffe7c8",fillCol:"#f0e6dc",rimCol:"#d8e4f0",keyDir:[.05,-.92,-.35],fillDir:[.1,.35,-.7],rimDir:[.2,-.15,.9]},split:{world:.28,key:1.05,fill:.06,rim:.22,env:.45,exposure:.96,bg:[.14,.14,.15],worldCol:"#242426",keyCol:"#ffe0b0",fillCol:"#4a5570",rimCol:"#a8c0ff",keyDir:[-.95,-.18,-.12],fillDir:[.9,-.1,.05],rimDir:[.1,-.2,.9]},rimshot:{world:.22,key:.22,fill:.12,rim:1.05,env:.4,exposure:.94,bg:[.1,.1,.11],worldCol:"#1a1a1c",keyCol:"#c8b8a0",fillCol:"#6a7080",rimCol:"#dce8ff",keyDir:[-.2,-.55,-.75],fillDir:[.4,-.2,-.4],rimDir:[.15,-.05,.98]},estudio:{world:.14,key:1.08,fill:.26,rim:.88,env:.22,exposure:.94,bg:[.07,.07,.08],worldCol:"#121318",keyCol:"#ffd4a4",fillCol:"#7a8aa8",rimCol:"#e4eeff",keyDir:[-.5,-.58,-.5],fillDir:[.74,-.2,-.26],rimDir:[.2,-.06,.94]}};var $a=4,Nn=16,Bn=4,Te=0,Ee=3,Xo=.2,Wo=3,Ie={world:fe.catalog.worldCol,key:fe.catalog.keyCol,fill:fe.catalog.fillCol,rim:fe.catalog.rimCol},ea={frente:{label:"Frente",dir:[-.22,-.55,-.78],pos:[2.1,3.4,3.8]},lado:{label:"Lado",dir:[-.88,-.22,-.12],pos:[4.2,2.4,.6]},arriba:{label:"Arriba",dir:[.04,-.96,-.22],pos:[.4,5.2,1.6]},atras:{label:"Atr\xE1s",dir:[.18,-.32,.9],pos:[-.8,2.6,-4.2]},contra:{label:"Contra",dir:[.12,-.08,.98],pos:[-1.1,2.4,-4.6]}},_s=Object.entries(ea).map(([e,t])=>({id:e,label:t.label})),za=["#ffb347","#7ad7ff","#ff6b9d","#c9f07a"];function lt(){let e=fe.catalog;return{preset:"catalog",world:e.world,key:e.key,fill:e.fill,rim:e.rim,exposure:e.exposure,worldCol:Ie.world,keyCol:Ie.key,fillCol:Ie.fill,rimCol:Ie.rim,extras:[]}}function ce(e,t,a,o){let r=Number(e);return Number.isFinite(r)?Math.min(a,Math.max(t,r)):o}function be(e,t="#fff7eb"){let a=String(e||"").trim();if(/^#[0-9a-fA-F]{6}$/.test(a))return`#${a.slice(1).toLowerCase()}`;if(/^#[0-9a-fA-F]{3}$/.test(a)){let o=a[1],r=a[2],i=a[3];return`#${o}${o}${r}${r}${i}${i}`.toLowerCase()}return t}function Go(e,t){let a=be(e,t);return[parseInt(a.slice(1,3),16)/255,parseInt(a.slice(3,5),16)/255,parseInt(a.slice(5,7),16)/255]}function jn(e){return ea[e]?e:"frente"}function La(e=0,t={}){return{id:String(t.id||`x${Date.now().toString(36)}${Math.random().toString(36).slice(2,5)}`),color:be(t.color,za[e%za.length]),intensity:ce(t.intensity,0,Nn,Bn),place:jn(t.place)}}function Hn(e){return Array.isArray(e)?e.slice(0,$a).map((t,a)=>La(a,t||{})):[]}function On(e){let t=Pe(e);return t.extras.length>=$a||t.extras.push(La(t.extras.length)),t}function Vn(e,t,a){let o=Pe(e);return o.extras=o.extras.map(r=>r.id===t?La(0,{...r,...a,id:r.id}):r),o}function _n(e,t){let a=Pe(e);return a.extras=a.extras.filter(o=>o.id!==t),a}function Pe(e){let t=lt(),a=e&&typeof e=="object"?e:{},o=fe[a.preset]?a.preset:t.preset,r=fe[o],i=fe.catalog,n=o!=="catalog"&&!a.worldCol&&(!a.keyCol||be(a.keyCol,i.keyCol)===i.keyCol)&&(!a.fillCol||be(a.fillCol,i.fillCol)===i.fillCol)&&(!a.rimCol||be(a.rimCol,i.rimCol)===i.rimCol);return{preset:o,world:ce(a.world,Te,Ee,r.world),key:ce(a.key,Te,Ee,r.key),fill:ce(a.fill,Te,Ee,r.fill),rim:ce(a.rim,Te,Ee,r.rim),exposure:ce(a.exposure,Xo,Wo,r.exposure),worldCol:n?r.worldCol:be(a.worldCol,r.worldCol||t.worldCol),keyCol:n?r.keyCol:be(a.keyCol,r.keyCol||t.keyCol),fillCol:n?r.fillCol:be(a.fillCol,r.fillCol||t.fillCol),rimCol:n?r.rimCol:be(a.rimCol,r.rimCol||t.rimCol),extras:Hn(a.extras)}}function Yo(e){let t=Pe(e);return JSON.stringify({p:t.preset,w:t.world,k:t.key,f:t.fill,r:t.rim,e:t.exposure,wc:t.worldCol,kc:t.keyCol,fc:t.fillCol,rc:t.rimCol,x:t.extras.map(a=>({i:a.id,c:a.color,n:a.intensity,p:a.place}))})}function Ta(e){if(!e)return lt();if(typeof e=="object")return Pe(e);try{let t=JSON.parse(e);return!t||typeof t!="object"?lt():Pe({preset:t.p||t.preset,world:t.w??t.world,key:t.k??t.key,fill:t.f??t.fill,rim:t.r??t.rim,exposure:t.e??t.exposure,worldCol:t.wc||t.worldCol,keyCol:t.kc||t.keyCol,fillCol:t.fc||t.fillCol,rimCol:t.rc||t.rimCol,extras:Array.isArray(t.x)?t.x.map(a=>({id:a.i||a.id,color:a.c||a.color,intensity:a.n??a.intensity,place:a.p||a.place})):t.extras})}catch{return lt()}}function Ea(e,t,a,o={}){let r=new e.HemisphericLight("world",new e.Vector3(.18,1,.28),t);r.diffuse=new e.Color3(1,.98,.95),r.groundColor=new e.Color3(.74,.72,.69);let i=new e.DirectionalLight("key",new e.Vector3(-.35,-.72,-.55),t);i.position=new e.Vector3(2.4,4.2,3.2),i.diffuse=new e.Color3(1,.97,.92);let n=new e.DirectionalLight("fill",new e.Vector3(.62,-.28,-.35),t);n.position=new e.Vector3(-3.2,2.2,2.4),n.diffuse=new e.Color3(.92,.95,1);let s=new e.DirectionalLight("rim",new e.Vector3(.25,-.12,.9),t);s.position=new e.Vector3(-1.2,2.8,-4.4),s.diffuse=new e.Color3(.85,.9,1);let l=null;if(o.environment!==!1&&(l=t.createDefaultEnvironment({createSkybox:!0,createGround:!1,skyboxSize:o.skyboxSize||70,skyboxColor:new e.Color3(.94,.92,.89)})),o.ssao!==!1&&a)try{let b=new e.SSAO2RenderingPipeline("ssao",t,1);b.totalStrength=.28,b.radius=.8,b.expensiveBlur=!0,b.samples=8,b.maxZ=40,t.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("ssao",a)}catch{}t.imageProcessingConfiguration&&(t.imageProcessingConfiguration.toneMappingEnabled=!0,t.imageProcessingConfiguration.contrast=1.02);let d="",c=lt(),h=Array.from({length:$a},(b,p)=>{let w=new e.DirectionalLight(`extra${p}`,new e.Vector3(-.22,-.55,-.78),t);return w.intensity=0,w.setEnabled(!1),w}),v=(b,p,w)=>{let[M,A,C]=Go(p,w);b.diffuse=new e.Color3(M,A,C)},u=()=>({...c,extras:c.extras.map(b=>({...b}))}),y=()=>{r.intensity=c.world,i.intensity=c.key,n.intensity=c.fill,s.intensity=c.rim;let[b,p,w]=Go(c.worldCol,Ie.world);r.diffuse=new e.Color3(b,p,w),r.groundColor=new e.Color3(b*.74,p*.73,w*.72),t.clearColor=o.alpha?new e.Color4(0,0,0,0):new e.Color4(b,p,w,1),l?.skyboxMaterial&&(l.skyboxMaterial.primaryColor=new e.Color3(b,p,w)),v(i,c.keyCol,Ie.key),v(n,c.fillCol,Ie.fill),v(s,c.rimCol,Ie.rim),t.imageProcessingConfiguration&&(t.imageProcessingConfiguration.exposure=c.exposure),h.forEach((M,A)=>{let C=c.extras[A];if(!C){M.intensity=0,M.setEnabled(!1);return}let L=ea[C.place]||ea.frente;M.setEnabled(!0),M.intensity=C.intensity,M.direction=new e.Vector3(...L.dir),M.position=new e.Vector3(...L.pos),v(M,C.color,za[A])})},g=b=>{let p=fe[b]||fe.catalog;return c.preset=fe[b]?b:"catalog",c.world=p.world,c.key=p.key,c.fill=p.fill,c.rim=p.rim,c.exposure=p.exposure,c.worldCol=p.worldCol,c.keyCol=p.keyCol,c.fillCol=p.fillCol,c.rimCol=p.rimCol,i.direction=new e.Vector3(...p.keyDir),n.direction=new e.Vector3(...p.fillDir),s.direction=new e.Vector3(...p.rimDir),t.environmentIntensity=p.env,y(),u()},S=(b,p)=>{if(b==="worldCol"||b==="keyCol"||b==="fillCol"||b==="rimCol")return c[b]=be(p,c[b]),y(),u();let w=Number(p);return Number.isFinite(w)&&(b==="world"&&(c.world=ce(w,Te,Ee,c.world)),b==="key"&&(c.key=ce(w,Te,Ee,c.key)),b==="fill"&&(c.fill=ce(w,Te,Ee,c.fill)),b==="rim"&&(c.rim=ce(w,Te,Ee,c.rim)),b==="exposure"&&(c.exposure=ce(w,Xo,Wo,c.exposure)),y()),u()},k=b=>{let p=Pe(b);return g(p.preset),c.world=p.world,c.key=p.key,c.fill=p.fill,c.rim=p.rim,c.exposure=p.exposure,c.worldCol=p.worldCol,c.keyCol=p.keyCol,c.fillCol=p.fillCol,c.rimCol=p.rimCol,c.extras=p.extras.map(w=>({...w})),y(),u()},m=b=>{let p=b?.dataset?.studioLights||"";if(p.includes("%"))try{p=decodeURIComponent(p)}catch{}return p===d?{...c}:(d=p,k(Ta(p)))},x=()=>u();return g(o.initial&&o.initial.preset||"catalog"),o.initial&&k(o.initial),{world:r,key:i,fill:n,rim:s,extras:h,env:l,applyPreset:g,setChannel:S,applyConfig:k,syncFromHost:m,getState:x,addExtra(){return Object.assign(c,On(c)),y(),u()},setExtra(b,p){return Object.assign(c,Vn(c,b,p)),y(),u()},removeExtra(b){return Object.assign(c,_n(c,b)),y(),u()}}}var Zo={},Jo="babylon-ads-gallery",Ia="babylon-ads-gallery-gwd";function Qo(){if(typeof document<"u"&&document.body?.dataset.visor==="gwd")return!0;if(typeof location>"u")return!1;let e=String(location.pathname||""),t=(e.split("/").pop()||"").replace(/\.html$/i,"");if(e.includes("/gwd/")||t==="gallery-gwd"||t==="gwd-light"||t==="gwd-light-ad")return!0;try{let a=new URLSearchParams(location.search),o=String(location.hash||"");return a.get("visor")==="gwd"||o.includes("visor=gwd")}catch{return!1}}function Ra(){return Qo()?Ia:Jo}function er(){return`g${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`}function dt(){return{cols:"3",size:"m",gap:"md",previewW:null,voidL:14,zoom:1,format:"medium",cat:"all",showOff:!1,afps:0,blit:1.5,shelf:"column",sideDlg:!1,clock:!0,clockStyle:"sweep",clockTone:"dark",clockSize:100,ph:Se()}}function Un(e){if(!e||!e.name)return null;let t=Array.isArray(e.extras)?e.extras.map(String).filter(Boolean):[],a=e.assetId?String(e.assetId):"";return{name:String(e.name),extras:t,assetId:a}}function Ae(e={}){let t=st(e.play);return{id:e.id||er(),play:t.id,propAct:t.id==="prop"?Pa(e.propAct).id:"",ad:jt(e.ad).id,in:e.in||"none",hand:Ce(e.hand).id,hms:ga(e.hms),hnb:Ht(e.hnb),hst:ya(e.hst),hhd:wa(e.hhd),hin:va(e.hin),hbt:xa(e.hbt),htm:Ot(e.htm),htxt:Ma(e.htxt),hempty:ka(e.hempty),pal:e.pal&&typeof e.pal=="object"?{...e.pal}:{},ph:Se(e.ph),pcam:t.id==="prop"?qt(e.pcam):"",pch:t.id==="prop"?Gt(e.pch):"",pcv:t.id==="prop"?Xt(e.pcv):"",pcm:t.id==="prop"?Wt(e.pcm):"",ppx:t.id==="prop"?Ke(e.ppx):"",ppy:t.id==="prop"?Ke(e.ppy):"",psx:e.psx||"0.72",psy:e.psy||"0.72",psz:e.psz||"0.72",plight:t.id==="prop"?So(e.plight).id:"",plint:t.id==="prop"?Fo(e.plint):"",pfloor:t.id==="prop"?Do(e.pfloor??"1"):"",pflat:t.id==="prop"?No(e.pflat):"",pcog:t.id==="prop"?Yt(e.pcog??"1"):"",plcol:t.id==="prop"?Kt(e.plcol):"",pldist:t.id==="prop"?Zt(e.pldist):"",plpos:t.id==="prop"?Ut(e.plpos).id:"",plhrot:t.id==="prop"?Jt(e.plhrot):"",plvrot:t.id==="prop"?Qt(e.plvrot):"",prh:t.id==="prop"?Ze(e.prh):"",prv:t.id==="prop"?Ze(e.prv):"",studio:t.id==="prop"?Pe(e.studio):null,alias:String(e.alias||"").trim(),off:!!e.off,pin:!!e.pin,pmesh:Un(e.pmesh)}}function tr(){let e=[];for(let t of Ft)if(t.id==="prop")for(let a of Dt)e.push(Ae({play:t.id,propAct:a.id,ad:"medium",in:"none"}));else e.push(Ae({play:t.id,ad:"medium",in:"none"}));return e}function Ko(){let e={id:er(),name:"Galer\xEDa 1",createdAt:Date.now(),items:tr()};return{version:1,activeId:e.id,view:dt(),profiles:[e]}}function qn(e){if(!e||!Array.isArray(e.items))return!1;let t=new Set(e.items.map(o=>`${o.play}|${o.propAct||""}`)),a=!1;for(let o of tr()){let r=`${o.play}|${o.propAct||""}`;t.has(r)||(e.items.push(o),t.add(r),a=!0)}return a}function Fa(){let e=Ra();try{if(window.parent&&window.parent!==window&&window.parent.localStorage.getItem(e))return window.parent.localStorage}catch{}return localStorage}function ta(e=Fa(),t=Ra()){let a=t===Ia;try{let o=JSON.parse(e.getItem(t)||"null");if(!o||!Array.isArray(o.profiles)||!o.profiles.length)return a?{version:1,activeId:"",view:dt(),profiles:[]}:Ko();o.view?o.view={...dt(),...o.view,ph:Se(o.view.ph),afps:Po(o.view.afps),blit:Ao(o.view.blit),shelf:zo(o.view.shelf),sideDlg:$o(o.view.sideDlg),zoom:Lo(o.view.zoom),clock:To(o.view.clock),clockStyle:Eo(o.view.clockStyle),clockTone:Io(o.view.clockTone),clockSize:Ro(o.view.clockSize)}:o.view=dt(),(!o.activeId||!o.profiles.some(i=>i.id===o.activeId))&&(o.activeId=o.profiles[0].id);let r=!1;for(let i of o.profiles){if(!Array.isArray(i.items))continue;let n=JSON.stringify(i.items);i.items=i.items.map(s=>Ae(s)),!a&&qn(i)&&(r=!0),oi(i.items)&&(r=!0),JSON.stringify(i.items)!==n&&(r=!0)}return r&&Gn(o,e,t),o}catch{return a?{version:1,activeId:"",view:dt(),profiles:[]}:Ko()}}function Gn(e,t=Fa(),a=Ra()){return t.setItem(a,JSON.stringify(e)),e}function ar(e){return e.profiles.find(t=>t.id===e.activeId)||e.profiles[0]}var Xn="babylon-ads-profile";function Wn(e){let t=typeof e=="string"?JSON.parse(e):e;if(!t||t.kind!==Xn||!t.profile||!Array.isArray(t.profile.items))throw new Error("No es un perfil exportado.");return t}function Yn(e){return`pack-${String(e||"").replace(/^.*\//,"").replace(/\.json$/i,"").replace(/[^a-z0-9_-]+/gi,"-")||"perfil"}`}function Kn(e,t){let a=Wn(e),o=Yn(t);return{id:o,name:a.profile.name||"Galer\xEDa",createdAt:a.exportedAt||Date.now(),file:String(t||""),packed:!0,items:a.profile.items.map((r,i)=>Ae({...r,id:r.id||`${o}-${i}`}))}}var Zn=["galeria-1.json"],Jn=["galeria-gwd.json"],ct={live:null,gwd:null};uo(()=>{ct.live=null,ct.gwd=null});function or(e="auto"){return e==="gwd"?!0:e==="live"?!1:Qo()}function rr(e,t=!1){let a=t?"data-gwd":"data";try{if(Zo.url)return new URL(`./${a}/${e}`,Zo.url).href}catch{}return typeof location<"u"?new URL(`${a}/${e}`,location.href).href:`${a}/${e}`}function Qn(e=!1){return He(`${e?"data-gwd":"data"}/profiles.json`,rr("profiles.json",e))}function ei(e,t=!1){return He(`${t?"data-gwd":"data"}/${e}`,rr(e,t))}async function nr(e){let t=await fetch(e,{cache:"no-store"});if(!t.ok)throw new Error(String(t.status));return t.json()}async function ti(e=!1){try{let t=await nr(Qn(e));if(Array.isArray(t)&&t.length)return t.map(a=>String(a).replace(/^.*\//,"")).filter(a=>a.endsWith(".json"))}catch{}return e?Jn:Zn}async function ai(e="auto"){let t=or(e),a=await ti(t),o=[];for(let r of a)try{o.push(Kn(await nr(ei(r,t)),r))}catch{}return o}async function ir(e="auto"){let t=or(e),a=t?"gwd":"live";if(ct[a])return ct[a];let o=t?Ia:Jo,r=ta(Fa(),o),i=await ai(t?"gwd":"live"),n=new Set((r.profiles||[]).map(d=>d.id)),s=i.filter(d=>!n.has(d.id)),l={version:r.version||1,activeId:r.activeId,view:r.view,profiles:[...r.profiles||[],...s]};return(!l.activeId||!l.profiles.some(d=>d.id===l.activeId))&&(l.activeId=l.profiles[0]?.id||""),ct[a]=l,l}function oi(e){if(!Array.isArray(e)||!e.length)return!1;let t=e.filter(r=>r.pin);if(!t.length)return!1;let a=e.filter(r=>!r.pin),o=t.concat(a);return o.every((r,i)=>r===e[i])?!1:(e.splice(0,e.length,...o),!0)}var Da="ad4-banner";var ri={logo:"NEXUS",showMark:!0,logoColor:"#04110e",waveTop:"#7af7c5",waveMid:"#00f0c8",waveBottom:"#6d7cff",speed:2.2,amplitude:5.5,height:56,ring:"#6d7cff",core:"#00f0c8",needle:"#ff3cac",shapes:[]};function sr(){return[{id:lr(),type:"diamond",fill:"#00f0c8",opacity:.9,x:150,y:92,w:34,h:34,anim:{move:!1,expand:!0,from:{x:150,y:92,scale:.4},to:{x:150,y:92,scale:1.35},duration:1.35,delay:0,easing:"easeInOut",loop:!0,alternate:!0}},{id:lr(),type:"ellipse",fill:"#6d7cff",opacity:.55,x:52,y:78,w:26,h:18,anim:{move:!0,expand:!1,from:{x:40,y:70,scale:1},to:{x:248,y:108,scale:1},duration:2.6,delay:0,easing:"easeInOut",loop:!0,alternate:!0}}]}function lr(){return`s-${Math.random().toString(36).slice(2,8)}`}function Na(){let e={...ri,shapes:sr()};try{let t=localStorage.getItem(Da);if(!t)return e;let a=JSON.parse(t);Object.assign(e,a),Array.isArray(e.shapes)||(e.shapes=sr())}catch{}return e}function Ba(e,t){if(!e)return;let a=e.querySelector(".ad-brand-name"),o=e.querySelector(".ad-brand-mark"),r=e.querySelector(".ad-wave"),i=e.querySelector(".ad-wave-svg"),n=e.querySelectorAll("[data-wave-stops] stop, #ad4-wave-fill stop");a&&(a.textContent=t.logo||"NEXUS",a.style.color=t.logoColor),o&&(o.style.display=t.showMark?"":"none",o.style.background=t.logoColor),r&&(r.style.height=`${t.height}px`),i&&i.setAttribute("viewBox",`0 0 300 ${t.height}`),n[0]&&n[0].setAttribute("stop-color",t.waveTop),n[1]&&n[1].setAttribute("stop-color",t.waveMid),n[2]&&n[2].setAttribute("stop-color",t.waveBottom)}function ni(e,t){let a=Math.min(1,Math.max(0,e));return t==="linear"?a:t==="easeIn"?a*a:t==="easeOut"?1-(1-a)*(1-a):a<.5?2*a*a:1-(-2*a+2)**2/2}function ii(e,t){let a=e.anim||{},o={x:e.x,y:e.y,scale:1};if(!a.move&&!a.expand)return o;let r=Math.max(.08,Number(a.duration)||1),i=Math.max(0,Number(a.delay)||0),n=(t/1e3-i)/r;if(n<0)return{x:a.move?a.from.x:o.x,y:a.move?a.from.y:o.y,scale:a.expand?a.from.scale:1};if(a.loop)if(a.alternate){let c=Math.floor(n);n-=c,c%2&&(n=1-n)}else n-=Math.floor(n);else n=Math.min(1,n);let s=ni(n,a.easing||"easeInOut"),l=a.from||o,d=a.to||o;return{x:a.move?l.x+(d.x-l.x)*s:o.x,y:a.move?l.y+(d.y-l.y)*s:o.y,scale:a.expand?l.scale+(d.scale-l.scale)*s:1}}function si(e,t){let a="http://www.w3.org/2000/svg",o=t.w/2,r=t.h/2,i;return t.type==="ellipse"?(i=document.createElementNS(a,"ellipse"),i.setAttribute("rx",o),i.setAttribute("ry",r)):t.type==="diamond"?(i=document.createElementNS(a,"polygon"),i.setAttribute("points",`0,${-r} ${o},0 0,${r} ${-o},0`)):t.type==="triangle"?(i=document.createElementNS(a,"polygon"),i.setAttribute("points",`0,${-r} ${o},${r} ${-o},${r}`)):(i=document.createElementNS(a,"rect"),i.setAttribute("x",-o),i.setAttribute("y",-r),i.setAttribute("width",t.w),i.setAttribute("height",t.h)),i.setAttribute("fill",t.fill),i.setAttribute("fill-opacity",String(t.opacity??1)),i.dataset.shapeId=t.id,i.dataset.shapeType=t.type,e.appendChild(i),i}function li(e,t,a,o=null){let r=new Set(t.map(i=>i.id));[...e.querySelectorAll("[data-shape-id]")].forEach(i=>{r.has(i.dataset.shapeId)||i.remove()});for(let i of t){let n=e.querySelector(`[data-shape-id="${i.id}"]`);(!n||n.dataset.shapeType!==i.type)&&(n?.remove(),n=si(e,i),n.dataset.shapeType=i.type);let s=i.w/2,l=i.h/2;i.type==="ellipse"?(n.setAttribute("rx",s),n.setAttribute("ry",l)):i.type==="diamond"?n.setAttribute("points",`0,${-l} ${s},0 0,${l} ${-s},0`):i.type==="triangle"?n.setAttribute("points",`0,${-l} ${s},${l} ${-s},${l}`):(n.setAttribute("x",-s),n.setAttribute("y",-l),n.setAttribute("width",i.w),n.setAttribute("height",i.h));let d=ii(i,a);n.setAttribute("fill",i.fill),n.setAttribute("fill-opacity",String(i.opacity??1)),n.setAttribute("transform",`translate(${d.x} ${d.y}) scale(${d.scale})`),n.setAttribute("stroke",i.id===o?"#f5f7ff":"none"),n.setAttribute("stroke-width",i.id===o?"1.5":"0"),n.style.vectorEffect="non-scaling-stroke"}}function dr(e,t,a=()=>null,o=()=>!0){let r=performance.now(),i=0,n=s=>{if(i=requestAnimationFrame(n),!o())return;let l=t();li(e,l.shapes||[],s-r,a())};return i=requestAnimationFrame(n),()=>cancelAnimationFrame(i)}var di=["horizon","sundown","storm","aurora","erupt","migrate","breaker","calve"],T={horizonDelayMs:480,horizonRiseMs:3400,horizonHoldMs:820,stormBuildMs:920,stormFlashMs:150,stormSilenceMs:1080,auroraDelayMs:160,auroraRiseMs:2400,auroraHoldMs:1600,eruptBuildMs:1600,eruptBurstMs:700,eruptFallMs:1400,eruptRestMs:700,migrateDelayMs:220,migrateFlyMs:5200,migrateRestMs:900,breakBuildMs:2400,breakHoldMs:320,breakCrashMs:380,breakWashMs:1100,breakRestMs:650,calveLookMs:1600,calvePeelMs:400,calveDropMs:560,calveSplashMs:480,calveSettleMs:1100,calveRestMs:700};function br(e){return di.includes(String(e||""))}function ge(e,t,a){return e+(t-e)*a}function D(e){let t=String(e||"").replace("#","");return t.length===3?t.split("").map(a=>parseInt(a+a,16)||0):[parseInt(t.slice(0,2),16)||0,parseInt(t.slice(2,4),16)||0,parseInt(t.slice(4,6),16)||0]}function Ha(e,t){let[a,o,r]=D(e);return`rgba(${a},${o},${r},${t})`}function ja(e){return D(e).join(",")}function X(e,t=e?.dataset.play){return K(t,e?.dataset.pal)}function Re(e,t){e?.dataset.loopPassive!=="1"&&(e.addEventListener("click",t),e.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&t()}),e.tabIndex=0)}function ci(e){let t=Math.min(1,Math.max(0,e));if(t<.42){let o=t/.42;return .32*o*o*(3-2*o)}let a=(t-.42)/.58;return .32+.68*a*a*(3-2*a)}function aa(e,t,a,o,r,i=!1,n){n=n||K(i?"sundown":"horizon");let s=Math.min(1,Math.max(0,o)),l=a*(r.wide?.52:r.tall?.7:.6),d=Math.min(t,a)*.14,c=t*.5,h=i?ge(l-d*2.35,l,s):ge(l+d*.7,l-d*2.35,s),v=(k,m,x)=>{let b=p=>k[p]+(m[p]-k[p])*x|0;return`rgb(${b(0)},${b(1)},${b(2)})`},u=D(n.skyNight),y=D(n.seaNight),g=D(n.skyDay),S=D(n.seaDay);e.fillStyle=v(u,g,s),e.fillRect(0,0,t,l),e.fillStyle=v(y,S,s),e.fillRect(0,l,t,a-l),e.save(),e.beginPath(),e.rect(0,0,t,l),e.clip(),e.beginPath(),e.arc(c,h,d,0,Math.PI*2),e.fillStyle=v(D(n.sun),D(n.sun),s),e.fill(),e.restore(),e.fillStyle="rgba(0,0,0,0.28)",e.fillRect(0,l,t,1)}function cr(e,t,a,o,r,i){i=i||K("storm");let n=a*(r.wide?.52:r.tall?.7:.6),s=o.flash,l=(d,c,h)=>{let v=u=>d[u]+(c[u]-d[u])*h|0;return`rgb(${v(0)},${v(1)},${v(2)})`};if(e.fillStyle=l(D(i.sky),D(i.skyFlash),s),e.fillRect(0,0,t,n),e.fillStyle=l(D(i.sea),D(i.skyFlash),s*.55),e.fillRect(0,n,t,a-n),o.bolt>.02){let d=t*(r.tall?.5:.58);e.save(),e.beginPath(),e.rect(0,0,t,n),e.clip(),e.beginPath(),e.moveTo(d,0),e.lineTo(d-t*.05,n*.28),e.lineTo(d+t*.07,n*.34),e.lineTo(d-t*.03,n*.64),e.lineTo(d+t*.02,n),e.strokeStyle=Ha(i.bolt,.35+o.bolt*.65),e.lineWidth=Math.max(1.5,Math.min(t,a)*.012),e.lineJoin="miter",e.stroke(),e.restore()}e.fillStyle="rgba(0,0,0,0.35)",e.fillRect(0,n,t,1)}function fi(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),aa(r,i,n,0,l,!1,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=T.horizonDelayMs,h=T.horizonRiseMs,v=T.horizonHoldMs;d>=c+h+v&&o();let u=0;d>c&&(u=ci((d-c)/h)),(t.climax||d>=c+h)&&(u=1),aa(r,i,n,u,l,!1,X(e))}}function pi(e){let t=Math.min(1,Math.max(0,e));if(t<.58){let o=t/.58;return .68*o*o*(3-2*o)}let a=(t-.58)/.42;return .68+.32*a*a*(3-2*a)}function ui(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),aa(r,i,n,0,l,!0,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=T.horizonDelayMs,h=T.horizonRiseMs,v=T.horizonHoldMs;d>=c+h+v&&o();let u=0;d>c&&(u=pi((d-c)/h)),(t.climax||d>=c+h)&&(u=1),aa(r,i,n,u,l,!0,X(e))}}function hi(e){let t=T.stormBuildMs,a=T.stormFlashMs,o=T.stormSilenceMs,r=180;if(e<t-r)return{flash:0,bolt:0,done:!1};if(e<t){let s=(e-(t-r))/r;return{flash:s<.45?Math.sin(s/.45*Math.PI)*.22:0,bolt:0,done:!1}}if(e<t+a){let s=(e-t)/a,l=Math.sin(s*Math.PI);return{flash:l,bolt:l,done:!1}}let i=(e-t-a)/420;return{flash:Math.max(0,1-i)*.1,bolt:0,done:e>=t+a+o}}function mi(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),cr(r,i,n,{flash:0,bolt:0},l,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=hi(d);c.done&&o(),cr(r,i,n,t.climax?{flash:.04,bolt:0}:c,l,X(e))}}function fr(e,t,a,o,r,i=0,n){n=n||K("aurora");let s=Math.min(1,Math.max(0,o)),l=a*(r.wide?.58:r.tall?.72:.62),d=i*.00105,c=(g,S,k)=>{let m=x=>g[x]+(S[x]-g[x])*k|0;return`rgb(${m(0)},${m(1)},${m(2)})`};if(e.fillStyle=c(D(n.sky),D(n.sky),s),e.fillRect(0,0,t,l),e.fillStyle=c(D(n.sea),D(n.sea),s),e.fillRect(0,l,t,a-l),!r.wide){e.fillStyle=`rgba(220,230,255,${.22+s*.18})`;for(let g of[[.1,.16],[.2,.38],[.38,.1],[.55,.22],[.72,.14],[.86,.32],[.14,.52],[.91,.08]])e.fillRect(g[0]*t,g[1]*l,1.5,1.5)}e.save(),e.beginPath(),e.rect(0,0,t,l),e.clip();let h=l*.98,v=ge(l*.42,l*.04,s),u=[{cx:.3,width:.16,amp:.05,freq:3.1,speed:.72,rgb:ja(n.bandA),a:.78},{cx:.5,width:.22,amp:.07,freq:2.4,speed:.5,rgb:ja(n.bandB),a:.7},{cx:.68,width:.14,amp:.055,freq:3.6,speed:.9,rgb:ja(n.bandC),a:.55}],y=28;for(let g of u){let S=g.cx*t,k=g.width*t*.5,m=g.amp*t,x=d*g.speed+g.cx*8,b=g.a*(.28+.72*s);e.beginPath();for(let w=0;w<=y;w++){let M=w/y,A=ge(h,v,M),C=Math.sin(M*g.freq+x)*m,L=.4+.6*Math.sin(M*Math.PI),N=S+C-k*L;w===0?e.moveTo(N,A):e.lineTo(N,A)}for(let w=y;w>=0;w--){let M=w/y,A=ge(h,v,M),C=Math.sin(M*g.freq+x)*m,L=.4+.6*Math.sin(M*Math.PI);e.lineTo(S+C+k*L,A)}e.closePath();let p=e.createLinearGradient(S,h,S,v);p.addColorStop(0,`rgba(${g.rgb},0)`),p.addColorStop(.2,`rgba(${g.rgb},${b*.55})`),p.addColorStop(.5,`rgba(${g.rgb},${b})`),p.addColorStop(1,`rgba(${g.rgb},0)`),e.fillStyle=p,e.fill(),e.beginPath();for(let w=0;w<=y;w++){let M=w/y,A=ge(h,v,M),C=S+Math.sin(M*g.freq+x)*m;w===0?e.moveTo(C,A):e.lineTo(C,A)}e.strokeStyle=`rgba(255,255,245,${.18+.42*s})`,e.lineWidth=Math.max(1.25,Math.min(t,a)*.008),e.stroke()}e.restore(),e.fillStyle="rgba(0,0,0,0.4)",e.fillRect(0,l,t,1)}function bi(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),fr(r,i,n,0,l,0,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=T.auroraDelayMs,h=T.auroraRiseMs,v=T.auroraHoldMs;d>=c+h+v&&o();let u=0;if(d>c){let y=Math.min(1,Math.max(0,(d-c)/h));u=Math.pow(y,.55)}(t.climax||d>=c+h)&&(u=1),fr(r,i,n,u,l,d,X(e))}}function gi(e){let t=T.eruptBuildMs,a=T.eruptBurstMs,o=T.eruptFallMs,r=T.eruptRestMs;if(e<t){let i=Math.min(1,e/t);return{glow:Math.pow(i,.65),burst:0,plume:i*.1,fade:0,done:!1}}if(e<t+a){let i=(e-t)/a,n=Math.sin(Math.min(1,i)*Math.PI);return{glow:1,burst:Math.pow(n,.7),plume:.15+i*.85,fade:0,done:!1}}if(e<t+a+o){let i=(e-t-a)/o;return{glow:Math.max(.08,1-i),burst:0,plume:Math.max(0,1-i*.85),fade:i,done:!1}}return{glow:.06,burst:0,plume:0,fade:1,done:e>=t+a+o+r}}function pr(e,t,a,o,r,i){i=i||K("erupt");let n=a*(r.wide?.8:r.tall?.78:.76),s=a*(r.wide?.58:r.tall?.44:.48),l=n-s,d=t*.5,c=t*(r.wide?.2:r.tall?.36:.28),h=d-c,v=d+c,u=Math.max(6,c*.14),y=o.glow,g=o.burst,S=o.plume,k=o.fade||0,m=1-k,x=(w,M,A)=>{let C=L=>w[L]+(M[L]-w[L])*A|0;return`rgb(${C(0)},${C(1)},${C(2)})`},b=Math.min(1,y*.4*m+g);if(e.fillStyle=x(D(i.sky),D(i.fire),b),e.fillRect(0,0,t,n),g>.35&&(e.fillStyle=`rgba(255,230,160,${(g-.35)*1.4})`,e.fillRect(0,0,t,n)),e.fillStyle=x(D(i.ground),D(i.lava),b*.4*m),e.fillRect(0,n,t,a-n),S>.06&&m>.04){let w=Math.max(8,l*(.25+S*.9)*(.55+.45*m)),M=u*(1.6+g*3.5+S*1.2)*m,A=Math.min(t*.48,u*(4+g*10+S*5))*m,C=l-w*.82-k*l*.25,L=l-w*.38;e.beginPath(),e.ellipse(d,C,A,Math.max(6,w*.28*m),0,0,Math.PI*2),e.fillStyle=`rgba(48,36,38,${(.45+S*.4)*m})`,e.fill(),e.beginPath(),e.ellipse(d,L,M,w*.5,0,0,Math.PI*2),e.fillStyle=`rgba(255,${90+g*110|0},32,${(.25+y*.25+g*.55)*m})`,e.fill(),e.beginPath(),e.ellipse(d,C+w*.04,A*.45,Math.max(4,w*.12),0,0,Math.PI*2),e.fillStyle=`rgba(255,220,140,${g*.85*m})`,e.fill()}if(g>.05){let w=Math.min(t,a)*(.12+g*.38);e.beginPath(),e.arc(d,l,w,Math.PI,0),e.fillStyle=`rgba(255,244,200,${g*.95})`,e.fill()}let p=g>.12;if(e.beginPath(),e.moveTo(h,n),e.lineTo(d,l),e.lineTo(d,n),e.closePath(),e.fillStyle=p?i.ground:x(D(i.cone),D(i.lava),y*.35),e.fill(),e.beginPath(),e.moveTo(d,n),e.lineTo(d,l),e.lineTo(v,n),e.closePath(),e.fillStyle=p?i.cone:x(D(i.cone),D(i.lava),y*.55),e.fill(),y>.04&&m>.08){let w=Math.max(2.5,c*.055)*(.35+y)*m;e.beginPath(),e.moveTo(d+u*.15,l+s*.05),e.lineTo(d+u*.15+w*.6,l+s*.05),e.lineTo(d+c*.58+w,n),e.lineTo(d+c*.58-w*.15,n),e.closePath(),e.fillStyle=`rgba(255,${60+y*100|0},18,${(.4+y*.6)*m})`,e.fill()}e.beginPath(),e.moveTo(d-u,l+2),e.lineTo(d,l-u*(.4+g*.8)),e.lineTo(d+u,l+2),e.closePath(),e.fillStyle=`rgba(255,${70+y*90+g*80|0},28,${.2+y*.55*m+g*.4})`,e.fill()}function yi(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),pr(r,i,n,{glow:0,burst:0,plume:0,fade:1},l,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=gi(d);c.done&&o(),pr(r,i,n,t.climax?{glow:.06,burst:0,plume:0,fade:1}:c,l,X(e))}}function ur(e,t,a,o,r,i,n){n=n||K("migrate");let s=a*(r.wide?.72:r.tall?.8:.7),l=e.createLinearGradient(0,0,0,s);if(l.addColorStop(0,n.skyTop),l.addColorStop(.55,n.skyMid),l.addColorStop(1,n.skyHorizon),e.fillStyle=l,e.fillRect(0,0,t,s),e.fillStyle=n.earth,e.beginPath(),e.moveTo(0,a),e.lineTo(0,s),e.lineTo(t*.22,s-a*.04),e.lineTo(t*.48,s+a*.01),e.lineTo(t*.78,s-a*.05),e.lineTo(t,s),e.lineTo(t,a),e.closePath(),e.fill(),o<=0||o>=1)return;let d=r.tall,c=Math.max(9,Math.min(t,s)*(r.wide?.16:.075)),h=r.wide?5:d?8:7,v=c*2.15,u=c*1.55,y=h*v;e.save(),e.beginPath(),e.rect(0,0,t,s),e.clip(),e.fillStyle=n.birds;let g=(M,A,C,L,N)=>{let F=C*(.7+L*.38);e.beginPath(),N?(e.moveTo(M,A-C),e.lineTo(M-F,A+C*.38),e.lineTo(M,A+C*.08),e.lineTo(M+F,A+C*.38)):(e.moveTo(M+C,A),e.lineTo(M-C*.38,A-F),e.lineTo(M-C*.08,A),e.lineTo(M-C*.38,A+F)),e.closePath(),e.fill()},S,k,m,x,b,p;d?(S=t*.5,k=ge(a+c,-y-c,o),m=0,x=v,b=u,p=0):(S=ge(-c,t+y+c,o),k=s*.38,m=-v,x=0,b=0,p=u);let w=(M,A)=>{let C=c*(1-M*.07),L=.5+.5*Math.sin(i*.011+M*.7+A);g(S+m*M+b*A,k+x*M+p*A,C,L,d)};w(0,0);for(let M=1;M<=h;M++)w(M,-1),w(M,1);e.restore()}function wi(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),ur(r,i,n,0,l,0,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=T.migrateDelayMs,h=T.migrateFlyMs,v=T.migrateRestMs;d>=c+h+v&&o();let u=0;d>c&&(u=Math.min(1,(d-c)/h));let y=0;u<.16?y=u/.16*.26:u<.78?y=.26+(u-.16)/.62*.48:y=.74+(u-.78)/.22*.26,(t.climax||d>=c+h)&&(y=1),ur(r,i,n,y,l,d,X(e))}}function vi(e){let t=T.breakBuildMs,a=T.breakHoldMs,o=T.breakCrashMs,r=T.breakWashMs,i=T.breakRestMs;if(e<t){let n=Math.min(1,e/t);return{amp:Math.pow(n,2.2),foam:n*.06,done:!1}}if(e<t+a)return{amp:1,foam:.1,done:!1};if(e<t+a+o){let n=(e-t-a)/o;return{amp:1-n*.35,foam:.1+.9*n,done:!1}}if(e<t+a+o+r){let n=(e-t-a-o)/r;return{amp:Math.max(0,.65*(1-n)),foam:Math.max(0,1-n),done:!1}}return{amp:0,foam:0,done:e>=t+a+o+r+i}}function hr(e,t,a,o,r,i){i=i||K("breaker");let n=a*(r.wide?.42:r.tall?.38:.4),s=a*(r.wide?.9:.88),l=Math.min(1,Math.max(0,o.amp)),d=Math.min(1,Math.max(0,o.foam)),c=28,h=a*(r.wide?.36:.5);if(e.fillStyle=i.sky,e.fillRect(0,0,t,n),e.fillStyle=i.sea,e.fillRect(0,n,t,s-n),e.fillStyle=i.sand,e.fillRect(0,s,t,a-s),e.fillStyle="rgba(0,0,0,0.22)",e.fillRect(0,n,t,1),l<.02&&d<.04)return;let v=m=>m/c*t,u=m=>{let x=m/c,b=.78+.22*Math.sin(x*Math.PI);return h*l*b},y=m=>n-u(m),g=n+a*.012;e.beginPath(),e.moveTo(0,g);for(let m=0;m<=c;m++)e.lineTo(v(m),y(m));e.lineTo(t,g),e.closePath();let S=e.createLinearGradient(0,n-h,0,g);S.addColorStop(0,i.sea),S.addColorStop(.28,i.wave),S.addColorStop(1,i.sea),e.fillStyle=S,e.fill();let k=Math.max(3.5,a*(.022+l*.028));e.beginPath();for(let m=0;m<=c;m++){let x=y(m)-k*.2+Math.sin(m*1.35)*k*.12;m===0?e.moveTo(v(m),x):e.lineTo(v(m),x)}for(let m=c;m>=0;m--)e.lineTo(v(m),y(m)+k*.85);if(e.closePath(),e.fillStyle=Ha(i.foam,.62+l*.38),e.fill(),d>.12){let m=Math.min(1,(d-.12)/.88);e.beginPath(),e.moveTo(0,y(0)+k);for(let x=1;x<=c;x++)e.lineTo(v(x),y(x)+k);for(let x=c;x>=0;x--)e.lineTo(v(x),ge(y(x)+k,g,m));e.closePath(),e.fillStyle=Ha(i.foam,.35+m*.55),e.fill()}}function xi(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),hr(r,i,n,{amp:0,foam:0},l,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=vi(d);c.done&&o(),hr(r,i,n,t.climax?{amp:0,foam:0}:c,l,X(e))}}function Mi(e){let t=T.calveLookMs,a=T.calvePeelMs,o=T.calveDropMs,r=T.calveSplashMs,i=T.calveSettleMs,n=T.calveRestMs;if(e<t)return{peel:0,fall:0,splash:0,done:!1};if(e<t+a)return{peel:(e-t)/a,fall:0,splash:0,done:!1};if(e<t+a+o){let s=(e-t-a)/o;return{peel:1,fall:s*s,splash:s>.8?(s-.8)/.2:0,done:!1}}if(e<t+a+o+r){let s=(e-t-a-o)/r;return{peel:1,fall:1,splash:Math.sin(s*Math.PI),done:!1}}return e<t+a+o+r+i?{peel:1,fall:1,splash:.12*(1-(e-t-a-o-r)/i),done:!1}:{peel:1,fall:1,splash:0,done:e>=t+a+o+r+i+n}}function mr(e,t,a,o,r,i){i=i||K("calve");let n=a*(r.wide?.7:.72),s=o.peel,l=o.fall,d=o.splash,c=t*.36,h=t*.64,v=a*(r.wide?.2:.18),u=a*.07,y=h-c,g=n-u,S=s>.02||l>.01,k=S?s*t*.012:0,m=Math.min(1,s*.75+l*.2),x=(c+h)*.5,b=ge(0,n-g*.22-u,l),p=m*y*.2;e.fillStyle=i.sky,e.fillRect(0,0,t,n),e.fillStyle=i.water,e.fillRect(0,n,t,a-n),e.beginPath(),e.moveTo(0,n),e.lineTo(t*.04,a*.4),e.lineTo(t*.15,a*.14),e.lineTo(t*.26,a*.22),e.lineTo(c-k,v),e.lineTo(c-k,n),e.closePath(),e.fillStyle=i.iceShade,e.fill(),e.beginPath(),e.moveTo(h+k,n),e.lineTo(h+k,v),e.lineTo(t*.74,a*.12),e.lineTo(t*.86,a*.2),e.lineTo(t*.97,a*.38),e.lineTo(t,n),e.closePath(),e.fillStyle=i.ice,e.fill();let w=()=>{e.beginPath(),e.moveTo(c-p,v+b),e.lineTo(x,u+b),e.lineTo(h+p,v+b),e.lineTo(h-y*.06+p*.25,n+b),e.lineTo(c+y*.06-p*.25,n+b),e.closePath()};w(),e.fillStyle=S?i.ice:i.iceShade,e.fill(),e.save(),e.beginPath(),e.rect(0,n,t,a-n),e.clip(),w(),e.fillStyle=i.under,e.fill(),e.restore(),d>.05&&(e.fillStyle=`rgba(236,246,252,${.5+d*.5})`,e.beginPath(),e.moveTo(x-y,n),e.lineTo(x,n-a*(.1+d*.28)),e.lineTo(x+y,n),e.closePath(),e.fill())}function ki(e,t,a){if(!t)return;let o=()=>{t.climax||a.onReveal()};Re(e,o),t.paint2d=(r,i,n)=>{let s=i/Math.max(1,n),l={aspect:s,wide:s>2.4,tall:s<.6};if(!t.visible){t.journeyAt=0,a.onReset(),mr(r,i,n,{peel:0,fall:0,splash:0},l,X(e));return}t.journeyAt||(t.journeyAt=performance.now());let d=performance.now()-t.journeyAt,c=Mi(d);c.done&&o(),mr(r,i,n,t.climax?{peel:1,fall:1,splash:0}:c,l,X(e))}}var Ci={horizon:fi,sundown:ui,storm:mi,aurora:bi,erupt:yi,migrate:wi,breaker:xi,calve:ki};function Oa(e,t,a={}){let o=Ci[e?.dataset.play];return!o||!t?!1:(o(e,t,{onReveal:a.onReveal||(()=>{}),onReset:a.onReset||(()=>{})}),!0)}function Si(e,t={}){let a=t.canvas||e?.querySelector("canvas");if(!e||!a)return!1;let o={visible:!0,climax:!1,journeyAt:0,paint2d:null};if(!Oa(e,o,{onReveal(){if(t.loop){o.climax=!1,o.journeyAt=0;return}o.climax||(o.climax=!0,t.onReveal?.())},onReset(){o.climax=!1,o.journeyAt=0}}))return!1;let i=Number(t.dpr)>0?Number(t.dpr):2.5,n=null,s=0,l=!1,d=()=>{if(l||!e.isConnected)return;let c=a.clientWidth|0,h=a.clientHeight|0;if(c>=2&&h>=2){let v=Math.max(2,Math.round(c*i)),u=Math.max(2,Math.round(h*i));(a.width!==v||a.height!==u)&&(a.width=v,a.height=u,n=null),n||(n=a.getContext("2d",{alpha:!1})),o.paint2d?.(n,v,u)}s=requestAnimationFrame(d)};return s=requestAnimationFrame(d),()=>{l=!0,cancelAnimationFrame(s)}}typeof window<"u"&&(window.bootPlay2D=Si,window.dispatchEvent(new Event("play-2d-ready")));var Pi="babylon-ads-asset-lib",oa="files",gr="thumbs";function Va(){let e=He("assets/3d/","/assets/3d/");return e.endsWith("/")?e:`${e}/`}var vr=new Set(["glb","gltf","obj"]),Ai=new Set(["mtl","bin","png","jpg","jpeg","webp","bmp","tga"]);function _a(e=""){let t=String(e).toLowerCase().match(/\.([a-z0-9]+)$/);return t?t[1]:""}function xr(e){let t=_a(e);return vr.has(t)||Ai.has(t)}function yr(e){return vr.has(_a(e))}function zi(){return new Promise((e,t)=>{let a=indexedDB.open(Pi,2);a.onupgradeneeded=()=>{a.result.objectStoreNames.contains(oa)||a.result.createObjectStore(oa,{keyPath:"id"}),a.result.objectStoreNames.contains(gr)||a.result.createObjectStore(gr)},a.onsuccess=()=>e(a.result),a.onerror=()=>t(a.error)})}function $i(e){return new Promise((t,a)=>{e.onsuccess=()=>t(e.result),e.onerror=()=>a(e.error)})}async function Li(e){let t=await zi(),a=await $i(t.transaction(oa,"readonly").objectStore(oa).get(e));return t.close(),a?.buffer?new File([a.buffer],a.name,{type:a.type,lastModified:a.lastModified}):null}function wr(e=""){return String(e).replace(/\.[^.]+$/,"").toLowerCase()}async function Ti(e){let t=await Ei(e);if(!t)return null;if(t.kind==="file")return t.file;let a=await fetch(t.url);if(!a.ok)return null;let o=await a.arrayBuffer();return new File([o],t.name,{type:t.fileType||"",lastModified:e.lastModified||Date.now()})}async function Mr(e,t=[]){if(!e||!yr(e.name))return[];let a=wr(e.name),o=t.filter(i=>i.id!==e.id&&!yr(i.name)&&wr(i.name)===a),r=[];for(let i of[e,...o]){let n=await Ti(i);n&&r.push(n)}return r}async function Ei(e){if(!e)return null;if(e.source==="folder"&&e.url)return{kind:"url",url:e.url,name:e.name};let t=await Li(e.id);return t?{kind:"file",file:t,name:t.name}:null}function kr(e,t=0){return{id:`folder:${e}`,name:e,ext:_a(e),size:t,source:"folder",url:`${Va()}${encodeURIComponent(e)}`,added:0}}async function Ii(){let e=await fetch(`${Va()}manifest.json`,{cache:"no-store"});if(!e.ok)return[];let t=await e.json();return(Array.isArray(t?.files)?t.files:[]).map(o=>typeof o=="string"?{name:o}:o).filter(o=>o?.name&&xr(o.name)).map(o=>kr(o.name,o.size||0))}async function Ri(){let e=await fetch(Va(),{cache:"no-store"});if(!e.ok)return[];let t=await e.text(),a=new Set;for(let o of t.matchAll(/href=["']([^"'?#]+)["']/gi)){let r=decodeURIComponent(o[1].split("/").pop()||"");r&&r!=="manifest.json"&&xr(r)&&a.add(r)}return[...a].sort((o,r)=>o.localeCompare(r,"es")).map(o=>kr(o))}async function Cr(){let e=new Map;try{for(let t of await Ii())e.set(t.name.toLowerCase(),t)}catch{}try{for(let t of await Ri())e.has(t.name.toLowerCase())||e.set(t.name.toLowerCase(),t)}catch{}return[...e.values()].sort((t,a)=>t.name.localeCompare(a.name,"es"))}function O(e){return 1-(1-Math.min(1,Math.max(0,e)))**3}function Je(e,t=3){return Math.min(1,Math.max(0,e))**t}function Oe(e){let t=Math.min(1,Math.max(0,e));return t<.5?4*t*t*t:1-(-2*t+2)**3/2}function z(e,t,a){return a<=t?e>=a?1:0:Math.min(1,Math.max(0,(e-t)/(a-t)))}function Z(e,t,a){return e+(t-e)*a}function Ua(e){return e==="space"?7600:e==="star"||e==="cheer"?5800:e==="turn"?4400:e==="torch"||e==="torch-front"||e==="ball"?4e3:e==="toy"?3800:3600}function Fi(e,t,a,o){let r=Math.sqrt(2*t/a);if(e<=r)return{y:Math.max(0,t-.5*a*e*e),squash:e>r-.045?.2:0,spin:e*3.2};let i=r,n=a*r;for(let s=0;s<6;s+=1){n*=o;let d=2*(n/a);if(n*n/(2*a)<.012)break;if(e<=i+d){let h=e-i,v=Math.min(h,d-h);return{y:Math.max(0,n*h-.5*a*h*h),squash:v<.05?.16*(1-v/.05):0,spin:r*3.2+e*5.4}}i+=d}return{y:0,squash:0,spin:r*3.2+i*5.4}}function ft(e,t,a){let o={x:0,y:a,z:0,rx:0,ry:.28,rz:0,sx:1,sy:1,sz:1,camA:0,camR:1,punch:0,star:0,starSpin:0};if(e==="toy"){if(t<.12){let n=t/.12;return o.ry=.2+Math.sin(n*28)*.05*(1-n),o.rx=.08,o}let r=[[.12,.3,.26],[.3,.48,.22],[.48,.66,.16],[.66,.82,.09]];for(let n=0;n<r.length;n+=1){let[s,l,d]=r[n];if(t<l){let c=z(t,s,l),h=Math.sin(c*Math.PI);o.y=a+h*d,o.x=n*.07+c*.07-.08,o.rx=.22*h,o.ry=.2+n*.35+c*.35;let u=(c<.14?1-c/.14:c>.84?(c-.84)/.16:0)*.18;return o.sy=1-u,o.sx=1+u*.45,o.sz=1+u*.45,h<.08&&(o.y=a*o.sy),o}}let i=O(z(t,.82,1));return o.x=.2*(1-i),o.rx=.06*(1-i),o.ry=1.55+i*.12,o}if(e==="torch"||e==="torch-front"){let r=t<.5?Z(-.72,.78,Oe(z(t,.1,.42))):Z(.78,-.55,Oe(z(t,.54,.88))),i=e==="torch-front"?Math.PI:0;return o.y=.52,o.rx=.62+Math.sin(t*Math.PI)*.06,o.ry=i+r,o.rz=r*.08,o.camA=r*.12,o}if(e==="ball"){let i=a*.92;if(t<=.1)return o.y=1.72,o.rx=.2,o;let n=Fi((t-.1)*3.55,1.72-i,16.5,.58),s=n.squash;return o.y=i*(1-s)+n.y,o.x=O(z(t,.1,.92))*.28,o.rx=n.spin,o.ry=.4,o.sy=1-s,o.sx=1+s*.42,o.sz=1+s*.42,o}if(e==="turn"){let r=Oe(z(t,.06,.84)),i=O(z(t,.84,1));return o.y=a+.055,o.rx=.14,o.ry=r*Math.PI*2+i*.08,o.camA=Oe(t)*.42,o}if(e==="star"||e==="cheer"||e==="space"){let r=e==="space",i=.08,n=.18,s=.32,l=.38,d=r?.55:.68,c=.78,h=.86,v=.93,u=.28,y=-.62,g=a+.78,k=u+2.25*Math.PI*2,m=2.04,x=0;if(t<n?x=(t<i?O(z(t,0,i)):1)*.24:t<s?x=Z(.24,-.18,O(z(t,n,s))):t<d||r?x=Z(-.18,0,O(z(t,s,l))):t<c?x=0:t<h&&(x=Math.sin(z(t,c,h)*Math.PI)*.22),o.sy=1-x,o.sx=1+x*(x>=0?.48:.32),o.sz=o.sx,t<n)o.y=a*o.sy;else if(t<s)o.y=Z(a*.76,g,O(z(t,n,s)));else if(r){let p=z(t,s,1);o.y=g+.1*O(Math.min(1,p*1.15))+Math.sin(p*Math.PI*1.1)*.03*(1-p)}else t<d?o.y=g+Math.sin(z(t,s,d)*Math.PI)*.035:t<c?o.y=Z(g,a,Je(z(t,d,c),2.15)):t<h?o.y=a*o.sy:o.y=a;if(t<i)o.ry=Z(u,y,Oe(z(t,0,i)));else if(t<n)o.ry=y;else if(t<l)o.ry=Z(y,u,O(z(t,n,l)));else if(t<d){let p=z(t,l,d),w=r?p<.22?Je(p/.22,2.1)*.32:.32+(p-.22)/.78*1.72:p<.2?Je(p/.2,2.1)*.32:p<.76?.32+(p-.2)/.56*1.62:.32+1.62+O((p-.76)/.24)*.31;o.ry=u+w*Math.PI*2}else r?o.ry=u+(m+O(z(t,d,1))*1.4)*Math.PI*2:t<h?o.ry=k:o.ry=k+O(z(t,h,1))*.18;if(t<n)o.rx=.2*(t<i?O(z(t,0,i)):1);else if(t<l)o.rx=Z(.2,-.08,O(z(t,n,l)));else if(t<d)o.rx=-.08;else if(r){let p=O(z(t,d,1));o.rx=Z(-.08,.16,p),o.rz=Z(0,-.1,p)}else t<h?(o.rx=Z(-.08,.2,Je(z(t,d,c),2)),t>=c&&(o.rx=Z(.2,.04,z(t,c,h)))):o.rx=Z(.04,-.28,O(z(t,h,v)));(!r||t<d)&&(o.rz=0),o.star=t<n?0:O(z(t,n,s)),o.starSpin=o.star*(.2+z(t,n,1)*3.4);let b=r?t<n?0:O(z(t,n,s)):t<n?0:t<d?O(z(t,n,s)):1-Je(z(t,d,c),2);return o.camR=1+b*(r?.28:.2),o.camA=r?Oe(z(t,d,1))*.16:t<c?0:Oe(z(t,c,1))*.3,!r&&t>=c&&t<h&&(o.punch=Math.sin(z(t,c,h)*Math.PI)*.045),o}if(t<.16)return o.y=1.68,o.rx=.1,o.ry=.22,o;if(t<.4){let r=Je(z(t,.16,.4),2.6);return o.y=Z(1.68,a,r),o.rx=.1+r*.18,o.ry=.22+r*.12,o}if(t<.5){let r=z(t,.4,.5),i=Math.sin(r*Math.PI)*.26;return o.sy=1-i,o.sx=1+i*.55,o.sz=1+i*.55,o.y=a*o.sy,o.rx=.28*(1-r),o.ry=.34,o.punch=(1-r)*.07,o}if(t<.7){let r=z(t,.5,.7);o.y=a+Math.sin(r*Math.PI)*.3*(1-r*.35),o.rx=.05,o.ry=.34+r*.15;let n=(r>.82?(r-.82)/.18:r<.12?1-r/.12:0)*.14;return o.sy=1-n,o.sx=1+n*.4,o.sz=1+n*.4,n>0&&o.y<a+.06&&(o.y=a*o.sy),o}if(t<.84){let r=z(t,.7,.84);return o.y=a+Math.sin(r*Math.PI)*.1*(1-r),o.ry=.49+r*.08,o}return o.y=a,o.ry=.57+O(z(t,.84,1))*.22,o.rx=.04,o}function Di(e){return Ce(e?.dataset.handoff).id}function Sr(e,t){let a=Di(e);if(!e||a==="none")return 0;Co(e);let o=Ca(e.dataset.play,e.dataset.handoffTempo);e.style.setProperty("--handoff-beat",`${o}ms`),e.classList.add("is-handoff");let r=(s,l)=>{let d=setTimeout(s,l);return t?.(d),d},i={play:e.dataset.play,hms:e.dataset.handoffMs,hnb:e.dataset.handoffBands,hst:e.dataset.handoffStagger,hhd:e.dataset.handoffHold,hbt:e.dataset.handoffBeats,htm:e.dataset.handoffTempo};if(a==="pulse"){let s=Number(i.hbt)||4,l=720,d=520;return r(()=>{e.classList.add("is-handoff-hold"),r(()=>e.classList.add("is-handoff-done"),l+d)},s*o),s*o+l+d}if(a==="veil"){let s=_t(i);return r(()=>{e.classList.add("is-handoff-hold"),r(()=>e.classList.add("is-handoff-done"),s.outMs)},s.inMs+s.hold),s.total}let n=Sa(a,i);return r(()=>e.classList.add("is-handoff-done"),n),n}var R={particleCount:140,logoOnHover:!0,speeds:{rain:1.15,cubeSpin:.9,planetSpin:.35,textureScroll:22,scrollEase:8},colors:{particles:["#00f0c8","#6d7cff","#ff3cac","#f5f7ff"],cubeFaces:["#00f0c8","#6d7cff","#ff3cac","#ffd166","#7af7c5","#4cc9f0"],planet:{ocean:"#081428",land:"#00f0c8",cloud:"#6d7cff",glow:"#ff3cac"},scroll:{ring:"#6d7cff",core:"#00f0c8",needle:"#ff3cac"},clear:[.02,.03,.06]},fpsVisible:0,logicHz:60,logicMaxSteps:5,waterSubdivisions:180,mirrorSize:768,mirrorBlur:6,blitDpr:2.5,dropSegments:16,skySegments:20,propShadow:512,propShadowBlur:8,propSsao:!1,propFog:.018,propContact:1,propBounds:1,propLights:"full",climaxMs:2400,...T,propMs:3600,preEnterMs:2100,preExitMs:380,adRevealMs:780};var V=new Map,Pr=new Set([".glb",".gltf",".obj"]),Ni=new Set([".mtl",".png",".jpg",".jpeg",".webp",".bmp",".tga",".bin"]),bt=new Map,gt="",pt={url:"",name:"",ext:".glb",file:null,files:[],blobs:[]};function na(e){return`.${String(e||"").split(".").pop().toLowerCase()}`}function Ka(e){return(e||[]).map(t=>`${t.name}:${t.size}:${t.lastModified}`).join("|")}function Bi(e=""){return{tag:e,url:"",name:"",ext:".glb",file:null,files:[],prepared:{key:"",kind:"",data:null,ready:Promise.resolve(null)},warmed:"",warmToken:0}}function Dr(e,t){let a=[...t||[]],o=a.find(i=>Pr.has(na(i.name))),r=Bi(e);return o&&(r.file=o,r.files=[o,...a.filter(i=>{let n=na(i.name);return i!==o&&(Pr.has(n)||Ni.has(n))})],r.name=o.name,r.ext=na(o.name),r.url=o.name),r}function Xa(e){pt.url=e?.url||"",pt.name=e?.name||"",pt.ext=e?.ext||".glb",pt.file=e?.file||null,pt.files=e?.files||[]}function la(e){return e&&bt.get(e)||null}function at(){return la(gt)}function ji(e){return la(e?.dataset?.propTag)||at()}function Nr(e){if(!e?.tag){gt="",Xa(null);return}bt.set(e.tag,e),gt=e.tag,Xa(e)}function Ar(){let e=at();return{url:e?.url||"",name:e?.name||"",ext:e?.ext||".glb",extras:(e?.files||[]).filter(t=>t!==e.file).map(t=>t.name)}}function Br(e){let t=[...e||[]],a=t.length?`files:${Ka(t)}`:"";if(!a)return gt="",Xa(null),Ar();let o=bt.get(a);return o||(o=Dr(a,t),bt.set(a,o),vt(o)),Nr(o),Ar()}function vt(e){if(!e?.file)return e&&(e.prepared={key:"",kind:"",data:null,ready:Promise.resolve(null)}),Promise.resolve(null);let t=Ka(e.files);if(e.prepared.key===t)return e.prepared.ready;let a=e.ext===".obj"?"obj":e.ext===".glb"?"glb":"gltf",o=a==="obj"?e.file.text().then(r=>rs(r,e)):a==="glb"?e.file.arrayBuffer():e.file.text().then(r=>ss(r,e));return e.prepared={key:t,kind:a,data:null,ready:o},o.then(r=>{e.prepared.key===t&&(e.prepared.data=r)}).catch(()=>{}),o}function xt(e){return!e||st(e.play).id!=="prop"||!e.pmesh?"":e.pmesh.assetId?`asset:${e.pmesh.assetId}`:`idb:${e.id}:${e.pmesh.name}`}async function jr(e,{warmup:t=!0}={}){let a=xt(e);if(!e?.pmesh?.assetId)return"";let o=la(a);if(o)await o.prepared.ready;else{let r=await Cr(),i=r.find(s=>s.id===e.pmesh.assetId),n=i?await Mr(i,r):[];if(!n.length)return"";o=Dr(a,n),bt.set(a,o),await vt(o)}return Nr(o),t&&await ks(a),a}var ia=Na();var ie=null,ne=null,f=null,Qe=null,Wa=null,et=null;async function Hi(e){let t=[];for(let a of e.getChildMeshes?.()||[]){if(!a.getTotalVertices?.())continue;let o=a.material?.subMaterials||(a.material?[a.material]:[]);for(let r of o)r?.forceCompilationAsync&&t.push(r.forceCompilationAsync(a).catch(()=>{}))}await Promise.all(t)}function J(e){let t=String(e||"").replace("#","");return{r:parseInt(t.slice(0,2),16)/255||0,g:parseInt(t.slice(2,4),16)/255||0,b:parseInt(t.slice(4,6),16)/255||0,a:1}}function Oi(e){let t=J(e);return[Math.round(t.r*255),Math.round(t.g*255),Math.round(t.b*255)]}function qa(e,t){let[a,o,r]=Oi(e);return`rgba(${a},${o},${r},${t})`}function Ya(e,t=e?.dataset.play){return K(t,e?.dataset.pal)}function Vi(e){return e.metadata?.displayCanvas||e.getEngine().getRenderingCanvas()}function tt(e){let t=e.closest(".ad-slot")||e,a=e.closest(".ad-frame"),o=parseFloat(getComputedStyle(t).getPropertyValue("--ad-w"))||300,r=parseFloat(getComputedStyle(t).getPropertyValue("--ad-h"))||250,i=Math.max(2,Math.round((a||t).clientWidth||t.getBoundingClientRect().width||o)),n=Math.max(2,Math.round(i*r/o));a&&a.clientHeight<2&&(a.style.paddingBottom="0",a.style.height=`${n}px`),e.clientHeight<2&&(e.style.height=`${n}px`);let s=e.querySelector("canvas");return s&&s.clientHeight<2&&(s.style.width="100%",s.style.height=`${n}px`),{width:i,height:n}}function _i(e){return new Promise(t=>{tt(e);let a=e.closest(".ad-frame")||e,o=()=>(e.clientHeight>1||a.clientHeight>1)&&(e.clientWidth>1||a.clientWidth>1);if(o())return t();let r=new ResizeObserver(()=>{tt(e),o()&&(r.disconnect(),t())});r.observe(a),setTimeout(()=>{tt(e),r.disconnect(),t()},1200)})}function Ui(e){let t=Vi(e),a=t?.clientWidth||e.metadata?.w||300,o=t?.clientHeight||e.metadata?.h||250;return{w:a,h:o,aspect:a/Math.max(1,o)}}function qi(e){return!!V.get(e)?.visible}function Hr(e,t){e.addEventListener("click",t),e.addEventListener("keydown",a=>{(a.key==="Enter"||a.key===" ")&&t()}),e.tabIndex=0}function Or(e,t){return t.handoffTimer&&clearTimeout(t.handoffTimer),Sr(e,a=>{t.handoffTimer=a})}function Vr(e,t){t.climax||(t.climax=!0,e.classList.add("is-climax"),Or(e,t))}function Za(e,t){t.exitTimer&&(clearTimeout(t.exitTimer),t.exitTimer=0),t.handoffTimer&&(clearTimeout(t.handoffTimer),t.handoffTimer=0),t.climax=!1,t.adIn=!1,t.journeyAt=0,t.clockStarted=0,e.classList.remove("is-climax","is-pre-exit","is-ad-in","is-handoff","is-handoff-hold","is-handoff-done")}function zr(e,t,a){let o=V.get(e.id);if(!o)return;let r=()=>{o.climax||Vr(e,o)};Hr(e,r),t.onBeforeRenderObservable.add(()=>{if(!(o.frozen||o.paused)){if(!o.visible){Za(e,o);return}if(e.dataset.play==="prop"){if(o.waitProp&&!o.propReady||o.propRewind)return;if(typeof o.propT=="number"){o.propT>=1&&r();return}}o.clockStarted||(o.clockStarted=performance.now()),performance.now()-o.clockStarted>=a&&r()}})}function Gi(e,t){e.dataset.play==="pre-enter"?Xi(e,t):e.dataset.play==="prop"?zr(e,t,Ua(e.dataset.propAct)):zr(e,t,R.climaxMs)}function Xi(e,t){let a=V.get(e.id);if(!a)return;let o=()=>{if(a.adIn||a.exitTimer)return;e.classList.add("is-pre-exit");let r=Math.max(R.preExitMs,Or(e,a));a.exitTimer=setTimeout(()=>{a.exitTimer=0,a.adIn=!0,e.classList.add("is-ad-in")},r)};Hr(e,o),t.onBeforeRenderObservable.add(()=>{if(!(a.frozen||a.paused)){if(!a.visible){Za(e,a);return}a.clockStarted||(a.clockStarted=performance.now()),performance.now()-a.clockStarted>=R.preEnterMs&&o()}})}function Wi(e){return 1-(1-Math.min(1,Math.max(0,e)))**3}function ht(e,t,a){return e+(t-e)*a}function Yi(e,t,a){if(!e)return t;let o={...t};for(let r of Object.keys(t))typeof t[r]=="number"&&(o[r]=ht(e[r]??t[r],t[r],a));return o}function _r(e){let{w:t,h:a,aspect:o}=Ui(e);return{aspect:o,wide:o>2.4,tall:o<.6}}function Ur(e,t){let a=e.getContext(),o=a.createLinearGradient(0,0,0,512);o.addColorStop(0,t.skyTop),o.addColorStop(.42,t.skyMid),o.addColorStop(.55,t.skyHorizon),o.addColorStop(.68,t.skyDeep),o.addColorStop(1,t.skyDeep),a.fillStyle=o,a.fillRect(0,0,512,512);let r=a.createRadialGradient(360,210,4,360,210,90);r.addColorStop(0,qa(t.sun,.95)),r.addColorStop(.2,qa(t.sun,.45)),r.addColorStop(1,qa(t.sun,0)),a.fillStyle=r,a.fillRect(0,0,512,512),a.fillStyle="rgba(255,255,255,0.14)";for(let i of[[120,160,90],[210,140,70],[400,170,80]])a.beginPath(),a.ellipse(i[0],i[1],i[2],i[2]*.38,0,0,Math.PI*2),a.fill();e.update()}function Ki(e,t){let a=new f.DynamicTexture("sky",{width:512,height:512},e,!1);return Ur(a,t||K("climax")),a}function Ga(e,t,a,o,r,i){if(t<=0)return 0;let n=e-t*a,s=Math.exp(-(n*n)/(o*o))*Math.exp(-e*.12)*Math.exp(-t*.2);return Math.sin(e*r-t*14)*s*i}function Zi(e,t,a,o,r){let i=Math.sin(e*3.2+a*.9)*Math.sin(t*2.8+a*.7)*.012;if(r<.01)return i;let n=Math.hypot(e,t);return i+=Ga(n,o,1.7,.26,11,.11)*r,i+=Ga(n,o-.08,1.55,.18,18,.055)*r,i+=Ga(n,o-.16,1.4,.12,28,.028)*r,i+=Math.exp(-n*n*8)*-.07*Math.exp(-o*1.6)*r,i}function Ji(e,t){let a=Number(qt(e?.dataset.propCam));return t.tall?a*1.12:t.wide?a*.85:a}function Qi(e){let t=a=>{let o=Number(e?.dataset[a]);return Number.isFinite(o)&&o>0?Math.min(2.4,Math.max(.18,o)):.72};return{x:t("propSx"),y:t("propSy"),z:t("propSz")}}function es(e){e.computeWorldMatrix(!0);let t=e.getWorldMatrix().clone();t.invert();let a=null,o=null;for(let r of e.getChildMeshes()){if(!r.getTotalVertices||r.getTotalVertices()<1||r.name==="__root__")continue;r.computeWorldMatrix(!0);try{r.refreshBoundingInfo(!0)}catch{r.refreshBoundingInfo()}let i=r.getBoundingInfo()?.boundingBox;if(!i)continue;let n=i.vectorsWorld||[i.minimumWorld,i.maximumWorld];for(let s of n){let l=f.Vector3.TransformCoordinates(s,t);a=a?f.Vector3.Minimize(a,l):l.clone(),o=o?f.Vector3.Maximize(o,l):l.clone()}}if(!a||!o){let r=e.getHierarchyBoundingVectors(!0),i=f.Vector3.TransformCoordinates(r.min,t),n=f.Vector3.TransformCoordinates(r.max,t);a=f.Vector3.Minimize(i,n),o=f.Vector3.Maximize(i,n)}return{min:a,max:o,center:a.add(o).scale(.5),size:o.subtract(a)}}function ts(e,t){e.position.setAll(0),e.rotationQuaternion=null,e.rotation.setAll(0),e.scaling.setAll(1),e.computeWorldMatrix(!0);let a=es(e),o=Math.max(a.size.x,a.size.y,a.size.z,.001),r=t/o;return{fitScale:r,half:Math.max(.08,a.size.y*r*.5),center:a.center.clone()}}function yt(e){return String(e||"").split(/[/\\]/).pop()}function as(e,t,a){let o=yt(t).replace(/[.*+?^${}()|[\]\\]/g,"\\$&");return e.replace(new RegExp(`(^|\\s)(?:\\./)?(?:\\S*/)?${o}(?=\\s|$)`,"gmi"),`$1${a}`)}function qr(e){return new Promise((t,a)=>{let o=new FileReader;o.onload=()=>t(String(o.result||"")),o.onerror=()=>a(o.error),o.readAsDataURL(e)})}function os(e){let t=new TextEncoder().encode(e),a="";for(let o of t)a+=String.fromCharCode(o);return`data:text/plain;base64,${btoa(a)}`}async function rs(e,t=at()){let a=t?.files||[],o=e.match(/^\s*mtllib\s+(\S+)/im);if(!o)return e.replace(/^\s*mtllib\s+\S+/gim,"");let r=a.find(n=>yt(n.name).toLowerCase()===yt(o[1]).toLowerCase());if(!r)return e.replace(/^\s*mtllib\s+\S+/gim,"");let i=await r.text();for(let n of a){let s=na(n.name);n===t.file||n===r||s===".mtl"||s===".obj"||(i=as(i,n.name,await qr(n)))}return e.replace(/^\s*mtllib\s+\S+/gim,`mtllib ${os(i)}`)}async function Gr(e){if(e===".obj"){let o=await import("https://esm.sh/@babylonjs/loaders@7.54.3/OBJ?external=@babylonjs/core"),r=o.OBJFileLoader;return r&&!f.SceneLoader.IsPluginForExtensionAvailable(".obj")&&f.SceneLoader.RegisterPlugin(new r),o}let t=await import("https://esm.sh/@babylonjs/loaders@7.54.3/glTF?external=@babylonjs/core"),a=t.GLTFFileLoader;return a&&!f.SceneLoader.IsPluginForExtensionAvailable(".gltf")&&f.SceneLoader.RegisterPlugin(new a),t}async function ns(e,t){let a=await Gr(".obj"),o=await vt(t);return new a.OBJFileLoader().importMeshAsync(null,e,o,"")}function is(e,t){if(!e||String(e).startsWith("data:"))return null;let a=yt(String(e).split("?")[0]).toLowerCase();return(t?.files||[]).find(o=>yt(o.name).toLowerCase()===a)||null}async function ss(e,t=at()){let a=JSON.parse(e);for(let o of[a.buffers,a.images])if(Array.isArray(o))for(let r of o){let i=is(r.uri,t);i&&(r.uri=await qr(i))}return a}function ls(e,t,a,o){return new Promise((r,i)=>{let n=(s,l)=>i(l||new Error("No se pudo leer el glTF"));e.loadFile(t,a,"",r,void 0,o,n)})}async function ds(e,t){let a=await Gr(t.ext),o=new a.GLTFFileLoader;o.validate=!1;let r=await vt(t);if(t.ext===".glb"){let i=await ls(o,e,new Uint8Array(r),!0);return o.importMeshAsync(null,e,i,"")}return o.importMeshAsync(null,e,{json:structuredClone(r),bin:null},"")}async function Xr(e,t,a,o=at()){if(!o?.file)return null;try{let r=o.ext===".obj"?await ns(e,o):await ds(e,o),i=new f.TransformNode("propImport",e);i.parent=t;let n=[...r.transformNodes||[],...r.meshes||[]];for(let l of n){if(!l||l===i)continue;let d=l;for(;d.parent&&d.parent!==e&&d.parent!==i;)d=d.parent;d!==i&&(d.parent=i)}let s=ts(i,.72);for(let l of r.lights||[])l.setEnabled(!1);if(hs(i),a)for(let l of i.getChildMeshes())l.getTotalVertices?.()>0&&(a.addShadowCaster(l),l.receiveShadows=!0);return{wrap:i,half:s.half,fitScale:s.fitScale,center:s.center}}catch(r){return console.warn("No se pudo cargar el modelo 3D",r),null}}function cs(e){let t=e?.dataset.propLight;return t==="spot"||t==="multi"?t:"none"}function fs(e){let t=Number(e?.dataset.propLint);return Number.isFinite(t)?Math.min(1,Math.max(.05,t)):.35}function ps(e){return Number(Zt(e?.dataset.propLdist))}function ye(e){return f.Light?.FALLOFF_STANDARD!=null&&(e.falloffType=f.Light.FALLOFF_STANDARD),e}function us(e,t){for(let a of e.getChildMeshes?.()||[]){let o=a.material?.subMaterials||(a.material?[a.material]:[]);for(let r of o)r&&t(r,a)}}function hs(e){us(e,(t,a)=>{t.maxSimultaneousLights=12,"disableLighting"in t&&(t.disableLighting=!1),"unlit"in t&&(t.unlit=!1),"usePhysicalLightFalloff"in t&&(t.usePhysicalLightFalloff=!1),"directIntensity"in t&&(t.directIntensity=Math.max(t.directIntensity||0,1.15)),a.receiveShadows=!0})}function $r(e,t){let o=new f.DynamicTexture(`${t}Tex`,{width:256,height:256},e,!1),r=o.getContext(),i=r.createRadialGradient(256*.5,256*.5,0,256*.5,256*.5,256*.5);i.addColorStop(0,"rgba(255,255,255,0.95)"),i.addColorStop(.28,"rgba(255,255,255,0.42)"),i.addColorStop(.62,"rgba(255,255,255,0.1)"),i.addColorStop(1,"rgba(255,255,255,0)"),r.clearRect(0,0,256,256),r.fillStyle=i,r.fillRect(0,0,256,256),o.hasAlpha=!0,o.update();let n=new f.StandardMaterial(`${t}Mat`,e);return n.disableLighting=!0,n.diffuseTexture=o,n.emissiveTexture=o,n.opacityTexture=o,n.useAlphaFromDiffuseTexture=!0,n.transparencyMode=f.Material.MATERIAL_ALPHABLEND,n.backFaceCulling=!1,n.emissiveColor=new f.Color3(1,.92,.74),n}function Lr(e,t,a,o){e.angle=t,"innerAngle"in e&&(e.innerAngle=t*a),e.exponent=o}function ms(e,t,a,o){e.position.copyFrom(t),o.copyFrom(a).subtractInPlace(t),!(o.lengthSquared()<1e-6)&&(o.normalize(),e.direction.copyFrom(o))}var sa=-Math.PI*.42,Tr={arriba:{h:0,v:80},frente:{h:0,v:36},detras:{h:180,v:36}},Fe={spot:{h:0,v:0},key:{h:-32,v:6},fill:{h:40,v:-12},rim:{h:168,v:4}};function bs(e){let t=Tr[Ut(e?.dataset.propLpos).id]||Tr.frente;return{h:t.h+Number(Jt(e?.dataset.propLhrot)),v:t.v+Number(Qt(e?.dataset.propLvrot))}}function ut(e,t,a,o,r,i,n){let s=Math.min(1.48,Math.max(.08,r*Math.PI/180)),l=sa+o*Math.PI/180,d=Math.cos(s);i.set(t.x+Math.sin(l)*d*a,t.y+Math.sin(s)*a,t.z+Math.cos(l)*d*a),ms(e,i,t,n),e.range=a*2.6+2.4}function gs(e){let t=e.metadata.containerId,a=e.metadata.host||document.getElementById(t),o=J(a?.dataset.accent||"#00f0c8");e.clearColor=new f.Color4(.07,.075,.085,1);let r=R.propFog>5e-4;e.fogMode=r?f.Scene.FOGMODE_EXP2:f.Scene.FOGMODE_NONE,e.fogDensity=R.propFog,e.fogColor=new f.Color3(.07,.075,.085);let i=new f.ArcRotateCamera("cam",sa,1.12,4.1,new f.Vector3(0,.38,0),e);i.minZ=.05,i.fov=.52,i.inputs.clear();let n=a?.dataset.studioLights?Ea(f,e,i,{initial:Ta(a.dataset.studioLights),skyboxSize:48,ssao:R.propSsao}):null;n&&(e.fogMode=f.Scene.FOGMODE_NONE,ye(n.world),ye(n.key),ye(n.fill),ye(n.rim));let s=n?n.world:ye(new f.HemisphericLight("h",new f.Vector3(.2,1,.35),e));n||(s.diffuse=new f.Color3(.92,.93,.95),s.groundColor=new f.Color3(.18,.17,.16));let l=!n&&R.propLights==="simple",d=n?n.key:ye(new f.DirectionalLight("key",new f.Vector3(-.45,-.85,-.3),e));n||(d.position=new f.Vector3(2.2,5.4,1.6),d.diffuse=new f.Color3(1,.97,.92),d.setEnabled(!l));let c=n?n.rim:ye(new f.DirectionalLight("rim",new f.Vector3(.6,-.2,.7),e));n||(c.diffuse=new f.Color3(.55,.62,.75),c.intensity=.35,c.setEnabled(!l),l&&(s.intensity=.95));let h=f.MeshBuilder.CreateGround("floor",{width:10,height:10},e),v=new f.StandardMaterial("floorMat",e);v.diffuseColor=new f.Color3(.16,.16,.17),v.specularColor=new f.Color3(.06,.06,.06),v.maxSimultaneousLights=12,h.material=v,h.receiveShadows=R.propShadow>0&&!l;let u=f.MeshBuilder.CreateDisc("contact",{radius:.48,tessellation:28},e);u.rotation.x=Math.PI/2,u.position.y=.01;let y=new f.StandardMaterial("contactMat",e);y.diffuseColor=new f.Color3(0,0,0),y.specularColor=new f.Color3(0,0,0),y.emissiveColor=new f.Color3(0,0,0),y.alpha=.38,y.transparencyMode=f.Material.MATERIAL_ALPHABLEND,y.backFaceCulling=!1,u.material=y;let g=f.MeshBuilder.CreateCylinder("stand",{diameter:.95,height:.05,tessellation:32},e);g.position.y=.025;let S=new f.StandardMaterial("standMat",e);S.diffuseColor=new f.Color3(.22,.22,.23),S.specularColor=new f.Color3(.28,.28,.28),S.maxSimultaneousLights=12,g.material=S;let k=n?ye(new f.HemisphericLight("floorLite",new f.Vector3(.08,1,.12),e)):null;k&&(k.diffuse=new f.Color3(1,1,1),k.groundColor=new f.Color3(1,1,1),k.includedOnlyMeshes.push(h,g));let m=$=>{!$||$===k||$.includedOnlyMeshes?.length||$.excludedMeshes.includes(h)||$.excludedMeshes.push(h,g,u)},x=f.MeshBuilder.CreatePolyhedron("starTrophy",{type:1,size:.16},e),b=new f.StandardMaterial("starTrophyMat",e);b.diffuseColor=new f.Color3(1,.88,.32),b.specularColor=new f.Color3(1,.95,.62),b.emissiveColor=new f.Color3(.42,.3,.06),b.specularPower=96,x.material=b;let p=.72,w=p*.5,M=new f.TransformNode("propRoot",e),A=f.MeshBuilder.CreateBox("prop",{size:p},e);A.parent=M;let C=f.MeshBuilder.CreateSphere("propBall",{diameter:p*.92,segments:18},e);C.parent=M;let L=new f.StandardMaterial("propMat",e);L.diffuseColor=new f.Color3(.86,.78,.66),L.specularColor=new f.Color3(.22,.2,.18),L.specularPower=48,L.maxSimultaneousLights=12,L.emissiveColor=new f.Color3(o.r*.08,o.g*.08,o.b*.08),A.material=L;let N=new f.StandardMaterial("ballMat",e);N.diffuseColor=new f.Color3(.82,.28,.18),N.specularColor=new f.Color3(.35,.3,.28),N.specularPower=64,N.maxSimultaneousLights=12,C.material=N;let F=f.MeshBuilder.CreateCylinder("beamCone",{height:2.1,diameterTop:.04,diameterBottom:1.15,tessellation:20},e);F.parent=M,F.position.set(0,-.12,.95),F.rotation.x=Math.PI*.38;let ae=new f.StandardMaterial("beamConeMat",e);ae.disableLighting=!0,ae.emissiveColor=new f.Color3(1,.92,.72),ae.alpha=.13,ae.transparencyMode=f.Material.MATERIAL_ALPHABLEND,F.material=ae;let B=f.MeshBuilder.CreateDisc("pool",{radius:.95,tessellation:36},e);B.rotation.x=Math.PI/2,B.position.y=.012;let ee=$r(e,"pool");B.material=ee;let se=new f.SpotLight("propBeam",new f.Vector3(0,.05,.08),new f.Vector3(0,-.55,1),Math.PI/2.6,4,e);se.parent=M,se.diffuse=new f.Color3(1,.93,.75),Lr(se,Math.PI/2.6,.28,4),ye(se);let pe=new f.Vector3,oe=new f.Vector3,E=new f.Vector3,we=($,I,U,Me,me)=>{let _=new f.SpotLight($,new f.Vector3(0,2.6,-1.4),new f.Vector3(0,-1,.4),I,Me,e);return _.diffuse=me,_.intensity=0,_.setEnabled(!1),Lr(_,I,U,Me),ye(_)},ue=we("aimSpot",Math.PI/3.2,.22,3.2,new f.Color3(1,.94,.82)),ze=we("aimKey",Math.PI/2.8,.24,2.8,new f.Color3(1,.93,.84)),W=we("aimFill",Math.PI/2.4,.18,2.2,new f.Color3(.78,.86,1)),ot=we("aimRim",Math.PI/3.1,.2,3,new f.Color3(.72,.8,1)),Mt=we("aimFloor",Math.PI/2.35,.12,2.1,new f.Color3(1,.94,.82));for(let $ of[ue,ze,W,ot])$.excludedMeshes.push(h,u);Mt.includedOnlyMeshes.push(h,g);let ve=f.MeshBuilder.CreateDisc("aimPool",{radius:1.15,tessellation:36},e);ve.rotation.x=Math.PI/2,ve.position.y=.013;let kt=$r(e,"aimPool");ve.material=kt,ve.setEnabled(!1);let Ct=new f.Matrix,en=($,I,U)=>{let Me=U.x*.5,me=U.y*.5,_=U.z*.5;return I?me*.92*$.sy:(f.Matrix.RotationYawPitchRollToRef($.ry,$.rx,$.rz,Ct),Math.abs(Ct.m[1])*Me*$.sx+Math.abs(Ct.m[5])*me*$.sy+Math.abs(Ct.m[9])*_*$.sz)},De=null;if(R.propShadow>0&&!l)try{De=new f.ShadowGenerator(R.propShadow,d),De.useBlurExponentialShadowMap=R.propShadowBlur>0,De.blurKernel=R.propShadowBlur,De.addShadowCaster(A),De.addShadowCaster(C),De.addShadowCaster(x)}catch{}let he=null,St=1,ao=w,Pt=new f.Vector3(0,0,0),At=V.get(t),zt=ji(a);At&&(At.propTag=a?.dataset?.propTag||zt?.tag||"",At.waitProp=!!zt?.file,At.propReady=!zt?.file);let xe=0,le=0,Ne=0,oo="",Be=null,te=null;Xr(e,M,De,zt).then($=>{if($){if(e.isDisposed){$.wrap.dispose();return}he=$.wrap,St=$.fitScale,ao=$.half,$.center&&Pt.copyFrom($.center)}let I=V.get(t);I&&(I.propReady=!0,I.journeyAt=0)}),setTimeout(()=>{let $=V.get(t);$?.waitProp&&!$.propReady&&($.propReady=!0)},12e3),e.onBeforeRenderObservable.add(()=>{let $=_r(e),I=a?.dataset.propAct||"drop",U=I==="torch"||I==="torch-front",Me=I==="ball",me=!!he,_=n||U?"none":cs(a),q=_!=="none",Ve=q?fs(a):0,_e=q?ps(a):3.3,de=q?bs(a):{h:0,v:36},rt=Ve*(.85+.55*(3.3/_e)),je=Ya(a,"prop"),j=J(je.fog),$t=a?.dataset.propFlat==="1";if(n){n.syncFromHost(a),m(n.world),m(n.key),m(n.fill),m(n.rim);for(let Xe of n.extras||[])m(Xe);e.clearColor=new f.Color4(j.r,j.g,j.b,1);let H=n.env?.skybox,re=n.env?.skyboxMaterial;H&&H.setEnabled(!$t),!$t&&re?.primaryColor&&re.primaryColor.set(j.r,j.g,j.b),k&&(k.intensity=Math.max(.45,(n.getState().world||.7)*.95))}else{let H=l?.95:.62;s.intensity=U?.16:q?H*(1-.28*Ve):H,d.intensity=U||q?.1:.9,c.intensity=U||q?.05:.32}se.intensity=U?4.4:0;let $e=a?.dataset.propFloor!=="0",tn=.58+.42*Math.cos(Math.min(1.45,(q?de.v:36)*Math.PI/180));ue.setEnabled(_==="spot"),ze.setEnabled(_==="multi"),W.setEnabled(_==="multi"),ot.setEnabled(_==="multi"),Mt.setEnabled(q&&$e),ue.intensity=_==="spot"?16*rt:0,ze.intensity=_==="multi"?11*rt:0,W.intensity=_==="multi"?6.5*rt:0,ot.intensity=_==="multi"?8.5*rt:0,Mt.intensity=q&&$e?1.7*rt*tn:0,ve.setEnabled(q&&$e),A.setEnabled(!me&&!Me),C.setEnabled(!me&&Me),he?.setEnabled(me),h.setEnabled($e),u.setEnabled($e&&R.propContact===1),g.setEnabled($e&&I==="turn"),x.setEnabled(I==="star"),F.setEnabled(U),B.setEnabled(U&&$e);let da=J(je.floor),Ue=J(je.stand),ca=J(je.object),fa=J(je.ball),ke=J(je.beam),Y=J(Kt(a?.dataset.propLcol)),qe=J(je.star||"#ffe566"),pa=n?1:q?.68:1;v.diffuseColor.set(da.r*pa,da.g*pa,da.b*pa),v.specularColor.set(q?.02:.06,q?.02:.06,q?.02:.06),S.diffuseColor.set(Ue.r,Ue.g,Ue.b),S.emissiveColor.set(Ue.r*.08,Ue.g*.08,Ue.b*.08),L.diffuseColor.set(ca.r,ca.g,ca.b),N.diffuseColor.set(fa.r,fa.g,fa.b),ae.emissiveColor.set(ke.r,ke.g,ke.b),ee.emissiveColor.set(ke.r,ke.g,ke.b),kt.emissiveColor.set(Y.r,Y.g,Y.b),ue.diffuse.set(Y.r,Y.g,Y.b),ze.diffuse.set(Y.r,Y.g*.98,Y.b*.9),W.diffuse.set(Y.r*.78+.16,Y.g*.86+.1,Math.min(1,Y.b*1.08+.08)),ot.diffuse.set(Y.r*.7+.1,Y.g*.8+.12,Math.min(1,Y.b*1.14+.1)),b.diffuseColor.set(qe.r,qe.g,qe.b),b.emissiveColor.set(qe.r*.48,qe.g*.38,qe.b*.1),se.diffuse.set(ke.r,ke.g,ke.b),n?$t&&(e.fogMode=f.Scene.FOGMODE_NONE,e.clearColor=new f.Color4(j.r,j.g,j.b,1)):(e.fogColor.set(j.r,j.g,j.b),e.clearColor=$t||!U&&!q?new f.Color4(j.r,j.g,j.b,1):U?new f.Color4(j.r*.35,j.g*.35,j.b*.4,1):new f.Color4(j.r*.55,j.g*.55,j.b*.58,1));let G=V.get(t),ro=!!(G?.paused||G?.frozen);G?.propRewind&&(G.propRewind=!1,xe=0,le=0,Ne=0,Be=null,te=null,G.propT=0,G.journeyAt=0);let an=Ua(I)/1e3,Q=Qi(a);if(A.scaling.set(Q.x/p,Q.y/p,Q.z/p),C.scaling.set(Q.x/p,Q.y/p,Q.z/p),he){let H=Q.x/p,re=Q.y/p,Xe=Q.z/p;he.scaling.set(St*H,St*re,St*Xe),Yt(a?.dataset.propCog)==="1"?he.position.set(-Pt.x*he.scaling.x,-Pt.y*he.scaling.y,-Pt.z*he.scaling.z):he.position.setAll(0)}let Ge=me?ao*(Q.y/p):Q.y*.5,nt=1/R.logicHz,on=!!(G?.waitProp&&!G.propReady),no=(!!G?.visible||ro)&&!on;if(!no)xe=0,le=0,Ne=0,Be=null,te=null,G&&(G.journeyAt=0,G.propT=0);else{let H=performance.now();if(Ne||(Ne=H),ro)Ne=H,te||(te=ft(I,le,Ge),Be=te);else{let re=(H-Ne)/1e3;Ne=H,re>.25&&(re=.25),I!==oo&&(oo=I,xe=0,le=0,Be=null,te=null),xe+=re;let Xe=0;for(te||(te=ft(I,0,Ge),Be=te);xe>=nt&&Xe<R.logicMaxSteps;)Be=te,le=Math.min(1,le+nt/an),te=ft(I,le,Ge),xe-=nt,Xe+=1;xe>nt*R.logicMaxSteps&&(xe=0)}G&&(G.propT=le,G.journeyAt||(G.journeyAt=H))}let rn=!no||!te||le>=1?1:xe/nt,P=Yi(Be,te||ft(I,0,Ge),rn),nn=Number(Ze(a?.dataset.propRhrot))*Math.PI/180,sn=Number(Ze(a?.dataset.propRvrot))*Math.PI/180;P.ry+=nn,P.rx+=sn;let io=en(P,Me,me?{x:Q.x,y:Ge*2,z:Q.z}:Q)+.012;P.y=Math.max(P.y,io),M.position.set(P.x,P.y,P.z),M.rotation.set(P.rx,P.ry,P.rz),M.scaling.set(P.sx,P.sy,P.sz),q&&(oe.set(P.x,Math.max(.22,P.y),P.z),_==="spot"?(ut(ue,oe,_e,de.h+Fe.spot.h,de.v+Fe.spot.v,E,pe),ve.position.set(P.x,.013,P.z),ve.scaling.setAll(1.05+Ve*.22),kt.alpha=.08+Ve*.1):(ut(ze,oe,_e,de.h+Fe.key.h,de.v+Fe.key.v,E,pe),ut(W,oe,_e,de.h+Fe.fill.h,de.v+Fe.fill.v,E,pe),ut(ot,oe,_e,de.h+Fe.rim.h,de.v+Fe.rim.v,E,pe),ve.position.set(P.x,.013,P.z),ve.scaling.setAll(1.2+Ve*.28),kt.alpha=.06+Ve*.08),$e&&ut(Mt,oe,_e,de.h,de.v,E,pe));let so=Math.max(0,P.y-io);if(u.position.x=P.x,u.position.z=P.z,u.scaling.setAll((Me?.48:.7)+so*1.05),y.alpha=.4/(1+so*2.6),U){let re=I==="torch-front"?P.ry-Math.PI:P.ry;B.position.x=P.x+Math.sin(P.ry)*1.55,B.position.z=P.z+Math.cos(P.ry)*1.55,B.scaling.setAll(.85+Math.abs(re)*.15),ae.alpha=.08+.07*Math.min(1,le/.12),ee.alpha=.18+.16*Math.min(1,le/.12)}if(I==="star"){let H=Math.max(0,P.star);x.position.set(P.x,P.y+Ge*P.sy+.26+Math.sin(P.starSpin*1.2)*.025,P.z),x.rotation.set(.32,P.starSpin,.08),x.scaling.set(H*.78,H,H*.78)}i.radius=Ji(a,$)*(1-P.punch)*(P.camR||1);let ua=Wt(a?.dataset.propCamMode)==="pan",ln=ua?0:Number(Gt(a?.dataset.propCamH))*Math.PI/180,dn=ua?0:Number(Xt(a?.dataset.propCamV))*Math.PI/180;i.alpha=sa+P.camA+ln;let cn=($.wide?1.22:1.12)+P.punch*.4-((P.camR||1)-1)*.7;i.beta=Math.min(Math.PI-.12,Math.max(.12,cn+dn)),i.fov=$.tall?.48:$.wide?.4:.52;let lo=P.x*.35,co=I==="star"||I==="cheer"||I==="space"?.14+P.y*.55:Math.min(.55,P.y*.45+.22);if(ua){let H=Number(Ke(a?.dataset.propCamPx)),re=Number(Ke(a?.dataset.propCamPy));i.target.x=lo-Math.cos(i.alpha)*H,i.target.y=co+re,i.target.z=Math.sin(i.alpha)*H}else i.target.x=lo,i.target.y=co,i.target.z=0})}function ys(e){let t=e.metadata.containerId,a=document.getElementById(t),o=a?.dataset.play||"climax",r=J(a?.dataset.accent||"#7ec8e8"),i=Ya(a,o),n=J(i.skyDeep);e.clearColor=new f.Color4(n.r*.25,n.g*.25,n.b*.35,1);let s=new f.ArcRotateCamera("cam",-Math.PI/2,.74,2.85,new f.Vector3(0,.04,.1),e);s.minZ=.03,s.maxZ=80,s.fov=.64,s.inputs.clear();let l=new f.DirectionalLight("sun",new f.Vector3(-.55,-.65,-.35),e);l.intensity=1.15,l.diffuse=new f.Color3(1,.94,.82);let d=new f.HemisphericLight("skyLight",new f.Vector3(.2,1,.3),e);d.intensity=.45,d.diffuse=new f.Color3(.72,.84,.9),d.groundColor=new f.Color3(.04,.07,.08);let c=f.MeshBuilder.CreateSphere("sky",{diameter:46,segments:R.skySegments},e);c.infiniteDistance=!0;let h=new f.StandardMaterial("skyMat",e);h.backFaceCulling=!1,h.disableLighting=!0,h.emissiveTexture=Ki(e,i),h.emissiveColor=new f.Color3(1,1,1),c.material=h;let v=f.MeshBuilder.CreateGround("water",{width:6.4,height:6.4,subdivisions:R.waterSubdivisions,updatable:!0},e),u=new f.StandardMaterial("waterMat",e),y=J(i.water);u.diffuseColor=new f.Color3(y.r,y.g,y.b),u.specularColor=new f.Color3(1,1,1),u.specularPower=96,u.alpha=.92,u.transparencyMode=f.Material.MATERIAL_ALPHABLEND,u.backFaceCulling=!1;let g=new f.MirrorTexture("waterMirror",R.mirrorSize,e,!0);g.mirrorPlane=new f.Plane(0,-1,0,0),g.adaptiveBlurKernel=R.mirrorBlur,g.level=.82,g.renderList=[c],u.reflectionTexture=g;let S=new f.FresnelParameters;S.bias=.12,S.power=2.4,S.leftColor=f.Color3.White(),S.rightColor=new f.Color3(.12,.18,.2),u.reflectionFresnelParameters=S,v.material=u;let k=v.getVerticesData(f.VertexBuffer.PositionKind),m=new Float32Array(k),x=v.getIndices(),b=new Float32Array(m.length),p=f.MeshBuilder.CreateSphere("drop",{diameter:.16,segments:R.dropSegments},e),w=new f.StandardMaterial("dropMat",e);w.diffuseColor=new f.Color3(r.r*.25,r.g*.3,r.b*.35),w.emissiveColor=new f.Color3(r.r*.12,r.g*.14,r.b*.16),w.specularColor=new f.Color3(1,1,1),w.specularPower=180,w.alpha=.55,w.transparencyMode=f.Material.MATERIAL_ALPHABLEND,p.material=w,g.renderList.push(p);let M=(C,L,N)=>{for(let F=0;F<m.length;F+=3)m[F]=k[F],m[F+2]=k[F+2],m[F+1]=Zi(k[F],k[F+2],C,L,N);f.VertexData.ComputeNormals(m,x,b),v.updateVerticesData(f.VertexBuffer.PositionKind,m),v.updateVerticesData(f.VertexBuffer.NormalKind,b)},A=a?.dataset.pal;e.onBeforeRenderObservable.add(()=>{let C=Ya(a,o);if(A!==a?.dataset.pal){A=a?.dataset.pal,Ur(h.emissiveTexture,C);let W=J(C.skyDeep);e.clearColor=new f.Color4(W.r*.25,W.g*.25,W.b*.35,1)}let L=J(C.water);u.diffuseColor.set(L.r,L.g,L.b);let N=_r(e);s.radius=N.tall?3.35:N.wide?2.55:2.85,s.beta=N.wide?.9:.74,s.fov=N.tall?.56:N.wide?.44:.62;let F=N.wide?1.05:N.tall?1.4:1.25,ae=.06,B=V.get(t),ee=!!(B?.paused||B?.frozen);if(!B?.visible&&!ee){B&&(B.journeyAt=0),p.position.set(0,F,0),p.scaling.setAll(1),p.visibility=1,p.isVisible=!0,M(0,0,0);return}if(ee)return;B.journeyAt||(B.journeyAt=performance.now());let se=(performance.now()-B.journeyAt)/1e3,pe=o==="pre-enter"?R.preEnterMs:R.climaxMs,oe=Math.min(1.15,(performance.now()-B.journeyAt)/pe),E=Math.min(1,oe/.4),we=oe>=.4;p.position.set(0,ht(F,ae,E*E*E),0),p.scaling.setAll(1),p.visibility=1,p.isVisible=!0;let ue=0,ze=0;if(we){let W=Wi(Math.min(1,(oe-.4)/.16));p.scaling.set(ht(1,1.4,W),ht(1,.2,W),ht(1,1.4,W)),p.visibility=1-W,p.position.y=ae,p.isVisible=W<.98&&!B.climax&&!B.adIn,ue=B.climax||B.adIn?.65:1,ze=se-pe*.4/1e3}M(se,ze,ue)})}function wt(){let e=0;for(let t of V.values())t.visible&&(t.scene||t.paint2d)&&(e+=1);return e}var ws=!0;function vs(e,t){if(!ws||!t||document.hidden)return!1;let a=e.closest(".sticky-ad.hide-until-stuck");return!(a&&!a.classList.contains("is-stuck"))}function xs(e,t,a,o=!1){if(!e?.display||!o&&(!e.visible||e.frozen))return!1;let r=e.display,i=r.clientWidth|0,n=r.clientHeight|0;if(i<2||n<2||!o&&R.fpsVisible>0&&t-e.lastFrame<1e3/R.fpsVisible)return!1;e.lastFrame=t;let s=R.blitDpr,l=Math.max(2,Math.round(i*s)),d=Math.max(2,Math.round(n*s));return(r.width!==l||r.height!==d)&&(r.width=l,r.height=d,e.ctx=null),e.ctx||(e.ctx=r.getContext("2d",{alpha:!1})),e.paint2d?(e.paint2d(e.ctx,l,d),!0):!e.scene||!a?!1:((a.width!==l||a.height!==d)&&(a.style.width=`${i}px`,a.style.height=`${n}px`,ne.setSize(l,d)),e.scene.render(),e.ctx.drawImage(a,0,0,a.width||l,a.height||d,0,0,l,d),!0)}function Wr(){let e=()=>{if(document.hidden||!wt()){t=!1,a&&cancelAnimationFrame(a),a=0;try{ne?.stopRenderLoop()}catch{}return}let o=performance.now(),r=ne?.getRenderingCanvas?.()||null;for(let i of V.values())Ms(i,o),xs(i,o,r,!1);t&&!ne&&(a=requestAnimationFrame(e))},t=!1,a=0;return{startLoop(){t||document.hidden||!wt()||(t=!0,ne?ne.runRenderLoop(e):a=requestAnimationFrame(e))},stopLoop(){if(t){t=!1,a&&cancelAnimationFrame(a),a=0;try{ne?.stopRenderLoop()}catch{}}}}}var Er=!1;function Yr(){return ie||(ie=Wr()),Er||(Er=!0,document.addEventListener("visibilitychange",()=>{document.hidden?ie?.stopLoop():ie?.startLoop()})),ie}function Kr(e,t){let a=V.get(e.id),o=vs(e,t);if(e.classList.toggle("is-visible",o),!a||a.frozen)return;let r=a.visible;a.visible=o,o&&!r&&(a.lastFrame=0),o?Yr().startLoop():wt()||ie?.stopLoop()}function Ms(e,t){if(!e?.paused){e.pauseClock=0;return}if(!e.pauseClock){e.pauseClock=t;return}let a=t-e.pauseClock;e.pauseClock=t,e.journeyAt&&(e.journeyAt+=a),e.clockStarted&&(e.clockStarted+=a)}async function ks(e=gt){await Ja();let t=la(e)||at();if(!t?.file)return;let a=Ka(t.files);if(t.warmed===a)return;let o=++t.warmToken;if(await vt(t),o!==t.warmToken)return;let r=new f.Scene(ne);r.autoClear=!0;let i=new f.ArcRotateCamera("warmCam",sa,1.12,4.1,new f.Vector3(0,.38,0),r);i.minZ=.05,i.fov=.52,i.inputs.clear(),Ea(f,r,i,{ssao:!1,skyboxSize:48});let n=new f.TransformNode("warmRoot",r);try{let s=await Xr(r,n,null,t);if(o!==t.warmToken){r.dispose();return}if(s?.wrap){if(r.whenReadyAsync&&await Promise.race([r.whenReadyAsync(),new Promise(l=>setTimeout(l,8e3))]),o!==t.warmToken){r.dispose();return}await Hi(s.wrap);for(let l=0;l<3;l+=1)r.render()}if(r.dispose(),o!==t.warmToken)return;t.warmed=a}catch(s){r.dispose(),console.warn("No se pudo precalentar el modelo 3D",s)}}async function Ja(){if(ne)return;f=await import("https://esm.sh/@babylonjs/core@7.54.3");try{await import("https://esm.sh/@babylonjs/loaders@7.54.3/glTF?external=@babylonjs/core")}catch{}let e=document.createElement("canvas");e.width=300,e.height=250,e.setAttribute("aria-hidden","true"),Object.assign(e.style,{position:"fixed",left:"-4000px",top:"0",width:"300px",height:"250px",pointerEvents:"none"}),document.body.appendChild(e),ne=new f.Engine(e,!0,{antialias:!0,adaptToDeviceRatio:!1,preserveDrawingBuffer:!0,stencil:!1,powerPreference:"high-performance"}),ne.setHardwareScalingLevel(1),ie&&ie.stopLoop(),ie=Wr(),wt()&&ie.startLoop()}var Ir=Promise.resolve(),mt=0;function Cs(e){let t=Ir.then(e,e);return Ir=t.catch(()=>{}),t}function ra(e){return!!e&&!e.dead&&V.get(e.container?.id)===e}async function Zr(e){let t=V.get(e.id);if(!t||t.booted||t.booting||t.frozen||t.dead)return;t.booting=!0;let a=t.display,o=mt;try{if(await _i(e),o!==mt||!e.isConnected||!ra(t))return;let r=tt(e),i=Oa(e,t,{onReveal:()=>Vr(e,t),onReset:()=>Za(e,t)}),n=async()=>{if(o!==mt||!e.isConnected||!ra(t))return;let l=new f.Scene(ne);if(!ra(t)){l.dispose();return}l.metadata={displayCanvas:a,w:r.width,h:r.height,containerId:e.id,host:e},t.scene=l,e.dataset.play==="prop"?gs(l):ys(l),Gi(e,l)};if(i||(await Ja(),e.dataset.play==="prop"?await Cs(n):await n()),o!==mt||!e.isConnected||!ra(t)){t.scene&&t.dead&&(t.scene.dispose(),t.scene=null);return}e.querySelector(".ad-wave")&&Ba(e,ia);let s=e.querySelector(".ad-2d");s&&(Wa=dr(s,()=>ia,()=>null,()=>qi(e.id))),t.booted=!0,t.visible&&Yr().startLoop()}catch(r){console.error("No se pudo iniciar",e.id,r),e.classList.add("is-error")}finally{t.booting=!1}}function Ss(e){return e==null||e===""?"":String(typeof e=="object"?e.id||"":e)}function Rr(e){if(!e||e.dead)return;e.dead=!0,e.frozen=!0,e.visible=!1,e.booted=!1,e.exitTimer&&(clearTimeout(e.exitTimer),e.exitTimer=0),e.handoffTimer&&(clearTimeout(e.handoffTimer),e.handoffTimer=0);let t=e.container;t&&Qe?.unobserve(t),e.scene?.dispose(),e.scene=null,t?.id&&V.delete(t.id)}function Fr(){if(V.size){wt()||ie?.stopLoop();return}Wa?.(),Wa=null,Qe?.disconnect(),Qe=null,et&&(window.removeEventListener("resize",et),et=null),ie?.stopLoop()}function Jr(e){let t=Ss(e);if(t){let a=V.get(t);if(!a)return;Rr(a),Fr();return}mt+=1;for(let a of[...V.values()])Rr(a);Fr()}async function Qr(e=document){let t=[...e.querySelectorAll(".ad-container")];t.some(a=>!br(a.dataset.play))&&await Ja();for(let a of t){if(V.has(a.id))continue;let o=a.querySelector("canvas");V.set(a.id,{scene:null,visible:!1,frozen:!1,dead:!1,container:a,display:o,lastFrame:0,booted:!1,booting:!1})}Qe||(Qe=new IntersectionObserver(a=>{for(let o of a)o.isIntersecting&&Zr(o.target),Kr(o.target,o.isIntersecting)},{threshold:0,rootMargin:"120px"})),t.forEach(a=>Qe.observe(a)),et||(et=()=>document.querySelectorAll(".ad-container").forEach(tt),window.addEventListener("resize",et))}async function Qa(e){e&&(await Zr(e),Kr(e,!0),tt(e))}window.addEventListener("storage",e=>{e.key===Da&&(Object.assign(ia,Na()),document.querySelectorAll(".ad-container").forEach(t=>{t.querySelector(".ad-wave")&&Ba(t,ia)}))});function Ps(e,t=ta()){let a=String(e||"");return a?t.profiles.find(o=>o.id===a)||null:ar(t)}var As="babylon-play-request",zs="babylon-play-combo";function $s(e,t=ta(),a){let o=String(e||"");if(!o)return null;let i=(Ps(a,t)?.items||[]).find(n=>n.id===o);if(i)return Ae(i);for(let n of t.profiles||[]){let s=(n.items||[]).find(l=>l.id===o);if(s)return Ae(s)}return null}function Ls(e,t,a=2e3){return!window.parent||window.parent===window?Promise.resolve(null):new Promise(o=>{let r=setTimeout(()=>{window.removeEventListener("message",i),o(null)},a);function i(n){n.data?.type===zs&&(clearTimeout(r),window.removeEventListener("message",i),o(n.data.item?Ae(n.data.item):null))}window.addEventListener("message",i),window.parent.postMessage({type:As,id:e,profile:t||""},"*")})}async function Ts(e,t){let a=Ls(e,t,2500);try{let o=$s(e,await ir(),t);if(o)return o}catch{}return a}function Es(e,t=e?.ph){let a=Se(t);return a.style!=="play"?a:{...Ho(e?.play||"climax",e?.pal),img:a.img,fit:a.fit,fx:a.fx,fy:a.fy,fz:a.fz,fm:a.fm}}function Is(e,t){return e?{pal:e.pal,ph:Es(e,t!==void 0?t:e.ph),propAct:e.propAct,propCam:e.pcam,propCamH:e.pch,propCamV:e.pcv,propCamMode:e.pcm,propCamPx:e.ppx,propCamPy:e.ppy,propSx:e.psx,propSy:e.psy,propSz:e.psz,propLight:e.plight,propLint:e.plint,propFloor:e.pfloor,propFlat:e.pflat,propCog:e.pcog,propLcol:e.plcol,propLdist:e.pldist,propLpos:e.plpos,propLhrot:e.plhrot,propLvrot:e.plvrot,propRhrot:e.prh,propRvrot:e.prv,studioLights:Yo(e.studio),handoff:Ce(e.hand).id,hms:e.hms,hnb:e.hnb,hst:e.hst,hin:e.hin,hhd:e.hhd,hbt:e.hbt,htm:e.htm,htxt:e.htxt,hempty:e.hempty}:{}}async function Rs(e,t="prop.glb"){let a=await fetch(e);if(!a.ok)return"";let o=new File([await a.arrayBuffer()],t,{type:"model/gltf-binary"});return Br([o]),"url"}async function eo(e,{profileId:t,playId:a,slotId:o,origin:r,item:i,meshUrl:n}={}){if(!e)return null;r!=null&&it(r);let s=o||`ad-${a||i?.id||"ad"}`,l=i?Ae(i):await Ts(a,t);if(!l)return null;let d="";n&&await Rs(n,l?.pmesh?.name||"prop.glb")&&(d=xt(l)||"url"),d||(d=await jr(l));let c=jt(l.ad);e.style.setProperty("--ad-w",`${c.w}px`),e.style.setProperty("--ad-h",`${c.h}px`),e.innerHTML=qo(c,s,l.in||"none",l.play,Is(l)),e.querySelector(".ad-slot")?.classList.add("is-in");let h=e.querySelector(".ad-container");return h&&(d||xt(l))&&(h.dataset.propTag=d||xt(l)),await Qr(e),{item:l,slotId:s}}function to(e){Jr(e)}function Fs(){if(typeof document>"u"||document.getElementById("babylon-ads-player-css"))return;let e=document.createElement("style");e.id="babylon-ads-player-css",e.textContent=po,document.head.appendChild(e)}var Ds={setPlayerOrigin:it,getPlayerOrigin:Rt,mountPlay:eo,unmountPlay:to,startAd:Qa};typeof window<"u"&&(Fs(),window.BabylonAdsPlayer=Ds);return gn(Ns);})();
//# sourceMappingURL=babylon-ads-player.js.map
