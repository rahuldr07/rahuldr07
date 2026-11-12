import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { XMLValidator } from "fast-xml-parser";
import { renderFetch, fetchAlt, ART, ART_ROW } from "../scripts/lib/fetchcard.mjs";

const profile = JSON.parse(readFileSync("data/profile.json", "utf8"));
const activity = { total: 5752, months: [300, 420, 610, 400, 700, 820, 610, 690, 900, 850, 700, 252] };

test("fetch card renders valid SVG with the real total and every row", () => {
  for (const theme of ["dark", "light"]) {
    const svg = renderFetch(profile, activity, theme);
    assert.equal(XMLValidator.validate(svg), true);
    assert.match(svg, /5,752/);
    for (const [k, v] of profile.fetch.rows) {
      assert.ok(svg.includes(k) && svg.includes(v), `${k}`);
    }
    assert.equal(svg.match(/class="cv"/g).length, 1);
    assert.equal(svg.match(/width="22" height="12"/g).length, 6);
    assert.equal(svg.match(new RegExp(`width="7" height="\\d+" fill="${theme === "dark" ? "#a6d189" : "#3f7a1f"}"`, "g")).length, 12);
  }
});

test("block art is six lines of equal length", () => {
  assert.equal(ART.length, 6);
  assert.ok(ART.every(l => [...l].length === [...ART[0]].length));
});

test("alt text names the total", () => {
  assert.match(fetchAlt(profile, activity), /5,752 contributions/);
});

test("art is drawn as solid shapes with a shadow copy and no box-drawing glyphs", () => {
  const svg = renderFetch(profile, activity, "dark");
  const runs = ART.reduce((n, line) => n + (line.match(/█+/g) ?? []).length, 0);
  assert.equal(svg.match(new RegExp(`height="${ART_ROW}"/>`, "g")).length, runs * 2);
  assert.match(svg, /fill-opacity="0\.28" transform="translate\(4 4\)"/);
});
