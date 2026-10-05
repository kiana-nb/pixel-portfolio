import { useCallback, useEffect, useState, type CSSProperties } from "react"
import { PROJECTS } from "../content"
import { sfx } from "../game/audio"
import { FishCatch } from "./FishCatch"
import { Cover } from "./pixels"
import { Panel, ProjectDetails } from "./sections"

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

interface Props {
  onClose: () => void
  onInsert: (index: number | null) => void
  // The golden bonus cartridge appears once its secret is found.
  bonus: boolean
}

export function ProjectsConsole({ onClose, onInsert, bonus }: Props) {
  const [sel, setSel] = useState<number | null>(null)
  const [booting, setBooting] = useState(false)
  const count = PROJECTS.length + (bonus ? 1 : 0)
  const isBonus = sel === PROJECTS.length

  const choose = useCallback(
    (i: number) => {
      setSel(i)
      // The room's shelf only holds the project cartridges.
      onInsert(i < PROJECTS.length ? i : null)
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
    const onKey = (e: KeyboardEvent) => {
      // While the bonus game runs, the arrow keys move the cat.
      if (isBonus && !booting) return
      const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0
      if (!step) return
      e.preventDefault()
      choose(((sel ?? -step) + step + count) % count)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [sel, choose, count, isBonus, booting])

  const p = sel === null || isBonus ? null : PROJECTS[sel]

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
          {bonus && (
            <li>
              <button
                type="button"
                className={`cart bonus${isBonus ? " inserted" : ""}`}
                style={{ "--label": "#ffcf4a", "--stripe": "#d9a020" } as CSSProperties}
                aria-pressed={isBonus}
                onClick={() => choose(PROJECTS.length)}
              >
                <span className="cart-shell" aria-hidden="true">
                  <span className="cart-label">★</span>
                </span>
                <span className="cart-name">Fish Catch</span>
                <span className="cart-kind">bonus game · secret</span>
              </button>
            </li>
          )}
        </ul>

        <div className="tv">
          <div className="tv-screen" aria-live="polite">
            {sel === null && (
              <div className="tv-idle">
                <p className="blink">▶ insert a cartridge</p>
                <p className="muted">Pick a project on the shelf, or use the arrow keys.</p>
              </div>
            )}
            {sel !== null && booting && (
              <div className="tv-boot" aria-hidden="true">
                <span>LOADING {(p?.name ?? "FISH CATCH").toUpperCase()}</span>
              </div>
            )}
            {p && !booting && (
              <div className="tv-content" key={p.id}>
                <Cover id={p.id} label={`Pixel illustration for ${p.name}`} />
                <ProjectDetails p={p} />
              </div>
            )}
            {isBonus && !booting && (
              <div className="tv-content">
                <FishCatch />
              </div>
            )}
          </div>
          {sel !== null && (
            <div className="tv-nav">
              <button type="button" className="btn small" onClick={() => choose((sel - 1 + count) % count)}>
                ◀ prev
              </button>
              <span className="muted">
                {sel + 1} / {count}
              </span>
              <button type="button" className="btn small" onClick={() => choose((sel + 1) % count)}>
                next ▶
              </button>
            </div>
          )}
        </div>
      </div>
    </Panel>
  )
}
