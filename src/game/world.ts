import type { SectionId } from "../content"
import { C, blit, box, disc, dither, ellipse, line, px, rbox, rect, text, textWidth, type Ctx } from "./pixel"

export const WORLD_W = 760
export const WORLD_H = 180
export const FEET_Y = 166

export type ThingAction =
  | { kind: "section"; id: SectionId }
  | { kind: "projects" }
  | { kind: "theme" }
  | { kind: "music" }
  | { kind: "pet" }
  | { kind: "water" }
  | { kind: "say"; lines: string[] }

export interface Thing {
  id: string
  label: string
  x: number
  hit: [number, number, number, number]
  action: ThingAction
}

export const THINGS: Thing[] = [
  { id: "journal", label: "about me", x: 53, hit: [44, 104, 18, 12], action: { kind: "section", id: "about" } },
  { id: "window", label: "day / night", x: 70, hit: [26, 18, 76, 72], action: { kind: "theme" } },
  { id: "plant", label: "water the plant", x: 124, hit: [110, 86, 26, 54], action: { kind: "water" } },
  { id: "shelf", label: "skills", x: 160, hit: [132, 44, 56, 96], action: { kind: "section", id: "skills" } },
  { id: "tv", label: "projects", x: 240, hit: [196, 30, 88, 110], action: { kind: "projects" } },
  { id: "poster", label: "poster", x: 306, hit: [288, 28, 36, 48], action: { kind: "say", lines: ["A poster that says LVL UP!", "One commit at a time."] } },
  { id: "desk", label: "experience", x: 388, hit: [328, 36, 110, 104], action: { kind: "section", id: "experience" } },
  { id: "certs", label: "certificates", x: 484, hit: [448, 36, 70, 104], action: { kind: "section", id: "certs" } },
  { id: "music", label: "record player", x: 560, hit: [530, 44, 64, 96], action: { kind: "music" } },
  { id: "door", label: "say hi", x: 660, hit: [618, 56, 82, 84], action: { kind: "section", id: "contact" } },
  { id: "plant2", label: "water the plant", x: 724, hit: [708, 84, 32, 56], action: { kind: "water" } },
]

// ---------- helpers ----------

