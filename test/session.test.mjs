import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { XMLValidator } from "fast-xml-parser";
import { sessionTimeline, renderSession, sessionAlt } from "../scripts/lib/session.mjs";

const profile = JSON.parse(readFileSync("data/profile.json", "utf8"));

test("timeline is increasing and ends under 9 seconds", () => {
  const { events, end } = sessionTimeline(profile.session);
  assert.equal(events.length, 4);
  for (let i = 1; i < events.length; i++) assert.ok(events[i].prompt > events[i - 1].outAt);
  assert.ok(end < 9, `end=${end}`);
});

test("session renders valid SVG in both themes with one cover per command", () => {
  for (const theme of ["dark", "light"]) {
    const svg = renderSession(profile, theme);
    assert.equal(XMLValidator.validate(svg), true);
    assert.equal(svg.match(/class="cv"/g).length, profile.session.length);
    assert.match(svg, /cannot add length \(m\) and time \(s\)/);
  }
});

test("alt text carries the whole transcript", () => {
  const alt = sessionAlt(profile);
  assert.match(alt, /whoami/);
  assert.match(alt, /340\/9/);
  assert.match(alt, /finance-api/);
});
