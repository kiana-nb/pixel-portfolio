import { useSyncExternalStore } from "react"

// Coins, unlocked areas, owned items and the current look. Saved in the visitor's browser.

export type Slot = "outfit" | "hair" | "extra" | "cat"
export type Look = Record<Slot, string>

export interface WalletState {
  coins: number
  // one-time rewards already paid out, so a secret never pays twice
  earned: string[]
  unlocked: string[]
  owned: string[]
  look: Look
}

export const DEFAULT_LOOK: Look = { outfit: "hoodie-blue", hair: "hair-brown", extra: "extra-none", cat: "cat-none" }

const KEY = "kiana-room-wallet"
const fresh = (): WalletState => ({ coins: 0, earned: [], unlocked: [], owned: Object.values(DEFAULT_LOOK), look: { ...DEFAULT_LOOK } })

function load(): WalletState {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "null")
    if (!raw || typeof raw !== "object") return fresh()
    const base = fresh()
    return {
      coins: Number.isFinite(raw.coins) ? Math.max(0, raw.coins) : 0,
      earned: Array.isArray(raw.earned) ? raw.earned : [],
      unlocked: Array.isArray(raw.unlocked) ? raw.unlocked : [],
      owned: Array.isArray(raw.owned) ? [...new Set([...base.owned, ...raw.owned])] : base.owned,
      look: { ...base.look, ...(raw.look ?? {}) },
    }
  } catch {
    return fresh()
  }
}

let state = load()
const subs = new Set<() => void>()

function set(next: WalletState) {
  state = next
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage can be blocked */
  }
  subs.forEach((fn) => fn())
}

export const wallet = {
  get: () => state,
  subscribe(fn: () => void) {
    subs.add(fn)
    return () => {
      subs.delete(fn)
    }
  },
  // Pays `amount` once per `reason`. Returns what was actually added.
  earnOnce(reason: string, amount: number) {
    if (state.earned.includes(reason)) return 0
    set({ ...state, coins: state.coins + amount, earned: [...state.earned, reason] })
    return amount
  },
  earn(amount: number) {
    if (amount > 0) set({ ...state, coins: state.coins + amount })
    return amount
  },
  unlock(id: string, price: number) {
    if (state.unlocked.includes(id)) return true
    if (state.coins < price) return false
    set({ ...state, coins: state.coins - price, unlocked: [...state.unlocked, id] })
    return true
  },
  buy(item: string, price: number) {
    if (state.owned.includes(item)) return true
    if (state.coins < price) return false
    set({ ...state, coins: state.coins - price, owned: [...state.owned, item] })
    return true
  },
  equip(slot: Slot, item: string) {
    if (!state.owned.includes(item)) return
    set({ ...state, look: { ...state.look, [slot]: item } })
  },
}

export function useWallet() {
  return useSyncExternalStore(wallet.subscribe, wallet.get)
}

// ---------- prices and the shop ----------

export const UNLOCK_PRICE = { nook: 20, lane: 30 }
export const SECRET_REWARD = 10
// Fish Catch pays one coin for every three fish, up to this many per round.
export const FISH_PER_COIN = 3
export const FISH_MAX_COINS = 15

export interface Item {
  id: string
  slot: Slot
  name: string
  price: number
}

export const ITEMS: Item[] = [
  { id: "hoodie-blue", slot: "outfit", name: "Blue hoodie", price: 0 },
  { id: "hoodie-pink", slot: "outfit", name: "Pink hoodie", price: 10 },
  { id: "hoodie-mint", slot: "outfit", name: "Mint hoodie", price: 10 },
  { id: "hoodie-lilac", slot: "outfit", name: "Lilac hoodie", price: 10 },
  { id: "dobok", slot: "outfit", name: "Taekwondo dobok", price: 20 },
  { id: "hair-brown", slot: "hair", name: "Brown hair", price: 0 },
  { id: "hair-black", slot: "hair", name: "Black hair", price: 8 },
  { id: "hair-ginger", slot: "hair", name: "Ginger hair", price: 8 },
  { id: "hair-pink", slot: "hair", name: "Pink hair", price: 12 },
  { id: "extra-none", slot: "extra", name: "Nothing extra", price: 0 },
  { id: "extra-glasses", slot: "extra", name: "Round glasses", price: 10 },
  { id: "extra-ears", slot: "extra", name: "Cat-ear headband", price: 12 },
  { id: "extra-flower", slot: "extra", name: "Flower clip", price: 8 },
  { id: "extra-crown", slot: "extra", name: "Tiny crown", price: 25 },
  { id: "cat-none", slot: "cat", name: "Just the cat", price: 0 },
  { id: "cat-bow", slot: "cat", name: "Red bow", price: 8 },
  { id: "cat-bell", slot: "cat", name: "Bell collar", price: 10 },
  { id: "cat-scarf", slot: "cat", name: "Cozy scarf", price: 10 },
  { id: "cat-hat", slot: "cat", name: "Wizard hat", price: 15 },
]
