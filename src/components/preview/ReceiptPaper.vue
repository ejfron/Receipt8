<script setup lang="ts">
import { computed } from 'vue'
import { useReceiptStore } from '../../stores/receipt'
import { renderPreview } from '../../utils/preview'
import { qrMatrix } from '../../utils/qr'
import { charsFor } from '../../utils/format'

const store = useReceiptStore()
const lines = computed(() => renderPreview(store.receipt))
const width = computed(() => charsFor(store.receipt.paper))

const qrCache = new Map<string, boolean[][]>()
function qrFor(value: string): boolean[][] {
  let m = qrCache.get(value)
  if (!m) {
    m = qrMatrix(value)
    qrCache.set(value, m)
  }
  return m
}
</script>

<template>
  <section class="stage">
    <div class="paper" :style="{ '--cols': width }">
      <div class="tear top"></div>
      <div class="roll">
        <template v-for="(l, i) in lines" :key="i">
          <div v-if="l.block === 'qr'" class="qr-block">
            <svg class="qr-svg" :viewBox="`0 0 ${qrFor(l.text).length} ${qrFor(l.text).length}`" aria-hidden="true">
              <rect width="100%" height="100%" fill="var(--paper)" />
              <template v-for="(row, r) in qrFor(l.text)" :key="r">
                <rect v-for="(dark, c) in row" v-show="dark" :key="c" :x="c" :y="r" width="1" height="1" fill="var(--paper-ink)" />
              </template>
            </svg>
            <small>{{ l.text }}</small>
          </div>
          <div v-else-if="l.block === 'barcode'" class="bar-block">
            <div class="bars" aria-hidden="true"><i v-for="n in 40" :key="n" :style="{ width: (n % 3 ? 2 : 4) + 'px' }"></i></div>
            <small>{{ l.text }}</small>
          </div>
          <pre v-else class="row" :class="[l.align, { bold: l.bold, double: l.double, muted: l.muted }]">{{ l.text || ' ' }}</pre>
        </template>
      </div>
      <div class="tear bottom"></div>
    </div>
    <p class="stage-note">{{ store.receipt.paper }}mm roll · {{ width }} characters per line</p>
  </section>
</template>
