import { useEffect, useMemo, useState, type KeyboardEvent, type ReactNode } from "react"
import { Box, Sprite, type Palette } from "./Sprite"
import {
  CAT, CAT_PAL, CUSHION, CUSHION_PAL, CLOUD, CLOUD_PAL, CUBE, CUBE_PAL, ENVELOPE, ENVELOPE_PAL, HEART, HEART_PAL, KIANA, KIANA_PAL,
  MOON, MOON_PAL, MUG, MUG_PAL, PLANT, PLANT_PAL, POT, POT_PAL, ROBOT, ROBOT_PAL, SUN, SUN_PAL,
} from "./sprites"
import type { SectionId } from "./content"

const v = (name: string) => `var(--${name})`

// Round sprite generated from a diameter: rim color on the outer ring, fill inside.
function disc(d: number): string[] {
  const r = d / 2
  return Array.from({ length: d }, (_, y) =>
    Array.from({ length: d }, (_, x) => {
      const dist = Math.hypot(x + 0.5 - r, y + 0.5 - r)
      return dist > r ? "." : dist > r - 1.3 ? "r" : "f"
    }).join(""),
  )
}
const CLOCK = disc(16)
const CLOCK_PAL: Palette = { r: v("wood-d"), f: v("clock") }

interface HotspotProps {
  id: string
  label: string
  box: [number, number, number, number]
  onActivate: () => void
  children: ReactNode
}

function Hotspot({ id, label, box, onActivate, children }: HotspotProps) {
  const [x, y, w, h] = box
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onActivate()
    }
  }
  const lw = label.length * 3 + 4
  const lx = Math.min(Math.max(x + w / 2 - lw / 2, 1), 191 - lw)
  const ly = y > 12 ? y - 7 : y + h + 2
  return (
    <g className="hotspot" role="button" tabIndex={0} aria-label={label} data-id={id} onClick={onActivate} onKeyDown={onKey}>
      <g className="hs-art">{children}</g>
      <rect x={x - 1} y={y - 1} width={w + 2} height={h + 2} className="hit" />
      <g className="hs-label" aria-hidden="true">
        <rect x={lx} y={ly} width={lw} height={6} style={{ fill: v("ink") }} />
        <text x={lx + lw / 2} y={ly + 4.4} textAnchor="middle">{label}</text>
      </g>
    </g>
  )
}

const BOOK_COLORS = ["b1", "b2", "b3", "b4", "b5", "b6"]
// [width, height] pairs; colors cycle so the shelf stays stable between renders.
const SHELVES: { y: number; books: [number, number][]; extra?: ReactNode }[] = [
  { y: 28, books: [[3, 12], [2, 10], [3, 13], [2, 9], [3, 11], [2, 12], [3, 10], [3, 13], [2, 11]] },
  { y: 44, books: [[2, 11], [3, 9], [2, 12], [3, 10]] },
  { y: 60, books: [[3, 11], [2, 12], [3, 9], [2, 13], [3, 10], [2, 11], [3, 12]] },
]

function Shelf() {
  let c = 0
  return (
    <g>
      <Box x={154} y={12} w={34} h={60} fill={v("wood-d")} />
      <Box x={156} y={14} w={30} h={56} fill={v("shelf-back")} />
      {[12, 28, 44, 60, 70].map((y) => (
        <g key={y}>
          <Box x={154} y={y} w={34} h={2} fill={v("wood")} />
          <Box x={154} y={y} w={34} h={1} fill={v("wood-hi")} />
        </g>
      ))}
      {SHELVES.map((s) => {
        let x = 157
        return (
          <g key={s.y}>
            {s.books.map(([w, h], i) => {
              const bx = x
              x += w
              return (
                <g key={i}>
                  <Box x={bx} y={s.y - h} w={w} h={h} fill={v(BOOK_COLORS[c++ % BOOK_COLORS.length])} />
                  <Box x={bx} y={s.y - h + 2} w={w} h={1} fill="rgba(255,255,255,.35)" />
                </g>
              )
            })}
          </g>
        )
      })}
      <Sprite rows={CUBE} palette={CUBE_PAL} x={176} y={39} />
      <Sprite rows={ROBOT} palette={ROBOT_PAL} x={170} y={39} />
      <Sprite rows={HEART} palette={HEART_PAL} x={167} y={55} />
      <Box x={176} y={65} w={8} h={5} fill={v("b3")} />
      <Box x={176} y={65} w={8} h={1} fill="rgba(255,255,255,.35)" />
      <Box x={157} y={64} w={14} h={6} fill={v("basket")} />
      <Box x={157} y={64} w={14} h={1} fill={v("wood-hi")} />
      <Box x={159} y={66} w={10} h={1} fill={v("basket-d")} />
      <Box x={159} y={68} w={10} h={1} fill={v("basket-d")} />
    </g>
  )
}

