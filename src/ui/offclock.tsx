import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { catFrames, drawCatExtra, kianaFramesFor } from "../game/actors"
import { sfx } from "../game/audio"
import { POSTER_H, POSTER_W, SCENE_H, SCENE_W, SPORT_SCENES, drawPoster } from "../game/hobbyart"
import { C, disc, rect, type Ctx } from "../game/pixel"
import { FAVORITES, PAINTINGS, PHOTOS, READING, SPORTS } from "../offclock"
import { FISH_MAX_COINS, FISH_PER_COIN, ITEMS, SECRET_REWARD, UNLOCK_PRICE, useWallet, wallet, type Item, type Slot } from "../wallet"
import { FishCatch } from "./FishCatch"
import { PixelArt } from "./pixels"

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

function Cinema() {
  return (
    <div className="flow">
      <p className="marquee">
        <span>Now showing</span>
      </p>
      <p>The series and anime I love.</p>
      {FAVORITES.map((g) => (
        <section key={g.group}>
          <h4 className="eyebrow">{g.group}</h4>
          <ul className="posters">
            {g.items.map((title) => (
              <li key={title} className="poster">
                <PixelArt draw={drawPoster(title)} w={POSTER_W} h={POSTER_H} label={`Pixel poster for ${title}`} className="poster-art" />
                <span className="poster-title">{title}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

type Art = (typeof PHOTOS)[number]

// One artwork at full size, over everything. Arrow keys and swipes move through the set.
function Lightbox({ list, at, onMove, onClose }: { list: Art[]; at: number; onMove: (i: number) => void; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const swipe = useRef(0)
  const art = list[at]
  const step = (d: number) => onMove((at + d + list.length) % list.length)

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    return () => prev?.focus?.()
  }, [])

  // capture phase, so Escape closes only the picture and not the panel behind it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") onMove((at + 1) % list.length)
      else if (e.key === "ArrowLeft") onMove((at - 1 + list.length) % list.length)
      else return
      e.preventDefault()
      e.stopPropagation()
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [at, list.length, onMove, onClose])

  return createPortal(
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={art.name}
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      onTouchStart={(e) => (swipe.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - swipe.current
        if (Math.abs(dx) > 40 && list.length > 1) step(dx < 0 ? 1 : -1)
      }}
    >
      <figure onClick={(e) => e.stopPropagation()}>
        <img src={art.src} alt={art.name} />
        <figcaption>
          {art.name}
          {list.length > 1 && (
            <span className="lb-count">
              {at + 1} / {list.length}
            </span>
          )}
        </figcaption>
      </figure>
      <button type="button" className="lb-btn lb-close" ref={closeRef} aria-label="Close" onClick={onClose}>
        ×
      </button>
      {list.length > 1 && (
        <>
          <button
            type="button"
            className="lb-btn lb-prev"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation()
              step(-1)
            }}
          >
            ‹
          </button>
          <button
            type="button"
            className="lb-btn lb-next"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation()
              step(1)
            }}
          >
            ›
          </button>
        </>
      )}
    </div>,
    // in full screen, only the full-screen element is visible
    document.fullscreenElement ?? document.body,
  )
}

function Gallery() {
  const [tab, setTab] = useState<"photos" | "paintings">("photos")
  const [open, setOpen] = useState<number | null>(null)
  const list = tab === "photos" ? PHOTOS : PAINTINGS
  const close = useCallback(() => setOpen(null), [])
  const pickTab = (next: "photos" | "paintings") => {
    setTab(next)
    setOpen(null)
  }
  return (
    <div className="flow">
      <p>
        I take photos and paint. {list.length ? "Tap a piece to see it big." : "The walls are still waiting for the first pieces."}
      </p>
      <div className="seg small" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "photos"} aria-pressed={tab === "photos"} onClick={() => pickTab("photos")}>
          Photos
        </button>
        <button type="button" role="tab" aria-selected={tab === "paintings"} aria-pressed={tab === "paintings"} onClick={() => pickTab("paintings")}>
          Paintings
        </button>
      </div>
      <ul className="gallery">
        {list.length
          ? list.map((a, i) => (
              <li key={a.src}>
                <button type="button" className="art-thumb" aria-label={`Open ${a.name}`} onClick={() => setOpen(i)}>
                  <img src={a.src} alt="" loading="lazy" />
                </button>
              </li>
            ))
          : Array.from({ length: 6 }, (_, k) => (
              <li key={k} className="frame-empty">
                <span>coming soon</span>
              </li>
            ))}
      </ul>
      {open !== null && list[open] && <Lightbox list={list} at={open} onMove={setOpen} onClose={close} />}
    </div>
  )
}

function Sports() {
  const path = [...SPORTS].reverse()
  return (
    <div className="flow">
      <ol className="journey" aria-label="My sports, in order">
        {path.map((s) => (
          <li key={s.name}>
            <strong>{s.name}</strong>
            <span>{s.when}</span>
          </li>
        ))}
        <li className="goal">
          <strong>Next</strong>
          <span>swim professionally</span>
        </li>
      </ol>
      <ul className="sports">
        {SPORTS.map((s) => (
          <li key={s.name} className={s.when === "now" ? "now" : undefined}>
            <PixelArt draw={SPORT_SCENES[s.name]} w={SCENE_W} h={SCENE_H} label={`Pixel scene: ${s.name}`} className="cover" />
            <div className="sport-text">
              <h4>
                {s.name} <span className="when">{s.when}</span>
              </h4>
              <p>{s.note}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
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
