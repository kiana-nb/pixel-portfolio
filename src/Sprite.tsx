import { memo } from "react"

// A sprite is an array of equal-width strings. Each char maps to a color in the palette; "." is transparent.
export type Palette = Record<string, string>

interface Rect {
  x: number
  y: number
  w: number
  fill: string
}

// Merge horizontal runs of the same color into one <rect> to keep the DOM small.
function toRects(rows: string[], palette: Palette): Rect[] {
  const out: Rect[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      let end = x + 1
      while (end < row.length && row[end] === ch) end++
      const fill = palette[ch]
      if (ch !== "." && fill) out.push({ x, y, w: end - x, fill })
      x = end
    }
  })
  return out
}

interface SpriteProps {
  rows: string[]
  palette: Palette
  x?: number
  y?: number
  flip?: boolean
  scale?: number
  className?: string
}

export const Sprite = memo(function Sprite({ rows, palette, x = 0, y = 0, flip = false, scale = 1, className }: SpriteProps) {
  const width = rows[0]?.length ?? 0
  const transform = flip ? `translate(${x + width * scale} ${y}) scale(${-scale} ${scale})` : `translate(${x} ${y}) scale(${scale})`
  return (
    // The class goes on an outer group so CSS transforms (animations) do not override the positioning transform.
    <g className={className}>
      <g transform={transform}>
        {toRects(rows, palette).map((r, i) => (
          <rect key={i} x={r.x} y={r.y} width={r.w} height={1} style={{ fill: r.fill }} />
        ))}
      </g>
    </g>
  )
})

export const Box = ({ x, y, w, h, fill, className }: { x: number; y: number; w: number; h: number; fill: string; className?: string }) => (
  <rect x={x} y={y} width={w} height={h} style={{ fill }} className={className} />
)
