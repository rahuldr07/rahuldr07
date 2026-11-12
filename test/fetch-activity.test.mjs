import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseCalendar, unusable } from "../scripts/fetch-activity.mjs";

test("parseCalendar reads dates and counts in order", () => {
  const days = parseCalendar(readFileSync("test/fixtures/calendar.html", "utf8"));
  assert.deepEqual(days, [
    { date: "2026-11-10", count: 0 },
    { date: "2026-11-11", count: 3 },
    { date: "2026-11-12", count: 12 },
  ]);
});

test("unusable explains why parsed data cannot be trusted", () => {
  const day = (i, count) => ({ date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`, count });
  const few = Array.from({ length: 10 }, (_, i) => day(i, 1));
  const zeros = Array.from({ length: 365 }, (_, i) => day(i, 0));
  const good = Array.from({ length: 365 }, (_, i) => day(i, i % 3));
  assert.match(unusable(few), /Only 10 days/);
  assert.match(unusable(zeros), /no contributions/);
  assert.equal(unusable(good), null);
});
