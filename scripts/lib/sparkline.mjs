export function monthlyTotals(days, months = 12) {
  let [y, m] = days.at(-1).date.split("-").map(Number);
  const keys = [];
  for (let i = 0; i < months; i++) {
    keys.unshift(`${y}-${String(m).padStart(2, "0")}`);
    m -= 1;
    if (m === 0) { m = 12; y -= 1; }
  }
  const sums = new Map(keys.map(k => [k, 0]));
  for (const d of days) {
    const k = d.date.slice(0, 7);
    if (sums.has(k)) sums.set(k, sums.get(k) + d.count);
  }
  return keys.map(k => sums.get(k));
}

// Pixel heights for a bar chart: the largest value gets maxPx, every bar is at
// least minPx tall so an empty month still shows.
export function barHeights(values, maxPx = 16, minPx = 2) {
  const max = Math.max(...values);
  return values.map(v => (max === 0 ? minPx : Math.max(minPx, Math.round((v / max) * maxPx))));
}
