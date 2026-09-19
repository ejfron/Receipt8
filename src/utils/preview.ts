import { charsFor, padRow } from './format'
import type { Receipt } from '../types/receipt'

export interface PreviewLine {
  text: string
  align?: 'left' | 'center' | 'right'
  bold: boolean
  double: boolean
  muted?: boolean
  block?: 'qr' | 'barcode'
}

const SAMPLE = [
  { name: 'Tapsilog', qty: 1, price: 85 },
  { name: 'Iced tea', qty: 2, price: 35 },
]

export function renderPreview(r: Receipt): PreviewLine[] {
  const w = charsFor(r.paper)
  const lines: PreviewLine[] = []
  for (const e of r.elements) {
    switch (e.type) {
      case 'text': {
        const width = e.double ? Math.floor(w / 2) : w
        const wrapped = e.value.match(new RegExp(`.{1,${width}}`, 'g')) ?? ['']
        for (const part of wrapped) lines.push({ text: part, align: e.align, bold: e.bold, double: e.double })
        break
      }
      case 'line':
        lines.push({ text: (e.char || '-').repeat(w), bold: false, double: false, muted: true })
        break
      case 'row':
        lines.push({ text: padRow(e.left, e.right, w), bold: e.bold, double: false })
        break
      case 'items':
        for (const it of SAMPLE) {
          lines.push({ text: padRow(`${it.qty}x ${it.name}`, it.price.toFixed(2), w), bold: false, double: false })
        }
        break
      case 'qr':
        lines.push({ text: e.value, bold: false, double: false, block: 'qr' })
        break
      case 'barcode':
        lines.push({ text: e.value, bold: false, double: false, block: 'barcode' })
        break
      case 'feed':
        for (let i = 0; i < e.lines; i++) lines.push({ text: '', bold: false, double: false })
        break
      case 'cut':
        lines.push({ text: '✁' + '- '.repeat(Math.floor((w - 2) / 2)), bold: false, double: false, muted: true })
        break
    }
  }
  return lines
}
