import { charsFor, padRow } from '../utils/format'
import type { Receipt } from '../types/receipt'
import { q, type Lang } from './shared'

function generate(r: Receipt): string {
  const w = charsFor(r.paper)
  const head =
    r.connection === 'network'
      ? [`from escpos.printer import Network`, ``, `p = Network("${r.host}")`]
      : r.connection === 'usb'
        ? [`from escpos.printer import Usb`, ``, `p = Usb(0x04b8, 0x0e15)  # vendor id, product id`]
        : [`from escpos.printer import Serial`, ``, `p = Serial("/dev/rfcomm0")  # paired Bluetooth port`]
  const out = [...head, ``, `items = [`, `    {"name": "Tapsilog", "qty": 1, "price": 85.00},`, `]`, ``]
  for (const e of r.elements) {
    switch (e.type) {
      case 'text':
        out.push(
          `p.set(align="${e.align}", bold=${e.bold ? 'True' : 'False'}, double_height=${e.double ? 'True' : 'False'}, double_width=${e.double ? 'True' : 'False'})`,
          `p.text("${q(e.value)}\\n")`,
        )
        break
      case 'line':
        out.push(`p.set(align="left", bold=False, double_height=False, double_width=False)`, `p.text("${e.char.repeat(w)}\\n")`)
        break
      case 'row':
        out.push(`p.set(align="left", bold=${e.bold ? 'True' : 'False'})`, `p.text("${q(padRow(e.left, e.right, w))}\\n")`)
        break
      case 'items':
        out.push(
          `p.set(align="left", bold=False)`,
          `for it in items:`,
          `    left = f'{it["qty"]}x {it["name"]}'`,
          `    right = f'{it["price"]:.2f}'`,
          `    p.text(left.ljust(${w} - len(right)) + right + "\\n")`,
        )
        break
      case 'qr':
        out.push(`p.set(align="center")`, `p.qr("${q(e.value)}", size=6)`)
        break
      case 'barcode':
        out.push(`p.set(align="center")`, `p.barcode("${q(e.value)}", "CODE128", function_type="B")`)
        break
      case 'feed':
        out.push(`p.text("${'\\n'.repeat(e.lines)}")`)
        break
      case 'cut':
        out.push(`p.cut()`)
        break
    }
  }
  out.push(``, `p.close()`)
  return out.join('\n')
}

export const python: Lang = {
  id: 'python',
  label: 'Python',
  library: 'python-escpos',
  hint: 'pip install python-escpos',
  generate,
}
