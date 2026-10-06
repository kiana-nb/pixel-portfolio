import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { RESUMES, RESUME_UPDATED, pdfLink } from "../resume"

const ZOOMS = [1, 1.5, 2]

// A paper card for the game's mailbox window: a page-1 thumbnail, then a preview and a download per version.
export function ResumeCard() {
  const [open, setOpen] = useState<string | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const first = RESUMES[0]
  return (
    <div className="resume-card">
      <button type="button" className="resume-thumb" onClick={() => setOpen(first.id)} aria-label={`Preview my ${first.label} resume`}>
        <img src={first.thumb} alt="" loading="lazy" decoding="async" />
        <span className="resume-peek">preview</span>
      </button>
      <div className="resume-info">
        <p className="resume-title">
          <strong>My resume</strong> <span className="muted">· updated {RESUME_UPDATED}</span>
        </p>
        {RESUMES.map((r) => (
          <div key={r.id} className="resume-row">
            <span>{r.label}</span>
            <button type="button" className="btn small" onClick={() => setOpen(r.id)} aria-label={`Preview the ${r.label} resume`}>
              preview
            </button>
            <a className="btn small" {...pdfLink(r)} aria-label={`Download the ${r.label} resume as PDF`}>
              PDF ↓
            </a>
          </div>
        ))}
      </div>
      {open && <ResumeViewer initial={open} onClose={close} />}
    </div>
  )
}

// One quiet button for the quick view, next to GitHub and LinkedIn. The preview has the version switch and the download.
export function ResumeButton() {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <button type="button" className="btn" onClick={() => setOpen(true)} aria-haspopup="dialog">
        Resume
      </button>
      {open && <ResumeViewer initial={RESUMES[0].id} onClose={close} />}
    </>
  )
}

// Full preview of every page. It is portalled so it can sit above the window that opened it,
// into the fullscreen element when the game is in real fullscreen, since nothing else is visible then.
function ResumeViewer({ initial, onClose }: { initial: string; onClose: () => void }) {
  const [id, setId] = useState(initial)
  const [zoom, setZoom] = useState(0)
  const winRef = useRef<HTMLDivElement>(null)
  const pagesRef = useRef<HTMLDivElement>(null)
  const r = RESUMES.find((x) => x.id === id) ?? RESUMES[0]

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    winRef.current?.focus()
    // Capture phase, so Escape closes only this viewer and not the window underneath.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.stopImmediatePropagation()
      onClose()
    }
    window.addEventListener("keydown", onKey, true)
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey, true)
      document.body.style.overflow = overflow
      prev?.focus?.()
    }
  }, [onClose])

  const show = (next: string) => {
    setId(next)
    pagesRef.current?.scrollTo({ top: 0 })
  }

  return createPortal(
    <div
      className="scrim resume-scrim"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
    >
      <div
        className="win resume-win"
        role="dialog"
        aria-modal="true"
        aria-label={`${r.label} resume preview`}
        tabIndex={-1}
        ref={winRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="titlebar">
          <span>{r.file}</span>
          <button type="button" onClick={onClose} aria-label="Close the preview">
            ×
          </button>
        </div>
        <div className="resume-bar">
          <div className="seg small" role="group" aria-label="Resume version">
            {RESUMES.map((x) => (
              <button key={x.id} type="button" aria-pressed={x.id === id} onClick={() => show(x.id)}>
                {x.label}
              </button>
            ))}
          </div>
          <div className="resume-actions">
            <div className="seg small" role="group" aria-label="Zoom">
              <button type="button" onClick={() => setZoom((z) => Math.max(0, z - 1))} disabled={zoom === 0} aria-label="Zoom out">
                −
              </button>
              <button type="button" onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} disabled={zoom === ZOOMS.length - 1} aria-label="Zoom in">
                +
              </button>
            </div>
            <a className="btn small" {...pdfLink(r, false)}>
              open ↗
            </a>
            <a className="btn small resume-download" {...pdfLink(r)}>
              download PDF ↓
            </a>
          </div>
        </div>
        <div className="resume-pages" ref={pagesRef} style={{ "--z": ZOOMS[zoom] } as React.CSSProperties}>
          {r.pages.map((src, i) => (
            <figure key={src} className="resume-page">
              <img src={src} alt={`${r.label} resume, page ${i + 1} of ${r.pages.length}`} loading={i ? "lazy" : "eager"} decoding="async" />
              <figcaption>
                page {i + 1} / {r.pages.length}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>,
    document.fullscreenElement ?? document.body,
  )
}
