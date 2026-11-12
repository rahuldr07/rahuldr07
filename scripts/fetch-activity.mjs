// Reads the public contribution calendar and writes data/activity.json.
// On any problem it keeps the last file, so a bad day never blanks the card.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { monthlyTotals } from "./lib/sparkline.mjs";

const USER = "rahuldr07";
const OUT = "data/activity.json";

export function parseCalendar(html) {
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = /^(\d+) contribution/.exec(m[2]);
    counts.set(m[1], n ? Number(n[1]) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td[^>]*data-date="([\d-]+)"[^>]*>/g)) {
    const id = /id="([^"]+)"/.exec(m[0])?.[1];
    days.push({ date: m[1], count: counts.get(id) ?? 0 });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}

// Returns why the parsed calendar cannot be trusted, or null if it can.
export function unusable(days) {
  if (days.length < 300) return `Only ${days.length} days found; the page may have changed.`;
  if (days.every(d => d.count === 0)) return "Every day shows no contributions; the page may have changed.";
  return null;
}

async function main() {
  let html;
  try {
    const res = await fetch(`https://github.com/users/${USER}/contributions`, {
      headers: { "user-agent": `${USER} profile build` },
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.warn(`Could not read the calendar (${err.message}); keeping ${OUT}.`);
    return;
  }
  const days = parseCalendar(html);
  const problem = unusable(days);
  if (problem) {
    console.warn(`${problem} Keeping ${OUT}.`);
    return;
  }
  const data = {
    total: days.reduce((s, d) => s + d.count, 0),
    months: monthlyTotals(days),
  };
  const next = JSON.stringify(data) + "\n";
  const prev = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (next === prev) return console.log("Activity unchanged.");
  fs.writeFileSync(OUT, next);
  console.log(`Wrote ${OUT}: ${data.total} contributions.`);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