function rng(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function tint(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  const f = (v: number) => (amt < 0 ? Math.round(v * (1 + amt)) : Math.round(v + (255 - v) * amt))
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`
}

const floorShadow = (c: Ctx, x: number, w: number) => rect(c, x, 139, w, 2, "rgba(59,42,53,.14)")

// ---------- string lights ----------

const HOOKS = [0, 95, 190, 285, 380, 475, 570, 665, 760]
const BULB_COLORS = [C.pink, C.sun, C.mint, C.sky, C.lilac]
export const BULBS: { x: number; y: number; col: string }[] = []
for (let i = 0; i < HOOKS.length - 1; i++) {
  const a = HOOKS[i]
  const b = HOOKS[i + 1]
  for (let x = a + 6; x < b - 3; x += 11) {
    const u = (x - a) / (b - a)
    BULBS.push({ x, y: Math.round(10 + Math.sin(u * Math.PI) * 7) + 1, col: BULB_COLORS[BULBS.length % BULB_COLORS.length] })
  }
}

function stringLights(c: Ctx) {
  for (let i = 0; i < HOOKS.length - 1; i++) {
    const a = HOOKS[i]
    const b = HOOKS[i + 1]
    for (let x = a; x <= b; x++) {
      const u = (x - a) / (b - a)
      px(c, x, Math.round(10 + Math.sin(u * Math.PI) * 7), C.ol)
    }
    rect(c, a - 1, 8, 3, 3, C.woodDk)
  }
  for (const b of BULBS) {
    px(c, b.x, b.y, C.greyDk)
    rect(c, b.x - 1, b.y + 1, 3, 3, b.col)
    px(c, b.x - 1, b.y + 1, C.white)
  }
}

// ---------- wall & floor ----------

function wallAndFloor(c: Ctx) {
  rect(c, 0, 0, WORLD_W, 134, C.wall)
  for (let x = 0; x < WORLD_W; x += 12) rect(c, x + 7, 8, 4, 91, C.wallStripe)
  for (let y = 18, row = 0; y < 92; y += 15, row++) {
    for (let x = (row % 2) * 12 + 1; x < WORLD_W; x += 24) {
      px(c, x + 1, y, C.wallDot)
      px(c, x, y + 1, C.wallDot)
      px(c, x + 2, y + 1, C.wallDot)
      px(c, x + 1, y + 2, C.wallDot)
    }
  }
  rect(c, 0, 0, WORLD_W, 6, C.ceiling)
  rect(c, 0, 6, WORLD_W, 1, C.trim)
  rect(c, 0, 7, WORLD_W, 1, C.trimSh)

  // wainscot with panels
  rect(c, 0, 100, WORLD_W, 34, C.wallLow)
  rect(c, 0, 98, WORLD_W, 1, C.woodSh)
  rect(c, 0, 99, WORLD_W, 2, C.woodHi)
  rect(c, 0, 101, WORLD_W, 1, C.woodSh)
  for (let x = 6; x < WORLD_W; x += 28) {
    rect(c, x, 106, 22, 1, C.wallLowSh)
    rect(c, x, 106, 1, 23, C.wallLowSh)
    rect(c, x + 1, 128, 21, 1, C.trim)
    rect(c, x + 21, 107, 1, 22, C.trim)
  }
  rect(c, 0, 133, WORLD_W, 1, C.wallLowSh)
  rect(c, 0, 134, WORLD_W, 5, C.trim)
  rect(c, 0, 138, WORLD_W, 1, C.trimSh)

  // floor planks, rows get taller toward the viewer
  rect(c, 0, 139, WORLD_W, 41, C.floor)
  const rows = [139, 145, 152, 160, 169, 180]
  const r = rng(7)
  for (let i = 0; i < rows.length - 1; i++) {
    const y = rows[i]
    const h = rows[i + 1] - y
    if (i > 0) rect(c, 0, y - 1, WORLD_W, 1, C.floorLine)
    rect(c, 0, y, WORLD_W, 1, C.floorHi)
    const step = 40 + i * 9
    let x = Math.floor(r() * step)
    while (x < WORLD_W) {
      const w = step - 8 + Math.floor(r() * 16)
      if (r() < 0.4) rect(c, x + 1, y + 1, w - 1, h - 2, C.floorSh)
      // a little grain
      rect(c, x + 4 + Math.floor(r() * (w - 12)), y + 1 + Math.floor(r() * (h - 2)), 4, 1, C.floorLine)
      rect(c, x, y, 1, h - 1, C.floorLine)
      x += w
    }
  }
  rect(c, 0, 139, WORLD_W, 1, "rgba(59,42,53,.18)")

  // soft corners at the ends of the room
  rect(c, 0, 0, 3, 139, C.wallLowSh)
  rect(c, WORLD_W - 3, 0, 3, 139, C.wallLowSh)
}

// ---------- window, curtains, bed ----------

const PANE = { x: 34, y: 24, w: 60, h: 60 }

function curtain(c: Ctx, x0: number, outerLeft: boolean) {
  for (let y = 15; y < 96; y++) {
    const gathered = y > 62 && y < 70
    const w = gathered ? 9 : y >= 70 ? 12 : 15
    const x = outerLeft ? x0 : x0 + 15 - w
    rect(c, x, y, w, 1, C.ol)
    for (let i = 1; i < w - 1; i++) {
      const k = (i + (outerLeft ? 0 : 1)) % 4
      px(c, x + i, y, k === 0 ? C.roseSh : k === 2 ? C.roseHi : C.rose)
    }
  }
  rect(c, outerLeft ? x0 : x0 + 3, 95, 12, 1, C.ol)
  rect(c, outerLeft ? x0 - 1 : x0 + 6, 63, 11, 3, C.pinkSh)
  rect(c, outerLeft ? x0 - 1 : x0 + 6, 63, 11, 1, C.pink)
}

function windowAndBed(c: Ctx) {
  // frame
  box(c, 30, 20, 68, 68, C.trim, C.white, C.trimSh)
  c.clearRect(PANE.x, PANE.y, PANE.w, PANE.h)
  rect(c, PANE.x, PANE.y, PANE.w, 1, C.trimSh)
  rect(c, 62, PANE.y, 4, PANE.h, C.ol)
  rect(c, 63, PANE.y, 2, PANE.h, C.trim)
  rect(c, PANE.x, 52, PANE.w, 4, C.ol)
  rect(c, PANE.x, 53, PANE.w, 2, C.trim)
  box(c, 26, 86, 76, 5, C.trim, C.white, C.trimSh)
  // sill plants
  box(c, 40, 80, 8, 6, C.pot, undefined, C.potSh)
  rect(c, 41, 76, 2, 4, C.leaf)
  rect(c, 44, 74, 2, 6, C.leafHi)
  rect(c, 46, 77, 2, 3, C.leaf)
  box(c, 80, 81, 7, 5, C.sky, undefined, C.skySh)
  box(c, 81, 74, 5, 8, C.mint, C.mintHi, C.mintSh)
  px(c, 83, 73, C.pink)

  // curtains and rod
  curtain(c, 18, true)
  curtain(c, 95, false)
  rect(c, 13, 13, 102, 2, C.woodDk)
  disc(c, 13, 14, 2, C.woodDk)
  disc(c, 115, 14, 2, C.woodDk)

  // bed
  floorShadow(c, 12, 104)
  box(c, 12, 94, 12, 46, C.wood, C.woodHi, C.woodSh)
  rect(c, 15, 98, 6, 1, C.woodSh)
  rect(c, 15, 100, 2, 2, C.pinkSh)
  rect(c, 19, 100, 2, 2, C.pinkSh)
  rect(c, 15, 101, 6, 2, C.pinkSh)
  rect(c, 16, 103, 4, 1, C.pinkSh)
  rect(c, 17, 104, 2, 1, C.pinkSh)
  box(c, 104, 108, 10, 32, C.wood, C.woodHi, C.woodSh)
  box(c, 22, 126, 84, 8, C.wood, C.woodHi, C.woodSh)
  rect(c, 25, 134, 3, 6, C.woodDk)
  rect(c, 100, 134, 3, 6, C.woodDk)
  box(c, 22, 114, 84, 13, C.white, undefined, C.paperSh)
  rbox(c, 24, 105, 18, 11, C.white, undefined, C.paperSh)
  rect(c, 27, 108, 12, 1, C.paperSh)
  px(c, 32, 111, C.pinkHi)
  px(c, 34, 111, C.pinkHi)
  rect(c, 32, 112, 3, 1, C.pinkHi)
  // quilt
  box(c, 44, 111, 62, 17, C.mint, C.mintHi, C.mintSh)
  for (let x = 46, i = 0; x < 104; x += 8, i++) {
    for (let y = 113, j = 0; y < 125; y += 6, j++) {
      if ((i + j) % 2 === 0) rect(c, x, y, 7, 5, C.mintHi)
      px(c, x + 7, y + 2, C.white)
    }
  }
  rect(c, 44, 127, 62, 3, C.mintSh)
  rect(c, 44, 130, 62, 1, C.ol)
  // journal
  box(c, 46, 107, 13, 6, C.pink, C.pinkHi, C.pinkSh)
  rect(c, 48, 109, 9, 1, C.white)
  rect(c, 55, 107, 1, 8, C.sun)
}

// ---------- floor plants ----------

function leaf(c: Ctx, cx: number, cy: number, rx: number, ry: number) {
  ellipse(c, cx, cy, rx + 1, ry + 1, C.ol)
  ellipse(c, cx, cy, rx, ry, C.leaf)
  ellipse(c, cx - 1, cy - 1, Math.max(1, rx - 2), Math.max(0, ry - 1), C.leafHi)
  rect(c, cx - rx + 2, cy, rx * 2 - 3, 1, C.leafSh)
}

function monstera(c: Ctx) {
  floorShadow(c, 112, 24)
  const stems: [number, number][] = [[118, 100], [131, 96], [124, 88], [114, 112], [134, 110], [126, 104]]
  for (const [x, y] of stems) line(c, 124, 124, x, y, C.leafSh)
  leaf(c, 124, 88, 6, 3)
  leaf(c, 131, 96, 6, 3)
  leaf(c, 117, 100, 6, 3)
  leaf(c, 126, 104, 5, 3)
  leaf(c, 113, 112, 5, 3)
  leaf(c, 134, 111, 5, 3)
  box(c, 114, 120, 20, 5, C.pot, C.roseHi, C.potSh)
  box(c, 116, 124, 16, 16, C.pot, undefined, C.potSh)
  rect(c, 118, 129, 12, 1, C.potSh)
}

function snakePlant(c: Ctx) {
  floorShadow(c, 712, 24)
  const blades = [[716, 98], [720, 90], [724, 94], [728, 86], [732, 96]]
  for (const [x, top] of blades) {
    rect(c, x - 1, top - 1, 5, 124 - top, C.ol)
    rect(c, x, top, 3, 123 - top, C.leaf)
    rect(c, x, top, 1, 123 - top, C.leafHi)
    for (let y = top + 4; y < 120; y += 7) rect(c, x, y, 3, 1, C.leafSh)
  }
  box(c, 712, 120, 26, 20, C.peach, C.cream, C.peachSh)
  rect(c, 714, 126, 22, 1, C.peachSh)
  rect(c, 714, 131, 22, 1, C.peachSh)
}

// ---------- bookshelf ----------

const BOOK_COLORS = [C.pink, C.sky, C.sun, C.mint, C.lilac, C.peach, C.rose]

function books(c: Ctx, x0: number, x1: number, base: number, seed: number) {
  const r = rng(seed)
  let x = x0
  while (x < x1 - 3) {
    const w = 3 + Math.floor(r() * 3)
    if (x + w > x1) break
    const h = 10 + Math.floor(r() * 6)
    const col = BOOK_COLORS[Math.floor(r() * BOOK_COLORS.length)]
    rect(c, x, base - h, w, h, C.ol)
    rect(c, x + 1, base - h + 1, w - 2, h - 1, col)
    rect(c, x + w - 2, base - h + 1, 1, h - 1, tint(col, -0.2))
    rect(c, x + 1, base - h + 3, w - 2, 1, tint(col, 0.45))
    rect(c, x + 1, base - 4, w - 2, 1, tint(col, -0.3))
    x += w
  }
  return x
}

function bookshelf(c: Ctx) {
  floorShadow(c, 132, 56)
  box(c, 134, 54, 52, 86, C.wood, C.woodHi, C.woodSh)
  rect(c, 137, 57, 46, 80, C.woodDk)
  dither(c, 137, 57, 46, 80, "rgba(255,255,255,.04)")
  const boards = [76, 96, 116, 134]
  for (const y of boards) {
    rect(c, 136, y, 48, 3, C.wood)
    rect(c, 136, y, 48, 1, C.woodHi)
    rect(c, 137, y + 3, 46, 1, "rgba(0,0,0,.25)")
  }
  // top shelf: books and a globe
  books(c, 138, 166, 76, 3)
  rect(c, 172, 73, 7, 3, C.woodSh)
  rect(c, 175, 71, 1, 2, C.greySh)
  disc(c, 175, 66, 5, C.ol)
  disc(c, 175, 66, 4, C.sky)
  rect(c, 172, 64, 3, 2, C.mint)
  rect(c, 176, 67, 3, 3, C.mint)
  px(c, 173, 63, C.white)
  // second shelf: books, a robot and a little 3D cube
  const after = books(c, 138, 160, 96, 11)
  box(c, after + 2, 86, 9, 8, C.greyHi, undefined, C.grey)
  px(c, after + 4, 89, C.sky)
  px(c, after + 8, 89, C.sky)
  rect(c, after + 5, 91, 3, 1, C.pink)
  rect(c, after + 6, 83, 1, 3, C.greySh)
  px(c, after + 6, 82, C.pink)
  rect(c, after + 4, 94, 2, 2, C.grey)
  rect(c, after + 7, 94, 2, 2, C.grey)
  const cx = 173
  rect(c, cx + 1, 84, 7, 3, C.mintHi)
  rect(c, cx, 87, 5, 9, C.mint)
  rect(c, cx + 5, 87, 4, 9, C.mintSh)
  rect(c, cx, 86, 9, 1, C.ol)
  rect(c, cx - 1, 87, 1, 9, C.ol)
  rect(c, cx + 9, 87, 1, 9, C.ol)
  // third shelf: leaning books
  const end = books(c, 138, 176, 116, 23)
  for (let i = 0; i < 12; i++) rect(c, end + 1 + Math.floor(i / 3), 116 - 12 + i, 4, 1, i === 0 ? C.ol : C.lilac)
  // bottom: baskets
  for (const bx of [139, 161]) {
    box(c, bx, 121, 20, 13, "#e3b872", "#f2d39a", "#b98d4a")
    for (let y = 124; y < 132; y += 3) rect(c, bx + 2, y, 16, 1, "#c99d58")
  }
  // vine on top
  box(c, 138, 47, 10, 7, C.pot, undefined, C.potSh)
  for (let i = 0; i < 9; i++) {
    px(c, 137 - (i % 2), 52 + i * 3, C.leafSh)
    rect(c, 136 - (i % 2), 53 + i * 3, 2, 2, i % 2 ? C.leaf : C.leafHi)
  }
  rect(c, 140, 43, 2, 4, C.leaf)
  rect(c, 143, 41, 2, 6, C.leafHi)
  // stacked books on top
  box(c, 158, 50, 18, 4, C.sky, C.skyHi, C.skySh)
  box(c, 160, 47, 15, 4, C.sun, C.cream, C.sunSh)
}

// ---------- games corner: neon sign, cartridge shelf, CRT and cabinet ----------

export const CART_SLOTS = Array.from({ length: 7 }, (_, i) => 203 + i * 11)
export const CART_BASE = 62
export const TV_SCREEN = { x: 220, y: 90, w: 30, h: 21 }

function gamesCorner(c: Ctx) {
  const label = "GAMES"
  const lx = 240 - Math.floor(textWidth(label) / 2)
  text(c, label, lx + 1, 37, C.pinkSh)
  text(c, label, lx, 36, C.pinkHi)
  rect(c, lx - 5, 37, 2, 2, C.pinkHi)
  rect(c, lx + textWidth(label) + 3, 37, 2, 2, C.pinkHi)

  box(c, 198, 62, 84, 4, C.wood, C.woodHi, C.woodSh)
  for (const bx of [206, 270]) {
    rect(c, bx, 66, 4, 1, C.woodSh)
    rect(c, bx + 1, 67, 3, 1, C.woodSh)
    rect(c, bx + 2, 68, 2, 1, C.woodSh)
  }

  // cabinet
  floorShadow(c, 196, 88)
  box(c, 198, 116, 84, 24, C.wood, C.woodHi, C.woodSh)
  box(c, 202, 119, 20, 18, C.wood, C.woodSh, C.woodHi)
  box(c, 258, 119, 20, 18, C.wood, C.woodSh, C.woodHi)
  px(c, 219, 128, C.gold)
  px(c, 261, 128, C.gold)
  rect(c, 224, 119, 32, 18, C.woodDk)
  rect(c, 224, 119, 32, 2, "rgba(0,0,0,.25)")
  box(c, 228, 129, 24, 8, C.grey, C.greyHi, C.greySh)
  rect(c, 233, 130, 12, 1, C.ol)
  disc(c, 247, 133, 1, C.pink)
  px(c, 230, 134, C.mint)
  rect(c, 236, 126, 6, 3, C.lilac)
  px(c, 237, 127, C.white)

  // CRT
  line(c, 236, 84, 228, 70, C.greyDk)
  line(c, 244, 84, 252, 70, C.greyDk)
  disc(c, 228, 70, 1, C.pink)
  disc(c, 252, 70, 1, C.pink)
  ellipse(c, 240, 85, 5, 2, C.greySh)
  rbox(c, 214, 84, 52, 33, "#eadfcf", "#f8f1e6", "#cdbda7")
  rbox(c, 217, 87, 36, 27, C.ol)
  box(c, 255, 89, 8, 24, "#dccfbd")
  disc(c, 259, 94, 2, C.greySh)
  px(c, 258, 93, C.greyHi)
  disc(c, 259, 101, 2, C.greySh)
  px(c, 258, 100, C.greyHi)
  for (let y = 106; y < 112; y += 2) rect(c, 257, y, 5, 1, C.greySh)
  rect(c, 222, 116, 4, 1, C.ol)
  rect(c, 254, 116, 4, 1, C.ol)

  // rug and beanbag in front
  ellipse(c, 240, 158, 58, 10, C.roseSh)
  ellipse(c, 240, 158, 55, 8, C.rose)
  ellipse(c, 240, 158, 42, 6, C.cream)
  ellipse(c, 240, 158, 39, 5, C.rose)
  ellipse(c, 240, 158, 22, 3, C.roseHi)
  for (let x = 184; x < 298; x += 5) px(c, x, 158, C.roseHi)
}

// ---------- poster ----------

function poster(c: Ctx) {
  box(c, 290, 30, 32, 44, C.lilac, C.lilacHi, C.lilacSh)
  dither(c, 292, 32, 28, 40, "rgba(255,255,255,.12)")
  // big pixel star
  const sx = 306
  const sy = 46
  rect(c, sx - 1, sy - 8, 3, 4, C.sun)
  rect(c, sx - 3, sy - 4, 7, 2, C.sun)
  rect(c, sx - 9, sy - 2, 19, 3, C.sun)
  rect(c, sx - 6, sy + 1, 13, 3, C.sun)
  rect(c, sx - 7, sy + 4, 5, 3, C.sun)
  rect(c, sx + 3, sy + 4, 5, 3, C.sun)
  px(c, sx - 2, sy, C.ol)
  px(c, sx + 2, sy, C.ol)
  rect(c, sx - 1, sy + 2, 3, 1, C.pinkSh)
  text(c, "LVL", 300, 60, C.white)
  text(c, "UP!", 300, 66, C.cream)
  rect(c, 287, 28, 8, 4, "rgba(127,209,174,.85)")
  rect(c, 317, 28, 8, 4, "rgba(127,209,174,.85)")
}

// ---------- desk corner ----------

export const MONITOR = { x: 369, y: 73, w: 40, h: 26 }
export const CLOCK = { x: 425, y: 48 }

function deskCorner(c: Ctx) {
  // corkboard with polaroids
  box(c, 334, 40, 30, 26, "#d9a066", "#e8b884", "#c08a52")
  dither(c, 336, 42, 26, 22, "#c99258", 1)
  const pics: [number, number, string][] = [[337, 44, C.sky], [347, 46, C.pinkHi], [356, 43, C.mintHi], [341, 54, C.sun]]
  for (const [x, y, col] of pics) {
    rect(c, x, y, 8, 9, C.white)
    rect(c, x + 1, y + 1, 6, 5, col)
    px(c, x + 3, y, C.pinkSh)
  }
  rect(c, 352, 56, 8, 7, C.sun)
  rect(c, 353, 58, 5, 1, C.sunSh)
  rect(c, 353, 60, 4, 1, C.sunSh)
  // sticky notes
  const notes: [number, number, string][] = [[372, 54, C.sun], [381, 52, C.pinkHi], [390, 55, C.mintHi]]
  for (const [x, y, col] of notes) {
    rect(c, x, y, 7, 7, col)
    rect(c, x + 1, y + 2, 5, 1, "rgba(59,42,53,.35)")
    rect(c, x + 1, y + 4, 3, 1, "rgba(59,42,53,.35)")
  }

  // desk
  floorShadow(c, 330, 104)
  box(c, 328, 106, 108, 6, C.wood, C.woodHi, C.woodSh)
  box(c, 332, 111, 28, 29, C.wood, undefined, C.woodSh)
  box(c, 334, 114, 24, 11, C.wood, C.woodHi, C.woodSh)
  box(c, 334, 126, 24, 11, C.wood, C.woodHi, C.woodSh)
  rect(c, 344, 119, 4, 1, C.woodDk)
  rect(c, 344, 131, 4, 1, C.woodDk)
  box(c, 424, 111, 6, 29, C.wood, C.woodHi, C.woodSh)
  rect(c, 360, 116, 64, 3, C.woodSh)

  // lamp
  ellipse(c, 344, 105, 5, 1, C.pinkSh)
  line(c, 344, 104, 347, 93, C.greyDk)
  line(c, 347, 93, 354, 88, C.greyDk)
  for (let i = 0; i < 7; i++) rect(c, 351 - i, 81 + i, 8 + i * 2, 1, i === 0 ? C.ol : i < 2 ? C.pinkHi : C.pink)
  rect(c, 344, 88, 22, 1, C.ol)

  // monitor
  rect(c, 386, 99, 6, 5, C.greySh)
  box(c, 379, 102, 20, 4, C.grey, C.greyHi, C.greySh)
  rbox(c, 366, 70, 46, 32, C.grey, C.greyHi, C.greySh)
  px(c, 389, 100, C.pink)
  box(c, 368, 106, 30, 3, C.greyHi, undefined, C.grey)
  for (let x = 370; x < 396; x += 2) px(c, x, 107, C.greySh)
  rbox(c, 401, 106, 5, 3, C.greyHi)

  // mug and cactus
  box(c, 414, 99, 7, 8, C.white, undefined, C.paperSh)
  rect(c, 421, 101, 2, 1, C.ol)
  rect(c, 422, 102, 1, 3, C.ol)
  rect(c, 421, 105, 2, 1, C.ol)
  px(c, 416, 102, C.pinkHi)
  px(c, 418, 102, C.pinkHi)
  box(c, 426, 101, 6, 6, C.peach, undefined, C.peachSh)
  box(c, 427, 94, 4, 8, C.mint, C.mintHi, C.mintSh)
  px(c, 429, 93, C.pinkHi)

  // wall clock face (hands are drawn every frame)
  disc(c, CLOCK.x, CLOCK.y, 7, C.ol)
  disc(c, CLOCK.x, CLOCK.y, 6, C.white)
  for (const [dx, dy] of [[0, -5], [5, 0], [0, 5], [-5, 0]]) px(c, CLOCK.x + dx, CLOCK.y + dy, C.greySh)

  // chair
  rbox(c, 398, 108, 16, 16, C.lilac, C.lilacHi, C.lilacSh)
  rbox(c, 394, 122, 24, 5, C.lilac, C.lilacHi, C.lilacSh)
  rect(c, 404, 127, 4, 8, C.greySh)
  rect(c, 396, 134, 20, 2, C.greyDk)
  disc(c, 397, 137, 1, C.ol)
  disc(c, 406, 137, 1, C.ol)
  disc(c, 415, 137, 1, C.ol)
}

// ---------- certificates ----------

function certsCorner(c: Ctx) {
  box(c, 452, 42, 30, 36, C.gold, C.goldHi, C.goldSh)
  rect(c, 455, 45, 24, 30, C.paper)
  rect(c, 459, 49, 16, 1, C.ol)
  for (let y = 53; y < 63; y += 3) rect(c, 458, y, 18, 1, C.paperSh)
  disc(c, 472, 67, 3, C.pink)
  px(c, 471, 66, C.pinkHi)
  rect(c, 469, 70, 2, 4, C.pinkSh)
  rect(c, 474, 70, 2, 4, C.pinkSh)

  box(c, 488, 40, 26, 21, C.woodDk, undefined, undefined)
  rect(c, 490, 42, 22, 17, C.sky)
  rect(c, 499, 42, 4, 7, C.pink)
  disc(c, 501, 52, 4, C.ol)
  disc(c, 501, 52, 3, C.gold)
  px(c, 500, 51, C.goldHi)

  box(c, 488, 65, 26, 21, C.woodDk)
  rect(c, 490, 67, 22, 17, C.cream)
  const sx = 501
  rect(c, sx - 1, 69, 3, 3, C.lilac)
  rect(c, sx - 6, 72, 13, 3, C.lilac)
  rect(c, sx - 4, 75, 9, 3, C.lilac)
  rect(c, sx - 5, 78, 3, 3, C.lilac)
  rect(c, sx + 3, 78, 3, 3, C.lilac)

  floorShadow(c, 454, 60)
  box(c, 456, 114, 56, 6, C.wood, C.woodHi, C.woodSh)
  rect(c, 460, 120, 3, 20, C.woodSh)
  rect(c, 505, 120, 3, 20, C.woodSh)
  // trophy
  box(c, 476, 109, 13, 5, C.woodDk)
  rect(c, 481, 104, 3, 5, C.goldSh)
  for (let i = 0; i < 9; i++) rect(c, 475 + Math.floor(i / 4), 95 + i, 15 - Math.floor(i / 4) * 2, 1, i === 0 ? C.ol : C.gold)
  rect(c, 477, 96, 2, 6, C.goldHi)
  rect(c, 472, 97, 3, 1, C.ol)
  rect(c, 472, 97, 1, 4, C.ol)
  rect(c, 490, 97, 3, 1, C.ol)
  rect(c, 492, 97, 1, 4, C.ol)
  // books on the table
  box(c, 493, 110, 16, 4, C.sky, C.skyHi, C.skySh)
  box(c, 495, 106, 13, 4, C.pink, C.pinkHi, C.pinkSh)
  // cat bed under the table
  ellipse(c, 482, 136, 15, 4, C.ol)
  ellipse(c, 482, 136, 14, 3, C.rose)
  ellipse(c, 482, 135, 10, 1, C.roseHi)
}

// ---------- music corner ----------

export const RECORD = { x: 552, y: 109 }

function musicCorner(c: Ctx) {
  // framed vinyl on the wall
  box(c, 542, 50, 22, 22, C.white, undefined, C.paperSh)
  disc(c, 553, 61, 8, C.ol)
  disc(c, 553, 61, 3, C.peach)
  px(c, 553, 61, C.ol)
  // cabinet
  floorShadow(c, 530, 64)
  box(c, 532, 116, 60, 20, C.mint, C.mintHi, C.mintSh)
  rect(c, 535, 136, 2, 4, C.ol)
  rect(c, 587, 136, 2, 4, C.ol)
  const spines = [C.pink, C.sun, C.sky, C.lilac, C.peach, C.ol, C.rose]
  spines.forEach((col, i) => rect(c, 536 + i * 3, 120, 2, 13, col))
  disc(c, 576, 126, 6, C.ol)
  dither(c, 571, 121, 11, 11, C.greySh)
  disc(c, 576, 126, 2, C.greyDk)
  // turntable base
  box(c, 538, 108, 40, 8, C.woodDk, C.wood)
  rect(c, 572, 104, 3, 3, C.greyHi)
  px(c, 541, 113, C.pink)
  px(c, 544, 113, C.mint)
}

// ---------- door corner ----------

export const MAILBOX = { x: 678, y: 88 }

function doorCorner(c: Ctx) {
  // coat rack
  rect(c, 606, 64, 3, 74, C.woodDk)
  rect(c, 601, 137, 13, 2, C.woodDk)
  rect(c, 602, 68, 11, 2, C.woodDk)
  rbox(c, 597, 60, 10, 6, C.sun, C.cream, C.sunSh)
  rect(c, 595, 65, 14, 2, C.sunSh)
  for (let y = 70; y < 100; y++) rect(c, 610, y, 4, 1, Math.floor(y / 3) % 2 ? C.pink : C.white)
  rect(c, 609, 70, 1, 30, C.ol)
  rect(c, 614, 70, 1, 30, C.ol)

  // door
  floorShadow(c, 618, 54)
  box(c, 620, 56, 50, 84, C.trim, C.white, C.trimSh)
  box(c, 625, 61, 40, 79, C.wood, C.woodHi, C.woodSh)
  box(c, 630, 68, 30, 26, C.wood, C.woodSh, C.woodHi)
  box(c, 630, 100, 30, 34, C.wood, C.woodSh, C.woodHi)
  disc(c, 659, 98, 2, C.ol)
  disc(c, 659, 98, 1, C.gold)
  // little "hi!" sign
  line(c, 640, 63, 645, 59, C.ol)
  line(c, 650, 63, 645, 59, C.ol)
  box(c, 636, 63, 18, 9, C.cream, undefined, C.paperSh)
  text(c, "HI!", 640, 65, C.pinkSh)
  // welcome mat
  rect(c, 616, 141, 58, 6, C.ol)
  rect(c, 617, 142, 56, 4, C.rose)
  for (let x = 619; x < 672; x += 4) rect(c, x, 142, 2, 4, C.roseHi)
}

// ---------- static layer ----------

export function drawStatic(c: Ctx) {
  wallAndFloor(c)
  stringLights(c)
  windowAndBed(c)
  monstera(c)
  bookshelf(c)
  gamesCorner(c)
  poster(c)
  deskCorner(c)
  certsCorner(c)
  musicCorner(c)
  doorCorner(c)
  snakePlant(c)
}

// ---------- window view, drawn behind the static layer ----------

const STARS = Array.from({ length: 16 }, (_, i) => {
  const r = rng(100 + i)
  return { x: PANE.x + Math.floor(r() * PANE.w), y: PANE.y + Math.floor(r() * 34), p: r() * 6 }
})

function rooftops(c: Ctx, shift: number, body: string, roof: string, lit: string | null, t: number) {
  const houses: [number, number, number][] = [[30, 70, 12], [42, 66, 14], [56, 72, 10], [66, 64, 16], [82, 69, 12], [94, 73, 10]]
  for (const [hx, top, w] of houses) {
    const x = hx + shift
    rect(c, x, top, w, 90 - top, body)
    for (let i = 0; i < 4; i++) rect(c, x - 1 + i, top - 1 - i, w + 2 - i * 2, 1, roof)
    if (lit) {
      for (let wy = top + 3; wy < 82; wy += 5) {
        for (let wx = x + 2; wx < x + w - 2; wx += 4) {
          const on = Math.sin(wx * 12.9 + wy * 7.1 + Math.floor(t / 4)) > -0.1
          rect(c, wx, wy, 2, 2, on ? lit : tint(body, -0.15))
        }
      }
    }
  }
}

export function drawSky(c: Ctx, night: number, t: number, camX: number) {
  c.save()
  c.beginPath()
  c.rect(PANE.x, PANE.y, PANE.w, PANE.h)
  c.clip()
  const shift = Math.max(-6, Math.min(6, Math.round((camX - 20) * -0.04)))

  if (night < 1) {
    rect(c, PANE.x, PANE.y, PANE.w, PANE.h, "#8fd0f0")
    rect(c, PANE.x, PANE.y + 26, PANE.w, 34, "#b4e2f6")
    dither(c, PANE.x, PANE.y + 22, PANE.w, 4, "#b4e2f6")
    rect(c, PANE.x, PANE.y + 44, PANE.w, 16, "#d6f0fb")
    dither(c, PANE.x, PANE.y + 40, PANE.w, 4, "#d6f0fb", 1)
    disc(c, 80 + shift, 36, 7, C.cream)
    disc(c, 80 + shift, 36, 5, C.sun)
    px(c, 78 + shift, 34, C.white)
    for (const [ox, oy, sp] of [[0, 32, 3], [40, 42, 2]]) {
      const x = PANE.x - 16 + ((t * sp + ox) % (PANE.w + 24)) + shift
      rect(c, x + 3, oy, 8, 2, C.white)
      rect(c, x, oy + 2, 15, 3, C.white)
      rect(c, x + 1, oy + 4, 13, 1, "#e3f3fb")
    }
    rooftops(c, shift, "#f0b7bf", "#e08a9a", null, t)
    disc(c, 48 + shift, 76, 7, C.leafSh)
    disc(c, 47 + shift, 74, 5, C.leaf)
  }
  if (night > 0) {
    c.globalAlpha = night
    rect(c, PANE.x, PANE.y, PANE.w, PANE.h, "#1b1c4c")
    rect(c, PANE.x, PANE.y + 30, PANE.w, 30, "#2b2864")
    dither(c, PANE.x, PANE.y + 26, PANE.w, 4, "#2b2864")
    for (const s of STARS) {
      const on = Math.sin(t * 2 + s.p) > -0.3
      px(c, s.x, s.y, on ? C.cream : "#5a5a9a")
    }
    disc(c, 80 + shift, 36, 6, C.cream)
    disc(c, 83 + shift, 34, 5, "#1b1c4c")
    rooftops(c, shift, "#3a2f6b", "#2a2252", C.sun, t)
    disc(c, 48 + shift, 76, 7, "#24324a")
    c.globalAlpha = 1
  }
  c.restore()
}

// ---------- animated bits, drawn over the static layer ----------

export interface Scene {
  t: number
  night: number
  music: boolean
  tvOn: boolean
  inserted: number | null
  cartColors: { label: string; stripe: string }[]
}

function cartridge(c: Ctx, x: number, base: number, label: string, stripe: string) {
  const y = base - 11
  rect(c, x, y, 9, 11, C.ol)
  rect(c, x + 1, y + 1, 7, 9, C.grey)
  rect(c, x + 1, y + 1, 7, 1, C.greyHi)
  rect(c, x + 2, y + 3, 5, 5, label)
  rect(c, x + 2, y + 7, 5, 1, stripe)
  px(c, x + 3, y + 4, C.white)
  rect(c, x + 2, y + 9, 5, 1, C.greySh)
}

function codeLine(c: Ctx, i: number, x: number, y: number) {
  const r = rng(i * 31 + 5)
  const indent = Math.floor(r() * 3) * 3
  let cx = x + indent
  const parts = 1 + Math.floor(r() * 3)
  const cols = [C.pinkHi, C.mintHi, C.sun, C.skyHi, C.lilacHi]
  for (let p = 0; p < parts; p++) {
    const w = 3 + Math.floor(r() * 9)
    if (cx + w > x + 36) break
    rect(c, cx, y, w, 1, cols[Math.floor(r() * cols.length)])
    cx += w + 2
  }
}

export function drawAnimated(c: Ctx, s: Scene) {
  const { t } = s

  // cartridges on the shelf; the inserted one is missing
  s.cartColors.forEach((cc, i) => {
    if (s.inserted !== i) cartridge(c, CART_SLOTS[i], CART_BASE, cc.label, cc.stripe)
  })

  // TV screen
  const sc = TV_SCREEN
  if (s.inserted !== null) {
    const cc = s.cartColors[s.inserted]
    rect(c, sc.x, sc.y, sc.w, sc.h, cc.stripe)
    rect(c, sc.x + 3, sc.y + 3, sc.w - 6, sc.h - 6, cc.label)
    for (let y = 0; y < sc.h; y += 2) rect(c, sc.x, sc.y + y, sc.w, 1, "rgba(0,0,0,.12)")
    rect(c, sc.x, sc.y + (Math.floor(t * 20) % sc.h), sc.w, 1, "rgba(255,255,255,.35)")
  } else if (s.tvOn) {
    rect(c, sc.x, sc.y, sc.w, sc.h, "#2a2f5a")
    for (let y = 0; y < sc.h; y += 2) rect(c, sc.x, sc.y + y, sc.w, 1, "rgba(255,255,255,.05)")
    if (Math.floor(t * 2) % 2 === 0) text(c, "PLAY", sc.x + 7, sc.y + 8, C.pinkHi)
    px(c, sc.x + 4, sc.y + 10, C.sun)
  } else {
    rect(c, sc.x, sc.y, sc.w, sc.h, C.screen)
    line(c, sc.x + 3, sc.y + 9, sc.x + 11, sc.y + 2, C.screenHi)
    line(c, sc.x + 5, sc.y + 11, sc.x + 15, sc.y + 2, C.screenHi)
  }
  px(c, 223, 114, s.tvOn || s.inserted !== null ? C.mint : Math.floor(t) % 2 ? C.pink : C.pinkSh)

  // monitor with scrolling code
  const m = MONITOR
  rect(c, m.x, m.y, m.w, m.h, C.screen)
  c.save()
  c.beginPath()
  c.rect(m.x, m.y, m.w, m.h)
  c.clip()
  const scroll = (t * 5) % 3
  const first = Math.floor(t * 5 / 3)
  for (let i = 0; i < 10; i++) codeLine(c, first + i, m.x + 3, m.y + 2 + i * 3 - scroll)
  c.restore()
  if (Math.floor(t * 2) % 2) rect(c, m.x + 3, m.y + m.h - 4, 2, 2, C.white)

  // lamp bulb
  rect(c, 352, 88, 4, 1, s.night > 0.3 ? C.cream : C.goldHi)

  // mug steam
  for (let i = 0; i < 2; i++) {
    const p = (t * 0.8 + i * 0.5) % 1
    px(c, 416 + i * 3 + Math.round(Math.sin(p * 6 + i) * 1), 97 - Math.round(p * 7), `rgba(255,255,255,${0.75 * (1 - p)})`)
  }

  // clock hands from the real time
  const now = new Date()
  const ang = (v: number) => v * Math.PI * 2 - Math.PI / 2
  const mA = ang(now.getMinutes() / 60)
  const hA = ang(((now.getHours() % 12) + now.getMinutes() / 60) / 12)
  line(c, CLOCK.x, CLOCK.y, CLOCK.x + Math.cos(mA) * 5, CLOCK.y + Math.sin(mA) * 5, C.ol)
  line(c, CLOCK.x, CLOCK.y, CLOCK.x + Math.cos(hA) * 3, CLOCK.y + Math.sin(hA) * 3, C.pink)

  // record player
  const rp = RECORD
  ellipse(c, rp.x, rp.y, 11, 2, C.ol)
  ellipse(c, rp.x, rp.y, 10, 1, "#2b2433")
  const a = s.music ? t * 6 : 0.6
  rect(c, rp.x - 2, rp.y - 1, 5, 2, C.peach)
  px(c, rp.x + Math.round(Math.cos(a) * 7), rp.y + Math.round(Math.sin(a) * 1), C.greyHi)
  if (s.music) line(c, 574, 105, 561, 108, C.greyHi)
  else line(c, 574, 105, 570, 112, C.greyHi)

  // hanging plant swaying
  const sway = Math.round(Math.sin(t * 1.3) * 1.5)
  line(c, 560, 7, 560 + sway, 38, C.woodDk)
  box(c, 554 + sway, 38, 13, 9, C.rose, C.roseHi, C.roseSh)
  for (let i = 0; i < 6; i++) {
    const sw = Math.round(Math.sin(t * 1.3 + i * 0.5) * (1 + i * 0.3))
    rect(c, 553 + sway + sw, 46 + i * 3, 2, 2, i % 2 ? C.leaf : C.leafHi)
    rect(c, 566 + sway - sw, 45 + i * 3, 2, 2, i % 2 ? C.leafHi : C.leaf)
  }
  rect(c, 556 + sway, 35, 2, 3, C.leaf)
  rect(c, 561 + sway, 33, 2, 5, C.leafHi)

  // mailbox with a letter
  const mb = MAILBOX
  rbox(c, mb.x, mb.y, 18, 12, C.sky, C.skyHi, C.skySh)
  rect(c, mb.x + 3, mb.y + 4, 12, 1, C.skySh)
  rect(c, mb.x + 8, mb.y + 12, 2, 6, C.greyDk)
  const flag = Math.round(Math.sin(t * 3) * 1)
  rect(c, mb.x + 17, mb.y - 6 + flag, 2, 8, C.ol)
  rect(c, mb.x + 19, mb.y - 6 + flag, 5, 4, C.pink)
  const bob = Math.round(Math.sin(t * 2.2))
  box(c, mb.x + 4, mb.y - 5 + bob, 10, 7, C.paper, undefined, C.paperSh)
  px(c, mb.x + 8, mb.y - 3 + bob, C.pink)
  px(c, mb.x + 9, mb.y - 3 + bob, C.pink)
}

export interface Light {
  x: number
  y: number
  r: number
  rgb: [number, number, number]
  power: number
}

export function lights(s: Scene): Light[] {
  const flick = 0.92 + Math.sin(s.t * 13) * 0.04 + Math.sin(s.t * 7.3) * 0.04
  const out: Light[] = [
    { x: 356, y: 92, r: 70, rgb: [255, 206, 120], power: 1 },
    { x: 389, y: 86, r: 40, rgb: [140, 170, 255], power: 0.7 },
    { x: 235, y: 100, r: s.tvOn || s.inserted !== null ? 56 : 30, rgb: [150, 180, 255], power: (s.tvOn || s.inserted !== null ? 0.95 : 0.45) * flick },
    { x: 240, y: 38, r: 30, rgb: [255, 120, 170], power: 0.85 * flick },
    { x: 64, y: 56, r: 46, rgb: [170, 190, 255], power: 0.55 },
  ]
  if (s.music) out.push({ x: 552, y: 104, r: 30, rgb: [255, 190, 140], power: 0.6 })
  for (const b of BULBS) {
    const n = parseInt(b.col.slice(1), 16)
    out.push({ x: b.x, y: b.y + 2, r: 10, rgb: [n >> 16, (n >> 8) & 255, n & 255], power: 0.75 })
  }
  return out
}

export function drawSprite(c: Ctx, spr: HTMLCanvasElement, x: number, y: number, flip = false) {
  blit(c, spr, x, y, flip)
}
