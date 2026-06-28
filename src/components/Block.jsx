import { C } from "../theme";

/* ---------------------------------------------------------------------------
 * Render a content block (study guide)
 * ------------------------------------------------------------------------- */
export default function Block({ block }) {
  if (block.h) {
    return (
      <div
        style={{
          color: C.cyan,
          marginTop: 14,
          marginBottom: 6,
          fontWeight: 700,
        }}
      >
        <span style={{ color: C.comment }}>### </span>
        {block.h}
      </div>
    );
  }
  if (block.p) {
    return (
      <p style={{ margin: "6px 0", color: C.text }}>{block.p}</p>
    );
  }
  if (block.ul) {
    return (
      <ul style={{ margin: "6px 0", paddingLeft: 18 }}>
        {block.ul.map((li, i) => (
          <li key={i} style={{ margin: "3px 0" }}>
            <span style={{ color: C.green }}>▸ </span>
            <span>{li}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (block.code) {
    return (
      <pre
        style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderLeft: `2px solid ${C.green}`,
          padding: 10,
          overflowX: "auto",
          margin: "8px 0",
          color: C.green,
          fontSize: 12.5,
          whiteSpace: "pre",
        }}
      >
        {block.code}
      </pre>
    );
  }
  if (block.kv) {
    return (
      <div style={{ margin: "6px 0" }}>
        {block.kv.map(([k, v], i) => (
          <div key={i} style={{ display: "flex", gap: 8, margin: "2px 0" }}>
            <span style={{ color: C.yellow, minWidth: 160 }}>{k}</span>
            <span style={{ color: C.comment }}>::</span>
            <span style={{ flex: 1 }}>{v}</span>
          </div>
        ))}
      </div>
    );
  }
  if (block.table) {
    const { head, rows } = block.table;
    return (
      <div style={{ overflowX: "auto", margin: "8px 0" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            fontSize: 12.5,
          }}
        >
          <thead>
            <tr>
              {head.map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "4px 8px",
                    color: C.cyan,
                    borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "4px 8px",
                      borderBottom: `1px solid ${C.border}`,
                      color: ci === 0 ? C.green : C.text,
                      verticalAlign: "top",
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
}
