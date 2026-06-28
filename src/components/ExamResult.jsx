import { AlertTriangle, RotateCcw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { C, DOMAIN_COLORS } from "../theme";
import { formatClock, sameSet } from "../utils";
import { DOMAINS } from "../data/domains";
import Panel from "./Panel";
import TermBar from "./TermBar";
import SectionHeader from "./SectionHeader";

export default function ExamResult({ result, pool, answers, onRetake }) {
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
