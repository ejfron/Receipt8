import { charsFor, padRow } from '../utils/format'
import type { Receipt } from '../types/receipt'
import { q, type Lang } from './shared'

function generate(r: Receipt): string {
  const w = charsFor(r.paper)
  const conn =
    r.connection === 'network'
      ? [
          `use Mike42\\Escpos\\PrintConnectors\\NetworkPrintConnector;`,
          ``,
          `$connector = new NetworkPrintConnector("${r.host}", 9100);`,
        ]
      : r.connection === 'usb'
        ? [
            `use Mike42\\Escpos\\PrintConnectors\\WindowsPrintConnector;`,
            ``,
            `$connector = new WindowsPrintConnector("POS-58");`,
          ]
        : [
            `use Mike42\\Escpos\\PrintConnectors\\FilePrintConnector;`,
            ``,
            `$connector = new FilePrintConnector("/dev/rfcomm0");`,
          ]
  const out = [
    `<?php`,
    `require __DIR__ . '/vendor/autoload.php';`,
    ``,
    `use Mike42\\Escpos\\Printer;`,
    ...conn,
    `$printer = new Printer($connector);`,
    ``,
    `$items = [['name' => 'Tapsilog', 'qty' => 1, 'price' => 85.00]];`,
    ``,
  ]
  for (const e of r.elements) {
    switch (e.type) {
      case 'text': {
        const a = e.align === 'center' ? 'JUSTIFY_CENTER' : e.align === 'right' ? 'JUSTIFY_RIGHT' : 'JUSTIFY_LEFT'
        out.push(
          `$printer->setJustification(Printer::${a});`,
          `$printer->setEmphasis(${e.bold ? 'true' : 'false'});`,
          `$printer->selectPrintMode(Printer::${e.double ? 'MODE_DOUBLE_HEIGHT | Printer::MODE_DOUBLE_WIDTH' : 'MODE_FONT_A'});`,
          `$printer->text("${q(e.value)}\\n");`,
        )
        break
      }
      case 'line':
        out.push(
          `$printer->setJustification(Printer::JUSTIFY_LEFT);`,
          `$printer->selectPrintMode(Printer::MODE_FONT_A);`,
          `$printer->text("${e.char.repeat(w)}\\n");`,
        )
        break
      case 'row':
        out.push(
          `$printer->setEmphasis(${e.bold ? 'true' : 'false'});`,
          `$printer->text("${q(padRow(e.left, e.right, w))}\\n");`,
        )
        break
      case 'items':
        out.push(
          `$printer->setEmphasis(false);`,
          `foreach ($items as $it) {`,
          `    $left  = $it['qty'] . 'x ' . $it['name'];`,
          `    $right = number_format($it['price'], 2);`,
          `    $printer->text(str_pad($left, ${w} - strlen($right)) . $right . "\\n");`,
          `}`,
        )
        break
      case 'qr':
        out.push(`$printer->setJustification(Printer::JUSTIFY_CENTER);`, `$printer->qrCode("${q(e.value)}", Printer::QR_ECLEVEL_M, 6);`)
        break
      case 'barcode':
        out.push(`$printer->setJustification(Printer::JUSTIFY_CENTER);`, `$printer->barcode("${q(e.value)}", Printer::BARCODE_CODE39);`)
        break
      case 'feed':
        out.push(`$printer->feed(${e.lines});`)
        break
      case 'cut':
        out.push(`$printer->cut();`)
        break
    }
  }
  out.push(``, `$printer->close();`)
  return out.join('\n')
}

export const php: Lang = {
  id: 'php',
  label: 'PHP',
  library: 'mike42/escpos-php',
  hint: 'composer require mike42/escpos-php',
  generate,
}
