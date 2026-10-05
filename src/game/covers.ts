import type { CoverId } from "../content"
import { C, box, disc, dither, ellipse, line, px, rbox, rect, text, textWidth, type Ctx } from "./pixel"
import { tint } from "./world"

// Animated 160x90 pixel scenes, one per project. `t` is in seconds.
export const COVER_W = 160
export const COVER_H = 90

function bands(c: Ctx, cols: string[]) {
  const h = Math.ceil(COVER_H / cols.length)
  cols.forEach((col, i) => {
    rect(c, 0, i * h, COVER_W, h, col)
    if (i > 0) dither(c, 0, i * h - 2, COVER_W, 2, col)
  })
}

function tag(c: Ctx, label: string, x: number, y: number, bg: string, fg: string) {
  const w = textWidth(label) + 6
  rbox(c, x, y, w, 9, bg)
  text(c, label, x + 3, y + 2, fg)
}

// ---------- Uryva: a floating knowledge graph and a streaming chat bubble ----------

const NODES: [number, number, string][] = [
  [80, 40, C.pink], [52, 26, C.lilac], [110, 24, C.mint], [124, 52, C.sun], [96, 66, C.sky],
  [58, 58, C.peach], [32, 42, C.mint], [138, 30, C.pinkHi], [70, 16, C.sky],
]
const EDGES = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 6], [1, 8], [2, 7], [3, 7], [4, 3], [5, 6], [2, 8]]

function uryva(c: Ctx, t: number) {
  bands(c, ["#2a2350", "#312a5e", "#3a2f6b"])
  for (let i = 0; i < 22; i++) {
    const x = (i * 53) % 160
    const y = (i * 29) % 70
    if (Math.sin(t * 2 + i) > 0) px(c, x, y, "#6c62a8")
  }
  const pos = NODES.map(([x, y], i) => [x + Math.sin(t * 0.9 + i) * 2, y + Math.cos(t * 0.7 + i * 1.3) * 2])
  for (const [a, b] of EDGES) line(c, pos[a][0], pos[a][1], pos[b][0], pos[b][1], "#6f5fc4")
  const pulse = (t % 2) / 2
  const r = Math.round(6 + pulse * 10)
  c.globalAlpha = 1 - pulse
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2
    px(c, pos[0][0] + Math.cos(a) * r, pos[0][1] + Math.sin(a) * r, C.pinkHi)
  }
  c.globalAlpha = 1
  NODES.forEach(([, , col], i) => {
    const rr = i === 0 ? 6 : 3
    disc(c, pos[i][0], pos[i][1], rr + 1, C.ol)
    disc(c, pos[i][0], pos[i][1], rr, col)
    px(c, pos[i][0] - 1, pos[i][1] - 1, C.white)
  })
  // chat bubble with streaming dots
  rbox(c, 8, 66, 50, 17, C.white, undefined, C.paperSh)
  rect(c, 14, 82, 4, 3, C.ol)
  rect(c, 15, 82, 2, 2, C.white)
  for (let i = 0; i < 3; i++) {
    const up = Math.sin(t * 6 - i * 0.8) > 0.4 ? -1 : 0
    rect(c, 14 + i * 6, 73 + up, 3, 3, C.lilacSh)
  }
  rect(c, 36, 71, 16, 1, C.lilacHi)
  rect(c, 36, 75, 12, 1, C.lilacHi)
  tag(c, "12 LANG", 112, 74, C.mint, C.ol)
}

// ---------- Hobzi: a sports hall, a basketball shot and a booked calendar day ----------

