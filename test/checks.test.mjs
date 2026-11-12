import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runChecks } from "../scripts/lib/checks.mjs";
import { hash8 } from "../scripts/lib/readme.mjs";
import { renderSession } from "../scripts/lib/session.mjs";

const profile = JSON.parse(readFileSync("data/profile.json", "utf8"));
const good = { "session-dark.svg": renderSession(profile, "dark") };
const readme = `<picture></picture><img alt="a"><picture></picture><img alt="b">`;

test("clean input passes", () => {
  assert.deepEqual(runChecks({ svgs: good, profile, readme }), []);
});

test("drifted go-calc output is caught", () => {
  const bad = structuredClone(profile);
  bad.session[2].out[0].spans[0][0] = "cannot add these";
  assert.ok(runChecks({ svgs: good, profile: bad, readme }).some(p => p.includes("go-calc")));
});

test("wrong cover width, oversize, broken XML and banned words are caught", () => {
  const svgs = {
    "a.svg": good["session-dark.svg"].replace(/data-n="6" (x="[^"]+" y="[^"]+") width="54"/, 'data-n="6" $1 width="50"'),
    "b.svg": "<svg><g></svg>",
    "c.svg": "<svg>" + "x".repeat(62000) + "</svg>",
  };
  const problems = runChecks({ svgs, profile, readme: readme + " robust " });
  for (const word of ["cover", "XML", "KB", "banned"]) {
    assert.ok(problems.some(p => p.includes(word)), `missing ${word}: ${problems.join(" | ")}`);
  }
});

test("delayed pop-in animations are rejected", () => {
  const svgs = { "d.svg": `<svg><g style="animation-delay:4s"><text>x</text></g></svg>` };
  assert.ok(runChecks({ svgs, profile, readme }).some(p => p.includes("pop-in")));
});

test("unexpected animation shapes are rejected", () => {
  const svgs = { "x.svg": `<svg><g style="animation:pop .01s step-end 4s both"><text>x</text></g></svg>` };
  assert.ok(runChecks({ svgs, profile, readme }).some(p => p.includes("unexpected animation")));
});

test("a reveal past the timeline is rejected", () => {
  const svgs = { "x.svg": `<svg><g style="animation:a1300 12s linear both"><text>x</text></g></svg>` };
  assert.ok(runChecks({ svgs, profile, readme }).some(p => p.includes("past the 12s timeline")));
});

test("README version stamps must match the assets", () => {
  const svg = good["session-dark.svg"];
  const ok = `<picture></picture><img alt="a" src="assets/session-dark.svg?v=${hash8(svg)}"><picture></picture><img alt="b">`;
  assert.deepEqual(runChecks({ svgs: good, profile, readme: ok }), []);
  const stale = ok.replace(/\?v=[0-9a-f]{8}/, "?v=00000000");
  assert.ok(runChecks({ svgs: good, profile, readme: stale }).some(p => p.includes("stale version stamp")));
  const missing = ok.replace("session-dark.svg", "nope-dark.svg");
  assert.ok(runChecks({ svgs: good, profile, readme: missing }).some(p => p.includes("missing asset")));
});
