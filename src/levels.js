/* ---------------------------------------------------------------------------
 * XP / level system (net-noob → arch-lord)
 * ------------------------------------------------------------------------- */
export const LEVELS = [
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

export function levelFor(xp) {
  let cur = LEVELS[0];
  for (const l of LEVELS) if (xp >= l.xp) cur = l;
  const next = LEVELS.find((l) => l.xp > xp);
  return { cur, next };
}
