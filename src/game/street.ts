import { C, box, disc, dither, ellipse, line, px, rbox, rect, text, textWidth, type Ctx } from "./pixel"
import type { Light, Thing } from "./world"

// Career Street: the scene outside Kiana's door. Each building is a stop on her way so far,
// with the years painted on the sidewalk like a timeline.

export const STREET_W = 1720
// Weekend Lane: Kiana's life off the clock, behind a gate. While it is locked she stops at LANE_LOCK_X.
export const LANE_X = 1130
export const LANE_LOCK_X = 1112
const BASE = 121

// x positions of the career stops; index is the entry in TIMELINE
const STOPS = { home: 81, sampad: 220, uni: 392, mojalal: 556, classeh: 725, next: 905 }

export const STREET_THINGS: Thing[] = [
  { id: "home", label: "go back inside", x: STOPS.home, hit: [50, 56, 54, 66], action: { kind: "go", to: "room" } },
  { id: "sampad", label: "Sampad · 2013", x: STOPS.sampad, hit: [168, 24, 104, 98], action: { kind: "career", index: 3 } },
  { id: "uni", label: "University of Zanjan · 2019", x: STOPS.uni, hit: [330, 30, 124, 92], action: { kind: "career", index: 2 } },
  { id: "mojalal", label: "Mojalal · 2023", x: STOPS.mojalal, hit: [512, 58, 88, 64], action: { kind: "career", index: 1 } },
  { id: "classeh", label: "Classeh · 2023 – now", x: STOPS.classeh, hit: [660, 10, 130, 112], action: { kind: "career", index: 0 } },
  { id: "next", label: "next stop?", x: STOPS.next, hit: [860, 74, 90, 50], action: { kind: "section", id: "contact" } },
  { id: "arcade", label: "arcade · win coins", x: 1055, hit: [1010, 50, 90, 72], action: { kind: "place", id: "arcade" } },
  { id: "laneGate", label: "weekend lane · locked", x: 1130, hit: [1116, 60, 30, 64], action: { kind: "unlock", area: "lane" }, whileLocked: "lane" },
  { id: "cinema", label: "cinema · favourites", x: 1222, hit: [1172, 40, 100, 82], action: { kind: "place", id: "cinema" }, behind: "lane" },
  { id: "gallery", label: "gallery · photos & paintings", x: 1345, hit: [1296, 56, 100, 66], action: { kind: "place", id: "gallery" }, behind: "lane" },
  { id: "sports", label: "sports · swim & more", x: 1480, hit: [1420, 50, 120, 72], action: { kind: "place", id: "sports" }, behind: "lane" },
  { id: "reading", label: "books & webtoons", x: 1615, hit: [1566, 62, 100, 60], action: { kind: "place", id: "reading" }, behind: "lane" },
]

export const CAR_START = 150
export const CAR_Y = 179

// Windows that light up at night, collected while the static layer is drawn.
const LIT: [number, number, number, number][] = []
const lamps = [150, 312, 494, 642, 812, 975, 1160, 1288, 1410, 1556, 1700]

function windowRect(c: Ctx, x: number, y: number, w: number, h: number, glass = C.skyHi) {
  rect(c, x, y, w, h, C.ol)
  rect(c, x + 1, y + 1, w - 2, h - 2, glass)
  px(c, x + 1, y + 1, C.white)
  LIT.push([x + 1, y + 1, w - 2, h - 2])
}

function sign(c: Ctx, label: string, cx: number, y: number, bg: string, fg: string) {
  const w = textWidth(label) + 8
  rbox(c, cx - Math.floor(w / 2), y, w, 9, bg)
  text(c, label, cx - Math.floor(w / 2) + 4, y + 2, fg)
}

function tree(c: Ctx, x: number, base: number, r: number) {
  rect(c, x - 1, base - 10, 3, 10, C.woodDk)
  disc(c, x, base - 10 - r, r + 1, C.ol)
  disc(c, x, base - 10 - r, r, C.leafSh)
  disc(c, x - 1, base - 11 - r, r - 2, C.leaf)
  px(c, x - 3, base - 13 - r, C.leafHi)
}

// ---------- buildings ----------

