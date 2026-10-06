import { useEffect, useRef } from "react"
import type { CoverId } from "../content"
import { catFrames, kianaFrames } from "../game/actors"
import { COVERS, COVER_H, COVER_W } from "../game/covers"

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

// A frame from late in each loop, so the still image already shows the finished scene.
const REST_T = 4.3

type Draw = (c: CanvasRenderingContext2D, t: number) => void

// An animated pixel scene. It only runs while it is on screen, and holds a still frame for reduced motion.
export function PixelArt({ draw, w, h, label, className }: { draw: Draw; w: number; h: number; label: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const c = cv.getContext("2d")!
    draw(c, REST_T)
    if (reducedMotion()) return
    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      draw(c, REST_T + (now - start) / 1000)
      raf = requestAnimationFrame(frame)
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) raf = requestAnimationFrame(frame)
    })
    io.observe(cv)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [draw])
  return <canvas ref={ref} className={className} width={w} height={h} role="img" aria-label={label} />
}

export function Cover({ id, label }: { id: CoverId; label: string }) {
  return <PixelArt draw={COVERS[id]} w={COVER_W} h={COVER_H} label={label} className="cover" />
}

// Small face portraits for the dialog box and the quick view.
export function Portrait({ who, className }: { who: "kiana" | "cat"; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const spr = who === "kiana" ? kianaFrames.face : catFrames.awake
  const h = who === "kiana" ? spr.height : 10
  useEffect(() => {
    const c = ref.current?.getContext("2d")
    if (!c) return
    c.clearRect(0, 0, spr.width, h)
    c.drawImage(spr, 0, 0)
  }, [spr, h])
  return <canvas ref={ref} className={`portrait ${className ?? ""}`} width={spr.width} height={h} aria-hidden="true" />
}
