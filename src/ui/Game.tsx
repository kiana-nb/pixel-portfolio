import { useCallback, useEffect, useRef, useState } from "react"
import { PROJECTS, type SectionId } from "../content"
import { sfx } from "../game/audio"
import { Engine } from "../game/engine"
import type { Thing } from "../game/world"
import { Portrait } from "./pixels"
import { ProjectsConsole } from "./ProjectsConsole"
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
  { id: "door", label: "say hi" },
]

const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)]
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
const touch = () => window.matchMedia("(pointer: coarse)").matches

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
  const gameRef = useRef<HTMLDivElement>(null)
  const fullRef = useRef(false)
  const realFullscreen = useRef(false)
  const fitRef = useRef<() => void>(() => {})

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
          break
        case "projects":
          sfx.open()
          setDialog(null)
          setConsoleOpen(true)
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
          say([pick(["mrrp! (=^･ω･^=)", "purrrr ♥", "mew? (=ↀωↀ=)"]), "The cat decides to follow you around."], "cat")
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
    [say],
  )

  // engine lifecycle
  useEffect(() => {
    const canvas = canvasRef.current!
    const engine = new Engine(canvas, promptRef.current!, { onInteract: (t) => onInteract(t), onAdvance: () => advance() }, PROJECTS.map((p) => ({ label: p.label, stripe: p.stripe })))
    engineRef.current = engine
    if (import.meta.env.DEV) Object.assign(window, { __engine: engine })
    engine.setNight(live.current.night, true)
    const fit = () => {
      const w = stageRef.current?.clientWidth ?? 800
      // In full screen the room takes all the height except the row of buttons under it.
      const h = fullRef.current ? window.innerHeight - (window.innerWidth < 760 ? 150 : 100) : Math.min(window.innerHeight * 0.72, 720)
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
          ? ["hi, i'm Kiana! ✿ welcome to my room.", "Tap anywhere to walk. Tap things to look at them.", "My projects are the cartridges by the TV."]
          : ["hi, i'm Kiana! ✿ welcome to my room.", "Walk with ← → or A D, or click anywhere.", "Press E near things. My projects are the cartridges by the TV."],
      )
    }, reducedMotion() ? 0 : 1000)
    return () => {
      window.clearTimeout(hello)
      window.removeEventListener("resize", fit)
      ro.disconnect()
      engine.destroy()
      engineRef.current = null
    }
  }, [onInteract, advance, say])

  // Full screen: the real Fullscreen API when the browser allows it, otherwise the room just covers the page.
  const toggleFull = useCallback(async () => {
    if (fullRef.current) {
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
    setFull(true)
  }, [])

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
    if (engineRef.current) engineRef.current.paused = !!panel || consoleOpen
  }, [panel, consoleOpen])
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
  const insert = useCallback((i: number | null) => {
    if (engineRef.current) engineRef.current.inserted = i
  }, [])

  const line = dialog ? dialog.lines[dialog.i] : ""
  const done = dialog ? dialog.shown >= line.length : false

  return (
    <div className={`game${full ? " is-full" : ""}`} ref={gameRef}>
      <div className="stage" ref={stageRef}>
        <button type="button" className="fs-btn" onClick={() => void toggleFull()} aria-label={full ? "Exit full screen" : "Full screen"} title={full ? "Exit full screen (F)" : "Full screen (F)"}>
          {full ? "⤡" : "⤢"}
        </button>
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

      <nav className="jumps" aria-label="Visit a part of the room">
        <span className="jumps-label">go to</span>
        {JUMPS.map((j) => (
          <button key={j.id} type="button" className="btn small" onClick={() => engineRef.current?.walkTo(j.id)}>
            {j.label}
          </button>
        ))}
      </nav>

      {panel && (
        <Panel title={TITLES[panel]} onClose={closePanel}>
          {(() => {
            const Body = BODIES[panel]
            return <Body />
          })()}
        </Panel>
      )}
      {consoleOpen && <ProjectsConsole onClose={closeConsole} onInsert={insert} />}
    </div>
  )
}
