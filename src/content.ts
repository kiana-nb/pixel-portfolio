// All claims come from the git-verified bullet library in ../shared/resume-lib.mjs,
// or, for Hobzi, from Kiana's own commits in the my-favorite-finds repository.
// Do not add new metrics or skills here without verifying them first.

export type SectionId = "about" | "projects" | "skills" | "certs" | "experience" | "contact"
export type CoverId = "uryva" | "hobzi" | "torob" | "fahmyar" | "school" | "target" | "website"

export interface Project {
  id: CoverId
  name: string
  kind: string
  year: string
  role: string
  summary: string
  highlights: string[]
  stack: string[]
  links?: { label: string; href: string }[]
  // Cartridge colors: shell label and the darker stripe.
  label: string
  stripe: string
}

export const ME = {
  name: "Kiana Nabipour",
  role: "Frontend Developer / AI Product Engineer",
  tagline: "I take products from idea to production.",
  email: "kiana.nabipour07@gmail.com",
  github: "https://github.com/kiana-nb",
  linkedin: "https://www.linkedin.com/in/kiana-nb",
}

export const ABOUT = [
  "I'm a frontend developer and AI product engineer at Classeh. I like owning a product from the first sketch to the deployed release: plan, UX, UI, frontend, and the backend APIs it needs.",
  "I work in an AI-native way, with Claude Code, custom skills, subagents and MCP, and I review and test everything I ship.",
]

export const STATS: [string, string][] = [
  ["540+", "production releases"],
  ["117k", "lines of TypeScript"],
  ["12", "languages, incl. RTL"],
  ["4,100+", "GitHub contributions a year"],
]

