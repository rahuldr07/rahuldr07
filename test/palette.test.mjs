import { test } from "node:test";
import assert from "node:assert/strict";
import { PALETTES, TEXT_ROLES, contrast } from "../scripts/lib/palette.mjs";

test("contrast of black on white is 21", () => {
  assert.equal(Math.round(contrast("#000000", "#ffffff")), 21);
});

test("every text role reaches 4.5:1 in both themes", () => {
  for (const [name, p] of Object.entries(PALETTES)) {
    for (const role of TEXT_ROLES) {
      assert.ok(contrast(p[role], p.bg) >= 4.5, `${name}.${role} = ${contrast(p[role], p.bg).toFixed(2)}`);
    }
    assert.ok(contrast(p.onAmber, p.amber) >= 4.5, `${name} status bar`);
    for (const role of ["dim", "amber"]) {
      assert.ok(contrast(p[role], p.chrome) >= 4.5, `${name}.${role} on chrome = ${contrast(p[role], p.chrome).toFixed(2)}`);
    }
  }
});
