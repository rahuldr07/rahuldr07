export const PALETTES = {
  dark: {
    bg: "#0b0c0a", chrome: "#16150f", border: "#2b2a22", dot: "#33322a",
    text: "#d8d4c2", strong: "#f3efe0", amber: "#ffb224", green: "#a6d189",
    red: "#ff7a59", dim: "#8d8975", onAmber: "#0b0c0a",
  },
  light: {
    bg: "#faf8f1", chrome: "#efebdf", border: "#d9d4c3", dot: "#d0cab7",
    text: "#2b2a22", strong: "#14130f", amber: "#985800", green: "#3f7a1f",
    red: "#c2410c", dim: "#6b6756", onAmber: "#faf8f1",
  },
};

export const TEXT_ROLES = ["text", "strong", "amber", "green", "red", "dim"];

function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
