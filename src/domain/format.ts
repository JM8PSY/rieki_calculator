export function yen(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}${Math.abs(Math.round(value)).toLocaleString('ja-JP')}円`;
}

export function percent(value: number, digits = 1): string {
  return `${(value * 100).toFixed(digits)}%`;
}

export function toNumber(text: string, fallback = 0): number {
  const normalized = text
    .replace(/[０-９．]/g, (c) =>
      c === '．' ? '.' : String.fromCharCode(c.charCodeAt(0) - 0xfee0),
    )
    .replace(/[,\s円]/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : fallback;
}