function home(c: Ctx) {
  const x = 30
  const w = 70
  box(c, x, BASE - 44, w, 45, "#f7c6d0", undefined, "#e8a9b7")
  for (let i = 0; i < 12; i++) rect(c, x - 4 + i * 3, BASE - 45 - i * 2, w + 8 - i * 6, 2, i === 0 ? C.ol : i % 2 ? C.roseSh : C.rose)
  box(c, x + 50, BASE - 66, 8, 14, "#c96f86")
  // window with the curtains from the room
  windowRect(c, x + 8, BASE - 34, 22, 18)
  rect(c, x + 9, BASE - 33, 4, 16, C.rose)
  rect(c, x + 25, BASE - 33, 4, 16, C.rose)
  rect(c, x + 6, BASE - 16, 26, 2, C.white)
  // door
  box(c, x + 44, BASE - 30, 16, 31, C.wood, C.woodHi, C.woodSh)
  disc(c, x + 56, BASE - 15, 1, C.gold)
  rect(c, x + 48, BASE - 26, 8, 6, C.woodSh)
  px(c, x + 52, BASE - 24, C.pink)
  rect(c, x + 41, BASE, 22, 2, C.trimSh)
  sign(c, "HOME", x + 19, BASE - 12, C.cream, C.pinkSh)
}

function sampad(c: Ctx) {
  const x = 168
  const w = 104
  box(c, x, BASE - 62, w, 63, "#f2b8a0", undefined, "#d99a80")
  for (let y = BASE - 58; y < BASE; y += 6) for (let bx = x + 3 + ((y / 6) % 2) * 4; bx < x + w - 6; bx += 8) rect(c, bx, y, 5, 1, "#e4a68c")
  // clock tower
  box(c, x + 40, BASE - 96, 24, 36, "#f6ecd8", undefined, "#e0d2b8")
  for (let i = 0; i < 9; i++) rect(c, x + 39 + i, BASE - 97 - i, 26 - i * 2, 1, i === 0 ? C.ol : "#c96f5a")
  disc(c, x + 52, BASE - 82, 7, C.ol)
  disc(c, x + 52, BASE - 82, 6, C.white)
  line(c, x + 52, BASE - 82, x + 52, BASE - 87, C.ol)
  line(c, x + 52, BASE - 82, x + 56, BASE - 82, C.pinkSh)
  rect(c, x + 52, BASE - 116, 1, 10, C.greyDk)
  // windows on two floors
  for (const fy of [BASE - 54, BASE - 34]) {
    for (const wx of [x + 6, x + 18, x + 70, x + 84]) windowRect(c, wx, fy, 9, 12)
  }
  // doors and sign
  box(c, x + 42, BASE - 22, 20, 23, "#8a5a8f", "#a47aa8", "#6e4672")
  rect(c, x + 51, BASE - 21, 2, 22, C.ol)
  sign(c, "SAMPAD", x + 52, BASE - 36, C.cream, "#c96f5a")
  rect(c, x + 38, BASE, 28, 2, C.trimSh)
}

function university(c: Ctx) {
  const x = 330
  const w = 124
  // dome
  disc(c, x + 62, BASE - 66, 15, C.ol)
  disc(c, x + 62, BASE - 66, 14, "#9ab8d9")
  disc(c, x + 58, BASE - 70, 5, "#c2d6ec")
  rect(c, x + 61, BASE - 86, 3, 6, C.gold)
  // building and pediment
  box(c, x, BASE - 52, w, 53, "#f6ecd8", undefined, "#e6d6bc")
  for (let i = 0; i < 14; i++) rect(c, x - 4 + i * 5, BASE - 53 - i, w + 8 - i * 10, 1, i === 0 ? C.ol : "#e6d6bc")
  sign(c, "ZANJAN UNI", x + 62, BASE - 50, C.white, C.lilacSh)
  // graduation cap on the pediment
  rect(c, x + 57, BASE - 63, 11, 2, C.ol)
  rect(c, x + 60, BASE - 61, 5, 2, C.ol)
  px(c, x + 66, BASE - 60, C.gold)
  // columns
  for (let i = 0; i < 6; i++) {
    const cx = x + 10 + i * 21
    rect(c, cx, BASE - 38, 6, 38, C.ol)
    rect(c, cx + 1, BASE - 38, 4, 38, C.white)
    rect(c, cx + 4, BASE - 38, 1, 38, "#e0d2b8")
    rect(c, cx - 1, BASE - 40, 8, 2, "#e0d2b8")
  }
  for (let i = 0; i < 5; i++) windowRect(c, x + 18 + i * 21, BASE - 32, 8, 14)
  rect(c, x + 4, BASE, w - 8, 2, C.trimSh)
  rect(c, x + 8, BASE + 2, w - 16, 1, C.trimSh)
}

