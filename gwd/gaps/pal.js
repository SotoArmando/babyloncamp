/** Paleta del play: GWD no recolorea el GLB. Canal: fog/floor ya van; stand/object/ball/beam/star en CSS. No tocar Babylon. */

export const id = "pal-rest";

const DEF = {
  floor: "#29292b",
  stand: "#3a3a3e",
  object: "#dbc7a8",
  ball: "#d1472e",
  beam: "#ffe8b8",
  star: "#ffe566",
};

function hex(value, fallback) {
  const raw = String(value || "").trim();
  if (/^#[0-9a-fA-F]{6}$/.test(raw)) return `#${raw.slice(1).toLowerCase()}`;
  if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
    return `#${raw[1]}${raw[1]}${raw[2]}${raw[2]}${raw[3]}${raw[3]}`.toLowerCase();
  }
  return fallback;
}

function palOn(value) {
  return Boolean(String(value || "").trim());
}

export function apply(spec, item) {
  const pal = item?.pal && typeof item.pal === "object" ? item.pal : {};
  const fog = hex(pal.fog, "");
  const mesh = spec.kind === "mesh";
  return {
    ...spec,
    stage: fog || spec.stage,
    floorCol: hex(pal.floor, spec.floorCol || DEF.floor),
    palStand: hex(pal.stand, DEF.stand),
    palObject: hex(pal.object, DEF.object),
    palBall: hex(pal.ball, DEF.ball),
    palBeam: hex(pal.beam, DEF.beam),
    palStar: hex(pal.star, DEF.star),
    palObjectOn: !mesh && palOn(pal.object),
    palBallOn: palOn(pal.ball),
    palBeamOn: palOn(pal.beam),
    palStarOn: palOn(pal.star),
    palAct: String(item?.propAct || spec.palAct || "drop"),
  };
}
