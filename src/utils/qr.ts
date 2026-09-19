
import qrcodegen from 'qrcode-generator'

export function qrMatrix(value: string): boolean[][] {
  const qr = qrcodegen(0, 'M')
  qr.addData(value || ' ')
  qr.make()
  const size = qr.getModuleCount()
  const grid: boolean[][] = []
  for (let r = 0; r < size; r++) {
    const row: boolean[] = []
    for (let c = 0; c < size; c++) row.push(qr.isDark(r, c))
    grid.push(row)
  }
  return grid
}
