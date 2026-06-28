import { C } from "../theme";

/* ---------------------------------------------------------------------------
 * Shared section header
 * ------------------------------------------------------------------------- */
export default function SectionHeader({ text }) {
  return (
    <div
      style={{
        color: C.green,
        fontWeight: 700,
        letterSpacing: 1,
        marginBottom: 14,
        borderBottom: `1px dashed ${C.border}`,
        paddingBottom: 8,
      }}
    >
      {text}
      <span style={{ animation: "blink 1s step-end infinite", color: C.green }}>
        ▋
      </span>
    </div>
  );
}
