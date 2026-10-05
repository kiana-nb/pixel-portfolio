import { CAT_H, CAT_W, KIANA_H, KIANA_W, SIT_H, catFrames, kianaFrames } from "./actors"
import { C, blit, box, ellipse, line, makeSprite, px, rect, text, textWidth, type Ctx } from "./pixel"
import { CAR_START, CAR_Y, STREET_THINGS, STREET_W, drawCar, drawStreetAnimated, drawStreetSky, drawStreetStatic, streetLights } from "./street"
import {
  BOWL_X, FEET_Y, FLOWER_X, THINGS, WORLD_H, WORLD_W, cartridge, drawAnimated, drawBowl, drawSky, drawStatic, drawYarn, lights,
  type Light, type Scene, type Thing,
} from "./world"

type ParticleKind = "heart" | "note" | "spark" | "puff" | "zzz" | "dust" | "drop" | "confetti" | "label"
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  kind: ParticleKind
  col: string
  str?: string
}

export type SecretId = "bestie" | "foodie" | "fetch" | "bloom" | "party" | "lvlup" | "konami" | "meow"
export type SceneId = "room" | "street"

const HEART = makeSprite("p-heart", ["hh.hh", "hhhhh", ".hhh.", "..h.."], { h: C.pink })
const NOTE_A = makeSprite("p-noteA", ["..oo", "..o.", "..o.", "ooo.", "oo.."], { o: C.pinkSh })
const NOTE_B = makeSprite("p-noteB", ["..oo", "..o.", "..o.", "ooo.", "oo.."], { o: C.lilacSh })
const CONFETTI = [C.pink, C.sun, C.mint, C.sky, C.lilac]

export interface EngineCallbacks {
  onInteract(thing: Thing): void
  onAdvance(): void
  onSecret(id: SecretId): void
  onScene(scene: SceneId): void
}

const PLANT_KEY = "kiana-room-flower"
function loadPlantStage() {
  try {
    return Math.max(0, Math.min(3, Number(localStorage.getItem(PLANT_KEY)) || 0))
  } catch {
    return 0
  }
}
function savePlantStage(n: number) {
  try {
    localStorage.setItem(PLANT_KEY, String(n))
  } catch {
    /* storage can be blocked */
  }
}

const CAT_THING: Thing = { id: "cat", label: "pet the cat", x: 0, hit: [0, 0, 0, 0], action: { kind: "pet" } }
const YARN_THING: Thing = { id: "yarn", label: "toss the yarn ball", x: 0, hit: [0, 0, 0, 0], action: { kind: "play" } }
const CAR_THING: Thing = { id: "car", label: "drive the car", x: 0, hit: [0, 0, 0, 0], action: { kind: "drive" } }
const LANE = FEET_Y + 3
const BED = { x: 92, feet: 113 }
const BOWL_FEET = 137
// Where Kiana sits for the things she sits down for.
const SEATS: Record<string, { x: number; feet: number }> = {
  journal: { x: 70, feet: 127 },
  desk: { x: 406, feet: 128 },
  tv: { x: 252, feet: 162 },
}
// Where she appears when entering a scene.
const ARRIVE: Record<SceneId, { x: number; dir: 1 | -1 }> = { room: { x: 645, dir: -1 }, street: { x: 81, dir: 1 } }
const GRAVITY = 520
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))
const isInteractiveTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && !!el.closest("button, a, input, textarea, select, [role=dialog]")

type CatMode = "sleep" | "nap" | "jump" | "follow" | "toBowl" | "eat" | "chase" | "happy"

export class Engine {
  scale = 3
  viewW = 320
  music = false
  paused = false
  dialogOpen = false
  inserted: number | null = null
  // The flower at the far end: 0 is a sprout, 3 is in bloom. Saved per visitor.
  plantStage = loadPlantStage()
  // Set when the last watering made the flower grow, so the dialog can say so.
  lastGrowth: number | null = null
  sceneId: SceneId = "room"

  private plantGrow = this.plantStage
  private pour: { t: number; thing: Thing } | null = null
  private ctx: Ctx
  private layers: Record<SceneId, HTMLCanvasElement>
  private lightLayer: HTMLCanvasElement
  private camX = 0
  private t = 0
  private last = 0
  private raf = 0
  private night = 0
  private nightTarget = 0
  private iris = 0
  private trans: { t: number; phase: "out" | "in"; to: SceneId } | null = null
  private afterScene: string | null = null
  private keys = new Set<string>()
  private lastKey = ""
  private lastKeyAt = 0
  private parts: Particle[] = []
  private hovered: Thing | null = null
  private near: Thing | null = null
  private visible = true
  private observer: IntersectionObserver
  private reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  private touch = window.matchMedia("(pointer: coarse)").matches
  private secrets = new Set<SecretId>()
  private pets = 0
  private posterLooks = 0
  private neonTaps: number[] = []
  private neonFlash = 0
  private bowlFood = 0
  private yarn = { x: 288, vx: 0, roll: 0 }
  private car = { x: CAR_START, v: 0, dir: 1 as 1 | -1, driving: false, target: null as number | null }
  private player = {
    x: 206,
    dir: 1 as 1 | -1,
    walking: false,
    running: false,
    stepT: 0,
    frame: 0,
    blinkT: 2,
    z: 0,
    vz: 0,
    spin: false,
    landT: 0,
    idle: 0,
    sit: null as { x: number; feet: number; nap?: boolean } | null,
    target: null as number | null,
    pending: null as Thing | null,
  }
  private cat = {
    x: BED.x,
    feet: BED.feet,
    mode: "sleep" as CatMode,
    after: "follow" as CatMode,
    jumpT: 0,
    jumpLen: 0.55,
    from: [0, 0],
    to: [0, 0],
    dir: -1 as 1 | -1,
    moving: false,
    idleFor: 0,
    animT: 0,
    zT: 0,
    timer: 0,
    flipT: 0,
    pounced: false,
  }

