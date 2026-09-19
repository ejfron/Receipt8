import type { Align } from '../types/receipt'

export const charsFor = (paper: 58 | 80) => (paper === 58 ? 32 : 48)

export const uid = () => Math.random().toString(36).slice(2, 9)

export function padRow(left: string, right: string, width: number) {
  const gap = Math.max(1, width - left.length - right.length)
  return left + ' '.repeat(gap) + right
}

export function alignText(text: string, align: Align, width: number) {
  if (text.length >= width) return text
  if (align === 'center') return ' '.repeat(Math.floor((width - text.length) / 2)) + text
  if (align === 'right') return ' '.repeat(width - text.length) + text
  return text
}