function mojalal(c: Ctx) {
  const x = 512
  const w = 88
  box(c, x, BASE - 56, w, 57, "#fff1c9", undefined, "#ecd9a8")
  // upper floor windows with flower boxes
  for (const wx of [x + 8, x + 34, x + 60]) {
    windowRect(c, wx, BASE - 50, 18, 12)
    rect(c, wx, BASE - 38, 18, 3, C.wood)
    for (let i = 0; i < 6; i++) px(c, wx + 2 + i * 3, BASE - 39, i % 2 ? C.pink : C.sun)
  }
  sign(c, "MOJALAL", x + 44, BASE - 33, C.mint, C.ol)
  // striped awning
  for (let i = 0; i < 11; i++) rect(c, x + 2 + i * 8, BASE - 24, 8, 5, i % 2 ? C.white : C.mint)
  rect(c, x + 2, BASE - 25, 88, 1, C.ol)
  for (let i = 0; i < 11; i++) disc(c, x + 6 + i * 8, BASE - 19, 2, i % 2 ? C.white : C.mint)
  // storefront glass with a "for rent" paper and a little house
  windowRect(c, x + 6, BASE - 16, 44, 16, "#c8ecf8")
  rect(c, x + 10, BASE - 13, 10, 8, C.paper)
  rect(c, x + 12, BASE - 11, 6, 1, C.ol)
  rect(c, x + 12, BASE - 9, 4, 1, C.ol)
  rect(c, x + 34, BASE - 8, 8, 6, C.rose)
  for (let i = 0; i < 4; i++) rect(c, x + 33 + i, BASE - 9 - i, 10 - i * 2, 1, C.pinkSh)
  box(c, x + 58, BASE - 18, 16, 19, C.wood, C.woodHi, C.woodSh)
  disc(c, x + 70, BASE - 9, 1, C.gold)
}

function classeh(c: Ctx) {
  const x = 660
  const w = 130
  box(c, x, BASE - 100, w, 101, C.lilac, C.lilacHi, C.lilacSh)
  for (let r = 0; r < 7; r++) {
    for (let k = 0; k < 6; k++) windowRect(c, x + 7 + k * 20, BASE - 92 + r * 11, 16, 8, r % 2 ? "#bfe6f7" : C.skyHi)
  }
  // balconies with plants
  for (const bx of [x + 6, x + 86]) {
    rect(c, bx, BASE - 48, 38, 2, C.white)
    for (let i = 0; i < 6; i++) rect(c, bx + 2 + i * 6, BASE - 51, 3, 3, i % 2 ? C.leaf : C.leafHi)
  }
  // entrance
  box(c, x + 48, BASE - 16, 34, 17, "#c8ecf8", C.white, C.skySh)
  rect(c, x + 64, BASE - 16, 2, 17, C.ol)
  rect(c, x + 44, BASE - 18, 42, 3, C.lilacSh)
  // rooftop sign and antenna
  rect(c, x + 100, BASE - 120, 2, 20, C.greyDk)
  box(c, x + 26, BASE - 112, 78, 13, C.white, undefined, C.paperSh)
  text(c, "CLASSEH", x + 65 - Math.floor(textWidth("CLASSEH") / 2), BASE - 108, C.pinkSh)
  rect(c, x + 2, BASE, w - 4, 2, C.trimSh)
}

function nextLot(c: Ctx) {
  const x = 840
  // a fenced lot waiting for the next stop
  rect(c, x, BASE - 2, 140, 3, "#7cbf5a")
  for (let fx = x; fx < x + 140; fx += 7) {
    rect(c, fx, BASE - 14, 3, 14, C.ol)
    rect(c, fx + 1, BASE - 13, 1, 13, C.white)
  }
  rect(c, x, BASE - 10, 140, 2, C.white)
  rect(c, x, BASE - 10, 140, 1, C.ol)
  // signpost
  rect(c, x + 64, BASE - 44, 3, 44, C.woodDk)
  box(c, x + 34, BASE - 46, 62, 22, C.cream, undefined, C.paperSh)
  text(c, "YOUR TEAM?", x + 65 - Math.floor(textWidth("YOUR TEAM?") / 2), BASE - 42, C.pinkSh)
  text(c, "NEXT STOP", x + 65 - Math.floor(textWidth("NEXT STOP") / 2), BASE - 34, C.lilacSh)
  for (let i = 0; i < 8; i++) {
    const fx = x + 10 + i * 16
    rect(c, fx, BASE - 4, 1, 3, C.leafSh)
    px(c, fx, BASE - 5, [C.pink, C.sun, C.lilac][i % 3])
  }
}

