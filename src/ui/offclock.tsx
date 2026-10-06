import { useEffect, useRef, useState } from "react"
import { catFrames, drawCatExtra, kianaFramesFor } from "../game/actors"
import { sfx } from "../game/audio"
import { C, disc, rect, type Ctx } from "../game/pixel"
import { FAVORITES, PAINTINGS, PHOTOS, READING, SPORTS } from "../offclock"
import { FISH_MAX_COINS, FISH_PER_COIN, ITEMS, SECRET_REWARD, UNLOCK_PRICE, useWallet, wallet, type Item, type Slot } from "../wallet"
import { FishCatch } from "./FishCatch"

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

export function Coins({ n }: { n: number }) {
  return (
    <span className="coins">
      <span className="coin" aria-hidden="true" />
      {n}
    </span>
  )
}

export function HowToEarn() {
  return (
    <div className="earn">
      <h4 className="eyebrow">How to earn coins</h4>
      <ul>
        <li>
          Find secrets around the room and the street: <strong>+{SECRET_REWARD}</strong> each. The ★ counter has hints.
        </li>
        <li>
          Play Fish Catch at the <strong>arcade</strong> on Career Street: 1 coin for every {FISH_PER_COIN} points, paid straight away, up to {FISH_MAX_COINS} a round.
        </li>
      </ul>
    </div>
  )
}

// ---------- unlocking an area ----------

const AREAS = {
  nook: { title: "Dressing nook", text: "A cozy corner at the end of the room: a wardrobe for Kiana and a basket of things for the cat." },
  lane: { title: "Weekend Lane", text: "Where Kiana spends her time off: a cinema with her favourite shows, a gallery, the pool and a book & webtoon café." },
}

export function UnlockBody({ area, onDone }: { area: "nook" | "lane"; onDone: () => void }) {
  const w = useWallet()
  const price = UNLOCK_PRICE[area]
  const enough = w.coins >= price
  const unlock = () => {
    if (wallet.unlock(area, price)) {
      sfx.secret()
      onDone()
    }
  }
  return (
    <div className="flow">
      <span className="lock-art" aria-hidden="true" />
      <h3>{AREAS[area].title}</h3>
      <p>{AREAS[area].text}</p>
      <p className="muted">This part is just for fun, away from the work stuff.</p>
      <div className="unlock-row">
        <span>
          Price <Coins n={price} />
        </span>
        <span>
          You have <Coins n={w.coins} />
        </span>
        <button type="button" className="btn" disabled={!enough} onClick={unlock}>
          {enough ? "Unlock" : `${price - w.coins} more to go`}
        </button>
      </div>
      <HowToEarn />
    </div>
  )
}

// ---------- wardrobe ----------

function ItemPreview({ item }: { item: Item }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const look = useWallet().look
  useEffect(() => {
    const c = ref.current?.getContext("2d")
    if (!c) return
    c.clearRect(0, 0, 24, 34)
    if (item.slot === "cat") {
      c.drawImage(catFrames.awake, 4, 14)
      drawCatExtra(c, item.id, 4, 14)
      return
    }
    const f = kianaFramesFor({ ...look, [item.slot]: item.id })
    c.drawImage(f.idle, 3, 34 - f.idle.height)
  }, [item, look])
  return <canvas ref={ref} width={24} height={34} className="item-preview" aria-hidden="true" />
}

const SLOT_NAMES: Record<Slot, string> = { outfit: "Outfits", hair: "Hair", extra: "Extras", cat: "For the cat" }

