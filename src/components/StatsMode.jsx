import { Zap, Target, Award } from "lucide-react";
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
import { formatClock } from "../utils";
import { levelFor } from "../levels";
import { DOMAINS } from "../data/domains";
import { LABS } from "../data/labs";
import Panel from "./Panel";
import TermBar from "./TermBar";
import SectionHeader from "./SectionHeader";

/* ===========================================================================
 * STATS MODE
 * ========================================================================= */
export default function StatsMode({ completedLabs, examHistory, xp }) {
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