// ---------- the arcade and Weekend Lane ----------

function arcade(c: Ctx) {
  const x = 1010
  box(c, x, BASE - 66, 90, 67, "#3a2f6b", "#5a4a9a", "#2a2252")
  box(c, x + 6, BASE - 78, 78, 16, "#2b2433")
  text(c, "ARCADE", x + 45 - Math.floor(textWidth("ARCADE") / 2), BASE - 73, C.pinkHi)
  // two cabinets seen through the window
  windowRect(c, x + 8, BASE - 52, 74, 30, "#1f2340")
  for (const cx of [x + 18, x + 52]) {
    box(c, cx, BASE - 48, 18, 24, C.lilac, C.lilacHi, C.lilacSh)
    rect(c, cx + 3, BASE - 45, 12, 8, C.mint)
    rect(c, cx + 5, BASE - 34, 2, 2, C.pink)
    rect(c, cx + 10, BASE - 34, 2, 2, C.sun)
  }
  box(c, x + 36, BASE - 18, 18, 19, "#5a4a9a", C.lilac, "#2a2252")
  sign(c, "COINS", x + 45, BASE - 62, C.sun, C.ol)
}

function laneGate(c: Ctx) {
  const x = 1116
  box(c, x, BASE - 58, 6, 59, C.wood, C.woodHi, C.woodSh)
  box(c, x + 24, BASE - 58, 6, 59, C.wood, C.woodHi, C.woodSh)
  box(c, x - 6, BASE - 70, 42, 13, C.cream, undefined, C.paperSh)
  text(c, "WEEKEND", x + 15 - Math.floor(textWidth("WEEKEND") / 2), BASE - 68, C.pinkSh)
  text(c, "LANE", x + 15 - Math.floor(textWidth("LANE") / 2), BASE - 62, C.lilacSh)
  for (let i = 0; i < 6; i++) px(c, x - 4 + i * 8, BASE - 72, [C.pink, C.sun, C.mint][i % 3])
}

function cinema(c: Ctx) {
  const x = 1172
  box(c, x, BASE - 70, 100, 71, "#c96f5a", "#e08a74", "#9a4f3e")
  // marquee
  box(c, x + 10, BASE - 82, 80, 18, C.cream, undefined, C.paperSh)
  text(c, "CINEMA", x + 50 - Math.floor(textWidth("CINEMA") / 2), BASE - 79, "#c96f5a")
  text(c, "NOW SHOWING", x + 50 - Math.floor(textWidth("NOW SHOWING") / 2), BASE - 72, C.ol)
  // posters
  const posters: [string, string][] = [[C.lilac, C.lilacSh], [C.sky, C.skySh], [C.peach, C.peachSh]]
  posters.forEach(([col, shade], i) => {
    box(c, x + 10 + i * 30, BASE - 56, 20, 28, col, undefined, shade)
    rect(c, x + 14 + i * 30, BASE - 50, 12, 10, C.white)
    rect(c, x + 14 + i * 30, BASE - 36, 12, 2, C.ol)
  })
  box(c, x + 40, BASE - 20, 20, 21, "#7a2f3e", "#9a4f5e", "#5a1f2e")
  rect(c, x + 49, BASE - 19, 2, 20, C.gold)
}

function gallery(c: Ctx) {
  const x = 1296
  box(c, x, BASE - 56, 100, 57, C.white, undefined, C.greyHi)
  for (let i = 0; i < 12; i++) rect(c, x - 4 + i * 5, BASE - 57 - i, 108 - i * 10, 1, i === 0 ? C.ol : C.greyHi)
  sign(c, "GALLERY", x + 50, BASE - 52, C.ol, C.white)
  // framed pictures in the windows
  const art: [string, string][] = [[C.sky, C.sun], [C.mint, C.pink], [C.peach, C.lilac]]
  art.forEach(([bg, fg], i) => {
    box(c, x + 8 + i * 31, BASE - 38, 22, 18, C.gold, undefined, C.goldSh)
    rect(c, x + 10 + i * 31, BASE - 36, 18, 14, bg)
    disc(c, x + 19 + i * 31, BASE - 30, 3, fg)
  })
  box(c, x + 42, BASE - 16, 16, 17, C.greySh, C.grey, C.greyDk)
}

