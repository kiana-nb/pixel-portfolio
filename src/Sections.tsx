import { useRef, useState } from "react"
import { ABOUT, CERTS, EXPERIENCE, ME, PROJECTS, SKILLS, STATS, type Cover, type Project, type SectionId } from "./content"
import { Sprite, type Palette } from "./Sprite"
import { BOOK, BOOK_PAL, CHART, CHART_PAL, CUBE, CUBE_PAL, GLOBE, GLOBE_PAL, HOUSE, HOUSE_PAL, ROBOT, ROBOT_PAL } from "./sprites"

const COVERS: Record<Cover, [string[], Palette, number]> = {
  robot: [ROBOT, ROBOT_PAL, 2],
  cube: [CUBE, CUBE_PAL, 2],
  house: [HOUSE, HOUSE_PAL, 1],
  book: [BOOK, BOOK_PAL, 1],
  chart: [CHART, CHART_PAL, 1],
  globe: [GLOBE, GLOBE_PAL, 1],
}

// Pixel "cover image" for a project pin: a dotted color field with the project icon in the middle.
function CoverArt({ cover, color }: { cover: Cover; color: string }) {
  const [rows, pal, scale] = COVERS[cover]
  const w = rows[0].length * scale
  const h = rows.length * scale
  return (
    <svg className="cover" viewBox="0 0 48 20" shapeRendering="crispEdges" aria-hidden="true" style={{ background: `var(--${color})` }}>
      {Array.from({ length: 40 }, (_, i) => (
        <rect key={i} x={(i % 10) * 5 + 1 + (Math.floor(i / 10) % 2) * 2} y={Math.floor(i / 10) * 5 + 1} width={1} height={1} fill="rgba(255,255,255,.45)" />
      ))}
      <rect x={24 - w / 2 - 2} y={10 - h / 2 - 2} width={w + 4} height={h + 4} style={{ fill: "var(--card)" }} />
      <Sprite rows={rows} palette={pal} x={24 - w / 2} y={10 - h / 2} scale={scale} />
    </svg>
  )
}

export function ProjectPin({ p }: { p: Project }) {
  return (
    <>
      <CoverArt cover={p.cover} color={p.color} />
      <ProjectBody p={p} />
    </>
  )
}

function ProjectBody({ p }: { p: Project }) {
  return (
    <article className="project">
      <header>
        <h3>{p.name}</h3>
        <span className="year">{p.year}</span>
      </header>
      <p className="tag">{p.tag}</p>
      <p>{p.blurb}</p>
      <Chips items={p.stack} />
      {p.links && (
        <p className="links">
          {p.links.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
              {l.label} ↗
            </a>
          ))}
        </p>
      )}
    </article>
  )
}

export const TITLES: Record<SectionId, string> = {
  about: "about_me.txt",
  projects: "projects.exe",
  skills: "my_shelf.dir",
  certs: "certificates.png",
  experience: "timeline.log",
  contact: "say_hi.mail",
}

export const ICONS: Record<SectionId, string> = {
  about: "(ᵔ◡ᵔ)",
  projects: "</>",
  skills: "[#]",
  certs: "★",
  experience: "◷",
  contact: "✉",
}

const Chips = ({ items }: { items: string[] }) => (
  <ul className="chips">
    {items.map((i) => (
      <li key={i}>{i}</li>
    ))}
  </ul>
)

export function About() {
  return (
    <div className="stack">
      <p className="hello">{ME.hello}</p>
      {ABOUT.map((p) => (
        <p key={p}>{p}</p>
      ))}
      <dl className="stats">
        {STATS.map(([n, l]) => (
          <div key={l}>
            <dt>{n}</dt>
            <dd>{l}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function Projects() {
  return (
    <div className="stack">
      {PROJECTS.map((p) => (
        <ProjectBody key={p.name} p={p} />
      ))}
    </div>
  )
}

export function Skills() {
  return (
    <div className="stack">
      {SKILLS.map((g) => (
        <div key={g.group}>
          <h3>{g.group}</h3>
          <Chips items={g.items} />
        </div>
      ))}
    </div>
  )
}

export function Certs() {
  return (
    <div className="stack">
      {CERTS.map((c) => (
        <div key={c.org}>
          <h3>{c.org}</h3>
          <Chips items={c.items} />
        </div>
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
          <h3>{e.where}</h3>
          <p className="tag">{e.what}</p>
          {e.note && <p>{e.note}</p>}
        </li>
      ))}
    </ol>
  )
}

// mailto links do not open everywhere, so the address is shown as selectable text with a copy button.
function EmailRow() {
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)
  const copy = () => {
    const done = () => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
    const selectText = () => {
      const sel = window.getSelection()
      if (!ref.current || !sel) return
      const range = document.createRange()
      range.selectNodeContents(ref.current)
      sel.removeAllRanges()
      sel.addRange(range)
    }
    try {
      navigator.clipboard.writeText(ME.email).then(done, selectText)
    } catch {
      selectText()
    }
  }
  return (
    <div className="email">
      ✉ <span ref={ref}>{ME.email}</span>
      <button type="button" className="copy" onClick={copy}>
        {copied ? "copied!" : "copy"}
      </button>
    </div>
  )
}

export function Contact() {
  return (
    <div className="stack">
      <p>Got a product that needs an owner, or just want to talk frontend, 3D or AI workflows? Say hi!</p>
      <ul className="contact-list">
        <li>
          <EmailRow />
        </li>
        <li>
          <a href={ME.github} target="_blank" rel="noreferrer">
            ⌥ github.com/kiana-nb ↗
          </a>
        </li>
        <li>
          <a href={ME.linkedin} target="_blank" rel="noreferrer">
            in linkedin.com/in/kiana-nb ↗
          </a>
        </li>
      </ul>
    </div>
  )
}

export const BODIES: Record<SectionId, () => React.JSX.Element> = {
  about: About,
  projects: Projects,
  skills: Skills,
  certs: Certs,
  experience: Experience,
  contact: Contact,
}
