import { charsFor } from '../utils/format'
import type { Receipt } from '../types/receipt'
import { buildEscPosBytes, type Lang } from './shared'

function generate(r: Receipt): string {
  const w = charsFor(r.paper)
  const bytes = buildEscPosBytes(r)
  const hex = bytes.map((b) => b.toString(16).padStart(2, '0').toUpperCase())
  const rows: string[] = []
  for (let i = 0; i < hex.length; i += 16) rows.push(hex.slice(i, i + 16).join(' '))
  return `# Raw ESC/POS bytes — send straight to the device\n# ${bytes.length} bytes, ${r.paper}mm paper, ${w} chars per line\n\n${rows.join('\n')}`
}

export const escpos: Lang = {
  id: 'escpos',
  label: 'Raw bytes',
  library: 'ESC/POS hex dump',
  hint: 'Any language can send these',
  generate,
}
