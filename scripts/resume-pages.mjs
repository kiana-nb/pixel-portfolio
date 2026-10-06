// Renders every page of the resume PDFs in public/resume into WebP images for the in-site preview.
// PDFs don't render inline on most phones, so the preview shows these images and the PDF stays the download.
// Run after replacing a PDF: node scripts/resume-pages.mjs  (needs Playwright, installed locally or globally, and network for pdf.js)
import { execSync } from "node:child_process"
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { basename, join } from "node:path"

const require = createRequire(import.meta.url)
const loadPlaywright = () => {
  try {
    return require("playwright")
  } catch {
    return require(join(execSync("npm root -g").toString().trim(), "playwright"))
  }
}
const { chromium } = loadPlaywright()

const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38"
const SRC = join("public", "resume")
const OUT = join("src", "assets", "resume")
// A4 is 595 pt wide: 2.67 renders it at 1588 px, twice its CSS size, so text stays sharp on retina screens.
const SCALE = 2.67
const THUMB_W = 360

rmSync(OUT, { recursive: true, force: true })
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage()
await page.goto("about:blank")

for (const file of readdirSync(SRC).filter((f) => f.endsWith(".pdf"))) {
  const name = basename(file, ".pdf")
  const pdf = readFileSync(join(SRC, file)).toString("base64")
  const images = await page.evaluate(
    async ({ pdf, PDFJS, SCALE, THUMB_W }) => {
      const pdfjs = await import(`${PDFJS}/pdf.min.mjs`)
      pdfjs.GlobalWorkerOptions.workerSrc = `${PDFJS}/pdf.worker.min.mjs`
      const data = Uint8Array.from(atob(pdf), (c) => c.charCodeAt(0))
      const doc = await pdfjs.getDocument({ data }).promise
      const out = []
      for (let n = 1; n <= doc.numPages; n++) {
        const p = await doc.getPage(n)
        const viewport = p.getViewport({ scale: SCALE })
        const canvas = document.createElement("canvas")
        canvas.width = Math.round(viewport.width)
        canvas.height = Math.round(viewport.height)
        const ctx = canvas.getContext("2d")
        ctx.fillStyle = "#fff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        await p.render({ canvasContext: ctx, viewport }).promise
        const thumb = document.createElement("canvas")
        thumb.width = THUMB_W
        thumb.height = Math.round((canvas.height / canvas.width) * THUMB_W)
        const tctx = thumb.getContext("2d")
        tctx.imageSmoothingQuality = "high"
        tctx.drawImage(canvas, 0, 0, thumb.width, thumb.height)
        out.push({ full: canvas.toDataURL("image/webp", 0.75), thumb: n === 1 ? thumb.toDataURL("image/webp", 0.8) : null })
      }
      return out
    },
    { pdf, PDFJS, SCALE, THUMB_W },
  )
  images.forEach((img, i) => {
    const save = (dataUrl, path) => writeFileSync(path, Buffer.from(dataUrl.split(",")[1], "base64"))
    save(img.full, join(OUT, `${name}-${i + 1}.webp`))
    if (img.thumb) save(img.thumb, join(OUT, `${name}-thumb.webp`))
  })
  console.log(`${file}: ${images.length} pages`)
}

await browser.close()
