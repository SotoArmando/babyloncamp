/** Escala del mesh. Canal: atributo `scale` + pin en el shell. No CSS (fillViewerBox anula transform). No tocar Babylon. */

export const id = "scale";

function axis(n) {
  const v = Number(n);
  return Number.isFinite(v) && v > 0 ? Math.min(2.4, Math.max(0.18, v)) : 0.72;
}

export function apply(spec, item) {
  const sx = axis(spec?.scaleX ?? item?.psx);
  const sy = axis(spec?.scaleY ?? item?.psy);
  const sz = axis(spec?.scaleZ ?? item?.psz);
  return {
    ...spec,
    scaleX: sx,
    scaleY: sy,
    scaleZ: sz,
    scale: (sx + sy + sz) / 3,
    scaleAttr: `${sx} ${sy} ${sz}`,
  };
}
