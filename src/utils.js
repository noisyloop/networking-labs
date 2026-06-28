/* ---------------------------------------------------------------------------
 * Small shared utilities
 * ------------------------------------------------------------------------- */

// Defensive clamp — keeps any computed width/percentage in [0,100].
export const clampPct = (n) =>
  Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

export const pad2 = (n) => String(n).padStart(2, "0");

export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

// Stable shallow array compare for multi-select grading.
export function sameSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}
