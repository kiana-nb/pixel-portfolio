import { useCallback, useEffect, useRef, useState } from "react"
import { EXPERIENCE, PROJECTS, type SectionId } from "../content"
import { sfx } from "../game/audio"
import { Engine, type SceneId, type SecretId } from "../game/engine"
import type { Thing } from "../game/world"
import { Portrait } from "./pixels"
import { ProjectsConsole } from "./ProjectsConsole"
import { SECRETS, loadFound, saveFound, type SecretKey } from "../secrets"
import { BODIES, Panel, TITLES } from "./sections"

type Speaker = "kiana" | "cat"
interface Dialog {
  speaker: Speaker
  lines: string[]
  i: number
  shown: number
}

const JUMPS: { id: string; label: string }[] = [
  { id: "journal", label: "about" },
  { id: "tv", label: "projects" },
  { id: "shelf", label: "skills" },
  { id: "desk", label: "experience" },
  { id: "certs", label: "certificates" },
  { id: "mailbox", label: "say hi" },
  { id: "door", label: "career street" },
]

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const touch = () => window.matchMedia("(pointer: coarse)").matches
const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"]
const ROOM_PARTS = ["about", "projects", "skills", "experience", "certs", "contact"]

interface Props {
  night: boolean
  music: boolean
  onToggleNight: () => void
  onToggleMusic: () => void
}

