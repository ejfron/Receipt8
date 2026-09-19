<script setup lang="ts">
import { languages } from '../generators'
import { docs } from '../docs'

const blocks = [
  { name: 'Text', emits: 'One line, with its own alignment, bold and double-size flags.' },
  { name: 'Divider', emits: 'The chosen character repeated to the full character width of the paper.' },
  { name: 'Two columns', emits: 'A label and a value padded apart so the value sits flush right.' },
  { name: 'Item loop', emits: 'A real loop over an items array, not fixed lines — seeded with one example row.' },
  { name: 'QR code', emits: 'A printer-rendered QR. No image library involved.' },
  { name: 'Barcode', emits: 'A printer-rendered barcode. CODE128 where the library offers it, CODE39 otherwise.' },
  { name: 'Blank lines', emits: 'A feed command, so the cutter clears the last line of text.' },
  { name: 'Cut paper', emits: 'A full cut. Put a feed above it or you slice through the final line.' },
]
</script>

<template>
  <main class="page">
    <div class="prose">
      <p class="eyebrow">Documentation</p>
      <h1>Printing from your stack</h1>
      <p class="lede">
        The workbench writes the code; these pages cover what it assumes about your environment — what to install,
        which connection maps to what, and the handful of things that reliably go wrong the first time.
      </p>

      <h2 class="h-rule">One page per language</h2>
      <ul class="cards">
        <li v-for="l in languages" :key="l.id">
          <RouterLink :to="`/docs/${l.id}`">
            <h3>{{ l.label }}</h3>
            <p>{{ docs[l.id].summary }}</p>
            <code>{{ docs[l.id].install }}</code>
          </RouterLink>
        </li>
      </ul>

      <h2 class="h-rule">What each block turns into</h2>
      <p>
        Every language tab reads the same layout, so a block means the same thing everywhere — only the syntax
        changes. Where a library has no equivalent, the generator falls back to raw bytes rather than dropping the
        block silently.
      </p>
      <table class="ref">
        <thead>
          <tr><th>Block</th><th>Generated as</th></tr>
        </thead>
        <tbody>
          <tr v-for="b in blocks" :key="b.name">
            <td>{{ b.name }}</td>
            <td>{{ b.emits }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="h-rule">Paper width</h2>
      <p>
        58 mm paper fits 32 characters per line; 80 mm fits about 48. That number drives every padded column in
        both the preview and the generated code, so switching width in the header re-flows both at once. It is the
        one setting worth getting right before you copy anything.
      </p>

      <h2 class="h-rule">Characters outside ASCII</h2>
      <p>
        Peso signs, ñ, curly quotes and em dashes are not in the default code page of most thermal printers. Either
        set the right code page on the device, or render that part of the receipt as an image. Every language page
        below says how, because the answer differs per library.
      </p>

      <p class="back"><RouterLink to="/">← Back to the workbench</RouterLink></p>
    </div>
  </main>
</template>