function hobzi(c: Ctx, t: number) {
  bands(c, ["#8f82f0", "#a196f5", "#b6adf9"])
  // hall wall stripes
  for (let x = 0; x < 160; x += 20) rect(c, x, 0, 10, 58, "rgba(255,255,255,.08)")
  // court floor
  rect(c, 0, 58, 160, 32, "#e7a86f")
  rect(c, 0, 58, 160, 1, C.ol)
  for (let y = 64; y < 90; y += 6) rect(c, 0, y, 160, 1, "#d39459")
  ellipse(c, 70, 76, 26, 6, C.white)
  ellipse(c, 70, 76, 24, 5, "#e7a86f")
  rect(c, 70, 70, 1, 13, C.white)
  // hoop
  rect(c, 138, 20, 3, 40, C.greyDk)
  box(c, 122, 14, 22, 15, C.white, undefined, C.greyHi)
  rect(c, 128, 19, 9, 6, C.pink)
  rect(c, 129, 20, 7, 4, C.white)
  rect(c, 118, 28, 12, 2, "#f08a3c")
  for (let i = 0; i < 4; i++) line(c, 119 + i * 3, 30, 120 + i * 2, 37, C.white)
  // ball arc, then a drop through the net and a bounce
  const cyc = (t % 2.6) / 2.6
  let bx: number
  let by: number
  if (cyc < 0.55) {
    const u = cyc / 0.55
    bx = 40 + (124 - 40) * u
    by = 52 + (26 - 52) * u - Math.sin(u * Math.PI) * 40
  } else {
    const u = (cyc - 0.55) / 0.45
    bx = 124 - u * 14
    by = u < 0.6 ? 26 + (u / 0.6) ** 2 * 54 : 80 - Math.sin(((u - 0.6) / 0.4) * Math.PI) * 12
  }
  ellipse(c, bx, 82, 4, 1, "rgba(59,42,53,.25)")
  disc(c, bx, by, 5, C.ol)
  disc(c, bx, by, 4, "#f08a3c")
  rect(c, bx - 4, by, 9, 1, "#a34d1c")
  rect(c, bx, by - 4, 1, 9, "#a34d1c")
  px(c, bx - 2, by - 2, "#ffc08a")
  // calendar card
  rbox(c, 10, 8, 40, 36, C.white, undefined, C.paperSh)
  rect(c, 11, 9, 38, 7, "#6554d9")
  rect(c, 18, 6, 2, 4, C.ol)
  rect(c, 40, 6, 2, 4, C.ol)
  for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) rect(c, 14 + k * 6, 19 + r * 6, 3, 3, "#d8d3fb")
  const on = Math.floor(t * 1.5) % 2 === 0
  rect(c, 25, 30, 7, 7, on ? C.mint : C.mintHi)
  px(c, 27, 33, C.ol)
  px(c, 28, 34, C.ol)
  px(c, 29, 33, C.ol)
  px(c, 30, 32, C.ol)
  // map pin
  const py = 40 + Math.round(Math.sin(t * 3) * 2)
  disc(c, 62, py, 5, C.ol)
  disc(c, 62, py, 4, C.pink)
  disc(c, 62, py, 1, C.white)
  rect(c, 61, py + 5, 3, 3, C.ol)
  px(c, 62, py + 8, C.ol)
}

// ---------- Torob Khaneh: houses at dusk, a typed search and intent chips ----------

