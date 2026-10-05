import { useCallback, useEffect, useState, type CSSProperties } from "react"
import { PROJECTS } from "../content"
import { sfx } from "../game/audio"
import { Cover } from "./pixels"
import { Panel, ProjectDetails } from "./sections"

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

interface Props {
  onClose: () => void
  onInsert: (index: number | null) => void
  initial?: number | null
}

export function ProjectsConsole({ onClose, onInsert, initial = null }: Props) {
  const [sel, setSel] = useState<number | null>(initial)
  const [booting, setBooting] = useState(false)

  const choose = useCallback(
    (i: number) => {
      setSel(i)
      onInsert(i)
      sfx.open()
      if (reducedMotion()) return
      setBooting(true)
      window.setTimeout(() => setBooting(false), 620)
    },
    [onInsert],
  )

  const close = useCallback(() => {
    onInsert(null)
    sfx.close()
    onClose()
  }, [onClose, onInsert])

  useEffect(() => {
    if (initial !== null) onInsert(initial)
  }, [initial, onInsert])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
      if (!step) return
      e.preventDefault()
      choose(((sel ?? -step) + step + PROJECTS.length) % PROJECTS.length)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sel, choose])

  const p = sel === null ? null : PROJECTS[sel]

  return (
    <Panel title="cartridges · pick a game" onClose={close} className="console">
      <div className="console-grid">
        <ul className="carts" aria-label="Projects">
          {PROJECTS.map((q, i) => (
            <li key={q.id}>
              <button
                type="button"
                className={`cart${sel === i ? " inserted" : ""}`}
                style={{ "--label": q.label, "--stripe": q.stripe } as CSSProperties}
                aria-pressed={sel === i}
                onClick={() => choose(i)}
              >
                <span className="cart-shell" aria-hidden="true">
                  <span className="cart-label">{q.name.split(" ")[0]}</span>
                </span>
                <span className="cart-name">{q.name}</span>
                <span className="cart-kind">{q.kind}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="tv">
          <div className="tv-screen" aria-live="polite">
            {!p && (
              <div className="tv-idle">
                <p className="blink">▶ insert a cartridge</p>
                <p className="muted">Pick a project on the shelf, or use the arrow keys.</p>
              </div>
            )}
            {p && booting && (
              <div className="tv-boot" aria-hidden="true">
                <span>LOADING {p.name.toUpperCase()}</span>
              </div>
            )}
            {p && !booting && (
              <div className="tv-content" key={p.id}>
                <Cover id={p.id} label={`Pixel illustration for ${p.name}`} />
                <ProjectDetails p={p} />
              </div>
            )}
          </div>
          {p && (
            <div className="tv-nav">
              <button type="button" className="btn small" onClick={() => choose((sel! - 1 + PROJECTS.length) % PROJECTS.length)}>
                ◀ prev
              </button>
              <span className="muted">
                {sel! + 1} / {PROJECTS.length}
              </span>
              <button type="button" className="btn small" onClick={() => choose((sel! + 1) % PROJECTS.length)}>
                next ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}
