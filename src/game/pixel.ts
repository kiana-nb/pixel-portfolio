// Pixel drawing helpers. Everything draws at integer coordinates on a low-resolution canvas
// that CSS scales up with `image-rendering: pixelated`.

export type Ctx = CanvasRenderingContext2D

export const C = {
  ol: "#3b2a35",
  white: "#fffaf3",
  wall: "#f7d9cb",
  wallStripe: "#f3cdbd",
  wallDot: "#ebbcaa",
  wallLow: "#efc4b3",
  wallLowSh: "#e2b09d",
  ceiling: "#e9b8a6",
  trim: "#fff1e6",
  trimSh: "#e8d2c4",
  wood: "#c08457",
  woodHi: "#dca277",
  woodSh: "#9a6440",
  woodDk: "#6e4630",
  floor: "#d9a47a",
  floorHi: "#e6b48b",
  floorSh: "#c79069",
  floorLine: "#a8734f",
  pink: "#f2557b",
  pinkHi: "#ff8fab",
  pinkSh: "#c93d62",
  rose: "#f58fa8",
  roseHi: "#fbb8c8",
  roseSh: "#e0708c",
  mint: "#7fd1ae",
  mintHi: "#a6e3c8",
  mintSh: "#4fae88",
  sky: "#6cb4e8",
  skyHi: "#a9def5",
  skySh: "#3f88c5",
  sun: "#ffd45e",
  sunSh: "#e9b13a",
  cream: "#fff1c9",
  lilac: "#b497e8",
  lilacHi: "#d4c2f5",
  lilacSh: "#7c5cc9",
  peach: "#ffa66e",
  peachSh: "#e07a3c",
  grey: "#cfd4e0",
  greyHi: "#eef0f6",
  greySh: "#8d93a6",
  greyDk: "#5c6288",
  screen: "#232842",
  screenHi: "#3a4266",
  leaf: "#58b36a",
  leafHi: "#86d38f",
  leafSh: "#3a8a52",
  pot: "#e08a6a",
  potSh: "#b9654a",
  paper: "#fff6e6",
  paperSh: "#e6d6bc",
  gold: "#ffcf4a",
  goldHi: "#fff0a8",
  goldSh: "#d9a020",
  skin: "#ffd9c0",
  skinSh: "#f0b89a",
  hair: "#5a3a2e",
  hairHi: "#7d5240",
  hoodie: "#7aa2f7",
  hoodieSh: "#5b82d6",
  hoodieHi: "#a5c1ff",
  jeans: "#4a4e7a",
  jeansSh: "#363a5e",
  shoe: "#fff1e6",
  shoeSh: "#d9c2b0",
  cat: "#f0a35e",
  catSh: "#d0803c",
  catW: "#fff3e0",
  mouth: "#c4566e",
}

export function rect(c: Ctx, x: number, y: number, w: number, h: number, col: string) {
  c.fillStyle = col
  c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

export function px(c: Ctx, x: number, y: number, col: string) {
  rect(c, x, y, 1, 1, col)
}

// Outlined box with an optional highlight row at the top and shade row at the bottom.
export function box(c: Ctx, x: number, y: number, w: number, h: number, fill: string, hi?: string, sh?: string, ol = C.ol) {
  rect(c, x, y, w, h, ol)
  rect(c, x + 1, y + 1, w - 2, h - 2, fill)
  if (hi) rect(c, x + 1, y + 1, w - 2, 1, hi)
  if (sh) rect(c, x + 1, y + h - 2, w - 2, 1, sh)
}

// Box with the corner pixels removed, which reads as slightly rounded at this scale.
export function rbox(c: Ctx, x: number, y: number, w: number, h: number, fill: string, hi?: string, sh?: string, ol = C.ol) {
  rect(c, x + 1, y, w - 2, h, ol)
  rect(c, x, y + 1, w, h - 2, ol)
  rect(c, x + 1, y + 1, w - 2, h - 2, fill)
  if (hi) rect(c, x + 2, y + 1, w - 4, 1, hi)
  if (sh) rect(c, x + 2, y + h - 2, w - 4, 1, sh)
}

export function dither(c: Ctx, x: number, y: number, w: number, h: number, col: string, phase = 0) {
  c.fillStyle = col
  for (let yy = 0; yy < h; yy++) for (let xx = (yy + phase) & 1; xx < w; xx += 2) c.fillRect(x + xx, y + yy, 1, 1)
}

export function disc(c: Ctx, cx: number, cy: number, r: number, col: string) {
  c.fillStyle = col
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.floor(Math.sqrt(r * r - dy * dy) + 0.35)
    c.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1)
  }
}

