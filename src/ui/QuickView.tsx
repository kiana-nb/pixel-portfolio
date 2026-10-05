import { ME, PROJECTS } from "../content"
import { Cover, Portrait } from "./pixels"
import { Certs, EmailRow, Experience, ProjectDetails, Skills, Stats } from "./sections"

export function QuickView() {
  return (
    <div className="quick">
      <section className="q-hero" aria-labelledby="q-name">
        <Portrait who="kiana" className="q-face" />
        <div className="q-intro">
          <h1 id="q-name">{ME.name}</h1>
          <p className="q-role">{ME.role}</p>
          <p className="q-tagline">{ME.tagline}</p>
          <div className="q-contact">
            <EmailRow />
            <a className="btn" href={ME.github} target="_blank" rel="noreferrer">
              GitHub ↗
            </a>
            <a className="btn" href={ME.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          </div>
        </div>
      </section>

      <Stats />

      <section aria-labelledby="q-projects">
        <h2 id="q-projects" className="q-h2">
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
        <section aria-labelledby="q-exp" className="q-panel">
          <h2 id="q-exp" className="q-h2">
            Experience
          </h2>
          <Experience />
        </section>
        <div className="q-side">
          <section aria-labelledby="q-skills" className="q-panel">
            <h2 id="q-skills" className="q-h2">
              Skills
            </h2>
            <Skills />
          </section>
          <section aria-labelledby="q-certs" className="q-panel">
            <h2 id="q-certs" className="q-h2">
              Certificates
            </h2>
            <Certs />
          </section>
        </div>
      </div>
    </div>
  )
}
