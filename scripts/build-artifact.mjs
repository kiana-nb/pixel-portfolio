// Builds the site and inlines its JS and CSS into one HTML fragment for publishing as a claude.ai artifact.
// The artifact host adds the <html>/<head>/<body> skeleton itself, so the output has none of those tags.
import { execSync } from "node:child_process"
import { readFileSync, readdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"

execSync("npx vite build --mode artifact", { stdio: "inherit" })

const assets = join("dist-artifact", "assets")
const files = readdirSync(assets)
const js = files.filter((f) => f.endsWith(".js"))
const css = files.filter((f) => f.endsWith(".css"))
if (js.length !== 1 || css.length !== 1) throw new Error(`Expected one JS and one CSS file, got ${files.join(", ")}`)

// Keep a literal "</script" or "</style" inside the code from closing the inline tag early.
const script = readFileSync(join(assets, js[0]), "utf8").replaceAll("</script", "<\/script")
const style = readFileSync(join(assets, css[0]), "utf8").replaceAll("</style", "<\/style")

const html = `<title>Kiana's Pixel Room</title>
<meta name="description" content="Pixel-art portfolio of Kiana Nabipour, frontend developer and AI product engineer.">
<style>${style}</style>
<div id="root"></div>
<script type="module">${script}</script>
`
writeFileSync(join("dist-artifact", "kiana-pixel-room.html"), html)
console.log(`kiana-pixel-room.html: ${(html.length / 1024).toFixed(0)} KB`)
