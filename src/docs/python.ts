import type { LangDoc } from './shared'

export const pythonDoc: LangDoc = {
  summary: 'The generated script drives python-escpos, which wraps the ESC/POS command set behind a printer object.',
  runtime: 'Python 3.8 or newer',
  install: 'pip install python-escpos',
  connections: [
    { label: 'Network', detail: 'escpos.printer.Network — raw TCP to port 9100. Nothing to install beyond the library.' },
    { label: 'USB', detail: 'escpos.printer.Usb — needs pyusb and libusb, plus device permissions on Linux.' },
    { label: 'Bluetooth', detail: 'escpos.printer.Serial pointed at the rfcomm device the pairing created.' },
  ],
  sections: [
    {
      heading: 'Run the file',
      body: [
        'Copy the code out of the workbench, save it, and run it. There is no build step and no framework — it is a plain script that opens a connection, writes lines, and closes.',
      ],
      codeCaption: 'shell',
      code: `python -m venv .venv && source .venv/bin/activate
pip install python-escpos
python receipt.py`,
    },
    {
      heading: 'Picking the connection',
      body: [
        'The workbench writes whichever constructor matches the Connection dropdown. Each one takes different arguments, so if you switch printers, this is usually the only line you touch.',
        'The USB vendor and product ids in the generated file are Epson defaults. Find yours with lsusb on Linux, or the device properties dialog on Windows.',
      ],
      code: `from escpos.printer import Network, Usb, Serial

p = Network("192.168.1.100")            # port 9100 by default
p = Usb(0x04b8, 0x0e15)                 # idVendor, idProduct
p = Serial("/dev/rfcomm0", baudrate=9600)`,
    },
    {
      heading: 'The item loop',
      body: [
        'An Item loop block turns into a real for-loop over an items list, not a fixed set of lines. The generated file seeds that list with one example row — replace it with whatever your order object holds.',
        'Each line is padded to the character width of the paper, so the price column lands flush right in the printer\'s monospaced font.',
      ],
      code: `items = [
    {"name": "Tapsilog", "qty": 1, "price": 85.00},
    {"name": "Kape",     "qty": 2, "price": 35.00},
]

for it in items:
    left = f'{it["qty"]}x {it["name"]}'
    right = f'{it["price"]:.2f}'
    p.text(left.ljust(32 - len(right)) + right + "\\n")`,
    },
    {
      heading: 'QR codes and barcodes',
      body: [
        'python-escpos renders both on the printer itself, so there is no image library involved and no resolution to pick. Size is a module multiplier from 1 to 16; 6 is a reasonable default on 58 mm paper.',
        'CODE128 accepts most ASCII. CODE39 is stricter — uppercase letters, digits and a handful of symbols — and will raise a BarcodeCodeError rather than print something wrong.',
      ],
      code: `p.set(align="center")
p.qr("https://example.com/receipt/1234", size=6)
p.barcode("1234567890", "CODE128", function_type="B")`,
    },
    {
      heading: 'Non-ASCII characters',
      body: [
        'Peso signs, ñ and curly quotes are not in the printer\'s default code page. python-escpos tries to pick a code page for you, but you can pin one if the guess is wrong.',
        'When the character genuinely is not in any code page the printer has, render that part as an image instead. That needs Pillow.',
      ],
      code: `p.charcode("CP437")     # pin a code page
p.image("logo.png")     # pip install Pillow`,
    },
  ],
  gotchas: [
    {
      title: 'USB permission denied on Linux',
      body: 'libusb needs write access to the device node. Add a udev rule with your vendor and product ids — SUBSYSTEM=="usb", ATTRS{idVendor}=="04b8", ATTRS{idProduct}=="0e15", MODE="0664", GROUP="dialout" — then reload with sudo udevadm control --reload and replug the printer.',
    },
    {
      title: 'The script finishes but nothing prints',
      body: 'Buffered commands are flushed on close. Call p.close() at the end — the generated file already does, but it is the first casualty when you paste the body into a larger function.',
    },
    {
      title: 'Network printers accept one connection at a time',
      body: 'Port 9100 is usually single-session. A crashed script that never closed its socket will lock out the next run until the printer times out.',
    },
  ],
  links: [
    { label: 'python-escpos documentation', href: 'https://python-escpos.readthedocs.io/' },
    { label: 'python-escpos on PyPI', href: 'https://pypi.org/project/python-escpos/' },
  ],
}
