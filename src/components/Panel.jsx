import { C } from "../theme";

/* ---------------------------------------------------------------------------
 * Terminal-styled panel with ASCII corners
 * ------------------------------------------------------------------------- */
export default function Panel({ title, accent = C.cyan, children, style }) {
  return (
    <div
      style={{
        border: `1px solid ${C.border}`,
        background: C.bgAlt,
        marginBottom: 16,
        position: "relative",
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            borderBottom: `1px solid ${C.border}`,
            padding: "6px 12px",
            color: accent,
            fontSize: 12,
            letterSpacing: 1,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ color: C.comment }}>┌─</span>
          <span>{title}</span>
        </div>
      )}
      <div style={{ padding: 14 }}>{children}</div>
    </div>
  );
}
