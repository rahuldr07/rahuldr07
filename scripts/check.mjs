import fs from "node:fs";
import { runChecks } from "./lib/checks.mjs";

const svgs = Object.fromEntries(fs.readdirSync("assets").filter(f => f.endsWith(".svg"))
  .map(f => [f, fs.readFileSync(`assets/${f}`, "utf8")]));
const problems = runChecks({
  svgs,
  profile: JSON.parse(fs.readFileSync("data/profile.json", "utf8")),
  readme: fs.readFileSync("README.md", "utf8"),
});
if (problems.length) {
  console.error(`Check failed:\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`Check passed (${Object.keys(svgs).length} SVGs).`);
