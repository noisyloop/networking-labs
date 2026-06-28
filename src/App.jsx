import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  Terminal,
  BookOpen,
  FlaskConical,
  ClipboardCheck,
  Activity,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Circle,
  Flag,
  AlertTriangle,
  Trophy,
  Zap,
  Clock,
  RotateCcw,
  Target,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

/* ============================================================================
 * CCNA 200-301 v1.1 :: Interactive Study Platform
 * Single-file React artifact. Arch/btop terminal aesthetic.
 * No external API calls, no persistence — all state in useState.
 * ==========================================================================*/

const C = {
  bg: "#1a1b26",
  bgAlt: "#16161e",
  panel: "#1f2335",
  cyan: "#7dcfff",
  green: "#9ece6a",
  yellow: "#e0af68",
  red: "#f7768e",
  magenta: "#bb9af7",
  orange: "#ff9e64",
  text: "#c0caf5",
  comment: "#565f89",
  border: "#2a2e42",
};

const DOMAIN_COLORS = [
  C.cyan,
  C.green,
  C.magenta,
  C.yellow,
  C.red,
  C.orange,
];

/* ---------------------------------------------------------------------------
 * Data — defined at bottom of file, filled inline (zero placeholders).
 * ------------------------------------------------------------------------- */
// DOMAINS, LABS, QUESTIONS are declared with `const` below.

/* ---------------------------------------------------------------------------
 * Small utilities
 * ------------------------------------------------------------------------- */

// Defensive clamp — keeps any computed width/percentage in [0,100].
const clampPct = (n) => Math.max(0, Math.min(100, Number.isFinite(n) ? n : 0));

const pad2 = (n) => String(n).padStart(2, "0");

function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