function sports(c: Ctx) {
  const x = 1420
  box(c, x, BASE - 64, 120, 65, "#6cb4e8", "#a9def5", "#3f88c5")
  sign(c, "SPORTS", x + 60, BASE - 60, C.white, C.skySh)
  for (let i = 0; i < 5; i++) windowRect(c, x + 8 + i * 22, BASE - 46, 16, 12)
  // a swimmer on the wall
  disc(c, x + 60, BASE - 22, 4, C.skin)
  rect(c, x + 56, BASE - 26, 8, 2, C.pink)
  rect(c, x + 50, BASE - 18, 20, 3, "#c8ecf8")
  for (let i = 0; i < 4; i++) px(c, x + 48 + i * 7, BASE - 19, C.white)
  // the pool in front, with lane ropes
  rect(c, x + 6, BASE - 4, 108, 6, "#3fbccb")
  for (let i = 0; i < 108; i += 4) px(c, x + 6 + i, BASE - 2, i % 8 ? C.pinkHi : C.white)
}

function readingCafe(c: Ctx) {
  const x = 1566
  box(c, x, BASE - 58, 100, 59, "#fff1c9", undefined, "#ecd9a8")
  for (let i = 0; i < 11; i++) rect(c, x + 2 + i * 9, BASE - 52, 9, 6, i % 2 ? C.white : C.lilac)
  sign(c, "BOOKS & TOONS", x + 50, BASE - 44, C.lilac, C.white)
  windowRect(c, x + 6, BASE - 32, 50, 22, "#c8ecf8")
  // a shelf of books in the window
  const books = [C.pink, C.sky, C.sun, C.mint, C.lilac, C.peach, C.rose, C.sky]
  books.forEach((col, i) => rect(c, x + 9 + i * 5, BASE - 26 - (i % 3), 4, 14 + (i % 3), col))
  box(c, x + 66, BASE - 20, 18, 21, C.wood, C.woodHi, C.woodSh)
  // a tiny phone with a webtoon panel
  box(c, x + 88, BASE - 30, 8, 14, C.ol)
  rect(c, x + 89, BASE - 29, 6, 5, C.pinkHi)
  rect(c, x + 89, BASE - 23, 6, 5, C.skyHi)
}

// Closed gate bars across Weekend Lane until it is unlocked.
export function drawLaneLock(c: Ctx) {
  const x = 1116
  for (let bx = x + 7; bx < x + 24; bx += 4) rect(c, bx, BASE - 54, 2, 54, C.greyDk)
  rect(c, x + 6, BASE - 40, 18, 2, C.greyDk)
  box(c, x + 10, BASE - 30, 10, 9, C.gold, C.goldHi, C.goldSh)
  rect(c, x + 12, BASE - 34, 6, 4, C.ol)
  rect(c, x + 13, BASE - 33, 4, 3, "#ead9c6")
  px(c, x + 15, BASE - 27, C.ol)
}

// ---------- static layer ----------

