import type { LangDoc } from './shared'

export const nodeDoc: LangDoc = {
  summary: 'The generated file is an ES module that builds a receipt in node-thermal-printer\'s buffer and flushes it in one call.',
  runtime: 'Node.js 16 or newer, with ESM enabled',
  install: 'npm i node-thermal-printer',
  connections: [
    { label: 'Network', detail: 'interface: "tcp://<ip>:9100" — the common case, and the one that needs no extra native module.' },
    { label: 'USB', detail: 'interface: "printer:auto" hands off to a system print queue; "/dev/usb/lp0" writes the device node directly.' },
    { label: 'Bluetooth', detail: 'interface: "/dev/rfcomm0" — the serial port created when you bind the paired device.' },
  ],
  sections: [
    {
      heading: 'Run the file',
      body: [
        'The generated code uses import and a top-level await, so it needs to be an ES module. Either name the file .mjs or set the type field in package.json.',
      ],
      codeCaption: 'shell',
      code: `npm init -y
npm pkg set type=module
npm i node-thermal-printer
node receipt.js`,
    },
    {
      heading: 'Buffer, then execute',
      body: [
        'Every println, bold and alignCenter call appends to an in-memory buffer. Nothing reaches the printer until execute() runs, which is why the whole receipt goes out as one job rather than a line at a time.',
        'execute() clears the buffer on success. If you print in a loop, check the connection first and clear explicitly when a job fails, or the next receipt inherits the failed one.',
      ],
      code: `if (!(await printer.isPrinterConnected())) {
  throw new Error('Printer unreachable')
}

try {
  await printer.execute()
} catch (err) {
  printer.clear()
  throw err
}`,
    },
    {
      heading: 'Width and the two-column helper',
      body: [
        'leftRight() pads to the width passed in the constructor — 32 for 58 mm paper, 48 for 80 mm. The workbench fills that number in for you, so switching paper width in the header rewrites it here.',
        'If you build the printer object somewhere else in your codebase, keep that width in sync or every two-column row will drift.',
      ],
      code: `const printer = new ThermalPrinter({
  type: PrinterTypes.EPSON,
  interface: 'tcp://192.168.1.100:9100',
  characterSet: CharacterSet.PC437_USA,
  width: 32,
})

printer.leftRight('TOTAL', '173.60')`,
    },
    {
      heading: 'Double-size text',
      body: [
        'Double height and width are modes, not per-call options: they stay on until you turn them off. The generator emits setTextNormal() straight after any double-size line for exactly this reason.',
      ],
      code: `printer.setTextDoubleHeight()
printer.setTextDoubleWidth()
printer.println('TAPSI HOUSE')
printer.setTextNormal()`,
    },
    {
      heading: 'Printer types',
      body: [
        'PrinterTypes.EPSON covers most generic ESC/POS hardware. Star printers use a different dialect for cutting and barcodes, so pick PrinterTypes.STAR if the paper feeds but never cuts.',
      ],
      code: `type: PrinterTypes.EPSON   // most clones
type: PrinterTypes.STAR    // Star Micronics
type: PrinterTypes.TANCA
type: PrinterTypes.DARUMA`,
    },
  ],
  gotchas: [
    {
      title: 'Cannot use import outside a module',
      body: 'Node read the file as CommonJS. Add "type": "module" to package.json or rename the file to receipt.mjs.',
    },
    {
      title: 'printer:auto fails to resolve',
      body: 'Printing through a system queue relies on an optional native module and a queue that already exists. On a server, tcp:// to the printer directly is far less trouble.',
    },
    {
      title: 'Accented characters come out as line-drawing junk',
      body: 'The characterSet in the constructor has to match what the printer is configured for. PC437_USA is the usual default; PC852_LATIN2 and WPC1252 cover most of the alternatives.',
    },
  ],
  links: [
    { label: 'node-thermal-printer documentation', href: 'https://github.com/Klemen1337/node-thermal-printer' },
    { label: 'node-thermal-printer on npm', href: 'https://www.npmjs.com/package/node-thermal-printer' },
  ],
}