export const PROJECTS: Project[] = [
  {
    id: "uryva",
    name: "Uryva",
    kind: "AI knowledge platform",
    year: "2026 – now",
    role: "Main frontend engineer, owns the product end to end",
    summary: "An international, AI-powered knowledge platform in 12 languages.",
    highlights: [
      "About 93% of 2,400+ frontend commits and 540+ SemVer releases",
      "AI creation studio with streamed generation and a slide editor with undo/redo",
      "Scaled from 4 to 12 languages, including RTL, with a locale-sync lint",
    ],
    stack: ["React 19", "TypeScript", "TanStack Query", "Zustand", "Socket.IO", "D3", "NestJS"],
    label: "#b497e8",
    stripe: "#7c5cc9",
  },
  {
    id: "hobzi",
    name: "Hobzi",
    kind: "sports class marketplace",
    year: "2026",
    role: "Built the frontend",
    summary: "Find, compare and book sports classes, with a full panel for the venues that run them. Persian and RTL.",
    highlights: [
      "The whole student loop: search, class page, checkout, schedule and favorites",
      "Smart search with transparent ranking, side-by-side comparison and price analysis",
      "Venue panel, in-app messenger and map views on search, class and venue pages",
    ],
    stack: ["TanStack Start", "React 19", "TypeScript", "Tailwind 4", "Zustand", "Leaflet"],
    links: [{ label: "hobzi.ir", href: "https://hobzi.ir" }],
    label: "#8f82f0",
    stripe: "#6554d9",
  },
  {
    id: "torob",
    name: "Torob Khaneh",
    kind: "Persian home search",
    year: "side project",
    role: "Solo: research, data pipeline, app and deploy",
    summary: "Natural-language home search over real Tehran listings, built for Torob's AI Product Engineer challenge.",
    highlights: [
      "Node.js pipeline with a polite crawl and union-find dedupe: 739 listings became 698 homes",
      "A rule-based parser turns a Persian query into editable intent chips",
      "A transparent 6-factor ranking where every card explains its position",
    ],
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind 4", "Leaflet", "Node.js"],
    links: [
      { label: "live demo", href: "https://torob-khaneh.vercel.app" },
      { label: "source", href: "https://github.com/kiana-nb/torob-khaneh" },
    ],
    label: "#6cb4e8",
    stripe: "#3f88c5",
  },
  {
    id: "fahmyar",
    name: "Fahmyar",
    kind: "gamified 3D learning, K-12",
    year: "2026 – now",
    role: "3D games and the asset pipeline",
    summary: "A 3D open world with Three.js learning games, built to run on low-end phones.",
    highlights: [
      "A 3D city and 11 Three.js game stages on a shared rendering library",
      "57% fewer draw calls and lights cut from 27 to 11 for a steady 30 fps",
      "Parallel AI subagents produced a library of 1,565 curriculum-mapped 3D assets",
    ],
    stack: ["Three.js", "glTF", "React 19", "TypeScript", "Vite"],
    label: "#7fd1ae",
    stripe: "#3fa47f",
  },
  {
    id: "school",
    name: "School Platform",
    kind: "micro-frontend school management",
    year: "2025 – now",
    role: "Top contributor to the admin app, 1,000+ commits",
    summary: "Four apps (admin, teacher, student and parent) loaded into one Module-Federation shell.",
    highlights: [
      "Finance module: journals, tuition, discounts, payslips and Excel export",
      "Bulk endpoints for up to 500 students and batched score submission",
      "Report cards with batch PDF export and a real-time messenger",
    ],
    stack: ["React", "TypeScript", "Module Federation", "TanStack Query", "Zustand", "Socket.IO"],
    label: "#ffd45e",
    stripe: "#d9a628",
  },
  {
    id: "target",
    name: "Classeh Target",
    kind: "sales CRM PWA",
    year: "2026 – now",
    role: "Top contributor",
    summary: "A mobile-first PWA that sales reps use every day, in the browser and inside an Android WebView.",
    highlights: [
      "Live cart, product picker and a 3-step invoice wizard with VAT-aware discounts",
      "AI call summaries (Claude) and AI-suggested messages sent with one tap",
      "Refactored from a 440px mobile-only app into a responsive RTL desktop layout",
    ],
    stack: ["React 19", "TypeScript", "React Hook Form", "Firebase", "GA4", "PWA"],
    label: "#f58fa8",
    stripe: "#e0587a",
  },
  {
    id: "website",
    name: "Classeh Website",
    kind: "server-rendered company site",
    year: "2024 – 2025",
    role: "One of two main developers, 260+ commits",
    summary: "A CMS-driven Next.js site with a blog, news, galleries and download pages.",
    highlights: [
      "Per-page metadata with title, description and Open Graph for CMS pages",
      "Blog and news with pagination and category filters",
      "Sentry monitoring and the Enamad e-commerce trust seal",
    ],
    stack: ["Next.js 15", "TypeScript", "Tailwind", "NextUI", "Sentry"],
    label: "#ffa66e",
    stripe: "#e07a3c",
  },
]

export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React 19", "Next.js", "TypeScript", "Vite", "Tailwind CSS", "TanStack Query", "Zustand", "Three.js", "D3"] },
  { group: "Backend", items: ["Node.js", "NestJS", "MongoDB", "Redis", "Socket.IO", "Docker"] },
  { group: "AI", items: ["Claude", "Claude Code", "LangChain", "MCP", "Subagents", "Agent Skills"] },
  { group: "Quality", items: ["Playwright", "Sentry", "i18n + RTL", "Accessibility", "PWA"] },
]

export const CERTS: { org: string; items: string[] }[] = [
  { org: "Anthropic", items: ["Claude Code in Action", "Agent Skills", "Subagents", "AI Fluency"] },
  { org: "LinkedIn Learning", items: ["MCP: Hands-On with Agentic AI", "UX Foundations: Research"] },
]

export const EXPERIENCE = [
  {
    where: "Classeh",
    what: "Frontend Developer / AI Product Engineer",
    when: "Dec 2023 – now",
    note: "EdTech: learning, school management, AI and sales products. Joined as an intern and was promoted in Apr 2024.",
  },
  {
    where: "Mojalal Real Estate",
    what: "Frontend Developer, part-time",
    when: "Jun 2023 – Dec 2023",
    note: "Property platform with role-based access, Google Maps insights, Firebase alerts and an OpenAI writing assistant.",
  },
  {
    where: "University of Zanjan",
    what: "B.Sc. Computer Science",
    when: "2019 – 2023",
    note: "",
  },
]
