import { PALETTES } from "./palette.mjs";
import { PAD, BAR, LINE, ADV, STATUS, spans, promptText, PROMPT_CHARS, typed, appear, cursor, frame } from "./svg.mjs";

const PER_CHAR = 0.07, PAUSE = 0.35, GAP = 0.45, START = 0.4;

export function sessionTimeline(steps) {
  let t = START;
  const events = steps.map(s => {
    const typeAt = t + 0.15;
    const dur = [...s.cmd].length * PER_CHAR;
    const outAt = typeAt + dur + PAUSE;
    const e = { prompt: t, typeAt, dur, outAt };
    t = outAt + GAP;
    return e;
  });
  return { events, end: t };
}

export function renderSession(profile, theme, fontCss = "") {
  const p = PALETTES[theme];
  const { events, end } = sessionTimeline(profile.session);
  const tx = PAD + PROMPT_CHARS(profile.host) * ADV;
  let y = BAR + PAD + 14;
  let body = "", css = "";
  profile.session.forEach((step, i) => {
    const e = events[i];
    body += appear(e.prompt, `<text x="${PAD}" y="${y}">${promptText(profile.host, p)}</text>`);
    const t = typed({ id: `t${i}`, x: tx, y, text: step.cmd, at: e.typeAt, dur: e.dur, p });
    body += t.svg; css += t.css;
    y += LINE;
    for (const line of step.out) {
      if (line.big) {
        y += 6;
        body += appear(e.outAt, `<text x="${PAD}" y="${y}" style="font-size:26px;font-weight:700">${spans(line.spans, p)}</text>`);
        y += 32;
      } else {
        body += appear(e.outAt, `<text x="${PAD}" y="${y}">${spans(line.spans, p)}</text>`);
        y += LINE;
      }
    }
    y += 6;
  });
  body += appear(end, `<text x="${PAD}" y="${y}">${promptText(profile.host, p)}</text>`);
  body += cursor({ x: tx, y, at: end, p });
  const height = y + PAD + STATUS;
  return frame({ theme, height, title: "~/ — zsh", status: profile.sessionStatus, body, css, fontCss });
}

export function sessionAlt(profile) {
  const lines = profile.session.map(s =>
    `$ ${s.cmd} → ${s.out.map(o => o.spans.map(([t]) => t).join("").trim()).join(", ")}`);
  return `Terminal session. ${lines.join(". ")}.`;
}
