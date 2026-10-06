import { kianaFramesFor } from "./actors"
import { C, dither, disc, ellipse, line, px, rbox, rect, text, textWidth, type Ctx } from "./pixel"

// Animated pixel art for Weekend Lane: a small poster per favourite show (80x112) and a scene per
// sport (160x90). Posters use each story's mood and objects, never its characters.

export const POSTER_W = 80
export const POSTER_H = 112
export const SCENE_W = 160
export const SCENE_H = 90

type Draw = (c: Ctx, t: number) => void

function bands(c: Ctx, w: number, h: number, cols: string[]) {
  const bh = Math.ceil(h / cols.length)
  cols.forEach((col, i) => {
    rect(c, 0, i * bh, w, bh, col)
    if (i > 0) dither(c, 0, i * bh - 2, w, 2, col)
  })
}

function stars(c: Ctx, w: number, h: number, t: number, n = 16, col: string = C.cream) {
  for (let i = 0; i < n; i++) {
    if (Math.sin(t * 2 + i * 1.7) > -0.2) px(c, (i * 37) % w, (i * 23) % h, col)
  }
}

// things falling or drifting down the poster: snow, rain, petals
function fall(c: Ctx, t: number, n: number, speed: number, col: string, drift = 0, len = 1) {
  for (let i = 0; i < n; i++) {
    const x = ((i * 29 + t * drift * (1 + (i % 3))) % (POSTER_W + 10)) - 5
    const y = ((i * 41 + t * speed * (1 + (i % 4) * 0.25)) % (POSTER_H + 10)) - 5
    rect(c, x, y, 1, len, col)
  }
}

function waves(c: Ctx, w: number, y0: number, t: number, cols: [string, string]) {
  rect(c, 0, y0, w, POSTER_H - y0, cols[0])
  for (let row = 0; row < 4; row++) {
    for (let x = 0; x < w; x += 2) {
      const y = y0 + 2 + row * 6 + Math.round(Math.sin(x * 0.15 + t * 2 + row) * 1.5)
      rect(c, x, y, 2, 1, cols[1])
    }
  }
}

function longship(c: Ctx, x: number, y: number, sail: [string, string], scale = 1) {
  const s = scale
  for (let i = 0; i < 5 * s; i++) rect(c, x - 18 * s + i, y + i, 36 * s - i * 2, 1, i === 0 ? C.ol : C.woodSh)
  rect(c, x - 20 * s, y - 4 * s, 3 * s, 5 * s, C.woodDk)
  rect(c, x + 17 * s, y - 4 * s, 3 * s, 5 * s, C.woodDk)
  rect(c, x - 1, y - 26 * s, 2, 26 * s, C.woodDk)
  for (let r = 0; r < 18 * s; r++) rect(c, x - 10 * s, y - 24 * s + r, 20 * s, 1, Math.floor(r / (3 * s)) % 2 ? sail[0] : sail[1])
  for (let i = 0; i < 4; i++) disc(c, x - 12 * s + i * 8 * s, y + 1, Math.max(1, 2 * s), i % 2 ? C.sun : C.sky)
}

