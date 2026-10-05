import { useEffect, useRef, useState, type ReactNode } from "react"
import { CERT_COUNT, CERT_GROUPS, certDate, type CertGroup } from "../certs"
import { ABOUT, EXPERIENCE, ME, SKILLS, STATS, type Project, type SectionId } from "../content"
import { Portrait } from "./pixels"

export const TITLES: Record<SectionId, string> = {
  about: "about_me.txt",
  projects: "cartridges",
  skills: "bookshelf",
  certs: "certificates",
  experience: "timeline.log",
  contact: "say hi",
}

export const Chips = ({ items }: { items: string[] }) => (
  <ul className="chips">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
)

export function Stats() {
  return (
    <dl className="stats">
      {STATS.map(([n, l]) => (
        <div key={l}>
          <dt>{n}</dt>
          <dd>{l}</dd>
        </div>
      ))}
    </dl>
  )
}

export function About() {
  return (
    <div className="flow">
      <div className="about-head">
        <Portrait who="kiana" className="about-face" />
        <div>
          <p className="eyebrow">hi, i'm</p>
          <h3 className="about-name">{ME.name}</h3>
          <p className="muted">{ME.role}</p>
        </div>
      </div>
      {ABOUT.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <Stats />
    </div>
  )
}

export function Skills() {
  return (
    <div className="skill-groups">
      {SKILLS.map((g) => (
        <section key={g.group}>
          <h4 className="eyebrow">{g.group}</h4>
          <Chips items={g.items} />
        </section>
      ))}
    </div>
  )
}

function CertItems({ certs }: { certs: CertGroup["certs"] }) {
  return (
    <ul className="cert-list">
      {certs.map((c) => (
        <li key={c.name}>
          <span className="cert-name">{c.name}</span>
          <span className="cert-meta">
            {certDate(c.date)}
            {c.link && (
              <a href={c.link} target="_blank" rel="noreferrer" aria-label={`Verify ${c.name}`}>
                verify ↗
              </a>
            )}
          </span>
        </li>
      ))}
    </ul>
  )
}

export function Certs() {
  return (
    <div className="certs">
      <p className="certs-summary">
        <strong>{CERT_COUNT} certificates</strong> from Anthropic Academy, LinkedIn Learning and Udemy, as listed on{" "}
        <a href={`${ME.linkedin}/details/certifications/`} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
      </p>
      {CERT_GROUPS.map((g) => (
        <section key={g.title} className="cert-group">
          <h4>
            {g.title} <span className="cert-issuer">{g.issuer}</span>
            <span className="cert-count">{g.certs.length}</span>
          </h4>
          {g.collapsed ? (
            <details>
              <summary>Show all {g.certs.length}</summary>
              <CertItems certs={g.certs} />
            </details>
          ) : (
            <CertItems certs={g.certs} />
          )}
        </section>
      ))}
    </div>
  )
}

export function Experience() {
  return (
    <ol className="timeline">
      {EXPERIENCE.map((e) => (
        <li key={e.where}>
          <span className="when">{e.when}</span>
          <h4>{e.where}</h4>
          <p className="role-line">{e.what}</p>
          {e.note && <p className="muted">{e.note}</p>}
        </li>
      ))}
    </ol>
  )
}

// mailto: and tel: links do not open everywhere, so values are shown as selectable text with a copy button.
function CopyRow({ value, icon, href }: { value: string; icon: string; href?: string }) {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const copy = () => {
    const selectText = () => {
      const sel = window.getSelection()
      if (!ref.current || !sel) return
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    try {
      navigator.clipboard.writeText(value).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }, selectText)
    } catch {
      selectText()
    }
  }
  return (
    <div className="email">
      <span className="copy-icon" aria-hidden="true">
        {icon}
      </span>
      {href ? (
        <a ref={ref as React.RefObject<HTMLAnchorElement>} href={href} className="copy-value" dir="ltr">
          {value}
        </a>
      ) : (
        <span ref={ref as React.RefObject<HTMLSpanElement>} className="copy-value" dir="ltr">
          {value}
        </span>
      )}
      <button type="button" className="btn small" onClick={copy}>
        {copied ? "copied!" : "copy"}
      </button>
    </div>
  )
}

export function ContactRows() {
  return (
    <div className="contact-rows">
      <CopyRow value={ME.email} icon="✉" />
      <CopyRow value={ME.phone} icon="☎" href={`tel:${ME.phone.replace(/\s/g, "")}`} />
    </div>
  )
}

export function Contact() {
  return (
    <div className="flow">
      <p>Got a product that needs an owner, or want to talk frontend, 3D or AI workflows? Say hi!</p>
      <ContactRows />
      <div className="link-row">
        <a className="btn" href={ME.github} target="_blank" rel="noreferrer">
          GitHub ↗
        </a>
        <a className="btn" href={ME.linkedin} target="_blank" rel="noreferrer">
          LinkedIn ↗
        </a>
      </div>
    </div>
  )
}

export const BODIES: Record<Exclude<SectionId, "projects">, () => React.JSX.Element> = {
  about: About,
  skills: Skills,
  certs: Certs,
  experience: Experience,
  contact: Contact,
}

export function ProjectDetails({ p }: { p: Project }) {
  return (
    <div className="project">
      <header className="project-head">
        <h3>{p.name}</h3>
        <span className="year">{p.year}</span>
      </header>
      <p className="kind">{p.kind}</p>
      <p className="summary">{p.summary}</p>
      <p className="my-role">
        <span className="eyebrow">my role</span> {p.role}
      </p>
      <ul className="highlights">
        {p.highlights.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
      <Chips items={p.stack} />
      {p.links && (
        <div className="link-row">
          {p.links.map((l) => (
            <a key={l.href} className="btn small" href={l.href} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

// A pixel window used for every popup. Focus moves into it and returns on close.
export function Panel({ title, onClose, children, className }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      prev?.focus?.()
    }
  }, [onClose])
  return (
    <div className="scrim" onClick={onClose}>
      <div
        className={`win ${className ?? ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="titlebar">
          <span>{title}</span>
          <button type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="win-body">{children}</div>
      </div>
    </div>
  )
}
