import {
  applyHandoffSettings,
  handoffById,
  handoffRuntimeMs,
  resolveHandoffTempo,
  veilHandoffTiming,
} from "./ad-catalog.js?v=cam23";

function kindOf(container) {
  return handoffById(container?.dataset.handoff).id;
}

export function runHandoff(container, onTimer) {
  const kind = kindOf(container);
  if (!container || kind === "none") return 0;
  applyHandoffSettings(container);
  const beat = resolveHandoffTempo(container.dataset.play, container.dataset.handoffTempo);
  container.style.setProperty("--handoff-beat", `${beat}ms`);
  container.classList.add("is-handoff");
  const wait = (fn, ms) => {
    const id = setTimeout(fn, ms);
    onTimer?.(id);
    return id;
  };
  const opts = {
    play: container.dataset.play,
    hms: container.dataset.handoffMs,
    hnb: container.dataset.handoffBands,
    hst: container.dataset.handoffStagger,
    hhd: container.dataset.handoffHold,
    hbt: container.dataset.handoffBeats,
    htm: container.dataset.handoffTempo,
  };
  if (kind === "pulse") {
    const flashes = Number(opts.hbt) || 4;
    const hold = 720;
    const fade = 520;
    wait(() => {
      container.classList.add("is-handoff-hold");
      wait(() => container.classList.add("is-handoff-done"), hold + fade);
    }, flashes * beat);
    return flashes * beat + hold + fade;
  }
  if (kind === "veil") {
    const veil = veilHandoffTiming(opts);
    wait(() => {
      container.classList.add("is-handoff-hold");
      wait(() => container.classList.add("is-handoff-done"), veil.outMs);
    }, veil.inMs + veil.hold);
    return veil.total;
  }
  const ms = handoffRuntimeMs(kind, opts);
  wait(() => container.classList.add("is-handoff-done"), ms);
  return ms;
}

export function revealPlay(container, onTimer) {
  if (!container || container.classList.contains("is-climax")) return 0;
  container.classList.add("is-climax");
  return runHandoff(container, onTimer);
}
