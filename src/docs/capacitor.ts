import type { LangDoc } from './shared'

export const capacitorDoc: LangDoc = {
  summary:
    'For wrapping this as a native iOS/Android app with Capacitor and talking to a printer directly from the device — the case that actually needs this tab is a portable Bluetooth printer with no fixed network address.',
  runtime: 'A Capacitor 5 or 6 project targeting iOS 13+ or Android 5+ (BLE requires API 18+; 5.0 is the realistic floor)',
  install: 'npm i @capacitor-community/bluetooth-le',
  connections: [
    {
      label: 'Network',
      detail:
        'A WebView has no raw TCP sockets, so the generated code POSTs the same JSON the Export JSON button produces to server/print.php instead, and lets that PHP process — which does have a socket — talk to the printer. No socket plugin needed.',
    },
    {
      label: 'USB',
      detail:
        'The weakest-supported path here. iOS has no general-purpose USB-serial API for third-party apps; Android needs OTG plus a native USB-serial plugin outside core Capacitor. The generated code is a caveat, not a working implementation — test your exact printer before relying on it.',
    },
    {
      label: 'Bluetooth',
      detail:
        'The one this tab is actually for. Generates a full BLE scan → connect → chunked-write flow using @capacitor-community/bluetooth-le. See the Bluetooth Classic gotcha below before assuming your printer is compatible.',
    },
  ],
  sections: [
    {
      heading: 'There is no pairing step to lean on',
      body: [
        'Every other tab treats Bluetooth as a serial port the OS already created — you pair the printer once, the OS binds it to /dev/rfcomm0 or a COM port, and the generated code just opens that path like any other file. A Capacitor app running in a WebView has no equivalent OS-level step: it has to discover the printer, open a GATT connection and write to a specific characteristic itself, every time the app runs.',
        'That is what requestDevice() and connect() are doing in the generated file. There is no separate "pair in Bluetooth settings first" instruction to give you, because pairing in that sense does not happen — the app\'s own connect() call is the whole thing.',
      ],
    },
    {
      heading: 'Finding the service and characteristic UUIDs',
      body: [
        "Heart-rate monitors and the like use UUIDs registered with the Bluetooth SIG, which is why example code online can hard-code them. Thermal printers don't — every manufacturer picks its own, so the placeholders in the generated file have to be replaced with your printer's actual values before anything will connect.",
        'The fastest way to find them without the manufacturer\'s SDK: install a generic BLE inspector app (nRF Connect is the common one, free on both platforms), connect to the printer from it, and read off the service UUID and the characteristic that accepts writes. A printer sometimes exposes several services — the print characteristic is usually the one flagged "Write" or "Write Without Response" rather than "Read" or "Notify".',
      ],
    },
    {
      heading: 'Chunking around the MTU',
      body: [
        'A single BLE write is capped by the connection\'s negotiated MTU, minus 3 bytes for the ATT protocol header — 20 bytes if nothing negotiates a larger one, which is why the generated code defaults to that and only asks getMtu() for a bigger number. An 80mm receipt with a QR code easily exceeds that in one shot, so the bytes have to go over as a sequence of writes, in order, which is what the loop in the generated file is doing.',
        'getMtu() has no meaning on the web target — there is no real BLE radio to negotiate anything — so the generated code wraps it in a try/catch and falls back to 20 rather than letting that call throw and abort printing.',
      ],
      codeCaption: 'the chunking loop from the generated file',
      code: `let chunkSize = 20
try {
  chunkSize = (await BleClient.getMtu(device.deviceId)) - 3
} catch {
  /* web target, or the printer never negotiated a larger MTU */
}

for (let i = 0; i < receiptBytes.length; i += chunkSize) {
  const chunk = receiptBytes.slice(i, i + chunkSize)
  await BleClient.writeWithoutResponse(
    device.deviceId, PRINTER_SERVICE, PRINTER_WRITE_CHARACTERISTIC,
    numbersToDataView([...chunk]),
  )
}`,
    },
    {
      heading: 'Platform permissions',
      body: [
        "Both platforms require you to declare Bluetooth intent before requestDevice() will do anything. On iOS, add NSBluetoothAlwaysUsageDescription to Info.plist with a one-line reason a user will see in the permission prompt. On Android 12+ (API 31+), the manifest needs the BLUETOOTH_SCAN and BLUETOOTH_CONNECT permissions.",
        "Android also ties classic BLE scanning to location permission by default, because a scan can reveal a device's approximate position. If your app genuinely doesn't use scan results for that, pass androidNeverForLocation: true to initialize() to opt out of the location-permission requirement rather than asking users for a permission the printer flow doesn't need.",
      ],
      codeCaption: 'initialize() without requesting location',
      code: `await BleClient.initialize({ androidNeverForLocation: true })`,
    },
    {
      heading: 'Bluetooth Classic (SPP) is not what this generates',
      body: [
        '@capacitor-community/bluetooth-le is deliberately BLE-only — its own documentation says so directly, and it is the plugin used here precisely because it is the current, actively maintained, cross-platform one. Bluetooth Classic / SPP, the profile the rfcomm-based Bluetooth option on the other five tabs assumes, is a different radio protocol that this plugin does not touch at all.',
        'Whether that matters depends on your printer. Many pocket receipt printers from the last few years are BLE; a good number of cheaper or older ones are SPP-only. If yours is SPP-only, this generated file will not connect to it, full stop — no chunk size or UUID fix will change that, because it is the wrong protocol.',
        "The honest state of Capacitor's SPP support: there is no single well-maintained, widely-adopted package for it comparable to bluetooth-le. What exists is a handful of small, mostly Android-only community packages with limited adoption. If you are in this situation, check your printer's own SDK first — many portable-printer manufacturers ship their own Capacitor or Cordova plugin, which will be far better tested against that specific device than any generic SPP wrapper.",
      ],
    },
  ],
  gotchas: [
    {
      title: 'requestDevice() finds nothing',
      body: 'iOS filters strictly on the services array you pass in — an empty or wrong service UUID means the picker shows no devices at all, even with the printer powered on and in range. Double-check the UUID against what your BLE inspector app actually read off the printer, not a value copied from an unrelated example.',
    },
    {
      title: 'Connects, but nothing prints',
      body: "The write succeeds with no error, yet the printer does nothing. This is almost always the wrong characteristic — printers commonly expose several, and only one of them is wired to the print engine. Re-check which characteristic is flagged for writes in your BLE inspector, and confirm you're using writeWithoutResponse() rather than write() if the characteristic doesn't support the latter.",
    },
    {
      title: 'Works once, then silently stops',
      body: "GATT connections drop when the app backgrounds, when the OS wants the radio for something else, or after a few minutes of inactivity on some Android OEM battery-saving profiles. Treat every print as connect → write → disconnect, the way the generated code does, rather than holding one connection open for the life of the app.",
    },
  ],
  links: [
    { label: '@capacitor-community/bluetooth-le on GitHub', href: 'https://github.com/capacitor-community/bluetooth-le' },
    { label: '@capacitor-community/bluetooth-le on npm', href: 'https://www.npmjs.com/package/@capacitor-community/bluetooth-le' },
  ],
}
