function easeOut(t) {
  return 1 - (1 - Math.min(1, Math.max(0, t))) ** 3;
}

function easeIn(t, p = 3) {
  const k = Math.min(1, Math.max(0, t));
  return k ** p;
}

function easeInOut(t) {
  const k = Math.min(1, Math.max(0, t));
  return k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2;
}

function span(t, a, b) {
  if (b <= a) return t >= b ? 1 : 0;
  return Math.min(1, Math.max(0, (t - a) / (b - a)));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function propActionMs(action) {
  if (action === "space") return 7600;
  if (action === "star" || action === "cheer") return 5800;
  if (action === "turn") return 4400;
  if (action === "torch" || action === "torch-front") return 4000;
  if (action === "ball") return 4000;
  if (action === "toy") return 3800;
  return 3600;
}

function eulerYxzToQuat(rx, ry, rz) {
  const hx = rx * 0.5;
  const hy = ry * 0.5;
  const hz = rz * 0.5;
  const sx = Math.sin(hx);
  const cx = Math.cos(hx);
  const sy = Math.sin(hy);
  const cy = Math.cos(hy);
  const sz = Math.sin(hz);
  const cz = Math.cos(hz);
  return [
    cy * sx * cz + sy * cx * sz,
    sy * cx * cz - cy * sx * sz,
    cy * cx * sz - sy * sx * cz,
    cy * cx * cz + sy * sx * sz,
  ];
}

function alignQuat(prev, next) {
  if (!prev) return next;
  const dot = prev[0] * next[0] + prev[1] * next[1] + prev[2] * next[2] + prev[3] * next[3];
  if (dot < 0) return [-next[0], -next[1], -next[2], -next[3]];
  return next;
}

function propBallFlight(t, h0, g, e) {
  const tDrop = Math.sqrt((2 * h0) / g);
  if (t <= tDrop) {
    return { y: Math.max(0, h0 - 0.5 * g * t * t), squash: t > tDrop - 0.045 ? 0.2 : 0, spin: t * 3.2 };
  }
  let tAcc = tDrop;
  let v = g * tDrop;
  for (let i = 0; i < 6; i += 1) {
    v *= e;
    const tUp = v / g;
    const flight = 2 * tUp;
    const peak = (v * v) / (2 * g);
    if (peak < 0.012) break;
    if (t <= tAcc + flight) {
      const tau = t - tAcc;
      const edge = Math.min(tau, flight - tau);
      return {
        y: Math.max(0, v * tau - 0.5 * g * tau * tau),
        squash: edge < 0.05 ? 0.16 * (1 - edge / 0.05) : 0,
        spin: tDrop * 3.2 + t * 5.4,
      };
    }
    tAcc += flight;
  }
  return { y: 0, squash: 0, spin: tDrop * 3.2 + tAcc * 5.4 };
}

export function propPose(action, t, half) {
  const p = { x: 0, y: half, z: 0, rx: 0, ry: 0.28, rz: 0, sx: 1, sy: 1, sz: 1, camA: 0, camR: 1, punch: 0, star: 0, starSpin: 0 };
  if (action === "toy") {
    if (t < 0.12) {
      const k = t / 0.12;
      p.ry = 0.2 + Math.sin(k * 28) * 0.05 * (1 - k);
      p.rx = 0.08;
      return p;
    }
    const hops = [
      [0.12, 0.30, 0.26],
      [0.30, 0.48, 0.22],
      [0.48, 0.66, 0.16],
      [0.66, 0.82, 0.09],
    ];
    for (let i = 0; i < hops.length; i += 1) {
      const [a, b, h] = hops[i];
      if (t < b) {
        const u = span(t, a, b);
        const air = Math.sin(u * Math.PI);
        p.y = half + air * h;
        p.x = i * 0.07 + u * 0.07 - 0.08;
        p.rx = 0.22 * air;
        p.ry = 0.2 + i * 0.35 + u * 0.35;
        const land = u < 0.14 ? 1 - u / 0.14 : u > 0.84 ? (u - 0.84) / 0.16 : 0;
        const squash = land * 0.18;
        p.sy = 1 - squash;
        p.sx = 1 + squash * 0.45;
        p.sz = 1 + squash * 0.45;
        if (air < 0.08) p.y = half * p.sy;
        return p;
      }
    }
    const s = easeOut(span(t, 0.82, 1));
    p.x = 0.2 * (1 - s);
    p.rx = 0.06 * (1 - s);
    p.ry = 1.55 + s * 0.12;
    return p;
  }
  if (action === "torch" || action === "torch-front") {
    const sweep = t < 0.5
      ? lerp(-0.72, 0.78, easeInOut(span(t, 0.1, 0.42)))
      : lerp(0.78, -0.55, easeInOut(span(t, 0.54, 0.88)));
    const face = action === "torch-front" ? Math.PI : 0;
    p.y = 0.52;
    p.rx = 0.62 + Math.sin(t * Math.PI) * 0.06;
    p.ry = face + sweep;
    p.rz = sweep * 0.08;
    p.camA = sweep * 0.12;
    return p;
  }
  if (action === "ball") {
    const hold = 0.1;
    const r = half * 0.92;
    if (t <= hold) {
      p.y = 1.72;
      p.rx = 0.2;
      return p;
    }
    const flight = propBallFlight((t - hold) * 3.55, 1.72 - r, 16.5, 0.58);
    const squash = flight.squash;
    p.y = r * (1 - squash) + flight.y;
    p.x = easeOut(span(t, hold, 0.92)) * 0.28;
    p.rx = flight.spin;
    p.ry = 0.4;
    p.sy = 1 - squash;
    p.sx = 1 + squash * 0.42;
    p.sz = 1 + squash * 0.42;
    return p;
  }
  if (action === "turn") {
    const spin = easeInOut(span(t, 0.06, 0.84));
    const settle = easeOut(span(t, 0.84, 1));
    p.y = half + 0.055;
    p.rx = 0.14;
    p.ry = spin * Math.PI * 2 + settle * 0.08;
    p.camA = easeInOut(t) * 0.42;
    return p;
  }
  if (action === "star" || action === "cheer" || action === "space") {
    const space = action === "space";
    const crouchIn = 0.08;
    const load = 0.18;
    const apex = 0.32;
    const beat = 0.38;
    const spinEnd = space ? 0.55 : 0.68;
    const touch = 0.78;
    const squashEnd = 0.86;
    const pose = 0.93;
    const face = 0.28;
    const wind = -0.62;
    const peak = half + 0.78;
    const revs = 2.25;
    const endSpin = face + revs * Math.PI * 2;
    const cruiseEnd = 2.04;
    let squash = 0;
    if (t < load) {
      squash = (t < crouchIn ? easeOut(span(t, 0, crouchIn)) : 1) * 0.24;
    } else if (t < apex) {
      squash = lerp(0.24, -0.18, easeOut(span(t, load, apex)));
    } else if (t < spinEnd || space) {
      squash = lerp(-0.18, 0, easeOut(span(t, apex, beat)));
    } else if (t < touch) {
      squash = 0;
    } else if (t < squashEnd) {
      squash = Math.sin(span(t, touch, squashEnd) * Math.PI) * 0.22;
    }
    p.sy = 1 - squash;
    p.sx = 1 + squash * (squash >= 0 ? 0.48 : 0.32);
    p.sz = p.sx;
    if (t < load) {
      p.y = half * p.sy;
    } else if (t < apex) {
      p.y = lerp(half * 0.76, peak, easeOut(span(t, load, apex)));
    } else if (space) {
      const u = span(t, apex, 1);
      p.y = peak + 0.1 * easeOut(Math.min(1, u * 1.15)) + Math.sin(u * Math.PI * 1.1) * 0.03 * (1 - u);
    } else if (t < spinEnd) {
      p.y = peak + Math.sin(span(t, apex, spinEnd) * Math.PI) * 0.035;
    } else if (t < touch) {
      p.y = lerp(peak, half, easeIn(span(t, spinEnd, touch), 2.15));
    } else if (t < squashEnd) {
      p.y = half * p.sy;
    } else {
      p.y = half;
    }
    if (t < crouchIn) {
      p.ry = lerp(face, wind, easeInOut(span(t, 0, crouchIn)));
    } else if (t < load) {
      p.ry = wind;
    } else if (t < beat) {
      p.ry = lerp(wind, face, easeOut(span(t, load, beat)));
    } else if (t < spinEnd) {
      const u = span(t, beat, spinEnd);
      const turns = space
        ? (u < 0.22 ? easeIn(u / 0.22, 2.1) * 0.32 : 0.32 + (u - 0.22) / 0.78 * 1.72)
        : u < 0.2
          ? easeIn(u / 0.2, 2.1) * 0.32
          : u < 0.76
            ? 0.32 + (u - 0.2) / 0.56 * 1.62
            : 0.32 + 1.62 + easeOut((u - 0.76) / 0.24) * 0.31;
      p.ry = face + turns * Math.PI * 2;
    } else if (space) {
      p.ry = face + (cruiseEnd + easeOut(span(t, spinEnd, 1)) * 1.4) * Math.PI * 2;
    } else if (t < squashEnd) {
      p.ry = endSpin;
    } else {
      p.ry = endSpin + easeOut(span(t, squashEnd, 1)) * 0.18;
    }
    if (t < load) {
      p.rx = 0.2 * (t < crouchIn ? easeOut(span(t, 0, crouchIn)) : 1);
    } else if (t < beat) {
      p.rx = lerp(0.2, -0.08, easeOut(span(t, load, beat)));
    } else if (t < spinEnd) {
      p.rx = -0.08;
    } else if (space) {
      const u = easeOut(span(t, spinEnd, 1));
      p.rx = lerp(-0.08, 0.16, u);
      p.rz = lerp(0, -0.1, u);
    } else if (t < squashEnd) {
      p.rx = lerp(-0.08, 0.2, easeIn(span(t, spinEnd, touch), 2));
      if (t >= touch) p.rx = lerp(0.2, 0.04, span(t, touch, squashEnd));
    } else {
      p.rx = lerp(0.04, -0.28, easeOut(span(t, squashEnd, pose)));
    }
    if (!space || t < spinEnd) p.rz = 0;
    p.star = t < load ? 0 : easeOut(span(t, load, apex));
    p.starSpin = p.star * (0.2 + span(t, load, 1) * 3.4);
    const air = space
      ? (t < load ? 0 : easeOut(span(t, load, apex)))
      : t < load ? 0 : t < spinEnd ? easeOut(span(t, load, apex)) : 1 - easeIn(span(t, spinEnd, touch), 2);
    p.camR = 1 + air * (space ? 0.28 : 0.2);
    p.camA = space
      ? easeInOut(span(t, spinEnd, 1)) * 0.16
      : t < touch ? 0 : easeInOut(span(t, touch, 1)) * 0.3;
    if (!space && t >= touch && t < squashEnd) p.punch = Math.sin(span(t, touch, squashEnd) * Math.PI) * 0.045;
    return p;
  }
  if (t < 0.16) {
    p.y = 1.68;
    p.rx = 0.1;
    p.ry = 0.22;
    return p;
  }
  if (t < 0.4) {
    const k = easeIn(span(t, 0.16, 0.4), 2.6);
    p.y = lerp(1.68, half, k);
    p.rx = 0.1 + k * 0.18;
    p.ry = 0.22 + k * 0.12;
    return p;
  }
  if (t < 0.5) {
    const k = span(t, 0.4, 0.5);
    const squash = Math.sin(k * Math.PI) * 0.26;
    p.sy = 1 - squash;
    p.sx = 1 + squash * 0.55;
    p.sz = 1 + squash * 0.55;
    p.y = half * p.sy;
    p.rx = 0.28 * (1 - k);
    p.ry = 0.34;
    p.punch = (1 - k) * 0.07;
    return p;
  }
  if (t < 0.7) {
    const k = span(t, 0.5, 0.7);
    p.y = half + Math.sin(k * Math.PI) * 0.3 * (1 - k * 0.35);
    p.rx = 0.05;
    p.ry = 0.34 + k * 0.15;
    const land = k > 0.82 ? (k - 0.82) / 0.18 : k < 0.12 ? 1 - k / 0.12 : 0;
    const squash = land * 0.14;
    p.sy = 1 - squash;
    p.sx = 1 + squash * 0.4;
    p.sz = 1 + squash * 0.4;
    if (squash > 0 && p.y < half + 0.06) p.y = half * p.sy;
    return p;
  }
  if (t < 0.84) {
    const k = span(t, 0.7, 0.84);
    p.y = half + Math.sin(k * Math.PI) * 0.1 * (1 - k);
    p.ry = 0.49 + k * 0.08;
    return p;
  }
  p.y = half;
  p.ry = 0.57 + easeOut(span(t, 0.84, 1)) * 0.22;
  p.rx = 0.04;
  return p;
}

export function samplePropClimax(action, half = 0.36, hz = 12) {
  const ms = propActionMs(action);
  const n = Math.max(2, Math.round((ms / 1000) * hz) + 1);
  const times = [];
  const translations = [];
  const rotations = [];
  const scales = [];
  let prevQ = null;
  for (let i = 0; i < n; i += 1) {
    const u = i / (n - 1);
    const p = propPose(action, u, half);
    const y = Math.max(p.y, half * p.sy);
    const q = alignQuat(prevQ, eulerYxzToQuat(p.rx, p.ry, p.rz));
    prevQ = q;
    times.push((ms / 1000) * u);
    translations.push(p.x, y, p.z);
    rotations.push(...q);
    scales.push(p.sx, p.sy, p.sz);
  }
  return { times, translations, rotations, scales, duration: ms / 1000, action };
}
