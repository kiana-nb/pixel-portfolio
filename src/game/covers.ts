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

// ---------- Fahmyar: a floating isometric island with a tree, a house and spinning coins ----------

function isoTile(c: Ctx, x: number, y: number, top: string, side: string, sideSh: string) {
  for (let i = 0; i < 4; i++) {
    rect(c, x + 6 - i * 2, y + i, 4 + i * 4, 1, top)
    rect(c, x + 6 - i * 2, y + 7 - i, 4 + i * 4, 1, top)
  }
  rect(c, x, y + 8, 8, 5, side)
  rect(c, x + 8, y + 8, 8, 5, sideSh)
}

function fahmyar(c: Ctx, t: number) {
  bands(c, ["#8fd0f0", "#a9def5", "#c6ebf8"])
  for (const [ox, oy, sp] of [[0, 14, 6], [70, 30, 4], [120, 8, 5]]) {
    const x = ((t * sp + ox) % 190) - 30
    rect(c, x + 3, oy, 10, 3, C.white)
    rect(c, x, oy + 3, 17, 3, C.white)
  }
  const bob = Math.round(Math.sin(t * 1.4) * 2)
  // island tiles, back to front
  const ox = 52
  const oy = 34 + bob
  for (let r = 0; r < 4; r++) {
    for (let k = 0; k < 4; k++) {
      const x = ox + (k - r) * 8 + 16
      const y = oy + (k + r) * 4
      isoTile(c, x, y, (k + r) % 2 ? C.leaf : C.leafHi, "#b9795a", "#8f5a40")
    }
  }
  // dirt underside
  for (let i = 0; i < 6; i++) rect(c, ox + 18 + i * 2, oy + 33 + i * 2, 28 - i * 4, 2, i % 2 ? "#8f5a40" : "#b9795a")
  // tree
  rect(c, ox + 22, oy + 4, 3, 10, C.woodDk)
  disc(c, ox + 23, oy + 1, 7, C.ol)
  disc(c, ox + 23, oy + 1, 6, C.leafSh)
  disc(c, ox + 22, oy, 4, C.leaf)
  // house
  box(c, ox + 38, oy + 6, 14, 11, C.cream, undefined, C.paperSh)
  for (let i = 0; i < 5; i++) rect(c, ox + 37 + i, oy + 5 - i, 16 - i * 2, 1, i === 0 ? C.ol : C.pink)
  rect(c, ox + 43, oy + 11, 4, 6, C.wood)
  // hopping kid
  const hop = Math.round(Math.abs(Math.sin(t * 4)) * -4)
  const kx = ox + 30
  const ky = oy + 14 + hop
  rect(c, kx, ky, 5, 5, C.skin)
  rect(c, kx, ky - 1, 5, 2, C.hair)
  rect(c, kx, ky + 5, 5, 4, C.sky)
  px(c, kx + 1, ky + 2, C.ol)
  px(c, kx + 3, ky + 2, C.ol)
  // spinning coins
  for (let i = 0; i < 3; i++) {
    const cxp = [36, 112, 128][i]
    const cyp = [30, 22, 48][i] + Math.round(Math.sin(t * 2 + i) * 2)
    const w = Math.max(1, Math.round(Math.abs(Math.cos(t * 3 + i)) * 4))
    rect(c, cxp - w, cyp - 4, w * 2 + 1, 9, C.ol)
    rect(c, cxp - w + 1, cyp - 3, Math.max(1, w * 2 - 1), 7, C.gold)
    if (w > 1) px(c, cxp, cyp - 1, C.goldHi)
  }
  tag(c, "30 FPS", 6, 76, C.white, C.leafSh)
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
