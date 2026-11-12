import { XMLValidator } from "fast-xml-parser";
import { PALETTES, TEXT_ROLES, contrast } from "./palette.mjs";
import { ADV, TIMELINE } from "./svg.mjs";
import { hash8 } from "./readme.mjs";

export const VERIFIED = {
  'gocalc "100 degF in degC"': "340/9  ≈ 37.7777777778 degC",
  'gocalc "5 m + 3 s"': "cannot add length (m) and time (s)",
};
const MAX_BYTES = 60 * 1024;
const BANNED = ["spearheaded", "leveraged", "leveraging", "pivotal", "intricate", "showcasing", "synergy",
  "delve", "realm", "robust", "passionate", "results-driven", "detail-oriented", "cutting-edge", "seamless"];

const ANIMATION_SHAPES = [
  new RegExp(`^animation:a\\d+ ${TIMELINE}s linear both$`),
  new RegExp(`^animation:a\\d+ ${TIMELINE}s linear both,blink 1s step-end \\d+\\.\\d\\ds infinite$`),
  /^animation:t\d+ \d+\.\d\ds steps\(\d+\) \d+\.\d\ds both$/,
];

export function runChecks({ svgs, profile, readme }) {
  const problems = [];
  for (const [name, svg] of Object.entries(svgs)) {
    if (XMLValidator.validate(svg) !== true) problems.push(`${name}: not valid XML`);
    if (svg.includes("animation-delay")) problems.push(`${name}: uses a delayed pop-in, which <img> rendering drops`);
    for (const m of svg.matchAll(/style="(animation:[^"]*)"/g)) {
      if (!ANIMATION_SHAPES.some(re => re.test(m[1]))) problems.push(`${name}: unexpected animation "${m[1]}"`);
    }
    for (const m of svg.matchAll(/animation:a(\d+) /g)) {
      if (Number(m[1]) / 100 >= TIMELINE) problems.push(`${name}: reveal at ${m[1] / 100}s is past the ${TIMELINE}s timeline`);
    }
    const bytes = Buffer.byteLength(svg);
    if (bytes > MAX_BYTES) problems.push(`${name}: ${(bytes / 1024).toFixed(1)} KB, over 60 KB`);
    for (const m of svg.matchAll(/class="cv" data-n="(\d+)"[^>]*? width="([\d.]+)"/g)) {
      if (Number(m[2]) !== Number(m[1]) * ADV) problems.push(`${name}: cover width ${m[2]} for ${m[1]} chars`);
    }
  }
  for (const step of profile.session) {
    const want = VERIFIED[step.cmd];
    if (step.cmd.startsWith("gocalc") && !want) problems.push(`go-calc: no verified output for ${step.cmd}`);
    if (want) {
      const got = step.out.map(o => o.spans.map(([t]) => t).join("")).join("\n");
      if (!got.startsWith(want)) problems.push(`go-calc: "${step.cmd}" shows "${got}", expected "${want}"`);
    }
  }
  for (const [theme, p] of Object.entries(PALETTES)) {
    for (const role of TEXT_ROLES) {
      if (contrast(p[role], p.bg) < 4.5) problems.push(`${theme}.${role}: contrast below 4.5`);
    }
  }
  if ((readme.match(/<picture>/g) ?? []).length !== 2) problems.push("README: expected 2 <picture> blocks");
  if (/<img(?![^>]*alt="[^"]+")/.test(readme)) problems.push("README: image without alt text");
  for (const w of BANNED) if (new RegExp(`\\b${w}\\b`, "i").test(readme)) problems.push(`README: banned word "${w}"`);
  for (const m of readme.matchAll(/assets\/([a-z-]+\.svg)\?v=([0-9a-z]+)/g)) {
    const [, file, hash] = m;
    if (!svgs[file]) problems.push(`README: references missing asset ${file}`);
    else if (hash8(svgs[file]) !== hash) problems.push(`README: stale version stamp for ${file}`);
  }
  return problems;
}
