import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import {
  Terminal,
  BookOpen,
  FlaskConical,
  ClipboardCheck,
  Activity,
  Zap,
  Trophy,
} from "lucide-react";
import { C } from "./theme";
import { levelFor } from "./levels";
import { DOMAINS } from "./data/domains";
import { LABS } from "./data/labs";
import { QUESTIONS } from "./data/questions";
import StudyMode from "./components/StudyMode";
import LabsMode from "./components/LabsMode";
import ExamMode from "./components/ExamMode";

// Stats pulls in the (large) charting library — load it on demand.
const StatsMode = lazy(() => import("./components/StatsMode"));

function Loading() {
  return <div style={{ color: C.comment, padding: 14 }}>❯ loading…</div>;
}

/* ============================================================================
 * CCNA 200-301 v1.1 :: Interactive Study Platform
 * Arch/btop terminal aesthetic. No external API calls, no persistence —
 * all state lives in React for the session only.
 * ==========================================================================*/

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
          <Suspense fallback={<Loading />}>
            <StatsMode
              completedLabs={completedLabs}
              examHistory={examHistory}
              xp={xp}
            />
          </Suspense>
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
