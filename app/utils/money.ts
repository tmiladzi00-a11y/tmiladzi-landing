/** Zambian Kwacha, grouped for en-ZM, no decimals. Prefix the K yourself. */
export function fmtMoney(n: number): string {
  return new Intl.NumberFormat('en-ZM', { maximumFractionDigits: 0 }).format(n)
}
export function kwacha(n: number): string {
  return 'K' + fmtMoney(n)
}
