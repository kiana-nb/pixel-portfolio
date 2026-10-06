// The two general resumes. PDFs live in public/resume (stable URLs to share); the page images in
// src/assets/resume are rendered from them by scripts/resume-pages.mjs, so re-run it after replacing a PDF.

const pages = import.meta.glob<string>("./assets/resume/*.webp", { eager: true, query: "?url", import: "default" })

// The single-file artifact build can't carry public/ files, so it links the PDFs on the live site.
const EXTERNAL = import.meta.env.MODE === "artifact"
const PDF_BASE = EXTERNAL ? "https://kiana-nabipour.vercel.app/resume/" : "/resume/"

export interface Resume {
  id: string
  label: string
  file: string
  pdf: string
  pages: string[]
  thumb: string
}

const make = (id: string, label: string, name: string): Resume => {
  const own = Object.keys(pages)
    .filter((k) => k.includes(`/${name}-`))
    .sort()
  return {
    id,
    label,
    file: `${name}.pdf`,
    pdf: `${PDF_BASE}${name}.pdf`,
    pages: own.filter((k) => /-\d+\.webp$/.test(k)).map((k) => pages[k]),
    thumb: pages[own.find((k) => k.endsWith("-thumb.webp")) ?? own[0]],
  }
}

export const RESUMES: Resume[] = [
  make("frontend", "Frontend Engineer", "Kiana-Nabipour_Frontend-Engineer"),
  make("product", "Product Engineer", "Kiana-Nabipour_Product-Engineer"),
]

export const RESUME_UPDATED = "Oct 2026"

// Link props for a PDF download. A cross-origin link ignores `download`, so it opens in a new tab instead.
export const pdfLink = (r: Resume, download = true) => ({
  href: r.pdf,
  ...(download && !EXTERNAL ? { download: r.file } : { target: "_blank", rel: "noreferrer" }),
})
