import { C, disc, makeSprite, mirror, px, rect, type Ctx, type Palette } from "./pixel"

// ---------- Kiana: 18x30, front-facing chibi with a bun and pink headphones ----------

const KIANA_PAL: Palette = {
  o: C.ol, h: C.hair, H: C.hairHi, p: C.pink, P: C.pinkSh, s: C.skin, S: C.skinSh, e: C.ol, w: C.white,
  b: C.pinkHi, m: C.mouth, c: C.hoodie, C: C.hoodieSh, k: C.hoodieHi, q: C.pinkHi, j: C.jeans, J: C.jeansSh,
  f: C.shoe, F: C.shoeSh,
}

const HEAD = mirror([
  "......ooo",
  ".....ohhH",
  ".....ohhh",
  "...oooppp",
  "..ohhhhhh",
  ".ohhHhhhh",
  ".ohhhhhhh",
  "oPhhhhhhh",
  "oPhhssshh",
  "oPhssssss",
  "oPhsseess",
  "oPhssewss",
  "oPhbseess",
  ".ohsssssm",
  ".ohSsssss",
  "...oSSsss",
  "......oos",
])
// Put both eye highlights on the same side, and add a hair clip so flipping shows the facing direction.
HEAD[11] = HEAD[11].slice(0, 11) + "ew" + HEAD[11].slice(13)
HEAD[5] = HEAD[5].slice(0, 4) + "pp" + HEAD[5].slice(6)

const BLINK = [...HEAD]
BLINK[10] = mirror(["oPhssssss"])[0]
BLINK[11] = mirror(["oPhsseess"])[0]
BLINK[12] = mirror(["oPhbsssss"])[0]

const BODY = mirror([
  "...oocckk",
  "..occcckk",
  ".occcccqc",
  ".ocCcccqc",
  ".ocCccccc",
  ".osCcckkk",
  ".oSoccccc",
  "..ooCCCCC",
  "....ojjjj",
])

const LEGS_IDLE = mirror(["....ojJo.", "....osSo.", "...offFo.", "...ooooo."])
const LEGS_A = ["....ojJo..oJjo....", "...offFo..oSso....", "...ooooo..oFffo...", "..........ooooo..."]
const LEGS_B = ["....ojJo..oJjo....", "....osSo..oFffo...", "...offFo..ooooo...", "...ooooo.........."]

export const KIANA_W = 18
export const KIANA_H = 30

// ---------- a small painter for sprites built from shapes ----------

class Grid {
  cells: string[][]
  constructor(
    public w: number,
    public h: number,
    from?: string[],
  ) {
    this.cells = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => from?.[y]?.[x] ?? "."))
  }
  set(x: number, y: number, ch: string) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.cells[y][x] = ch
  }
  row(y: number, x0: number, x1: number, ch: string) {
    for (let x = x0; x <= x1; x++) this.set(x, y, ch)
  }
  fill(x: number, y: number, w: number, h: number, ch: string) {
    for (let yy = y; yy < y + h; yy++) this.row(yy, x, x + w - 1, ch)
  }
  // Outline every empty cell that touches a painted one.
  outline(ch = "o") {
    const add: [number, number][] = []
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        if (this.cells[y][x] !== ".") continue
        const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const c = this.cells[y + dy]?.[x + dx]
          return c !== undefined && c !== "." && c !== ch
        })
        if (n) add.push([x, y])
      }
    }
    for (const [x, y] of add) this.cells[y][x] = ch
    return this
  }
  rows() {
    return this.cells.map((r) => r.join(""))
  }
}

// ---------- Kiana from the side, facing right ----------

function sideHead(g: Grid) {
  // bun at the back of the head
  g.row(2, 3, 5, "h")
  g.row(3, 2, 6, "h")
  g.row(4, 2, 6, "h")
  g.row(5, 3, 5, "h")
  g.set(4, 3, "H")
  // hair
  g.row(4, 7, 12, "h")
  g.row(5, 5, 14, "h")
  for (let y = 6; y <= 12; y++) g.row(y, 4, 15, "h")
  g.row(13, 5, 14, "h")
  g.row(14, 6, 9, "h")
  g.set(10, 5, "H")
  g.set(11, 5, "H")
  g.set(6, 7, "H")
  // face, with a little nose
  g.row(8, 11, 14, "s")
  g.row(9, 10, 15, "s")
  g.row(10, 10, 16, "s")
  g.row(11, 10, 15, "s")
  g.row(12, 10, 15, "s")
  g.row(13, 10, 14, "s")
  g.row(14, 10, 13, "s")
  g.set(13, 10, "e")
  g.set(13, 11, "e")
  g.set(12, 9, "h")
  g.set(14, 12, "b")
  g.set(14, 13, "m")
  // headphones: the band over the top and the cup on the ear
  g.row(3, 8, 9, "p")
  for (let y = 4; y <= 8; y++) g.set(8, y, "p")
  g.fill(7, 9, 3, 4, "P")
  g.set(8, 9, "p")
  // neck
  g.row(15, 9, 11, "s")
}