// Stable shallow array compare for multi-select grading.
function sameSet(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

/* ---------------------------------------------------------------------------
 * btop-style block progress bar
 * ------------------------------------------------------------------------- */
function TermBar({ value, width = 24, color = C.green, showPct = true }) {
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

/* ---------------------------------------------------------------------------
 * Terminal-styled panel with ASCII corners
 * ------------------------------------------------------------------------- */
function Panel({ title, accent = C.cyan, children, style }) {
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

/* ---------------------------------------------------------------------------
 * Render a content block (study guide)
 * ------------------------------------------------------------------------- */
function Block({ block }) {
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

/* ===========================================================================
 * STUDY MODE
 * ========================================================================= */
function StudyMode() {
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

/* ===========================================================================
 * LABS MODE
 * ========================================================================= */
function LabsMode({ completedLabs, toggleLab }) {
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

/* ===========================================================================
 * EXAM MODE
 * ========================================================================= */
const EXAM_SECONDS = 120 * 60;
const PASS_THRESHOLD = 0.825;

function ExamMode({ onFinish }) {
  // phase: 'config' | 'running' | 'result'
  const [phase, setPhase] = useState("config");
  const [domainFilter, setDomainFilter] = useState(0); // 0 = all
  const [pool, setPool] = useState([]);
  const [answers, setAnswers] = useState({}); // id -> answer
  const [flagged, setFlagged] = useState({}); // id -> bool
  const [cur, setCur] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(EXAM_SECONDS);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const buildPool = useCallback((filter) => {
    const list =
      filter === 0
        ? QUESTIONS
        : QUESTIONS.filter((q) => q.domain === filter);
    return list;
  }, []);

  const finalize = useCallback(
    (poolArg, answersArg) => {
      const usedPool = poolArg || pool;
      const usedAnswers = answersArg || answers;
      let correct = 0;
      const perDomain = {};
      usedPool.forEach((q) => {
        perDomain[q.domain] = perDomain[q.domain] || { c: 0, t: 0 };
        perDomain[q.domain].t += 1;
        const a = usedAnswers[q.id];
        let ok = false;
        if (q.type === "multi") {
          ok = sameSet(a, q.answer);
        } else if (q.type === "match") {
          ok =
            a &&
            q.answer.length === Object.keys(a).length &&
            q.answer.every((ai, i) => a[i] === ai);
        } else {
          ok = a === q.answer;
        }
        if (ok) {
          correct += 1;
          perDomain[q.domain].c += 1;
        }
      });
      const total = usedPool.length;
      const pct = total ? correct / total : 0;
      const score1000 = Math.round(pct * 1000);
      const res = {
        correct,
        total,
        pct,
        score1000,
        passed: pct >= PASS_THRESHOLD,
        perDomain,
        timeTaken: EXAM_SECONDS - secondsLeft,
        date: new Date().toISOString(),
        domainFilter,
      };
      setResult(res);
      setPhase("result");
      if (timerRef.current) clearInterval(timerRef.current);
      onFinish(res);
    },
    [pool, answers, secondsLeft, domainFilter, onFinish]
  );

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Auto-submit at 0
  useEffect(() => {
    if (phase === "running" && secondsLeft === 0) {
      finalize();
    }
  }, [secondsLeft, phase, finalize]);

  const start = () => {
    const p = buildPool(domainFilter);
    setPool(p);
    setAnswers({});
    setFlagged({});
    setCur(0);
    setSecondsLeft(EXAM_SECONDS);
    setResult(null);
    setPhase("running");
  };

  const answeredCount = Object.keys(answers).length;

  if (phase === "config") {
    return (
      <div style={{ animation: "fadein .2s ease" }}>
        <SectionHeader text="[ EXAM :: PRACTICE ENGINE ]" />
        <Panel title="exam.cfg">
          <p style={{ color: C.text }}>
            <span style={{ color: C.green }}>❯</span> Full bank ={" "}
            <span style={{ color: C.cyan }}>{QUESTIONS.length}</span> questions,
            weighted across all six domains. Timer ={" "}
            <span style={{ color: C.yellow }}>120:00</span>. Pass ≥{" "}
            <span style={{ color: C.green }}>825/1000 (82.5%)</span>.
          </p>
          <div style={{ marginTop: 14, marginBottom: 6, color: C.cyan }}>
            select scope:
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <ScopeBtn
              active={domainFilter === 0}
              onClick={() => setDomainFilter(0)}
              label={`FULL EXAM (${QUESTIONS.length}q)`}
              color={C.green}
            />
            {DOMAINS.map((d) => {
              const n = QUESTIONS.filter((q) => q.domain === d.num).length;
              return (
                <ScopeBtn
                  key={d.num}
                  active={domainFilter === d.num}
                  onClick={() => setDomainFilter(d.num)}
                  label={`D0${d.num} (${n}q)`}
                  color={DOMAIN_COLORS[d.num - 1]}
                />
              );
            })}
          </div>
          <button
            onClick={start}
            style={{
              marginTop: 18,
              background: C.green,
              color: C.bg,
              border: "none",
              padding: "10px 22px",
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            ❯ START EXAM
          </button>
        </Panel>
      </div>
    );
  }

  if (phase === "result" && result) {
    return (
      <ExamResult
        result={result}
        pool={pool}
        answers={answers}
        onRetake={() => setPhase("config")}
      />
    );
  }

  // running
  const q = pool[cur];
  const low = secondsLeft <= 300;
  return (
    <div style={{ animation: "fadein .2s ease" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
          marginBottom: 12,
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 10,
        }}
      >
        <span style={{ color: low ? C.red : C.green, fontWeight: 700 }}>
          <Clock size={13} style={{ verticalAlign: "-2px" }} /> TIME ::{" "}
          {formatClock(secondsLeft)}
        </span>
        <span style={{ color: C.comment }}>
          answered {answeredCount}/{pool.length}
        </span>
        <button
          onClick={() => {
            if (window.confirm("Submit exam now?")) finalize();
          }}
          style={{
            marginLeft: "auto",
            background: C.bg,
            color: C.yellow,
            border: `1px solid ${C.yellow}`,
            padding: "6px 14px",
            fontWeight: 700,
          }}
        >
          [ SUBMIT ]
        </button>
      </div>

      {/* question palette */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
          marginBottom: 14,
        }}
      >
        {pool.map((pq, i) => {
          const isAns =
            answers[pq.id] !== undefined &&
            !(Array.isArray(answers[pq.id]) && answers[pq.id].length === 0);
          const isFlag = flagged[pq.id];
          return (
            <button
              key={pq.id}
              onClick={() => setCur(i)}
              title={`Q${i + 1}`}
              style={{
                width: 26,
                height: 26,
                fontSize: 11,
                background: i === cur ? C.cyan : isAns ? "#243044" : C.bg,
                color: i === cur ? C.bg : isAns ? C.green : C.comment,
                border: `1px solid ${
                  isFlag ? C.yellow : i === cur ? C.cyan : C.border
                }`,
                padding: 0,
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {q && (
        <QuestionCard
          q={q}
          index={cur}
          total={pool.length}
          answer={answers[q.id]}
          flagged={!!flagged[q.id]}
          onAnswer={(val) =>
            setAnswers((p) => ({ ...p, [q.id]: val }))
          }
          onFlag={() =>
            setFlagged((p) => ({ ...p, [q.id]: !p[q.id] }))
          }
        />
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          onClick={() => setCur((c) => Math.max(0, c - 1))}
          disabled={cur === 0}
          style={navBtn(cur === 0)}
        >
          ◀ prev
        </button>
        <button
          onClick={() => setCur((c) => Math.min(pool.length - 1, c + 1))}
          disabled={cur === pool.length - 1}
          style={navBtn(cur === pool.length - 1)}
        >
          next ▶
        </button>
      </div>
    </div>
  );
}

const navBtn = (disabled) => ({
  background: C.bg,
  color: disabled ? C.comment : C.cyan,
  border: `1px solid ${disabled ? C.border : C.cyan}`,
  padding: "8px 18px",
  opacity: disabled ? 0.5 : 1,
});

function ScopeBtn({ active, onClick, label, color }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? color : C.bg,
        color: active ? C.bg : color,
        border: `1px solid ${color}`,
        padding: "7px 12px",
        fontWeight: 600,
        fontSize: 12,
      }}
    >
      {active ? "▣ " : "▢ "}
      {label}
    </button>
  );
}

function QuestionCard({ q, index, total, answer, flagged, onAnswer, onFlag }) {
  return (
    <Panel
      title={`Q${index + 1}/${total} :: DOMAIN 0${q.domain}${
        q.type === "multi" ? " :: SELECT ALL THAT APPLY" : ""
      }${q.type === "match" ? " :: MATCH PAIRS" : ""}`}
      accent={DOMAIN_COLORS[q.domain - 1]}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <p style={{ margin: 0, color: C.text, flex: 1, lineHeight: 1.55 }}>
          {q.q}
        </p>
        <button
          onClick={onFlag}
          title="flag for review"
          style={{
            background: "transparent",
            border: `1px solid ${flagged ? C.yellow : C.border}`,
            padding: 5,
          }}
        >
          <Flag size={14} color={flagged ? C.yellow : C.comment} />
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        {q.type === "match" ? (
          <MatchInput q={q} answer={answer} onAnswer={onAnswer} />
        ) : (
          q.options.map((opt, i) => {
            const selected =
              q.type === "multi"
                ? Array.isArray(answer) && answer.includes(i)
                : answer === i;
            const letter = String.fromCharCode(65 + i);
            return (
              <button
                key={i}
                onClick={() => {
                  if (q.type === "multi") {
                    const cur = Array.isArray(answer) ? answer : [];
                    onAnswer(
                      cur.includes(i)
                        ? cur.filter((x) => x !== i)
                        : [...cur, i]
                    );
                  } else {
                    onAnswer(i);
                  }
                }}
                style={{
                  display: "flex",
                  gap: 10,
                  width: "100%",
                  textAlign: "left",
                  background: selected ? "#243044" : C.bg,
                  color: C.text,
                  border: `1px solid ${selected ? C.cyan : C.border}`,
                  padding: "9px 12px",
                  marginBottom: 6,
                  alignItems: "flex-start",
                }}
              >
                <span style={{ color: selected ? C.cyan : C.comment }}>
                  {q.type === "multi" ? (selected ? "[x]" : "[ ]") : `${letter})`}
                </span>
                <span>{opt}</span>
              </button>
            );
          })
        )}
      </div>
    </Panel>
  );
}

// Click-to-assign matching (mobile-safe; no fragile native drag).
function MatchInput({ q, answer, onAnswer }) {
  const assign = answer || {};
  const [activeLeft, setActiveLeft] = useState(null);
  const used = Object.values(assign);

  const setPair = (leftIdx, rightIdx) => {
    const next = { ...assign };
    // remove rightIdx from any other slot (one-to-one)
    Object.keys(next).forEach((k) => {
      if (next[k] === rightIdx) delete next[k];
    });
    next[leftIdx] = rightIdx;
    onAnswer(next);
    setActiveLeft(null);
  };

  return (
    <div>
      <div style={{ color: C.comment, marginBottom: 8, fontSize: 12 }}>
        tap an item on the left, then tap its match on the right.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          {q.left.map((l, i) => {
            const active = activeLeft === i;
            const assigned = assign[i] !== undefined;
            return (
              <button
                key={i}
                onClick={() => setActiveLeft(active ? null : i)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: active ? C.cyan : assigned ? "#243044" : C.bg,
                  color: active ? C.bg : C.text,
                  border: `1px solid ${active ? C.cyan : C.border}`,
                  padding: "8px 10px",
                  marginBottom: 6,
                  fontSize: 12.5,
                }}
              >
                <span style={{ color: active ? C.bg : C.green }}>
                  {String.fromCharCode(65 + i)}){" "}
                </span>
                {l}
                {assigned && (
                  <span style={{ color: active ? C.bg : C.yellow }}>
                    {" "}
                    → {assign[i] + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div>
          {q.right.map((r, j) => {
            const isUsed = used.includes(j);
            return (
              <button
                key={j}
                onClick={() => activeLeft !== null && setPair(activeLeft, j)}
                disabled={activeLeft === null}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: isUsed ? "#1d2740" : C.bg,
                  color: C.text,
                  border: `1px solid ${C.border}`,
                  padding: "8px 10px",
                  marginBottom: 6,
                  fontSize: 12.5,
                  opacity: activeLeft === null ? 0.7 : 1,
                }}
              >
                <span style={{ color: C.cyan }}>{j + 1}) </span>
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ExamResult({ result, pool, answers, onRetake }) {
  const wrong = pool.filter((q) => {
    const a = answers[q.id];
    if (q.type === "multi") return !sameSet(a, q.answer);
    if (q.type === "match")
      return !(
        a &&
        q.answer.length === Object.keys(a).length &&
        q.answer.every((ai, i) => a[i] === ai)
      );
    return a !== q.answer;
  });

  const domainBars = DOMAINS.map((d) => {
    const pd = result.perDomain[d.num];
    const pct = pd && pd.t ? (pd.c / pd.t) * 100 : 0;
    return {
      name: `D${d.num}`,
      pct: Math.round(pct),
      color: DOMAIN_COLORS[d.num - 1],
      c: pd ? pd.c : 0,
      t: pd ? pd.t : 0,
    };
  }).filter((x) => x.t > 0);

  const weak = domainBars
    .filter((x) => x.pct < 80)
    .sort((a, b) => a.pct - b.pct);

  return (
    <div style={{ animation: "fadein .2s ease" }}>
      <SectionHeader text="[ EXAM :: SCORE REPORT ]" />
      <Panel
        title="result.summary"
        accent={result.passed ? C.green : C.red}
      >
        <div
          style={{
            display: "flex",
            gap: 24,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 42,
                fontWeight: 800,
                color: result.passed ? C.green : C.red,
                lineHeight: 1,
              }}
            >
              {result.score1000}
              <span style={{ fontSize: 18, color: C.comment }}>/1000</span>
            </div>
            <div style={{ color: C.comment }}>
              {result.correct}/{result.total} correct ·{" "}
              {(result.pct * 100).toFixed(1)}%
            </div>
          </div>
          <div
            style={{
              padding: "8px 18px",
              border: `2px solid ${result.passed ? C.green : C.red}`,
              color: result.passed ? C.green : C.red,
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            {result.passed ? "PASS" : "FAIL"}
          </div>
          <div style={{ color: C.comment }}>
            time taken :: {formatClock(result.timeTaken)}
          </div>
        </div>
      </Panel>

      <Panel title="per-domain.breakdown" accent={C.cyan}>
        {domainBars.map((b) => (
          <div
            key={b.name}
            style={{ display: "flex", gap: 10, alignItems: "center", margin: "4px 0" }}
          >
            <span style={{ color: b.color, minWidth: 36 }}>{b.name}</span>
            <TermBar value={b.pct} width={28} color={b.color} showPct={false} />
            <span style={{ color: C.comment, minWidth: 80 }}>
              {b.c}/{b.t} ({b.pct}%)
            </span>
          </div>
        ))}
        <div style={{ height: 200, marginTop: 14 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={domainBars}>
              <XAxis dataKey="name" stroke={C.comment} tick={{ fontSize: 11 }} />
              <YAxis
                domain={[0, 100]}
                stroke={C.comment}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  color: C.text,
                  fontFamily: "monospace",
                }}
                formatter={(v) => [`${v}%`, "score"]}
              />
              <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                {domainBars.map((b, i) => (
                  <Cell key={i} fill={b.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {weak.length > 0 && (
        <Panel title="weak-domains.alert" accent={C.red}>
          <div style={{ color: C.red, marginBottom: 6 }}>
            <AlertTriangle size={14} style={{ verticalAlign: "-2px" }} /> focus
            study here (&lt;80%):
          </div>
          {weak.map((w) => {
            const d = DOMAINS[parseInt(w.name.slice(1)) - 1];
            return (
              <div key={w.name} style={{ margin: "3px 0" }}>
                <span style={{ color: w.color }}>{w.name}</span>{" "}
                <span style={{ color: C.text }}>{d.name}</span>{" "}
                <span style={{ color: C.comment }}>— {w.pct}%</span>
              </div>
            );
          })}
        </Panel>
      )}

      <Panel title={`review.incorrect [${wrong.length}]`} accent={C.yellow}>
        {wrong.length === 0 ? (
          <p style={{ color: C.green }}>❯ flawless. nothing to review.</p>
        ) : (
          wrong.map((q) => (
            <ReviewItem key={q.id} q={q} given={answers[q.id]} />
          ))
        )}
      </Panel>

      <button
        onClick={onRetake}
        style={{
          background: C.green,
          color: C.bg,
          border: "none",
          padding: "10px 22px",
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        <RotateCcw size={14} style={{ verticalAlign: "-2px" }} /> RETAKE / NEW
        SCOPE
      </button>
    </div>
  );
}

function ReviewItem({ q, given }) {
  const renderGiven = () => {
    if (given === undefined) return "(unanswered)";
    if (q.type === "multi")
      return Array.isArray(given)
        ? given.map((i) => String.fromCharCode(65 + i)).join(", ") || "(none)"
        : "(none)";
    if (q.type === "match")
      return q.left
        .map((l, i) => `${String.fromCharCode(65 + i)}→${given[i] !== undefined ? given[i] + 1 : "?"}`)
        .join("  ");
    return String.fromCharCode(65 + given);
  };
  const renderCorrect = () => {
    if (q.type === "multi")
      return q.answer.map((i) => String.fromCharCode(65 + i)).join(", ");
    if (q.type === "match")
      return q.left
        .map((l, i) => `${String.fromCharCode(65 + i)}→${q.answer[i] + 1}`)
        .join("  ");
    return String.fromCharCode(65 + q.answer);
  };

  return (
    <div
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: "10px 0",
      }}
    >
      <div style={{ color: C.text, marginBottom: 6 }}>
        <span style={{ color: C.comment }}>[{q.id}]</span> {q.q}
      </div>
      {q.type === "match" ? (
        <div style={{ fontSize: 12.5, marginBottom: 6 }}>
          {q.left.map((l, i) => (
            <div key={i} style={{ color: C.comment }}>
              {String.fromCharCode(65 + i)}) {l} →{" "}
              <span style={{ color: C.green }}>{q.right[q.answer[i]]}</span>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 6 }}>
          {q.options.map((opt, i) => {
            const isCorrect =
              q.type === "multi"
                ? q.answer.includes(i)
                : q.answer === i;
            const isGiven =
              q.type === "multi"
                ? Array.isArray(given) && given.includes(i)
                : given === i;
            return (
              <div
                key={i}
                style={{
                  color: isCorrect ? C.green : isGiven ? C.red : C.comment,
                  fontSize: 12.5,
                }}
              >
                {isCorrect ? "✓" : isGiven ? "✗" : " "}{" "}
                {String.fromCharCode(65 + i)}) {opt}
              </div>
            );
          })}
        </div>
      )}
      <div style={{ fontSize: 12.5 }}>
        <span style={{ color: C.red }}>your answer: {renderGiven()}</span>
        {"   "}
        <span style={{ color: C.green }}>correct: {renderCorrect()}</span>
      </div>
      <div style={{ color: C.comment, fontSize: 12.5, marginTop: 4 }}>
        <span style={{ color: C.yellow }}>❯ </span>
        {q.explain}
      </div>
    </div>
  );
}

/* ===========================================================================
 * STATS MODE
 * ========================================================================= */
const LEVELS = [
  { lvl: 1, xp: 0, title: "net-noob" },
  { lvl: 2, xp: 150, title: "link-light" },
  { lvl: 3, xp: 350, title: "subnet-scout" },
  { lvl: 4, xp: 600, title: "vlan-voyager" },
  { lvl: 5, xp: 1000, title: "packet-wizard" },
  { lvl: 6, xp: 1500, title: "route-ranger" },
  { lvl: 7, xp: 2100, title: "ospf-oracle" },
  { lvl: 8, xp: 2800, title: "acl-architect" },
  { lvl: 9, xp: 3600, title: "daemon-tamer" },
  { lvl: 10, xp: 4500, title: "kernel-panic" },
  { lvl: 11, xp: 5500, title: "spanning-sage" },
  { lvl: 12, xp: 6800, title: "nat-ninja" },
  { lvl: 13, xp: 8200, title: "crypto-knight" },
  { lvl: 14, xp: 9800, title: "sudo-sensei" },
  { lvl: 15, xp: 12000, title: "arch-lord" },
];

function levelFor(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  const next = LEVELS.find((l) => l.xp > xp);
  return { cur, next };
}

function StatsMode({ completedLabs, examHistory, xp }) {
  const { cur, next } = levelFor(xp);
  const toNext = next ? next.xp - xp : 0;
  const span = next ? next.xp - cur.xp : 1;
  const into = xp - cur.xp;
  const lvlPct = next ? (into / span) * 100 : 100;

  // labs per domain
  const labsByDomain = DOMAINS.map((d) => {
    const all = LABS.filter((l) => l.domain === d.num);
    const done = all.filter((l) => completedLabs.includes(l.id)).length;
    return { d, all: all.length, done };
  });

  // per-domain mastery from exam history (best per-domain pct seen)
  const mastery = DOMAINS.map((d) => {
    let best = 0;
    let seen = false;
    examHistory.forEach((h) => {
      const pd = h.perDomain[d.num];
      if (pd && pd.t) {
        seen = true;
        best = Math.max(best, (pd.c / pd.t) * 100);
      }
    });
    return { d, pct: Math.round(best), seen };
  });

  const weakAreas = mastery
    .filter((m) => m.seen && m.pct < 80)
    .sort((a, b) => a.pct - b.pct);

  const masteryChart = mastery.map((m) => ({
    name: `D${m.d.num}`,
    pct: m.pct,
    color: DOMAIN_COLORS[m.d.num - 1],
  }));

  return (
    <div style={{ animation: "fadein .2s ease" }}>
      <SectionHeader text="[ STATS :: PROGRESS DASHBOARD ]" />

      <Panel title="rank" accent={C.magenta}>
        <div
          style={{
            display: "flex",
            gap: 18,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Award size={36} color={C.magenta} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: C.magenta }}>
              LVL {cur.lvl} :: {cur.title}
            </div>
            <div style={{ color: C.comment }}>
              <Zap size={12} style={{ verticalAlign: "-1px" }} /> {xp} XP total
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <TermBar value={lvlPct} width={30} color={C.magenta} showPct={false} />
            <div style={{ color: C.comment, fontSize: 12, marginTop: 4 }}>
              {next
                ? `${toNext} XP → LVL ${next.lvl} (${next.title})`
                : "MAX RANK — arch-lord achieved"}
            </div>
          </div>
        </div>
      </Panel>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 0,
          columnGap: 16,
        }}
      >
        <Panel title="labs.progress" accent={C.green}>
          <div style={{ marginBottom: 8, color: C.text }}>
            total :: {completedLabs.length}/{LABS.length}
          </div>
          <TermBar
            value={(completedLabs.length / LABS.length) * 100}
            width={28}
            color={C.green}
          />
          <div style={{ marginTop: 12 }}>
            {labsByDomain.map(({ d, all, done }) => (
              <div
                key={d.num}
                style={{ display: "flex", gap: 8, alignItems: "center", margin: "3px 0" }}
              >
                <span
                  style={{ color: DOMAIN_COLORS[d.num - 1], minWidth: 36 }}
                >
                  D{d.num}
                </span>
                <TermBar
                  value={all ? (done / all) * 100 : 0}
                  width={14}
                  color={DOMAIN_COLORS[d.num - 1]}
                  showPct={false}
                />
                <span style={{ color: C.comment }}>
                  {done}/{all}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="domain.mastery" accent={C.cyan}>
          {examHistory.length === 0 ? (
            <p style={{ color: C.comment }}>
              ❯ no exam data yet. take an exam to populate mastery.
            </p>
          ) : (
            <>
              {mastery.map((m) => (
                <div
                  key={m.d.num}
                  style={{ display: "flex", gap: 8, alignItems: "center", margin: "3px 0" }}
                >
                  <span
                    style={{ color: DOMAIN_COLORS[m.d.num - 1], minWidth: 36 }}
                  >
                    D{m.d.num}
                  </span>
                  <TermBar
                    value={m.pct}
                    width={20}
                    color={DOMAIN_COLORS[m.d.num - 1]}
                  />
                </div>
              ))}
              <div style={{ height: 160, marginTop: 12 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={masteryChart}>
                    <XAxis dataKey="name" stroke={C.comment} tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} stroke={C.comment} tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        background: C.bg,
                        border: `1px solid ${C.border}`,
                        color: C.text,
                        fontFamily: "monospace",
                      }}
                      formatter={(v) => [`${v}%`, "mastery"]}
                    />
                    <Bar dataKey="pct" radius={[2, 2, 0, 0]}>
                      {masteryChart.map((b, i) => (
                        <Cell key={i} fill={b.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </Panel>
      </div>

      <Panel title="exam.history" accent={C.yellow}>
        {examHistory.length === 0 ? (
          <p style={{ color: C.comment }}>❯ no attempts logged.</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr>
                {["#", "date", "scope", "score", "result", "time"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "4px 8px",
                      color: C.cyan,
                      borderBottom: `1px solid ${C.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {examHistory
                .slice()
                .reverse()
                .map((h, i) => (
                  <tr key={i}>
                    <td style={tdS}>{examHistory.length - i}</td>
                    <td style={tdS}>
                      {new Date(h.date).toLocaleDateString()}{" "}
                      {new Date(h.date).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={tdS}>
                      {h.domainFilter === 0 ? "FULL" : `D${h.domainFilter}`}
                    </td>
                    <td style={tdS}>
                      {h.score1000}/1000
                    </td>
                    <td
                      style={{
                        ...tdS,
                        color: h.passed ? C.green : C.red,
                        fontWeight: 700,
                      }}
                    >
                      {h.passed ? "PASS" : "FAIL"}
                    </td>
                    <td style={tdS}>{formatClock(h.timeTaken)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </Panel>

      <Panel title="recommendations" accent={C.red}>
        {weakAreas.length === 0 && examHistory.length === 0 && (
          <p style={{ color: C.comment }}>
            ❯ run a full practice exam to generate targeted recommendations.
          </p>
        )}
        {weakAreas.length === 0 && examHistory.length > 0 && (
          <p style={{ color: C.green }}>
            ❯ all tested domains ≥80%. solid. push for higher overall score.
          </p>
        )}
        {weakAreas.map((w) => (
          <div key={w.d.num} style={{ margin: "4px 0" }}>
            <Target
              size={13}
              color={DOMAIN_COLORS[w.d.num - 1]}
              style={{ verticalAlign: "-2px" }}
            />{" "}
            <span style={{ color: DOMAIN_COLORS[w.d.num - 1] }}>
              D{w.d.num} {w.d.name}
            </span>{" "}
            <span style={{ color: C.comment }}>
              — {w.pct}% — review STUDY §{w.d.name} & redo its labs.
            </span>
          </div>
        ))}
        {completedLabs.length < LABS.length && (
          <div style={{ margin: "8px 0 0", color: C.comment }}>
            <span style={{ color: C.yellow }}>❯</span>{" "}
            {LABS.length - completedLabs.length} labs remaining — each is +50 XP.
          </div>
        )}
      </Panel>
    </div>
  );
}

const tdS = {
  padding: "4px 8px",
  borderBottom: `1px solid ${C.border}`,
  color: C.text,
};

/* ---------------------------------------------------------------------------
 * Shared section header
 * ------------------------------------------------------------------------- */
function SectionHeader({ text }) {
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

/* ===========================================================================
 * ROOT APP
 * ========================================================================= */
const TABS = [
  { id: "study", label: "STUDY", icon: BookOpen },
  { id: "labs", label: "LABS", icon: FlaskConical },
  { id: "exam", label: "EXAM", icon: ClipboardCheck },
  { id: "stats", label: "STATS", icon: Activity },
];

export default function App() {
  const [tab, setTab] = useState("study");
  const [completedLabs, setCompletedLabs] = useState([]);
  const [examHistory, setExamHistory] = useState([]);

  const xp = useMemo(() => {
    const labXp = completedLabs.length * 50;
    const examXp = examHistory.reduce((acc, h) => acc + h.score1000, 0);
    return labXp + examXp;
  }, [completedLabs, examHistory]);

  const toggleLab = useCallback((id) => {
    setCompletedLabs((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : [...p, id]
    );
  }, []);

  const onExamFinish = useCallback((res) => {
    setExamHistory((p) => [...p, res]);
  }, []);

  const { cur } = levelFor(xp);

  return (
    <div
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "16px 16px 64px",
        minHeight: "100vh",
      }}
    >
      {/* top bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
          borderBottom: `1px solid ${C.border}`,
          paddingBottom: 10,
          marginBottom: 14,
        }}
      >
        <Terminal size={18} color={C.green} />
        <span style={{ color: C.green, fontWeight: 700 }}>
          ccna@200-301
        </span>
        <span style={{ color: C.comment }}>:~$</span>
        <span style={{ color: C.cyan }}>./study --v1.1</span>
        <span
          style={{
            marginLeft: "auto",
            display: "flex",
            gap: 14,
            alignItems: "center",
            color: C.comment,
            fontSize: 12.5,
          }}
        >
          <span>
            <Zap size={12} style={{ verticalAlign: "-1px" }} color={C.yellow} />{" "}
            <span style={{ color: C.yellow }}>{xp} XP</span>
          </span>
          <span>
            <Trophy
              size={12}
              style={{ verticalAlign: "-1px" }}
              color={C.magenta}
            />{" "}
            <span style={{ color: C.magenta }}>
              L{cur.lvl} {cur.title}
            </span>
          </span>
        </span>
      </header>

      {/* tabs styled as terminal window tabs */}
      <nav style={{ display: "flex", gap: 2, marginBottom: 16, flexWrap: "wrap" }}>
        {TABS.map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                background: active ? C.bgAlt : "transparent",
                color: active ? C.green : C.comment,
                border: `1px solid ${active ? C.border : "transparent"}`,
                borderBottom: active
                  ? `1px solid ${C.bgAlt}`
                  : `1px solid ${C.border}`,
                padding: "8px 16px",
                fontWeight: 700,
                letterSpacing: 1,
                position: "relative",
                top: 1,
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
        <div
          style={{
            flex: 1,
            borderBottom: `1px solid ${C.border}`,
            minWidth: 0,
          }}
        />
      </nav>

      <main>
        {tab === "study" && <StudyMode />}
        {tab === "labs" && (
          <LabsMode completedLabs={completedLabs} toggleLab={toggleLab} />
        )}
        {tab === "exam" && <ExamMode onFinish={onExamFinish} />}
        {tab === "stats" && (
          <StatsMode
            completedLabs={completedLabs}
            examHistory={examHistory}
            xp={xp}
          />
        )}
      </main>

      <footer
        style={{
          marginTop: 32,
          paddingTop: 12,
          borderTop: `1px solid ${C.border}`,
          color: C.comment,
          fontSize: 12,
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span>
          ❯ CCNA 200-301 v1.1 · {DOMAINS.length} domains · {LABS.length} labs ·{" "}
          {QUESTIONS.length} questions
        </span>
        <span>state :: in-memory only · no tracking · offline</span>
      </footer>
    </div>
  );
}

/* ===========================================================================
 * DATA :: STUDY CONTENT
 * ========================================================================= */
const DOMAINS = [
  {
    num: 1,
    name: "Network Fundamentals",
    weight: 20,
    blurb:
      "Models, addressing, subnetting, IPv6, Ethernet, media, wireless basics and virtualization — the bedrock the rest of the exam builds on.",
    sections: [
      {
        title: "OSI & TCP/IP models",
        blocks: [
          { p: "The OSI model is a 7-layer reference model. Memorize layers, PDUs, devices and example protocols. Mnemonic top→down: All People Seem To Need Data Processing." },
          {
            table: {
              head: ["#", "Layer", "PDU", "Devices", "Examples"],
              rows: [
                ["7", "Application", "Data", "Host", "HTTP, FTP, DNS, DHCP, SNMP"],
                ["6", "Presentation", "Data", "Host", "TLS/SSL, JPEG, ASCII, encryption"],
                ["5", "Session", "Data", "Host", "RPC, NetBIOS, session setup/teardown"],
                ["4", "Transport", "Segment", "Firewall (L4)", "TCP, UDP, ports"],
                ["3", "Network", "Packet", "Router, L3 switch", "IP, ICMP, OSPF"],
                ["2", "Data Link", "Frame", "Switch, bridge, NIC", "Ethernet, ARP, 802.1Q, STP"],
                ["1", "Physical", "Bits", "Hub, cables, repeater", "RJ45, fiber, signaling"],
              ],
            },
          },
          { h: "TCP/IP (DoD) model comparison" },
          {
            table: {
              head: ["TCP/IP layer", "Maps to OSI"],
              rows: [
                ["Application", "OSI 5-6-7"],
                ["Transport", "OSI 4"],
                ["Internet", "OSI 3"],
                ["Network Access / Link", "OSI 1-2"],
              ],
            },
          },
          { p: "Encapsulation adds headers going down the stack (data→segment→packet→frame→bits); de-encapsulation strips them going up." },
        ],
      },
      {
        title: "TCP vs UDP",
        blocks: [
          { p: "TCP is connection-oriented, reliable, ordered, flow-controlled. UDP is connectionless, best-effort, low overhead." },
          {
            table: {
              head: ["Attribute", "TCP", "UDP"],
              rows: [
                ["Header size", "20-60 bytes", "8 bytes"],
                ["Reliability", "ACKs, retransmit", "none"],
                ["Ordering", "sequence numbers", "none"],
                ["Flow control", "windowing", "none"],
                ["Use cases", "HTTP, SSH, SMTP, FTP", "DNS, DHCP, TFTP, VoIP, SNMP"],
              ],
            },
          },
          { h: "TCP header fields" },
          { ul: [
            "Source / Destination port (16 bits each)",
            "Sequence number / Acknowledgement number (32 bits)",
            "Data offset, Reserved, 9 control flags (URG, ACK, PSH, RST, SYN, FIN, ...)",
            "Window size, Checksum, Urgent pointer, Options",
          ] },
          { h: "3-way handshake (open)" },
          { code: "Client ──SYN (seq=x)──────────▶ Server\nClient ◀─SYN-ACK (seq=y,ack=x+1)─ Server\nClient ──ACK (ack=y+1)─────────▶ Server" },
          { h: "4-way teardown (close)" },
          { code: "A ──FIN──▶ B\nA ◀─ACK── B\nA ◀─FIN── B\nA ──ACK──▶ B   (TIME_WAIT on initiator)" },
        ],
      },
      {
        title: "IPv4 addressing",
        blocks: [
          { p: "32-bit address in dotted decimal. Classful ranges are legacy but still tested." },
          {
            table: {
              head: ["Class", "1st octet", "Default mask", "Purpose"],
              rows: [
                ["A", "1-126", "/8 255.0.0.0", "Large nets"],
                ["B", "128-191", "/16 255.255.0.0", "Medium nets"],
                ["C", "192-223", "/24 255.255.255.0", "Small nets"],
                ["D", "224-239", "n/a", "Multicast"],
                ["E", "240-255", "n/a", "Experimental"],
              ],
            },
          },
          { h: "Private ranges (RFC1918)" },
          { ul: [
            "10.0.0.0/8 (10.0.0.0 – 10.255.255.255)",
            "172.16.0.0/12 (172.16.0.0 – 172.31.255.255)",
            "192.168.0.0/16 (192.168.0.0 – 192.168.255.255)",
          ] },
          { kv: [
            ["127.0.0.0/8", "loopback"],
            ["169.254.0.0/16", "APIPA — auto-assigned when DHCP fails"],
            ["0.0.0.0", "this host / default route / unspecified"],
            ["255.255.255.255", "limited broadcast"],
          ] },
        ],
      },
      {
        title: "Subnetting deep dive (CIDR, VLSM, magic number)",
        blocks: [
          { p: "Hosts per subnet = 2^h − 2 (subtract network + broadcast). Subnets created = 2^s (bits borrowed)." },
          {
            table: {
              head: ["CIDR", "Mask", "Block", "Hosts"],
              rows: [
                ["/24", "255.255.255.0", "256", "254"],
                ["/25", "255.255.255.128", "128", "126"],
                ["/26", "255.255.255.192", "64", "62"],
                ["/27", "255.255.255.224", "32", "30"],
                ["/28", "255.255.255.240", "16", "14"],
                ["/29", "255.255.255.248", "8", "6"],
                ["/30", "255.255.255.252", "4", "2"],
                ["/31", "255.255.255.254", "2", "2* (RFC3021 ptp)"],
              ],
            },
          },
          { h: "Magic number method" },
          { p: "Magic number = 256 − (mask octet in the interesting position). Subnets increment by that number; broadcast = next network − 1." },
          { h: "Worked example: 192.168.10.0/26" },
          { code: "Mask 255.255.255.192  → magic = 256-192 = 64\nSubnet 0: 192.168.10.0    | hosts .1-.62   | bcast .63\nSubnet 1: 192.168.10.64   | hosts .65-.126 | bcast .127\nSubnet 2: 192.168.10.128  | hosts .129-.190| bcast .191\nSubnet 3: 192.168.10.192  | hosts .193-.254| bcast .255" },
          { h: "VLSM — match prefix to need" },
          { p: "Allocate largest subnets first. Example over 192.168.1.0/24: LAN-A needs 50 hosts → /26 (62). LAN-B 25 hosts → /27 (30). WAN link → /30 (2). Carve sequentially so blocks never overlap." },
        ],
      },
      {
        title: "IPv6",
        blocks: [
          { p: "128-bit address, hex, 8 groups of 16 bits. Rules: drop leading zeros in a group; one '::' collapses a run of all-zero groups." },
          { kv: [
            ["Global unicast", "2000::/3 — routable, public"],
            ["Unique local", "FC00::/7 (commonly FD00::/8) — private"],
            ["Link-local", "FE80::/10 — auto on every interface, not routed"],
            ["Multicast", "FF00::/8 (FF02::1 all nodes, FF02::2 all routers)"],
            ["Loopback", "::1/128"],
            ["Unspecified", "::/128"],
          ] },
          { h: "EUI-64" },
          { p: "Builds the 64-bit interface ID from a 48-bit MAC: split MAC in half, insert FFFE in the middle, then flip the 7th bit (U/L) of the first byte." },
          { code: "MAC  00:1A:2B:3C:4D:5E\nsplit  001A2B | 3C4D5E\ninsert 001A2B FFFE 3C4D5E\nflip 7th bit: 00→02\nEUI-64 = 021A:2BFF:FE3C:4D5E" },
          { h: "NDP (replaces ARP + more)" },
          { ul: [
            "NS / NA — Neighbor Solicitation/Advertisement (address resolution, DAD)",
            "RS / RA — Router Solicitation/Advertisement (gateway + prefix, SLAAC)",
            "Uses ICMPv6, multicast solicited-node FF02::1:FFxx:xxxx",
          ] },
          { p: "Dual stack runs IPv4 and IPv6 simultaneously. Tunneling (6to4, GRE, manual) carries IPv6 over an IPv4 network." },
        ],
      },
      {
        title: "Ethernet, framing & duplex",
        blocks: [
          { p: "MAC address = 48 bits: first 24 = OUI (vendor), last 24 = device. FF:FF:FF:FF:FF:FF = broadcast." },
          { h: "Ethernet II frame" },
          { code: "[Preamble 7][SFD 1][Dst MAC 6][Src MAC 6][Type 2][Payload 46-1500][FCS 4]" },
          { ul: [
            "CSMA/CD: legacy half-duplex collision handling (sense, transmit, detect, jam, back-off).",
            "Full duplex (modern switched links) = no collisions, CSMA/CD disabled.",
            "Duplex/speed mismatch → late collisions and slowness; set both ends the same or use autoneg on both.",
          ] },
        ],
      },
      {
        title: "Topologies, cabling & wireless basics",
        blocks: [
          { ul: [
            "Topologies: star (most common LAN), mesh/partial mesh (WAN redundancy), bus/ring (legacy), hub-and-spoke, three-tier (access/distribution/core) and collapsed core.",
          ] },
          { h: "Copper cable selection" },
          { kv: [
            ["Straight-through", "unlike devices: PC↔switch, switch↔router"],
            ["Crossover", "like devices: switch↔switch, PC↔PC, router↔router (Auto-MDIX often hides this)"],
            ["Rollover", "console cable PC↔router/switch console port"],
          ] },
          { p: "Fiber: single-mode (SMF, long haul, laser) vs multimode (MMF, shorter, LED). Immune to EMI, higher bandwidth/distance than copper." },
          { h: "Wireless 802.11" },
          {
            table: {
              head: ["Std", "Band", "Max (typical)"],
              rows: [
                ["802.11b", "2.4 GHz", "11 Mbps"],
                ["802.11g", "2.4 GHz", "54 Mbps"],
                ["802.11n (Wi-Fi 4)", "2.4/5 GHz", "600 Mbps"],
                ["802.11ac (Wi-Fi 5)", "5 GHz", "~3.5 Gbps"],
                ["802.11ax (Wi-Fi 6/6E)", "2.4/5/6 GHz", "~9.6 Gbps"],
              ],
            },
          },
          { ul: [
            "2.4 GHz non-overlapping channels: 1, 6, 11.",
            "SSID = network name; BSSID = AP radio MAC; BSS = one AP cell; ESS = multiple APs same SSID.",
          ] },
        ],
      },
      {
        title: "Virtualization & cloud",
        blocks: [
          { ul: [
            "VM = full guest OS on a hypervisor (Type 1 bare-metal e.g. ESXi; Type 2 hosted e.g. VirtualBox).",
            "Container = shares host kernel, packages app + deps; lighter and faster than a VM (Docker).",
            "vSwitch = software switch connecting VMs to physical NICs.",
            "NFV = network functions (router/firewall/LB) as software instances instead of dedicated hardware.",
          ] },
          { p: "Cloud service models: IaaS (VMs/network), PaaS (runtime/platform), SaaS (finished app). Deployment: public, private, hybrid." },
        ],
      },
    ],
  },
  {
    num: 2,
    name: "Network Access",
    weight: 20,
    blurb:
      "Switching: VLANs, trunking, spanning tree, EtherChannel, and the wireless LAN architecture / AP modes.",
    sections: [
      {
        title: "VLANs & inter-VLAN routing",
        blocks: [
          { p: "A VLAN is a logical Layer-2 broadcast domain. Devices in different VLANs need a Layer-3 device to communicate." },
          { code: "Switch(config)# vlan 10\nSwitch(config-vlan)# name SALES\nSwitch(config)# interface fa0/1\nSwitch(config-if)# switchport mode access\nSwitch(config-if)# switchport access vlan 10" },
          { h: "Inter-VLAN routing options" },
          { ul: [
            "Router-on-a-stick: one router subinterface per VLAN over an 802.1Q trunk.",
            "Layer-3 switch with SVIs (interface vlan X) — preferred, line-rate.",
          ] },
          { code: "! router-on-a-stick\nR(config)# interface g0/0.10\nR(config-subif)# encapsulation dot1Q 10\nR(config-subif)# ip address 10.0.10.1 255.255.255.0" },
          { h: "Voice VLAN" },
          { code: "interface fa0/5\n switchport mode access\n switchport access vlan 20\n switchport voice vlan 110" },
        ],
      },
      {
        title: "Trunking (802.1Q, native VLAN, DTP)",
        blocks: [
          { p: "A trunk carries multiple VLANs between switches. 802.1Q inserts a 4-byte tag with the VLAN ID. The native VLAN (default 1) is sent untagged." },
          { code: "Switch(config-if)# switchport mode trunk\nSwitch(config-if)# switchport trunk native vlan 99\nSwitch(config-if)# switchport trunk allowed vlan 10,20,30" },
          { ul: [
            "Native VLAN must match on both ends or CDP logs a mismatch; mismatch enables VLAN hopping.",
            "DTP auto-negotiates trunking (dynamic auto / desirable). Best practice: hard-set mode and 'switchport nonegotiate' to disable DTP.",
          ] },
        ],
      },
      {
        title: "Spanning Tree (STP/RSTP)",
        blocks: [
          { p: "STP (802.1D) prevents Layer-2 loops by blocking redundant paths. RSTP (802.1w) is the faster modern default." },
          { h: "Root bridge election" },
          { ul: [
            "Lowest Bridge ID wins. BID = priority (default 32768) + VLAN (extended system ID) + MAC.",
            "Tune with 'spanning-tree vlan 1 priority 4096' (multiples of 4096), or 'root primary'.",
          ] },
          { h: "Port roles (RSTP)" },
          { kv: [
            ["Root port", "best (lowest cost) path TO the root — one per non-root switch"],
            ["Designated port", "forwarding port per segment (all root-bridge ports)"],
            ["Alternate port", "backup path to root (blocking), replaces RP fast"],
            ["Backup port", "backup to a segment on the same switch (rare, hubs)"],
          ] },
          { h: "Port states" },
          {
            table: {
              head: ["802.1D", "802.1w (RSTP)"],
              rows: [
                ["Blocking / Listening", "Discarding"],
                ["Learning", "Learning"],
                ["Forwarding", "Forwarding"],
              ],
            },
          },
          { h: "Path cost (higher speed = lower cost)" },
          { kv: [
            ["10 Mbps", "100"],
            ["100 Mbps", "19"],
            ["1 Gbps", "4"],
            ["10 Gbps", "2"],
          ] },
          { h: "Edge port protection" },
          { ul: [
            "PortFast: access/edge ports skip to forwarding immediately (host ports only).",
            "BPDU Guard: err-disables a PortFast port if it receives a BPDU (rogue switch protection).",
          ] },
          { code: "interface fa0/1\n spanning-tree portfast\n spanning-tree bpduguard enable" },
        ],
      },
      {
        title: "EtherChannel (LACP / PAgP)",
        blocks: [
          { p: "Bundles up to 8 physical links into one logical link; STP treats it as a single port (no blocking). All member ports must match: speed, duplex, mode, allowed VLANs." },
          {
            table: {
              head: ["Protocol", "Modes", "Standard"],
              rows: [
                ["LACP", "active / passive", "802.3ad (open)"],
                ["PAgP", "desirable / auto", "Cisco proprietary"],
                ["Static", "on", "no negotiation"],
              ],
            },
          },
          { ul: [
            "LACP forms: active+active, active+passive. (passive+passive fails.)",
            "PAgP forms: desirable+desirable, desirable+auto. (auto+auto fails.)",
            "Load-balance methods: src/dst MAC or IP (e.g. 'port-channel load-balance src-dst-ip').",
          ] },
          { code: "interface range g0/1 - 2\n channel-group 1 mode active\ninterface port-channel 1\n switchport mode trunk" },
        ],
      },
      {
        title: "Wireless LAN architecture",
        blocks: [
          { ul: [
            "Autonomous AP: standalone, each AP managed individually (CLI/GUI).",
            "Controller-based (lightweight) AP: managed centrally by a WLC.",
            "CAPWAP: tunnels control (UDP 5246, encrypted) and data (UDP 5247) between AP and WLC.",
          ] },
          { h: "AP modes" },
          { kv: [
            ["Local", "default — serves clients"],
            ["FlexConnect", "switches client data locally if WLC/WAN link is down (branch)"],
            ["Monitor", "no client service; IDS/location/rogue scan"],
            ["Sniffer", "captures and forwards 802.11 frames to an analyzer"],
            ["Rogue detector", "detects rogue APs on the wired side"],
            ["SE-Connect", "spectrum analysis"],
          ] },
          { p: "Roaming: client moves between APs in the same ESS/SSID. WLC anchors mobility so the client keeps its IP. WLC management connections: console, Telnet/SSH, HTTP/HTTPS GUI." },
        ],
      },
    ],
  },
  {
    num: 3,
    name: "IP Connectivity",
    weight: 25,
    blurb:
      "Routing logic, static routes, OSPFv2, IPv6 routing and first-hop redundancy. The heaviest-weighted domain.",
    sections: [
      {
        title: "Routing concepts & AD",
        blocks: [
          { p: "Routed protocol = carries user data (IP). Routing protocol = exchanges reachability info (OSPF, EIGRP, BGP). The router picks the route with the longest prefix match first; ties broken by lowest Administrative Distance, then lowest metric." },
          { h: "Administrative Distance (memorize)" },
          {
            table: {
              head: ["Source", "AD"],
              rows: [
                ["Connected", "0"],
                ["Static", "1"],
                ["EIGRP summary", "5"],
                ["eBGP", "20"],
                ["EIGRP (internal)", "90"],
                ["OSPF", "110"],
                ["IS-IS", "115"],
                ["RIP", "120"],
                ["EIGRP (external)", "170"],
                ["iBGP", "200"],
                ["Unreachable", "255"],
              ],
            },
          },
        ],
      },
      {
        title: "Static routing",
        blocks: [
          { code: "! specific static\nip route 10.2.2.0 255.255.255.0 192.168.1.2\n! default route\nip route 0.0.0.0 0.0.0.0 203.0.113.1\n! floating static (backup): higher AD than primary\nip route 10.2.2.0 255.255.255.0 192.168.9.2 200" },
          { ul: [
            "Next-hop IP, exit interface, or both. On multi-access links specify next-hop to avoid recursion issues.",
            "Summary/aggregate static covers many subnets with one route.",
            "Floating static = backup with a higher AD; only installs when the primary dies.",
          ] },
        ],
      },
      {
        title: "OSPFv2 deep dive",
        blocks: [
          { p: "Link-state IGP, AD 110, metric = cost = reference-bw / interface-bw (default ref 100 Mbps). Uses areas; all areas touch area 0 (backbone)." },
          { h: "Neighbor adjacency requirements" },
          { ul: [
            "Same area, matching hello/dead timers, matching subnet/mask on the link",
            "Matching authentication, matching MTU, matching area type, unique Router-IDs",
            "Not passive on the interface; OSPF multicast 224.0.0.5 / 224.0.0.6",
          ] },
          { h: "Adjacency states" },
          { p: "Down → Init → 2-Way (DR/BDR elected here) → ExStart → Exchange → Loading → Full." },
          { h: "DR/BDR election (broadcast/multi-access)" },
          { ul: [
            "Highest interface priority wins (default 1; 0 = never DR). Tie → highest Router-ID.",
            "Router-ID = manual 'router-id', else highest loopback IP, else highest active interface IP.",
            "Election is non-preemptive. DROthers form FULL only with DR/BDR.",
          ] },
          { h: "LSA types 1-5" },
          { kv: [
            ["Type 1 Router", "each router's links, flooded within area"],
            ["Type 2 Network", "generated by the DR for a multi-access segment"],
            ["Type 3 Summary", "inter-area routes, from ABR"],
            ["Type 4 ASBR-Summary", "how to reach the ASBR, from ABR"],
            ["Type 5 External", "redistributed external routes, from ASBR"],
          ] },
          { h: "Config (single & multi-area)" },
          { code: "router ospf 1\n router-id 1.1.1.1\n network 10.0.0.0 0.0.0.255 area 0\n network 10.0.1.0 0.0.0.255 area 1\n passive-interface g0/2\n! per-interface cost\ninterface g0/0\n ip ospf cost 10" },
        ],
      },
      {
        title: "IPv6 routing basics",
        blocks: [
          { code: "ipv6 unicast-routing\ninterface g0/0\n ipv6 address 2001:db8:0:1::1/64\n! static\nipv6 route 2001:db8:0:2::/64 2001:db8:0:12::2\n! default\nipv6 route ::/0 2001:db8::1\n! OSPFv3\nipv6 router ospf 1\ninterface g0/0\n ipv6 ospf 1 area 0" },
          { p: "IPv6 enables routing with 'ipv6 unicast-routing'. OSPFv3 is enabled per interface and uses link-local next hops." },
        ],
      },
      {
        title: "First Hop Redundancy (HSRP/VRRP/GLBP)",
        blocks: [
          { p: "FHRPs give hosts a redundant default gateway via a shared virtual IP/MAC." },
          {
            table: {
              head: ["Protocol", "Type", "Notes"],
              rows: [
                ["HSRP", "Cisco", "active/standby, vMAC 0000.0c07.acXX"],
                ["VRRP", "Open (RFC)", "master/backup, vMAC 0000.5e00.01XX"],
                ["GLBP", "Cisco", "active load-balances across multiple gateways (AVG/AVF)"],
              ],
            },
          },
          { h: "HSRP states & priority" },
          { ul: [
            "States: Initial → Learn → Listen → Speak → Standby → Active.",
            "Highest priority (default 100) becomes Active; tie → highest IP.",
            "Preempt is OFF by default — without it a recovered higher-priority router will NOT retake Active.",
            "Object tracking can decrement priority when an uplink fails.",
          ] },
          { code: "interface vlan 10\n ip address 10.0.10.2 255.255.255.0\n standby 1 ip 10.0.10.1\n standby 1 priority 110\n standby 1 preempt" },
        ],
      },
    ],
  },
  {
    num: 4,
    name: "IP Services",
    weight: 10,
    blurb:
      "NAT/PAT, DHCP, DNS, NTP, SNMP, Syslog, QoS and the file-transfer protocols used for IOS management.",
    sections: [
      {
        title: "NAT & PAT",
        blocks: [
          { kv: [
            ["Inside local", "private addr of inside host"],
            ["Inside global", "public addr the inside host appears as"],
            ["Outside global", "real public addr of the outside host"],
          ] },
          { code: "! Static NAT\nip nat inside source static 10.0.0.5 203.0.113.5\n! Dynamic NAT\nip nat pool POOL 203.0.113.10 203.0.113.20 netmask 255.255.255.0\naccess-list 1 permit 10.0.0.0 0.0.0.255\nip nat inside source list 1 pool POOL\n! PAT (overload) — many hosts, one IP\nip nat inside source list 1 interface g0/1 overload\ninterface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside" },
          { code: "Verify: show ip nat translations | show ip nat statistics" },
          { p: "PAT (NAT overload) multiplexes many inside hosts onto one public IP using unique source ports." },
        ],
      },
      {
        title: "DHCP",
        blocks: [
          { p: "DORA: Discover (broadcast) → Offer → Request (broadcast) → Ack. Client then has IP, mask, gateway, DNS, lease." },
          { code: "ip dhcp excluded-address 10.0.10.1 10.0.10.10\nip dhcp pool LAN10\n network 10.0.10.0 255.255.255.0\n default-router 10.0.10.1\n dns-server 8.8.8.8\n lease 7" },
          { h: "Relay agent (helper)" },
          { p: "When the DHCP server is on another subnet, the router's interface forwards the broadcast as unicast:" },
          { code: "interface vlan 10\n ip helper-address 10.0.250.5" },
          { p: "DHCP snooping (security domain): trust the uplink/server port, drop rogue server replies on untrusted ports." },
        ],
      },
      {
        title: "DNS & record types",
        blocks: [
          {
            table: {
              head: ["Record", "Purpose"],
              rows: [
                ["A", "name → IPv4"],
                ["AAAA", "name → IPv6"],
                ["CNAME", "alias → canonical name"],
                ["MX", "mail exchanger (with priority)"],
                ["PTR", "IP → name (reverse)"],
                ["NS", "authoritative name server"],
              ],
            },
          },
          { code: "R(config)# ip name-server 8.8.8.8\nR(config)# ip domain-lookup\nR(config)# ip host SRV1 10.0.0.5" },
        ],
      },
      {
        title: "NTP",
        blocks: [
          { p: "Synchronizes clocks (UDP 123). Stratum = distance from the authoritative source: stratum 0 = reference clock, 1 = directly attached, higher = further; stratum 16 = unsynchronized." },
          { code: "R(config)# ntp server 192.0.2.10\n! make this device a source\nR(config)# ntp master 3\nVerify: show ntp status | show ntp associations" },
        ],
      },
      {
        title: "SNMP",
        blocks: [
          { ul: [
            "Manager polls agents; agents send unsolicited traps/informs. Data identified by OIDs in a MIB tree.",
            "v2c: community strings, no encryption. v3: adds authentication + encryption (authPriv) — preferred.",
            "Polls/responses UDP 161, traps UDP 162.",
          ] },
          { code: "snmp-server community READONLY ro\nsnmp-server host 10.0.0.9 version 2c READONLY\nsnmp-server enable traps" },
        ],
      },
      {
        title: "Syslog (severity 0-7)",
        blocks: [
          { p: "Lower number = more severe. Mnemonic: Every Awesome Cisco Engineer Will Need Ice-cream Daily." },
          {
            table: {
              head: ["#", "Level", "Meaning"],
              rows: [
                ["0", "Emergency", "system unusable"],
                ["1", "Alert", "act immediately"],
                ["2", "Critical", "critical condition"],
                ["3", "Error", "error condition"],
                ["4", "Warning", "warning condition"],
                ["5", "Notification", "normal but significant"],
                ["6", "Informational", "info message"],
                ["7", "Debugging", "debug output"],
              ],
            },
          },
          { code: "logging host 10.0.0.9\nlogging trap 5   ! send level 0-5 to server" },
        ],
      },
      {
        title: "QoS",
        blocks: [
          { ul: [
            "Marking: Layer 2 CoS (802.1p, 3 bits) and Layer 3 DSCP (6 bits in the ToS/Traffic-Class byte).",
            "Common DSCP: EF (46) voice, AF41 (34) interactive video, CS6 routing, default 0.",
            "Queuing: FIFO, WFQ, CBWFQ, and LLQ (priority queue for voice).",
            "Trust boundary: where the network begins trusting incoming markings (usually the access switch/IP phone).",
            "Tools: classification, marking, queuing, congestion avoidance (WRED), policing (drops) vs shaping (buffers).",
          ] },
        ],
      },
      {
        title: "TFTP / FTP for IOS",
        blocks: [
          { ul: [
            "TFTP (UDP 69): simple, no auth — common for IOS image / config copy.",
            "FTP (TCP 20/21): authenticated transfer.",
          ] },
          { code: "copy running-config tftp\ncopy tftp flash:\ncopy running-config startup-config" },
        ],
      },
    ],
  },
  {
    num: 5,
    name: "Security Fundamentals",
    weight: 15,
    blurb:
      "ACLs, port security, AAA, VPNs, wireless security, Layer-2 threat mitigation and device hardening.",
    sections: [
      {
        title: "Access Control Lists",
        blocks: [
          { kv: [
            ["Standard (1-99, 1300-1999)", "matches source IP only — place CLOSE to the DESTINATION"],
            ["Extended (100-199, 2000-2699)", "matches src+dst+protocol+port — place CLOSE to the SOURCE"],
          ] },
          { p: "Wildcard mask is the inverse of a subnet mask (0 = must match, 1 = ignore). 0.0.0.255 matches a /24. 'host x' = 0.0.0.0; 'any' = 0.0.0.0 255.255.255.255. Implicit 'deny any' ends every ACL." },
          { code: "! Extended named ACL: permit web, block the rest from a host\nip access-list extended WEB_ONLY\n permit tcp host 10.0.0.5 any eq 80\n permit tcp host 10.0.0.5 any eq 443\n deny ip any any log\ninterface g0/0\n ip access-group WEB_ONLY in" },
          { code: "! Standard, near destination\naccess-list 10 permit 192.168.1.0 0.0.0.255\ninterface g0/1\n ip access-group 10 out" },
        ],
      },
      {
        title: "Port security",
        blocks: [
          { p: "Limits which/how many MAC addresses can use an access port. Sticky learns MACs dynamically and saves them to running-config." },
          { code: "interface fa0/1\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict" },
          {
            table: {
              head: ["Violation mode", "Drops?", "Logs/SNMP?", "Err-disable?"],
              rows: [
                ["protect", "yes", "no", "no"],
                ["restrict", "yes", "yes", "no"],
                ["shutdown (default)", "yes", "yes", "yes"],
              ],
            },
          },
        ],
      },
      {
        title: "AAA (RADIUS vs TACACS+)",
        blocks: [
          { p: "Authentication = who you are; Authorization = what you can do; Accounting = what you did." },
          {
            table: {
              head: ["Feature", "RADIUS", "TACACS+"],
              rows: [
                ["Transport", "UDP 1812/1813", "TCP 49"],
                ["Encrypts", "password only", "entire payload"],
                ["AAA split", "combines authn+authz", "separates all three"],
                ["Typical use", "network access (802.1X)", "device admin (command authz)"],
                ["Origin", "open standard", "Cisco"],
              ],
            },
          },
        ],
      },
      {
        title: "VPNs",
        blocks: [
          { ul: [
            "Site-to-site IPsec: connects whole networks over the Internet; IKE phase 1 builds a secure mgmt tunnel, phase 2 builds the data SA.",
            "IPsec services: confidentiality (encryption), integrity (hashing), authentication, anti-replay. AH = integrity only; ESP = encryption + integrity.",
            "Remote-access: client (AnyConnect) to a head-end; SSL/TLS VPN runs over TCP 443, easy through firewalls.",
            "GRE tunnels can carry multicast/routing protocols (often protected by IPsec).",
          ] },
        ],
      },
      {
        title: "Wireless security",
        blocks: [
          { ul: [
            "WPA2 = AES-CCMP. WPA3 = stronger; SAE replaces the 4-way PSK handshake, protects against offline cracking.",
            "Personal (PSK): one shared passphrase. Enterprise (802.1X/EAP): per-user auth against a RADIUS server.",
            "Avoid WEP (broken) and TKIP (deprecated).",
          ] },
        ],
      },
      {
        title: "Layer-2 threats & mitigation",
        blocks: [
          {
            table: {
              head: ["Threat", "Mitigation"],
              rows: [
                ["MAC flooding (CAM overflow)", "port security"],
                ["Rogue DHCP server", "DHCP snooping"],
                ["ARP spoofing", "Dynamic ARP Inspection (DAI)"],
                ["IP spoofing", "IP Source Guard"],
                ["VLAN hopping (double-tag/DTP)", "set native VLAN unused, disable DTP, no unused trunks"],
                ["Broadcast/multicast storms", "storm-control"],
                ["STP manipulation", "BPDU Guard + Root Guard"],
              ],
            },
          },
          { code: "ip dhcp snooping\nip dhcp snooping vlan 10\ninterface g0/1\n ip dhcp snooping trust\nip arp inspection vlan 10" },
        ],
      },
      {
        title: "Device hardening",
        blocks: [
          { ul: [
            "Use SSH (encrypted) not Telnet (cleartext). Requires hostname, domain-name, RSA key ≥1024, local user.",
            "'enable secret' (MD5/scrypt) beats 'enable password' (weak/cleartext).",
            "'service password-encryption' obscures cleartext passwords in config.",
            "Login banners (banner motd) for legal notice. Disable unused services.",
          ] },
          { code: "hostname R1\nip domain-name lab.local\ncrypto key generate rsa modulus 2048\nusername admin secret S3cret!\nenable secret S3cret!\nservice password-encryption\nline vty 0 4\n transport input ssh\n login local\nip ssh version 2\nbanner motd #Authorized access only#" },
        ],
      },
    ],
  },
  {
    num: 6,
    name: "Automation & Programmability",
    weight: 10,
    blurb:
      "SDN planes, controller-based fabrics, REST APIs, config-management tooling, model-driven programmability and the v1.1 AI/ML additions.",
    sections: [
      {
        title: "SDN & network planes",
        blocks: [
          { kv: [
            ["Data (forwarding) plane", "moves packets/frames (ASIC) based on tables"],
            ["Control plane", "builds the tables (routing, STP, ARP)"],
            ["Management plane", "admin access: SSH, SNMP, syslog, APIs"],
          ] },
          { p: "SDN centralizes the control plane into a controller that programs devices via a southbound interface (e.g. OpenFlow, NETCONF) and exposes a northbound API (REST) to apps." },
        ],
      },
      {
        title: "Controller-based networking (SD-WAN / SD-Access)",
        blocks: [
          { ul: [
            "Cisco DNA Center / Catalyst Center = controller for campus SD-Access (intent-based, policy via groups).",
            "SD-Access fabric: underlay (physical IP) + overlay (VXLAN), LISP control plane, group-based policy.",
            "SD-WAN (Viptela): vManage (mgmt), vSmart (control), vBond (orchestration), vEdge/cEdge (data).",
            "Benefits over traditional/box-by-box: central policy, automation, consistency, telemetry.",
          ] },
        ],
      },
      {
        title: "REST APIs",
        blocks: [
          {
            table: {
              head: ["Verb", "Action (CRUD)"],
              rows: [
                ["GET", "read"],
                ["POST", "create"],
                ["PUT/PATCH", "update/replace/modify"],
                ["DELETE", "delete"],
              ],
            },
          },
          { h: "HTTP status code classes" },
          { kv: [
            ["2xx", "success (200 OK, 201 Created)"],
            ["3xx", "redirect"],
            ["4xx", "client error (401 unauth, 403 forbidden, 404 not found)"],
            ["5xx", "server error (500)"],
          ] },
          { p: "REST is stateless over HTTPS; payloads are usually JSON (sometimes XML). Auth via tokens/keys/Basic." },
        ],
      },
      {
        title: "Config management: Ansible / Terraform",
        blocks: [
          {
            table: {
              head: ["Tool", "Agent", "Language", "Model"],
              rows: [
                ["Ansible", "agentless (SSH)", "YAML playbooks", "procedural-ish, push"],
                ["Puppet", "agent", "Puppet DSL (Ruby)", "declarative, pull"],
                ["Chef", "agent", "Ruby recipes", "procedural, pull"],
                ["Terraform", "agentless", "HCL", "declarative IaC, push"],
              ],
            },
          },
          { ul: [
            "Ansible: agentless over SSH; inventory lists hosts; modules do the work; playbooks are idempotent.",
            "Terraform: declarative Infrastructure-as-Code; you describe desired state, it computes the plan to reach it.",
          ] },
          { code: "# ansible playbook (concept)\n- hosts: switches\n  tasks:\n    - name: set interface description\n      ios_config:\n        lines:\n          - description UPLINK\n        parents: interface Gi0/1" },
        ],
      },
      {
        title: "Model-driven: YANG / NETCONF / RESTCONF",
        blocks: [
          { kv: [
            ["YANG", "data model defining structure of config/state"],
            ["NETCONF", "protocol over SSH (830), XML payloads, transactions"],
            ["RESTCONF", "REST-style over HTTPS, JSON or XML payloads"],
          ] },
          { code: "<!-- NETCONF get-config (concept) -->\n<get-config>\n  <source><running/></source>\n</get-config>" },
        ],
      },
      {
        title: "Data formats (JSON / XML)",
        blocks: [
          { p: "JSON: key/value, arrays, objects — lightweight, common in REST." },
          { code: '{\n  "interface": {\n    "name": "GigabitEthernet0/1",\n    "enabled": true,\n    "ipv4": { "address": "10.0.0.1", "mask": "255.255.255.0" }\n  }\n}' },
          { code: "<interface>\n  <name>GigabitEthernet0/1</name>\n  <enabled>true</enabled>\n</interface>" },
          { p: "JSON data types: string, number, boolean, null, array [], object {}. Whitespace is insignificant." },
        ],
      },
      {
        title: "AI/ML in networking (v1.1)",
        blocks: [
          { ul: [
            "AIOps applies machine learning to telemetry for predictive analytics and anomaly detection (baseline normal, flag deviations).",
            "Intent-based networking (IBN): you express intent (policy/outcome); the controller translates, activates and continuously assures it.",
            "Use cases: predictive failure/capacity, automated root-cause, dynamic optimization, security threat detection.",
            "Generative AI assistants help summarize config, explain issues, and draft automation — always human-reviewed.",
          ] },
        ],
      },
    ],
  },
];

/* ===========================================================================
 * DATA :: LABS
 * ========================================================================= */
const LABS = [
  /* ---------------- DOMAIN 1 ---------------- */
  {
    id: "L1.1",
    domain: 1,
    title: "Subnet a /24 into 6 usable subnets",
    scenario:
      "You are given 192.168.50.0/24 and must carve it into at least 6 equal subnets, each supporting up to 25 hosts, then assign the first three to LAN segments.",
    diagram:
      "192.168.50.0/24\n        │\n  ┌─────┼─────┬─────┐\n[LAN-A][LAN-B][LAN-C] ... (6 subnets)",
    objective:
      "Choose a prefix that yields ≥6 subnets with ≥25 hosts each, then list each subnet's network, host range and broadcast.",
    explain:
      "Need ≥6 subnets → borrow 3 bits (2^3 = 8 subnets). New prefix = /24 + 3 = /27. A /27 gives 2^5 − 2 = 30 hosts, satisfying the 25-host requirement. Magic number = 256 − 224 = 32, so subnets increment by 32 in the last octet.",
    steps: [
      { desc: "Determine bits to borrow: 2^s ≥ 6 → s=3 → /27 (mask 255.255.255.224).", cmd: "/24 + 3 bits = /27   hosts = 2^5 - 2 = 30   magic = 32" },
      { desc: "Assign LAN-A (subnet 0).", cmd: "interface g0/0\n ip address 192.168.50.1 255.255.255.224" },
      { desc: "Assign LAN-B (subnet 1).", cmd: "interface g0/1\n ip address 192.168.50.33 255.255.255.224" },
      { desc: "Assign LAN-C (subnet 2).", cmd: "interface g0/2\n ip address 192.168.50.65 255.255.255.224" },
    ],
    verify: "show ip interface brief\nshow ip route connected",
    expected:
      "GigabitEthernet0/0  192.168.50.1   up up\nGigabitEthernet0/1  192.168.50.33  up up\nC  192.168.50.0/27 is directly connected, Gig0/0\nC  192.168.50.32/27 is directly connected, Gig0/1",
    mistakes: [
      "Choosing /28 (only 14 hosts) — fails the 25-host requirement.",
      "Forgetting the network and broadcast addresses are unusable (that's why it's 2^h − 2).",
      "Mixing up the magic number (256 − 224 = 32, not 16).",
    ],
  },
  {
    id: "L1.2",
    domain: 1,
    title: "IPv6 EUI-64 address calculation",
    scenario:
      "An interface has MAC 00:1A:2B:3C:4D:5E and is configured for EUI-64 on prefix 2001:db8:acad:1::/64. Derive the full IPv6 address.",
    diagram: "MAC 00:1A:2B:3C:4D:5E  +  prefix 2001:db8:acad:1::/64",
    objective: "Compute the 64-bit interface ID with EUI-64 and write the complete address.",
    explain:
      "EUI-64 expands a 48-bit MAC to 64 bits: split the MAC, insert FFFE in the middle, then flip the 7th bit (U/L bit) of the first byte. 0x00 → 0x02. Result interface ID = 021A:2BFF:FE3C:4D5E.",
    steps: [
      { desc: "Split MAC into two halves.", cmd: "00:1A:2B  |  3C:4D:5E" },
      { desc: "Insert FFFE in the middle.", cmd: "00:1A:2B:FF:FE:3C:4D:5E" },
      { desc: "Flip the 7th bit of the first byte (00000000 → 00000010 = 02).", cmd: "02:1A:2B:FF:FE:3C:4D:5E  →  021A:2BFF:FE3C:4D5E" },
      { desc: "Configure EUI-64 and let IOS build it.", cmd: "interface g0/0\n ipv6 address 2001:db8:acad:1::/64 eui-64" },
    ],
    verify: "show ipv6 interface g0/0",
    expected:
      "IPv6 is enabled, link-local address is FE80::21A:2BFF:FE3C:4D5E\n  Global unicast address: 2001:DB8:ACAD:1:21A:2BFF:FE3C:4D5E",
    mistakes: [
      "Forgetting to flip the 7th bit — this is the most common error.",
      "Inserting FFFF instead of FFFE.",
      "Flipping a bit in the wrong byte (it's always the first byte).",
    ],
  },
  {
    id: "L1.3",
    domain: 1,
    title: "TCP 3-way handshake analysis",
    scenario:
      "A host opens an HTTPS session to 203.0.113.10. Capture and interpret the handshake flags and sequence numbers.",
    diagram:
      "Client 10.0.0.5        Server 203.0.113.10:443\n   │── SYN ───────────────▶│\n   │◀── SYN, ACK ──────────│\n   │── ACK ───────────────▶│  (established)",
    objective: "Identify the flags, the seq/ack relationship, and confirm the session reaches ESTABLISHED.",
    explain:
      "TCP establishes state before data. SYN carries the client ISN. The server replies SYN+ACK with its own ISN and ack = client ISN+1. The client's final ACK = server ISN+1. Each SYN/FIN consumes one sequence number.",
    steps: [
      { desc: "Generate the session (e.g. open the page) and capture.", cmd: "C:\\> curl https://203.0.113.10" },
      { desc: "Filter the capture for the conversation.", cmd: "tcp.port == 443 && ip.addr == 203.0.113.10" },
      { desc: "Read the three packets' flags.", cmd: "1) [SYN]      seq=0\n2) [SYN,ACK]  seq=0 ack=1\n3) [ACK]      seq=1 ack=1" },
    ],
    verify: "netstat -ano | findstr :443",
    expected: "TCP  10.0.0.5:51544  203.0.113.10:443  ESTABLISHED",
    mistakes: [
      "Confusing the half-open SYN_SENT state with ESTABLISHED.",
      "Expecting data in the handshake — payload starts after the third packet.",
      "Thinking teardown is also 3 packets (it's a 4-way FIN exchange).",
    ],
  },

  /* ---------------- DOMAIN 2 ---------------- */
  {
    id: "L2.1",
    domain: 2,
    title: "VLAN + 802.1Q trunk on a 2-switch topology",
    scenario:
      "Two switches connect via Gi0/1. SALES (VLAN 10) and ENG (VLAN 20) hosts exist on both. Build the VLANs and a trunk so each VLAN spans both switches.",
    diagram:
      "[PC-Sales]─fa0/2  SW1  g0/1═══trunk═══g0/1  SW2  fa0/2─[PC-Eng]\n[PC-Eng]──fa0/3                              fa0/3─[PC-Sales]",
    objective: "Create VLANs 10/20 on both switches, assign access ports, and form an 802.1Q trunk carrying both VLANs.",
    explain:
      "Access ports place a host in a single VLAN. The inter-switch link must be a trunk so it can carry tagged frames for multiple VLANs. 802.1Q tags every VLAN except the native VLAN.",
    steps: [
      { desc: "On both switches, create the VLANs.", cmd: "vlan 10\n name SALES\nvlan 20\n name ENG" },
      { desc: "Assign access ports (example SW1).", cmd: "interface fa0/2\n switchport mode access\n switchport access vlan 10\ninterface fa0/3\n switchport mode access\n switchport access vlan 20" },
      { desc: "Configure the trunk on both ends.", cmd: "interface g0/1\n switchport trunk encapsulation dot1q\n switchport mode trunk\n switchport trunk allowed vlan 10,20" },
    ],
    verify: "show vlan brief\nshow interfaces trunk",
    expected:
      "Port    Mode  Encapsulation  Status   Native vlan\nGi0/1   on    802.1q         trunking 1\nVlans allowed and active in management domain: 10,20",
    mistakes: [
      "Leaving the inter-switch link as an access port — only one VLAN would pass.",
      "Native VLAN mismatch between the two ends (CDP will warn).",
      "Pruning VLAN 10/20 off the allowed list by accident.",
    ],
  },
  {
    id: "L2.2",
    domain: 2,
    title: "RSTP root bridge manipulation",
    scenario:
      "Three switches form a triangle. The election made SW3 (oldest MAC) the root, causing suboptimal paths. Force SW1 to become root and SW2 to be the backup.",
    diagram:
      "        [SW1]\n        /    \\\n     [SW2]──[SW3]\n  goal: SW1 = root, SW2 = secondary",
    objective: "Use priority to make SW1 the root bridge for VLAN 1 and SW2 the secondary, verify port roles.",
    explain:
      "The lowest Bridge ID wins root. Bridge ID = priority + extended system ID (VLAN) + MAC. Since MAC is fixed, lower the priority on SW1 (multiples of 4096). 'root primary' sets 24576; 'root secondary' sets 28672.",
    steps: [
      { desc: "Ensure Rapid-PVST is running.", cmd: "spanning-tree mode rapid-pvst" },
      { desc: "Make SW1 the root for VLAN 1.", cmd: "SW1(config)# spanning-tree vlan 1 priority 4096" },
      { desc: "Make SW2 the secondary root.", cmd: "SW2(config)# spanning-tree vlan 1 priority 8192" },
    ],
    verify: "show spanning-tree vlan 1",
    expected:
      "SW1: This bridge is the root\n  Root ID Priority 4097\nSW3: Root port Gi0/1 (toward SW1), one Alternate (BLK) port",
    mistakes: [
      "Using a priority that isn't a multiple of 4096 (rejected by IOS).",
      "Forgetting the extended system ID adds the VLAN number (4096+1 = 4097).",
      "Changing priority on only one VLAN when PVST runs an instance per VLAN.",
    ],
  },
  {
    id: "L2.3",
    domain: 2,
    title: "EtherChannel LACP setup",
    scenario:
      "SW1 and SW2 are linked by Gi0/1 and Gi0/2. Bundle them into one logical 2-Gbps trunk using LACP to remove STP blocking and add redundancy.",
    diagram:
      "[SW1] g0/1 ═╗\n            ╠══ Po1 (LACP) ══ [SW2]\n      g0/2 ═╝",
    objective: "Create a Layer-2 EtherChannel with LACP (active/active), then trunk the port-channel.",
    explain:
      "EtherChannel aggregates links so STP sees a single logical port — no blocking, full bandwidth. LACP (802.3ad) negotiates the bundle; both ends must be active or active+passive. Member ports must share speed, duplex and VLAN settings.",
    steps: [
      { desc: "On SW1, add both members to channel-group 1 (active = LACP).", cmd: "interface range g0/1 - 2\n channel-group 1 mode active" },
      { desc: "Repeat identically on SW2.", cmd: "interface range g0/1 - 2\n channel-group 1 mode active" },
      { desc: "Configure the logical interface as a trunk.", cmd: "interface port-channel 1\n switchport mode trunk\n switchport trunk allowed vlan 10,20" },
    ],
    verify: "show etherchannel summary\nshow lacp neighbor",
    expected:
      "Group  Port-channel  Protocol   Ports\n1      Po1(SU)       LACP       Gi0/1(P) Gi0/2(P)\n(SU = Layer2, in use ; P = bundled)",
    mistakes: [
      "Setting one side 'active' and the other 'on' — mode mismatch, bundle fails.",
      "Mismatched allowed VLANs / duplex on member ports (ports go suspended).",
      "Configuring switchport settings on members instead of on Port-channel 1.",
    ],
  },

  /* ---------------- DOMAIN 3 ---------------- */
  {
    id: "L3.1",
    domain: 3,
    title: "OSPF multi-area configuration",
    scenario:
      "R1 (area 0) connects to R2, which is an ABR into area 1 where R3 lives. Bring up OSPF so all loopbacks are reachable end to end.",
    diagram:
      "[R1]──area 0──[R2 ABR]──area 1──[R3]\n 1.1.1.1       2.2.2.2        3.3.3.3",
    objective: "Configure OSPFv2 across two areas, set router-IDs, and confirm inter-area (O IA) routes appear.",
    explain:
      "OSPF areas reduce LSA flooding. Every non-backbone area must connect to area 0; R2 is the ABR joining area 0 and area 1, generating Type-3 summary LSAs so R1 learns area 1 routes as O IA.",
    steps: [
      { desc: "R1 in area 0.", cmd: "router ospf 1\n router-id 1.1.1.1\n network 10.0.12.0 0.0.0.3 area 0\n network 1.1.1.1 0.0.0.0 area 0" },
      { desc: "R2 is the ABR (both areas).", cmd: "router ospf 1\n router-id 2.2.2.2\n network 10.0.12.0 0.0.0.3 area 0\n network 10.0.23.0 0.0.0.3 area 1" },
      { desc: "R3 in area 1.", cmd: "router ospf 1\n router-id 3.3.3.3\n network 10.0.23.0 0.0.0.3 area 1\n network 3.3.3.3 0.0.0.0 area 1" },
    ],
    verify: "show ip ospf neighbor\nshow ip route ospf",
    expected:
      "Neighbor ID  State    Interface\n2.2.2.2      FULL/DR  Gig0/0\nO IA  3.3.3.3/32 [110/2] via 10.0.12.2",
    mistakes: [
      "Putting a non-zero area not adjacent to area 0 (discontiguous area).",
      "Wildcard mask errors in network statements (it's inverse mask, not subnet mask).",
      "MTU/timer mismatch leaving neighbors stuck in EXSTART/EXCHANGE.",
    ],
  },
  {
    id: "L3.2",
    domain: 3,
    title: "Floating static route failover",
    scenario:
      "R1 reaches 10.20.0.0/24 primarily via the MPLS link (next-hop .2) and must fail over to a backup Internet link (next-hop .6) only when MPLS drops.",
    diagram:
      "          ┌─ MPLS (.2)  primary  AD 1 ─┐\n[R1]──────┤                              ├──▶ 10.20.0.0/24\n          └─ INET (.6)  backup   AD 5 ──┘",
    objective: "Install a primary static route and a floating static backup with a higher AD.",
    explain:
      "Two static routes to the same prefix: the lower-AD route is active. The backup gets a higher AD (e.g. 5), so it stays out of the routing table until the primary's next-hop/interface becomes unreachable, then it 'floats' in.",
    steps: [
      { desc: "Primary static (default AD 1).", cmd: "ip route 10.20.0.0 255.255.255.0 192.168.1.2" },
      { desc: "Floating backup (AD 5).", cmd: "ip route 10.20.0.0 255.255.255.0 192.168.1.6 5" },
      { desc: "Test failover by shutting the primary path.", cmd: "interface g0/0\n shutdown" },
    ],
    verify: "show ip route 10.20.0.0\nshow ip route 10.20.0.0   (after shutdown)",
    expected:
      "Before: S 10.20.0.0/24 [1/0] via 192.168.1.2\nAfter : S 10.20.0.0/24 [5/0] via 192.168.1.6",
    mistakes: [
      "Giving the backup the same AD — load-shares instead of failing over.",
      "Pointing the backup out the same interface/next-hop as the primary.",
      "Expecting failover when only the remote end fails but the local link stays up (use IP SLA tracking).",
    ],
  },
  {
    id: "L3.3",
    domain: 3,
    title: "HSRP active/standby gateway",
    scenario:
      "VLAN 10 hosts need a redundant default gateway 10.0.10.1. R1 should be active (priority 110, preempt) and R2 the standby.",
    diagram:
      "[R1 pri 110]─┐            VIP 10.0.10.1\n             ├── VLAN10 hosts → gw .1\n[R2 pri 100]─┘",
    objective: "Configure HSRP group 1 with a virtual IP, set R1 priority + preempt, verify states.",
    explain:
      "HSRP presents one virtual IP/MAC as the gateway. The higher-priority router is Active; preempt lets a recovered higher-priority router reclaim Active (off by default). Hosts always point at the VIP, so failover is transparent.",
    steps: [
      { desc: "R1 — active with preempt.", cmd: "interface vlan 10\n ip address 10.0.10.2 255.255.255.0\n standby 1 ip 10.0.10.1\n standby 1 priority 110\n standby 1 preempt" },
      { desc: "R2 — standby (default priority 100).", cmd: "interface vlan 10\n ip address 10.0.10.3 255.255.255.0\n standby 1 ip 10.0.10.1" },
      { desc: "Optionally track an uplink to decrement priority.", cmd: "standby 1 track g0/1 20" },
    ],
    verify: "show standby brief",
    expected:
      "Interface Grp Pri P State   Active     Standby    Virtual IP\nVl10      1   110 P Active  local      10.0.10.3  10.0.10.1\n(R2 shows State = Standby)",
    mistakes: [
      "Forgetting 'preempt' on R1 — R2 keeps Active after R1 recovers.",
      "Different group numbers on the two routers (they never pair).",
      "Hosts using a router's real IP as gateway instead of the VIP.",
    ],
  },

  /* ---------------- DOMAIN 4 ---------------- */
  {
    id: "L4.1",
    domain: 4,
    title: "DHCP server + relay agent",
    scenario:
      "The DHCP server pool lives on R1. Clients on R2's VLAN 30 (different subnet) must get addresses via a relay agent.",
    diagram:
      "[Clients VLAN30]──[R2 relay]───────[R1 DHCP server]\n  10.0.30.0/24   ip helper        pool LAN30",
    objective: "Build a DHCP pool on R1 and configure R2's SVI as a relay (ip helper-address) so remote clients lease addresses.",
    explain:
      "DHCP Discover/Request are broadcasts that routers don't forward. The relay agent (ip helper-address) converts them to unicast toward the server and stamps the giaddr so the server picks the right pool.",
    steps: [
      { desc: "On R1, exclude infra IPs and define the pool.", cmd: "ip dhcp excluded-address 10.0.30.1 10.0.30.10\nip dhcp pool LAN30\n network 10.0.30.0 255.255.255.0\n default-router 10.0.30.1\n dns-server 8.8.8.8" },
      { desc: "On R2, point the client SVI at the server.", cmd: "interface vlan 30\n ip address 10.0.30.1 255.255.255.0\n ip helper-address 10.0.250.1" },
      { desc: "Ensure R1 has a route back to 10.0.30.0/24.", cmd: "ip route 10.0.30.0 255.255.255.0 10.0.250.2" },
    ],
    verify: "show ip dhcp binding\nshow ip dhcp pool",
    expected:
      "IP address    Client-ID/Hardware  Lease expiration\n10.0.30.11    0100.1a2b.3c4d.5e   <date>\nPool LAN30: 1 leased / 244 available",
    mistakes: [
      "Forgetting the helper address — clients fall back to APIPA (169.254.x.x).",
      "No return route on the server to the client subnet.",
      "Not excluding the gateway/static addresses, causing IP conflicts.",
    ],
  },
  {
    id: "L4.2",
    domain: 4,
    title: "PAT (NAT overload) with verification",
    scenario:
      "A 10.0.0.0/24 LAN must reach the Internet through R1's single public interface using PAT.",
    diagram:
      "[LAN 10.0.0.0/24]──g0/0(inside)  R1  g0/1(outside) ──▶ Internet\n                    many hosts → one public IP",
    objective: "Configure PAT so all inside hosts share the outside interface IP, then verify translations.",
    explain:
      "PAT overloads one public IP by tracking unique source ports per session. An ACL identifies inside traffic; 'overload' enables port translation; interfaces are tagged inside/outside.",
    steps: [
      { desc: "Define the inside source ACL.", cmd: "access-list 1 permit 10.0.0.0 0.0.0.255" },
      { desc: "Enable PAT on the outside interface.", cmd: "ip nat inside source list 1 interface g0/1 overload" },
      { desc: "Tag the interfaces.", cmd: "interface g0/0\n ip nat inside\ninterface g0/1\n ip nat outside" },
    ],
    verify: "show ip nat translations\nshow ip nat statistics",
    expected:
      "Pro Inside global       Inside local     Outside global\ntcp 203.0.113.1:1024  10.0.0.5:51000   93.184.216.34:443\ntcp 203.0.113.1:1025  10.0.0.6:50992   93.184.216.34:443",
    mistakes: [
      "Omitting 'overload' — only one host can translate at a time (dynamic NAT).",
      "Swapping inside/outside interface designations.",
      "ACL matching the wrong subnet, so traffic is never translated.",
    ],
  },
  {
    id: "L4.3",
    domain: 4,
    title: "NTP hierarchy setup",
    scenario:
      "R1 syncs to an external time source and serves time to R2 and the switches, establishing a stratum hierarchy.",
    diagram:
      "[Internet NTP s1]──[R1 s2]──[R2 s3]──[SW s4]",
    objective: "Configure R1 as an NTP client/server and R2 as a client of R1; verify stratum and sync.",
    explain:
      "NTP forms a tree by stratum (hops from the reference clock). R1 syncs upstream (becoming stratum 2 if the source is stratum 1) and serves R2, which becomes stratum 3. Accurate clocks matter for logs, certificates and troubleshooting.",
    steps: [
      { desc: "R1 syncs to the upstream source.", cmd: "R1(config)# ntp server 129.6.15.28" },
      { desc: "R2 syncs to R1.", cmd: "R2(config)# ntp server 10.0.12.1" },
      { desc: "Optionally authenticate.", cmd: "ntp authenticate\nntp authentication-key 1 md5 S3cret\nntp trusted-key 1" },
    ],
    verify: "show ntp status\nshow ntp associations",
    expected:
      "R1: Clock is synchronized, stratum 2, reference 129.6.15.28\nR2: Clock is synchronized, stratum 3, reference 10.0.12.1\n* master (sys peer)",
    mistakes: [
      "Reading 'stratum 16' as synced — 16 means unsynchronized.",
      "Forgetting it can take several minutes for associations to reach sync.",
      "Time zone vs UTC confusion (set 'clock timezone' separately).",
    ],
  },

  /* ---------------- DOMAIN 5 ---------------- */
  {
    id: "L5.1",
    domain: 5,
    title: "Extended ACL for traffic filtering",
    scenario:
      "Permit the 10.0.10.0/24 LAN to reach web (HTTP/HTTPS) and DNS, deny it from the 10.0.99.0/24 server VLAN, and allow everything else out.",
    diagram:
      "[LAN 10.0.10.0/24]──R1 g0/0(in)──▶ [web/dns OK]  ✗[10.0.99.0/24]",
    objective: "Write a named extended ACL and apply it inbound on the LAN interface (close to source).",
    explain:
      "Extended ACLs match source, destination, protocol and port, so they belong close to the source to drop unwanted traffic early. Order matters (top-down, first match wins) and there is an implicit deny at the end.",
    steps: [
      { desc: "Build the named extended ACL.", cmd: "ip access-list extended LAN10_OUT\n deny ip 10.0.10.0 0.0.0.255 10.0.99.0 0.0.0.255\n permit tcp 10.0.10.0 0.0.0.255 any eq 80\n permit tcp 10.0.10.0 0.0.0.255 any eq 443\n permit udp 10.0.10.0 0.0.0.255 any eq 53\n permit ip 10.0.10.0 0.0.0.255 any" },
      { desc: "Apply it inbound on the LAN side.", cmd: "interface g0/0\n ip access-group LAN10_OUT in" },
    ],
    verify: "show access-lists LAN10_OUT\nshow ip interface g0/0",
    expected:
      "Extended IP access list LAN10_OUT\n 10 deny ip 10.0.10.0 ... 10.0.99.0 ... (24 matches)\n 20 permit tcp 10.0.10.0 ... eq www (812 matches)\nInbound access list is LAN10_OUT",
    mistakes: [
      "Placing the 'permit ip ... any' before the deny — the deny never triggers.",
      "Applying the extended ACL near the destination instead of the source.",
      "Forgetting DNS uses UDP/53 (and sometimes TCP/53).",
    ],
  },
  {
    id: "L5.2",
    domain: 5,
    title: "Port security with sticky MACs",
    scenario:
      "Access port fa0/5 should allow only the first learned device, remember it across reboots, and shut down on violation.",
    diagram: "[Authorized PC]──fa0/5  SW  ✗ rogue hub/switch blocked",
    objective: "Enable port security with sticky learning, max 1 MAC, and shutdown violation mode; verify.",
    explain:
      "Sticky MAC dynamically learns the connected device's MAC and writes it into running-config, so it survives reloads once saved. Shutdown mode err-disables the port on violation, the most secure option.",
    steps: [
      { desc: "Make the port a static access port.", cmd: "interface fa0/5\n switchport mode access\n switchport access vlan 10" },
      { desc: "Enable port security with sticky learning.", cmd: " switchport port-security\n switchport port-security maximum 1\n switchport port-security mac-address sticky\n switchport port-security violation shutdown" },
      { desc: "Recover an err-disabled port if it trips.", cmd: "interface fa0/5\n shutdown\n no shutdown" },
    ],
    verify: "show port-security interface fa0/5\nshow port-security address",
    expected:
      "Port Security        : Enabled\nViolation Mode       : Shutdown\nMaximum MAC Addresses: 1\nSticky MAC Addresses : 1   (0011.2233.4455 VLAN 10)",
    mistakes: [
      "Leaving the port in dynamic/trunk mode — port-security needs a static access (or trunk) port.",
      "Forgetting to 'write memory', so sticky entries are lost on reload.",
      "Not knowing a shutdown violation requires manual (or errdisable recovery) to restore.",
    ],
  },
  {
    id: "L5.3",
    domain: 5,
    title: "SSH hardening checklist",
    scenario:
      "Replace Telnet with SSHv2 on R1: create a local admin, generate keys, restrict VTY lines, and add a banner.",
    diagram: "[Admin]──SSH(22, encrypted)──▶ R1   ✗ Telnet(23) denied",
    objective: "Harden remote management to SSHv2-only with local authentication and a login banner.",
    explain:
      "SSH encrypts the management session, unlike Telnet. SSH requires a hostname, a domain name (to name the RSA key), an RSA key of at least 1024 bits (768 won't allow v2), and a login method. Restricting VTY 'transport input ssh' disables Telnet.",
    steps: [
      { desc: "Set identity and a local user.", cmd: "hostname R1\nip domain-name lab.local\nusername admin privilege 15 secret S3cret!" },
      { desc: "Generate keys and force SSHv2.", cmd: "crypto key generate rsa modulus 2048\nip ssh version 2" },
      { desc: "Lock the VTY lines to SSH with local login.", cmd: "line vty 0 4\n transport input ssh\n login local\n exec-timeout 5 0" },
      { desc: "Add a legal banner and protect privileged mode.", cmd: "enable secret S3cret!\nservice password-encryption\nbanner motd #Authorized access only#" },
    ],
    verify: "show ip ssh\nshow ssh",
    expected:
      "SSH Enabled - version 2.0\nAuthentication timeout: 120 secs; Authentication retries: 3\nConnection Version Encryption  State        Username\n0          2.0     aes256-ctr   Session started admin",
    mistakes: [
      "Skipping 'ip domain-name' — RSA key generation fails.",
      "Using a 512/768-bit modulus, which can't support SSHv2.",
      "Leaving 'transport input all/telnet', so Telnet still works.",
    ],
  },

  /* ---------------- DOMAIN 6 ---------------- */
  {
    id: "L6.1",
    domain: 6,
    title: "REST API GET request walkthrough",
    scenario:
      "Authenticate to a controller's REST API over HTTPS, request a token, then GET the device inventory and parse the JSON.",
    diagram: "[Client/curl]──HTTPS 443──▶ [Controller REST API] → JSON",
    objective: "Perform token auth (POST) then a resource read (GET), and interpret status codes + JSON.",
    explain:
      "REST is stateless: each call carries auth (here a token from the auth endpoint). GET reads a resource and returns 200 with a JSON body. The client parses keys to extract values — no CLI scraping.",
    steps: [
      { desc: "Request an auth token (POST with Basic auth).", cmd: "curl -k -X POST https://dnac/dna/system/api/v1/auth/token \\\n  -u admin:S3cret!" },
      { desc: "Use the token to GET network devices.", cmd: "curl -k -X GET https://dnac/dna/intent/api/v1/network-device \\\n  -H \"X-Auth-Token: <TOKEN>\" -H \"Accept: application/json\"" },
      { desc: "Read the JSON response body.", cmd: '{ "response": [ { "hostname": "R1",\n  "managementIpAddress": "10.0.0.1",\n  "softwareVersion": "17.6" } ] }' },
    ],
    verify: "echo $?   # curl exit status; inspect HTTP status header",
    expected:
      "HTTP/1.1 200 OK\nContent-Type: application/json\n(401 Unauthorized would mean a bad/expired token)",
    mistakes: [
      "Reusing an expired token (401) — re-auth to refresh it.",
      "Sending GET to a POST-only endpoint (405 Method Not Allowed).",
      "Forgetting the Accept/Content-Type headers, getting XML or an error.",
    ],
  },
  {
    id: "L6.2",
    domain: 6,
    title: "Ansible playbook for interface config",
    scenario:
      "Use an agentless Ansible playbook to push an interface description and 'no shutdown' to a group of IOS switches defined in inventory.",
    diagram: "[Ansible control node]──SSH──▶ [switches group] (idempotent)",
    objective: "Read an inventory, target a host group, and apply IOS config with the ios_config module.",
    explain:
      "Ansible is agentless and connects over SSH. The inventory lists hosts/groups; a playbook maps tasks (modules) to those hosts. ios_config is idempotent — re-running it makes no change if the device already matches.",
    steps: [
      { desc: "Define the inventory.", cmd: "# inventory.ini\n[switches]\nsw1 ansible_host=10.0.0.11\nsw2 ansible_host=10.0.0.12\n\n[switches:vars]\nansible_network_os=ios\nansible_connection=network_cli" },
      { desc: "Write the playbook.", cmd: "- name: Configure access interface\n  hosts: switches\n  gather_facts: no\n  tasks:\n    - name: set description + enable\n      ios_config:\n        parents: interface Gi0/1\n        lines:\n          - description USER-ACCESS\n          - no shutdown" },
      { desc: "Run it.", cmd: "ansible-playbook -i inventory.ini intf.yml" },
    ],
    verify: "ansible switches -i inventory.ini -m ios_command -a \"commands='show run interface Gi0/1'\"",
    expected:
      "PLAY [Configure access interface]\nTASK [set description + enable] changed: [sw1]\nchanged: [sw2]\nPLAY RECAP  sw1 : ok=1 changed=1   sw2 : ok=1 changed=1",
    mistakes: [
      "Bad YAML indentation (YAML is whitespace-sensitive — spaces, never tabs).",
      "Wrong ansible_network_os/connection for network devices.",
      "Expecting 'changed' every run — idempotent tasks report 'ok' when already compliant.",
    ],
  },
  {
    id: "L6.3",
    domain: 6,
    title: "NETCONF get-config example",
    scenario:
      "Enable NETCONF on an IOS-XE device and retrieve the running interface configuration as XML over SSH port 830.",
    diagram: "[Client (ncclient)]──NETCONF/SSH 830──▶ [IOS-XE] → XML",
    objective: "Turn on NETCONF, open a session, and issue a <get-config> filtered to interfaces.",
    explain:
      "NETCONF is a model-driven protocol (YANG data models) running over SSH port 830 with XML payloads and transactional edits. <get-config> reads a datastore (running); a subtree filter narrows the result to interfaces.",
    steps: [
      { desc: "Enable the NETCONF server on the device.", cmd: "Device(config)# netconf-yang" },
      { desc: "Send a get-config with an interface filter.", cmd: "<rpc message-id=\"1\">\n <get-config>\n  <source><running/></source>\n  <filter>\n   <interfaces xmlns=\"urn:ietf:params:xml:ns:yang:ietf-interfaces\"/>\n  </filter>\n </get-config>\n</rpc>" },
      { desc: "Example with Python ncclient.", cmd: "from ncclient import manager\nm = manager.connect(host='10.0.0.1', port=830,\n  username='admin', password='S3cret!', hostkey_verify=False)\nprint(m.get_config(source='running').data_xml)" },
    ],
    verify: "show platform software yang-management process\nshow netconf-yang sessions",
    expected:
      "nesd : Running\nncsshd : Running\nsession-id  transport  username\n  20        netconf-ssh  admin",
    mistakes: [
      "Connecting to port 22 instead of 830.",
      "Forgetting to enable 'netconf-yang' first.",
      "Malformed XML / wrong YANG namespace in the filter.",
    ],
  },
];

/* ===========================================================================
 * DATA :: QUESTIONS
 * ========================================================================= */
const QUESTIONS = [
  /* ===================== DOMAIN 1 :: 20 ===================== */
  {
    id: "q1",
    domain: 1,
    type: "single",
    q: "At which OSI layer does a router primarily operate, and what PDU does it process?",
    options: [
      "Layer 2, frames",
      "Layer 3, packets",
      "Layer 4, segments",
      "Layer 1, bits",
    ],
    answer: 1,
    explain:
      "Routers make forwarding decisions on Layer 3 (Network) using IP addresses; the Layer-3 PDU is the packet.",
  },
  {
    id: "q2",
    domain: 1,
    type: "single",
    q: "Which transport-layer protocol should carry a real-time VoIP call?",
    options: ["TCP, for guaranteed delivery", "UDP, for low latency", "ICMP", "ARP"],
    answer: 1,
    explain:
      "Voice favors low latency over retransmission. UDP is connectionless with minimal overhead; late retransmitted audio is useless, so UDP is preferred.",
  },
  {
    id: "q3",
    domain: 1,
    type: "single",
    q: "How many usable host addresses does a /29 subnet provide?",
    options: ["8", "6", "14", "30"],
    answer: 1,
    explain:
      "/29 leaves 3 host bits → 2^3 = 8 addresses, minus network and broadcast = 6 usable hosts.",
  },
  {
    id: "q4",
    domain: 1,
    type: "single",
    q: "Which address range is reserved for APIPA when a host fails to obtain a DHCP lease?",
    options: [
      "10.0.0.0/8",
      "172.16.0.0/12",
      "169.254.0.0/16",
      "192.168.0.0/16",
    ],
    answer: 2,
    explain:
      "APIPA self-assigns from 169.254.0.0/16 when DHCP is unavailable, enabling local link communication only.",
  },
  {
    id: "q5",
    domain: 1,
    type: "single",
    q: "What is the network address of host 172.16.45.130/26?",
    options: ["172.16.45.0", "172.16.45.64", "172.16.45.128", "172.16.45.192"],
    answer: 2,
    explain:
      "/26 → block size 64. Subnets: .0, .64, .128, .192. 130 falls in the .128 block, so the network is 172.16.45.128.",
  },
  {
    id: "q6",
    domain: 1,
    type: "single",
    q: "During EUI-64 generation, what is inserted into the middle of the 48-bit MAC address?",
    options: ["FFFF", "FFFE", "FE80", "0000"],
    answer: 1,
    explain:
      "EUI-64 splits the MAC and inserts FFFE in the middle to expand 48 bits to 64, then flips the U/L bit.",
  },
  {
    id: "q7",
    domain: 1,
    type: "single",
    q: "Which IPv6 address type always begins with FE80 and is never routed off the link?",
    options: ["Global unicast", "Unique local", "Link-local", "Multicast"],
    answer: 2,
    explain:
      "Link-local addresses (FE80::/10) are auto-configured on every IPv6 interface and are not forwarded by routers.",
  },
  {
    id: "q8",
    domain: 1,
    type: "single",
    q: "Which cable connects a PC's NIC to a switch access port?",
    options: ["Crossover", "Rollover", "Straight-through", "Coaxial"],
    answer: 2,
    explain:
      "Unlike devices (PC↔switch) use a straight-through cable. Crossover is for like devices; rollover is for console access.",
  },
  {
    id: "q9",
    domain: 1,
    type: "single",
    q: "Which field in an Ethernet II frame provides error detection?",
    options: ["Preamble", "Type", "FCS", "SFD"],
    answer: 2,
    explain:
      "The Frame Check Sequence (FCS) carries a CRC the receiver recomputes to detect corruption.",
  },
  {
    id: "q10",
    domain: 1,
    type: "single",
    q: "In CSMA/CD, what does a station do immediately after detecting a collision?",
    options: [
      "Increase transmission speed",
      "Send a jam signal then back off a random time",
      "Switch to full duplex",
      "Drop the frame silently",
    ],
    answer: 1,
    explain:
      "On collision the station sends a 32-bit jam signal so all hosts notice, then uses the random binary exponential back-off before retrying.",
  },
  {
    id: "q11",
    domain: 1,
    type: "single",
    q: "Which 2.4 GHz channels are non-overlapping in North America?",
    options: ["1, 5, 9", "1, 6, 11", "2, 7, 12", "1, 4, 8"],
    answer: 1,
    explain:
      "Channels 1, 6, and 11 are the standard non-overlapping 20 MHz channels in the 2.4 GHz band.",
  },
  {
    id: "q12",
    domain: 1,
    type: "single",
    q: "What distinguishes a container from a virtual machine?",
    options: [
      "A container includes its own full guest OS",
      "A container shares the host OS kernel",
      "A VM is always smaller than a container",
      "A container requires a Type 1 hypervisor",
    ],
    answer: 1,
    explain:
      "Containers share the host kernel and package only the app and its dependencies, making them lighter than VMs, which each run a full guest OS.",
  },
  {
    id: "q13",
    domain: 1,
    type: "single",
    q: "Which cloud service model delivers a complete, ready-to-use application over the Internet?",
    options: ["IaaS", "PaaS", "SaaS", "NFV"],
    answer: 2,
    explain:
      "SaaS provides finished software (e.g. webmail) to end users; IaaS provides infrastructure and PaaS provides a development platform.",
  },
  {
    id: "q14",
    domain: 1,
    type: "single",
    q: "What is the default subnet mask of a Class B address in dotted decimal?",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.128"],
    answer: 1,
    explain:
      "Class B (128–191 in the first octet) uses a default /16 = 255.255.0.0.",
  },
  {
    id: "q15",
    domain: 1,
    type: "multi",
    q: "Which two protocols operate at the OSI Transport layer? (Choose two.)",
    options: ["IP", "TCP", "UDP", "Ethernet"],
    answer: [1, 2],
    explain:
      "TCP and UDP are Layer-4 transport protocols. IP is Layer 3 and Ethernet is Layer 2.",
  },
  {
    id: "q16",
    domain: 1,
    type: "single",
    q: "Replacing ARP in IPv6, which protocol resolves a neighbor's link-layer address?",
    options: ["RARP", "NDP (Neighbor Discovery)", "ICMPv4", "DHCPv6"],
    answer: 1,
    explain:
      "NDP uses ICMPv6 Neighbor Solicitation/Advertisement messages to resolve addresses, replacing IPv4 ARP.",
  },
  {
    id: "q17",
    domain: 1,
    type: "single",
    q: "Which statement about the TCP three-way handshake is correct?",
    options: [
      "It is SYN, ACK, FIN",
      "It is SYN, SYN-ACK, ACK",
      "It uses four packets",
      "It carries the first data payload in the SYN",
    ],
    answer: 1,
    explain:
      "The handshake is SYN → SYN-ACK → ACK. Teardown is the separate four-way FIN exchange; data flows after the handshake.",
  },
  {
    id: "q18",
    domain: 1,
    type: "single",
    q: "How many subnets and hosts-per-subnet result from applying /28 to a Class C network?",
    options: [
      "16 subnets, 14 hosts each",
      "8 subnets, 30 hosts each",
      "14 subnets, 16 hosts each",
      "4 subnets, 62 hosts each",
    ],
    answer: 0,
    explain:
      "Going from /24 to /28 borrows 4 bits → 2^4 = 16 subnets, leaving 4 host bits → 2^4 − 2 = 14 hosts each.",
  },
  {
    id: "q19",
    domain: 1,
    type: "single",
    q: "Which IPv6 transition technique runs IPv4 and IPv6 simultaneously on the same interfaces?",
    options: ["NAT64", "Dual stack", "6to4 tunneling", "Teredo"],
    answer: 1,
    explain:
      "Dual stack assigns both IPv4 and IPv6 to interfaces so the device can communicate natively over either protocol.",
  },
  {
    id: "q20",
    domain: 1,
    type: "match",
    q: "Match each OSI layer to its PDU.",
    left: ["Transport", "Network", "Data Link", "Physical"],
    right: ["Bits", "Frame", "Packet", "Segment"],
    answer: [3, 2, 1, 0],
    explain:
      "Transport = Segment, Network = Packet, Data Link = Frame, Physical = Bits.",
  },

  /* ===================== DOMAIN 2 :: 20 ===================== */
  {
    id: "q21",
    domain: 2,
    type: "single",
    q: "What is the primary purpose of a VLAN?",
    options: [
      "To extend a single collision domain",
      "To segment a switch into separate Layer-2 broadcast domains",
      "To route between subnets",
      "To encrypt frames",
    ],
    answer: 1,
    explain:
      "A VLAN creates a logical broadcast domain; devices in different VLANs require a Layer-3 device to communicate.",
  },
  {
    id: "q22",
    domain: 2,
    type: "single",
    q: "How many bytes does an 802.1Q tag add to an Ethernet frame?",
    options: ["2", "4", "8", "12"],
    answer: 1,
    explain:
      "The 802.1Q tag is 4 bytes (TPID 2 bytes + TCI 2 bytes containing PCP, DEI and the 12-bit VLAN ID).",
  },
  {
    id: "q23",
    domain: 2,
    type: "single",
    q: "On an 802.1Q trunk, how are frames in the native VLAN transmitted?",
    options: ["Double-tagged", "Tagged with VLAN 1", "Untagged", "Dropped"],
    answer: 2,
    explain:
      "The native VLAN is sent untagged across the trunk; all other VLANs are tagged.",
  },
  {
    id: "q24",
    domain: 2,
    type: "single",
    q: "Which command forces an interface to be a trunk regardless of DTP negotiation?",
    options: [
      "switchport mode dynamic auto",
      "switchport mode access",
      "switchport mode trunk",
      "switchport nonegotiate only",
    ],
    answer: 2,
    explain:
      "'switchport mode trunk' hard-sets trunking. Best practice adds 'switchport nonegotiate' to disable DTP.",
  },
  {
    id: "q25",
    domain: 2,
    type: "single",
    q: "In STP, how is the root bridge elected?",
    options: [
      "Highest IP address",
      "Lowest Bridge ID (priority + MAC)",
      "Highest MAC address",
      "Fastest uplink",
    ],
    answer: 1,
    explain:
      "The switch with the lowest Bridge ID (priority plus extended system ID plus MAC) becomes the root bridge.",
  },
  {
    id: "q26",
    domain: 2,
    type: "single",
    q: "Which RSTP port role is a backup path to the root that is currently discarding?",
    options: ["Root port", "Designated port", "Alternate port", "Edge port"],
    answer: 2,
    explain:
      "An alternate port offers an alternative path to the root and is in the discarding state until the root port fails.",
  },
  {
    id: "q27",
    domain: 2,
    type: "single",
    q: "What is the default STP path cost of a 1 Gbps link?",
    options: ["1", "4", "19", "100"],
    answer: 1,
    explain:
      "Using the standard short cost values: 10 Mbps = 100, 100 Mbps = 19, 1 Gbps = 4, 10 Gbps = 2.",
  },
  {
    id: "q28",
    domain: 2,
    type: "single",
    q: "Which feature err-disables a PortFast-enabled access port if it receives a BPDU?",
    options: ["Root Guard", "BPDU Guard", "Loop Guard", "UDLD"],
    answer: 1,
    explain:
      "BPDU Guard shuts (err-disables) a PortFast port that receives a BPDU, protecting against an unauthorized switch.",
  },
  {
    id: "q29",
    domain: 2,
    type: "single",
    q: "Which two LACP mode combinations will successfully form an EtherChannel?",
    options: [
      "passive / passive",
      "active / passive",
      "auto / auto",
      "on / active",
    ],
    answer: 1,
    explain:
      "LACP forms with active/active or active/passive. Passive/passive never initiates; on/active mixes static with LACP and fails.",
  },
  {
    id: "q30",
    domain: 2,
    type: "single",
    q: "Why does STP not block links that are bundled in an EtherChannel?",
    options: [
      "EtherChannel disables STP globally",
      "STP sees the bundle as a single logical link",
      "EtherChannel uses Layer 3 only",
      "BPDUs are filtered on the bundle",
    ],
    answer: 1,
    explain:
      "EtherChannel presents the member links as one logical port to STP, so there is no redundant path for STP to block.",
  },
  {
    id: "q31",
    domain: 2,
    type: "single",
    q: "Which protocol tunnels traffic between a lightweight AP and a WLC?",
    options: ["GRE", "CAPWAP", "IPsec", "LWAPP only"],
    answer: 1,
    explain:
      "CAPWAP tunnels control (UDP 5246) and data (UDP 5247) between lightweight APs and the WLC.",
  },
  {
    id: "q32",
    domain: 2,
    type: "single",
    q: "Which AP mode lets a branch AP keep switching client traffic locally if the WAN link to the WLC fails?",
    options: ["Local", "Monitor", "FlexConnect", "Sniffer"],
    answer: 2,
    explain:
      "FlexConnect allows the AP to switch client data locally and continue operating when the WLC/WAN connection is down.",
  },
  {
    id: "q33",
    domain: 2,
    type: "single",
    q: "What does the command 'switchport access vlan 10' accomplish?",
    options: [
      "Creates VLAN 10 as a trunk",
      "Assigns the access port to VLAN 10",
      "Sets the native VLAN to 10",
      "Prunes VLAN 10",
    ],
    answer: 1,
    explain:
      "It places the access port into VLAN 10. (If VLAN 10 doesn't exist it is created automatically.)",
  },
  {
    id: "q34",
    domain: 2,
    type: "single",
    q: "An IP phone with a PC behind it connects to a switch port. Which command supports voice traffic in a separate VLAN?",
    options: [
      "switchport trunk allowed vlan voice",
      "switchport voice vlan 110",
      "switchport mode trunk",
      "voice vlan dot1p",
    ],
    answer: 1,
    explain:
      "'switchport voice vlan 110' tags voice traffic into VLAN 110 while data stays in the access VLAN.",
  },
  {
    id: "q35",
    domain: 2,
    type: "multi",
    q: "Which two conditions cause EtherChannel member ports to be suspended? (Choose two.)",
    options: [
      "Mismatched duplex between members",
      "Identical speed on all members",
      "Different allowed VLAN lists between ends",
      "Same channel-group number",
    ],
    answer: [0, 2],
    explain:
      "Members must match speed, duplex and VLAN configuration. Mismatched duplex or inconsistent allowed VLANs suspend the ports.",
  },
  {
    id: "q36",
    domain: 2,
    type: "single",
    q: "Which transition is unique to RSTP compared with legacy 802.1D?",
    options: [
      "It adds a Listening state",
      "It achieves convergence faster using proposal/agreement",
      "It removes the root bridge concept",
      "It blocks all alternate ports permanently",
    ],
    answer: 1,
    explain:
      "RSTP (802.1w) converges in seconds using a proposal/agreement handshake instead of timer-based Listening/Learning delays.",
  },
  {
    id: "q37",
    domain: 2,
    type: "single",
    q: "What is the result of a native VLAN mismatch on a trunk?",
    options: [
      "Trunk speed doubles",
      "Traffic in the native VLANs can leak between them (security/connectivity issue)",
      "The trunk converts to access mode",
      "All VLANs stop forwarding",
    ],
    answer: 1,
    explain:
      "Mismatched native VLANs cause untagged traffic to land in the wrong VLAN, creating a connectivity and VLAN-hopping risk; CDP logs the mismatch.",
  },
  {
    id: "q38",
    domain: 2,
    type: "single",
    q: "Which command set makes a switch the root bridge for VLAN 1 with the highest possible preference?",
    options: [
      "spanning-tree vlan 1 priority 61440",
      "spanning-tree vlan 1 priority 4096",
      "spanning-tree vlan 1 cost 1",
      "spanning-tree portfast default",
    ],
    answer: 1,
    explain:
      "Lower priority wins. 4096 is much lower than the 32768 default, so this switch becomes root. Priorities must be multiples of 4096.",
  },
  {
    id: "q39",
    domain: 2,
    type: "single",
    q: "On which device/interface is router-on-a-stick configured?",
    options: [
      "A single router physical interface split into 802.1Q subinterfaces",
      "Each switch access port",
      "The WLC management interface",
      "An EtherChannel port-channel",
    ],
    answer: 0,
    explain:
      "Router-on-a-stick uses one router interface divided into subinterfaces, each with 'encapsulation dot1Q <vlan>', trunked to the switch.",
  },
  {
    id: "q40",
    domain: 2,
    type: "match",
    q: "Match each RSTP port role to its description.",
    left: ["Root port", "Designated port", "Alternate port"],
    right: [
      "Forwarding port elected per segment",
      "Best path to the root bridge",
      "Discarding backup path to the root",
    ],
    answer: [1, 0, 2],
    explain:
      "Root port = best path to root; Designated port = forwarding port per segment; Alternate port = discarding backup to the root.",
  },

  /* ===================== DOMAIN 3 :: 25 ===================== */
  {
    id: "q41",
    domain: 3,
    type: "single",
    q: "What administrative distance does a standard static route have by default?",
    options: ["0", "1", "90", "110"],
    answer: 1,
    explain:
      "A static route has AD 1 by default (connected is 0). Lower AD is more trusted.",
  },
  {
    id: "q42",
    domain: 3,
    type: "single",
    q: "Which administrative distance does OSPF use?",
    options: ["90", "100", "110", "120"],
    answer: 2,
    explain:
      "OSPF's AD is 110. EIGRP internal is 90, RIP is 120.",
  },
  {
    id: "q43",
    domain: 3,
    type: "single",
    q: "A router has routes to 10.1.1.0/24 via OSPF and a /32 to 10.1.1.5 via static. Which is used for traffic to 10.1.1.5?",
    options: [
      "OSPF, lower AD",
      "The /32 static, longest prefix match",
      "Both, load-balanced",
      "Neither, they conflict",
    ],
    answer: 1,
    explain:
      "Longest prefix match is evaluated before AD. The more specific /32 wins for 10.1.1.5.",
  },
  {
    id: "q44",
    domain: 3,
    type: "single",
    q: "Which static route is a 'floating' backup?",
    options: [
      "ip route 0.0.0.0 0.0.0.0 g0/0",
      "ip route 10.0.0.0 255.0.0.0 192.168.1.2",
      "ip route 10.0.0.0 255.0.0.0 192.168.1.6 200",
      "ip route 10.0.0.0 255.255.255.0 null0",
    ],
    answer: 2,
    explain:
      "Appending an AD higher than the primary (here 200) makes it a floating static that installs only when the primary fails.",
  },
  {
    id: "q45",
    domain: 3,
    type: "single",
    q: "How is OSPF cost calculated by default?",
    options: [
      "Hop count",
      "Reference bandwidth (100 Mbps) divided by interface bandwidth",
      "Delay plus bandwidth",
      "Bandwidth times reliability",
    ],
    answer: 1,
    explain:
      "Default OSPF cost = reference bandwidth (100 Mbps) / interface bandwidth, with a minimum of 1.",
  },
  {
    id: "q46",
    domain: 3,
    type: "single",
    q: "In which OSPF neighbor state is the DR/BDR elected on a multi-access network?",
    options: ["Init", "2-Way", "ExStart", "Full"],
    answer: 1,
    explain:
      "DR/BDR election occurs in the 2-Way state once routers see themselves in each other's hello packets.",
  },
  {
    id: "q47",
    domain: 3,
    type: "single",
    q: "How is the OSPF Router-ID chosen if none is configured and no loopback exists?",
    options: [
      "Lowest interface IP",
      "Highest active interface IP",
      "The first configured interface",
      "Random value",
    ],
    answer: 1,
    explain:
      "Order: manual 'router-id', then highest loopback IP, then highest active physical interface IP.",
  },
  {
    id: "q48",
    domain: 3,
    type: "single",
    q: "Which OSPF LSA type is generated by an ABR to advertise inter-area routes?",
    options: ["Type 1", "Type 2", "Type 3", "Type 5"],
    answer: 2,
    explain:
      "Type 3 Summary LSAs are generated by the ABR to describe routes from one area into another.",
  },
  {
    id: "q49",
    domain: 3,
    type: "single",
    q: "Two OSPF routers are stuck in EXSTART/EXCHANGE. What is a common cause?",
    options: [
      "Different process IDs",
      "MTU mismatch on the link",
      "Different hostnames",
      "Same Router-ID priority",
    ],
    answer: 1,
    explain:
      "An interface MTU mismatch commonly traps adjacencies in EXSTART/EXCHANGE. OSPF process IDs are locally significant and need not match.",
  },
  {
    id: "q50",
    domain: 3,
    type: "single",
    q: "Which requirement must match for two routers to form an OSPF adjacency?",
    options: [
      "OSPF process ID",
      "Hello and dead timers",
      "Router hostnames",
      "Loopback addresses",
    ],
    answer: 1,
    explain:
      "Hello/dead timers, area ID, subnet/mask, authentication and MTU must match. The process ID is locally significant.",
  },
  {
    id: "q51",
    domain: 3,
    type: "single",
    q: "Which command advertises 10.1.1.0/24 into OSPF area 0 with the correct wildcard mask?",
    options: [
      "network 10.1.1.0 255.255.255.0 area 0",
      "network 10.1.1.0 0.0.0.255 area 0",
      "network 10.1.1.0 0.0.255.255 area 0",
      "network 10.1.1.0 area 0",
    ],
    answer: 1,
    explain:
      "OSPF network statements use a wildcard (inverse) mask. /24 → 0.0.0.255.",
  },
  {
    id: "q52",
    domain: 3,
    type: "single",
    q: "Which FHRP is an open standard?",
    options: ["HSRP", "GLBP", "VRRP", "PAgP"],
    answer: 2,
    explain:
      "VRRP is the IETF open standard. HSRP and GLBP are Cisco proprietary; PAgP is an EtherChannel protocol, not an FHRP.",
  },
  {
    id: "q53",
    domain: 3,
    type: "single",
    q: "By default, what must be enabled for a recovered higher-priority HSRP router to retake the active role?",
    options: ["Tracking", "Preempt", "Authentication", "Timers"],
    answer: 1,
    explain:
      "HSRP preempt is disabled by default; without it the higher-priority router stays standby after recovery.",
  },
  {
    id: "q54",
    domain: 3,
    type: "single",
    q: "Which HSRP router becomes active when priorities are equal?",
    options: [
      "The one with the lowest IP",
      "The one with the highest IP",
      "The one with the lowest MAC",
      "Neither — election fails",
    ],
    answer: 1,
    explain:
      "With equal priority, the router with the highest interface IP address wins the active role.",
  },
  {
    id: "q55",
    domain: 3,
    type: "single",
    q: "What does 'ipv6 unicast-routing' enable on a router?",
    options: [
      "IPv6 addressing on interfaces",
      "Forwarding/routing of IPv6 packets",
      "OSPFv3 only",
      "Stateless DHCPv6",
    ],
    answer: 1,
    explain:
      "It enables the router to forward IPv6 traffic. Without it the router can have IPv6 addresses but won't route between them.",
  },
  {
    id: "q56",
    domain: 3,
    type: "single",
    q: "Which next-hop type does OSPFv3 use to install routes?",
    options: [
      "Global unicast of the neighbor",
      "Link-local address of the neighbor",
      "The DR's loopback",
      "Anycast address",
    ],
    answer: 1,
    explain:
      "OSPFv3 uses the neighbor's link-local address as the next hop for installed routes.",
  },
  {
    id: "q57",
    domain: 3,
    type: "single",
    q: "Which route would a router prefer: eBGP (AD 20) or OSPF (AD 110) for the same prefix/length?",
    options: ["OSPF", "eBGP", "Both", "The one with lower metric"],
    answer: 1,
    explain:
      "With identical prefix length, the lower administrative distance wins. eBGP's AD 20 beats OSPF's 110.",
  },
  {
    id: "q58",
    domain: 3,
    type: "single",
    q: "What is the AD of a directly connected interface?",
    options: ["0", "1", "5", "110"],
    answer: 0,
    explain:
      "Connected routes have AD 0 — the most trusted source.",
  },
  {
    id: "q59",
    domain: 3,
    type: "single",
    q: "A default route is written as which of the following?",
    options: [
      "ip route 0.0.0.0 255.255.255.255 <nh>",
      "ip route 0.0.0.0 0.0.0.0 <nh>",
      "ip route default <nh>",
      "ip default-network only",
    ],
    answer: 1,
    explain:
      "The default route uses all-zeros network and mask: ip route 0.0.0.0 0.0.0.0 <next-hop>.",
  },
  {
    id: "q60",
    domain: 3,
    type: "single",
    q: "On a broadcast OSPF segment, which routers do DROthers form a FULL adjacency with?",
    options: [
      "All other routers",
      "Only the DR and BDR",
      "Only the DR",
      "None",
    ],
    answer: 1,
    explain:
      "DROthers form FULL adjacencies only with the DR and BDR; with each other they remain in the 2-Way state.",
  },
  {
    id: "q61",
    domain: 3,
    type: "single",
    q: "Which OSPF interface priority value prevents a router from ever becoming the DR?",
    options: ["255", "1", "0", "128"],
    answer: 2,
    explain:
      "An OSPF interface priority of 0 makes the router ineligible for DR/BDR election on that segment.",
  },
  {
    id: "q62",
    domain: 3,
    type: "multi",
    q: "Which two are valid OSPF LSA types and their origins? (Choose two.)",
    options: [
      "Type 1 Router LSA — every router, within an area",
      "Type 5 External LSA — generated by the ABR",
      "Type 2 Network LSA — generated by the DR",
      "Type 3 Summary LSA — generated by the ASBR",
    ],
    answer: [0, 2],
    explain:
      "Type 1 is the router LSA flooded within an area; Type 2 is created by the DR. Type 5 comes from the ASBR and Type 3 from the ABR (the reverse of the wrong options).",
  },
  {
    id: "q63",
    domain: 3,
    type: "single",
    q: "What does the routing table code 'O IA' indicate?",
    options: [
      "OSPF intra-area route",
      "OSPF inter-area route",
      "OSPF external type 1",
      "An invalid route",
    ],
    answer: 1,
    explain:
      "'O IA' marks an OSPF inter-area route learned via a Type-3 summary LSA from an ABR.",
  },
  {
    id: "q64",
    domain: 3,
    type: "single",
    q: "Which command makes an interface participate in OSPF routing while not sending hellos out of it?",
    options: [
      "passive-interface",
      "no ip ospf",
      "shutdown",
      "ip ospf network point-to-point",
    ],
    answer: 0,
    explain:
      "'passive-interface' still advertises the subnet but stops OSPF hellos, preventing adjacencies on that interface (e.g. LAN edges).",
  },
  {
    id: "q65",
    domain: 3,
    type: "match",
    q: "Match each routing source to its administrative distance.",
    left: ["Connected", "Static", "OSPF", "RIP"],
    right: ["120", "0", "110", "1"],
    answer: [1, 3, 2, 0],
    explain:
      "Connected = 0, Static = 1, OSPF = 110, RIP = 120.",
  },

  /* ===================== DOMAIN 4 :: 10 ===================== */
  {
    id: "q66",
    domain: 4,
    type: "single",
    q: "Which NAT variation lets many inside hosts share one public IP using unique source ports?",
    options: ["Static NAT", "Dynamic NAT", "PAT (overload)", "Twice NAT"],
    answer: 2,
    explain:
      "PAT (NAT overload) multiplexes many private hosts onto one public IP by tracking unique source port numbers.",
  },
  {
    id: "q67",
    domain: 4,
    type: "single",
    q: "What is the correct order of the DHCP DORA process?",
    options: [
      "Discover, Offer, Request, Acknowledge",
      "Offer, Discover, Request, Ack",
      "Request, Offer, Discover, Ack",
      "Discover, Request, Offer, Ack",
    ],
    answer: 0,
    explain:
      "DORA = Discover (client broadcast) → Offer (server) → Request (client broadcast) → Acknowledge (server).",
  },
  {
    id: "q68",
    domain: 4,
    type: "single",
    q: "Which command lets a router forward DHCP requests to a server on another subnet?",
    options: [
      "ip dhcp relay",
      "ip helper-address <server>",
      "ip forward-protocol dhcp",
      "service dhcp remote",
    ],
    answer: 1,
    explain:
      "'ip helper-address' on the client-facing SVI/interface converts the DHCP broadcast to a unicast toward the server.",
  },
  {
    id: "q69",
    domain: 4,
    type: "single",
    q: "Which DNS record maps a hostname to an IPv6 address?",
    options: ["A", "AAAA", "CNAME", "MX"],
    answer: 1,
    explain:
      "AAAA records resolve a name to an IPv6 address; A records are for IPv4.",
  },
  {
    id: "q70",
    domain: 4,
    type: "single",
    q: "An NTP device reporting stratum 16 indicates what?",
    options: [
      "It is the most accurate source",
      "It is unsynchronized",
      "It is a stratum-1 backup",
      "It is in client mode only",
    ],
    answer: 1,
    explain:
      "Stratum 16 means the clock is unsynchronized; lower stratum numbers are closer to the reference clock (stratum 0).",
  },
  {
    id: "q71",
    domain: 4,
    type: "single",
    q: "Which SNMP version provides authentication and encryption?",
    options: ["v1", "v2c", "v3", "v2"],
    answer: 2,
    explain:
      "SNMPv3 adds message integrity, authentication and encryption (authPriv). v1/v2c rely on cleartext community strings.",
  },
  {
    id: "q72",
    domain: 4,
    type: "single",
    q: "On the syslog severity scale, which level is the most severe?",
    options: ["0 Emergency", "7 Debugging", "4 Warning", "5 Notification"],
    answer: 0,
    explain:
      "Lower numbers are more severe: 0 = Emergency (system unusable), 7 = Debugging (least severe).",
  },
  {
    id: "q73",
    domain: 4,
    type: "single",
    q: "Which DSCP marking is typically used for voice traffic?",
    options: ["EF (46)", "AF11 (10)", "CS1 (8)", "Default (0)"],
    answer: 0,
    explain:
      "Expedited Forwarding (EF, DSCP 46) is the standard marking for latency-sensitive voice, usually served by a low-latency priority queue.",
  },
  {
    id: "q74",
    domain: 4,
    type: "multi",
    q: "Which two are configured in a basic IOS DHCP pool? (Choose two.)",
    options: [
      "network statement",
      "default-router",
      "spanning-tree priority",
      "channel-group",
    ],
    answer: [0, 1],
    explain:
      "A DHCP pool defines the 'network' (subnet/mask) and 'default-router' (gateway), plus optional dns-server, lease, etc.",
  },
  {
    id: "q75",
    domain: 4,
    type: "single",
    q: "Which command verifies active NAT/PAT entries?",
    options: [
      "show ip nat translations",
      "show ip route",
      "show running-config nat",
      "show nat pool",
    ],
    answer: 0,
    explain:
      "'show ip nat translations' lists current inside-local/global mappings; 'show ip nat statistics' shows counters.",
  },

  /* ===================== DOMAIN 5 :: 15 ===================== */
  {
    id: "q76",
    domain: 5,
    type: "single",
    q: "Where should a standard ACL generally be placed?",
    options: [
      "Close to the source",
      "Close to the destination",
      "On the trunk only",
      "On a loopback",
    ],
    answer: 1,
    explain:
      "Standard ACLs match source only, so placing them near the destination avoids accidentally blocking traffic to other networks.",
  },
  {
    id: "q77",
    domain: 5,
    type: "single",
    q: "Which wildcard mask matches exactly the 192.168.4.0/24 network?",
    options: ["0.0.0.0", "0.0.0.255", "0.0.255.255", "255.255.255.0"],
    answer: 1,
    explain:
      "A /24 corresponds to wildcard 0.0.0.255 (0 = must match, 1 = ignore).",
  },
  {
    id: "q78",
    domain: 5,
    type: "single",
    q: "What is appended implicitly to the end of every ACL?",
    options: ["permit ip any any", "deny ip any any", "permit tcp any any", "nothing"],
    answer: 1,
    explain:
      "Every ACL ends with an implicit 'deny any', so anything not explicitly permitted is dropped.",
  },
  {
    id: "q79",
    domain: 5,
    type: "single",
    q: "Which port-security violation mode drops traffic and sends a log/SNMP trap but does NOT disable the port?",
    options: ["protect", "restrict", "shutdown", "secure"],
    answer: 1,
    explain:
      "'restrict' drops offending frames and increments counters/logs; 'protect' is silent; 'shutdown' err-disables the port.",
  },
  {
    id: "q80",
    domain: 5,
    type: "single",
    q: "What does 'switchport port-security mac-address sticky' do?",
    options: [
      "Statically pins one vendor OUI",
      "Dynamically learns MACs and saves them to running-config",
      "Blocks all MAC learning",
      "Enables 802.1X",
    ],
    answer: 1,
    explain:
      "Sticky learning dynamically captures connected MACs and writes them into the running-config so they persist (after saving).",
  },
  {
    id: "q81",
    domain: 5,
    type: "single",
    q: "Which AAA protocol uses TCP port 49 and encrypts the entire payload?",
    options: ["RADIUS", "TACACS+", "Kerberos", "LDAP"],
    answer: 1,
    explain:
      "TACACS+ runs over TCP 49 and encrypts the full packet, and separates authentication, authorization and accounting — ideal for device administration.",
  },
  {
    id: "q82",
    domain: 5,
    type: "single",
    q: "RADIUS uses which transport and encrypts what?",
    options: [
      "TCP 49, entire payload",
      "UDP 1812/1813, password only",
      "UDP 49, all attributes",
      "TCP 1812, entire payload",
    ],
    answer: 1,
    explain:
      "RADIUS uses UDP (1812 auth, 1813 accounting) and encrypts only the password field, combining authn and authz.",
  },
  {
    id: "q83",
    domain: 5,
    type: "single",
    q: "Which Layer-2 mitigation stops a rogue DHCP server from handing out addresses?",
    options: [
      "Dynamic ARP Inspection",
      "DHCP snooping",
      "Port security",
      "BPDU Guard",
    ],
    answer: 1,
    explain:
      "DHCP snooping marks trusted ports (toward the legitimate server) and drops server-sourced messages on untrusted ports.",
  },
  {
    id: "q84",
    domain: 5,
    type: "single",
    q: "Which security feature relies on the DHCP snooping binding table to validate ARP replies?",
    options: [
      "IP Source Guard only",
      "Dynamic ARP Inspection (DAI)",
      "Storm control",
      "Root Guard",
    ],
    answer: 1,
    explain:
      "DAI uses the DHCP snooping binding table to verify ARP messages, dropping spoofed ARP replies.",
  },
  {
    id: "q85",
    domain: 5,
    type: "single",
    q: "Which wireless security uses SAE to replace the pre-shared-key 4-way handshake?",
    options: ["WEP", "WPA", "WPA2-Personal", "WPA3"],
    answer: 3,
    explain:
      "WPA3 introduces Simultaneous Authentication of Equals (SAE), protecting against offline dictionary attacks on the PSK.",
  },
  {
    id: "q86",
    domain: 5,
    type: "single",
    q: "Which prerequisite is required before enabling SSH on a router?",
    options: [
      "Disable AAA",
      "Configure a hostname and a domain name",
      "Set the native VLAN",
      "Enable Telnet first",
    ],
    answer: 1,
    explain:
      "SSH needs a hostname and ip domain-name to label the RSA key pair, plus an RSA key of at least 1024 bits and a login method.",
  },
  {
    id: "q87",
    domain: 5,
    type: "single",
    q: "Which command on the VTY lines disables Telnet and permits only SSH?",
    options: [
      "transport input all",
      "transport input telnet",
      "transport input ssh",
      "no login local",
    ],
    answer: 2,
    explain:
      "'transport input ssh' under the VTY lines restricts remote access to SSH, blocking cleartext Telnet.",
  },
  {
    id: "q88",
    domain: 5,
    type: "multi",
    q: "Which two are correct ACL placement guidelines? (Choose two.)",
    options: [
      "Place extended ACLs close to the source",
      "Place extended ACLs close to the destination",
      "Place standard ACLs close to the destination",
      "Place standard ACLs close to the source",
    ],
    answer: [0, 2],
    explain:
      "Extended ACLs (granular) go near the source to drop traffic early; standard ACLs (source-only) go near the destination.",
  },
  {
    id: "q89",
    domain: 5,
    type: "single",
    q: "Which command best protects the privileged EXEC password?",
    options: [
      "enable password cisco",
      "enable secret cisco",
      "service password-encryption only",
      "username cisco password cisco",
    ],
    answer: 1,
    explain:
      "'enable secret' stores a strong hash (MD5/scrypt), far stronger than 'enable password', which can be weakly encrypted or cleartext.",
  },
  {
    id: "q90",
    domain: 5,
    type: "single",
    q: "VLAN double-tagging (VLAN hopping) is best mitigated by which action?",
    options: [
      "Enable DTP everywhere",
      "Use the data VLAN as the native VLAN",
      "Set the native VLAN to an unused VLAN and disable DTP on access ports",
      "Allow all VLANs on every trunk",
    ],
    answer: 2,
    explain:
      "Assigning an unused, dedicated native VLAN (and never using VLAN 1) plus disabling DTP on access/unused ports defeats double-tagging attacks.",
  },

  /* ===================== DOMAIN 6 :: 10 ===================== */
  {
    id: "q91",
    domain: 6,
    type: "single",
    q: "In SDN, which plane is responsible for actually forwarding packets?",
    options: ["Control plane", "Data (forwarding) plane", "Management plane", "Application plane"],
    answer: 1,
    explain:
      "The data/forwarding plane moves packets based on tables; the control plane builds those tables; the management plane handles admin access.",
  },
  {
    id: "q92",
    domain: 6,
    type: "single",
    q: "Which REST/HTTP verb retrieves data without modifying the resource?",
    options: ["POST", "GET", "PUT", "DELETE"],
    answer: 1,
    explain:
      "GET reads a resource (idempotent, no change). POST creates, PUT updates/replaces, DELETE removes.",
  },
  {
    id: "q93",
    domain: 6,
    type: "single",
    q: "An API call returns HTTP 401. What does this indicate?",
    options: [
      "Success",
      "Resource not found",
      "Unauthorized (authentication failed/expired)",
      "Server error",
    ],
    answer: 2,
    explain:
      "401 Unauthorized means authentication is missing/invalid (e.g. an expired token). 404 = not found, 5xx = server error.",
  },
  {
    id: "q94",
    domain: 6,
    type: "single",
    q: "Which statement about Ansible is correct?",
    options: [
      "It requires an agent on each device",
      "It is agentless and typically uses SSH",
      "It only manages Cisco devices",
      "It uses HCL playbooks",
    ],
    answer: 1,
    explain:
      "Ansible is agentless, connecting over SSH (or network_cli). Playbooks are YAML; HCL is Terraform's language.",
  },
  {
    id: "q95",
    domain: 6,
    type: "single",
    q: "Which tool is a declarative Infrastructure-as-Code language using HCL?",
    options: ["Ansible", "Puppet", "Terraform", "Chef"],
    answer: 2,
    explain:
      "Terraform uses HCL and a declarative model: you define the desired state and it computes the plan to reach it.",
  },
  {
    id: "q96",
    domain: 6,
    type: "single",
    q: "Which protocol is model-driven, runs over SSH port 830, and uses XML payloads?",
    options: ["RESTCONF", "NETCONF", "SNMP", "gRPC"],
    answer: 1,
    explain:
      "NETCONF uses YANG models over SSH (port 830) with XML and transactional edits. RESTCONF is REST-style over HTTPS.",
  },
  {
    id: "q97",
    domain: 6,
    type: "single",
    q: "In the JSON snippet { \"enabled\": true }, what data type is the value?",
    options: ["String", "Boolean", "Number", "Null"],
    answer: 1,
    explain:
      "true/false are JSON booleans (no quotes). Quoted text is a string, bare digits are numbers, and null is its own type.",
  },
  {
    id: "q98",
    domain: 6,
    type: "single",
    q: "Which describes intent-based networking (IBN)?",
    options: [
      "Manual box-by-box CLI configuration",
      "The controller translates business intent into config and continuously assures it",
      "A routing protocol",
      "A type of switch ASIC",
    ],
    answer: 1,
    explain:
      "IBN captures intent (policy/outcome), translates it into device configuration, activates it, and uses telemetry/assurance to keep the network aligned to that intent.",
  },
  {
    id: "q99",
    domain: 6,
    type: "single",
    q: "How does AI/ML add value to network operations (AIOps)?",
    options: [
      "By replacing all routing protocols",
      "By analyzing telemetry for anomaly detection and predictive insight",
      "By encrypting management traffic",
      "By assigning IP addresses",
    ],
    answer: 1,
    explain:
      "AIOps applies machine learning to telemetry to baseline normal behavior, detect anomalies, predict failures/capacity and speed root-cause analysis.",
  },
  {
    id: "q100",
    domain: 6,
    type: "match",
    q: "Match each automation tool/protocol to its key trait.",
    left: ["Ansible", "Terraform", "NETCONF", "REST API"],
    right: [
      "Declarative IaC using HCL",
      "Agentless YAML playbooks over SSH",
      "Stateless HTTPS with JSON, uses verbs like GET/POST",
      "Model-driven, XML over SSH 830",
    ],
    answer: [1, 0, 3, 2],
    explain:
      "Ansible = agentless YAML over SSH; Terraform = declarative HCL IaC; NETCONF = XML over SSH 830; REST API = stateless HTTPS/JSON with HTTP verbs.",
  },
];
