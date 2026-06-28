import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { Clock, Flag } from "lucide-react";
import { C, DOMAIN_COLORS } from "../theme";
import { formatClock, sameSet } from "../utils";
import { QUESTIONS } from "../data/questions";
import { DOMAINS } from "../data/domains";
import Panel from "./Panel";
import SectionHeader from "./SectionHeader";

// The score report pulls in the (large) charting library — load on demand.
const ExamResult = lazy(() => import("./ExamResult"));

/* ===========================================================================
 * EXAM MODE
 * ========================================================================= */
export const EXAM_SECONDS = 120 * 60;
export const PASS_THRESHOLD = 0.825;

// A question counts as answered unless it is unset or an emptied multi-select.
const isAnswered = (val) =>
  val !== undefined && !(Array.isArray(val) && val.length === 0);

export default function ExamMode({ onFinish }) {
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
  // Authoritative remaining-time counter (state mirror is for display only).
  const secondsRef = useRef(EXAM_SECONDS);
  // Always points at the latest finalize so the timer can call it without
  // listing finalize as an effect dependency (which would restart the clock).
  const finalizeRef = useRef(null);

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
        let ok;
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
        timeTaken: EXAM_SECONDS - secondsRef.current,
        date: new Date().toISOString(),
        domainFilter,
      };
      setResult(res);
      setPhase("result");
      if (timerRef.current) clearInterval(timerRef.current);
      onFinish(res);
    },
    [pool, answers, domainFilter, onFinish]
  );

  // Keep the timer's finalize reference current without restarting the clock.
  useEffect(() => {
    finalizeRef.current = finalize;
  }, [finalize]);

  // Countdown timer. Decrements the authoritative ref each tick and mirrors it
  // to display state; auto-submits from inside the (async) interval callback
  // when the clock reaches zero, so it fires exactly once.
  useEffect(() => {
    if (phase !== "running") return;
    timerRef.current = setInterval(() => {
      secondsRef.current = Math.max(0, secondsRef.current - 1);
      setSecondsLeft(secondsRef.current);
      if (secondsRef.current === 0) {
        clearInterval(timerRef.current);
        finalizeRef.current?.();
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  const start = () => {
    const p = buildPool(domainFilter);
    setPool(p);
    setAnswers({});
    setFlagged({});
    setCur(0);
    secondsRef.current = EXAM_SECONDS;
    setSecondsLeft(EXAM_SECONDS);
    setResult(null);
    setPhase("running");
  };

  const answeredCount = Object.values(answers).filter(isAnswered).length;

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
      <Suspense
        fallback={<div style={{ color: C.comment, padding: 14 }}>❯ scoring…</div>}
      >
        <ExamResult
          result={result}
          pool={pool}
          answers={answers}
          onRetake={() => setPhase("config")}
        />
      </Suspense>
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
          const isAns = isAnswered(answers[pq.id]);
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
