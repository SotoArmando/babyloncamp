import { propPose } from "./prop-climax.js";
import { CLIMAX_SCRIPT_COPIES, scriptPose } from "./climax-script.js";

const halves = [0.36, 0.5, 0.18];
const steps = 20000;
let failed = 0;

for (const copy of CLIMAX_SCRIPT_COPIES) {
  let mismatches = 0;
  let samples = 0;
  let first = null;
  for (const half of halves) {
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      samples += 1;
      const live = propPose(copy.source, t, half);
      const written = scriptPose(copy.id, t, half);
      const keys = new Set([...Object.keys(live), ...Object.keys(written)]);
      for (const key of keys) {
        if (!Object.is(live[key], written[key])) {
          mismatches += 1;
          if (!first) first = { t, half, key, live: live[key], written: written[key] };
        }
      }
    }
  }
  if (mismatches) {
    failed += 1;
    console.log(`DISTINTO ${copy.id}: ${mismatches} canales, primero t=${first.t} half=${first.half} ${first.key} original=${first.live} script=${first.written}`);
  } else {
    console.log(`IGUAL ${copy.id}: ${samples} poses`);
  }
}

if (failed) {
  console.log(`${failed} copias no coinciden`);
  process.exit(1);
}
console.log(`${CLIMAX_SCRIPT_COPIES.length} copias coinciden con el clímax original`);
