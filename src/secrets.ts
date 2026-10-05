import type { SecretId } from "./game/engine"

export type SecretKey = SecretId | "explorer"

export interface Secret {
  id: SecretKey
  title: string
  found: string
  hint: string
  // Needs a physical keyboard, so it is left out on touch devices.
  keyboard?: boolean
}

export const SECRETS: Secret[] = [
  { id: "explorer", title: "Explorer", found: "Looked at every part of the room.", hint: "Visit everything: the journal, cartridges, bookshelf, desk, certificates and mailbox." },
  { id: "bestie", title: "Best friends", found: "Petted the cat ten times. It did a backflip!", hint: "The cat really, really likes being petted." },
  { id: "foodie", title: "Snack time", found: "Fed the cat.", hint: "Someone looks hungry. There's a bowl near the certificates." },
  { id: "fetch", title: "Fetch!", found: "The cat caught the yarn ball.", hint: "There's a yarn ball on the rug." },
  { id: "bloom", title: "Green thumb", found: "Made the flower bloom.", hint: "The little sprout at the far end needs some care." },
  { id: "party", title: "Night owl", found: "Started a dance party.", hint: "Music sounds better at night." },
  { id: "lvlup", title: "Level up", found: "Read the poster three times.", hint: "Some posters are worth reading again and again." },
  { id: "konami", title: "Retro gamer", found: "Unlocked the bonus cartridge.", hint: "A famous cheat code, or poke the GAMES sign a few times." },
  { id: "meow", title: "Cat whisperer", found: "Said the magic word.", hint: "Type a word the cat understands.", keyboard: true },
]

const KEY = "kiana-room-secrets"

export function loadFound(): Set<SecretKey> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]")
    return new Set(Array.isArray(raw) ? raw.filter((x): x is SecretKey => SECRETS.some((s) => s.id === x)) : [])
  } catch {
    return new Set()
  }
}

export function saveFound(found: Set<SecretKey>) {
  try {
    localStorage.setItem(KEY, JSON.stringify([...found]))
  } catch {
    /* storage can be blocked */
  }
}
