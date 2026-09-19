<script setup lang="ts">
import { useReceiptStore } from '../../stores/receipt'
import { useDragReorder } from '../../composables/useDragReorder'
import { uid } from '../../utils/format'
import type { Element } from '../../types/receipt'

const store = useReceiptStore()

const labels: Record<Element['type'], string> = {
  text: 'Text',
  line: 'Divider',
  row: 'Two columns',
  items: 'Item loop',
  qr: 'QR code',
  barcode: 'Barcode',
  feed: 'Blank lines',
  cut: 'Cut paper',
}

function blank(type: Element['type']): Element {
  const id = uid()
  switch (type) {
    case 'text':
      return { id, type, value: 'New line', align: 'left', bold: false, double: false }
    case 'line':
      return { id, type, char: '-' }
    case 'row':
      return { id, type, left: 'Label', right: '0.00', bold: false }
    case 'items':
      return { id, type }
    case 'qr':
      return { id, type, value: 'https://example.com/receipt/1234' }
    case 'barcode':
      return { id, type, value: '123456789012' }
    case 'feed':
      return { id, type, lines: 3 }
    case 'cut':
      return { id, type }
  }
}

const add = (type: Element['type']) => store.receipt.elements.push(blank(type))
const remove = (i: number) => store.receipt.elements.splice(i, 1)
const move = (i: number, by: number) => {
  const to = i + by
  const list = store.receipt.elements
  if (to < 0 || to >= list.length) return
  list.splice(to, 0, list.splice(i, 1)[0])
}
const duplicate = (i: number) => {
  const copy = { ...store.receipt.elements[i], id: uid() } as Element
  store.receipt.elements.splice(i + 1, 0, copy)
}

const { dragIndex, overIndex, dragStart, dragEnter, dragOver, drop, dragEnd } = useDragReorder(
  () => store.receipt.elements,
)
</script>

<template>
  <section class="panel editor">
    <header class="panel-head">
      <h2>Layout</h2>
      <span class="count">{{ store.receipt.elements.length }} blocks</span>
    </header>

    <div class="adders">
      <button v-for="t in (['text','row','items','line','qr','barcode','feed','cut'] as Element['type'][])" :key="t"
              class="chip" @click="add(t)">+ {{ labels[t] }}</button>
    </div>

    <ol class="blocks">
      <li v-for="(el, i) in store.receipt.elements" :key="el.id" class="block"
          :class="{ dragging: dragIndex === i, over: overIndex === i && dragIndex !== i }"
          draggable="true"
          @dragstart="dragStart(i, $event)"
          @dragenter="dragEnter(i)"
          @dragover="dragOver"
          @drop="drop(i)"
          @dragend="dragEnd">
        <div class="block-head">
          <span class="handle" title="Drag to reorder">⠿</span>
          <span class="block-name">{{ labels[el.type] }}</span>
          <div class="block-tools">
            <button @click="move(i, -1)" :disabled="i === 0" title="Move up">↑</button>
            <button @click="move(i, 1)" :disabled="i === store.receipt.elements.length - 1" title="Move down">↓</button>
            <button @click="duplicate(i)" title="Duplicate">⧉</button>
            <button class="danger" @click="remove(i)" title="Delete">✕</button>
          </div>
        </div>

        <div v-if="el.type === 'text'" class="fields">
          <input v-model="el.value" placeholder="Line of text" />
          <div class="inline">
            <select v-model="el.align">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
            <label class="toggle"><input type="checkbox" v-model="el.bold" /> Bold</label>
            <label class="toggle"><input type="checkbox" v-model="el.double" /> Large</label>
          </div>
        </div>

        <div v-else-if="el.type === 'row'" class="fields">
          <div class="inline">
            <input v-model="el.left" placeholder="Left" />
            <input v-model="el.right" class="short" placeholder="Right" />
          </div>
          <label class="toggle"><input type="checkbox" v-model="el.bold" /> Bold</label>
        </div>

        <div v-else-if="el.type === 'line'" class="fields">
          <input v-model="el.char" maxlength="1" class="short" placeholder="-" />
        </div>

        <div v-else-if="el.type === 'qr' || el.type === 'barcode'" class="fields">
          <input v-model="el.value" placeholder="Encoded value" />
        </div>

        <div v-else-if="el.type === 'feed'" class="fields">
          <input type="number" min="1" max="10" v-model.number="el.lines" class="short" />
        </div>

        <p v-else-if="el.type === 'items'" class="note">
          Prints one line per item from your <code>items</code> array at run time.
        </p>
      </li>
    </ol>

    <p v-if="!store.receipt.elements.length" class="empty">Add a block to start building the receipt.</p>
  </section>
</template>
