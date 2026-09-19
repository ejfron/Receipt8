import { charsFor, padRow } from '../utils/format'
import type { Receipt } from '../types/receipt'
import { q, type Lang } from './shared'

function generate(r: Receipt): string {
  const w = charsFor(r.paper)
  const out = [
    `using System.Net.Sockets;`,
    `using System.Text;`,
    ``,
    `// Raw ESC/POS over TCP. Swap the stream for a SerialPort or USB handle if needed.`,
    `using var client = new TcpClient("${r.host}", 9100);`,
    `using var stream = client.GetStream();`,
    `var enc = Encoding.GetEncoding(437);`,
    ``,
    `void Raw(params byte[] b) => stream.Write(b, 0, b.Length);`,
    `void Text(string s) { var b = enc.GetBytes(s); stream.Write(b, 0, b.Length); }`,
    `void Align(int a) => Raw(0x1B, 0x61, (byte)a);   // 0 left, 1 center, 2 right`,
    `void Bold(bool on) => Raw(0x1B, 0x45, (byte)(on ? 1 : 0));`,
    `void Size(bool dbl) => Raw(0x1D, 0x21, (byte)(dbl ? 0x11 : 0x00));`,
    ``,
    `Raw(0x1B, 0x40); // initialise`,
    ``,
  ]
  for (const e of r.elements) {
    switch (e.type) {
      case 'text': {
        const a = e.align === 'center' ? 1 : e.align === 'right' ? 2 : 0
        out.push(`Align(${a}); Bold(${e.bold}); Size(${e.double});`, `Text("${q(e.value)}\\n");`)
        break
      }
      case 'line':
        out.push(`Align(0); Bold(false); Size(false);`, `Text("${e.char.repeat(w)}\\n");`)
        break
      case 'row':
        out.push(`Align(0); Bold(${e.bold}); Size(false);`, `Text("${q(padRow(e.left, e.right, w))}\\n");`)
        break
      case 'items':
        out.push(
          `Align(0); Bold(false); Size(false);`,
          `foreach (var it in items)`,
          `{`,
          `    var left = $"{it.Qty}x {it.Name}";`,
          `    var right = it.Price.ToString("0.00");`,
          `    Text(left.PadRight(${w} - right.Length) + right + "\\n");`,
          `}`,
        )
        break
      case 'qr':
        out.push(`Align(1);`, `// QR: store then print (GS ( k)`, `PrintQr("${q(e.value)}");`)
        break
      case 'barcode':
        out.push(`Align(1);`, `Raw(0x1D, 0x6B, 0x49, (byte)"${q(e.value)}".Length); Text("${q(e.value)}");`)
        break
      case 'feed':
        out.push(`Raw(0x1B, 0x64, ${e.lines});`)
        break
      case 'cut':
        out.push(`Raw(0x1D, 0x56, 0x42, 0x00);`)
        break
    }
  }
  return out.join('\n')
}

export const csharp: Lang = {
  id: 'csharp',
  label: 'C#',
  library: 'raw ESC/POS over TCP',
  hint: 'No package needed',
  generate,
}
