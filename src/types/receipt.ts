export type Align = 'left' | 'center' | 'right'

export type Element =
  | { id: string; type: 'text'; value: string; align: Align; bold: boolean; double: boolean }
  | { id: string; type: 'line'; char: string }
  | { id: string; type: 'row'; left: string; right: string; bold: boolean }
  | { id: string; type: 'items' }
  | { id: string; type: 'qr'; value: string }
  | { id: string; type: 'barcode'; value: string }
  | { id: string; type: 'feed'; lines: number }
  | { id: string; type: 'cut' }

export type Connection = 'network' | 'usb' | 'bluetooth'

export interface Receipt {
  paper: 58 | 80
  connection: Connection
  host: string
  elements: Element[]
}
