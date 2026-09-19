<script setup lang="ts">
import { languages } from '../generators'
</script>

<!--
  Audience note: this page is for someone deciding whether to use Receipt8.
  Architecture (the Pinia store, the folder layout, how to add a language) belongs
  in README.md and is deliberately not repeated here — one copy, no drift.
-->
<template>
  <main class="page">
    <div class="prose">
      <p class="eyebrow">About</p>
      <h1>Receipt8</h1>
      <p class="lede">
        A visual designer for thermal receipts. Lay out the paper, switch width and connection type, then copy
        printing code that runs in the language you actually work in.
      </p>

      <h2 class="h-rule">Why it exists</h2>
      <p>
        Receipt printing is a small job that eats an afternoon. The command set is from the 1990s, the libraries all
        disagree about naming, and the only way to see whether a column lines up is to feed real paper through a real
        printer. Iterating means walking to the till.
      </p>
      <p>
        So the preview is the point. The on-screen paper is monospaced at the printer's real character width — 32
        columns at 58 mm, 48 at 80 — which means padding that looks right here lands right on paper. You get the
        layout settled before you touch a device, and the code falls out of it.
      </p>

      <h2 class="h-rule">What it generates</h2>
      <p>The same layout, in whichever of these you work in. Each has a page on what to install and what to watch for.</p>
      <ul class="plain">
        <li v-for="l in languages" :key="l.id">
          <RouterLink :to="`/docs/${l.id}`"><strong>{{ l.label }}</strong></RouterLink>
          — {{ l.library }}
        </li>
      </ul>

      <h2 class="h-rule">Your draft stays in this tab</h2>
      <p>
        There is no account and nothing to sign up for. Your work in progress is saved to this browser's local
        storage as you go, which means it survives a refresh but does not follow you to another machine — use
        <strong>Export JSON</strong> to move it, or to keep a copy in version control alongside the rest of your
        project. Nothing is uploaded: no analytics, no tracking, no network calls.
      </p>

      <h2 class="h-rule">Honest limits</h2>
      <ul class="plain">
        <li>
          The preview approximates the printer. Double-size text, QR module size and barcode width are drawn to look
          about right, not to match a specific model pixel for pixel.
        </li>
        <li>
          Generated code is a starting point, not a finished integration. It has no error handling, no retries and no
          queue — a real till needs all three.
        </li>
        <li>
          Non-ASCII characters depend on the printer's code page. The preview shows them happily; the paper may not.
        </li>
        <li>Item loops are seeded with one example row. You wire the real order data in yourself.</li>
      </ul>

      <h2 class="h-rule">Built with</h2>
      <p>
        Vue 3, TypeScript, Pinia and Vite. An optional PHP print server lets a receipt print from a machine on the
        printer's own network, so the browser never has to reach the printer directly.
      </p>

      <p class="credit">
        Made by <strong>Edgar Jugado</strong>
        <a
          class="portfolio-link"
          href="https://your-portfolio-url.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Edgar Jugado's portfolio"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 6h-3.11a15.7 15.7 0 0 0-1.38-4.08A8.03 8.03 0 0 1 18.93 8ZM12 4.04c.83 1.1 1.5 2.44 1.94 3.96h-3.88c.44-1.52 1.11-2.86 1.94-3.96ZM4.26 14a8.1 8.1 0 0 1 0-4h3.68a16.3 16.3 0 0 0 0 4H4.26Zm.81 2h3.11a15.7 15.7 0 0 0 1.38 4.08A8.03 8.03 0 0 1 5.07 16Zm3.11-8H5.07a8.03 8.03 0 0 1 4.49-4.08A15.7 15.7 0 0 0 8.18 8ZM12 19.96c-.83-1.1-1.5-2.44-1.94-3.96h3.88c-.44 1.52-1.11 2.86-1.94 3.96ZM14.32 14H9.68a14.3 14.3 0 0 1 0-4h4.64a14.3 14.3 0 0 1 0 4Zm.14 5.08A15.7 15.7 0 0 0 15.84 16h3.11a8.03 8.03 0 0 1-4.49 4.08ZM16.06 14a16.3 16.3 0 0 0 0-4h3.68a8.1 8.1 0 0 1 0 4h-3.68Z"
            />
          </svg>
          Portfolio
        </a>
      </p>

      <p class="back tight">
        <RouterLink to="/">← Back to the workbench</RouterLink> · <RouterLink to="/docs">Documentation</RouterLink>
      </p>
    </div>
  </main>
</template>