function torob(c: Ctx, t: number) {
  bands(c, ["#ffcf9e", "#ffb3a7", "#e79bc0", "#b48ad6"])
  disc(c, 120, 58, 12, "#ffe3a8")
  disc(c, 120, 58, 10, C.sun)
  const houses: [number, number, number, string][] = [
    [6, 56, 18, C.rose], [24, 48, 16, C.lilac], [40, 60, 20, C.sky], [60, 44, 18, C.peach], [78, 54, 16, C.mint],
    [94, 50, 22, C.rose], [116, 62, 14, C.lilac], [130, 52, 24, C.sky],
  ]
  for (const [x, top, w, col] of houses) {
    rect(c, x, top, w, 90 - top, C.ol)
    rect(c, x + 1, top + 1, w - 2, 89 - top, col)
    rect(c, x + w - 3, top + 1, 2, 89 - top, tint(col, -0.15))
    for (let wy = top + 4; wy < 86; wy += 6) {
      for (let wx = x + 3; wx < x + w - 4; wx += 5) {
        const lit = Math.sin(wx * 3.1 + wy * 1.7 + Math.floor(t)) > 0
        rect(c, wx, wy, 2, 3, lit ? C.cream : tint(col, -0.3))
      }
    }
  }
  // pin bouncing above one house
  const py = 32 + Math.round(Math.abs(Math.sin(t * 2.5)) * -6)
  ellipse(c, 69, 44, 4, 1, "rgba(59,42,53,.3)")
  disc(c, 69, py, 6, C.ol)
  disc(c, 69, py, 5, C.pink)
  disc(c, 69, py, 2, C.white)
  rect(c, 68, py + 6, 3, 3, C.ol)
  // search bar with typing
  rbox(c, 14, 6, 132, 13, C.white, undefined, C.paperSh)
  disc(c, 21, 12, 3, C.ol)
  disc(c, 21, 12, 2, C.white)
  line(c, 23, 14, 25, 16, C.ol)
  const query = "2 ROOMS NEAR METRO"
  const cyc = t % 6
  const shown = Math.min(query.length, Math.floor(cyc * 7))
  text(c, query.slice(0, shown), 29, 10, C.ol)
  if (Math.floor(t * 3) % 2) rect(c, 29 + shown * 4, 9, 1, 7, C.pink)
  const chips: [string, string][] = [["METRO", C.mint], ["PARKING", C.sun], ["2 ROOMS", C.sky]]
  let cx = 14
  chips.forEach(([label, col], i) => {
    if (cyc > 3 + i * 0.5) tag(c, label, cx, 22, col, C.ol)
    cx += textWidth(label) + 9
  })
}

// ---------- Fahmyar: the City Hub, a round town around a fountain plaza ----------
// Colours come from the game's own city palette (city-theme.ts, day band).

const CITY = {
  skyTop: "#7cb6dd", skyMid: "#bcd9e6", skyHorizon: "#f9e3cd",
  mountain: "#9db69c", mountainFar: "#c2d2c4",
  grass: "#77bd48", grassLight: "#a3db69", grassDark: "#4e8c2c",
  path: "#e9d3b4", pathEdge: "#d0ac86", stone: "#cdc2ae", stoneDark: "#a2947f",
  water: "#3fbccb", waterFoam: "#e4f8f4", lampPost: "#5b3a19", lampGlow: "#fff2c4",
  foliage: "#5da33e", foliageLight: "#8fcc5e", foliageDark: "#3a6f2c", trunk: "#87603d",
  flowerA: "#ff6285", flowerB: "#ffc23d", flowerC: "#ab74ff",
  wall: "#fbf0dc", wallWarm: "#f4dcb4", roof: "#e0603a", roofDark: "#b0442a", window: "#a9e2ff", windowLit: "#ffe6a6", door: "#6e451f",
  cinema: "#c9932e", library: "#f59e0b", castle: "#a855f7", arena: "#ec4899", observatory: "#6366f1", academy: "#0ea5a0",
  robo: "#8b5cf6", roboBlue: "#3b7ddd", roboCream: "#f3e7d3",
}
const HUB_X = 80
const HUB_Y = 62

function cityTree(c: Ctx, x: number, y: number, r: number) {
  rect(c, x - 1, y - 2, 2, 4, CITY.trunk)
  disc(c, x, y - r - 1, r + 1, C.ol)
  disc(c, x, y - r - 1, r, CITY.foliageDark)
  disc(c, x - 1, y - r - 2, r - 1, CITY.foliage)
  px(c, x - 2, y - r - 3, CITY.foliageLight)
  px(c, x - 1, y - r - 4, CITY.foliageLight)
}