  constructor(
    private canvas: HTMLCanvasElement,
    private prompt: HTMLElement,
    private cb: EngineCallbacks,
    private cartColors: Scene["cartColors"],
  ) {
    this.ctx = canvas.getContext("2d")!
    const layer = (w: number, draw: (c: Ctx) => void) => {
      const cv = document.createElement("canvas")
      cv.width = w
      cv.height = WORLD_H
      draw(cv.getContext("2d")!)
      return cv
    }
    this.layers = { room: layer(WORLD_W, drawStatic), street: layer(STREET_W, drawStreetStatic) }
    this.lightLayer = document.createElement("canvas")
    if (this.reduced) this.iris = 1
    this.camX = clamp(this.player.x - 160, 0, WORLD_W - 320)

    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
    window.addEventListener("blur", this.onBlur)
    canvas.addEventListener("pointerdown", this.onPointerDown)
    canvas.addEventListener("pointermove", this.onPointerMove)
    canvas.addEventListener("pointerleave", this.onPointerLeave)
    this.observer = new IntersectionObserver(([e]) => (this.visible = e.intersectionRatio > 0.35), { threshold: [0, 0.35, 1] })
    this.observer.observe(canvas)
    this.raf = requestAnimationFrame(this.loop)
  }

  destroy() {
    cancelAnimationFrame(this.raf)
    window.removeEventListener("keydown", this.onKeyDown)
    window.removeEventListener("keyup", this.onKeyUp)
    window.removeEventListener("blur", this.onBlur)
    this.canvas.removeEventListener("pointerdown", this.onPointerDown)
    this.canvas.removeEventListener("pointermove", this.onPointerMove)
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave)
    this.observer.disconnect()
  }

  private get w() {
    return this.sceneId === "room" ? WORLD_W : STREET_W
  }

  // Pick the largest integer scale that fits the width and the height budget, then size the view to fill the width.
  resize(cssW: number, maxCssH: number) {
    // Whole-number scales keep pixels even; on very short screens (a phone held sideways) the room
    // scales by a fraction instead so nothing at the bottom gets cut off.
    const whole = Math.min(Math.floor(cssW / 290), Math.floor(maxCssH / WORLD_H))
    const s = whole >= 2 ? whole : Math.max(1, Math.min(cssW / 290, maxCssH / WORLD_H, 2))
    this.scale = s
    this.viewW = Math.min(WORLD_W, Math.ceil(cssW / s))
    this.canvas.width = this.viewW
    this.canvas.height = WORLD_H
    this.canvas.style.width = `${this.viewW * s}px`
    this.canvas.style.height = `${WORLD_H * s}px`
    this.lightLayer.width = this.viewW
    this.lightLayer.height = WORLD_H
    this.camX = this.cameraTarget()
    return s
  }

  setNight(on: boolean, instant = false) {
    this.nightTarget = on ? 1 : 0
    if (instant || this.reduced) this.night = this.nightTarget
  }

  // Secrets the visitor already found on an earlier visit, so they are not announced again.
  setFound(ids: Iterable<SecretId>) {
    for (const id of ids) this.secrets.add(id)
  }

  walkTo(id: string) {
    if (this.trans) return
    const thing = this.findThing(id)
    if (!thing) {
      // The thing is in the other scene: go there first, then walk to it.
      const other: SceneId = this.sceneId === "room" ? "street" : "room"
      if ([...(other === "room" ? THINGS : STREET_THINGS)].some((t) => t.id === id)) {
        this.afterScene = id
        this.go(other)
      }
      return
    }
    const p = this.player
    if (this.car.driving) {
      this.car.target = thing.x
      return
    }
    this.standUp()
    p.target = thing.x
    p.pending = thing
    p.running = Math.abs(thing.x - p.x) > 90
  }

  // The cat answers when the visitor types "meow".
  meow() {
    const k = this.cat
    if (this.sceneId !== "room") {
      this.say("MEOW?", this.player.x, FEET_Y - KIANA_H - 8, C.pinkSh)
    } else {
      this.say("MEOW!", k.x, k.feet - CAT_H - 8, C.pinkSh)
      for (let i = 0; i < 3; i++) this.spawn("heart", k.x - 4 + Math.random() * 8, k.feet - CAT_H - 2, (Math.random() - 0.5) * 14, -16, 1.2, C.pink)
      if (k.mode === "sleep" || k.mode === "nap") this.wakeCat("follow")
    }
    this.secret("meow")
  }

  // ---------- input ----------

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.paused || !this.visible || isInteractiveTarget(e.target)) return
    const k = e.key.toLowerCase()
    const now = performance.now()
    // An E straight after an M is someone typing "meow", not pressing the interact key.
    const typingMeow = k === "e" && this.lastKey === "m" && now - this.lastKeyAt < 1000
    this.lastKey = k
    this.lastKeyAt = now
    this.player.idle = 0
    if (k === "arrowleft" || k === "arrowright" || k === "a" || k === "d") {
      this.keys.add(k === "a" ? "arrowleft" : k === "d" ? "arrowright" : k)
      e.preventDefault()
    } else if (k === " " || k === "arrowup" || k === "w") {
      e.preventDefault()
      if (e.repeat) return
      if (this.dialogOpen && k === " ") this.cb.onAdvance()
      else this.jump()
    } else if ((k === "e" && !typingMeow) || k === "enter") {
      e.preventDefault()
      if (e.repeat) return
      if (this.dialogOpen) this.cb.onAdvance()
      else if (this.near) this.interact(this.near)
    }
  }

  private onKeyUp = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    this.keys.delete(k === "a" ? "arrowleft" : k === "d" ? "arrowright" : k)
  }

  private onBlur = () => this.keys.clear()

  private toWorld(e: PointerEvent) {
    const r = this.canvas.getBoundingClientRect()
    return [this.camX + ((e.clientX - r.left) / r.width) * this.viewW, ((e.clientY - r.top) / r.height) * WORLD_H]
  }

  private sceneThings(): Thing[] {
    return this.sceneId === "room" ? THINGS : STREET_THINGS
  }

  private dynamicThings(): Thing[] {
    if (this.sceneId === "street") {
      const c = this.car
      const label = c.driving ? "get out" : "drive the car"
      return [{ ...CAR_THING, label, x: Math.round(c.x), hit: [c.x - 20, CAR_Y - 26, 40, 27] }]
    }
    const k = this.cat
    const y = this.yarn
    return [
      { ...CAT_THING, x: Math.round(k.x), hit: [k.x - 10, k.feet - CAT_H - 2, 20, CAT_H + 4] },
      { ...YARN_THING, x: Math.round(y.x), hit: [y.x - 7, LANE - 12, 14, 14] },
    ]
  }

  private findThing(id: string) {
    return [...this.dynamicThings(), ...this.sceneThings()].find((t) => t.id === id)
  }

  private thingAt(wx: number, wy: number): Thing | null {
    for (const t of [...this.dynamicThings(), ...this.sceneThings()]) {
      const [x, y, w, h] = t.hit
      if (wx >= x && wx < x + w && wy >= y && wy < y + h) return t
    }
    return null
  }

  private onPointerDown = (e: PointerEvent) => {
    if (this.paused || this.trans) return
    const [wx, wy] = this.toWorld(e)
    const p = this.player
    p.idle = 0
    // tapping Kiana makes her jump
    if (!this.car.driving && Math.abs(wx - p.x) < 9 && wy > FEET_Y - KIANA_H - p.z && wy < FEET_Y) {
      this.jump()
      return
    }
    const thing = this.thingAt(wx, wy)
    if (this.car.driving) {
      if (thing?.id === "car") this.interact(thing)
      else this.car.target = clamp(wx, 24, this.w - 24)
      return
    }
    if (thing) {
      this.walkTo(thing.id)
      return
    }
    this.standUp()
    p.target = clamp(wx, 12, this.w - 12)
    p.pending = null
    p.running = Math.abs(p.target - p.x) > 140
  }

  private onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return
    const [wx, wy] = this.toWorld(e)
    this.hovered = this.thingAt(wx, wy)
    this.canvas.style.cursor = this.hovered ? "pointer" : "default"
  }

  private onPointerLeave = () => {
    this.hovered = null
  }

  // ---------- actions ----------

  private secret(id: SecretId) {
    if (this.secrets.has(id)) return
    this.secrets.add(id)
    this.cb.onSecret(id)
  }

  private jump() {
    const p = this.player
    if (this.car.driving) {
      this.say("BEEP!", this.car.x + this.car.dir * 14, CAR_Y - 34, C.pinkSh)
      return
    }
    if (this.pour || p.z > 0 || p.vz > 0) return
    if (p.sit) {
      this.standUp()
      return
    }
    p.vz = 150
  }

  // Leave a seat: hop off it and land on the floor.
  private standUp() {
    const p = this.player
    if (!p.sit) return
    p.x = p.sit.x
    p.z = Math.max(0, FEET_Y - p.sit.feet)
    p.vz = 60
    p.sit = null
    p.idle = 0
  }

  private go(to: SceneId) {
    if (this.trans || this.sceneId === to) return
    this.trans = { t: 0, phase: "out", to }
    this.player.target = null
    this.player.pending = null
  }

  private interact(thing: Thing) {
    const p = this.player
    const d = thing.x - p.x
    if (Math.abs(d) > 2 && !this.car.driving) p.dir = d > 0 ? 1 : -1
    p.idle = 0
    const a = thing.action
    if (a.kind !== "drive" && this.car.driving) return
    switch (a.kind) {
      case "pet":
        this.petCat()
        break
      case "water":
        // Step back a little so the can reaches the pot, pour, and report when the pouring is done.
        if (this.pour) return
        this.standUp()
        p.z = 0
        p.vz = 0
        p.x = clamp(thing.x - p.dir * 16, 12, this.w - 12)
        this.pour = { t: 1.4, thing }
        this.lastGrowth = null
        return
      case "feed":
        this.feedCat()
        break
      case "play":
        this.tossYarn()
        break
      case "neon":
        this.tapNeon()
        return
      case "go":
        this.go(a.to)
        return
      case "drive":
        this.toggleCar()
        return
      case "say":
        if (thing.id === "poster" && ++this.posterLooks === 3) this.levelUp()
        break
    }
    // Some things are better done sitting down.
    const seat = SEATS[thing.id]
    if (seat && this.sceneId === "room" && p.z === 0) {
      p.sit = { ...seat }
      p.x = seat.x
    }
    this.cb.onInteract(thing)
  }

  private toggleCar() {
    const c = this.car
    const p = this.player
    if (c.driving) {
      c.driving = false
      c.target = null
      p.x = clamp(c.x - c.dir * 26, 12, this.w - 12)
      p.dir = c.dir
      this.say("PARKED", c.x, CAR_Y - 34, C.mintSh)
      return
    }
    this.standUp()
    c.driving = true
    c.v = 0
    p.target = null
    p.pending = null
    this.say("VROOM", c.x, CAR_Y - 34, C.mintSh)
  }

  private tapNeon() {
    const now = this.t
    this.neonFlash = 0.25
    this.neonTaps = [...this.neonTaps.filter((x) => now - x < 4), now]
    for (let i = 0; i < 3; i++) this.spawn("spark", 228 + Math.random() * 24, 34 + Math.random() * 8, 0, -6, 0.6, C.pinkHi)
    if (this.neonTaps.length >= 5) {
      this.neonTaps = []
      this.unlockBonus()
    }
  }

  // The bonus cartridge: Konami code on a keyboard, or five quick taps on the GAMES sign.
  unlockBonus() {
    const x = this.sceneId === "room" ? 240 : this.player.x
    for (let i = 0; i < 24; i++) {
      this.spawn("confetti", x - 40 + Math.random() * 80, 40 + Math.random() * 10, (Math.random() - 0.5) * 50, -20 - Math.random() * 30, 1.6, CONFETTI[i % CONFETTI.length])
    }
    this.say("BONUS!", x, 28, C.goldSh)
    this.secret("konami")
  }

  private levelUp() {
    const p = this.player
    p.vz = 190
    p.spin = true
    this.say("LVL UP!", p.x, FEET_Y - KIANA_H - 14, C.lilacSh)
    for (let i = 0; i < 26; i++) {
      this.spawn("confetti", p.x - 10 + Math.random() * 20, FEET_Y - KIANA_H - 4, (Math.random() - 0.5) * 60, -30 - Math.random() * 30, 1.6, CONFETTI[i % CONFETTI.length])
    }
    this.secret("lvlup")
  }

  // Where the watering can is, relative to Kiana, and where its spout ends.
  private canGeom() {
    const p = this.player
    const tilt = !!this.pour && this.pour.t < 1.2
    const x0 = p.dir > 0 ? p.x + 5 : p.x - 12
    const y0 = FEET_Y - 20
    const sx = p.dir > 0 ? x0 + 7 : x0 - 1
    return { x0, y0, sx, sy: y0 + 3, tipX: sx + p.dir * 5, tipY: tilt ? y0 + 7 : y0, tilt }
  }

  private updatePour(dt: number) {
    const pour = this.pour
    if (!pour) return
    pour.t -= dt
    const g = this.canGeom()
    if (g.tilt && Math.random() < dt * 45) {
      // The pot stands against the wall, higher on screen than Kiana's hands, so the water arcs into it.
      const T = 0.42 + Math.random() * 0.06
      const tx = pour.thing.id === "plant2" ? FLOWER_X - 5 + Math.random() * 10 : 119 + Math.random() * 10
      const ty = pour.thing.id === "plant2" ? 118 : 121
      this.spawn("drop", g.tipX, g.tipY, (tx - g.tipX) / T, (ty - g.tipY) / T - 60 * T, T, C.sky)
    }
    if (pour.t > 0) return
    this.pour = null
    const thing = pour.thing
    if (thing.id === "plant2" && this.plantStage < 3) {
      this.plantStage++
      this.lastGrowth = this.plantStage
      savePlantStage(this.plantStage)
    }
    const top = thing.id === "plant2" ? 118 - (7 + this.plantStage * 11) : thing.hit[1] + 6
    for (let i = 0; i < (this.lastGrowth === 3 ? 14 : 6); i++) {
      this.spawn("spark", thing.x - 10 + Math.random() * 20, top + Math.random() * 14, (Math.random() - 0.5) * 6, -10, 1.2, i % 2 ? C.sun : C.pinkHi)
    }
    this.cb.onInteract(thing)
    if (this.lastGrowth === 3) this.secret("bloom")
  }

  // ---------- the cat ----------

  private catJump(toX: number, toFeet: number, after: CatMode, len = 0.55) {
    const k = this.cat
    k.from = [k.x, k.feet]
    k.to = [clamp(toX, 12, WORLD_W - 12), toFeet]
    k.jumpT = 0
    k.jumpLen = len
    k.after = after
    k.mode = "jump"
  }

  // From the bed or a nap: hop down to the floor lane, then do `next`.
  private wakeCat(next: CatMode) {
    const k = this.cat
    if (k.feet < LANE - 2) {
      const side = this.player.x > k.x ? 14 : -14
      this.catJump(k.x + side, LANE, next)
    } else {
      k.mode = next
      k.idleFor = 0
    }
  }

  private petCat() {
    const k = this.cat
    this.pets++
    for (let i = 0; i < 5; i++) this.spawn("heart", k.x - 4 + Math.random() * 8, k.feet - CAT_H - 2, (Math.random() - 0.5) * 16, -18 - Math.random() * 10, 1.3, C.pink)
    if (k.mode === "sleep" || k.mode === "nap") {
      const side = this.player.x > 60 ? -18 : 18
      this.catJump(this.player.x + side, LANE, "follow")
      return
    }
    if (this.pets % 10 === 0) {
      // every tenth pet: a backflip
      k.flipT = 0.8
      for (let i = 0; i < 12; i++) this.spawn("heart", k.x - 6 + Math.random() * 12, k.feet - CAT_H, (Math.random() - 0.5) * 40, -30 - Math.random() * 20, 1.5, C.pink)
      this.secret("bestie")
    } else if (k.mode === "follow") {
      k.mode = "happy"
      k.timer = 1.4
    }
  }

  private feedCat() {
    this.bowlFood = 1
    const k = this.cat
    if (k.mode === "eat") return
    if (k.mode === "jump") k.after = "toBowl"
    else this.wakeCat("toBowl")
  }

  private tossYarn() {
    const p = this.player
    const y = this.yarn
    let dir: number = p.dir
    if (y.x < 60) dir = 1
    if (y.x > WORLD_W - 60) dir = -1
    y.vx = dir * (150 + Math.random() * 40)
    this.say("FETCH!", p.x, FEET_Y - KIANA_H - 8, C.pinkSh)
    const k = this.cat
    if (k.mode === "eat" || k.mode === "toBowl") return
    if (k.mode === "jump") k.after = "chase"
    else this.wakeCat("chase")
  }

  private updateCat(dt: number) {
    const k = this.cat
    const p = this.player
    k.animT += dt
    k.flipT = Math.max(0, k.flipT - dt)
    const party = this.music && this.night > 0.8
    switch (k.mode) {
      case "sleep":
      case "nap": {
        k.zT -= dt
        if (k.zT < 0 && !this.reduced) {
          k.zT = 1.6
          this.spawn("zzz", k.x + 5, k.feet - CAT_H - 1, 3, -6, 2, C.lilacSh)
        }
        if (k.mode === "nap" && Math.abs(p.x - k.x) > 70) this.wakeCat("follow")
        break
      }
      case "jump": {
        k.jumpT = Math.min(1, k.jumpT + dt / k.jumpLen)
        const u = k.jumpT
        k.x = k.from[0] + (k.to[0] - k.from[0]) * u
        k.feet = k.from[1] + (k.to[1] - k.from[1]) * u - Math.sin(u * Math.PI) * 16
        if (Math.abs(k.to[0] - k.from[0]) > 1) k.dir = k.to[0] > k.from[0] ? 1 : -1
        if (u >= 1) {
          k.feet = k.to[1]
          k.mode = k.after
          k.idleFor = 0
          if (k.mode === "eat") k.timer = 2.8
          if (k.mode === "happy") k.timer = 1.6
          if (k.mode === "happy" && k.pounced) {
            k.pounced = false
            k.timer = 2.2
            this.yarn.vx = k.dir * 40
            for (let i = 0; i < 6; i++) this.spawn("heart", k.x - 4 + Math.random() * 8, k.feet - CAT_H, (Math.random() - 0.5) * 18, -20, 1.2, C.pink)
            this.secret("fetch")
          }
        }
        break
      }
      case "toBowl": {
        const d = BOWL_X - 2 - k.x
        if (Math.abs(d) > 12) {
          k.x += Math.sign(d) * Math.min(Math.abs(d), 120 * dt)
          k.dir = d > 0 ? 1 : -1
          k.moving = true
        } else {
          k.moving = false
          this.catJump(BOWL_X - 2, BOWL_FEET, "eat", 0.45)
        }
        break
      }
      case "eat": {
        k.timer -= dt
        this.bowlFood = Math.max(0, k.timer / 2.8)
        if (Math.random() < dt * 3) this.say("NOM", k.x + (Math.random() < 0.5 ? -8 : 8), k.feet - CAT_H - 2, C.peachSh)
        if (k.timer <= 0) {
          this.bowlFood = 0
          for (let i = 0; i < 5; i++) this.spawn("heart", k.x - 4 + Math.random() * 8, k.feet - CAT_H, (Math.random() - 0.5) * 16, -18, 1.2, C.pink)
          this.secret("foodie")
          this.catJump(k.x - 16, LANE, "happy")
        }
        break
      }
      case "chase": {
        const y = this.yarn
        const d = y.x - k.x
        if (Math.abs(d) < 22 && Math.abs(y.vx) < 30) {
          k.pounced = true
          this.catJump(y.x - Math.sign(d || 1) * 6, LANE, "happy", 0.4)
        } else {
          k.x += Math.sign(d) * Math.min(Math.abs(d), 140 * dt)
          k.dir = d > 0 ? 1 : -1
          k.moving = true
        }
        break
      }
      case "happy": {
        k.moving = false
        k.timer -= dt
        if (k.timer <= 0) k.mode = "follow"
        break
      }
      case "follow": {
        // The cat keeps to the floor; when Kiana sits up on furniture it waits nearby.
        const goal = p.x - p.dir * 22
        const d = goal - k.x
        if (Math.abs(d) > 4) {
          const sp = p.running ? 200 : 74
          k.x += Math.sign(d) * Math.min(Math.abs(d), sp * dt)
          k.dir = d > 0 ? 1 : -1
          k.moving = true
          k.idleFor = 0
        } else {
          k.moving = false
          k.idleFor += dt
          if (k.idleFor > 16 && !party) {
            k.mode = "nap"
            k.zT = 0.5
          }
        }
        break
      }
    }
  }

  private say(str: string, x: number, y: number, col: string) {
    this.spawn("label", x, y, 0, -10, 1.3, col)
    this.parts[this.parts.length - 1].str = str
  }

  private spawn(kind: ParticleKind, x: number, y: number, vx: number, vy: number, life: number, col: string) {
    if (this.parts.length > 220) this.parts.shift()
    this.parts.push({ kind, x, y, vx, vy, life, max: life, col })
  }

  // ---------- update ----------

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - (this.last || now)) / 1000)
    this.last = now
    this.t += dt
    this.update(dt)
    this.render()
    this.raf = requestAnimationFrame(this.loop)
  }

  private cameraTarget() {
    if (this.viewW >= this.w) return (this.w - this.viewW) / 2
    const x = this.car.driving ? this.car.x + clamp(this.car.v * 0.18, -30, 30) : this.player.x
    return clamp(x - this.viewW / 2, 0, this.w - this.viewW)
  }

  private updateTransition(dt: number) {
    const tr = this.trans
    if (!tr) return
    tr.t += dt * (this.reduced ? 4 : 1)
    if (tr.phase === "out" && tr.t >= 0.45) {
      this.sceneId = tr.to
      const a = ARRIVE[tr.to]
      const p = this.player
      p.x = a.x
      p.dir = a.dir
      p.sit = null
      p.z = 0
      p.vz = 0
      p.target = null
      p.pending = null
      this.car.driving = false
      this.parts = []
      this.camX = this.cameraTarget()
      tr.phase = "in"
      tr.t = 0
      this.cb.onScene(tr.to)
    } else if (tr.phase === "in" && tr.t >= 0.5) {
      this.trans = null
      if (this.afterScene) {
        const id = this.afterScene
        this.afterScene = null
        this.walkTo(id)
      }
    }
  }

  private update(dt: number) {
    const step = 1.4 * dt
    this.night += clamp(this.nightTarget - this.night, -step, step)
    this.iris = Math.min(1, this.iris + dt / 1.1)
    this.neonFlash = Math.max(0, this.neonFlash - dt)
    if (this.music && this.night > 0.8 && this.sceneId === "room") this.secret("party")
    this.updateTransition(dt)

    // player
    const p = this.player
    const left = this.keys.has("arrowleft")
    const right = this.keys.has("arrowright")
    const blocked = this.paused || !!this.trans
    let vx = 0
    if (this.sceneId === "room") {
      this.updatePour(dt)
      this.plantGrow += clamp(this.plantStage - this.plantGrow, -dt * 0.7, dt * 0.7)
    }
    if (this.car.driving) {
      this.updateCar(dt, blocked ? 0 : (right ? 1 : 0) - (left ? 1 : 0))
      p.x = this.car.x
      p.walking = false
    } else if (this.pour || blocked) {
      // hands are busy, or the scene is changing
    } else if (left || right) {
      if (p.sit) this.standUp()
      p.target = null
      p.pending = null
      p.running = false
      vx = (right ? 1 : 0) - (left ? 1 : 0)
    } else if (p.target !== null) {
      const d = p.target - p.x
      if (Math.abs(d) < 1.5) {
        p.x = p.target
        p.target = null
        p.running = false
        const pending = p.pending
        p.pending = null
        if (pending) this.interact(this.findThing(pending.id) ?? pending)
      } else vx = Math.sign(d)
    }
    if (vx) {
      const speed = p.running ? 190 : 64
      const nx = clamp(p.x + vx * speed * dt, 12, this.w - 12)
      p.x = p.target !== null && Math.sign(p.target - nx) !== vx ? p.target : nx
      p.dir = vx > 0 ? 1 : -1
      p.walking = true
      p.idle = 0
      p.stepT += dt
      if (p.stepT > (p.running ? 0.075 : 0.13)) {
        p.stepT = 0
        p.frame = (p.frame + 1) % 4
        if (p.frame % 2 === 0 && p.z === 0) this.spawn("puff", p.x - p.dir * 4, FEET_Y - 1, -p.dir * 8, -4, 0.35, C.trim)
      }
    } else {
      p.walking = false
      p.frame = 0
    }

    // jumping
    if (p.z > 0 || p.vz > 0) {
      p.vz -= GRAVITY * dt
      p.z += p.vz * dt
      if (p.z <= 0) {
        p.z = 0
        p.vz = 0
        p.spin = false
        p.landT = 0.1
        for (let i = 0; i < 4; i++) this.spawn("puff", p.x - 4 + i * 3, FEET_Y - 1, (i - 1.5) * 14, -5, 0.35, C.trim)
      }
    }
    p.landT = Math.max(0, p.landT - dt)
    p.blinkT -= dt
    if (p.blinkT < -0.12) p.blinkT = 2 + Math.random() * 3

    // idle: after a while Kiana stretches, looks around, and finally sits down for a nap
    const resting = !p.walking && p.z === 0 && !this.pour && !this.car.driving && !this.paused && !this.dialogOpen && !this.trans
    if (resting && (!p.sit || p.sit.nap)) p.idle += dt
    else if (!p.sit) p.idle = 0
    if (resting && !p.sit && p.idle > 26) {
      p.sit = { x: p.x, feet: FEET_Y - 1, nap: true }
    }
    if (p.sit?.nap && Math.random() < dt * 0.6) this.spawn("zzz", p.x + 6, FEET_Y - SIT_H - 2, 3, -6, 2, C.lilacSh)

    // what the player can interact with
    let best: Thing | null = null
    let bestD = 17
    for (const t of [...this.dynamicThings(), ...this.sceneThings()]) {
      if (t.clickOnly) continue
      if (this.car.driving && t.id !== "car") continue
      const d = Math.abs(t.x - p.x)
      if (d < bestD) {
        best = t
        bestD = d
      }
    }
    this.near = best

    if (this.sceneId === "room") {
      // the yarn ball rolls and slows down, bouncing off the walls
      const y = this.yarn
      if (y.vx) {
        y.x += y.vx * dt
        y.roll += Math.abs(y.vx) * dt * 0.25
        const slow = 110 * dt
        y.vx = Math.abs(y.vx) <= slow ? 0 : y.vx - Math.sign(y.vx) * slow
        if (y.x < 14 || y.x > WORLD_W - 14) {
          y.x = clamp(y.x, 14, WORLD_W - 14)
          y.vx = -y.vx * 0.6
        }
      }
      this.updateCat(dt)
      if (this.night < 0.6 && !this.reduced && Math.random() < dt * 3) {
        this.spawn("dust", 50 + Math.random() * 80, 50 + Math.random() * 100, 2 + Math.random() * 3, -1 - Math.random() * 2, 4, C.cream)
      }
      if (this.music && Math.random() < dt * 1.6) {
        this.spawn("note", 548 + Math.random() * 10, 100, (Math.random() - 0.3) * 10, -14, 2.2, Math.random() < 0.5 ? "a" : "b")
      }
    }

    for (const q of this.parts) {
      q.life -= dt
      q.x += q.vx * dt
      q.y += q.vy * dt
      if (q.kind === "drop") q.vy += 120 * dt
      if (q.kind === "confetti") {
        q.vy += 70 * dt
        q.vx *= 0.97
      }
      if (q.kind === "heart" || q.kind === "note") q.vx *= 0.98
    }
    this.parts = this.parts.filter((q) => q.life > 0)

    // camera
    const target = this.cameraTarget()
    this.camX += (target - this.camX) * (this.reduced ? 1 : 1 - Math.pow(0.002, dt))

    this.updatePrompt()
  }

  // Accelerate with the keys, or drive to a tapped spot: brake in time and stop on it instead of overshooting.
  private updateCar(dt: number, input: number) {
    const c = this.car
    const ACCEL = 260
    const BRAKE = 320
    const MAX = 170
    if (input) {
      c.target = null
      c.v = clamp(c.v + input * ACCEL * dt, -MAX, MAX)
    } else if (c.target !== null) {
      const d = c.target - c.x
      const stopDist = (c.v * c.v) / (2 * BRAKE)
      if (Math.abs(d) < 1.5 && Math.abs(c.v) < 25) {
        c.x = c.target
        c.v = 0
        c.target = null
      } else if (Math.sign(d) === Math.sign(c.v) && Math.abs(d) <= stopDist + 1) {
        // close enough: brake
        const slow = BRAKE * dt
        c.v = Math.abs(c.v) <= slow ? 0 : c.v - Math.sign(c.v) * slow
        if (c.v === 0) c.x = Math.abs(d) < 6 ? c.target : c.x
      } else {
        // drive toward it, gently when it's near
        const top = Math.min(MAX, Math.sqrt(2 * BRAKE * Math.abs(d)))
        c.v = clamp(c.v + Math.sign(d) * ACCEL * dt, -top, top)
      }
    } else {
      const slow = 220 * dt
      c.v = Math.abs(c.v) <= slow ? 0 : c.v - Math.sign(c.v) * slow
    }
    c.x += c.v * dt
    if (c.x < 24 || c.x > this.w - 24) {
      c.x = clamp(c.x, 24, this.w - 24)
      c.v = 0
      c.target = null
    }
    // face the way the car is actually moving
    if (Math.abs(c.v) > 12) c.dir = c.v > 0 ? 1 : -1
    if (Math.abs(c.v) > 30 && Math.random() < dt * 14) {
      this.spawn("puff", c.x - c.dir * 20, CAR_Y - 6, -c.dir * 12, -6, 0.5, C.greyHi)
    }
  }

  private updatePrompt() {
    const el = this.prompt
    const thing = this.paused || this.dialogOpen || this.pour || this.trans ? null : this.hovered ?? this.near
    if (!thing) {
      el.hidden = true
      return
    }
    el.hidden = false
    const key = el.querySelector<HTMLElement>(".key")
    const label = el.querySelector<HTMLElement>(".label")
    const usingE = thing === this.near && !this.touch
    if (key) {
      key.textContent = usingE ? "E" : this.touch ? "tap" : "click"
    }
    if (label && label.textContent !== thing.label) label.textContent = thing.label
    const sx = clamp((thing.x - this.camX) * this.scale, 60, this.viewW * this.scale - 60)
    const sy = Math.max(26, (thing.hit[1] - 2) * this.scale)
    el.style.transform = `translate(${Math.round(sx)}px, ${Math.round(sy)}px) translate(-50%, -100%)`
  }

  // ---------- render ----------

  private render() {
    const c = this.ctx
    const cam = Math.round(this.camX)
    c.setTransform(1, 0, 0, 1, 0, 0)
    c.fillStyle = C.ol
    c.fillRect(0, 0, this.viewW, WORLD_H)
    c.translate(-cam, 0)

    const near = this.hovered ?? this.near
    const scene: Scene = {
      t: this.reduced ? 1 : this.t,
      night: this.night,
      music: this.music,
      tvOn: near?.id === "tv",
      inserted: this.inserted,
      cartColors: this.cartColors,
      plantGrow: this.plantGrow,
    }
    if (this.sceneId === "room") {
      drawSky(c, this.night, scene.t, cam)
      c.drawImage(this.layers.room, 0, 0)
      drawAnimated(c, scene)
      if (this.neonFlash > 0) text(c, "GAMES", 240 - Math.floor(textWidth("GAMES") / 2), 36, C.white)
      drawBowl(c, this.bowlFood)
      // the golden bonus cartridge waits on top of the TV once unlocked
      if (this.secrets.has("konami")) cartridge(c, 216, 84, C.gold, C.goldSh)
      // back to front: the cat when it is up on furniture, the yarn, then whoever is nearer the viewer
      const k = this.cat
      if (k.feet < LANE - 2) this.drawCat(c)
      drawYarn(c, this.yarn.x, LANE, this.yarn.roll)
      if (k.feet >= LANE - 2) this.drawCat(c)
      this.drawPlayer(c)
    } else {
      drawStreetSky(c, this.night, scene.t, cam, this.viewW)
      c.drawImage(this.layers.street, 0, 0)
      drawStreetAnimated(c, scene.t, this.night)
      this.drawPlayer(c)
      drawCar(c, this.car.x, this.car.dir, scene.t, Math.abs(this.car.v) > 5, this.car.driving)
    }
    this.drawParticles(c, false)

    c.setTransform(1, 0, 0, 1, 0, 0)
    this.drawLighting(c, cam, scene)
    c.translate(-cam, 0)
    this.drawParticles(c, true)
    c.setTransform(1, 0, 0, 1, 0, 0)

    // the opening iris, and the one that closes and opens when changing scenes
    let open = 1 - (1 - this.iris) ** 3
    if (this.trans) open = Math.min(open, this.trans.phase === "out" ? 1 - this.trans.t / 0.45 : this.trans.t / 0.5)
    if (open < 1) {
      const r = Math.max(0, open) * Math.hypot(this.viewW, WORLD_H) * 1.05
      c.fillStyle = C.ol
      c.beginPath()
      c.rect(0, 0, this.viewW, WORLD_H)
      c.arc(this.player.x - cam, FEET_Y - 16, Math.max(0.1, r), 0, Math.PI * 2, true)
      c.fill("evenodd")
    }
  }

  private drawPlayer(c: Ctx) {
    const p = this.player
    if (this.car.driving) return
    const party = this.music && this.night > 0.8 && this.sceneId === "room"
    const beat = Math.floor(this.t * (100 / 60) * 2)

    if (p.sit) {
      const blink = p.blinkT < 0 || p.sit.nap
      ellipse(c, p.sit.x, p.sit.feet, 7, 1, "rgba(59,42,53,.18)")
      blit(c, blink ? kianaFrames.sitBlink : kianaFrames.sit, p.sit.x - KIANA_W / 2, p.sit.feet - SIT_H)
      return
    }

    const shadow = Math.max(3, 7 - Math.round(p.z / 6))
    ellipse(c, p.x, FEET_Y, shadow, 1, "rgba(59,42,53,.22)")
    let spr = kianaFrames.idle
    let bob = 0
    let flip = p.dir < 0
    if (p.z > 0) {
      spr = p.spin || Math.abs(p.vz) < 40 ? kianaFrames.tuck : kianaFrames.side[0]
      if (p.spin) flip = Math.floor(this.t * 12) % 2 === 0
    } else if (p.landT > 0) {
      spr = kianaFrames.sit
      bob = 0
    } else if (p.walking) {
      spr = kianaFrames.side[p.frame]
      bob = p.frame % 2 === 1 ? -1 : 0
    } else if (this.pour) {
      spr = kianaFrames.sideStand
    } else if (party) {
      // dance to the record
      spr = beat % 2 ? kianaFrames.walkA : kianaFrames.walkB
      bob = beat % 2 ? -1 : 0
      flip = Math.floor(beat / 4) % 2 === 0
    } else {
      // idle: blink, and every so often stretch and look around
      const phase = p.idle < 6 ? p.idle : 6 + ((p.idle - 6) % 12)
      if (phase >= 6 && phase < 7.4) spr = kianaFrames.stretch
      else if (phase >= 7.4 && phase < 8.6) {
        spr = kianaFrames.sideStand
        flip = true
      } else if (phase >= 8.6 && phase < 9.8) {
        spr = kianaFrames.sideStand
        flip = false
      } else if (p.blinkT < 0) spr = kianaFrames.blink
    }
    blit(c, spr, p.x - KIANA_W / 2, FEET_Y - spr.height + bob - Math.round(p.z), flip)
    if (this.pour) {
      const g = this.canGeom()
      box(c, g.x0, g.y0, 7, 6, C.sky, C.skyHi, C.skySh)
      rect(c, g.x0 + 1, g.y0 - 2, 5, 1, C.ol)
      rect(c, g.x0 + 1, g.y0 - 2, 1, 2, C.ol)
      rect(c, g.x0 + 5, g.y0 - 2, 1, 2, C.ol)
      line(c, g.sx, g.sy, g.tipX, g.tipY, C.ol)
      line(c, g.sx, g.sy - 1, g.tipX, g.tipY - 1, C.skySh)
      rect(c, g.tipX - 1, g.tipY - 1, 2, 2, C.skySh)
    }
  }

  private drawCat(c: Ctx) {
    const k = this.cat
    if (k.feet >= LANE - 2) ellipse(c, k.x, LANE, 7, 1, "rgba(59,42,53,.2)")
    const asleep = k.mode === "sleep" || k.mode === "nap"
    const eating = k.mode === "eat"
    const happy = k.mode === "happy" || k.flipT > 0
    const swish = Math.floor(k.animT / (k.moving || happy ? 0.18 : 0.5)) % 2 === 0
    const tail = swish ? catFrames.tailA : catFrames.tailB
    const musicBob = this.music && !k.moving && !asleep && Math.floor(this.t * (100 / 60) * 2) % 2 === 0 ? 1 : 0
    const bob = k.moving && Math.floor(k.animT / 0.12) % 2 === 0 ? -1 : musicBob
    const breathe = asleep && Math.floor(k.animT / 1.2) % 2 === 0 ? 1 : 0
    let top = k.feet - CAT_H + bob + (eating ? 2 : 0)
    const face = asleep || eating ? catFrames.sleepy : happy ? catFrames.happy : catFrames.awake

    if (k.flipT > 0) {
      // backflip in four pixel-art steps
      const u = 1 - k.flipT / 0.8
      top -= Math.round(Math.sin(u * Math.PI) * 14)
      c.save()
      c.translate(Math.round(k.x), Math.round(top + CAT_H / 2))
      c.rotate(Math.floor(u * 4) * (Math.PI / 2) * -k.dir)
      c.drawImage(face, -CAT_W / 2, -CAT_H / 2)
      c.restore()
      return
    }
    const tailX = k.dir > 0 ? k.x - CAT_W / 2 - 3 : k.x + CAT_W / 2 - 2
    blit(c, asleep ? catFrames.tailA : tail, tailX, top + 7, k.dir > 0)
    blit(c, face, k.x - CAT_W / 2, top + breathe)
    if (eating) drawBowl(c, this.bowlFood)
  }

  private drawParticles(c: Ctx, glowing: boolean) {
    for (const q of this.parts) {
      const a = Math.min(1, q.life / (q.max * 0.5))
      const isGlow = q.kind === "spark" || q.kind === "note" || q.kind === "label" || q.kind === "confetti"
      if (isGlow !== glowing) continue
      c.globalAlpha = a
      switch (q.kind) {
        case "heart":
          blit(c, HEART, q.x - 2, q.y)
          break
        case "note":
          blit(c, q.col === "a" ? NOTE_A : NOTE_B, q.x, q.y)
          break
        case "zzz":
          text(c, "Z", q.x, q.y, q.col)
          break
        case "label": {
          const s = q.str ?? ""
          const w = textWidth(s)
          rect(c, q.x - Math.floor(w / 2) - 2, q.y - 2, w + 4, 9, C.white)
          rect(c, q.x - Math.floor(w / 2) - 2, q.y + 7, w + 4, 1, C.ol)
          text(c, s, q.x - Math.floor(w / 2), q.y, q.col)
          break
        }
        case "confetti":
          rect(c, q.x, q.y, Math.floor(q.life * 8) % 2 ? 2 : 1, Math.floor(q.life * 8) % 2 ? 1 : 2, q.col)
          break
        case "spark":
          if (Math.floor(q.life * 10) % 2) {
            px(c, q.x, q.y, q.col)
            px(c, q.x - 1, q.y, C.white)
            px(c, q.x + 1, q.y, C.white)
          }
          break
        case "puff":
          rect(c, q.x, q.y, 2, 1, q.col)
          break
        case "dust":
          c.globalAlpha = a * 0.55 * (1 - this.night)
          px(c, q.x, q.y, q.col)
          break
        default:
          px(c, q.x, q.y, q.col)
      }
    }
    c.globalAlpha = 1
  }

  private drawLighting(c: Ctx, cam: number, scene: Scene) {
    const n = this.night
    if (n < 1 && this.sceneId === "room") {
      c.save()
      c.globalAlpha = 0.15 * (1 - n)
      c.fillStyle = "#fff2c0"
      c.beginPath()
      c.moveTo(36 - cam, 26)
      c.lineTo(92 - cam, 26)
      c.lineTo(168 - cam, WORLD_H)
      c.lineTo(80 - cam, WORLD_H)
      c.closePath()
      c.fill()
      c.restore()
    }
    if (n <= 0) return
    const lc = this.lightLayer.getContext("2d")!
    lc.globalCompositeOperation = "source-over"
    lc.clearRect(0, 0, this.viewW, WORLD_H)
    lc.fillStyle = `rgba(22,16,58,${0.7 * n})`
    lc.fillRect(0, 0, this.viewW, WORLD_H)
    lc.globalCompositeOperation = "destination-out"
    let ls: Light[]
    if (this.sceneId === "room") {
      ls = lights(scene)
      // a dance party: coloured spots sweep the floor while the record plays at night
      if (this.music && n > 0.8) {
        const cols: [number, number, number][] = [[255, 120, 180], [120, 200, 255], [255, 220, 120]]
        cols.forEach((rgb, i) => {
          const x = cam + this.viewW / 2 + Math.sin(this.t * (0.9 + i * 0.3) + i * 2) * this.viewW * 0.4
          ls.push({ x, y: 160, r: 34, rgb, power: 0.8 })
        })
      }
    } else {
      ls = streetLights(n, this.t)
      ls.push({ x: this.car.x + this.car.dir * 30, y: CAR_Y - 10, r: 30, rgb: [255, 240, 180], power: 0.85 })
    }
    for (const L of ls) {
      const sx = L.x - cam
      if (sx + L.r < 0 || sx - L.r > this.viewW) continue
      const g = lc.createRadialGradient(sx, L.y, 0, sx, L.y, L.r)
      g.addColorStop(0, `rgba(0,0,0,${L.power})`)
      g.addColorStop(1, "rgba(0,0,0,0)")
      lc.fillStyle = g
      lc.fillRect(sx - L.r, L.y - L.r, L.r * 2, L.r * 2)
    }
    c.drawImage(this.lightLayer, 0, 0)
    c.globalCompositeOperation = "lighter"
    for (const L of ls) {
      const sx = L.x - cam
      if (sx + L.r < 0 || sx - L.r > this.viewW) continue
      const g = c.createRadialGradient(sx, L.y, 0, sx, L.y, L.r)
      g.addColorStop(0, `rgba(${L.rgb[0]},${L.rgb[1]},${L.rgb[2]},${0.2 * L.power * n})`)
      g.addColorStop(1, "rgba(0,0,0,0)")
      c.fillStyle = g
      c.fillRect(sx - L.r, L.y - L.r, L.r * 2, L.r * 2)
    }
    c.globalCompositeOperation = "source-over"
  }
}