function sideBody(g: Grid, arm: number) {
  g.row(16, 5, 12, "c")
  for (let y = 17; y <= 23; y++) {
    g.row(y, 6, 12, "c")
    g.set(6, y, "C")
    g.set(12, y, "k")
  }
  g.set(5, 17, "c")
  g.set(5, 18, "C")
  g.set(11, 17, "q")
  g.set(11, 18, "q")
  g.row(24, 6, 12, "C")
  g.row(25, 7, 12, "j")
  // the arm swings from the shoulder
  for (let r = 0; r <= 5; r++) {
    const x = 8 + Math.round((arm * r) / 5)
    g.set(x, 17 + r, "C")
    g.set(x + 1, 17 + r, "C")
  }
  g.fill(8 + arm, 23, 2, 1, "s")
}

type Leg = { hip: number; knee: number; foot: number; lift: boolean }

function sideLeg(g: Grid, l: Leg, cloth: string) {
  g.row(26, l.hip, l.hip + 1, cloth)
  if (l.lift) {
    g.row(27, l.foot, l.foot + 2, "f")
    return
  }
  g.row(27, l.knee, l.knee + 1, cloth)
  g.row(28, l.foot, l.foot + 3, "f")
  g.set(l.foot, 28, "F")
}

function sideFrame(arm: number, near: Leg, far: Leg) {
  const g = new Grid(KIANA_W, KIANA_H)
  sideLeg(g, far, "J")
  sideHead(g)
  sideBody(g, arm)
  sideLeg(g, near, "j")
  return g.outline().rows()
}

// a high front kick: the near leg up and out in front, the arm in guard
function kickFrame() {
  const g = new Grid(KIANA_W, KIANA_H)
  sideLeg(g, { hip: 8, knee: 8, foot: 6, lift: false }, "J")
  sideHead(g)
  sideBody(g, 3)
  for (let i = 0; i < 4; i++) {
    g.set(12 + i, 24 - i, "j")
    g.set(12 + i, 25 - i, "j")
  }
  g.fill(15, 19, 2, 2, "f")
  return g.outline().rows()
}

const STRIDE_FRONT: Leg = { hip: 10, knee: 11, foot: 11, lift: false }
const STRIDE_BACK: Leg = { hip: 8, knee: 7, foot: 5, lift: false }
const PASS_STRAIGHT: Leg = { hip: 9, knee: 9, foot: 9, lift: false }
const PASS_LIFT: Leg = { hip: 8, knee: 8, foot: 7, lift: true }

// Front-facing poses built from the front sprite.
function frontWith(rows: string[], edit: (g: Grid) => void) {
  const g = new Grid(KIANA_W, rows.length, rows)
  edit(g)
  return g.rows()
}

const SIT_LEGS = ["...offFo..oFffo...", "...ooooo..ooooo..."]
// Two extra rows on top give the raised hands room; frames are placed by their own height.
const STRETCH = frontWith(["..................", "..................", ...BLINK, ...BODY, ...LEGS_IDLE], (g) => {
  for (const x of [3, 13]) {
    g.fill(x, 1, 2, 2, "s")
    g.fill(x, 3, 2, 3, "C")
  }
  g.outline()
})

// ---------- looks: outfit and hair colours, and accessories painted onto every frame ----------

const OUTFITS: Record<string, Palette> = {
  "hoodie-blue": {},
  "hoodie-pink": { c: "#f58fa8", C: "#d9677f", k: "#fbb8c8", q: C.white },
  "hoodie-mint": { c: "#7fd1ae", C: "#4fae88", k: "#a6e3c8", q: C.pinkHi },
  "hoodie-lilac": { c: "#b497e8", C: "#7c5cc9", k: "#d4c2f5", q: C.sun },
  // white uniform, black belt, white trousers
  dobok: { c: "#fbf7f0", C: "#d8d0c4", k: "#ffffff", q: "#2b2433", j: "#efe8dc", J: "#cfc6b8" },
}
const HAIRS: Record<string, Palette> = {
  "hair-brown": {},
  "hair-black": { h: "#2b2433", H: "#4a3f55" },
  "hair-ginger": { h: "#c8643a", H: "#e88a55" },
  "hair-pink": { h: "#e8718d", H: "#f7a1b5" },
}
const EXTRA_PAL: Palette = { g: "#5c4a7a", x: "#4a3a4a", y: C.pinkHi, v: C.sun, u: C.pink, z: C.gold, Z: C.goldSh }