const POSTERS: Record<string, Draw> = {
  "The Last Kingdom": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#4a3a7a", "#a85a6a", "#f0a35e", "#ffd27a"])
    disc(c, 56, 58, 10, "#ffe6a6")
    waves(c, POSTER_W, 78, t, ["#3a4a7a", "#6a7ab0"])
    longship(c, 38, 76 + Math.round(Math.sin(t * 1.6) * 2), ["#c93d3d", C.cream])
  },
  "Game of Thrones": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#1e2433", "#2c3448", "#3a4458"])
    // a throne of swords: blades fanned out behind the seat
    for (let i = 0; i < 13; i++) {
      const a = Math.PI * (1.12 + (i / 12) * 0.76)
      const len = 30 + ((i * 7) % 4) * 3
      const x1 = 40 + Math.cos(a) * len
      const y1 = 70 + Math.sin(a) * len
      const x0 = 40 + Math.cos(a) * 14
      const y0 = 70 + Math.sin(a) * 14
      line(c, x0, y0, x1, y1, i % 2 ? "#8d93a6" : "#c8ccd8")
      line(c, x0 + 1, y0, x1 + 1, y1, i % 2 ? "#6a7086" : "#9aa0b4")
      px(c, x1, y1, C.white)
      rect(c, x0 - 1, y0 - 1, 3, 2, C.goldSh)
    }
    rect(c, 21, 60, 38, 30, C.ol)
    rect(c, 22, 61, 36, 28, "#4a4e5e")
    rect(c, 26, 66, 28, 6, "#5c6070")
    rect(c, 26, 72, 28, 1, "#2c3040")
    for (const ax of [20, 54]) {
      rect(c, ax, 62, 6, 14, C.ol)
      rect(c, ax + 1, 63, 4, 12, "#8d93a6")
      rect(c, ax + 1, 63, 4, 1, "#c8ccd8")
    }
    rect(c, 16, 89, 48, 4, "#2c3040")
    rect(c, 12, 93, 56, 4, "#252a38")
    rect(c, 8, 97, 64, 15, "#1e2230")
    // a dragon crossing the sky
    const dx = ((t * 14) % 110) - 15
    const flap = Math.floor(t * 5) % 2
    rect(c, dx, 18, 10, 2, C.ol)
    rect(c, dx + 2, 14 + flap * 3, 3, 4, C.ol)
    rect(c, dx + 6, 14 + flap * 3, 3, 4, C.ol)
    px(c, dx + 10, 17, C.ol)
    fall(c, t, 26, 10, C.white, 3)
  },
  Medici: (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#1b2350", "#2a3570", "#3a4590"])
    stars(c, POSTER_W, 50, t)
    // the dome of Florence
    disc(c, 40, 70, 20, C.ol)
    disc(c, 40, 70, 19, "#c96f4a")
    rect(c, 18, 70, 44, 22, "#1b2350")
    for (const x of [28, 34, 40, 46, 52]) line(c, 40, 51, x, 70, "#f6ecd8")
    rect(c, 37, 46, 6, 6, "#f6ecd8")
    rect(c, 39, 42, 2, 4, C.gold)
    rect(c, 14, 70, 52, 24, "#f6ecd8")
    for (let x = 18; x < 64; x += 8) rect(c, x, 76, 4, 10, "#3a4590")
    // florins rising
    for (let i = 0; i < 4; i++) {
      const y = 100 - ((t * 16 + i * 26) % 100)
      const w = Math.max(1, Math.round(Math.abs(Math.cos(t * 3 + i)) * 3))
      rect(c, 10 + i * 20 - w, y, w * 2 + 1, 6, C.gold)
    }
  },
  "Haikyuu!!": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#f08a3c", "#ffa66e", "#ffd27a"])
    // the court floor
    rect(c, 0, 86, POSTER_W, 26, "#d98a4a")
    for (let x = 0; x < POSTER_W; x += 10) rect(c, x, 86, 5, 26, "#e89a5a")
    rect(c, 0, 98, POSTER_W, 1, C.white)
    // the net, stretched across between two posts
    for (const x of [3, 75]) rect(c, x, 46, 2, 44, C.ol)
    for (let y = 51; y < 66; y += 3) rect(c, 5, y, 70, 1, "#fff1e6")
    for (let x = 6; x < 75; x += 3) rect(c, x, 50, 1, 16, "#fff1e6")
    rect(c, 5, 48, 70, 2, C.white)
    rect(c, 5, 66, 70, 1, C.white)
    // the ball flying back and forth over the net
    const u = (t % 2) / 2
    const dir = Math.floor(t / 2) % 2 ? -1 : 1
    const bx = 40 + dir * (u * 60 - 30)
    const by = 80 - Math.sin(u * Math.PI) * 66
    disc(c, bx, by, 5, C.ol)
    disc(c, bx, by, 4, C.sun)
    rect(c, bx - 4, by - 1, 9, 1, C.sky)
    rect(c, bx - 1, by - 4, 1, 9, C.white)
    text(c, "!!", 64, 10, C.ol)
  },
  "Psycho-Pass": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#0b1630", "#122248", "#1a2e5c"])
    for (let i = 0; i < 7; i++) {
      const h = 30 + ((i * 17) % 40)
      rect(c, i * 12, POSTER_H - h, 11, h, "#0e1a38")
      for (let y = POSTER_H - h + 4; y < POSTER_H - 2; y += 5) for (let x = i * 12 + 2; x < i * 12 + 10; x += 3) if ((x + y + i) % 4) px(c, x, y, "#6ff0ff")
    }
    // a scanner reading a number
    const sx = 40 + Math.sin(t * 0.8) * 20
    const sy = 40 + Math.cos(t * 1.1) * 10
    for (let a = 0; a < 24; a++) px(c, sx + Math.cos((a / 24) * Math.PI * 2) * 10, sy + Math.sin((a / 24) * Math.PI * 2) * 10, "#6ff0ff")
    rect(c, sx - 14, sy, 28, 1, "#6ff0ff")
    rect(c, sx, sy - 14, 1, 28, "#6ff0ff")
    const n = String(Math.floor(40 + Math.abs(Math.sin(t * 0.7)) * 260))
    text(c, n, sx + 6, sy + 6, "#ff6ad5")
    // rain
    for (let i = 0; i < 30; i++) {
      const x = ((i * 23 - t * 20) % (POSTER_W + 20) + POSTER_W + 20) % (POSTER_W + 20) - 10
      const y = (i * 37 + t * 90) % POSTER_H
      line(c, x, y, x - 1, y + 3, "#3a6aa0")
    }
  },
  "Heaven Official's Blessing": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#fff1ee", "#fbd3d3", "#f5b5b5"])
    // a red umbrella
    const ux = 40
    const uy = 46
    for (let r = 0; r < 14; r++) {
      const half = Math.round(Math.sqrt(1 - ((14 - r) / 14) ** 2) * 26)
      rect(c, ux - half, uy - 14 + r, half * 2, 1, r === 0 ? C.ol : r % 4 ? "#c93d3d" : "#a82a2a")
    }
    for (const x of [-18, -6, 6, 18]) line(c, ux, uy - 13, ux + x, uy, "#7a1a1a")
    rect(c, ux, uy, 1, 40, C.ol)
    rect(c, ux - 2, uy + 38, 3, 2, C.ol)
    // white petals and silver butterflies
    fall(c, t, 24, 12, C.white, 5, 2)
    for (let i = 0; i < 3; i++) {
      const bx = 12 + i * 24 + Math.round(Math.sin(t * 1.5 + i) * 6)
      const by = 80 + Math.round(Math.cos(t * 1.2 + i * 2) * 8) - i * 6
      const f = Math.floor(t * 8 + i) % 2
      rect(c, bx - 2, by - f, 2, 2, "#c8ccd8")
      rect(c, bx + 1, by - f, 2, 2, "#c8ccd8")
      px(c, bx, by, C.ol)
    }
  },
  "Steins;Gate": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#0f1f1a", "#16302a", "#1d3d35"])
    // a divergence meter: a row of nixie tubes
    const glitch = Math.floor(t * 2) % 7 === 0
    const digits = glitch ? String(Math.floor(Math.abs(Math.sin(Math.floor(t * 12) * 12.9898)) * 9e6)).padStart(7, "0") : "1048596"
    rect(c, 4, 48, 72, 22, "#2b2433")
    for (let i = 0; i < 8; i++) {
      const x = 7 + i * 9
      rect(c, x, 50, 7, 18, "#3a2a20")
      rect(c, x + 1, 51, 5, 16, "#4a3020")
      const ch = i === 1 ? "." : digits[i > 1 ? i - 1 : 0]
      text(c, ch, x + 2, 56, "#ff9a3c")
    }
    // gears turning
    for (const [gx, gy, r, dir] of [[18, 92, 9, 1], [36, 98, 6, -1], [60, 90, 11, 1]] as const) {
      disc(c, gx, gy, r, "#4a6a5a")
      disc(c, gx, gy, r - 3, "#16302a")
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + t * dir
        rect(c, gx + Math.cos(a) * r - 1, gy + Math.sin(a) * r - 1, 2, 2, "#6a8a7a")
      }
    }
    stars(c, POSTER_W, 40, t, 10, "#6ff0c8")
  },
  Erased: (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#1b2350", "#2a3570", "#4a5590"])
    // a snowy little town
    for (let i = 0; i < 5; i++) {
      const x = i * 17
      const h = 18 + (i % 3) * 6
      rect(c, x, POSTER_H - 20 - h, 15, h, "#2b2e4a")
      for (let k = 0; k < 4; k++) rect(c, x - 1 + k, POSTER_H - 21 - h - k, 17 - k * 2, 1, C.white)
      rect(c, x + 5, POSTER_H - 14 - h, 3, 3, C.sun)
    }
    rect(c, 0, POSTER_H - 20, POSTER_W, 20, "#e8eef8")
    // a clock turning backwards
    disc(c, 40, 34, 14, C.ol)
    disc(c, 40, 34, 12, "#f6ecd8")
    const a = -t * 2.5
    line(c, 40, 34, 40 + Math.cos(a) * 10, 34 + Math.sin(a) * 10, C.ol)
    line(c, 40, 34, 40 + Math.cos(a / 12) * 6, 34 + Math.sin(a / 12) * 6, "#c93d3d")
    // rewind arrows
    for (const ax of [33, 41]) for (let k = 0; k < 4; k++) rect(c, ax + k, 54 - k, 1, k * 2 + 1, C.cream)
    fall(c, t, 30, 9, C.white, 2)
  },
  "Vinland Saga": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#7cb6dd", "#bcd9e6", "#f9e3cd"])
    disc(c, 62, 46, 8, C.cream)
    // a green land on the horizon
    ellipse(c, 60, 66, 20, 4, "#5da33e")
    ellipse(c, 60, 65, 14, 2, "#8fcc5e")
    waves(c, POSTER_W, 68, t, ["#3f88c5", "#a9def5"])
    longship(c, 26, 82 + Math.round(Math.sin(t * 1.4) * 2), [C.white, "#6a7ab0"], 0.7)
    for (let i = 0; i < 3; i++) {
      const bx = (t * 10 + i * 20) % 90 - 5
      px(c, bx, 24 + i * 6, C.ol)
      px(c, bx - 1, 23 + i * 6 - (Math.floor(t * 6) % 2), C.ol)
      px(c, bx + 1, 23 + i * 6 - (Math.floor(t * 6) % 2), C.ol)
    }
  },
  Monster: (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#121218", "#1c1c26", "#262634"])
    // a lone street lamp and a figure in its light
    rect(c, 50, 30, 2, 70, "#4a4a5a")
    rect(c, 44, 28, 10, 3, "#4a4a5a")
    rect(c, 45, 31, 4, 2, "#ffe6a6")
    for (let r = 0; r < 60; r++) {
      const w = Math.round(r * 0.35)
      c.globalAlpha = 0.12
      rect(c, 47 - w, 33 + r, w * 2, 1, "#ffe6a6")
      c.globalAlpha = 1
    }
    rect(c, 36, 74, 8, 22, C.ol)
    disc(c, 40, 70, 4, C.ol)
    rect(c, 0, 96, POSTER_W, 16, "#16161e")
    for (let i = 0; i < 26; i++) {
      const x = (i * 31) % POSTER_W
      const y = (i * 43 + t * 70) % POSTER_H
      line(c, x, y, x, y + 3, "#5a5a7a")
    }
    if (Math.sin(t * 0.9) > 0.85) rect(c, 0, 0, POSTER_W, POSTER_H, "rgba(255,255,255,.08)")
  },
  "Fruits Basket": (c, t) => {
    bands(c, POSTER_W, POSTER_H, ["#fde8ef", "#f9d0dc", "#f5b8c9"])
    // a rice ball with a smile
    const bob = Math.round(Math.sin(t * 2) * 2)
    for (let r = 0; r < 30; r++) rect(c, 40 - Math.round(r * 0.75), 40 + r + bob, Math.round(r * 1.5) + 1, 1, r === 0 ? C.ol : C.white)
    rect(c, 18, 70 + bob, 45, 1, C.ol)
    rect(c, 32, 58 + bob, 17, 12, "#2b3a2b")
    px(c, 36, 52 + bob, C.ol)
    px(c, 44, 52 + bob, C.ol)
    rect(c, 38, 55 + bob, 5, 1, C.pinkSh)
    px(c, 34, 54 + bob, C.pinkHi)
    px(c, 46, 54 + bob, C.pinkHi)
    // twelve little dots for the zodiac, circling
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + t * 0.4
      disc(c, 40 + Math.cos(a) * 30, 56 + Math.sin(a) * 30, 1, [C.lilac, C.mint, C.sun, C.sky][i % 4])
    }
    fall(c, t, 16, 10, C.pinkHi, 4, 2)
  },
}