// A building on its lawn: walls, a roof, a door, lit windows and the district-coloured ground ring.
function building(c: Ctx, x: number, base: number, w: number, h: number, accent: string, roof: "gable" | "flat" | "dome", t: number) {
  ellipse(c, x + w / 2, base + 1, w / 2 + 3, 2, accent)
  ellipse(c, x + w / 2, base + 1, w / 2 + 1, 1, CITY.grassDark)
  box(c, x, base - h, w, h + 1, CITY.wall, undefined, CITY.wallWarm)
  for (let wx = x + 2; wx < x + w - 3; wx += 4) rect(c, wx, base - h + 3, 2, 2, Math.sin(wx + Math.floor(t)) > 0.2 ? CITY.windowLit : CITY.window)
  rect(c, x + Math.floor(w / 2) - 1, base - 4, 3, 5, CITY.door)
  rect(c, x + 1, base - h + 1, w - 2, 1, accent)
  if (roof === "gable") {
    const rows = Math.ceil(w / 2) + 1
    for (let i = 0; i < rows; i++) rect(c, x - 1 + i, base - h - i, w + 2 - i * 2, 1, i === 0 ? CITY.roofDark : CITY.roof)
  } else if (roof === "dome") {
    disc(c, x + w / 2, base - h, Math.floor(w / 2), C.ol)
    disc(c, x + w / 2, base - h, Math.floor(w / 2) - 1, accent)
    px(c, x + w / 2 - 2, base - h - 3, C.white)
    rect(c, x, base - h, w, 2, CITY.wall)
  } else {
    rect(c, x - 1, base - h - 2, w + 2, 3, accent)
    rect(c, x - 1, base - h - 2, w + 2, 1, C.ol)
  }
}

function roboHouse(c: Ctx, x: number, base: number, t: number) {
  ellipse(c, x, base + 1, 13, 2, CITY.robo)
  ellipse(c, x, base + 1, 11, 1, CITY.grassDark)
  // white dome body with blue side pods
  rect(c, x - 9, base - 12, 18, 13, C.ol)
  disc(c, x, base - 12, 9, C.ol)
  rect(c, x - 8, base - 12, 16, 12, C.white)
  disc(c, x, base - 12, 8, C.white)
  rect(c, x - 11, base - 10, 3, 7, CITY.roboBlue)
  rect(c, x + 8, base - 10, 3, 7, CITY.roboBlue)
  // screen face that smiles and blinks
  rbox(c, x - 6, base - 17, 12, 6, "#1d2a4a")
  if (Math.floor(t * 1.3) % 6 === 0) {
    rect(c, x - 4, base - 14, 2, 1, "#7fe7ff")
    rect(c, x + 2, base - 14, 2, 1, "#7fe7ff")
  } else {
    for (const ex of [x - 3, x + 3]) {
      px(c, ex - 1, base - 14, "#7fe7ff")
      px(c, ex, base - 15, "#7fe7ff")
      px(c, ex + 1, base - 14, "#7fe7ff")
    }
  }
  rect(c, x - 1, base - 13, 3, 1, "#7fe7ff")
  // door and antenna
  rect(c, x - 2, base - 6, 5, 7, CITY.roboBlue)
  px(c, x + 1, base - 3, C.gold)
  rect(c, x, base - 23, 1, 3, C.greyDk)
  disc(c, x, base - 24, 1, C.gold)
  // flag with a star
  rect(c, x + 13, base - 20, 1, 21, CITY.trunk)
  const wave = Math.round(Math.sin(t * 4))
  rect(c, x + 14, base - 20 + wave, 6, 4, CITY.roboBlue)
  px(c, x + 16, base - 19 + wave, C.white)
}

function robo(c: Ctx, x: number, y: number, t: number) {
  const flap = Math.floor(t * 8) % 2
  // glittery purple wings
  rect(c, x - 7, y - 2 + flap, 4, 5 - flap, "#b9a2ff")
  rect(c, x + 4, y - 2 + flap, 4, 5 - flap, "#b9a2ff")
  px(c, x - 6, y - 1 + flap, C.white)
  px(c, x + 6, y + flap, C.white)
  // body and head
  disc(c, x, y + 5, 3, C.ol)
  disc(c, x, y + 5, 2, CITY.roboCream)
  disc(c, x, y, 5, C.ol)
  disc(c, x, y, 4, CITY.roboCream)
  rect(c, x - 3, y - 1, 2, 2, CITY.robo)
  rect(c, x + 2, y - 1, 2, 2, CITY.robo)
  px(c, x - 3, y - 1, C.white)
  px(c, x + 2, y - 1, C.white)
  px(c, x, y + 2, C.pinkSh)
  rect(c, x - 1, y - 4, 3, 1, CITY.robo)
}