// dy is where the head starts in the frame (the stretch frame has two extra rows on top).
function extraFront(g: Grid, extra: string, dy: number) {
  if (extra === "extra-glasses") {
    for (const x0 of [4, 10]) {
      g.row(dy + 9, x0, x0 + 3, "g")
      g.row(dy + 13, x0, x0 + 3, "g")
      for (let y = 10; y <= 12; y++) {
        g.set(x0, dy + y, "g")
        g.set(x0 + 3, dy + y, "g")
      }
    }
    g.row(dy + 10, 8, 9, "g")
  } else if (extra === "extra-ears") {
    for (const [a, b, c] of [[3, 4, 5], [12, 13, 14]]) {
      g.set(b, dy + 1, "x")
      g.row(dy + 2, a, c, "x")
      g.set(b, dy + 2, "y")
      g.row(dy + 3, a, c, "x")
    }
  } else if (extra === "extra-flower") {
    g.set(3, dy + 5, "v")
    g.row(dy + 6, 2, 4, "v")
    g.set(3, dy + 6, "u")
    g.set(3, dy + 7, "v")
  } else if (extra === "extra-crown") {
    g.row(dy + 1, 6, 11, "z")
    g.row(dy + 2, 6, 11, "Z")
    for (const x of [6, 8, 9, 11]) g.set(x, dy, "z")
    g.set(8, dy + 1, "u")
  }
  g.outline()
}

function extraSide(g: Grid, extra: string) {
  if (extra === "extra-glasses") {
    g.row(9, 12, 14, "g")
    g.row(12, 12, 14, "g")
    g.set(12, 10, "g")
    g.set(12, 11, "g")
    g.set(14, 10, "g")
    g.set(14, 11, "g")
    g.row(10, 9, 11, "g")
  } else if (extra === "extra-ears") {
    g.set(10, 1, "x")
    g.row(2, 9, 11, "x")
    g.set(10, 2, "y")
    g.row(3, 9, 11, "x")
  } else if (extra === "extra-flower") {
    g.set(5, 6, "v")
    g.row(7, 4, 6, "v")
    g.set(5, 7, "u")
    g.set(5, 8, "v")
  } else if (extra === "extra-crown") {
    g.row(2, 7, 12, "z")
    g.row(3, 7, 12, "Z")
    for (const x of [7, 9, 10, 12]) g.set(x, 1, "z")
  }
  g.outline()
}

const withFront = (rows: string[], extra: string, dy = 0) => (extra === "extra-none" ? rows : frontWith(rows, (g) => extraFront(g, extra, dy)))
const withSide = (rows: string[], extra: string) => (extra === "extra-none" ? rows : frontWith(rows, (g) => extraSide(g, extra)))

export interface KianaLook {
  outfit: string
  hair: string
  extra: string
}

function buildFrames(look: KianaLook) {
  const pal: Palette = { ...KIANA_PAL, ...(OUTFITS[look.outfit] ?? {}), ...(HAIRS[look.hair] ?? {}), ...EXTRA_PAL }
  const id = `${look.outfit}|${look.hair}|${look.extra}`
  const front = (name: string, rows: string[], dy = 0) => makeSprite(`k-${name}-${id}`, withFront(rows, look.extra, dy), pal)
  const side = (name: string, rows: string[]) => makeSprite(`k-${name}-${id}`, withSide(rows, look.extra), pal)
  return {
    idle: front("idle", [...HEAD, ...BODY, ...LEGS_IDLE]),
    blink: front("blink", [...BLINK, ...BODY, ...LEGS_IDLE]),
    walkA: front("walkA", [...HEAD, ...BODY, ...LEGS_A]),
    walkB: front("walkB", [...HEAD, ...BODY, ...LEGS_B]),
    face: front("face", HEAD),
    // side view walk cycle: stride, pass, other stride, pass
    side: [
      side("side0", sideFrame(-2, STRIDE_FRONT, STRIDE_BACK)),
      side("side1", sideFrame(0, PASS_STRAIGHT, PASS_LIFT)),
      side("side2", sideFrame(2, STRIDE_BACK, STRIDE_FRONT)),
      side("side3", sideFrame(0, PASS_LIFT, PASS_STRAIGHT)),
    ],
    sideStand: side("sideStand", sideFrame(0, PASS_STRAIGHT, { hip: 8, knee: 8, foot: 8, lift: false })),
    kick: side("kick", kickFrame()),
    sit: front("sit", [...HEAD, ...BODY, ...SIT_LEGS]),
    sitBlink: front("sitBlink", [...BLINK, ...BODY, ...SIT_LEGS]),
    stretch: front("stretch", STRETCH, 2),
    tuck: front("tuck", [...HEAD, ...BODY, ...SIT_LEGS, "..................", ".................."]),
  }
}

