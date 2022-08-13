export type RPColor = keyof typeof COLORS_BY_NAME;

const COLORS_BY_NAME = Object.freeze({
  love: "#eb6f92",
  gold: "#f6c177",
  rose: "#ebbcba",
  pine: "#31748f",
  foam: "#9ccfd8",
  iris: "#c4a7e7",
});
const COLOR_NAMES = Object.keys(COLORS_BY_NAME) as RPColor[];

export function getRPColorFromName(key: RPColor): string {
  return COLORS_BY_NAME[key];
}

export function getRPColorFromIndex(index: number): string {
  return getRPColorFromName(COLOR_NAMES[Math.abs(index % COLOR_NAMES.length)]);
}

export function getRandomRPColorName(): RPColor {
  return COLOR_NAMES[Math.floor(Math.random() * COLOR_NAMES.length)];
}
