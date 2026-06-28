import { C } from "../theme";
import { clampPct } from "../utils";

/* ---------------------------------------------------------------------------
 * btop-style block progress bar
 * ------------------------------------------------------------------------- */
export default function TermBar({ value, width = 24, color = C.green, showPct = true }) {
  const pct = clampPct(value);
  const filled = Math.round((pct / 100) * width);
  const empty = Math.max(0, width - filled);
  return (
    <span style={{ whiteSpace: "nowrap", fontFamily: "inherit" }}>
      <span style={{ color }}>{"█".repeat(filled)}</span>
      <span style={{ color: C.border }}>{"░".repeat(empty)}</span>
      {showPct && (
        <span style={{ color: C.comment, marginLeft: 8 }}>
          {pct.toFixed(0)}%
        </span>
      )}
    </span>
  );
}