function fahmyar(c: Ctx, t: number) {
  // sky and the sage mountains behind the town
  bands(c, [CITY.skyTop, CITY.skyMid, CITY.skyHorizon])
  for (const [ox, oy, sp] of [[0, 8, 3], [80, 16, 2]]) {
    const x = ((t * sp + ox) % 200) - 30
    rect(c, x + 3, oy, 12, 3, C.white)
    rect(c, x, oy + 3, 20, 3, C.white)
  }
  const peaks: [number, number, number, string][] = [
    [8, 18, 22, CITY.mountainFar], [46, 22, 26, CITY.mountainFar], [104, 16, 30, CITY.mountainFar], [150, 20, 22, CITY.mountainFar],
    [26, 26, 20, CITY.mountain], [76, 28, 24, CITY.mountain], [128, 25, 22, CITY.mountain],
  ]
  for (const [peakX, top, half, col] of peaks) {
    for (let y = top; y < 38; y++) {
      const w = Math.round(((y - top) / (38 - top)) * half)
      rect(c, peakX - w, y, w * 2 + 1, 1, col)
    }
    rect(c, peakX, top, 1, 2, C.white)
  }

  // lawn
  rect(c, 0, 36, COVER_W, COVER_H - 36, CITY.grass)
  dither(c, 0, 36, COVER_W, 2, CITY.grassLight)
  for (let i = 0; i < 40; i++) px(c, (i * 37) % 160, 40 + ((i * 23) % 48), i % 3 ? CITY.grassLight : CITY.grassDark)

  // buildings behind the ring, back to front
  building(c, 18, 44, 14, 9, CITY.castle, "flat", t)
  rect(c, 17, 30, 3, 6, CITY.castle)
  rect(c, 30, 30, 3, 6, CITY.castle)
  rect(c, 19, 26, 1, 4, C.ol)
  rect(c, 20, 26, 3, 2, C.pink)
  building(c, 38, 41, 16, 10, CITY.cinema, "flat", t)
  for (let i = 0; i < 6; i++) px(c, 39 + i * 3, 29, Math.floor(t * 4 + i) % 2 ? C.goldHi : CITY.cinema)
  building(c, 106, 41, 16, 10, CITY.library, "gable", t)
  building(c, 128, 44, 14, 10, CITY.observatory, "dome", t)
  if (Math.sin(t * 3) > 0.5) px(c, 140, 27, C.white)
  roboHouse(c, HUB_X, 44, t)

  // ring road, spokes and the entrance road
  ellipse(c, HUB_X, HUB_Y, 60, 19, CITY.pathEdge)
  ellipse(c, HUB_X, HUB_Y, 58, 18, CITY.path)
  ellipse(c, HUB_X, HUB_Y, 49, 13, CITY.pathEdge)
  ellipse(c, HUB_X, HUB_Y, 48, 12, CITY.grass)
  rect(c, HUB_X - 2, HUB_Y - 13, 5, 26, CITY.path)
  rect(c, HUB_X - 49, HUB_Y - 1, 98, 3, CITY.path)
  rect(c, HUB_X - 4, HUB_Y + 18, 9, 12, CITY.path)
  rect(c, HUB_X - 5, HUB_Y + 18, 1, 12, CITY.pathEdge)
  rect(c, HUB_X + 5, HUB_Y + 18, 1, 12, CITY.pathEdge)
  // flower beds inside the ring
  const beds: [number, number, string][] = [[48, 56, CITY.flowerA], [110, 57, CITY.flowerB], [54, 68, CITY.flowerC], [104, 68, CITY.flowerA]]
  for (const [fx, fy, col] of beds) {
    ellipse(c, fx, fy, 5, 2, CITY.grassDark)
    for (let i = -3; i <= 3; i += 2) px(c, fx + i, fy - (i & 1), col)
  }

  // the plaza and its fountain
  ellipse(c, HUB_X, HUB_Y, 15, 5, CITY.stoneDark)
  ellipse(c, HUB_X, HUB_Y, 14, 4, CITY.stone)
  ellipse(c, HUB_X, HUB_Y, 8, 3, C.ol)
  ellipse(c, HUB_X, HUB_Y, 7, 2, CITY.water)
  rect(c, HUB_X - 1, HUB_Y - 7, 3, 7, CITY.stone)
  ellipse(c, HUB_X, HUB_Y - 7, 3, 1, CITY.stoneDark)
  for (let i = 0; i < 8; i++) {
    const u = (t * 1.2 + i / 8) % 1
    const dir = i % 2 ? 1 : -1
    px(c, HUB_X + dir * Math.round(u * 6), HUB_Y - 9 - Math.round(Math.sin(u * Math.PI) * 4) + Math.round(u * 8), u > 0.85 ? CITY.waterFoam : CITY.water)
  }
  px(c, HUB_X + (Math.floor(t * 3) % 2 ? -3 : 3), HUB_Y, CITY.waterFoam)

  // lanterns along the ring road
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + 0.3
    const lx = Math.round(HUB_X + Math.sin(a) * 54)
    const ly = Math.round(HUB_Y + Math.cos(a) * 16)
    rect(c, lx, ly - 6, 1, 6, CITY.lampPost)
    rect(c, lx - 1, ly - 8, 3, 2, Math.sin(t * 2 + i) > -0.6 ? CITY.lampGlow : CITY.windowLit)
  }

  // a student walking the ring
  const a = t * 0.45
  const wx = Math.round(HUB_X + Math.sin(a) * 53)
  const wy = Math.round(HUB_Y + Math.cos(a) * 15)
  const step = Math.floor(t * 6) % 2
  rect(c, wx - 1, wy - 7, 3, 3, C.skin)
  rect(c, wx - 1, wy - 8, 3, 1, C.hair)
  rect(c, wx - 1, wy - 4, 3, 3, "#f06a2e")
  px(c, wx - 1 + step * 2, wy - 1, C.ol)

  // foreground: buildings at the front corners, trees and a bench
  building(c, 6, 84, 16, 11, CITY.arena, "dome", t)
  building(c, 136, 86, 16, 12, CITY.academy, "gable", t)
  cityTree(c, 30, 86, 5)
  cityTree(c, 126, 82, 4)
  cityTree(c, 8, 52, 4)
  cityTree(c, 152, 54, 5)
  cityTree(c, 96, 40, 3)
  rect(c, 104, 86, 10, 2, CITY.trunk)
  rect(c, 105, 88, 1, 2, CITY.trunk)
  rect(c, 112, 88, 1, 2, CITY.trunk)

  // Robo flying over the plaza, leaving sparkles
  const rx = HUB_X + 26 + Math.round(Math.sin(t * 0.8) * 10)
  const ry = 26 + Math.round(Math.sin(t * 2.4) * 2)
  for (let i = 1; i <= 3; i++) {
    if ((Math.floor(t * 6) + i) % 3 === 0) px(c, rx - Math.round(Math.cos(t * 0.8) * 4 * i), ry + 6 + i, C.lilacHi)
  }
  robo(c, rx, ry, t)

  tag(c, "11 GAMES", 4, 4, C.white, C.lilacSh)
}