function StringLights() {
  const bulbs = useMemo(
    () => Array.from({ length: 16 }, (_, i) => ({ x: 60 + i * 6, y: 5 + Math.round(Math.sin((i / 15) * Math.PI) * 3), c: ["accent-2", "sun", "mint", "sky-d"][i % 4] })),
    [],
  )
  return (
    <g>
      {bulbs.map((b, i) => (
        <g key={i}>
          <Box x={b.x} y={b.y - 1} w={1} h={1} fill={v("ink")} />
          <Box x={b.x - 1} y={b.y} w={3} h={3} fill={v(b.c)} className="bulb" />
        </g>
      ))}
    </g>
  )
}

function Rug() {
  const rows = []
  for (let dy = -8; dy <= 8; dy++) {
    const k = Math.sqrt(1 - (dy / 8.5) ** 2)
    const half = Math.round(46 * k)
    rows.push({ y: 96 + dy, half, i1: Math.round(half * 0.82), i2: Math.round(half * 0.5) })
  }
  return (
    <g>
      {rows.map((r) => (
        <g key={r.y}>
          <Box x={108 - r.half} y={r.y} w={r.half * 2} h={1} fill={v("rug-3")} />
          <Box x={108 - r.i1} y={r.y} w={r.i1 * 2} h={1} fill={v("rug-1")} />
          <Box x={108 - r.i2} y={r.y} w={r.i2 * 2} h={1} fill={v("rug-2")} />
        </g>
      ))}
    </g>
  )
}

interface RoomProps {
  onOpen: (id: SectionId) => void
  onToggleTheme: () => void
}

const STARS: [number, number][] = [[20, 16], [28, 24], [44, 14], [24, 38], [47, 31], [38, 22]]

