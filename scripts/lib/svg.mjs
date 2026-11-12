import { PALETTES } from "./palette.mjs";

export const WIDTH = 720, FONT = 15, ADV = 9, LINE = 24, PAD = 20, BAR = 32, STATUS = 26;
// Seconds; every card finishes well before this.
export const TIMELINE = 12;

export const BASE_CSS =
  `text{font-family:JBM,ui-monospace,Consolas,monospace;font-size:${FONT}px;white-space:pre}` +
  "@keyframes blink{50%{opacity:0}}" +
  "@media (prefers-reduced-motion: reduce){*{animation:none!important}}";

export function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function spans(parts, p) {
  return parts.map(([t, role]) => `<tspan fill="${p[role]}">${esc(t)}</tspan>`).join("");
}

export const PROMPT_CHARS = host => host.length + 5;

export function promptText(host, p) {
  return spans([[host, "green"], [" ~ $ ", "dim"]], p);
}

// Name of the keyframes that reveal an element `at` seconds into the timeline.
export const appearName = at => `a${Math.round(at * 100)}`;

// One animation spanning the whole timeline, with the reveal moment inside the
// keyframes. A short animation after a long delay is not reliably shown when
// the SVG is displayed through an <img> tag.
export function appear(at, inner) {
  return `<g style="animation:${appearName(at)} ${TIMELINE}s linear both">${inner}</g>`;
}

// Keyframes for every reveal animation referenced in `body`.
export function appearCss(body) {
  const names = [...new Set([...body.matchAll(/animation:(a\d+) /g)].map(m => m[1]))];
  return names.map(name => {
    const pct = (Number(name.slice(1)) / 100 / TIMELINE) * 100;
    return `@keyframes ${name}{0%,${pct.toFixed(3)}%{opacity:0}${(pct + 0.001).toFixed(3)}%,100%{opacity:1}}`;
  }).join("");
}

// The cover sits just right of the text, which is the final frame. Its
// animation starts it over the text and steps it right one character at a time.
export function typed({ id, x, y, text, at, dur, p }) {
  const n = [...text].length;
  const w = n * ADV;
  const svg =
    `<text x="${x}" y="${y}" fill="${p.text}">${esc(text)}</text>` +
    `<rect class="cv" data-n="${n}" x="${x + w}" y="${y - 17}" width="${w}" height="${LINE}" fill="${p.bg}" ` +
    `style="animation:${id} ${dur.toFixed(2)}s steps(${n}) ${at.toFixed(2)}s both"/>`;
  const css = `@keyframes ${id}{from{transform:translateX(-${w}px)}to{transform:none}}`;
  return { svg, css };
}

export function cursor({ x, y, at, p }) {
  return `<rect x="${x}" y="${y - 13}" width="${ADV}" height="17" fill="${p.amber}" ` +
    `style="animation:${appearName(at)} ${TIMELINE}s linear both,blink 1s step-end ${at.toFixed(2)}s infinite"/>`;
}

export function frame({ theme, height, title, status, body, css, fontCss }) {
  const p = PALETTES[theme];
  const sy = height - STATUS;
  const left = `<rect x="0" y="${sy}" width="${status.left.length * 7.2 + 16}" height="${STATUS}" fill="${p.amber}"/>` +
    `<text x="8" y="${sy + 17}" font-size="12" font-weight="700" fill="${p.onAmber}" style="font-size:12px">${esc(status.left)}</text>`;
  let mx = status.left.length * 7.2 + 28;
  const mid = status.mid.map(t => {
    const s = `<text x="${mx}" y="${sy + 17}" fill="${p.dim}" style="font-size:12px">${esc(t)}</text>`;
    mx += t.length * 7.2 + 16;
    return s;
  }).join("");
  const right = `<text x="${WIDTH - 12}" y="${sy + 17}" text-anchor="end" fill="${p.amber}" style="font-size:12px">${esc(status.right)}</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" role="img" aria-label="${esc(title)}" xml:space="preserve">` +
    `<style>${fontCss}${BASE_CSS}${appearCss(body)}${css}</style>` +
    `<defs><clipPath id="win"><rect width="${WIDTH}" height="${height}" rx="10"/></clipPath>` +
    `<clipPath id="body"><rect x="0" y="${BAR}" width="${WIDTH}" height="${sy - BAR}"/></clipPath></defs>` +
    `<g clip-path="url(#win)">` +
    `<rect width="${WIDTH}" height="${height}" fill="${p.bg}"/>` +
    [20, 38, 56].map(cx => `<circle cx="${cx}" cy="16" r="5" fill="${p.dot}"/>`).join("") +
    `<text x="${WIDTH - 14}" y="20" text-anchor="end" fill="${p.dim}" style="font-size:12px">${esc(title)}</text>` +
    `<line x1="0" y1="${BAR}" x2="${WIDTH}" y2="${BAR}" stroke="${p.border}"/>` +
    `<g clip-path="url(#body)">${body}</g>` +
    `<rect x="0" y="${sy}" width="${WIDTH}" height="${STATUS}" fill="${p.chrome}"/>` +
    left + mid + right +
    `</g>` +
    `<rect x="0.5" y="0.5" width="${WIDTH - 1}" height="${height - 1}" rx="10" fill="none" stroke="${p.border}"/>` +
    `</svg>`;
}
