export function sanitizeMoneyInput(text: string): string {
  if (text === '') return '';
  let s = text.replace(/[^0-9.]/g, '');
  const first = s.indexOf('.');
  if (first === -1) return s;
  let left = s.slice(0, first);
  let right = s.slice(first + 1).replace(/\./g, '').slice(0, 2);
  if (left === '') left = '0';
  if (s.endsWith('.') && right === '') {
    return `${left}.`;
  }
  return right.length > 0 ? `${left}.${right}` : left;
}

export function parseMoneyAmount(text: string): number {
  const trimmed = text.replace(/\.$/, '');
  if (trimmed === '') return NaN;
  const n = parseFloat(trimmed);
  return Number.isFinite(n) ? n : NaN;
}

export function selectedChipIndexForAmount(
  amountText: string,
  chips: number[]
): number | null {
  if (amountText === '' || amountText.endsWith('.')) return null;
  const n = parseMoneyAmount(amountText);
  if (!Number.isFinite(n) || n <= 0) return null;
  const idx = chips.findIndex(v => v === n && amountText === String(v));
  return idx >= 0 ? idx : null;
}
