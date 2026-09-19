import { charsFor } from '../utils/format'
import type { Receipt } from '../types/receipt'
import { q, type Lang } from './shared'

function generate(r: Receipt): string {
  const w = charsFor(r.paper)
  const iface =
    r.connection === 'network' ? `tcp://${r.host}:9100` : r.connection === 'usb' ? `printer:auto` : `/dev/rfcomm0`
  const out = [
    `import { ThermalPrinter, PrinterTypes, CharacterSet } from 'node-thermal-printer'`,
    ``,
    `const printer = new ThermalPrinter({`,
    `  type: PrinterTypes.EPSON,`,
    `  interface: '${iface}',`,
    `  characterSet: CharacterSet.PC437_USA,`,
    `  width: ${w},`,
    `})`,
    ``,
    `const items = [{ name: 'Tapsilog', qty: 1, price: 85 }]`,
    ``,
  ]
  for (const e of r.elements) {
    switch (e.type) {
      case 'text': {
        const a = e.align === 'center' ? 'alignCenter' : e.align === 'right' ? 'alignRight' : 'alignLeft'
        out.push(`printer.${a}()`, `printer.bold(${e.bold})`)
        if (e.double) out.push(`printer.setTextDoubleHeight()`, `printer.setTextDoubleWidth()`)
        out.push(`printer.println("${q(e.value)}")`)
        if (e.double) out.push(`printer.setTextNormal()`)
        break
      }
      case 'line':
        out.push(`printer.alignLeft()`, `printer.bold(false)`, `printer.println("${e.char.repeat(w)}")`)
        break
      case 'row':
        out.push(`printer.alignLeft()`, `printer.bold(${e.bold})`, `printer.leftRight("${q(e.left)}", "${q(e.right)}")`)
        break
      case 'items':
        out.push(
          `printer.alignLeft()`,
          `printer.bold(false)`,
          `for (const it of items) {`,
          `  printer.leftRight(\`\${it.qty}x \${it.name}\`, it.price.toFixed(2))`,
          `}`,
        )
        break
      case 'qr':
        out.push(`printer.alignCenter()`, `printer.printQR("${q(e.value)}", { cellSize: 6 })`)
        break
      case 'barcode':
        out.push(`printer.alignCenter()`, `printer.printBarcode("${q(e.value)}")`)
        break
      case 'feed':
        out.push(`for (let i = 0; i < ${e.lines}; i++) printer.newLine()`)
        break
      case 'cut':
        out.push(`printer.cut()`)
        break
    }
  }
  out.push(``, `await printer.execute()`)
  return out.join('\n')
}

export const node: Lang = {
  id: 'node',
  label: 'Node.js',
  library: 'node-thermal-printer',
  hint: 'npm i node-thermal-printer',
  generate,
}
