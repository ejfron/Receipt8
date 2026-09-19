<script setup lang="ts">
import { computed, ref } from 'vue'
import { useReceiptStore } from '../../stores/receipt'
import { languages, type LangId } from '../../generators'

const store = useReceiptStore()
const active = ref<LangId>('php')
const status = ref('')

const lang = computed(() => languages.find((l) => l.id === active.value)!)
const code = computed(() => lang.value.generate(store.receipt))

const ext: Record<LangId, string> = {
  python: 'py',
  node: 'ts',
  php: 'php',
  csharp: 'cs',
  escpos: 'txt',
  capacitor: 'ts',
}

async function copy() {
  try {
    await navigator.clipboard.writeText(code.value)
    status.value = 'Copied'
  } catch {
    status.value = 'Copy blocked by the browser — select the code and copy manually'
  }
  setTimeout(() => (status.value = ''), 2200)
}

function download() {
  const blob = new Blob([code.value], { type: 'text/plain' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `receipt.${ext[active.value]}`
  a.click()
  URL.revokeObjectURL(a.href)
  status.value = 'Downloaded'
  setTimeout(() => (status.value = ''), 2200)
}
</script>

<template>
  <section class="panel code">
    <header class="panel-head">
      <h2>Printing code</h2>
      <div class="actions">
        <button class="btn" @click="download">Download file</button>
        <button class="btn primary" @click="copy">Copy code</button>
      </div>
    </header>

    <nav class="tabs">
      <button v-for="l in languages" :key="l.id" :class="{ on: l.id === active }" @click="active = l.id">
        {{ l.label }}
      </button>
    </nav>

    <p class="lib">
      {{ lang.library }} · {{ lang.hint }}
      <RouterLink class="lib-doc" :to="`/docs/${lang.id}`">{{ lang.label }} docs →</RouterLink>
    </p>
    <pre class="source"><code>{{ code }}</code></pre>
    <p class="status" :class="{ show: status }">{{ status }}</p>
  </section>
</template>
