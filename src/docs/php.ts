import type { LangDoc } from './shared'

export const phpDoc: LangDoc = {
  summary: 'The generated file targets mike42/escpos-php, the library the bundled server/print.php endpoint also uses.',
  runtime: 'PHP 7.4 or newer with ext-mbstring; ext-gd as well if you print images',
  install: 'composer require mike42/escpos-php',
  connections: [
    { label: 'Network', detail: 'NetworkPrintConnector("<ip>", 9100) — a raw socket, no spooler in the way.' },
    { label: 'USB', detail: 'WindowsPrintConnector for a shared queue on Windows, FilePrintConnector("/dev/usb/lp0") on Linux.' },
    { label: 'Bluetooth', detail: 'FilePrintConnector pointed at the bound rfcomm device.' },
  ],
  sections: [
    {
      heading: 'Run the file',
      body: [
        'The generated script assumes Composer\'s autoloader sits next to it. Drop it in the directory where you ran composer require and it runs as-is.',
      ],
      codeCaption: 'shell',
      code: `composer require mike42/escpos-php
php receipt.php`,
    },
    {
      heading: 'Choosing a connector',
      body: [
        'The connector is the only part that knows about transport. Everything after it is the same Printer API no matter how the bytes get out.',
        'WindowsPrintConnector wants a share name, not a device path — share the printer first, then pass the name you gave it. It also accepts smb://host/share for a queue on another machine.',
      ],
      code: `use Mike42\\Escpos\\PrintConnectors\\NetworkPrintConnector;
use Mike42\\Escpos\\PrintConnectors\\WindowsPrintConnector;
use Mike42\\Escpos\\PrintConnectors\\FilePrintConnector;
use Mike42\\Escpos\\PrintConnectors\\CupsPrintConnector;

$connector = new NetworkPrintConnector("192.168.1.100", 9100);
$connector = new WindowsPrintConnector("POS-58");
$connector = new FilePrintConnector("/dev/usb/lp0");
$connector = new CupsPrintConnector("receipt-printer");`,
    },
    {
      heading: 'The bundled endpoint',
      body: [
        'server/print.php in this repo takes the same JSON the Export JSON button produces and prints it server-side, so the browser never needs to reach the printer. Add an items array to the JSON and the item-loop block prints one line per entry.',
      ],
      codeCaption: 'shell',
      code: `php -S 0.0.0.0:8080 -t server
curl -X POST --data-binary @receipt.json http://localhost:8080/print.php`,
    },
    {
      heading: 'Print modes',
      body: [
        'selectPrintMode() sets size, setEmphasis() sets bold, setJustification() sets alignment. All three are sticky — they apply to everything printed after them until changed, which is why the generated file resets back to MODE_FONT_A after a double-size line.',
      ],
      code: `$printer->setJustification(Printer::JUSTIFY_CENTER);
$printer->setEmphasis(true);
$printer->selectPrintMode(Printer::MODE_DOUBLE_HEIGHT | Printer::MODE_DOUBLE_WIDTH);
$printer->text("TAPSI HOUSE\\n");
$printer->selectPrintMode(Printer::MODE_FONT_A);
$printer->setEmphasis(false);`,
    },
    {
      heading: 'QR codes, barcodes and cutting',
      body: [
        'Both codes are drawn by the printer. Error-correction level M and a module size around 6 read reliably from a phone at arm\'s length on 58 mm paper.',
        'CODE39 only accepts uppercase letters, digits, and a small set of symbols. Feed a few lines before cutting or the cutter will slice through the last line of text.',
      ],
      code: `$printer->qrCode("https://example.com/receipt/1234", Printer::QR_ECLEVEL_M, 6);
$printer->barcode("1234567890", Printer::BARCODE_CODE39);
$printer->feed(3);
$printer->cut();
$printer->close();`,
    },
  ],
  gotchas: [
    {
      title: 'Permission denied on /dev/usb/lp0',
      body: 'The web server user is not in the lp group. Either add it and restart the service, or print through CUPS with CupsPrintConnector, which handles permissions for you.',
    },
    {
      title: 'Output is fine from CLI but silent from the web server',
      body: 'A short PHP-FPM timeout or an open_basedir restriction will cut a socket write off mid-receipt. Print from a queued job rather than inside a request if you can.',
    },
    {
      title: 'Peso signs print as a different symbol',
      body: 'escpos-php maps characters onto whichever code page the printer has. Where no mapping exists, print that line as an image with ImagickEscposImage or EscposImage — that path needs ext-gd or ext-imagick.',
    },
  ],
  links: [
    { label: 'escpos-php on GitHub', href: 'https://github.com/mike42/escpos-php' },
    { label: 'escpos-php on Packagist', href: 'https://packagist.org/packages/mike42/escpos-php' },
  ],
}