export function drawStreetStatic(c: Ctx) {
  LIT.length = 0
  // grass strip behind the sidewalk
  rect(c, 0, BASE - 3, STREET_W, 8, "#8fcf6e")
  for (let x = 0; x < STREET_W; x += 5) px(c, x + 2, BASE - 4, "#6fb34f")
  home(c)
  sampad(c)
  university(c)
  mojalal(c)
  classeh(c)
  nextLot(c)
  arcade(c)
  laneGate(c)
  cinema(c)
  gallery(c)
  sports(c)
  readingCafe(c)
  tree(c, 1150, BASE + 1, 8)
  tree(c, 1705, BASE + 1, 9)
  tree(c, 300, BASE + 1, 9)
  tree(c, 483, BASE + 1, 8)
  tree(c, 820, BASE + 1, 7)
  tree(c, 14, BASE + 1, 8)

  // sidewalk
  rect(c, 0, BASE + 3, STREET_W, 170 - BASE - 3, "#ead9c6")
  rect(c, 0, BASE + 3, STREET_W, 1, "#d9c4ad")
  for (const y of [138, 154]) rect(c, 0, y, STREET_W, 1, "#d9c4ad")
  for (let row = 0; row < 3; row++) {
    const y0 = [BASE + 4, 139, 155][row]
    const y1 = [138, 154, 170][row]
    for (let x = (row % 2) * 12; x < STREET_W; x += 24) rect(c, x, y0, 1, y1 - y0, "#d9c4ad")
  }
  // curb and road
  rect(c, 0, 170, STREET_W, 3, "#c9b8a6")
  rect(c, 0, 170, STREET_W, 1, "#f1e6da")
  rect(c, 0, 173, STREET_W, 7, "#4f4a63")
  for (let x = 6; x < STREET_W; x += 22) rect(c, x, 177, 11, 1, "#f1e6da")

  // the timeline painted on the sidewalk
  for (let x = 110; x < 960; x += 4) px(c, x, 146, C.pinkHi)
  const years: [number, string][] = [[STOPS.sampad, "2013"], [STOPS.uni, "2019"], [STOPS.mojalal, "2023"], [STOPS.classeh, "2023-NOW"]]
  for (const [x, y] of years) {
    disc(c, x, 146, 3, C.ol)
    disc(c, x, 146, 2, C.pink)
    sign(c, y, x, 150, C.white, C.pinkSh)
  }
  sign(c, "CAREER ST.", 118, 128, C.lilac, C.white)

  // street lamps
  for (const x of lamps) {
    rect(c, x, BASE - 30, 2, 34, "#5b3a19")
    rect(c, x - 2, BASE - 34, 6, 4, "#5b3a19")
    rect(c, x - 1, BASE - 33, 4, 2, "#fff2c4")
  }
  // a bench and a hydrant
  rect(c, 614, 132, 20, 2, C.woodSh)
  rect(c, 614, 128, 20, 2, C.wood)
  rect(c, 616, 134, 2, 4, C.ol)
  rect(c, 630, 134, 2, 4, C.ol)
  box(c, 316, 112, 6, 9, "#e8555a", "#ff8a8a", "#b83a40")
}

// ---------- sky, drawn behind the static layer ----------

const STARS = Array.from({ length: 40 }, (_, i) => ({ x: (i * 97) % 1200, y: (i * 37) % 70, p: i * 0.7 }))

export function drawStreetSky(c: Ctx, night: number, t: number, cam: number, viewW: number) {
  const bands = (cols: string[]) => {
    const h = Math.ceil(BASE / cols.length)
    cols.forEach((col, i) => {
      rect(c, cam, i * h, viewW, h, col)
      if (i > 0) dither(c, cam, i * h - 2, viewW, 2, col)
    })
  }
  if (night < 1) {
    bands(["#8fd0f0", "#a9def5", "#c8ecf8", "#fde8d8"])
    disc(c, cam + viewW - 50, 26, 8, C.cream)
    disc(c, cam + viewW - 50, 26, 6, C.sun)
    for (const [ox, oy, sp] of [[0, 14, 4], [160, 30, 3], [320, 20, 5]]) {
      const x = cam + ((t * sp + ox - cam * 0.2) % (viewW + 60)) - 30
      rect(c, x + 3, oy, 14, 3, C.white)
      rect(c, x, oy + 3, 22, 4, C.white)
    }
  }
  if (night > 0) {
    c.globalAlpha = night
    bands(["#1b1c4c", "#24255c", "#2b2864", "#4a3a7a"])
    for (const s of STARS) {
      const x = cam + ((s.x - cam * 0.1) % (viewW + 40))
      if (Math.sin(t * 2 + s.p) > -0.3) px(c, x, s.y, C.cream)
    }
    disc(c, cam + viewW - 50, 24, 6, C.cream)
    disc(c, cam + viewW - 47, 22, 5, "#1b1c4c")
    c.globalAlpha = 1
  }
  // a far skyline that drifts slower than the street
  const par = cam * 0.5
  for (let i = 0; i < 26; i++) {
    const bx = i * 46 - (par % 46) + cam - 46
    const h = 18 + ((i * 7 + Math.floor(par / 46)) % 5) * 8
    rect(c, bx, BASE - h, 40, h, night > 0.5 ? "#3a2f6b" : "#d9cde6")
    if (night > 0.5) {
      for (let wy = BASE - h + 4; wy < BASE - 4; wy += 6) for (let wx = bx + 4; wx < bx + 36; wx += 8) if ((wx + wy + i) % 3 === 0) rect(c, wx, wy, 2, 2, "#ffd27a")
    }
  }
}

// ---------- animated bits ----------

