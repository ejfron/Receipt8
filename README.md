# Receipt8

A visual designer for thermal receipts. Lay out the receipt, switch paper width and
connection type, then copy ready-to-run printing code for the language you build in.

Built with Vue 3, TypeScript and Vite. An optional PHP endpoint prints the same layout
from a server.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
```

## How it works

```
Editor  →  Pinia store (Receipt)  →  Generators  →  Copy / download
              ↓
        Live paper preview
```

```
src/
  assets/            global stylesheet
  types/             plain data shapes (Receipt, Element) and ambient .d.ts files
  utils/             pure functions: formatting, QR encoding, preview line-rendering
  stores/            Pinia store — the receipt draft, persistence, import/export
  composables/       reusable Vue logic (drag-to-reorder)
  generators/        one file per output language, see below
  docs/              one documentation page per language, mirrors generators/
  router/            route table (hash history)
  components/
    layout/          AppHeader (brand + nav), WorkbenchBar (paper/connection controls)
    editor/          the block-based layout editor
    preview/         the on-screen receipt paper
    code/            the generated-code panel with language tabs
  views/
    WorkbenchView.vue   the workbench: controls + editor + preview + code
    DocsIndexView.vue   docs landing page
    DocView.vue         one language's documentation, from src/docs/
    AboutView.vue       what this is and what it can't do
    NotFoundView.vue    404
  App.vue            global header + <RouterView>
  main.ts            creates the app, installs Pinia and the router
```

## Routes

| Path | Page |
| --- | --- |
| `/` | Workbench |
| `/docs` | Documentation index |
| `/docs/:lang` | One page per language (`python`, `node`, `php`, `csharp`, `escpos`) |
| `/about` | About |
| anything else | 404 |

Routing uses **hash history** deliberately. Receipt8 is a static bundle that tends to
get dropped on whatever host is nearby — often the same box serving `server/print.php` —
and hash routes survive a refresh on `/docs/python` with no rewrite rule. Switch to
`createWebHistory()` in `src/router/index.ts` if you control the server's fallback.

Only the workbench route renders `WorkbenchBar`; paper width and connection type are
meaningless on the docs pages, so they don't follow you there.

Everything hangs off one `Receipt` object, held in `useReceiptStore()` (`src/stores/receipt.ts`).
Every component reads and mutates `store.receipt` directly — Pinia's `reactive` state means a
`v-model` in the editor, a drag-reorder, or an Export/Import all flow through the same place, and
a deep `watch` inside the store persists any of them to local storage automatically. The preview
and every code generator read that same object, so what you see on the paper is what the
generated code prints.

Each route beyond the workbench is lazy-loaded, so the docs and About pages ship as separate
chunks and cost nothing to anyone who only ever uses the workbench.

## Adding a language

Each language lives in its own file under `src/generators/`:

```
src/generators/
  shared.ts   Lang type + string-escape helper, shared by every generator
  python.ts
  node.ts
  php.ts
  csharp.ts
  escpos.ts
  index.ts    imports each file and registers it in the `languages` array
```

To add one: create `src/generators/yourlang.ts` exporting a `Lang` (id, label,
library, hint, and a `generate(receipt) => string` function), then import and add it
to the array in `index.ts`. Nothing else needs to change — the tab, the copy button
and the download filename all come from that entry.

Then write its documentation page at `src/docs/yourlang.ts` exporting a `LangDoc` and
register it in `src/docs/index.ts`. That registry is typed `Record<LangId, LangDoc>`, so a
language with no docs is a **compile error rather than a 404** — `npm run build` will tell
you before your users do. The docs index and the `/docs/:lang` route both read the registry,
so the new page links itself up.

Included generators:

| Language | Library |
| --- | --- |
| Python | python-escpos |
| Node.js / TypeScript | node-thermal-printer |
| PHP | mike42/escpos-php |
| C# | raw ESC/POS over TCP |
| Raw bytes | ESC/POS hex dump |
| Mobile app | Capacitor, via @capacitor-community/bluetooth-le (BLE only — see its docs page for the Bluetooth Classic caveat) |

## Printing from PHP

```bash
composer require mike42/escpos-php
php -S 0.0.0.0:8080 -t server
curl -X POST --data-binary @receipt.json http://localhost:8080/print.php
```

Add an `items` array to the JSON and the item-loop block prints one line per item.

## Things worth knowing

- 58 mm paper fits 32 characters per line, 80 mm fits about 48. Column padding is
  computed from that number, so switching width re-flows both the preview and the code.
- The peso sign and other non-ASCII characters are not in the default code page of most
  printers. Either set the right code page on the printer or print the receipt as an
  image.
- Column alignment in the generated code uses plain padding, which only lines up in the
  printer's monospaced font — the same font the preview uses.
- Your draft is kept in the browser's local storage. Export JSON to move it elsewhere.
