import { test } from "node:test";
import assert from "node:assert/strict";
import { monthlyTotals, barHeights } from "../scripts/lib/sparkline.mjs";

test("monthlyTotals sums by month and ends at the last day's month", () => {
  const days = [
    { date: "2025-11-30", count: 9 },
    { date: "2025-12-01", count: 2 },
    { date: "2025-12-31", count: 3 },
    { date: "2026-11-12", count: 4 },
  ];
  const m = monthlyTotals(days);
  assert.equal(m.length, 12);
  assert.equal(m[0], 5);
  assert.equal(m[11], 4);
  assert.equal(m.reduce((a, b) => a + b, 0), 9);
});

test("barHeights scales to the largest value with a minimum height", () => {
  assert.deepEqual(barHeights([0, 7, 14]), [2, 8, 16]);
  assert.deepEqual(barHeights([0, 0]), [2, 2]);
  assert.deepEqual(barHeights([1, 100], 10, 3), [3, 10]);
});