export function Game({ night, music, onToggleNight, onToggleMusic }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const promptRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<Engine | null>(null)
  const [panel, setPanel] = useState<Exclude<SectionId, "projects"> | null>(null)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [full, setFull] = useState(false)
  const [rotateHint, setRotateHint] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const gameRef = useRef<HTMLDivElement>(null)
  const fullRef = useRef(false)
  const realFullscreen = useRef(false)
  const fitRef = useRef<() => void>(() => {})
  const [found, setFound] = useState<Set<SecretKey>>(loadFound)
  const [toast, setToast] = useState<{ title: string; n: number } | null>(null)
  const [secretsOpen, setSecretsOpen] = useState(false)
  const [career, setCareer] = useState<number | null>(null)
  const [scene, setScene] = useState<SceneId>("room")
  const seenStreet = useRef(false)
  const visited = useRef(new Set<string>())
  const typed = useRef<string[]>([])
  const secretsHere = SECRETS.filter((x) => !x.keyboard || !touch())

  const foundRef = useRef(found)
  const unlock = useCallback((id: SecretKey) => {
    if (foundRef.current.has(id)) return
    const next = new Set(foundRef.current).add(id)
    foundRef.current = next
    setFound(next)
    saveFound(next)
    const def = SECRETS.find((x) => x.id === id)
    if (def) setToast({ title: def.title, n: next.size })
    sfx.secret()
  }, [])

  const visit = useCallback(
    (part: string) => {
      visited.current.add(part)
      if (ROOM_PARTS.every((p) => visited.current.has(p))) unlock("explorer")
    },
    [unlock],
  )

  // Latest values for the engine callbacks, which are created once.
  const live = useRef({ night, music, onToggleNight, onToggleMusic, dialog })
  live.current = { night, music, onToggleNight, onToggleMusic, dialog }

  const say = useCallback((lines: string[], speaker: Speaker = "kiana") => {
    setDialog({ speaker, lines, i: 0, shown: reducedMotion() ? Infinity : 0 })
  }, [])

  const advance = useCallback(() => {
    setDialog((d) => {
      if (!d) return d
      if (d.shown < d.lines[d.i].length) return { ...d, shown: Infinity }
      if (d.i + 1 < d.lines.length) return { ...d, i: d.i + 1, shown: reducedMotion() ? Infinity : 0 }
      return null
    })
    sfx.blip(1040)
  }, [])

  const onInteract = useCallback(
    (thing: Thing) => {
      const a = thing.action
      const { night: isNight, music: isMusic } = live.current
      switch (a.kind) {
        case "section":
          sfx.open()
          setDialog(null)
          setPanel(a.id as Exclude<SectionId, "projects">)
          visit(a.id)
          break
        case "projects":
          sfx.open()
          setDialog(null)
          setConsoleOpen(true)
          visit("projects")
          break
        case "feed":
          sfx.blip(660)
          say(["You fill the bowl with crunchy fish bites.", "Someone heard that!"])
          break
        case "career":
          sfx.open()
          setDialog(null)
          setCareer(a.index)
          visit("experience")
          break
        case "play":
          sfx.blip(880)
          say(["You toss the yarn ball. Go get it!"])
          break
        case "theme":
          live.current.onToggleNight()
          say([isNight ? "Curtains open. Good morning! ☀" : "The stars are out. Cozy mode on ☾"])
          break
        case "music":
          live.current.onToggleMusic()
          say([isMusic ? "The record stops. Quiet time." : "♪ The record starts spinning."])
          break
        case "pet":
          sfx.purr()
          say([pick(["mrrp! (=^･ω･^=)", "purrrr ♥", "mew? (=ↀωↀ=)", "*happy tail swish*", "prrrt!"])], "cat")
          break
        case "water": {
          sfx.water()
          const grew = engineRef.current?.lastGrowth ?? null
          if (thing.id !== "plant2") say([pick(["You water the monstera. Its leaves look shinier.", "Glug glug. The big leaves perk up."])])
          else if (grew === 1) say(["The sprout drinks it all up and stands a little taller."])
          else if (grew === 2) say(["It's growing! Look, little buds.", "One more watering, maybe?"])
          else if (grew === 3) say(["It bloomed! ✿", "Thank you for looking after it."])
          else say(["It's in full bloom already. It just wants some sun now ☀"])
          break
        }
        case "say":
          sfx.blip()
          say(a.lines)
          break
      }
    },
    [say, visit],
  )

  const onScene = useCallback(
    (id: SceneId) => {
      setScene(id)
      if (id === "street" && !seenStreet.current) {
        seenStreet.current = true
        say(["Welcome to Career Street! ✿", "Each building is a stop on my way so far. The years are on the sidewalk.", "The mint car is yours. Hop in to get around faster."])
      } else if (id === "room") say(["Home sweet home."])
    },
    [say],
  )

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current!
    const engine = new Engine(canvas, promptRef.current!, { onInteract: (t) => onInteract(t), onAdvance: () => advance(), onSecret: (id: SecretId) => unlock(id), onScene: (id: SceneId) => onScene(id) }, PROJECTS.map((p) => ({ label: p.label, stripe: p.stripe })))
    engineRef.current = engine
    if (import.meta.env.DEV) Object.assign(window, { __engine: engine })
    engine.setFound([...loadFound()].filter((x): x is SecretId => x !== "explorer"))
    engine.setNight(live.current.night, true)
    const fit = () => {
      const w = stageRef.current?.clientWidth ?? 800
      // In full screen the room takes all the height except the row of buttons under it.
      const short = window.innerHeight < 520
      const h = fullRef.current ? window.innerHeight - (short ? 24 : window.innerWidth < 760 ? 150 : 100) : Math.min(window.innerHeight * 0.72, 720)
      engine.resize(w, h)
    }
    fitRef.current = fit
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(stageRef.current!)
    window.addEventListener("resize", fit)
    const hello = window.setTimeout(() => {
      say(
        touch()
          ? ["hi, i'm Kiana! ✿ welcome to my room.", "Tap anywhere to walk, tap things to look at them, and tap me to jump.", "My projects are the cartridges by the TV."]
          : ["hi, i'm Kiana! ✿ welcome to my room.", "Walk with ← → or A D, jump with space, or click anywhere.", "Press E near things. My projects are the cartridges by the TV."],
      )
    }, reducedMotion() ? 0 : 1000)
    return () => {
      window.clearTimeout(hello)
      window.removeEventListener("resize", fit)
      ro.disconnect()
      engine.destroy()
      engineRef.current = null
    }
  }, [onInteract, advance, say, unlock, onScene])

  // Full screen: the real Fullscreen API when the browser allows it, otherwise the room just covers the page.
  const toggleFull = useCallback(async () => {
    const orientation = screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }
    if (fullRef.current) {
      try {
        orientation?.unlock?.()
      } catch {
        /* not supported */
      }
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {})
      setFull(false)
      return
    }
    try {
      await gameRef.current?.requestFullscreen?.()
      realFullscreen.current = !!document.fullscreenElement
    } catch {
      realFullscreen.current = false
    }
    // On phones, try to turn the room sideways; where that is not allowed, the rotate hint asks the visitor to.
    if (touch()) await orientation?.lock?.("landscape").catch(() => {})
    setRotateHint(touch() && window.matchMedia("(orientation: portrait)").matches)
    setFull(true)
  }, [])

  // The hint goes away by itself once the phone is turned.
  useEffect(() => {
    if (!rotateHint) return
    const mq = window.matchMedia("(orientation: portrait)")
    const onChange = () => {
      if (!mq.matches) setRotateHint(false)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [rotateHint])

  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement && realFullscreen.current) {
        realFullscreen.current = false
        setFull(false)
      }
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  useEffect(() => {
    fullRef.current = full
    if (!full) setRotateHint(false)
    document.documentElement.classList.toggle("room-full", full)
    fitRef.current()
    const id = requestAnimationFrame(() => fitRef.current())
    return () => cancelAnimationFrame(id)
  }, [full])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || consoleOpen || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return
      if (e.key === "f" || e.key === "F") void toggleFull()
      else if (e.key === "Escape" && fullRef.current && !document.fullscreenElement) setFull(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [panel, consoleOpen, toggleFull])

  useEffect(() => engineRef.current?.setNight(night), [night])
  useEffect(() => {
    if (engineRef.current) engineRef.current.music = music
  }, [music])
  useEffect(() => {
    if (engineRef.current) engineRef.current.paused = !!panel || consoleOpen || secretsOpen || career !== null
  }, [panel, consoleOpen, secretsOpen, career])

  // Typed secrets: the Konami code and the word "meow".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || consoleOpen || secretsOpen || e.ctrlKey || e.metaKey || e.altKey) return
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return
      const k = e.key.toLowerCase()
      const buf = [...typed.current, k].slice(-KONAMI.length)
      typed.current = buf
      if (KONAMI.every((x, i) => buf[i] === x)) {
        typed.current = []
        engineRef.current?.unlockBonus()
        say(["A golden cartridge just appeared on top of the TV! ★"])
      } else if (buf.slice(-4).join("") === "meow") {
        typed.current = []
        sfx.meow()
        engineRef.current?.meow()
        say(["MEOW! (=^･ω･^=)", "The cat seems to understand you."], "cat")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [panel, consoleOpen, secretsOpen, say])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 3400)
    return () => window.clearTimeout(id)
  }, [toast])
  useEffect(() => {
    if (engineRef.current) engineRef.current.dialogOpen = !!dialog
  }, [dialog])

  // typewriter
  useEffect(() => {
    if (!dialog || dialog.shown >= dialog.lines[dialog.i].length) return
    const id = window.setTimeout(() => {
      setDialog((d) => (d ? { ...d, shown: d.shown + 1 } : d))
      if (dialog.shown % 3 === 0) sfx.blip(dialog.speaker === "cat" ? 1400 : 760)
    }, 24)
    return () => window.clearTimeout(id)
  }, [dialog])

  // close a finished dialog after a while
  useEffect(() => {
    if (!dialog || dialog.shown < dialog.lines[dialog.i].length || dialog.i < dialog.lines.length - 1) return
    const id = window.setTimeout(() => setDialog(null), 6000)
    return () => window.clearTimeout(id)
  }, [dialog])

  const closePanel = useCallback(() => {
    sfx.close()
    setPanel(null)
  }, [])
  const closeConsole = useCallback(() => setConsoleOpen(false), [])
  const closeSecrets = useCallback(() => setSecretsOpen(false), [])
  const closeCareer = useCallback(() => {
    sfx.close()
    setCareer(null)
  }, [])
  const insert = useCallback((i: number | null) => {
    if (engineRef.current) engineRef.current.inserted = i
  }, [])

  const go = (id: string) => {
    setMenuOpen(false)
    engineRef.current?.walkTo(id)
  }
  const jumpButtons = JUMPS.map((j) =>
    scene === "street" && j.id === "door" ? (
      <button key="home" type="button" className="btn small" onClick={() => go("home")}>
        go home
      </button>
    ) : (
      <button key={j.id} type="button" className="btn small" onClick={() => go(j.id)}>
        {j.label}
      </button>
    ),
  )

  const line = dialog ? dialog.lines[dialog.i] : ""
  const done = dialog ? dialog.shown >= line.length : false

  return (
    <div className={`game${full ? " is-full" : ""}`} ref={gameRef}>
      <div className="stage" ref={stageRef}>
        {full && (
          <button type="button" className="menu-btn" onClick={() => setMenuOpen((m) => !m)} aria-expanded={menuOpen} aria-label="Places in the room">
            ☰
          </button>
        )}
        {full && menuOpen && (
          <nav className="menu-pop" aria-label="Visit a part of the room">
            {jumpButtons}
          </nav>
        )}
        <button type="button" className="fs-btn" onClick={() => void toggleFull()} aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen (F)" : "Full screen (F)"}>
          {full ? "⤡" : "⤢"}
        </button>
        <button type="button" className="secrets-btn" onClick={() => setSecretsOpen(true)} aria-label={`Secrets found: ${found.size} of ${secretsHere.length}`}>
          ★ {found.size}/{secretsHere.length}
        </button>
        {full && rotateHint && (
          <div className="rotate-hint" role="status">
            <span className="rotate-phone" aria-hidden="true" />
            <p>Rotate your phone for a bigger room ↻</p>
            <button type="button" className="btn small" onClick={() => setRotateHint(false)}>
              keep it upright
            </button>
          </div>
        )}
        {toast && (
          <div className="toast" role="status">
            <span className="toast-star" aria-hidden="true">★</span>
            <span>
              Secret found: <strong>{toast.title}</strong>
            </span>
            <span className="toast-count">
              {toast.n}/{secretsHere.length}
            </span>
          </div>
        )}
        <canvas ref={canvasRef} className="room" role="img" aria-label="Kiana's pixel room. Use the buttons below the room to visit each part." />
        <div className="prompt" ref={promptRef} hidden aria-hidden="true">
          <span className="key">E</span>
          <span className="label" />
        </div>
        {dialog && (
          <button type="button" className={`dialog ${dialog.speaker}`} onClick={advance} aria-live="polite">
            <Portrait who={dialog.speaker} className="dialog-face" />
            <span className="dialog-text">
              {line.slice(0, dialog.shown)}
              <span className="ghost" aria-hidden="true">
                {line.slice(dialog.shown)}
              </span>
            </span>
            {done && <span className="dialog-next" aria-hidden="true">{dialog.i < dialog.lines.length - 1 ? "▼" : "×"}</span>}
          </button>
        )}
      </div>

      {!full && (
        <nav className="jumps" aria-label="Visit a part of the room">
          <span className="jumps-label">go to</span>
          {jumpButtons}
        </nav>
      )}

      {panel && (
        <Panel title={TITLES[panel]} onClose={closePanel}>
          {(() => {
            const Body = BODIES[panel]
            return <Body />
          })()}
        </Panel>
      )}
      {consoleOpen && <ProjectsConsole onClose={closeConsole} onInsert={insert} bonus={found.has("konami")} />}
      {career !== null && (
        <Panel title={`career street · stop ${EXPERIENCE.length - career} of ${EXPERIENCE.length}`} onClose={closeCareer}>
          {(() => {
            const e = EXPERIENCE[career]
            return (
              <div className="career-stop">
                <p className="when">{e.when}</p>
                <h3 className="career-where">{e.where}</h3>
                <p className="role-line">{e.what}</p>
                {e.note && <p>{e.note}</p>}
                <div className="link-row">
                  {career < EXPERIENCE.length - 1 && (
                    <button type="button" className="btn small" onClick={() => setCareer(career + 1)}>
                      ◀ earlier stop
                    </button>
                  )}
                  {career > 0 && (
                    <button type="button" className="btn small" onClick={() => setCareer(career - 1)}>
                      next stop ▶
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </Panel>
      )}
      {secretsOpen && (
        <Panel title={`secrets · ${found.size}/${secretsHere.length}`} onClose={closeSecrets}>
          <ul className="secret-list">
            {secretsHere.map((x) => {
              const got = found.has(x.id)
              return (
                <li key={x.id} className={got ? "got" : ""}>
                  <span className="secret-star" aria-hidden="true">
                    {got ? "★" : "?"}
                  </span>
                  <span>
                    <strong>{got ? x.title : "???"}</strong>
                    <span className="muted">{got ? x.found : `Hint: ${x.hint}`}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      )}
    </div>
  )
}
