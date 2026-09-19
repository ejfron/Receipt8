import type { Receipt } from '../types/receipt'
import { buildEscPosBytes, type Lang } from './shared'

function generate(r: Receipt): string {
  if (r.connection === 'network') {
    const receiptJson = JSON.stringify(r, null, 2)
    return [
      `// A Capacitor WebView has no raw TCP sockets, so the plain socket-to-port-9100`,
      `// approach the other tabs use for Network isn't available here. The path that`,
      `// works instead reuses something already in this project: POST the exact JSON`,
      `// the Export JSON button produces to server/print.php, and let that PHP`,
      `// process — running somewhere that DOES have a socket — talk to the printer.`,
      ``,
      `// Wherever you deploy print.php — NOT the printer's own address, which is`,
      `// already inside the JSON below as "host".`,
      `const PRINT_SERVER_URL = 'https://your-print-server/print.php'`,
      ``,
      `const receiptJson = ${receiptJson}`,
      `// If the layout includes an item loop, print.php also reads a top-level`,
      `// "items" array — add one here, the same way the README describes for curl.`,
      ``,
      `async function printReceipt() {`,
      `  const res = await fetch(PRINT_SERVER_URL, {`,
      `    method: 'POST',`,
      `    headers: { 'Content-Type': 'application/json' },`,
      `    body: JSON.stringify(receiptJson),`,
      `  })`,
      `  const result = await res.json()`,
      `  if (!res.ok || result.error) throw new Error(result.error ?? \`Print server returned \${res.status}\`)`,
      `}`,
    ].join('\n')
  }

  if (r.connection === 'usb') {
    return [
      `// USB is the weakest-supported path on mobile. iOS has no general-purpose`,
      `// USB-serial API open to third-party apps. Android can reach a USB printer`,
      `// over OTG, but only through a native USB-serial plugin outside core Capacitor,`,
      `// and only if that plugin's driver recognises your printer's USB chipset.`,
      `//`,
      `// If the printer also does Bluetooth, switch the connection dropdown above —`,
      `// that path is real and generates working code. This one isn't something to`,
      `// build a shipped app around without testing your exact printer model first.`,
    ].join('\n')
  }

  const bytes = buildEscPosBytes(r)
  const bytesLiteral = `[${bytes.join(', ')}]`
  return [
    `import { BleClient, numbersToDataView } from '@capacitor-community/bluetooth-le'`,
    ``,
    `// Fill these in from your printer's manual or a generic BLE-scanner app — unlike`,
    `// Heart Rate or Battery, thermal-printer service/characteristic UUIDs are set by`,
    `// each manufacturer, not standardised.`,
    `const PRINTER_SERVICE = 'REPLACE_WITH_PRINTER_SERVICE_UUID'`,
    `const PRINTER_WRITE_CHARACTERISTIC = 'REPLACE_WITH_WRITE_CHARACTERISTIC_UUID'`,
    ``,
    `const receiptBytes = new Uint8Array(${bytesLiteral})`,
    ``,
    `async function printReceipt() {`,
    `  await BleClient.initialize()`,
    ``,
    `  const device = await BleClient.requestDevice({ services: [PRINTER_SERVICE] })`,
    `  await BleClient.connect(device.deviceId)`,
    ``,
    `  try {`,
    `    // The usable payload per write is the negotiated MTU minus a 3-byte ATT`,
    `    // header. getMtu() isn't available on the web target, so fall back to the`,
    `    // safe pre-negotiation default of 20 bytes if it throws.`,
    `    let chunkSize = 20`,
    `    try {`,
    `      chunkSize = (await BleClient.getMtu(device.deviceId)) - 3`,
    `    } catch {`,
    `      /* web target, or the printer never negotiated a larger MTU */`,
    `    }`,
    ``,
    `    // A receipt is comfortably larger than one BLE packet — an 80mm QR block`,
    `    // alone can be 100+ bytes — so it has to go over in chunks, in order.`,
    `    for (let i = 0; i < receiptBytes.length; i += chunkSize) {`,
    `      const chunk = receiptBytes.slice(i, i + chunkSize)`,
    `      await BleClient.writeWithoutResponse(`,
    `        device.deviceId,`,
    `        PRINTER_SERVICE,`,
    `        PRINTER_WRITE_CHARACTERISTIC,`,
    `        numbersToDataView([...chunk]),`,
    `      )`,
    `    }`,
    `  } finally {`,
    `    await BleClient.disconnect(device.deviceId)`,
    `  }`,
    `}`,
  ].join('\n')
}

export const capacitor: Lang = {
  id: 'capacitor',
  label: 'Mobile app',
  library: '@capacitor-community/bluetooth-le',
  hint: 'npm i @capacitor-community/bluetooth-le',
  generate,
}
