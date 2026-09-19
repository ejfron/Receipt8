import { defineStore } from 'pinia'
import { reactive, watch } from 'vue'
import { uid } from '../utils/format'
import type { Receipt } from '../types/receipt'

const STORAGE_KEY = 'receipt8/draft'

export function sampleReceipt(): Receipt {
  return {
    paper: 58,
    connection: 'network',
    host: '192.168.1.100',
    elements: [
      { id: uid(), type: 'text', value: 'TAPSI HOUSE', align: 'center', bold: true, double: true },
      { id: uid(), type: 'text', value: '12 Katipunan Ave, Quezon City', align: 'center', bold: false, double: false },
      { id: uid(), type: 'text', value: 'TIN 000-123-456-000', align: 'center', bold: false, double: false },
      { id: uid(), type: 'line', char: '-' },
      { id: uid(), type: 'items' },
      { id: uid(), type: 'line', char: '-' },
      { id: uid(), type: 'row', left: 'Subtotal', right: '155.00', bold: false },
      { id: uid(), type: 'row', left: 'VAT 12%', right: '18.60', bold: false },
      { id: uid(), type: 'row', left: 'TOTAL', right: '173.60', bold: true },
      { id: uid(), type: 'line', char: '=' },
      { id: uid(), type: 'text', value: 'Salamat po!', align: 'center', bold: false, double: false },
      { id: uid(), type: 'qr', value: 'https://example.com/receipt/1234' },
      { id: uid(), type: 'feed', lines: 3 },
      { id: uid(), type: 'cut' },
    ],
  }
}

function loadDraft(): Receipt {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Receipt
  } catch {
  }
  return sampleReceipt()
}

export const useReceiptStore = defineStore('receipt', () => {
  const receipt = reactive<Receipt>(loadDraft())

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(receipt))
    } catch {
    }
  }

  watch(receipt, save, { deep: true })

  function reset() {
    Object.assign(receipt, sampleReceipt())
  }

  function replace(next: Receipt) {
    Object.assign(receipt, next)
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'receipt.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importJson(file: File) {
    const text = await file.text()
    try {
      replace(JSON.parse(text) as Receipt)
    } catch {
      throw new Error('That file is not a receipt layout. Export one first to see the expected shape.')
    }
  }

  return { receipt, reset, replace, exportJson, importJson }
})
