import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { C, DOMAIN_COLORS } from "../theme";
import { DOMAINS } from "../data/domains";
import TermBar from "./TermBar";
import Block from "./Block";
import SectionHeader from "./SectionHeader";

/* ===========================================================================
 * STUDY MODE
 * ========================================================================= */
export default function StudyMode() {
  const [openDomain, setOpenDomain] = useState(1);
  const [openSection, setOpenSection] = useState({});

  const toggleSection = (dId, sIdx) => {
    const key = `${dId}-${sIdx}`;
    setOpenSection((p) => ({ ...p, [key]: !p[key] }));
  };

  return (
    <div style={{ animation: "fadein .2s ease" }}>
      <SectionHeader text="[ STUDY :: CCNA 200-301 v1.1 CONTENT GUIDE ]" />
      {DOMAINS.map((d) => {
        const color = DOMAIN_COLORS[d.num - 1];
        const open = openDomain === d.num;
        return (
          <div
            key={d.num}
            style={{
              border: `1px solid ${open ? color : C.border}`,
              marginBottom: 12,
              background: C.bgAlt,
            }}
          >
            <button
              onClick={() => setOpenDomain(open ? 0 : d.num)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                color: C.text,
                padding: "12px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                textAlign: "left",
              }}
            >
              {open ? (
                <ChevronDown size={16} color={color} />
              ) : (
                <ChevronRight size={16} color={C.comment} />
              )}
              <span style={{ color, fontWeight: 700, minWidth: 0 }}>
                [DOMAIN 0{d.num} :: {d.name.toUpperCase()}]
              </span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
                <TermBar value={d.weight} width={16} color={color} showPct={false} />
                <span style={{ color: C.yellow, minWidth: 42, textAlign: "right" }}>
                  {d.weight}%
                </span>
              </span>
            </button>

            {open && (
              <div style={{ padding: "0 14px 14px", animation: "fadein .2s ease" }}>
                <p style={{ color: C.comment, marginTop: 0 }}>
                  <span style={{ color: C.green }}>❯</span> {d.blurb}
                </p>
                {d.sections.map((s, sIdx) => {
                  const sOpen = !!openSection[`${d.num}-${sIdx}`];
                  return (
                    <div
                      key={sIdx}
                      style={{
                        border: `1px solid ${C.border}`,
                        marginBottom: 8,
                        background: C.bg,
                      }}
                    >
                      <button
                        onClick={() => toggleSection(d.num, sIdx)}
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          color: sOpen ? color : C.text,
                          padding: "9px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          textAlign: "left",
                        }}
                      >
                        <span style={{ color: C.comment }}>
                          {sOpen ? "▼" : "▶"}
                        </span>
                        <span style={{ color: C.green }}>$</span>
                        <span>{s.title}</span>
                      </button>
                      {sOpen && (
                        <div
                          style={{
                            padding: "0 14px 12px 30px",
                            borderTop: `1px solid ${C.border}`,
                            animation: "fadein .2s ease",
                          }}
                        >
                          {s.blocks.map((b, bi) => (
                            <Block key={bi} block={b} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
