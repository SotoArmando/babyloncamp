// Which gallery prototypes each industry shows in Nuevo Creativo.
// Edit SHOWCASE: each value is a list of gallery item ids, in the order they appear.
// An empty list means that industry has no prototypes yet.

export const INDUSTRIES = [
  { id: "bebidas", name: "Bebidas", emoji: "assets/emoji/1f964.png", hue: 198, sat: 58, light: 46, keys: ["climax", "pre-enter", "breaker"], icon: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>' },
  { id: "comida", name: "Comida", emoji: "assets/emoji/1f37d-fe0f.png", hue: 28, sat: 62, light: 48, keys: ["prop:drop", "prop:ball"], icon: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>' },
  { id: "moda", name: "Moda", emoji: "assets/emoji/1f457.png", hue: 332, sat: 42, light: 52, keys: ["prop:turn", "prop:cheer"], icon: '<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/>' },
  { id: "auto", name: "Automotriz", emoji: "assets/emoji/1f697.png", hue: 214, sat: 52, light: 46, keys: ["prop:drive", "prop:drive-plain"], icon: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>' },
  { id: "tech", name: "Tecnología", emoji: "assets/emoji/1f4bb.png", hue: 228, sat: 48, light: 52, keys: ["prop:torch", "prop:torch-front", "prop:space"], icon: '<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/>' },
  { id: "retail", name: "Retail", emoji: "assets/emoji/1f6cd-fe0f.png", hue: 16, sat: 58, light: 48, keys: ["prop:toy", "prop:star"], icon: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>' },
  { id: "salud", name: "Salud", emoji: "assets/emoji/1fa7a.png", hue: 350, sat: 52, light: 50, keys: ["aurora", "calve"], icon: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>' },
  { id: "educacion", name: "Educación", emoji: "assets/emoji/1f393.png", hue: 262, sat: 40, light: 50, keys: ["migrate", "erupt"], icon: '<path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>' },
  { id: "viajes", name: "Viajes", emoji: "assets/emoji/2708-fe0f.png", hue: 200, sat: 46, light: 46, keys: ["horizon", "sundown", "storm"], icon: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>' },
];

export const SHOWCASE = {
  bebidas: ["gmtk7colb9pg7", "gmtk7colbwhov", "gmtk7colboy3l", "gmtk7dutjtpm8"],
  comida: ["gmtk7colbzhmu", "gmtk7colbag4l"],
  moda: ["gmtk7colccu0x", "gmtk7colcoaso"],
  auto: [],
  tech: ["gmtk7colbt9az", "gmtk7colc2skw", "gmtkdon5c2r9r", "gmtklpow8qcry"],
  retail: ["gmtk7colbt5v4", "gmtk7colcd01y"],
  salud: ["gmtk7colb0dso", "gmtk7colbor4o"],
  educacion: ["gmtk7colb62ba", "gmtk7colbpeep"],
  viajes: ["gmtk7colbv1zm", "gmtk7colb2z4r", "gmtk7colbvro8"],
};

function itemKey(item) {
  return item?.play === "prop" ? `prop:${item.propAct || "drop"}` : String(item?.play || "");
}

export function industryById(id) {
  return INDUSTRIES.find((industry) => industry.id === id) || null;
}

export function industryForItem(item) {
  const explicit = industryById(item?.ind);
  if (explicit) return explicit;
  for (const industry of INDUSTRIES) {
    const ids = SHOWCASE[industry.id];
    if (Array.isArray(ids) && ids.includes(item?.id)) return industry;
  }
  const key = itemKey(item);
  return INDUSTRIES.find((industry) => industry.keys.includes(key)) || null;
}

export function industryShowMap(profile) {
  const map = profile?.industryShows;
  return map && typeof map === "object" && !Array.isArray(map) ? map : null;
}

export function itemsForIndustry(items, industry, map) {
  if (!industry) return items.slice();
  if (map && Array.isArray(map[industry.id])) {
    const byId = new Map(items.map((item) => [item.id, item]));
    return map[industry.id].map((id) => byId.get(id)).filter((item) => item && !item.off);
  }
  const explicit = items.filter((item) => item?.ind === industry.id);
  const ids = SHOWCASE[industry.id];
  if (Array.isArray(ids)) {
    if (!ids.length) return explicit;
    const byId = new Map(items.map((item) => [item.id, item]));
    const picked = ids.map((id) => byId.get(id)).filter((item) => item && !item.ind);
    if (picked.length || explicit.length) {
      const seen = new Set(explicit.map((item) => item.id));
      return explicit.concat(picked.filter((item) => !seen.has(item.id)));
    }
  }
  return items.filter((item) => !item?.ind && industry.keys.includes(itemKey(item)));
}

export function industriesForItem(item, items, map) {
  return INDUSTRIES.filter((industry) => {
    if (map && Array.isArray(map[industry.id])) return map[industry.id].includes(item?.id);
    return itemsForIndustry(items, industry).some((entry) => entry.id === item?.id);
  });
}
