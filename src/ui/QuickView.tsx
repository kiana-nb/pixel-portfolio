import { useEffect, useRef, useState } from "react"
import { ME, PROJECTS } from "../content"
import { CRAFTS, FAVORITES, READING, SPORTS } from "../offclock"
import { Cover, Portrait } from "./pixels"
import { ResumeCard } from "./Resume"
import { Certs, ContactRows, Education, Experience, KindWords, Languages, ProjectDetails, Skills, Stats } from "./sections"

// Sections the nav can jump to. The URL hash already switches play / quick view,
// so the nav scrolls with buttons instead of #links.
const NAV: [string, string][] = [
  ["q-top", "Contact"],
  ["q-projects", "Projects"],
  ["q-exp", "Experience"],
  ["q-edu", "Education"],
  ["q-skills", "Skills"],
  ["q-langs", "Languages"],
  ["q-certs", "Certificates"],
  ["q-kind", "Kind words"],
]

function SectionNav() {
  const [active, setActive] = useState("q-top")
  const [top, setTop] = useState(60)
  const navRef = useRef<HTMLElement>(null)

  // sit right under the sticky header, whatever height it wraps to
  useEffect(() => {
    const header = document.querySelector<HTMLElement>(".top")
    if (!header) return
    const ro = new ResizeObserver(() => setTop(header.offsetHeight))
    ro.observe(header)
    return () => ro.disconnect()
  }, [])

  // highlight the section being read
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (seen) setActive(seen.target.id)
      },
      { rootMargin: "-30% 0px -60% 0px" },
    )
    NAV.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  // keep the active chip in view on narrow screens
  useEffect(() => {
    navRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`)?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [active])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const navH = navRef.current?.offsetHeight ?? 52
    const y = el.getBoundingClientRect().top + window.scrollY - top - navH - 12
    window.scrollTo({ top: Math.max(0, y), behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })
  }

  return (
    <nav className="q-nav" style={{ top }} aria-label="Jump to a section" ref={navRef}>
      {NAV.map(([id, label]) => (
        <button key={id} type="button" data-id={id} aria-current={active === id ? "true" : undefined} onClick={() => go(id)}>
          {label}
        </button>
      ))}
    </nav>
  )
}

function OffTheClock() {
  return (
    <details className="q-panel offclock">
      <summary>
        <span className="q-h2-small">Off the clock</span>
        <span className="muted">sports, art and the stories I love</span>
      </summary>
      <div className="offclock-grid">
        <section>
          <h4 className="eyebrow">Sports</h4>
          <ul className="plain">
            {SPORTS.map((s) => (
              <li key={s.name}>
                <strong>{s.name}</strong> <span className="muted">· {s.when}</span>
                <br />
                {s.note}
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h4 className="eyebrow">Making things</h4>
          <p>{CRAFTS.join(" and ")}.</p>
          <h4 className="eyebrow">Reading</h4>
          <p>{READING}</p>
        </section>
        {FAVORITES.map((g) => (
          <section key={g.group}>
            <h4 className="eyebrow">Favourite {g.group.toLowerCase()}</h4>
            <ul className="chips">
              {g.items.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <p className="muted">In play mode, all of this lives on Weekend Lane, at the far end of Career Street.</p>
    </details>
  )
}

export function QuickView() {
  return (
    <div className="quick">
      <section className="q-hero" id="q-top" aria-labelledby="q-name">
        <Portrait who="kiana" className="q-face" />
        <div className="q-intro">
          <h1 id="q-name">{ME.name}</h1>
          <p className="q-role">{ME.role}</p>
          <p className="q-tagline">{ME.tagline}</p>
          <div className="q-contact">
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
        </div>
        <ResumeCard showcase />
      </section>

      <SectionNav />

      <Stats />

      <section id="q-projects" aria-labelledby="q-projects-h">
        <h2 id="q-projects-h" className="q-h2">
          Projects
        </h2>
        <div className="q-grid">
          {PROJECTS.map((p) => (
            <article key={p.id} className="q-card">
              <Cover id={p.id} label={`Pixel illustration for ${p.name}`} />
              <ProjectDetails p={p} />
            </article>
          ))}
        </div>
      </section>

      <div className="q-columns">
        <div className="q-side">
          <section id="q-exp" aria-labelledby="q-exp-h" className="q-panel">
            <h2 id="q-exp-h" className="q-h2">
              Experience
            </h2>
            <Experience />
          </section>
          <section id="q-edu" aria-labelledby="q-edu-h" className="q-panel">
            <h2 id="q-edu-h" className="q-h2">
              Education
            </h2>
            <Education />
          </section>
        </div>
        <div className="q-side">
          <section id="q-skills" aria-labelledby="q-skills-h" className="q-panel">
            <h2 id="q-skills-h" className="q-h2">
              Skills
            </h2>
            <Skills />
          </section>
          <section id="q-langs" aria-labelledby="q-langs-h" className="q-panel">
            <h2 id="q-langs-h" className="q-h2">
              Languages
            </h2>
            <Languages />
          </section>
        </div>
      </div>

      <section id="q-certs" aria-labelledby="q-certs-h" className="q-panel">
        <h2 id="q-certs-h" className="q-h2">
          Certificates
        </h2>
        <Certs />
      </section>

      <section id="q-kind" aria-labelledby="q-kind-h" className="q-panel">
        <h2 id="q-kind-h" className="q-h2">
          Kind words
        </h2>
        <p className="muted">Recommendations from people I've worked and studied with, from LinkedIn.</p>
        <KindWords />
      </section>

      <OffTheClock />
    </div>
  )
}
