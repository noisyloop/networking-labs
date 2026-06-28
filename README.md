# CCNA 200-301 v1.1 — Interactive Study Platform

A single-page study, lab, and exam platform for the **CCNA 200-301 v1.1**
blueprint, styled after the Arch Linux / `btop` terminal aesthetic — dark
Tokyo-Night palette, monospace type, ASCII box borders, block progress bars,
and a subtle CRT scanline overlay.

```
ccna@200-301:~$ ./study --v1.1
[STUDY] [LABS] [EXAM] [STATS]
```

## Modes

### `[STUDY]` — Content Guide
All six exam domains, each expandable, with a `btop`-style weight bar and
collapsible technical subsections:

| # | Domain | Weight |
|---|--------|--------|
| 01 | Network Fundamentals | 20% |
| 02 | Network Access | 20% |
| 03 | IP Connectivity | 25% |
| 04 | IP Services | 10% |
| 05 | Security Fundamentals | 15% |
| 06 | Automation & Programmability | 10% |

Covers the OSI/TCP-IP models, subnetting (CIDR/VLSM/magic-number with worked
examples), IPv6 + EUI-64, VLANs/trunking/STP/EtherChannel, OSPFv2, FHRP,
NAT/DHCP/DNS/NTP/SNMP/Syslog/QoS, ACLs, port security, AAA, VPNs, L2 hardening,
SDN, REST APIs, Ansible/Terraform, NETCONF/RESTCONF/YANG, and the v1.1 AI/ML
additions.

### `[LABS]` — 18 Guided Labs (3 per domain)
Each lab includes an ASCII network diagram, objective, plain-language
explanation, full Cisco IOS configuration steps, verification commands with
expected output, and a "common mistakes" section. Mark labs complete to earn XP.

### `[EXAM]` — 100-Question Practice Exam
- 120-minute countdown timer with auto-submit.
- Full exam or per-domain drill.
- Single-choice, multiple-response, and tap-to-match question types.
- Questions weighted to the blueprint (20/20/25/10/15/10).
- Score report: overall score out of 1000 with pass/fail at ≥ 825 (82.5%),
  per-domain bar charts, a weak-domain callout, and every missed question shown
  with the correct answer and an explanation.

### `[STATS]` — Progress Dashboard
Labs completed (overall and per domain), exam attempt history, per-domain
mastery, targeted recommendations, and an XP/level system
(`net-noob` → `arch-lord`).

## Running locally

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build into dist/
npm run preview  # preview the production build
npm run lint     # run ESLint
```

## Project structure

The app is split into focused modules so each concern can be edited in
isolation:

```
src/
  main.jsx             # React entry point
  App.jsx              # root: layout, tabs, shared XP/lab/exam state
  theme.js             # Tokyo-Night colour palette (C, DOMAIN_COLORS)
  utils.js             # clampPct, formatClock, sameSet, pad2
  levels.js            # XP level table + levelFor()
  data/
    domains.js         # STUDY content (six domains)
    labs.js            # 18 guided labs
    questions.js       # 100-question exam bank
  components/
    Panel.jsx, TermBar.jsx, SectionHeader.jsx, Block.jsx   # shared UI
    StudyMode.jsx      # [STUDY] tab
    LabsMode.jsx       # [LABS] tab
    ExamMode.jsx       # [EXAM] tab (engine + question types)
    ExamResult.jsx     # exam score report (lazy-loaded — pulls in Recharts)
    StatsMode.jsx      # [STATS] tab (lazy-loaded — pulls in Recharts)
```

`ExamResult` and `StatsMode` are loaded with `React.lazy`, so the Recharts
charting library is fetched only when a score report or the stats dashboard is
opened — keeping the initial bundle small.

## Notes
- React + Vite. Charts via **Recharts**, icons via **lucide-react**.
- All progress (labs, XP, exam history) is held in React state for the session
  only — there is no tracking, no backend, and no external network calls.
- Content is educational and aligned to the CCNA 200-301 v1.1 exam topics.

## License
MIT — see [LICENSE](./LICENSE).
