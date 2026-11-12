import { readFile } from "node:fs/promises";
import subsetFont from "subset-font";

const DIR = new URL("../../node_modules/jetbrains-mono/fonts/webfonts/", import.meta.url);
const ASCII = Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join("");

export function textOf(svg) {
  return [...svg.matchAll(/>([^<>]+)</g)].map(m => m[1]).join("")
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
}

async function face(file, weight, chars) {
  const buf = await subsetFont(await readFile(new URL(file, DIR)), chars, { targetFormat: "woff2" });
  return `@font-face{font-family:JBM;font-weight:${weight};src:url(data:font/woff2;base64,${buf.toString("base64")}) format("woff2")}`;
}

export async function fontCss(text) {
  const chars = [...new Set(ASCII + text)].join("");
  return (await face("JetBrainsMonoNL-Regular.woff2", 400, chars)) +
         (await face("JetBrainsMonoNL-Bold.woff2", 700, chars));
}