// ---------- School platform: four app windows inside one shell ----------

function appWindow(c: Ctx, x: number, y: number, w: number, h: number, bar: string, label: string) {
  box(c, x, y, w, h, C.white, undefined, C.paperSh)
  rect(c, x + 1, y + 1, w - 2, 7, bar)
  text(c, label, x + 3, y + 2, C.ol)
}

function school(c: Ctx, t: number) {
  bands(c, ["#ffe59a", "#ffd97a"])
  for (let y = 4; y < 90; y += 8) for (let x = 4; x < 160; x += 8) px(c, x, y, "#f2c45a")
  box(c, 6, 6, 148, 78, C.cream, undefined, C.paperSh)
  rect(c, 7, 7, 146, 6, C.ol)
  for (let i = 0; i < 3; i++) disc(c, 12 + i * 6, 9, 1, [C.pink, C.sun, C.mint][i])
  appWindow(c, 11, 17, 69, 31, C.sky, "ADMIN")
  appWindow(c, 82, 17, 67, 31, C.mint, "TEACHER")
  appWindow(c, 11, 50, 69, 31, C.pinkHi, "STUDENT")
  appWindow(c, 82, 50, 67, 31, C.lilacHi, "PARENT")
  // admin: bars grow
  const g = (t % 3) / 3
  ;[0.5, 0.8, 0.4, 1, 0.7, 0.9].forEach((v, i) => {
    const h = Math.max(1, Math.round(v * 18 * Math.min(1, g * 2)))
    rect(c, 16 + i * 9, 45 - h, 6, h, i % 2 ? C.sky : C.skySh)
  })
  // teacher: checklist ticks in order
  for (let i = 0; i < 3; i++) {
    rect(c, 86, 27 + i * 6, 4, 4, C.ol)
    rect(c, 87, 28 + i * 6, 2, 2, (t % 3) > i * 0.8 ? C.mint : C.white)
    rect(c, 93, 28 + i * 6, 30 + ((i * 13) % 20), 2, C.paperSh)
  }
  // student: report card with A+
  box(c, 16, 59, 30, 19, C.paper, undefined, C.paperSh)
  text(c, "A+", 24, 64, C.pinkSh)
  for (let i = 0; i < 3; i++) rect(c, 50, 61 + i * 5, 24, 2, C.paperSh)
  // parent: chat bubbles pop in
  const step = Math.floor(t % 4)
  if (step >= 1) rbox(c, 86, 60, 30, 8, C.greyHi)
  if (step >= 2) rbox(c, 112, 70, 32, 8, C.mintHi)
  if (step >= 3) rbox(c, 86, 70, 18, 8, C.greyHi)
}