const blankPoster: Draw = (c, t) => {
  bands(c, POSTER_W, POSTER_H, ["#b497e8", "#d4c2f5"])
  stars(c, POSTER_W, POSTER_H, t)
}

export const drawPoster = (title: string): Draw => POSTERS[title] ?? blankPoster

// ---------- sports: 160x90 scenes, one per sport ----------

function tag(c: Ctx, label: string, x: number, y: number, bg: string, fg: string) {
  const w = textWidth(label) + 6
  rbox(c, x, y, w, 9, bg)
  text(c, label, x + 3, y + 2, fg)
}

const DOBOK = kianaFramesFor({ outfit: "dobok", hair: "hair-brown", extra: "extra-none" })
const GYM = kianaFramesFor({ outfit: "hoodie-lilac", hair: "hair-brown", extra: "extra-none" })

function swimming(c: Ctx, t: number) {
  // the pool hall: tiled wall, bunting, deck
  rect(c, 0, 0, SCENE_W, 22, "#e6f4fb")
  for (let x = 0; x < SCENE_W; x += 8) rect(c, x, 0, 1, 22, "#d2e9f4")
  rect(c, 0, 14, SCENE_W, 1, "#d2e9f4")
  line(c, 0, 3, SCENE_W, 3, C.greyDk)
  for (let x = 2; x < SCENE_W; x += 9) {
    const col = [C.pink, C.sun, C.sky][Math.floor(x / 9) % 3]
    for (let k = 0; k < 3; k++) rect(c, x + k, 4 + k, 6 - k * 2, 1, col)
  }
  rect(c, 0, 22, SCENE_W, 4, "#f6f1e6")
  rect(c, 0, 25, SCENE_W, 1, "#cfc6b8")
  // water, the dark lane lines on the floor, and light moving on top
  rect(c, 0, 26, SCENE_W, 64, "#3fbccb")
  dither(c, 0, 70, SCENE_W, 20, "#36adbd")
  for (const y of [34, 51, 69]) rect(c, 8, y, SCENE_W - 16, 1, "#2f9fb0")
  for (let i = 0; i < 22; i++) {
    const x = (i * 23 + t * 6) % SCENE_W
    const y = 28 + ((i * 13) % 60)
    rect(c, x, y, 3 + (i % 3), 1, "#8fe6ef")
  }
  // lane ropes with bobbing floats
  for (const y of [42, 60, 78]) {
    for (let x = 0; x < SCENE_W; x += 4) {
      const bob = Math.round(Math.sin(t * 3 + x * 0.2) * 0.6)
      rect(c, x, y + bob, 3, 2, Math.floor(x / 4) % 4 < 2 ? C.white : C.pink)
    }
  }
  // Kiana swimming front crawl down lane two
  const x = ((t * 22) % (SCENE_W + 50)) - 25
  const y = 51
  for (let i = 0; i < 6; i++) rect(c, x - 20 - i * 4, y - 1 + (i % 2), 3, 1, i < 3 ? C.white : "#a9eef5")
  const k = Math.floor(t * 8) % 2
  px(c, x - 19, y - 2 - k, C.white)
  px(c, x - 17, y - 3 + k, C.white)
  px(c, x - 21, y - 1 - k, C.white)
  rect(c, x - 16, y - 1, 18, 4, "#2a8fa0")
  disc(c, x + 5, y - 1, 4, C.ol)
  disc(c, x + 5, y - 1, 3, C.skin)
  rect(c, x + 1, y - 5, 8, 3, C.pink)
  rect(c, x + 1, y - 3, 3, 3, C.pink)
  px(c, x + 4, y - 5, C.pinkHi)
  rect(c, x + 6, y - 2, 3, 2, C.ol)
  px(c, x + 7, y - 2, C.skyHi)
  // each arm sweeps forward over the water, half a stroke apart
  for (const ph of [0, 0.5]) {
    const a = ((t * 1.4 + ph) % 1) * Math.PI * 2
    if (a > Math.PI) continue
    const hx = x + 2 - Math.cos(a) * 11
    const hy = y - 2 - Math.sin(a) * 8
    line(c, x + 1, y - 1, hx, hy, C.skin)
    line(c, x + 1, y, hx, hy + 1, C.skinSh)
    if (a > Math.PI * 0.85) for (const dx of [-1, 1]) px(c, hx + dx, hy - 2, C.white)
  }
  tag(c, "NOW", 4, 11, C.pink, C.white)
  tag(c, "GOAL: PRO", SCENE_W - textWidth("GOAL: PRO") - 10, 11, C.ol, C.sun)
}

