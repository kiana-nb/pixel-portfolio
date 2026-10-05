// Every certificate listed on linkedin.com/in/kiana-nb (read on 2026-10-05), grouped by topic.
// "Claude Code 101" was listed twice with the same verify link, so it appears once here.
// Dates are YYYYMM. Links: LL = LinkedIn Learning certificate, SJ = Anthropic Academy (Skilljar) verify page.

export interface Cert {
  name: string
  date: number
  link?: string
}

export interface CertGroup {
  title: string
  issuer: string
  certs: Cert[]
  // Long groups start collapsed so the important ones stay on top.
  collapsed?: boolean
}

const LL = (id: string) => `https://www.linkedin.com/learning/certificates/${id}`
const SJ = (id: string) => `https://verify.skilljar.com/c/${id}`

export const CERT_GROUPS: CertGroup[] = [
  {
    title: "Claude and agents",
    issuer: "Anthropic Academy",
    certs: [
      { name: "Claude Code in Action", date: 202605, link: SJ("46n5ow3u78aj") },
      { name: "Claude Code 101", date: 202605, link: SJ("cmszt9zq3og7") },
      { name: "Introduction to Agent Skills", date: 202605, link: SJ("tkm9tqihtu6i") },
      { name: "Introduction to Subagents", date: 202605, link: SJ("nwde4gqey57r") },
      { name: "AI Fluency: Framework & Foundations", date: 202605, link: SJ("8b8d58s5ea9f") },
    ],
  },
  {
    title: "AI and engineering",
    issuer: "LinkedIn Learning",
    certs: [
      { name: "Claude Code 101: From Prompt to Product", date: 202604, link: LL("228bb6d26e120f346aa778bf9e3a9c02e3adab820e1bca5d8e395ca13c4914fd") },
      { name: "Claude with Amazon Bedrock by Anthropic", date: 202604, link: LL("628c0eff925b66fc0ea04c063af99665de043a5e49e420b1fef8611dec64a3be") },
      { name: "Model Context Protocol (MCP): Hands-On with Agentic AI", date: 202602, link: LL("6108e07aa98118a7ab11fb9f0379d97d81a1f6f449cbc0f0d8e64a67f120fb52") },
      { name: "AI-Driven Project Management", date: 202609, link: LL("9c895f7bdcdd1656748d26aacb288aac4865ea2781b1d0b3e4282cce8d6235d4") },
      { name: "React.js Essential Training", date: 202401, link: LL("2b314429c7b9d72f8cd58b7a3c7933932e0e630730c62bab626ee470b8c2a09d") },
      { name: "React.js: Building an Interface", date: 202401, link: LL("6e469e24510abebbaeb4bdb07b2b554bd8498311194d6898fcc852e858090aa5") },
      { name: "JavaScript: Service Workers", date: 202402, link: LL("4b0cd562942bcf6bd7caeeab07663570c8e4dba381032fa31a10dd0face6c3cd") },
      { name: "ChatGPT for Web Developers", date: 202401, link: LL("4c48b80df8bdeaa4677f26ece380a41331c363af9f0ace5bbad3b1f96db58c19") },
      { name: "Search Techniques for Web Developers", date: 202401, link: LL("1501ce9d1b8106657d9bb675e11e356cd1bffc0095bf2bfa0e033128f5284bf6") },
      { name: "Introduction to Web Design and Development", date: 202401, link: LL("e263a6a936f8629c291754d7bfdec7ea213a8f8ec409f8a6031c0cff70cde0b1") },
    ],
  },
  {
    title: "Product and UX",
    issuer: "LinkedIn Learning",
    certs: [
      { name: "Transitioning to Product Management", date: 202609, link: LL("f6884d7cc10e0166580de5019ea3fee499ebc44f36c18f6eba6a8d174890b88e") },
      { name: "Design Thinking: Customer Experience", date: 202609, link: LL("4a38983df694c9056b8da1ed33e253e3f354eb32664bc1c27908fd843e53473d") },
      { name: "Managing Multiple Projects", date: 202609, link: LL("f748455203327133ecee30e2f6eab1d26a32232708d9f789400ce72208ee6d6c") },
      { name: "UX Foundations: Research", date: 202401, link: LL("df0803f3d84dcfe9cd6f98537dae2207f144f7dfa82def8b545f7b6cee9307ff") },
    ],
  },
  {
    title: "Bootcamps",
    issuer: "Udemy",
    certs: [
      { name: "The Complete Machine Learning & Data Science Bootcamp 2023", date: 202307 },
      { name: "The Complete 2022 Web Development Bootcamp", date: 202207 },
    ],
  },
  {
    title: "Leadership and ways of working",
    issuer: "LinkedIn Learning",
    collapsed: true,
    certs: [
      { name: "Leading Yourself", date: 202609, link: LL("956e1fefb83b060109a4814c7dc251541f9828281bb66ee09c97890cebb0ea1b") },
      { name: "Leading Yourself (2020)", date: 202609, link: LL("152ad40566b2672caee606dbb7c38b29096158c87748030375672ecb846ad34b") },
      { name: "Tips for Leading Yourself", date: 202609, link: LL("fce8c1a418e4ade43dee4f0fdaed2a23c26e83459b25f13fb08d078fec1dd9d6") },
      { name: "Leading with a Growth Mindset", date: 202609, link: LL("88798013b76b6eedd54e776ff4e65cc96ba6565a7dbb063a5b656f825fa3c3a5") },
      { name: "Leading and Motivating People with Different Personalities", date: 202609, link: LL("a7325fb58e8bf2fafeb3d860133f6159f4b5f5fae7660d5a8f03120e3c7a19af") },
      { name: "Visualizing Your Leadership Journey", date: 202609, link: LL("8d401c0ff5ba6eaee36c1e9ebed5ee0e89f4140870063213d36951fb5bca5784") },
      { name: "Managing Your Time", date: 202609, link: LL("16cebb11519290dae37aadba721e0db06900c72b619cf6456f5a4cec4f588e0c") },
      { name: "Note-Taking for Business Professionals", date: 202609, link: LL("ea9116715f330818ccef328c3355375213bdbff783440fd2c21c39edee0d6e6e") },
      { name: "Cultivating Mental Agility", date: 202605, link: LL("c24d40d1f1610b3ef5e26e2ba55ba2284607b767649d9fb0fb69d1ca1c9c8e4f") },
      { name: "Removing Noise and Bias from Strategic Decision-Making", date: 202603, link: LL("f25c0fbfae0814dee40313233bf554948377c15370173cc6dbfec2710cc80dd7") },
      { name: "Making Quick Decisions", date: 202603, link: LL("1b42b5ef56feb96f56587489e771f3ebe77e75b8ce85a7a80ba7f2b36880b9fc") },
      { name: "Using Curiosity for Deeper Insights and Wiser Decisions", date: 202603, link: LL("4e1613c4c052e68d4eb1df52ad12da6e68b5feb0ac7a58b24bbcb98c7ab980c4") },
      { name: "Critical Thinking", date: 202602, link: LL("d17f963d6144a0c3aa5878150130f401fb396a91a3cde0dcedaf3d4e71dcd8a7") },
      { name: "Critical Thinking for Better Judgment and Decision-Making", date: 202602, link: LL("21a3a4bfac3f6711d29dc44b6a2cbb6f3d5e14f77f836280ba79b914427ca242") },
      { name: "Improving Your Judgment for Better Decision-Making", date: 202602, link: LL("50e443b95bb02dead4623c049413c1370704be6844044265e148440113c6eb6a") },
      { name: "Decision-Making Strategies", date: 202602, link: LL("07ca6cfe41695f67a0f2f870ad4ad6617fded16ef7bfa0d1525748f78f2cf0db") },
      { name: "Decision-Making in High-Stress Situations", date: 202602, link: LL("7876ea4707155782d088fe88daeebf1fc86bf2a01acbc16380a785d3867a29f0") },
      { name: "The Six Biases of Decision-Making", date: 202602, link: LL("1e0e2a1c750094fa754e221a2f5f0e3642b4071804015d32b1a0c0b014123e59") },
      { name: "Five Ways to Control Your Time", date: 202602, link: LL("7457d76c5e8d79cdfcdac05109d9fa9801dcc5b59519e1db63dffa6b842030e5") },
      { name: "Persuading Others", date: 202602, link: LL("998c8946c967860a5bd8bd4209106cfb8ef96ec472d791645c0a0dbf7afd676f") },
      { name: "Building Resilience", date: 202602, link: LL("2b3a1ef8d73412cf5ffeb89a2c76b38d1d4aab44b3269891f2843d9efdf97d29") },
      { name: "Teamwork Foundations", date: 202602, link: LL("7d79e79674ae9bcd0d281af1190163070616299ddce23c4ab102e95d573b11ea") },
      { name: "Communication Foundations (2018)", date: 202401, link: LL("d69f2f80ecca7aecb564843b787b72c9e11d20ad92033a95734c82c313c863a7") },
      { name: "Improve Communication Using Lean Thinking", date: 202401, link: LL("587a52d6094ed25ffc7e0e9a88789c9600e535244e269c25a4bb702f74bdef26") },
      { name: "Improving Your Listening Skills", date: 202401, link: LL("16fbf916e587a23f0689051e340e35151d7d819247de602980633d2377d3227e") },
      { name: "How to Have Productive One-on-One Meetings", date: 202401, link: LL("317d496ccebba3f9974331e46d03c6d3d4801c2eec073ae8d89e51ce57925e49") },
      { name: "Personal Effectiveness Tips", date: 202401, link: LL("1c26b9bf75810be5a80431eb5d5c335aed1a0ced8b7dcd78b1bf0a5b30caed86") },
      { name: "Banish Your Inner Critic to Unleash Creativity", date: 202401, link: LL("9fdcb2f49f879840bdf4a5c9f6f737783d796f89b5230f74680c87f8b9c66a2a") },
    ],
  },
]

export const CERT_COUNT = CERT_GROUPS.reduce((n, g) => n + g.certs.length, 0)

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
export const certDate = (d: number) => `${MONTHS[(d % 100) - 1]} ${Math.floor(d / 100)}`
