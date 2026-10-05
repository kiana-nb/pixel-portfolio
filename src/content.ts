// All claims come from the git-verified bullet library in ../shared/resume-lib.mjs.
// Do not add new metrics or skills here without verifying them first.

export type SectionId = "about" | "projects" | "skills" | "certs" | "experience" | "contact"

export type Cover = "robot" | "cube" | "house" | "book" | "chart" | "globe"

export interface Project {
  name: string
  cover: Cover
  color: string
  tag: string
  year: string
  blurb: string
  stack: string[]
  links?: { label: string; href: string }[]
}

export const ME = {
  name: "Kiana Nabipour",
  role: "Frontend Developer / AI Product Engineer",
  hello: "hi, i'm kiana (ᵔ◡ᵔ)",
  tagline: "I take products from idea to production.",
  email: "kiana.nabipour07@gmail.com",
  github: "https://github.com/kiana-nb",
  linkedin: "https://www.linkedin.com/in/kiana-nb",
}

export const ABOUT = [
  "I'm a frontend developer and AI product engineer at Classeh. I like owning a product from the first sketch to the deployed release: plan, UX, UI, frontend, and the backend APIs it needs.",
  "I work in an AI-native way, with Claude Code, custom skills, subagents and MCP, but I review and test everything I ship.",
  "Into: React, Next.js, TypeScript, Three.js and anything that makes a product feel instant.",
]

export const STATS: [string, string][] = [
  ["540+", "production releases"],
  ["~117k", "lines of TypeScript"],
  ["12", "languages incl. RTL"],
  ["4,100+", "GitHub contributions / yr"],
]

export const PROJECTS: Project[] = [
  {
    name: "Uryva",
    cover: "robot",
    color: "b5",
    tag: "AI knowledge platform",
    year: "2026 – now",
    blurb:
      "Main frontend engineer: about 93% of 2,400+ commits and 540+ SemVer releases. 20+ self-contained feature modules, an AI creation wizard with streamed responses, a slide editor with undo/redo, a D3 knowledge graph and a full messaging system. Scaled from 4 to 12 languages.",
    stack: ["React 19", "TypeScript", "Vite", "TanStack Query", "Zustand", "Socket.IO", "D3", "NestJS", "Playwright"],
  },
  {
    name: "Fahmyar",
    cover: "cube",
    color: "b4",
    tag: "gamified 3D learning, K-12",
    year: "2026 – now",
    blurb:
      "A 3D city plus 11 Three.js learning games on a shared rendering library, tuned for low-end phones: 57% fewer draw calls and a steady 30 fps. Designed an AI-agent pipeline whose parallel subagents produced a 1,565-asset, curriculum-mapped 3D library.",
    stack: ["Three.js", "glTF", "TypeScript", "Vite", "AI agents"],
  },
  {
    name: "Torob Khaneh",
    cover: "house",
    color: "b2",
    tag: "Persian home search, solo",
    year: "side project",
    blurb:
      "Built for Torob's AI Product Engineer challenge. A polite crawl, union-find dedupe (739 listings became 698 homes), a Persian natural-language search that turns a query into editable intent chips, and a transparent 6-factor ranking where every card explains its position.",
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind 4", "Leaflet", "Node.js"],
    links: [
      { label: "live demo", href: "https://torob-khaneh.vercel.app" },
      { label: "source", href: "https://github.com/kiana-nb/torob-khaneh" },
    ],
  },
  {
    name: "School Management Platform",
    cover: "book",
    color: "b3",
    tag: "micro-frontend LMS",
    year: "2025 – now",
    blurb:
      "Top contributor (1,000+ commits) to the admin app of a four-app platform (admin, teacher, student, parent) in one Module-Federation shell. Finance module, report cards with batch PDF export, bulk endpoints for up to 500 students and a real-time messenger.",
    stack: ["React", "TypeScript", "Module Federation", "TanStack Query", "Zustand", "Socket.IO"],
  },
  {
    name: "Classeh Target",
    cover: "chart",
    color: "b1",
    tag: "sales CRM PWA",
    year: "2026 – now",
    blurb:
      "A mobile-first PWA sales reps use every day. Cart and invoice flows, AI call-history summaries (Claude), next-best-action chips and AI-suggested messages sent with one tap to WhatsApp, Bale or SMS. Refactored from mobile-only to a responsive RTL desktop layout.",
    stack: ["React 19", "TypeScript", "Firebase", "Sentry", "GA4", "PWA"],
  },
  {
    name: "Classeh website",
    cover: "globe",
    color: "b6",
    tag: "Next.js + CMS",
    year: "2024 – 2025",
    blurb:
      "One of two main developers (260+ commits) of the server-rendered, CMS-driven company site: blog and news with filters, galleries, per-page SEO metadata and Sentry monitoring.",
    stack: ["Next.js 15", "TypeScript", "Tailwind", "NextUI", "Sentry"],
  },
]

export const SKILLS: { group: string; items: string[] }[] = [
  { group: "Frontend", items: ["React 19", "Next.js", "TypeScript", "Vite", "Tailwind CSS", "TanStack Query", "Zustand", "Three.js", "D3"] },
  { group: "Backend", items: ["Node.js", "NestJS", "MongoDB", "Redis", "Socket.IO", "Docker"] },
  { group: "AI", items: ["Claude", "Claude Code", "LangChain", "MCP", "Subagents", "Agent Skills"] },
  { group: "Quality", items: ["Playwright", "Sentry", "i18n + RTL", "a11y", "PWA"] },
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
    note: "EdTech: learning, school management, AI and sales products. Started as an intern, promoted in Apr 2024.",
  },
  {
    where: "Mojalal Real Estate",
    what: "Frontend Developer (part-time)",
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
