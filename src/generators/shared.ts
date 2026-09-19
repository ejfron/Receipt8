import { charsFor, padRow } from '../utils/format'
import type { Receipt } from '../types/receipt'

export type LangId = 'python' | 'node' | 'php' | 'csharp' | 'escpos' | 'capacitor'

export interface Lang {
  id: LangId
  label: string
  library: string
  hint: string
  generate: (r: Receipt) => string
}

export const q = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

export function buildEscPosBytes(r: Receipt): number[] {
  const w = charsFor(r.paper)
  const bytes: number[] = [0x1b, 0x40]
  const push = (s: string) => {
    for (const ch of s) bytes.push(ch.charCodeAt(0) & 0xff)
  }
  for (const e of r.elements) {
    switch (e.type) {
      case 'text':
        bytes.push(0x1b, 0x61, e.align === 'center' ? 1 : e.align === 'right' ? 2 : 0)
        bytes.push(0x1b, 0x45, e.bold ? 1 : 0)
        bytes.push(0x1d, 0x21, e.double ? 0x11 : 0x00)
        push(e.value + '\n')
        break
      case 'line':
        bytes.push(0x1b, 0x61, 0, 0x1b, 0x45, 0, 0x1d, 0x21, 0)
        push(e.char.repeat(w) + '\n')
        break
      case 'row':
        bytes.push(0x1b, 0x61, 0, 0x1b, 0x45, e.bold ? 1 : 0)
        push(padRow(e.left, e.right, w) + '\n')
        break
      case 'items':
        push('(items loop — generate one line per item at run time)\n')
        break
      case 'qr':
      case 'barcode':
        push(`[${e.type}: ${e.value}]\n`)
        break
      case 'feed':
        bytes.push(0x1b, 0x64, e.lines)
        break
      case 'cut':
        bytes.push(0x1d, 0x56, 0x42, 0x00)
        break
    }
  }
  return bytes
}
