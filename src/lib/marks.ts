export function marksPercentage(obtained: number, maximum: number) {
  if (!Number.isFinite(obtained) || !Number.isFinite(maximum) || maximum <= 0) return null;
  if (obtained < 0 || obtained > maximum) return null;
  const value = Math.round((obtained / maximum) * 1000) / 10;
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

export function readMark(value: string) {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