export function ellipse(c: Ctx, cx: number, cy: number, rx: number, ry: number, col: string) {
  c.fillStyle = col
  for (let dy = -ry; dy <= ry; dy++) {
    const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy / (ry + 0.5)) ** 2)))
    c.fillRect(Math.round(cx - half), Math.round(cy + dy), half * 2 + 1, 1)
  }
}

export function line(c: Ctx, x0: number, y0: number, x1: number, y1: number, col: string) {
  x0 = Math.round(x0)
  y0 = Math.round(y0)
  x1 = Math.round(x1)
  y1 = Math.round(y1)
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  c.fillStyle = col
  for (;;) {
    c.fillRect(x0, y0, 1, 1)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}

// ---------- sprites ----------

export type Palette = Record<string, string>
const spriteCache = new Map<string, HTMLCanvasElement>()

// Mirror left halves into full symmetric rows.
export const mirror = (halves: string[]) => halves.map((h) => h + [...h].reverse().join(""))

export function makeSprite(key: string, rows: string[], pal: Palette): HTMLCanvasElement {
  const hit = spriteCache.get(key)
  if (hit) return hit
  const w = Math.max(...rows.map((r) => r.length))
  const cv = document.createElement("canvas")
  cv.width = w
  cv.height = rows.length
  const c = cv.getContext("2d")!
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const col = pal[row[x]]
      if (row[x] !== "." && col) {
        c.fillStyle = col
        c.fillRect(x, y, 1, 1)
      }
    }
  })
  spriteCache.set(key, cv)
  return cv
}

export function blit(c: Ctx, spr: HTMLCanvasElement, x: number, y: number, flip = false) {
  x = Math.round(x)
  y = Math.round(y)
  if (!flip) {
    c.drawImage(spr, x, y)
    return
  }
  c.save()
  c.translate(x + spr.width, y)
  c.scale(-1, 1)
  c.drawImage(spr, 0, 0)
  c.restore()
}

// ---------- 3x5 font for signs inside the art ----------

const GLYPHS: Record<string, string> = {
  A: "010101111101101", B: "110101110101110", C: "011100100100011", D: "110101101101110",
  E: "111100110100111", F: "111100110100100", G: "011100101101011", H: "101101111101101",
  I: "111010010010111", J: "001001001101010", K: "101101110101101", L: "100100100100111",
  M: "101111111101101", N: "110101101101101", O: "010101101101010", P: "110101110100100",
  Q: "010101101110011", R: "110101110101101", S: "011100010001110", T: "111010010010010",
  U: "101101101101111", V: "101101101101010", W: "101101111111101", X: "101101010101101",
  Y: "101101010010010", Z: "111001010100111", "0": "111101101101111", "1": "010110010010111",
  "2": "110001010100111", "3": "110001010001110", "4": "101101111001001", "5": "111100110001110",
  "6": "011100110101010", "7": "111001010010010", "8": "010101010101010", "9": "010101011001110",
  "!": "010010010000010", ".": "000000000000010", "-": "000000111000000", "+": "000010111010000",
  ":": "000010000010000", "/": "001001010100100", "&": "010101010101011", "?": "110001010000010", " ": "000000000000000",
}

export function text(c: Ctx, str: string, x: number, y: number, col: string) {
  c.fillStyle = col
  let cx = Math.round(x)
  for (const ch of str.toUpperCase()) {
    const g = GLYPHS[ch] ?? GLYPHS[" "]
    for (let i = 0; i < 15; i++) if (g[i] === "1") c.fillRect(cx + (i % 3), Math.round(y) + Math.floor(i / 3), 1, 1)
    cx += 4
  }
}

export const textWidth = (str: string) => str.length * 4 - 1
