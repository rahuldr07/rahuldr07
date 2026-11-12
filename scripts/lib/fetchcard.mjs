import { PALETTES } from "./palette.mjs";
import { barHeights } from "./sparkline.mjs";
import { PAD, BAR, LINE, ADV, STATUS, spans, promptText, PROMPT_CHARS, typed, appear, cursor, frame } from "./svg.mjs";

export const ART = [
  "██████  ██████  ",
  "██   ██ ██   ██ ",
  "██   ██ ██████  ",
  "██   ██ ██   ██ ",
  "██████  ██   ██ ",
  "                ",
];
export const ART_ROW = 19;

// The solid cells of ART as merged rectangles, drawn twice: a dimmed copy offset
// down and right as a shadow, then the letters on top. Blank cells in ART are
// not drawn.
function artSvg(x, top, p) {
  let cells = "";
  ART.forEach((line, row) => {
    const chars = [...line];
    let col = 0;
    while (col < chars.length) {
      if (chars[col] !== "█") { col += 1; continue; }
      let end = col;
      while (chars[end] === "█") end += 1;
      cells += `<rect x="${x + col * ADV}" y="${top - 15 + row * ART_ROW}" width="${(end - col) * ADV}" height="${ART_ROW}"/>`;
      col = end;
    }
  });
  // crispEdges snaps the stacked cells to whole pixels, so no seams show when
  // the image is scaled by a fractional factor.
  return `<g fill="${p.amber}" fill-opacity="0.28" transform="translate(4 4)" shape-rendering="crispEdges">${cells}</g>` +
    `<g fill="${p.amber}" shape-rendering="crispEdges">${cells}</g>`;
}

const SWATCH_ROLES = ["red", "green", "amber", "dim", "text", "strong"];
const fmt = n => n.toLocaleString("en-US");

export function renderFetch(profile, activity, theme, fontCss = "") {
  const p = PALETTES[theme];
  const tx = PAD + PROMPT_CHARS(profile.host) * ADV;
  let y = BAR + PAD + 14;
  const typeAt = 0.45, dur = 6 * 0.07, blockAt = typeAt + dur + 0.35;
  let body = appear(0.3, `<text x="${PAD}" y="${y}">${promptText(profile.host, p)}</text>`);
  const t = typed({ id: "t0", x: tx, y, text: "dfetch", at: typeAt, dur, p });
  body += t.svg;
  y += LINE + 6;

  const top = y;
  const art = artSvg(PAD, top, p);
  const rx = PAD + [...ART[0]].length * ADV + 28;
  const [user, at, place] = profile.fetch.title;
  let ry = top;
  let right = `<text x="${rx}" y="${ry}" style="font-weight:700">${spans([[user, "strong"], [at, "dim"], [place, "strong"]], p)}</text>`;
  ry += LINE;
  right += `<text x="${rx}" y="${ry}" fill="${p.dim}">${"─".repeat(user.length + at.length + place.length)}</text>`;
  for (const [k, v] of profile.fetch.rows) {
    ry += LINE;
    right += `<text x="${rx}" y="${ry}">${spans([[k.padEnd(6, " "), "amber"], [v, "text"]], p)}</text>`;
  }
  ry += LINE - 6;
  right += SWATCH_ROLES.map((role, i) =>
    `<rect x="${rx + i * 22}" y="${ry - 6}" width="22" height="12" fill="${p[role]}"/>`).join("");
  body += appear(blockAt, art + right);

  y = ry + LINE + 10;
  const sparkAt = blockAt + 0.5;
  const barsX = PAD + "last 12 months ".length * ADV;
  const bars = barHeights(activity.months).map((h, i) =>
    `<rect x="${barsX + i * ADV + 1}" y="${y + 2 - h}" width="${ADV - 2}" height="${h}" fill="${p.green}"/>`).join("");
  body += appear(sparkAt, `<text x="${PAD}" y="${y}">${spans([
    ["last 12 months ", "dim"], [" ".repeat(activity.months.length), "text"],
    [`  ${fmt(activity.total)}`, "amber"], [" contributions", "dim"],
  ], p)}</text>${bars}`);
  y += LINE;
  const end = sparkAt + 0.5;
  body += appear(end, `<text x="${PAD}" y="${y}">${promptText(profile.host, p)}</text>`);
  body += cursor({ x: tx, y, at: end, p });

  const height = y + PAD + STATUS;
  return frame({ theme, height, title: "~/ — zsh", status: profile.fetchStatus, body, css: t.css, fontCss });
}

export function fetchAlt(profile, activity) {
  const rows = profile.fetch.rows.map(([k, v]) => `${k}: ${v}`).join(", ");
  return `Terminal card for ${profile.fetch.title.join("")}. ${rows}. ${fmt(activity.total)} contributions in the last 12 months.`;
}
