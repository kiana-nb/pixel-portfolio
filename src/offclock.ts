// Kiana's life off the clock. None of this is part of the professional flow: it lives in the
// locked Weekend Lane on the street and in a collapsed section at the end of the quick view.

export const SPORTS: { name: string; when: string; note: string }[] = [
  { name: "Swimming", when: "now", note: "What I train in now. I want to keep going and swim professionally." },
  { name: "Gymnastics", when: "1 year", note: "One year of gymnastics when I was 22." },
  { name: "Taekwondo", when: "6 years", note: "Six years in primary school, then I stopped." },
]

export const CRAFTS = ["Photography", "Painting"]

export const FAVORITES: { group: string; items: string[] }[] = [
  { group: "Series", items: ["The Last Kingdom", "Game of Thrones", "Medici"] },
  {
    group: "Anime",
    items: ["Haikyuu!!", "Psycho-Pass", "Heaven Official's Blessing", "Steins;Gate", "Erased", "Vinland Saga", "Monster", "Fruits Basket"],
  },
]

export const READING = "I love reading books and webtoons."

// Drop images into src/artworks/photos and src/artworks/paintings; they show up in the gallery
// in file-name order. Keep each image small (about 1200px wide, under 300 KB) so the page stays light.
const pick = (files: Record<string, string>) =>
  Object.entries(files)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([path, src]) => ({ src, name: path.split("/").pop()!.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() }))

export const PHOTOS = pick(
  import.meta.glob<string>("./artworks/photos/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" }),
)
export const PAINTINGS = pick(
  import.meta.glob<string>("./artworks/paintings/*.{jpg,jpeg,png,webp}", { eager: true, query: "?url", import: "default" }),
)