export type KianaFrames = ReturnType<typeof buildFrames>
const frameCache = new Map<string, KianaFrames>()

export function kianaFramesFor(look: KianaLook): KianaFrames {
  const id = `${look.outfit}|${look.hair}|${look.extra}`
  let f = frameCache.get(id)
  if (!f) {
    f = buildFrames(look)
    frameCache.set(id, f)
  }
  return f
}

export const kianaFrames = kianaFramesFor({ outfit: "hoodie-blue", hair: "hair-brown", extra: "extra-none" })

export const SIT_H = HEAD.length + BODY.length + SIT_LEGS.length

// ---------- the cat: 16x15 front-facing loaf plus a separate tail ----------

const CAT_PAL: Palette = { o: C.ol, c: C.cat, C: C.catSh, w: C.catW, n: C.pinkHi, e: C.ol, W: C.white }

const CAT_TOP = mirror([
  "..o.....",
  ".ono....",
  ".onco...",
  ".occcooo",
  ".occcccc",
  "occeeccc",
  "occewccc",
  "owwccccn",
  ".owwwwww",
])
CAT_TOP[6] = CAT_TOP[6].slice(0, 11) + "ew" + CAT_TOP[6].slice(13)
const CAT_SLEEPY = [...CAT_TOP]
CAT_SLEEPY[5] = mirror(["occccccc"])[0]
CAT_SLEEPY[6] = mirror(["occooccc"])[0]

// Content face: ^ ^ eyes and blushing cheeks.
const CAT_HAPPY = [...CAT_SLEEPY]
CAT_HAPPY[5] = mirror(["occcoccc"])[0]
CAT_HAPPY[6] = mirror(["occococc"])[0]
CAT_HAPPY[7] = mirror(["ownccccn"])[0]

const CAT_BODY = mirror(["..occccc", ".occcwww", ".occcwww", ".oCccwww", ".oCcowwo", "..oooooo"])

export const CAT_W = 16
export const CAT_H = 15

export const catFrames = {
  awake: makeSprite("c-awake", [...CAT_TOP, ...CAT_BODY], CAT_PAL),
  sleepy: makeSprite("c-sleepy", [...CAT_SLEEPY, ...CAT_BODY], CAT_PAL),
  happy: makeSprite("c-happy", [...CAT_HAPPY, ...CAT_BODY], CAT_PAL),
  tailA: makeSprite("c-tailA", ["..oo.", ".occo", ".oco.", "oco..", "oco..", "occo.", ".ooo."], CAT_PAL),
  tailB: makeSprite("c-tailB", [".oo..", "occo.", ".oco.", "..oco", "..oco", ".occo", ".ooo."], CAT_PAL),
}

// What the cat wears, drawn over the cat sprite; x0 and top are the sprite's top-left corner.
export function drawCatExtra(c: Ctx, item: string, x0: number, top: number) {
  switch (item) {
    case "cat-bow":
      rect(c, x0 + 4, top + 8, 3, 3, C.ol)
      rect(c, x0 + 9, top + 8, 3, 3, C.ol)
      rect(c, x0 + 5, top + 9, 2, 1, "#e8555a")
      rect(c, x0 + 9, top + 9, 2, 1, "#e8555a")
      rect(c, x0 + 7, top + 9, 2, 2, "#b83a40")
      break
    case "cat-bell":
      rect(c, x0 + 3, top + 9, 10, 1, C.pinkSh)
      disc(c, x0 + 8, top + 11, 1, C.ol)
      px(c, x0 + 8, top + 11, C.gold)
      break
    case "cat-scarf":
      rect(c, x0 + 2, top + 8, 12, 2, C.mint)
      for (let i = 0; i < 12; i += 3) px(c, x0 + 2 + i, top + 8, C.white)
      rect(c, x0 + 11, top + 10, 2, 3, C.mintSh)
      rect(c, x0 + 1, top + 7, 14, 1, C.ol)
      break
    case "cat-hat":
      rect(c, x0 + 3, top + 2, 10, 1, C.ol)
      for (let i = 0; i < 6; i++) rect(c, x0 + 5 + Math.floor(i / 2), top + 1 - i, 6 - Math.floor(i / 2) * 2, 1, i === 0 ? C.lilacSh : C.lilac)
      px(c, x0 + 8, top - 5, C.sun)
      px(c, x0 + 7, top - 1, C.sun)
      break
  }
}
