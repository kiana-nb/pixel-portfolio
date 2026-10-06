# Kiana's Pixel Room

My portfolio as a tiny indie game. Walk around a pixel-art room, pick a project cartridge from the shelf and watch it boot on an old CRT, or switch to the quick view for a plain, readable page.

## What's in the room

| Thing | Opens |
| --- | --- |
| Journal on the bed | About me |
| Bookshelf | Skills |
| Cartridges + CRT | Projects |
| Desk and monitor | Experience |
| Frames on the wall | Certificates |
| Mailbox by the door | Contact |
| The door | Career Street outside |
| Window | Day / night |
| Record player | A small chiptune |
| Flower pot at the far end | Water it until it blooms |
| Bowl by the certificates | Feed the cat |
| Yarn ball on the rug | Play fetch with the cat |
| The cat | Pet it and it follows you around |

Outside the door is **Career Street**: each building is a stop on my way so far (school, university, then each job), with the years painted on the sidewalk like a timeline. There's a car to drive around in, and an empty lot at the end waiting for the next stop.

Off the main path there's a softer side, kept out of the way on purpose because this is a work portfolio:

- **Coins:** every secret pays 10, and Fish Catch at the arcade (end of Career Street) pays 1 coin per 3 fish.
- **Dressing nook** (far end of the room, 20 coins): a wardrobe with outfits, hair colours and extras for Kiana, and things for the cat.
- **Weekend Lane** (past the arcade, 30 coins): a cinema with favourite series and anime, a gallery, the sports centre and a book & webtoon café.
- **Kind words:** recommendations from LinkedIn, on the cork board above the desk.
- **A nap:** the pillow on the bed leads to a short dream.

### Adding photos and paintings

Drop image files into `src/artworks/photos` and `src/artworks/paintings`. They appear in the gallery in file-name order, and the file name becomes the caption. Keep each image around 1200px wide and under 300 KB.

There are also ten secrets hidden in the room. The star counter in the corner keeps track and gives hints.

Controls: `←` `→` or `A` `D` to walk, `Space` to jump, `E` to interact, `F` for full screen, or click / tap anywhere (tap Kiana to jump). The buttons under the room walk you straight to each part.

## How it's built

- **Vite + React 19 + TypeScript**, no game engine.
- The room is drawn in code on a low-resolution canvas (`src/game`), scaled up with `image-rendering: pixelated`. Big furniture is drawn from primitives, characters are string sprites, and night mode is a lighting pass with cut-out light sources.
- Each project has its own animated pixel cover (`src/game/covers.ts`).
- Sound uses WebAudio and only starts after you turn it on.
- Respects `prefers-reduced-motion` and the light / dark color scheme.

## Run it

```bash
npm install
npm run dev
```

`npm run build` makes a normal static build in `dist/`. `npm run build:artifact` inlines everything (JS, CSS, fonts) into a single HTML file in `dist-artifact/`.

## Content

Every project claim in `src/content.ts` comes from my own git history. Please don't add numbers or skills there without checking them.
