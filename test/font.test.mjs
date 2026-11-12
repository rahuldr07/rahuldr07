import { test } from "node:test";
import assert from "node:assert/strict";
import { textOf, fontCss } from "../scripts/lib/font.mjs";

test("textOf pulls text and decodes entities", () => {
  assert.equal(textOf(`<svg><text>a &amp; b</text><text><tspan>≈</tspan></text></svg>`), "a & b≈");
});

test("fontCss embeds two small woff2 faces", async () => {
  const css = await fontCss("Dileesh ≈ · ✓ —");
  assert.equal(css.match(/@font-face/g).length, 2);
  assert.match(css, /font-family:JBM/);
  assert.match(css, /data:font\/woff2;base64,/);
  assert.ok(css.length < 40000, `css is ${css.length} chars`);
});
