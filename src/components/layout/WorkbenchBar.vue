<script setup lang="ts">
import { ref } from 'vue'
import { useReceiptStore } from '../../stores/receipt'

const store = useReceiptStore()
const fileInput = ref<HTMLInputElement | null>(null)

function importJson(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  store.importJson(file).catch((err: Error) => alert(err.message))
  input.value = ''
}
</script>

<template>
  <div class="topbar sub">
    <div class="seg" role="group" aria-label="Paper width">
      <button :class="{ on: store.receipt.paper === 58 }" @click="store.receipt.paper = 58">58 mm</button>
      <button :class="{ on: store.receipt.paper === 80 }" @click="store.receipt.paper = 80">80 mm</button>
    </div>

    <label class="field">
      <span>Connection</span>
      <select v-model="store.receipt.connection">
        <option value="network">Network</option>
        <option value="usb">USB</option>
        <option value="bluetooth">Bluetooth</option>
      </select>
    </label>

    <label class="field" v-if="store.receipt.connection === 'network'">
      <span>Printer IP</span>
      <input v-model="store.receipt.host" />
    </label>

    <span class="spacer"></span>

    <div class="actions">
      <button class="btn" @click="store.exportJson">Export JSON</button>
      <button class="btn" @click="fileInput?.click()">Import JSON</button>
      <button class="btn" @click="store.reset">Reset</button>
      <input ref="fileInput" type="file" accept="application/json" hidden @change="importJson" />
    </div>
  </div>
</template>
