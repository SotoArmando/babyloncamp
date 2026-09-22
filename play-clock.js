const HZ = 60;
const MAX_STEPS = 5;
const MAX_DT = 0.25;

let frameStamp = 0;

export function beginPlayFrame(now) {
  frameStamp = now;
}

function clockOf(unit) {
  if (!unit.playClock) {
    unit.playClock = { ms: 0, prev: 0, acc: 0, stamp: 0, alpha: 1, held: false };
  }
  return unit.playClock;
}

export function resetPlayClock(unit) {
  if (!unit) return;
  const clock = clockOf(unit);
  clock.ms = 0;
  clock.prev = 0;
  clock.acc = 0;
  clock.stamp = 0;
  clock.alpha = 1;
  clock.held = false;
}

export function playSimMs(unit) {
  return unit?.playClock?.ms || 0;
}

export function playDrawMs(unit) {
  const clock = unit?.playClock;
  if (!clock) return 0;
  if (clock.held) return clock.ms;
  return clock.prev + (clock.ms - clock.prev) * clock.alpha;
}

export function stepPlayClock(unit, { hold = false, seekMs = null, onStep = null, now = 0 } = {}) {
  if (!unit) return null;
  const clock = clockOf(unit);
  const stamp = now || frameStamp || performance.now();
  const step = 1 / HZ;
  const stepMs = 1000 / HZ;
  if (seekMs != null) {
    const ms = Math.max(0, Number(seekMs) || 0);
    clock.prev = clock.ms;
    clock.ms = ms;
    clock.acc = 0;
    clock.stamp = stamp;
    clock.alpha = 1;
    clock.held = true;
    onStep?.(clock.ms);
    return clock;
  }
  if (hold) {
    clock.stamp = stamp;
    clock.alpha = 1;
    clock.held = true;
    return clock;
  }
  if (clock.stamp === stamp) return clock;
  if (!clock.stamp) {
    clock.stamp = stamp;
    clock.alpha = 0;
    clock.held = false;
    return clock;
  }
  let dt = (stamp - clock.stamp) / 1000;
  clock.stamp = stamp;
  clock.held = false;
  if (dt < 0) dt = 0;
  if (dt > MAX_DT) dt = MAX_DT;
  clock.acc += dt;
  let steps = 0;
  while (clock.acc >= step && steps < MAX_STEPS) {
    clock.prev = clock.ms;
    clock.ms += stepMs;
    clock.acc -= step;
    steps += 1;
    onStep?.(clock.ms);
  }
  if (clock.acc > step * MAX_STEPS) clock.acc = 0;
  clock.alpha = clock.acc / step;
  return clock;
}
