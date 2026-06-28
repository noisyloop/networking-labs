import { useState, useMemo } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { C, DOMAIN_COLORS } from "../theme";
import { pad2 } from "../utils";
import { DOMAINS } from "../data/domains";
import { LABS } from "../data/labs";
import SectionHeader from "./SectionHeader";

/* ===========================================================================
 * LABS MODE
 * ========================================================================= */
export default function LabsMode({ completedLabs, toggleLab }) {
  const [openLab, setOpenLab] = useState(null);
  const byDomain = useMemo(() => {
    const map = {};
    LABS.forEach((l) => {
      (map[l.domain] = map[l.domain] || []).push(l);
    });
    return map;
  }, []);

  return (
    <div style={{ animation: "fadein .2s ease" }}>
      <SectionHeader
        text={`[ LABS :: ${completedLabs.length}/${LABS.length} COMPLETE ]`}
      />
      {DOMAINS.map((d) => {
        const labs = byDomain[d.num] || [];
        const color = DOMAIN_COLORS[d.num - 1];
        const done = labs.filter((l) => completedLabs.includes(l.id)).length;
        return (
          <div key={d.num} style={{ marginBottom: 18 }}>
            <div
              style={{
                color,
                marginBottom: 8,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontWeight: 700 }}>
                [D0{d.num} :: {d.name.toUpperCase()}]
              </span>
              <span style={{ color: C.comment }}>
                {done}/{labs.length} done
              </span>
            </div>
            {labs.map((lab) => {
              const isOpen = openLab === lab.id;
              const isDone = completedLabs.includes(lab.id);
              return (
                <div
                  key={lab.id}
                  style={{
                    border: `1px solid ${isOpen ? color : C.border}`,
                    marginBottom: 8,
                    background: C.bgAlt,
                  }}
                >
                  <button
                    onClick={() => setOpenLab(isOpen ? null : lab.id)}
                    style={{
                      width: "100%",
                      background: "transparent",
                      border: "none",
                      color: C.text,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textAlign: "left",
                    }}
                  >
                    {isDone ? (
                      <CheckCircle2 size={16} color={C.green} />
                    ) : (
                      <Circle size={16} color={C.comment} />
                    )}
                    <span style={{ color: C.comment }}>{lab.id}</span>
                    <span style={{ fontWeight: 600 }}>{lab.title}</span>
                    <span style={{ marginLeft: "auto", color: C.comment }}>
                      {isOpen ? "▼" : "▶"}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      style={{
                        padding: 14,
                        borderTop: `1px solid ${C.border}`,
                        animation: "fadein .2s ease",
                      }}
                    >
                      <LabBody lab={lab} />
                      <button
                        onClick={() => toggleLab(lab.id)}
                        style={{
                          marginTop: 14,
                          background: isDone ? C.bg : C.green,
                          color: isDone ? C.green : C.bg,
                          border: `1px solid ${C.green}`,
                          padding: "8px 16px",
                          fontWeight: 700,
                          letterSpacing: 1,
                        }}
                      >
                        {isDone ? "✓ COMPLETED — undo" : "[ MARK COMPLETE +50XP ]"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function LabBody({ lab }) {
  return (
    <div>
      <LabSub label="SCENARIO" color={C.cyan}>
        <p style={{ margin: "4px 0", color: C.text }}>{lab.scenario}</p>
        {lab.diagram && (
          <pre
            style={{
              background: C.bg,
              border: `1px solid ${C.border}`,
              padding: 10,
              overflowX: "auto",
              color: C.cyan,
              fontSize: 12.5,
              whiteSpace: "pre",
              lineHeight: 1.35,
            }}
          >
            {lab.diagram}
          </pre>
        )}
      </LabSub>

      <LabSub label="OBJECTIVE" color={C.yellow}>
        <p style={{ margin: "4px 0" }}>{lab.objective}</p>
      </LabSub>

      <LabSub label="EXPLANATION" color={C.magenta}>
        <p style={{ margin: "4px 0", color: C.text }}>{lab.explain}</p>
      </LabSub>

      <LabSub label="CONFIGURATION" color={C.green}>
        {lab.steps.map((st, i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <div style={{ color: C.comment, marginBottom: 2 }}>
              <span style={{ color: C.green }}>{pad2(i + 1)}.</span> {st.desc}
            </div>
            <pre
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderLeft: `2px solid ${C.green}`,
                padding: 8,
                overflowX: "auto",
                color: C.green,
                fontSize: 12.5,
                whiteSpace: "pre",
                margin: 0,
              }}
            >
              {st.cmd}
            </pre>
          </div>
        ))}
      </LabSub>

      <LabSub label="VERIFICATION" color={C.cyan}>
        <pre
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderLeft: `2px solid ${C.cyan}`,
            padding: 8,
            overflowX: "auto",
            color: C.cyan,
            fontSize: 12.5,
            whiteSpace: "pre",
            margin: 0,
          }}
        >
          {lab.verify}
        </pre>
        {lab.expected && (
          <>
            <div style={{ color: C.comment, margin: "8px 0 2px" }}>
              expected output:
            </div>
            <pre
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                padding: 8,
                overflowX: "auto",
                color: C.text,
                fontSize: 12,
                whiteSpace: "pre",
                margin: 0,
              }}
            >
              {lab.expected}
            </pre>
          </>
        )}
      </LabSub>

      <LabSub label="COMMON MISTAKES" color={C.red}>
        <ul style={{ margin: "4px 0", paddingLeft: 18 }}>
          {lab.mistakes.map((m, i) => (
            <li key={i} style={{ margin: "3px 0" }}>
              <span style={{ color: C.red }}>✗ </span>
              {m}
            </li>
          ))}
        </ul>
      </LabSub>
    </div>
  );
}

function LabSub({ label, color, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ color, fontSize: 12, letterSpacing: 1, marginBottom: 2 }}>
        <span style={{ color: C.comment }}>──</span> {label}{" "}
        <span style={{ color: C.comment }}>──</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
