import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";

test("font files are installed", () => {
  for (const w of ["Regular", "Bold"]) {
    assert.ok(existsSync(`node_modules/jetbrains-mono/fonts/webfonts/JetBrainsMonoNL-${w}.woff2`));
  }
});
