// Tiny WebAudio chiptune and UI blips. Nothing plays until the visitor turns sound on.

let ac: AudioContext | null = null
let master: GainNode | null = null

function audio() {
  if (!ac) {
    ac = new AudioContext()
    master = ac.createGain()
    master.gain.value = 0.5
    master.connect(ac.destination)
  }
  if (ac.state === "suspended") void ac.resume()
  return ac
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, vol: number) {
  const a = audio()
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, start)
  g.gain.linearRampToValueAtTime(vol, start + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur)
  o.connect(g).connect(master!)
  o.start(start)
  o.stop(start + dur + 0.02)
}

export const sfx = {
  enabled: false,
  blip(freq = 880) {
    if (!this.enabled) return
    tone(freq, audio().currentTime, 0.07, "square", 0.05)
  },
  open() {
    if (!this.enabled) return
    const t = audio().currentTime
    tone(660, t, 0.08, "square", 0.05)
    tone(990, t + 0.07, 0.12, "square", 0.05)
  },
  close() {
    if (!this.enabled) return
    const t = audio().currentTime
    tone(780, t, 0.07, "square", 0.04)
    tone(520, t + 0.06, 0.1, "square", 0.04)
  },
  purr() {
    if (!this.enabled) return
    const t = audio().currentTime
    for (let i = 0; i < 4; i++) tone(70 + (i % 2) * 6, t + i * 0.09, 0.09, "triangle", 0.12)
    tone(1320, t, 0.08, "square", 0.03)
  },
  meow() {
    if (!this.enabled) return
    const a = audio()
    const o = a.createOscillator()
    const g = a.createGain()
    const t = a.currentTime
    o.type = "triangle"
    o.frequency.setValueAtTime(700, t)
    o.frequency.linearRampToValueAtTime(980, t + 0.12)
    o.frequency.linearRampToValueAtTime(560, t + 0.38)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.09, t + 0.04)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    o.connect(g).connect(master!)
    o.start(t)
    o.stop(t + 0.45)
  },
  secret() {
    if (!this.enabled) return
    const t = audio().currentTime
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.08, 0.16, "square", 0.045))
  },
  water() {
    if (!this.enabled) return
    const t = audio().currentTime
    for (let i = 0; i < 5; i++) tone(1200 + i * 180, t + i * 0.04, 0.05, "sine", 0.05)
  },
}

// C major pentatonic loop over C, Am, F and G.
const N: Record<string, number> = {
  C3: 130.81, A2: 110, F2: 87.31, G2: 98, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880, C6: 1046.5, G4: 392, A4: 440, E4: 329.63,
}
const BASS = ["C3", "A2", "F2", "G2"]
const MELODY = [
  "E5", "", "G5", "", "A5", "G5", "E5", "", "C5", "", "D5", "E5", "", "", "D5", "",
  "C5", "", "E5", "", "G5", "", "A5", "", "G5", "E5", "", "D5", "C5", "", "", "",
  "A4", "", "C5", "", "D5", "", "E5", "G5", "", "E5", "D5", "", "C5", "", "", "",
  "G4", "", "A4", "C5", "", "D5", "", "E5", "D5", "", "C5", "", "A4", "", "G4", "",
]

let timer = 0
let step = 0
let nextAt = 0
const STEP = 60 / 100 / 2

function schedule() {
  const a = audio()
  while (nextAt < a.currentTime + 0.12) {
    const m = MELODY[step % MELODY.length]
    if (m) tone(N[m], nextAt, STEP * 1.6, "square", 0.022)
    if (step % 4 === 0) tone(N[BASS[Math.floor(step / 16) % 4]], nextAt, STEP * 3.5, "triangle", 0.07)
    if (step % 2 === 1) tone(N.C6 * 2, nextAt, 0.02, "square", 0.004)
    step++
    nextAt += STEP
  }
}

export function startMusic() {
  if (timer) return
  const a = audio()
  nextAt = a.currentTime + 0.05
  step = 0
  timer = window.setInterval(schedule, 40)
  schedule()
}

export function stopMusic() {
  window.clearInterval(timer)
  timer = 0
}