// ---------- Classeh Target: a phone chat, an AI summary and a live cart ----------

function target(c: Ctx, t: number) {
  bands(c, ["#ffc2d1", "#ffd3de"])
  for (let i = 0; i < 12; i++) {
    const x = (i * 37) % 160
    const y = (i * 23) % 90
    rect(c, x, y, 2, 2, "#ffb0c4")
  }
  // phone
  rbox(c, 58, 4, 44, 82, C.ol)
  rect(c, 61, 10, 38, 70, C.white)
  rect(c, 75, 6, 10, 2, C.greyDk)
  rect(c, 61, 10, 38, 8, C.pink)
  disc(c, 66, 14, 2, C.white)
  rect(c, 70, 13, 16, 2, C.white)
  const cyc = t % 5
  const msgs: [number, number, number, string][] = [[63, 21, 24, C.greyHi], [73, 31, 24, "#c8f2d9"], [63, 41, 28, C.greyHi], [69, 51, 28, "#c8f2d9"]]
  msgs.forEach(([x, y, w, col], i) => {
    if (cyc > i * 0.7) {
      rbox(c, x, y, w, 8, col)
      rect(c, x + 3, y + 3, w - 8, 1, C.greySh)
    }
  })
  if (cyc > 3) {
    rbox(c, 63, 62, 34, 12, C.lilacHi)
    text(c, "AI", 66, 65, C.lilacSh)
    rect(c, 76, 66, 18, 1, C.lilacSh)
    const sp = Math.floor(t * 4) % 2
    px(c, 95, 61 + sp, C.sun)
    px(c, 94, 62 + sp, C.sun)
    px(c, 96, 62 + sp, C.sun)
  }
  // cart on the left
  const bob = Math.round(Math.sin(t * 3))
  line(c, 12, 40, 18, 40, C.ol)
  rbox(c, 18, 42, 26, 16, C.white, undefined, C.paperSh)
  for (let x = 22; x < 42; x += 5) rect(c, x, 44, 1, 12, C.paperSh)
  disc(c, 23, 62, 2, C.ol)
  disc(c, 39, 62, 2, C.ol)
  disc(c, 42, 40 + bob, 5, C.ol)
  disc(c, 42, 40 + bob, 4, C.pink)
  text(c, "3", 41, 38 + bob, C.white)
  // invoice on the right
  box(c, 112, 16, 38, 52, C.paper, undefined, C.paperSh)
  rect(c, 116, 21, 18, 2, C.ol)
  for (let i = 0; i < 5; i++) {
    rect(c, 116, 28 + i * 6, 16, 1, C.paperSh)
    rect(c, 138, 28 + i * 6, 8, 1, C.greySh)
  }
  rect(c, 116, 60, 30, 1, C.ol)
  text(c, "VAT", 116, 62, C.pinkSh)
}