export function WardrobeBody({ tab: initial }: { tab: "kiana" | "cat" }) {
  const [tab, setTab] = useState(initial)
  const w = useWallet()
  const slots: Slot[] = tab === "kiana" ? ["outfit", "hair", "extra"] : ["cat"]
  const act = (it: Item) => {
    if (!w.owned.includes(it.id)) {
      if (!wallet.buy(it.id, it.price)) return
      sfx.secret()
    } else sfx.blip(990)
    wallet.equip(it.slot, it.id)
  }
  return (
    <div className="flow">
      <div className="wardrobe-top">
        <div className="seg small" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "kiana"} aria-pressed={tab === "kiana"} onClick={() => setTab("kiana")}>
            Kiana
          </button>
          <button type="button" role="tab" aria-selected={tab === "cat"} aria-pressed={tab === "cat"} onClick={() => setTab("cat")}>
            The cat
          </button>
        </div>
        <span>
          You have <Coins n={w.coins} />
        </span>
      </div>
      {slots.map((slot) => (
        <section key={slot}>
          <h4 className="eyebrow">{SLOT_NAMES[slot]}</h4>
          <ul className="items">
            {ITEMS.filter((i) => i.slot === slot).map((it) => {
              const owned = w.owned.includes(it.id)
              const wearing = w.look[slot] === it.id
              const short = !owned && w.coins < it.price
              return (
                <li key={it.id} className={wearing ? "wearing" : ""}>
                  <ItemPreview item={it} />
                  <span className="item-name">{it.name}</span>
                  <button type="button" className="btn small" disabled={wearing || short} onClick={() => act(it)}>
                    {wearing ? "wearing" : owned ? "wear" : <>buy <Coins n={it.price} /></>}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <HowToEarn />
    </div>
  )
}

// ---------- Weekend Lane places ----------

function Poster({ title, i }: { title: string; i: number }) {
  const cols = ["#b497e8", "#6cb4e8", "#f58fa8", "#7fd1ae", "#ffa66e", "#ffd45e"]
  return (
    <li className="poster" style={{ background: cols[i % cols.length] }}>
      <span className="poster-star" aria-hidden="true">
        ★
      </span>
      <span className="poster-title">{title}</span>
    </li>
  )
}

function Cinema() {
  let i = 0
  return (
    <div className="flow">
      <p>Now showing: the series and anime I love.</p>
      {FAVORITES.map((g) => (
        <section key={g.group}>
          <h4 className="eyebrow">{g.group}</h4>
          <ul className="posters">
            {g.items.map((t) => (
              <Poster key={t} title={t} i={i++} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

function Gallery() {
  const [tab, setTab] = useState<"photos" | "paintings">("photos")
  const list = tab === "photos" ? PHOTOS : PAINTINGS
  return (
    <div className="flow">
      <p>
        I take photos and paint. {list.length ? "" : "The walls are still waiting for the first pieces."}
      </p>
      <div className="seg small" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "photos"} aria-pressed={tab === "photos"} onClick={() => setTab("photos")}>
          Photos
        </button>
        <button type="button" role="tab" aria-selected={tab === "paintings"} aria-pressed={tab === "paintings"} onClick={() => setTab("paintings")}>
          Paintings
        </button>
      </div>
      <ul className="gallery">
        {list.length
          ? list.map((a) => (
              <li key={a.src}>
                <img src={a.src} alt={a.name} loading="lazy" />
              </li>
            ))
          : Array.from({ length: 6 }, (_, k) => (
              <li key={k} className="frame-empty">
                <span>coming soon</span>
              </li>
            ))}
      </ul>
    </div>
  )
}

function Sports() {
  return (
    <ul className="sports">
      {SPORTS.map((s) => (
        <li key={s.name}>
          <h4>{s.name}</h4>
          <span className="when">{s.when}</span>
          <p>{s.note}</p>
        </li>
      ))}
    </ul>
  )
}

function Arcade() {
  return (
    <div className="flow">
      <p>Insert coin? No need. Catch fish, win coins, spend them in the dressing nook or on Weekend Lane.</p>
      <FishCatch />
    </div>
  )
}

export const PLACES = {
  arcade: { title: "arcade", body: Arcade },
  cinema: { title: "cinema · now showing", body: Cinema },
  gallery: { title: "gallery", body: Gallery },
  sports: { title: "sports center", body: Sports },
  reading: { title: "books & toons", body: () => <p>{READING}</p> },
  kindwords: { title: "kind words", body: null },
} as const

// ---------- the dream ----------

const CAPTIONS = ["zZz... drifting off", "Dreaming of swimming in big races one day.", "...and of the next product I'll ship.", "Mmm. What a nice dream."]

function drawDream(c: Ctx, w: number, h: number, t: number) {
  // a starry, pastel sea at night
  for (let y = 0; y < h; y += 4) {
    const u = y / h
    c.fillStyle = `rgb(${Math.round(40 + u * 140)},${Math.round(30 + u * 60)},${Math.round(90 + u * 80)})`
    c.fillRect(0, y, w, 4)
  }
  for (let i = 0; i < 40; i++) {
    const x = (i * 53 + t * 6) % w
    const y = (i * 29) % (h * 0.5)
    if (Math.sin(t * 3 + i) > -0.2) rect(c, x, y, 1, 1, C.cream)
  }
  disc(c, w * 0.8, h * 0.2, 10, C.cream)
  // waves
  for (let row = 0; row < 4; row++) {
    const y = h * 0.62 + row * 9
    for (let x = 0; x < w; x += 2) {
      const yy = y + Math.round(Math.sin(x * 0.08 + t * 2 + row) * 2)
      rect(c, x, yy, 2, 2, row % 2 ? "#8fd0f0" : "#b4e2f6")
    }
  }
  // Kiana swimming across, with a swim cap
  const kx = ((t * 18) % (w + 60)) - 30
  const ky = h * 0.6 + Math.round(Math.sin(t * 4) * 2)
  disc(c, kx, ky, 5, C.ol)
  disc(c, kx, ky, 4, C.skin)
  rect(c, kx - 4, ky - 5, 9, 3, C.pink)
  rect(c, kx + 1, ky - 1, 1, 2, C.ol)
  const stroke = Math.floor(t * 4) % 2
  rect(c, kx - 10 + stroke * 14, ky - 3 - stroke * 2, 5, 2, C.skin)
  for (let i = 0; i < 3; i++) rect(c, kx - 14 - i * 6, ky + 3 + (i % 2), 3, 1, C.white)
  // a fish and a floating cat for company
  const fx = (w - ((t * 26) % (w + 40))) | 0
  rect(c, fx, h * 0.8, 6, 3, C.peach)
  rect(c, fx + 6, h * 0.8 - 1, 2, 5, C.peach)
  c.drawImage(catFrames.sleepy, Math.round(w * 0.2 + Math.sin(t) * 6), Math.round(h * 0.25 + Math.sin(t * 1.3) * 4))
}

export function DreamOverlay({ onDone }: { onDone: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [line, setLine] = useState(0)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const c = cv.getContext("2d")!
    let raf = 0
    const start = performance.now()
    const frame = (now: number) => {
      drawDream(c, cv.width, cv.height, (now - start) / 1000)
      raf = requestAnimationFrame(frame)
    }
    if (reducedMotion()) drawDream(c, cv.width, cv.height, 2)
    else raf = requestAnimationFrame(frame)
    const timers = CAPTIONS.map((_, i) => window.setTimeout(() => setLine(i), i * 2800))
    const end = window.setTimeout(onDone, CAPTIONS.length * 2800 + 600)
    return () => {
      cancelAnimationFrame(raf)
      timers.forEach(window.clearTimeout)
      window.clearTimeout(end)
    }
  }, [onDone])
  return (
    <button type="button" className="dream" onClick={onDone} aria-label="Wake up">
      <canvas ref={ref} width={240} height={135} className="dream-canvas" aria-hidden="true" />
      <span className="dream-caption" key={line}>
        {CAPTIONS[line]}
      </span>
      <span className="dream-skip">tap to wake up</span>
    </button>
  )
}
