import type { Palette } from "./Sprite"

const v = (name: string) => `var(--${name})`

// Head rows are built from a 10-wide face between two headphone cups so every row is exactly 20 wide.
const head = (face: string, cup = "pp") => ".".repeat(5 - cup.length) + cup + face + cup + ".".repeat(5 - cup.length)
export const KIANA: string[] = [
  "........hhhh........",
  ".......hhHHhh.......",
  "........hhhh........",
  ".....pppppppppp.....",
  "....phhhhhhhhhhp....",
  head("hhhhhhhhhh"),
  head("hhhhhhhhhh"),
  head("shhhsshhhs"),
  head("ssssssssss"),
  head("ssessssess"),
  head("ssessssess"),
  head("sbbssssbbs"),
  head("ssssmmssss", "p"),
  ".....ssssssssss.....",
  ".........ss.........",
  "....cccccccccccc....",
  "..cccccccccccccccc..",
  ".cccccccccccccccccc.",
  ".cccccccccccccccccc.",
  ".cccccccccccccccccc.",
]
export const KIANA_PAL: Palette = {
  h: v("hair"), H: v("hair-hi"), p: v("accent"), s: v("skin"), e: v("ink"), b: v("blush"), m: v("blush-d"), c: v("shirt"),
}

export const CAT: string[] = [
  ".oo........oo.",
  ".ooo......ooo.",
  ".oooooooooooo.",
  "oooooooooooooo",
  "oookkoooookkoo",
  "oooowwnnwwoooo",
  "ooowwwwwwwwooo",
  ".oooooooooooo.",
  ".ooOooooooOoo.",
  ".oooooooooooo.",
  ".wwww....wwww.",
]
export const CAT_PAL: Palette = { o: v("cat"), O: v("cat-d"), w: v("cat-w"), k: v("ink"), n: v("blush-d") }

export const PLANT: string[] = [
  ".....g..g.....",
  "..g..gg.gg.g..",
  "..gg.gGggg.gg.",
  "...ggGgggGgg..",
  "....ggggggg...",
  ".....gGgggg...",
  "......ggg.....",
  ".......g......",
]
export const PLANT_PAL: Palette = { g: v("leaf"), G: v("leaf-hi") }

export const POT: string[] = [
  "tttttttttt",
  "tPPPPPPPPt",
  ".tPPPPPPt.",
  ".tPPPPPPt.",
  "..tPPPPt..",
  "..tttttt..",
]
export const POT_PAL: Palette = { t: v("pot-d"), P: v("pot") }

export const MUG: string[] = [
  "wwwwww..",
  "wccccww.",
  "wccccw.w",
  "wccccw.w",
  "wccccww.",
  ".wwwww..",
]
export const MUG_PAL: Palette = { w: v("mug"), c: v("coffee") }

export const ENVELOPE: string[] = [
  "eeeeeeeeeeee",
  "ewweeeeeewwe",
  "eeewweewweee",
  "eeeepppeeeee",
  "eeeepppeeeee",
  "eeeeeppeeeee",
  "eeeeeeeeeeee",
]
export const ENVELOPE_PAL: Palette = { e: v("paper"), w: v("paper-d"), p: v("accent-2") }

export const HEART: string[] = [
  ".hh.hh.",
  "hhhhhhh",
  "hhhhhhh",
  ".hhhhh.",
  "..hhh..",
  "...h...",
]
export const HEART_PAL: Palette = { h: v("accent-2") }

export const SUN: string[] = [
  "..yyyy..",
  ".yyyyyy.",
  "yyyyyyyy",
  "yyyyyyyy",
  ".yyyyyy.",
  "..yyyy..",
]
export const SUN_PAL: Palette = { y: v("sun") }

export const MOON: string[] = [
  "..mmmm..",
  ".mmm....",
  "mmm.....",
  "mmm.....",
  ".mmm....",
  "..mmmm..",
]
export const MOON_PAL: Palette = { m: v("moon") }

export const CLOUD: string[] = [
  "....wwww....",
  "..wwwwwwww..",
  ".wwwwwwwwwww",
  "wwwwwwwwwwww",
]
export const CLOUD_PAL: Palette = { w: v("cloud") }

export const ROBOT: string[] = [
  "..a..",
  "wwwww",
  "weweW",
  "wwwww",
  ".w.w.",
]
export const ROBOT_PAL: Palette = { a: v("accent-2"), w: v("mug"), e: v("accent"), W: v("mug") }

export const CUBE: string[] = [
  "..ttttt",
  ".tttttt",
  "fffffss",
  "fffffss",
  "fffffss",
  "fffff.s",
]
export const CUBE_PAL: Palette = { t: v("cube-t"), f: v("cube-f"), s: v("cube-s") }

// Small cover icons for project pins.
export const HOUSE: string[] = [
  "....rr....",
  "...rrrr...",
  "..rrrrrr..",
  ".rrrrrrrr.",
  "rrrrrrrrrr",
  ".wwwwwwww.",
  ".wbbwwddw.",
  ".wbbwwddw.",
  ".wwwwwddw.",
]
export const HOUSE_PAL: Palette = { r: v("accent-2"), w: v("paper"), b: v("sky-d"), d: v("wood") }

export const BOOK: string[] = [
  "cccccccccc",
  "cpppppppcc",
  "cpllllpccc",
  "cpppppppcc",
  "cpllllppcc",
  "cpppppppcc",
  "cpppppppcc",
  "cccccccccc",
  ".wwwwwwwww",
]
export const BOOK_PAL: Palette = { c: v("b5"), p: v("paper"), l: v("paper-d"), w: v("paper-d") }

export const CHART: string[] = [
  "........gg",
  "........gg",
  ".....yy.gg",
  ".....yy.gg",
  "..pp.yy.gg",
  "..pp.yy.gg",
  "..pp.yy.gg",
  "kkkkkkkkkk",
]
export const CHART_PAL: Palette = { g: v("mint"), y: v("sun"), p: v("accent-2"), k: v("ink") }

export const GLOBE: string[] = [
  "...bbbb...",
  ".bbggbbbb.",
  ".bgggbbgb.",
  "bbggbbbggb",
  "bbbgbbbggb",
  "bbbbbbgbbb",
  ".bbbbggbb.",
  ".bbbbbbbb.",
  "...bbbb...",
]
export const GLOBE_PAL: Palette = { b: v("sky-d"), g: v("mint") }

export const CUSHION: string[] = [
  "...pppppppppppp...",
  ".pppPPPPPPPPPPppp.",
  "ppPPPPPPhPPPPPPPpp",
  "pPPPPPPhhhPPPPPPPp",
  "pPPPPPPPhPPPPPPPPp",
  "ppPPPPPPPPPPPPPPpp",
  ".pppppppppppppppp.",
  "...dddddddddddd...",
]
export const CUSHION_PAL: Palette = { p: v("rug-3"), P: v("chair"), h: v("chair-hi"), d: "rgba(0,0,0,.15)" }
