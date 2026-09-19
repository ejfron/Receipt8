import type { LangDoc } from './shared'

export const escposDoc: LangDoc = {
  summary: 'Not a language — the exact bytes the printer receives, as hex. Useful for debugging, for languages with no ESC/POS library, and for understanding what the other four tabs are really doing.',
  runtime: 'Anything that can open a socket or write to a device',
  install: 'Nothing to install',
  connections: [
    { label: 'Network', detail: 'Pipe the bytes to port 9100 with nc, or a three-line socket write in any language.' },
    { label: 'USB', detail: 'Write them to /dev/usb/lp0 on Linux, or send a raw job to the spooler on Windows.' },
    { label: 'Bluetooth', detail: 'Write them to the bound rfcomm device — it behaves like any other serial port.' },
  ],
  sections: [
    {
      heading: 'Sending the dump',
      body: [
        'Strip the comment lines, turn the hex back into bytes, and push them at the printer. On a Unix box that is two commands.',
      ],
      codeCaption: 'shell',
      code: `grep -v '^#' receipt.txt | xxd -r -p > receipt.bin

nc 192.168.1.100 9100 < receipt.bin    # network
cat receipt.bin > /dev/usb/lp0         # usb
lp -d receipt-printer -o raw receipt.bin  # via CUPS`,
    },
    {
      heading: 'From a script',
      body: [
        'Any language with sockets can do this in a few lines, which makes the raw tab a usable fallback for stacks with no ESC/POS package — Go, Rust, Ruby, Java, a shell script on a till.',
      ],
      code: `import socket

data = bytes.fromhex(open("receipt.txt").read()
                     .split("\\n\\n", 1)[1].replace("\\n", " ").replace(" ", ""))

with socket.create_connection(("192.168.1.100", 9100), timeout=5) as s:
    s.sendall(data)`,
    },
    {
      heading: 'Reading the bytes',
      body: [
        'The commands the workbench emits are a small subset of ESC/POS. Once you can spot these, a hex dump becomes readable at a glance — 1B 61 01 is "centre from here on".',
      ],
      code: `1B 40           ESC @     initialise, reset every mode
1B 61 n         ESC a     align: 0 left, 1 centre, 2 right
1B 45 n         ESC E     bold: 0 off, 1 on
1D 21 n         GS  !     size: high nibble width, low nibble height
1B 64 n         ESC d     feed n lines
1D 56 42 00     GS  V     cut, function B
1D 28 6B ...    GS  ( k   QR code, several commands
1D 6B ...       GS  k     barcode`,
    },
    {
      heading: 'What it does not include',
      body: [
        'Item loops cannot be baked into a fixed dump — there is nothing to loop over until run time — so the workbench writes a placeholder line where the loop would go. QR and barcode payloads appear as readable markers rather than the real command sequences, because both need length-prefixed framing that depends on the payload.',
        'If you need those for real, generate the dump from one of the other tabs and capture what it sends, or build the sequences from the command table above.',
      ],
    },
    {
      heading: 'Using it to debug',
      body: [
        'When a receipt prints wrong from your own code, dump your bytes and diff them against this tab for the same layout. Mode commands that were never reset are the usual culprit: a stray 1B 45 01 that no 1B 45 00 ever follows makes the rest of the receipt bold.',
      ],
    },
  ],
  gotchas: [
    {
      title: 'The dump is ASCII only',
      body: 'Characters above 0x7F are written as single bytes with no code-page selection in front of them. A peso sign or an ñ will print as whatever the printer currently has in that slot.',
    },
    {
      title: 'Nothing prints until a feed or cut',
      body: 'Thermal printers hold the last partial line in the buffer. The workbench puts feed and cut blocks at the end of the sample layout for exactly this reason — delete them and the last few lines seem to vanish.',
    },
    {
      title: 'Cut commands vary by manufacturer',
      body: 'GS V 66 0 (full cut, function B) is widely supported but not universal. Star printers in particular use a different sequence, and some clones only do partial cuts.',
    },
  ],
  links: [
    { label: 'Epson ESC/POS command reference', href: 'https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/index.html' },
  ],
}
