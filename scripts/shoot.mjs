// Renders README.md roughly as GitHub does and screenshots it, using the
// installed Chrome. Output: preview/shots/*.png (gitignored).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const readme = fs.readFileSync("README.md", "utf8");
const html = readme
  .split("\n\n")
  .map(b => b.startsWith("<picture>") ? b
    : `<p>${b.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>').replace(/\n- /g, "<br>• ").replace(/^- /, "• ")}</p>`)
  .join("\n");
const page = theme => `<!doctype html><meta charset="utf-8"><style>
body{margin:0;background:${theme === "dark" ? "#0d1117" : "#ffffff"};color:${theme === "dark" ? "#e6edf3" : "#1f2328"};
font:16px/1.5 -apple-system,"Segoe UI",Helvetica,Arial,sans-serif}
article{max-width:830px;margin:24px auto;padding:0 16px}a{color:${theme === "dark" ? "#4493f8" : "#0969da"}}
img{max-width:100%;display:block;margin:0 0 16px}</style><article>${html}</article>`;

fs.mkdirSync("preview/shots", { recursive: true });
// The pages live in preview/, so the README's assets/... paths need a copy there.
fs.cpSync("assets", "preview/assets", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const shots = [
  ["dark", 1280, 8800], ["light", 1280, 8800], ["dark", 400, 8800], ["light", 400, 8800], ["dark", 1280, 2600],
];
for (const [theme, width, wait] of shots) {
  fs.writeFileSync(`preview/${theme}.html`, page(theme));
  const ctx = await browser.newContext({ colorScheme: theme, viewport: { width, height: 900 } });
  const tab = await ctx.newPage();
  await tab.goto("file://" + path.resolve(`preview/${theme}.html`));
  await tab.waitForTimeout(wait);
  const file = `preview/shots/${theme}-${width}-${wait < 5000 ? "mid" : "final"}.png`;
  await tab.screenshot({ path: file, fullPage: true });
  console.log(file);
  await ctx.close();
}
await browser.close();
