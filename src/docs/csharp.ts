import type { LangDoc } from './shared'

export const csharpDoc: LangDoc = {
  summary: 'No printing library — the generated file opens a socket and writes ESC/POS bytes itself, with small helpers for align, bold and size.',
  runtime: '.NET 6 or newer',
  install: 'No package needed for TCP. Add System.Text.Encoding.CodePages for CP437.',
  connections: [
    { label: 'Network', detail: 'TcpClient to port 9100. This is what the generator emits.' },
    { label: 'USB', detail: 'Swap the NetworkStream for a FileStream on the device node, or print through the Windows spooler with a raw job.' },
    { label: 'Bluetooth', detail: 'SerialPort on the COM port the pairing created; its BaseStream drops into the same helpers.' },
  ],
  sections: [
    {
      heading: 'Run the file',
      body: [
        'The generated code is top-level statements, so it drops straight into Program.cs of a console project with nothing else around it.',
      ],
      codeCaption: 'shell',
      code: `dotnet new console -o ReceiptPrinter
cd ReceiptPrinter
dotnet add package System.Text.Encoding.CodePages
# paste the generated code into Program.cs
dotnet run`,
    },
    {
      heading: 'Register the code page provider first',
      body: [
        'Encoding.GetEncoding(437) throws on .NET Core and later unless the code-pages provider is registered. It is one line, it has to run before the first GetEncoding call, and forgetting it is the single most common reason the generated file fails on the first run.',
      ],
      code: `using System.Text;

Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
var enc = Encoding.GetEncoding(437);`,
    },
    {
      heading: 'The helpers',
      body: [
        'Every ESC/POS command is a short byte sequence. The generated file wraps the four it needs so the body of the receipt stays readable.',
        'Align takes 0, 1 or 2. Size takes a packed byte where the high nibble is width and the low nibble is height, so 0x11 is double both ways and 0x00 is normal.',
      ],
      code: `void Raw(params byte[] b) => stream.Write(b, 0, b.Length);
void Text(string s) { var b = enc.GetBytes(s); stream.Write(b, 0, b.Length); }
void Align(int a) => Raw(0x1B, 0x61, (byte)a);
void Bold(bool on) => Raw(0x1B, 0x45, (byte)(on ? 1 : 0));
void Size(bool dbl) => Raw(0x1D, 0x21, (byte)(dbl ? 0x11 : 0x00));`,
    },
    {
      heading: 'Filling in PrintQr',
      body: [
        'The generator leaves PrintQr as a call rather than inlining it, because a QR code is four separate GS ( k commands: pick a model, set the module size, set error correction, store the payload, then print what was stored.',
        'Paste this next to the other helpers. Size 6 and error-correction level M are a reasonable starting point.',
      ],
      code: `void PrintQr(string data, byte size = 6)
{
    var bytes = enc.GetBytes(data);
    var len = bytes.Length + 3;

    Raw(0x1D, 0x28, 0x6B, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);   // model 2
    Raw(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x43, size);         // module size
    Raw(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x45, 0x31);         // EC level M

    Raw(0x1D, 0x28, 0x6B, (byte)(len % 256), (byte)(len / 256), 0x31, 0x50, 0x30);
    stream.Write(bytes, 0, bytes.Length);                        // store payload

    Raw(0x1D, 0x28, 0x6B, 0x03, 0x00, 0x31, 0x51, 0x30);         // print
}`,
    },
    {
      heading: 'Using a serial or USB stream instead',
      body: [
        'Nothing in the receipt body knows what kind of stream it is writing to. Replace the first three lines and everything below carries on working.',
      ],
      code: `using var port = new SerialPort("COM3", 9600);
port.Open();
var stream = port.BaseStream;

// or, on Linux, straight at the device node:
using var stream = new FileStream("/dev/usb/lp0", FileMode.Open, FileAccess.Write);`,
    },
  ],
  gotchas: [
    {
      title: 'The last part of the receipt is missing',
      body: 'NetworkStream buffers. Call stream.Flush() before the using block disposes, or wrap the whole thing so disposal happens after the cut command is written.',
    },
    {
      title: 'The connection hangs for 20 seconds then fails',
      body: 'TcpClient has no short connect timeout by default. Use ConnectAsync with a CancellationToken if a dead printer should not stall the checkout screen.',
    },
    {
      title: 'Barcode data is written but nothing appears',
      body: 'GS k with function 73 expects a length byte before the data and no terminator. Double-check the length matches the bytes you actually write — an off-by-one here prints blank paper rather than an error.',
    },
  ],
  links: [
    { label: 'Epson ESC/POS command reference', href: 'https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/index.html' },
    { label: 'System.Text.Encoding.CodePages', href: 'https://www.nuget.org/packages/System.Text.Encoding.CodePages' },
  ],
}