export function drawStreetAnimated(c: Ctx, t: number, night: number) {
  // lit windows at night
  if (night > 0) {
    c.globalAlpha = night
    LIT.forEach(([x, y, w, h], i) => {
      if ((i * 7) % 5 < 3) rect(c, x, y, w, h, i % 4 ? "#ffd27a" : "#ffe6a6")
    })
    c.globalAlpha = 1
  }
  // flag on the school tower
  const wave = Math.round(Math.sin(t * 4))
  rect(c, 221, BASE - 116 + wave, 8, 5, C.sky)
  rect(c, 221, BASE - 114 + wave, 8, 1, C.white)
  // blinking light on the office antenna
  if (Math.floor(t * 1.5) % 2) rect(c, 759, BASE - 122, 3, 2, "#ff5a5a")
  // birds
  for (let i = 0; i < 3; i++) {
    const bx = ((t * 22 + i * 340) % (STREET_W + 80)) - 40
    const by = 30 + i * 9 + Math.round(Math.sin(t * 3 + i) * 2)
    const up = Math.floor(t * 6 + i) % 2
    px(c, bx, by, C.ol)
    px(c, bx - 1, by - up, C.ol)
    px(c, bx + 1, by - up, C.ol)
  }
}

export function streetLights(night: number, t: number): Light[] {
  if (night <= 0) return []
  const out: Light[] = lamps.map((x) => ({ x: x + 1, y: BASE - 30, r: 48, rgb: [255, 214, 140] as [number, number, number], power: 0.95 }))
  out.push({ x: 725, y: BASE - 106, r: 50, rgb: [255, 140, 190], power: 0.8 + Math.sin(t * 3) * 0.05 })
  for (const x of [220, 392, 556, 725, 1222, 1345, 1480, 1615]) out.push({ x, y: BASE - 30, r: 60, rgb: [255, 210, 130], power: 0.5 })
  out.push({ x: 1055, y: BASE - 72, r: 50, rgb: [255, 120, 200], power: 0.85 + Math.sin(t * 6) * 0.08 })
  out.push({ x: 1222, y: BASE - 76, r: 46, rgb: [255, 220, 150], power: 0.85 })
  return out
}

// ---------- the car ----------

export function drawCar(c: Ctx, x: number, dir: number, t: number, moving: boolean, driver: boolean) {
  const f = dir >= 0 ? 1 : -1
  const xo = Math.round(x)
  const bob = moving && Math.floor(t * 5) % 2 ? -1 : 0
  const top = CAR_Y - 24 + bob
  ellipse(c, xo, CAR_Y, 19, 1, "rgba(0,0,0,.3)")
  // cabin with windows
  rbox(c, xo - 11, top, 20, 11, C.mint, C.mintHi)
  rect(c, xo - 8 + (f > 0 ? 9 : 0), top + 2, 7, 6, "#c8ecf8")
  rect(c, xo - 8 + (f > 0 ? 0 : 9), top + 2, 7, 6, "#c8ecf8")
  if (driver) {
    const hx = xo + (f > 0 ? 3 : -5)
    rect(c, hx, top + 4, 4, 4, C.skin)
    rect(c, hx, top + 2, 4, 2, C.hair)
    px(c, hx + (f > 0 ? 0 : 3), top + 4, C.pink)
    px(c, hx + (f > 0 ? 3 : 0), top + 5, C.ol)
  }
  // body
  rbox(c, xo - 19, top + 9, 38, 11, C.mint, C.mintHi, C.mintSh)
  rect(c, xo - 18, top + 14, 36, 1, C.mintSh)
  rect(c, xo + f * 17 - (f > 0 ? 1 : 0), top + 11, 2, 3, C.sun)
  rect(c, xo - f * 17 - (f > 0 ? 1 : 0), top + 11, 2, 3, "#ff6a6a")
  rect(c, xo - 3, top + 12, 1, 4, C.mintSh)
  // wheels with a turning hubcap
  for (const wx of [xo - 11, xo + 11]) {
    disc(c, wx, CAR_Y - 4, 4, C.ol)
    disc(c, wx, CAR_Y - 4, 2, C.grey)
    const a = moving ? t * 14 * f : 0
    px(c, wx + Math.round(Math.cos(a) * 2), CAR_Y - 4 + Math.round(Math.sin(a) * 2), C.ol)
  }
  // a tiny heart sticker
  px(c, xo - f * 9, top + 12, C.pink)
}