function gymnastics(c: Ctx, t: number) {
  // the gym: soft wall, a window with drifting clouds, blue mats
  rect(c, 0, 0, SCENE_W, 66, "#f6e3f0")
  rect(c, 0, 40, SCENE_W, 2, "#efd0e6")
  rect(c, 110, 8, 38, 24, C.ol)
  rect(c, 111, 9, 36, 22, C.skyHi)
  for (let i = 0; i < 2; i++) {
    const cx = 111 + ((t * 4 + i * 20) % 44) - 4
    ellipse(c, cx, 15 + i * 8, 4, 1, C.white)
  }
  rect(c, 128, 9, 1, 22, C.ol)
  rect(c, 111, 19, 36, 1, C.ol)
  rect(c, 0, 66, SCENE_W, 24, "#6cb4e8")
  rect(c, 0, 66, SCENE_W, 1, "#3f88c5")
  for (let x = 32; x < SCENE_W; x += 32) rect(c, x, 67, 1, 23, "#5aa0d8")
  // the balance beam
  rect(c, 23, 49, 114, 6, C.ol)
  rect(c, 24, 50, 112, 4, C.wood)
  rect(c, 24, 50, 112, 1, C.woodHi)
  for (const lx of [40, 118]) {
    rect(c, lx, 55, 3, 11, C.greyDk)
    rect(c, lx - 4, 64, 11, 2, C.greyDk)
  }
  // the routine on a loop: walk the beam, a tucked flip, land with arms up
  const u = t % 3.2
  if (u < 1.1) {
    const fx = 34 + (u / 1.1) * 34
    const spr = GYM.side[Math.floor(u * 8) % 4]
    c.drawImage(spr, Math.round(fx - 9), 50 - spr.height)
  } else if (u < 1.9) {
    const f = (u - 1.1) / 0.8
    const spr = GYM.tuck
    c.save()
    c.translate(Math.round(68 + f * 34), Math.round(50 - spr.height / 2 - Math.sin(f * Math.PI) * 22))
    c.rotate(Math.floor(f * 4) * (Math.PI / 2))
    c.drawImage(spr, -Math.floor(spr.width / 2), -Math.floor(spr.height / 2))
    c.restore()
  } else {
    const spr = GYM.stretch
    c.drawImage(spr, 102 - 9, 50 - spr.height)
    for (let i = 0; i < 5; i++) {
      if (Math.sin(t * 9 + i * 2) > 0.2) px(c, 90 + i * 6, 14 + ((i * 7) % 10), C.sun)
    }
    if (u < 2.2) for (const dx of [-12, -9, 9, 12]) px(c, 102 + dx, 48 - Math.round((u - 1.9) * 10), C.white)
  }
  tag(c, "1 YEAR", 4, 4, C.lilacSh, C.white)
}

