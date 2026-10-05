import { useEffect, useRef } from "react"
import { CAT_H, CAT_W, catFrames } from "../game/actors"
import { sfx } from "../game/audio"
import { C, disc, ellipse, px, rect, text, textWidth, type Ctx } from "../game/pixel"

// The bonus cartridge: a 30-second game where the cat catches falling fish.
const W = 160
const H = 110
const ROUND = 30
const BEST_KEY = "kiana-room-fish-best"

interface Fish {
  x: number
  y: number
  vy: number
  gold: boolean
}

function loadBest() {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0
  } catch {
    return 0
  }
}

function saveBest(n: number) {
  try {
    localStorage.setItem(BEST_KEY, String(n))
  } catch {
    /* storage can be blocked */
  }
}

function centered(c: Ctx, s: string, y: number, col: string) {
  text(c, s, Math.floor((W - textWidth(s)) / 2), y, col)
}

function drawFish(c: Ctx, f: Fish) {
  const body = f.gold ? C.gold : C.peach
  ellipse(c, f.x, f.y, 4, 2, C.ol)
  ellipse(c, f.x, f.y, 3, 1, body)
  rect(c, f.x + 4, f.y - 2, 2, 5, C.ol)
  px(c, f.x + 4, f.y, body)
  px(c, f.x - 2, f.y - 1, C.ol)
  if (f.gold) px(c, f.x, f.y - 3, C.white)
}

export function FishCatch() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const c = cv.getContext("2d")!
    let mode: "ready" | "play" | "over" = "ready"
    let catX = W / 2
    let score = 0
    let best = loadBest()
    let timeLeft = ROUND
    let fish: Fish[] = []
    let pops: { x: number; y: number; s: string; life: number }[] = []
    let spawnT = 0
    let last = 0
    let raf = 0
    let t = 0
    const keys = new Set<string>()

    const start = () => {
      mode = "play"
      score = 0
      timeLeft = ROUND
      fish = []
      pops = []
      spawnT = 0.3
      sfx.open()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      if (k === "arrowleft" || k === "arrowright" || k === "a" || k === "d") {
        keys.add(k === "a" ? "arrowleft" : k === "d" ? "arrowright" : k)
        e.preventDefault()
      } else if ((k === " " || k === "enter") && mode !== "play") {
        e.preventDefault()
        start()
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase()
      keys.delete(k === "a" ? "arrowleft" : k === "d" ? "arrowright" : k)
    }
    const pointerX = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect()
      return ((e.clientX - r.left) / r.width) * W
    }
    const onDown = (e: PointerEvent) => {
      if (mode !== "play") start()
      else catX = pointerX(e)
    }
    const onMove = (e: PointerEvent) => {
      if (mode === "play" && (e.pointerType === "mouse" || e.buttons)) catX = pointerX(e)
    }

    const update = (dt: number) => {
      t += dt
      pops = pops.filter((p) => (p.life -= dt) > 0)
      if (mode !== "play") return
      const dir = (keys.has("arrowright") ? 1 : 0) - (keys.has("arrowleft") ? 1 : 0)
      catX = Math.max(10, Math.min(W - 10, catX + dir * 110 * dt))
      spawnT -= dt
      if (spawnT <= 0) {
        spawnT = Math.max(0.35, 0.75 - score * 0.012)
        fish.push({ x: 10 + Math.random() * (W - 20), y: -4, vy: Math.min(85, 30 + score * 1.2) + Math.random() * 10, gold: Math.random() < 0.12 })
      }
      for (const f of fish) f.y += f.vy * dt
      const mouthY = H - 18
      fish = fish.filter((f) => {
        if (f.y >= mouthY - 3 && f.y <= mouthY + 4 && Math.abs(f.x - catX) < 10) {
          score += f.gold ? 3 : 1
          pops.push({ x: f.x, y: f.y - 6, s: f.gold ? "+3" : "+1", life: 0.6 })
          sfx.blip(f.gold ? 1320 : 990)
          return false
        }
        return f.y < H + 6
      })
      timeLeft -= dt
      if (timeLeft <= 0) {
        mode = "over"
        if (score > best) {
          best = score
          saveBest(best)
        }
        sfx.secret()
      }
    }

    const draw = () => {
      // water, bubbles, sand and weed
      rect(c, 0, 0, W, H, "#1f3c6e")
      rect(c, 0, 30, W, 50, "#244a82")
      rect(c, 0, 70, W, 40, "#2c5a8f")
      for (let i = 0; i < 9; i++) {
        const bx = (i * 37 + 11) % W
        const by = H - ((t * (12 + i * 3) + i * 23) % H)
        disc(c, bx, by, 1, "#7fb4e6")
      }
      rect(c, 0, H - 8, W, 8, "#e6c9a0")
      for (let x = 0; x < W; x += 6) px(c, x + 2, H - 6, "#cfae82")
      for (const wx of [14, 58, 120, 148]) {
        for (let i = 0; i < 6; i++) rect(c, wx + Math.round(Math.sin(t * 2 + i * 0.8 + wx)), H - 9 - i * 3, 2, 3, i % 2 ? C.leaf : C.leafHi)
      }
      for (const f of fish) drawFish(c, f)
      // the cat at the bottom
      const bob = mode === "play" && Math.floor(t * 8) % 2 ? -1 : 0
      c.drawImage(mode === "over" ? catFrames.happy : catFrames.awake, Math.round(catX - CAT_W / 2), H - 8 - CAT_H + bob)
      for (const p of pops) text(c, p.s, Math.round(p.x - 3), Math.round(p.y - (0.6 - p.life) * 12), C.sun)
      // HUD and screens
      if (mode === "play") {
        text(c, `SCORE ${score}`, 4, 4, C.white)
        const s = `${Math.ceil(timeLeft)}S`
        text(c, s, W - textWidth(s) - 4, 4, timeLeft < 6 ? C.pinkHi : C.white)
      } else {
        rect(c, 14, 22, W - 28, 50, "rgba(20,14,40,.75)")
        if (mode === "ready") {
          centered(c, "CATCH THE FISH", 30, C.sun)
          centered(c, "GOLD FISH = +3", 42, C.white)
          centered(c, Math.floor(t * 2) % 2 ? "SPACE OR TAP TO START" : "", 56, C.pinkHi)
        } else {
          centered(c, "TIME!", 28, C.sun)
          centered(c, `SCORE ${score}   BEST ${best}`, 40, C.white)
          centered(c, Math.floor(t * 2) % 2 ? "SPACE OR TAP TO PLAY AGAIN" : "", 56, C.pinkHi)
        }
      }
    }

    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      update(dt)
      draw()
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    cv.addEventListener("pointerdown", onDown)
    cv.addEventListener("pointermove", onMove)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      cv.removeEventListener("pointerdown", onDown)
      cv.removeEventListener("pointermove", onMove)
    }
  }, [])

  return (
    <div className="fishgame-wrap">
      <canvas
        ref={ref}
        className="fishgame"
        width={W}
        height={H}
        role="img"
        aria-label="Bonus game: catch the falling fish with the cat. Use the arrow keys or drag across the screen."
      />
      <p className="muted fishgame-help">← → or drag to move the cat. Golden fish are worth 3.</p>
    </div>
  )
}
