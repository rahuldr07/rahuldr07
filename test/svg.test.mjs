import { test } from "node:test";
import assert from "node:assert/strict";
import { XMLValidator } from "fast-xml-parser";
import { esc, typed, frame, ADV, appear, appearCss, cursor } from "../scripts/lib/svg.mjs";
import { PALETTES } from "../scripts/lib/palette.mjs";

test("esc escapes XML characters", () => {
  assert.equal(esc(`a<b>&"c"`), "a&lt;b&gt;&amp;&quot;c&quot;");
});

test("typed cover width is chars times advance and starts covering", () => {
  const { svg, css } = typed({ id: "t0", x: 100, y: 50, text: "whoami", at: 0.3, dur: 0.42, p: PALETTES.dark });
  assert.match(svg, /class="cv" data-n="6"/);
  assert.match(svg, new RegExp(`width="${6 * ADV}"`));
  assert.match(css, /@keyframes t0\{from\{transform:translateX\(-54px\)\}/);
  assert.match(svg, /steps\(6\)/);
});

test("frame is valid XML and has reduced-motion rule", () => {
  const svg = frame({
    theme: "dark", height: 200, title: "~/ — zsh",
    status: { left: "0:zsh", mid: ["go · ts"], right: "dileeshrahul.dev" },
    body: "<text x=\"20\" y=\"60\">hi</text>", css: "", fontCss: "",
  });
  assert.equal(XMLValidator.validate(svg), true);
  assert.match(svg, /prefers-reduced-motion: reduce/);
  assert.match(svg, /viewBox="0 0 720 200"/);
});

test("appear uses one whole-timeline animation with no start delay", () => {
  const g = appear(4.02, "<text>x</text>");
  assert.match(g, /^<g style="animation:a402 12s linear both"><text>x<\/text><\/g>$/);
  assert.doesNotMatch(g, /animation-delay/);
});

test("appearCss writes reveal keyframes for each name used once", () => {
  const css = appearCss(appear(6, "a") + appear(6, "b") + appear(3, "c"));
  assert.equal(css.match(/@keyframes/g).length, 2);
  assert.match(css, /@keyframes a600\{0%,50\.000%\{opacity:0\}50\.001%,100%\{opacity:1\}\}/);
  assert.match(css, /@keyframes a300\{0%,25\.000%\{opacity:0\}25\.001%,100%\{opacity:1\}\}/);
});

test("cursor reveals with the timeline animation and then blinks", () => {
  const c = cursor({ x: 10, y: 50, at: 8.54, p: PALETTES.dark });
  assert.match(c, /animation:a854 12s linear both,blink 1s step-end 8\.54s infinite/);
});

test("frame includes keyframes for reveals in its body and no short pop-in", () => {
  const svg = frame({
    theme: "dark", height: 200, title: "t",
    status: { left: "0:zsh", mid: [], right: "r" },
    body: appear(1.5, `<text x="20" y="60">hi</text>`), css: "", fontCss: "",
  });
  assert.match(svg, /@keyframes a150\{/);
  assert.doesNotMatch(svg, /\.01s/);
  assert.equal(XMLValidator.validate(svg), true);
});