// ---------- Classeh website: a browser with a hero slider and blog cards ----------

function website(c: Ctx, t: number) {
  bands(c, ["#ffd3b5", "#ffc59e"])
  box(c, 8, 6, 144, 80, C.white, undefined, C.paperSh)
  rect(c, 9, 7, 142, 8, C.greyHi)
  for (let i = 0; i < 3; i++) disc(c, 14 + i * 6, 11, 1, [C.pink, C.sun, C.mint][i])
  rbox(c, 34, 8, 80, 6, C.white)
  rect(c, 37, 10, 30, 2, C.greySh)
  // slider
  const slides = [C.sky, C.mint, C.lilac]
  const period = 2.4
  const idx = Math.floor(t / period) % slides.length
  const u = (t % period) / period
  const off = u > 0.7 ? ((u - 0.7) / 0.3) * 136 : 0
  c.save()
  c.beginPath()
  c.rect(12, 18, 136, 34)
  c.clip()
  for (let k = 0; k < 2; k++) {
    const col = slides[(idx + k) % slides.length]
    const sx = 12 + k * 136 - off
    rect(c, sx, 18, 136, 34, col)
    disc(c, sx + 110, 28, 5, C.sun)
    for (let i = 0; i < 4; i++) rect(c, sx + 20 + i * 2, 44 - i * 4, 40 - i * 4, 4, tint(col, -0.2))
    rect(c, sx + 60, 36, 30, 16, tint(col, -0.12))
  }
  c.restore()
  for (let i = 0; i < 3; i++) rect(c, 70 + i * 8, 48, 4, 2, i === idx ? C.white : "rgba(255,255,255,.5)")
  // blog cards
  for (let i = 0; i < 3; i++) {
    const x = 12 + i * 46
    box(c, x, 56, 42, 26, C.paper, undefined, C.paperSh)
    rect(c, x + 2, 58, 38, 10, [C.peach, C.rose, C.sky][i])
    rect(c, x + 3, 71, 30, 2, C.ol)
    rect(c, x + 3, 75, 22, 1, C.greySh)
  }
  // SEO magnifier
  const by = Math.round(Math.sin(t * 2) * 2)
  disc(c, 136, 64 + by, 9, C.ol)
  disc(c, 136, 64 + by, 7, C.skyHi)
  px(c, 133, 61 + by, C.white)
  line(c, 142, 70 + by, 148, 76 + by, C.ol)
  line(c, 143, 70 + by, 149, 76 + by, C.ol)
  tag(c, "SEO", 122, 44 + by, C.sun, C.ol)
}

export const COVERS: Record<CoverId, (c: Ctx, t: number) => void> = { uryva, hobzi, torob, fahmyar, school, target, website }
