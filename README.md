# QueryForge

Native macOS desktop app (Electron) that combines a **zero-config SQLite workspace** with a **guided SQL course**. Data lives in local `.db` files under `~/queryforge/data/`; progress is stored under `~/Library/Application Support/QueryForge/`.

## Prerequisites

- Node.js 20+
- macOS (primary target)

## Scripts

| Command        | Description                                      |
| -------------- | ------------------------------------------------ |
| `npm run dev`  | Vite + TypeScript watch + Electron with hot reload |
| `npm run build`| Production bundle (renderer + main process)      |
| `npm run dist` | macOS `.dmg` / `.zip` via electron-builder       |
| `npm run test` | Vitest unit tests                                |

## Architecture (current)

- **Renderer**: React 19, Vite 8, Tailwind CSS 4, TanStack Query, Zustand, Monaco Editor, Framer Motion.
- **Main**: sql.js (WASM) with a **MySQL compatibility layer** (function shims + SQL preprocessing for `LIMIT m,n`, backticks, `SHOW TABLES`, etc.).
- **IPC**: `preload` exposes `window.queryforge` for DB operations, dialogs, and course progress.

## Roadmap

The repository is structured for the full vision in the product spec: multi-tab editor, command palette, remote DB adapters, 12 worlds / 120+ levels, charting, Pyodide bridge, Playwright E2E, and signed auto-updates. The current milestone delivers a working **workspace**, **sample village database**, **World 1 levels (starter set)**, **result validation**, and **DMG packaging hooks**.

## License

Private / MIT TBD — set as needed for your distribution.
