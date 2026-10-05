import { C, makeSprite, mirror, type Palette } from "./pixel"

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

export const kianaFrames = {
  idle: makeSprite("k-idle", [...HEAD, ...BODY, ...LEGS_IDLE], KIANA_PAL),
  blink: makeSprite("k-blink", [...BLINK, ...BODY, ...LEGS_IDLE], KIANA_PAL),
  walkA: makeSprite("k-walkA", [...HEAD, ...BODY, ...LEGS_A], KIANA_PAL),
  walkB: makeSprite("k-walkB", [...HEAD, ...BODY, ...LEGS_B], KIANA_PAL),
  face: makeSprite("k-face", HEAD, KIANA_PAL),
}

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