export function Room({ onOpen, onToggleTheme }: RoomProps) {
  const [meow, setMeow] = useState(false)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (!meow) return
    const t = setTimeout(() => setMeow(false), 2200)
    return () => clearTimeout(t)
  }, [meow])

  const mAng = (now.getMinutes() / 60) * Math.PI * 2
  const hAng = (((now.getHours() % 12) + now.getMinutes() / 60) / 12) * Math.PI * 2
  const hand = (len: number, a: number) => [Math.round(118 + Math.sin(a) * len), Math.round(20 - Math.cos(a) * len)]
  const [mx, my] = hand(5.5, mAng)
  const [hx, hy] = hand(3.5, hAng)

  return (
    <svg className="room" viewBox="0 0 192 108" role="group" aria-label="Kiana's pixel room. Click things to explore." shapeRendering="crispEdges">
      <defs>
        <radialGradient id="lamp-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffd27a" stopOpacity=".55" />
          <stop offset="100%" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* wall + floor */}
      <Box x={0} y={0} w={192} h={72} fill={v("wall")} />
      {Array.from({ length: 24 }, (_, i) => (
        <Box key={i} x={i * 8 + 4} y={0} w={2} h={55} fill={v("wall-stripe")} />
      ))}
      <Box x={0} y={55} w={192} h={17} fill={v("wall-d")} />
      <Box x={0} y={55} w={192} h={1} fill={v("wood-hi")} />
      <Box x={0} y={70} w={192} h={2} fill={v("wood-d")} />
      <Box x={0} y={72} w={192} h={36} fill={v("floor")} />
      {[78, 85, 93, 102].map((y) => (
        <Box key={y} x={0} y={y} w={192} h={1} fill={v("floor-d")} />
      ))}
      {[[20, 72], [58, 72], [100, 78], [140, 78], [30, 85], [90, 85], [160, 85], [50, 93], [120, 93], [10, 102], [80, 102], [150, 102]].map(([x, y]) => (
        <Box key={`${x}-${y}`} x={x} y={y} w={1} h={y === 72 ? 6 : y === 78 ? 7 : y === 85 ? 8 : y === 93 ? 9 : 6} fill={v("floor-d")} />
      ))}

      <StringLights />

      {/* window */}
      <Hotspot id="window" label="day / night" box={[12, 8, 44, 40]} onActivate={onToggleTheme}>
        <Box x={14} y={10} w={38} h={36} fill={v("wood")} />
        <Box x={16} y={12} w={34} h={32} fill={v("sky")} />
        <g className="day-only">
          <Sprite rows={SUN} palette={SUN_PAL} x={36} y={14} />
          <Sprite rows={CLOUD} palette={CLOUD_PAL} x={18} y={30} className="drift" />
          <Sprite rows={CLOUD} palette={CLOUD_PAL} x={32} y={22} className="drift slow" />
        </g>
        <g className="night-only">
          <Sprite rows={MOON} palette={MOON_PAL} x={36} y={15} />
          {STARS.map(([x, y], i) => (
            <Box key={i} x={x} y={y} w={1} h={1} fill={v("moon")} className="twinkle" />
          ))}
        </g>
        <Box x={31} y={12} w={3} h={32} fill={v("wood")} />
        <Box x={16} y={27} w={34} h={3} fill={v("wood")} />
        <Box x={12} y={46} w={44} h={3} fill={v("wood-hi")} />
        <Box x={9} y={7} w={50} h={2} fill={v("wood-d")} />
        <Box x={10} y={9} w={7} h={38} fill={v("curtain")} />
        <Box x={13} y={9} w={1} h={38} fill={v("curtain-d")} />
        <Box x={49} y={9} w={7} h={38} fill={v("curtain")} />
        <Box x={52} y={9} w={1} h={38} fill={v("curtain-d")} />
      </Hotspot>

      {/* clock = experience */}
      <Hotspot id="experience" label="experience" box={[110, 12, 16, 16]} onActivate={() => onOpen("experience")}>
        <Sprite rows={CLOCK} palette={CLOCK_PAL} x={110} y={12} />
        <line x1={118} y1={20} x2={mx} y2={my} stroke={v("ink")} strokeWidth={1} />
        <line x1={118} y1={20} x2={hx} y2={hy} stroke={v("accent-2")} strokeWidth={1.4} />
        <Box x={117} y={19} w={2} h={2} fill={v("ink")} />
      </Hotspot>

      {/* frames: certificates */}
      <Hotspot id="certs" label="certificates" box={[60, 14, 22, 28]} onActivate={() => onOpen("certs")}>
        <Box x={60} y={14} w={22} h={28} fill={v("wood")} />
        <Box x={62} y={16} w={18} h={24} fill={v("paper")} />
        <Box x={65} y={19} w={12} h={1} fill={v("ink")} />
        <Box x={65} y={22} w={12} h={1} fill={v("paper-d")} />
        <Box x={65} y={24} w={12} h={1} fill={v("paper-d")} />
        <Box x={65} y={26} w={9} h={1} fill={v("paper-d")} />
        <Box x={68} y={30} w={6} h={6} fill={v("sun")} />
        <Box x={69} y={31} w={4} h={4} fill={v("accent-2")} />
        <Box x={68} y={36} w={2} h={3} fill={v("accent")} />
        <Box x={72} y={36} w={2} h={3} fill={v("accent")} />
        <Box x={68} y={12} w={8} h={3} fill={v("tape")} />
      </Hotspot>
      <g aria-hidden="true">
        <Box x={86} y={18} w={16} h={14} fill={v("wood")} />
        <Box x={88} y={20} w={12} h={10} fill={v("sky")} />
        <Sprite rows={HEART} palette={HEART_PAL} x={90.5} y={22} />
      </g>

      <Hotspot id="skills" label="skills" box={[154, 12, 34, 60]} onActivate={() => onOpen("skills")}>
        <Shelf />
      </Hotspot>

      {/* sunbeam + rug */}
      <polygon className="day-only beam" points="18,48 50,48 92,102 40,102" />
      <Rug />

      {/* floor clutter */}
      <Sprite rows={CUSHION} palette={CUSHION_PAL} x={22} y={88} />
      <Box x={164} y={96} w={14} h={3} fill={v("b2")} />
      <Box x={165} y={93} w={12} h={3} fill={v("b4")} />
      <Box x={163} y={90} w={13} h={3} fill={v("b1")} />
      <Box x={163} y={90} w={13} h={1} fill="rgba(255,255,255,.35)" />
      <Box x={165} y={93} w={12} h={1} fill="rgba(255,255,255,.35)" />
      <Box x={164} y={96} w={14} h={1} fill="rgba(255,255,255,.35)" />
      <Box x={163} y={99} w={16} h={1} fill="rgba(0,0,0,.15)" />

      {/* plant */}
      <Sprite rows={PLANT} palette={PLANT_PAL} x={4} y={44} scale={2} className="sway" />
      <Sprite rows={POT} palette={POT_PAL} x={7} y={60} scale={2} />

      {/* desk */}
      <Box x={64} y={84} w={88} h={3} fill="rgba(0,0,0,.12)" />
      <Box x={68} y={67} w={4} h={19} fill={v("wood-d")} />
      <Box x={144} y={67} w={4} h={19} fill={v("wood-d")} />
      <Box x={64} y={60} w={88} h={7} fill={v("wood")} />
      <Box x={64} y={60} w={88} h={2} fill={v("wood-hi")} />
      <Box x={64} y={65} w={88} h={2} fill={v("wood-d")} />

      {/* chair + Kiana */}
      <Box x={85} y={37} w={26} h={22} fill={v("chair")} />
      <Box x={85} y={37} w={26} h={2} fill={v("chair-hi")} />
      <Hotspot id="about" label="about me" box={[88, 24, 20, 18]} onActivate={() => onOpen("about")}>
        <Sprite rows={KIANA} palette={KIANA_PAL} x={88} y={22} className="bob" />
      </Hotspot>

      {/* laptop = projects */}
      <Hotspot id="projects" label="projects" box={[82, 42, 36, 18]} onActivate={() => onOpen("projects")}>
        <Box x={85} y={42} w={30} h={16} fill={v("laptop")} />
        <Box x={85} y={42} w={30} h={1} fill={v("laptop-hi")} />
        <Box x={82} y={58} w={36} h={2} fill={v("laptop-d")} />
        <Sprite rows={HEART} palette={HEART_PAL} x={96.5} y={47} className="pulse" />
      </Hotspot>

      {/* lamp */}
      <circle className="night-only lamp-glow" cx={73} cy={52} r={34} fill="url(#lamp-glow)" />
      <Box x={72} y={52} w={2} h={6} fill={v("laptop-d")} />
      <Box x={69} y={58} w={8} h={2} fill={v("laptop-d")} />
      <Box x={68} y={46} w={10} h={2} fill={v("lamp")} />
      <Box x={67} y={48} w={12} h={4} fill={v("lamp")} />
      <Box x={67} y={51} w={12} h={1} fill={v("lamp-d")} />

      {/* mug + robot */}
      <Sprite rows={MUG} palette={MUG_PAL} x={122} y={54} />
      <Box x={124} y={50} w={1} h={2} fill="rgba(255,255,255,.7)" className="steam" />
      <Box x={127} y={51} w={1} h={2} fill="rgba(255,255,255,.7)" className="steam two" />
      <Sprite rows={ROBOT} palette={ROBOT_PAL} x={146} y={55} />

      {/* envelope = contact */}
      <Hotspot id="contact" label="say hi" box={[130, 52, 12, 8]} onActivate={() => onOpen("contact")}>
        <Sprite rows={ENVELOPE} palette={ENVELOPE_PAL} x={130} y={53} className="bounce" />
      </Hotspot>

      {/* cat */}
      <Hotspot id="cat" label="pet the cat" box={[124, 90, 14, 11]} onActivate={() => setMeow(true)}>
        <Sprite rows={CAT} palette={CAT_PAL} x={124} y={90} className="breathe" />
      </Hotspot>
      {meow && (
        <g className="bubble" aria-live="polite">
          <rect x={112} y={78} width={44} height={9} style={{ fill: v("paper") }} />
          <rect x={112} y={78} width={44} height={9} fill="none" style={{ stroke: v("ink") }} strokeWidth={1} />
          <rect x={129} y={87} width={3} height={2} style={{ fill: v("paper") }} />
          <text x={134} y={84.2} textAnchor="middle">mrrp (=^-ω-^=)</text>
        </g>
      )}
    </svg>
  )
}