function taekwondo(c: Ctx, t: number) {
  // the dojang: warm wall, a red and blue circle banner, puzzle mats
  rect(c, 0, 0, SCENE_W, 64, "#f6ecd8")
  rect(c, 0, 46, SCENE_W, 18, "#eadcc0")
  rect(c, 0, 46, SCENE_W, 1, "#d8c8a6")
  rect(c, 118, 6, 30, 34, C.ol)
  rect(c, 119, 7, 28, 32, C.white)
  for (let dy = -8; dy <= 8; dy++) {
    const half = Math.floor(Math.sqrt(64 - dy * dy) + 0.35)
    rect(c, 133 - half, 23 + dy, half * 2 + 1, 1, dy <= 0 ? "#d9574f" : "#4f7fd9")
  }
  for (let x = 0; x < SCENE_W; x += 16) {
    for (let y = 64; y < SCENE_H; y += 13) rect(c, x, y, 16, 13, (x / 16 + (y - 64) / 13) % 2 ? "#d96a5a" : "#5a86c9")
  }
  rect(c, 0, 64, SCENE_W, 1, C.ol)
  // Kiana in her dobok: bounce, kick, the board splits, a new board
  const u = t % 1.8
  const kick = u > 0.9 && u < 1.35
  const kx = 49
  const bob = !kick && Math.floor(u * 4) % 2 ? 1 : 0
  c.drawImage(kick ? DOBOK.kick : DOBOK.sideStand, kx, 64 - 30 - bob)
  // the board holder's stand, with the board at kick height
  rect(c, 72, 49, 6, 2, C.greyDk)
  rect(c, 76, 51, 2, 13, C.greyDk)
  rect(c, 72, 63, 10, 1, C.greyDk)
  const bx = 69
  if (u < 0.9) {
    rect(c, bx - 1, 44, 5, 14, C.ol)
    rect(c, bx, 45, 3, 12, C.woodHi)
    rect(c, bx + 2, 45, 1, 12, C.wood)
  } else {
    const d = Math.min(1, (u - 0.9) / 0.5) * 14
    rect(c, bx + d, 44 - d * 0.7, 3, 6, C.woodHi)
    rect(c, bx + d * 0.5, 51 + d * 0.6, 3, 6, C.woodHi)
    if (u < 1.05) {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        px(c, bx + 1 + Math.cos(a) * 7, 51 + Math.sin(a) * 7, C.sun)
      }
    }
  }
  tag(c, "6 YEARS", 4, 4, C.ol, C.white)
}

export const SPORT_SCENES: Record<string, Draw> = { Swimming: swimming, Gymnastics: gymnastics, Taekwondo: taekwondo }
