import fs from "node:fs";
import { renderSession, sessionAlt } from "./lib/session.mjs";
import { renderFetch, fetchAlt } from "./lib/fetchcard.mjs";
import { textOf, fontCss } from "./lib/font.mjs";
import { hash8, renderReadme } from "./lib/readme.mjs";

const profile = JSON.parse(fs.readFileSync("data/profile.json", "utf8"));
const activity = JSON.parse(fs.readFileSync("data/activity.json", "utf8"));

const renderers = {
  session: (theme, css) => renderSession(profile, theme, css),
  fetch: (theme, css) => renderFetch(profile, activity, theme, css),
};

fs.mkdirSync("assets", { recursive: true });
const hashes = {};
for (const [name, render] of Object.entries(renderers)) {
  for (const theme of ["dark", "light"]) {
    const css = await fontCss(textOf(render(theme, "")));
    const svg = render(theme, css);
    fs.writeFileSync(`assets/${name}-${theme}.svg`, svg);
    hashes[`${name}-${theme}`] = hash8(svg);
    console.log(`assets/${name}-${theme}.svg  ${(Buffer.byteLength(svg) / 1024).toFixed(1)} KB`);
  }
}
fs.writeFileSync("README.md", renderReadme(profile, {
  hashes,
  alts: { session: sessionAlt(profile), fetch: fetchAlt(profile, activity) },
}));
console.log("README.md written.");
