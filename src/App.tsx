import { useCallback, useEffect, useState } from "react"
import { ME } from "./content"
import { sfx, startMusic, stopMusic } from "./game/audio"
import { Game } from "./ui/Game"
import { QuickView } from "./ui/QuickView"

// "light" / "dark" match the values a host page may set on <html data-theme>.
type Theme = "light" | "dark"
type Mode = "play" | "quick"

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

const modeFromHash = (): Mode => (window.location.hash === "#quick" ? "quick" : "play")

export function App() {
  const [theme, setTheme] = useState<Theme>(initialTheme)
  const [mode, setMode] = useState<Mode>(modeFromHash)
  const [sound, setSound] = useState(false)
  const [music, setMusic] = useState(false)

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

  useEffect(() => {
    const onHash = () => setMode(modeFromHash())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  useEffect(() => {
    sfx.enabled = sound
    if (sound && music) startMusic()
    else stopMusic()
  }, [sound, music])

  const toggleTheme = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), [])
  const toggleMusic = useCallback(() => {
    if (!music) setSound(true)
    setMusic(!music)
  }, [music])
  const switchMode = (m: Mode) => {
    setMode(m)
    window.location.hash = m === "quick" ? "quick" : "play"
    window.scrollTo({ top: 0 })
  }

  return (
    <>
      <header className="top">
        <a className="logo" href="#play" onClick={() => switchMode("play")}>
          <span className="logo-px" aria-hidden="true" />
          kiana.nb
        </a>
        <div className="top-actions">
          <div className="seg" role="group" aria-label="View">
            <button type="button" aria-pressed={mode === "play"} onClick={() => switchMode("play")}>
              ▶ play
            </button>
            <button type="button" aria-pressed={mode === "quick"} onClick={() => switchMode("quick")}>
              ☰ quick view
            </button>
          </div>
          <button type="button" className="btn icon" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to night" : "Switch to day"}>
            {theme === "light" ? "☾" : "☀"}
          </button>
          <button type="button" className="btn icon sound" onClick={() => setSound((s) => !s)} aria-label={sound ? "Mute sound" : "Turn sound on"} aria-pressed={sound}>
            ♪ <span>{sound ? "on" : "off"}</span>
          </button>
        </div>
      </header>

      <main>
        {mode === "play" ? (
          <>
            <section className="hero">
              <h1>{ME.name}</h1>
              <p className="hero-role">
                {ME.role} <span aria-hidden="true">·</span> <span className="muted">{ME.tagline}</span>
              </p>
            </section>
            <Game night={theme === "dark"} music={music} onToggleNight={toggleTheme} onToggleMusic={toggleMusic} />
            <p className="controls">
              {window.matchMedia("(pointer: coarse)").matches ? (
                <>Tap anywhere to walk, tap things to look at them, tap Kiana to jump. In a hurry? </>
              ) : (
                <>
                  <kbd>←</kbd> <kbd>→</kbd> walk · <kbd>space</kbd> jump · <kbd>E</kbd> look · <kbd>F</kbd> full screen · or just click. In a hurry?{" "}
                </>
              )}
              <a href="#quick" onClick={(e) => (e.preventDefault(), switchMode("quick"))}>
                Open the quick view
              </a>
              .
            </p>
          </>
        ) : (
          <QuickView />
        )}
      </main>

      <footer className="foot">
        <p>made with pixels, coffee and a little help from Claude (꒪꒳꒪)〜</p>
      </footer>
    </>
  )
}
