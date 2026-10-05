import { useCallback, useEffect, useRef, useState } from "react"
import { Room } from "./Room"
import { BODIES, ICONS, ProjectPin, TITLES } from "./Sections"
import { ME, PROJECTS, type SectionId } from "./content"

// "light" / "dark" match the values a host page may set on <html data-theme>.
type Theme = "light" | "dark"

const readHostTheme = (): Theme | null => {
  const t = document.documentElement.dataset.theme
  return t === "light" || t === "dark" ? t : null
}

function initialTheme(): Theme {
  const host = readHostTheme()
  if (host) return host
  try {
    const saved = localStorage.getItem("theme")
    if (saved === "light" || saved === "dark") return saved
  } catch {
    /* storage can be blocked */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

// Pins on the board, interleaved so the masonry columns mix project covers with text cards.
type Pin = { kind: "section"; id: SectionId } | { kind: "project"; index: number }
const BOARD: Pin[] = [
  { kind: "section", id: "about" },
  { kind: "project", index: 0 },
  { kind: "section", id: "skills" },
  { kind: "project", index: 1 },
  { kind: "project", index: 2 },
  { kind: "section", id: "experience" },
  { kind: "project", index: 3 },
  { kind: "section", id: "certs" },
  { kind: "project", index: 4 },
  { kind: "project", index: 5 },
  { kind: "section", id: "contact" },
]

function Window({ id, onClose }: { id: SectionId; onClose: () => void }) {
  const Body = BODIES[id]
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      prev?.focus?.()
    }
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div className="win" role="dialog" aria-modal="true" aria-label={TITLES[id]} tabIndex={-1} ref={ref} onClick={(e) => e.stopPropagation()}>
        <div className="titlebar">
          <span>{TITLES[id]}</span>
          <button onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="win-body">
          <Body />
        </div>
      </div>
    </div>
  )
}

export function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [open, setOpen] = useState<SectionId | null>(null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem("theme", theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  // Follow theme changes made by the host page (for example a viewer theme toggle).
  useEffect(() => {
    const obs = new MutationObserver(() => {
      const host = readHostTheme()
      if (host) setTheme(host)
    })
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] })
    return () => obs.disconnect()
  }, [])

  const toggle = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), [])
  const close = useCallback(() => setOpen(null), [])

  return (
    <>
      <header className="top">
        <a className="logo" href="#top">
          <span className="logo-px" aria-hidden="true" /> kiana.nb
        </a>
        <button className="theme" onClick={toggle} aria-label={`Switch to ${theme === "light" ? "night" : "day"} mode`}>
          {theme === "light" ? "☾ night" : "☀ day"}
        </button>
      </header>

      <main id="top">
        <section className="hero">
          <h1>{ME.name}</h1>
          <p className="role">{ME.role}</p>
          <p className="tagline">{ME.tagline}</p>
          <div className="stage">
            <Room onOpen={setOpen} onToggleTheme={toggle} />
          </div>
          <p className="hint">▲ psst, everything in the room is clickable. try the cat.</p>
        </section>

        <section className="board" aria-label="Everything, laid out on a board">
          <h2>the board</h2>
          <div className="masonry">
            {BOARD.map((pin, i) => {
              if (pin.kind === "project") {
                const p = PROJECTS[pin.index]
                return (
                  <article key={p.name} className={`card pin tilt-${i % 3}`} id={pin.index === 0 ? "projects" : undefined}>
                    <ProjectPin p={p} />
                  </article>
                )
              }
              const Body = BODIES[pin.id]
              return (
                <article key={pin.id} className={`card tilt-${i % 3}`} id={pin.id}>
                  <div className="card-head">
                    <span className="icon" aria-hidden="true">
                      {ICONS[pin.id]}
                    </span>
                    <h3>{TITLES[pin.id]}</h3>
                  </div>
                  <Body />
                </article>
              )
            })}
          </div>
        </section>
      </main>

      <footer className="foot">
        <p>made with pixels, coffee and a little help from Claude (꒪꒳꒪)〜</p>
      </footer>

      {open && <Window id={open} onClose={close} />}
    </>
  )
}
