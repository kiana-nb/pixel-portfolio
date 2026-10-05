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
| Window | Day / night |
| Record player | A small chiptune |
| The cat | Pet it and it follows you around |

Controls: `←` `→` or `A` `D` to walk, `E` to interact, or click / tap anywhere. The buttons under the room walk you straight to each part.

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
