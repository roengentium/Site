/**
 * `neofetch` for the portfolio terminal.
 * Every value is read from the visitor's real browser — nothing is invented.
 * To use your own art, replace the strings in LOGO (any width; it gets padded).
 */

// An element tile for Roentgenium (Rg, atomic number 111).
const TILE_W = 22;
const row = (s = "") => "│" + s.padEnd(TILE_W) + "│";
const BIG = [
  " ____    __ _ ",
  "|  _ \\  / _` |",
  "| |_) || (_| |",
  "|  _ <  \\__, |",
  "|_| \\_\\ |___/ ",
];

export const LOGO: string[] = [
  "┌" + "─".repeat(TILE_W) + "┐",
  row(" 111"),
  row(),
  ...BIG.map((l) => row("  " + l)),
  row(),
  row(" Roentgenium"),
  row(" [282]"),
  "└" + "─".repeat(TILE_W) + "┘",
];

type Nav = Navigator & {
  userAgentData?: { platform?: string; brands?: { brand: string; version: string }[] };
  deviceMemory?: number;
  connection?: { effectiveType?: string };
};

function detectOS(n: Nav): string {
  const ua = n.userAgent;
  if (/Windows NT 10/.test(ua)) return "Windows 10/11"; // browsers report both as NT 10.0
  if (/Windows/.test(ua)) return "Windows";
  if (/Android ([\d.]+)/.test(ua)) return "Android " + /Android ([\d.]+)/.exec(ua)![1];
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/CrOS/.test(ua)) return "ChromeOS";
  if (/Linux/.test(ua)) return "Linux";
  return n.userAgentData?.platform || n.platform || "Unknown";
}

function detectBrowser(n: Nav): string {
  const ua = n.userAgent;
  const v = (re: RegExp) => re.exec(ua)?.[1]?.split(".")[0] ?? "";
  if (/Edg\//.test(ua)) return `Edge ${v(/Edg\/([\d.]+)/)}`;
  if (/OPR\//.test(ua)) return `Opera ${v(/OPR\/([\d.]+)/)}`;
  if (/Firefox\//.test(ua)) return `Firefox ${v(/Firefox\/([\d.]+)/)}`;
  if (/Chrome\//.test(ua)) return `Chrome ${v(/Chrome\/([\d.]+)/)}`;
  if (/Safari\//.test(ua)) return `Safari ${v(/Version\/([\d.]+)/)}`;
  return "Unknown";
}

function uptime(): string {
  const s = Math.floor(performance.now() / 1000);
  if (s < 60) return `${s} sec${s === 1 ? "" : "s"}`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min${m === 1 ? "" : "s"}`;
  return `${Math.floor(m / 60)} hr ${m % 60} min`;
}

export type SiteInfo = { user: string; repos: number; source: string };

export function neofetch(site: SiteInfo): string[] {
  const n = navigator as Nav;
  const dpr = window.devicePixelRatio || 1;
  const mem = n.deviceMemory ? `${n.deviceMemory}${n.deviceMemory >= 8 ? "+" : ""} GB (as reported)` : "hidden by browser";
  const dark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;

  const head = `${site.user}@portfolio`;
  const info: string[] = [
    head,
    "-".repeat(head.length),
    `OS: ${detectOS(n)}`,
    `Host: ${location.host || "localhost"}`,
    `Uptime: ${uptime()} (this tab)`,
    `Packages: ${site.repos} repos (github: ${site.source})`,
    "Shell: portfolio-sh",
    `Resolution: ${screen.width}x${screen.height} @${+dpr.toFixed(2)}x`,
    `Window: ${window.innerWidth}x${window.innerHeight}`,
    "Terminal: portfolio-ide",
    `Browser: ${detectBrowser(n)}`,
    `CPU: ${n.hardwareConcurrency || "?"} threads`,
    `Memory: ${mem}`,
    `Locale: ${n.language}`,
    `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `Theme: ${dark ? "dark" : "light"} (system)`,
    ...(n.connection?.effectiveType ? [`Network: ${n.connection.effectiveType}`] : []),
  ];

  const w = Math.max(...LOGO.map((l) => l.length)) + 3;
  const height = Math.max(LOGO.length, info.length);
  return Array.from({ length: height }, (_, i) => (LOGO[i] ?? "").padEnd(w) + (info[i] ?? ""));
}
