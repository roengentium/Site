"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JetBrains_Mono, Roboto } from "next/font/google";
import { GH_OWNER, GH_PROFILE, SNAPSHOT, formatDate, loadRepos, type RepoPayload } from "@/lib/github";
import { neofetch } from "@/lib/neofetch";
import { ABOUT, BOOKMARK_NAV, CONTACT, PROFILE, SKILLS, contactLabel } from "@/lib/content";
import { ReleasesView } from "@/components/ide/releases";
import {
  FILE_IDS,
  FILE_META,
  buildLines,
  textOf,
  type FileId,
  type LineData,
} from "@/components/ide/lines";

/* ---------------------------------------------------------------------- */
/* Fonts + icons                                                            */
/* ---------------------------------------------------------------------- */

const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-mono" });
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700", "900"], variable: "--font-sans" });

function MaterialIconsFont() {
  return <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />;
}

function Icon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-icons select-none leading-none ${className}`} style={{ fontSize: size }} aria-hidden="true" translate="no">
      {name}
    </span>
  );
}

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3574f0] focus-visible:ring-offset-1 focus-visible:ring-offset-[#1e1f22]";

const fileIcon = (id: FileId) => (FILE_META[id].ext === "MD" ? "text-[#519aba]" : "text-[#57965c]");

/* ---------------------------------------------------------------------- */
/* Types                                                                    */
/* ---------------------------------------------------------------------- */

type LeftPanel = "project" | "search" | "structure" | null;
type BottomTab = "terminal" | "build" | "logcat" | "git";
type MdView = "code" | "split" | "preview";
type LogEntry = { id: number; t: string; level: "I" | "D" | "W" | "E"; tag: string; msg: string };
type Toast = { id: number; title: string; body: string; icon: string };
type PaletteItem = { id: string; label: string; hint?: string; icon: string; group: string; run: () => void };
type TermLine = { kind: "in" | "out" | "err"; text: string };

const STORE_KEY = "ide.v2";

/* ---------------------------------------------------------------------- */
/* Small presentational pieces                                              */
/* ---------------------------------------------------------------------- */

function Line({
  file, n, data, active, bookmarked, onPick, onBookmark,
}: {
  file: FileId; n: number; data: LineData; active: boolean; bookmarked: boolean;
  onPick: (n: number) => void; onBookmark: (n: number) => void;
}) {
  return (
    <div
      id={`ln-${file}-${n}`}
      onClick={() => onPick(n)}
      className={`flex px-1 leading-6 ${active ? "bg-[#26282e]" : "hover:bg-white/[0.03]"}`}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={`${bookmarked ? "Remove bookmark from" : "Bookmark"} line ${n}`}
        onClick={(e) => { e.stopPropagation(); onBookmark(n); }}
        className="group flex w-10 shrink-0 select-none items-center justify-end gap-0.5 pr-3 text-right text-[#5a5d63]"
      >
        {bookmarked ? (
          <Icon name="bookmark" size={13} className="text-[#e2b273]" />
        ) : (
          <Icon name="bookmark_border" size={13} className="opacity-0 group-hover:opacity-60" />
        )}
        <span className={active ? "text-[#a9b7c6]" : ""}>{n}</span>
      </button>
      <span className="min-h-6 whitespace-pre-wrap break-words">{data.text}</span>
    </div>
  );
}

function Crumb() {
  return <Icon name="chevron_right" size={14} className="text-[#5a5d63]" />;
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded-sm bg-[#3574f0]/40 text-white">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

function Avatar({ size, className = "" }: { size: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div style={{ width: size, height: size }} className={`flex items-center justify-center bg-[#0d0d0e] font-black text-[#57965c] ${className}`}>
        <span style={{ fontSize: size / 2.5 }}>R</span>
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={PROFILE.photo} alt={`${PROFILE.name} on GitHub`} width={size} height={size} onError={() => setFailed(true)} className={className} />;
}

/* ---------------------------------------------------------------------- */
/* Device preview column                                                    */
/* ---------------------------------------------------------------------- */

function Preview({ id, payload, onOpen }: { id: FileId; payload: RepoPayload; onOpen: (f: FileId, repo?: string) => void }) {
  const chip = (text: string) => (
    <span key={text} className="rounded-full border border-[#393b40] bg-[#2b2d30] px-2.5 py-1 text-[10px] text-[#a9b7c6]">{text}</span>
  );
  const link = (label: string, href: string) => (
    <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="rounded-full border border-[#393b40] bg-[#2b2d30] px-2.5 py-1 text-[10px] text-[#a9b7c6] hover:border-[#57965c] hover:text-white">{label}</a>
  );

  switch (id) {
    case "home":
      return (
        <div className="flex h-full flex-col bg-[#141416]">
          <div className="relative aspect-square w-full overflow-hidden border-b border-[#393b40] bg-[#0d0d0e]">
            <Avatar size={256} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="text-lg font-black tracking-tight text-white">{PROFILE.name}</p>
            <p className="max-w-[14rem] text-xs text-[#9aa0a6]">{PROFILE.tagline}</p>
            {chip(PROFILE.status)}
            <button type="button" onClick={() => onOpen("work")} className="mt-2 rounded-full bg-[#57965c] px-5 py-1.5 text-[11px] font-bold text-[#141416] hover:brightness-110">
              See my work
            </button>
          </div>
        </div>
      );
    case "about":
      return (
        <div className="flex h-full flex-col justify-center gap-4 bg-[#141416] p-6">
          <div className="flex flex-wrap gap-1.5">{ABOUT.roles.map(chip)}</div>
          <p className="text-xs leading-relaxed text-[#9aa0a6]">{ABOUT.bio}</p>
        </div>
      );
    case "skills":
      return (
        <div className="flex h-full flex-col justify-center gap-3 bg-[#141416] p-6">
          {SKILLS.map((s) => (
            <div key={s.pin} className="rounded-lg border border-[#393b40] p-3">
              <p className="mb-1 text-[10px] text-[#67d6ef]">PIN {s.pin}</p>
              <p className="mb-1.5 text-xs font-bold text-white">{s.title}</p>
              <div className="flex flex-wrap gap-1.5">{s.tools.map(chip)}</div>
            </div>
          ))}
        </div>
      );
    case "work":
      return (
        <div className="flex h-full flex-col gap-2 bg-[#141416] p-4">
          {payload.repos.map((r) => (
            <button key={r.name} type="button" onClick={() => onOpen("work", r.name)} className="rounded-lg border border-[#393b40] p-3 text-left hover:border-[#57965c]">
              <p className="mb-0.5 text-[10px] text-[#67d6ef]">{r.language ?? "Source"}</p>
              <p className="text-xs font-bold text-white">{r.name}</p>
              <p className="mt-0.5 line-clamp-2 text-[11px] text-[#9aa0a6]">{r.description}</p>
            </button>
          ))}
        </div>
      );
    case "contact":
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-[#141416] p-6 text-center">
          <p className="text-sm font-bold text-white">Let&apos;s build something.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {Object.entries(CONTACT).map(([k, v]) => link(contactLabel(k), v))}
          </div>
        </div>
      );
  }
}

/* ---------------------------------------------------------------------- */
/* Terminal                                                                 */
/* ---------------------------------------------------------------------- */

function Terminal({
  exec, visible,
}: { exec: (cmd: string) => string[] | { clear: true } | { err: string[] }; visible: boolean }) {
  const [lines, setLines] = useState<TermLine[]>([
    { kind: "out", text: `${PROFILE.name} portfolio — type "help" for commands.` },
  ]);
  const [input, setInput] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [lines]);
  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  const submit = () => {
    const cmd = input.trim();
    setInput("");
    setHi(-1);
    if (!cmd) {
      setLines((l) => [...l, { kind: "in", text: "" }]);
      return;
    }
    setHist((h) => [cmd, ...h]);
    const res = exec(cmd);
    if ("clear" in res) return setLines([]);
    if ("err" in res) return setLines((l) => [...l, { kind: "in", text: cmd }, ...res.err.map((t): TermLine => ({ kind: "err", text: t }))]);
    setLines((l) => [...l, { kind: "in", text: cmd }, ...res.map((t): TermLine => ({ kind: "out", text: t }))]);
  };

  return (
    <div ref={box} onClick={() => inputRef.current?.focus()} className="h-full overflow-auto px-3 py-2 text-xs leading-5">
      {lines.map((l, i) => (
        <div key={i} className={l.kind === "err" ? "text-[#cf6a4c]" : l.kind === "in" ? "text-white" : "text-[#a9b7c6]"}>
          {l.kind === "in" ? (
            <>
              <span className="text-[#57965c]">{GH_OWNER}@portfolio</span>
              <span className="text-[#6f737a]">:~$ </span>
              {l.text}
            </>
          ) : (
            <span className="whitespace-pre-wrap">{l.text}</span>
          )}
        </div>
      ))}
      <div className="flex">
        <span className="text-[#57965c]">{GH_OWNER}@portfolio</span>
        <span className="text-[#6f737a]">:~$&nbsp;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
            else if (e.key === "ArrowUp") {
              e.preventDefault();
              const n = Math.min(hi + 1, hist.length - 1);
              if (hist[n] !== undefined) { setHi(n); setInput(hist[n]); }
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const n = hi - 1;
              setHi(n);
              setInput(n >= 0 ? hist[n] : "");
            } else if (e.key === "l" && e.ctrlKey) {
              e.preventDefault();
              setLines([]);
            }
          }}
          aria-label="Terminal input"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-white caret-[#a9b7c6] outline-none"
        />
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Page                                                                     */
/* ---------------------------------------------------------------------- */

const INITIAL_PAYLOAD: RepoPayload = { repos: SNAPSHOT, source: "snapshot", fetchedAt: "2026-10-24T00:00:00Z", errors: [] };

export default function Home() {
  /* editor state */
  const [activeTab, setActiveTab] = useState<FileId>("home");
  const [openTabs, setOpenTabs] = useState<FileId[]>(FILE_IDS);
  const [cursors, setCursors] = useState<Record<FileId, number>>({ home: 1, about: 1, skills: 1, work: 1, contact: 1 });
  const [mdView, setMdView] = useState<MdView>("preview");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [jumpSeq, setJumpSeq] = useState(0);
  const [focusRepo, setFocusRepo] = useState<string | null>(null);

  /* chrome state */
  const [leftPanel, setLeftPanel] = useState<LeftPanel>(null);
  const [previewOpen, setPreviewOpen] = useState(true);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [bottomTab, setBottomTab] = useState<BottomTab>("terminal");
  const [bottomH, setBottomH] = useState(224);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const [searchQ, setSearchQ] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);

  /* data */
  const [payload, setPayload] = useState<RepoPayload>(INITIAL_PAYLOAD);
  const [loading, setLoading] = useState(true);

  /* build / logcat */
  const [building, setBuilding] = useState(false);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [buildLog, setBuildLog] = useState<string[]>([]);
  const [logcat, setLogcat] = useState<LogEntry[]>([]);

  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const timers = useRef<number[]>([]);
  const idSeq = useRef(0);
  const lastShift = useRef(0);
  const paletteInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  /* ---------- helpers ---------- */

  const log = useCallback((level: LogEntry["level"], tag: string, msg: string) => {
    const t = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogcat((l) => [...l.slice(-199), { id: ++idSeq.current, t, level, tag, msg }]);
  }, []);

  const notify = useCallback((title: string, body: string, icon = "info") => {
    const id = ++idSeq.current;
    setToasts((t) => [...t.slice(-2), { id, title, body, icon }]);
    timers.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500));
  }, []);

  const linesByFile = useMemo(() => {
    const m = {} as Record<FileId, LineData[]>;
    for (const f of FILE_IDS) m[f] = buildLines(f, payload);
    return m;
  }, [payload]);
  const plainByFile = useMemo(() => {
    const m = {} as Record<FileId, string[]>;
    for (const f of FILE_IDS) m[f] = linesByFile[f].map((l) => textOf(l.text));
    return m;
  }, [linesByFile]);

  /* ---------- GitHub data ---------- */

  const reload = useCallback(async () => {
    setLoading(true);
    log("I", "GitHub", `GET /api/github (${GH_OWNER}, ${SNAPSHOT.length} repos)`);
    let result: RepoPayload | null = null;
    try {
      const res = await fetch("/api/github", { cache: "no-store" });
      if (res.ok) {
        const p = (await res.json()) as RepoPayload;
        if (p.source !== "snapshot") result = p;
        else log("W", "GitHub", "server route could only return the snapshot");
      } else log("W", "GitHub", `/api/github -> ${res.status}`);
    } catch (e) {
      log("W", "GitHub", `/api/github failed: ${(e as Error).message}`);
    }
    if (!result) {
      log("I", "GitHub", "falling back to api.github.com from the browser");
      try {
        result = await loadRepos();
      } catch (e) {
        log("E", "GitHub", (e as Error).message);
      }
    }
    if (result) {
      setPayload(result);
      result.errors.forEach((m) => log("W", "GitHub", m));
      log(result.source === "live" ? "I" : "W", "GitHub", `${result.source}: ${result.repos.length} repos`);
      if (result.source !== "live") notify("GitHub data", result.source === "partial" ? "Some repos came from the cached copy." : "GitHub API unreachable — showing the cached copy.", "cloud_off");
    }
    setLoading(false);
  }, [log, notify]);

  useEffect(() => {
    log("D", "Portfolio", "Application onCreate()");
    void reload();
  }, [reload, log]);

  /* ---------- persistence + responsive defaults ---------- */

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as { tabs?: FileId[]; active?: FileId; bookmarks?: string[]; mdView?: MdView };
        const tabs = (s.tabs ?? []).filter((t) => FILE_IDS.includes(t));
        if (tabs.length) setOpenTabs(tabs);
        if (s.active && tabs.includes(s.active)) setActiveTab(s.active);
        if (Array.isArray(s.bookmarks)) setBookmarks(s.bookmarks.filter((b) => typeof b === "string"));
        if (s.mdView) setMdView(s.mdView);
      }
    } catch {}
    if (window.innerWidth >= 1024) setLeftPanel("project");
    if (window.innerWidth >= 768) setBookmarksOpen(true);
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ tabs: openTabs, active: activeTab, bookmarks, mdView }));
    } catch {}
  }, [openTabs, activeTab, bookmarks, mdView]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  /* ---------- navigation ---------- */

  const openFile = useCallback((id: FileId, repo?: string) => {
    setOpenTabs((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setActiveTab(id);
    if (window.innerWidth < 768) setLeftPanel(null);
    if (id === "work" && repo) {
      setMdView((v) => (v === "code" ? "split" : v));
      setFocusRepo(repo);
    }
  }, []);

  const jump = useCallback((file: FileId, line: number) => {
    openFile(file);
    if (file === "work") setMdView((v) => (v === "preview" ? "split" : v));
    setCursors((c) => ({ ...c, [file]: line }));
    setJumpSeq((n) => n + 1);
    if (window.innerWidth < 768) setLeftPanel(null);
  }, [openFile]);

  useEffect(() => {
    document.getElementById(`ln-${activeTab}-${cursors[activeTab]}`)?.scrollIntoView({ block: "nearest" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jumpSeq]);

  useEffect(() => {
    if (!focusRepo) return;
    const t = window.setTimeout(() => document.getElementById(`repo-${focusRepo}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    const clear = window.setTimeout(() => setFocusRepo(null), 2200);
    return () => { clearTimeout(t); clearTimeout(clear); };
  }, [focusRepo, activeTab, mdView]);

  const closeTab = (id: FileId, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== id);
      if (activeTab === id) setActiveTab(next.length ? next[next.length - 1] : "home");
      return next.length ? next : ["home"];
    });
  };

  const cycleTab = useCallback((dir: 1 | -1) => {
    setActiveTab((cur) => {
      const i = openTabs.indexOf(cur);
      return openTabs[(i + dir + openTabs.length) % openTabs.length] ?? cur;
    });
  }, [openTabs]);

  const handleTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % openTabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + openTabs.length) % openTabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = openTabs.length - 1;
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setActiveTab(openTabs[index]); return; }
    if (next !== null) {
      e.preventDefault();
      setActiveTab(openTabs[next]);
      tabRefs.current[openTabs[next]]?.focus();
    }
  };

  /* ---------- bookmarks ---------- */

  const toggleBookmark = useCallback((file: FileId, line: number) => {
    const key = `${file}:${line}`;
    setBookmarks((b) => (b.includes(key) ? b.filter((x) => x !== key) : [...b, key]));
  }, []);

  /* ---------- build / run ---------- */

  const openBottom = useCallback((tab: BottomTab) => {
    setBottomTab(tab);
    setBottomOpen(true);
  }, []);

  const runBuild = useCallback(() => {
    if (building) return;
    setBuilding(true);
    setRunning(false);
    setProgress(0);
    setBuildLog([]);
    openBottom("build");
    log("I", "Gradle", "assembleDebug started");
    const steps = [
      "Starting a Gradle Daemon (subsequent builds will be faster)",
      "> Task :app:preBuild UP-TO-DATE",
      `> Task :app:fetchGitHubReleases (${GH_OWNER}: ${payload.repos.length} repos, ${payload.source})`,
      "> Task :app:compileDebugKotlin",
      "> Task :app:processDebugResources",
      "> Task :app:mergeDebugAssets",
      "> Task :app:packageDebug",
      "> Task :app:assembleDebug",
      "",
      "BUILD SUCCESSFUL in 2s",
      "Installing APK 'portfolio-debug.apk' on 'Pixel_9 - 15'",
      "Launching 'portfolio' on Pixel_9 - 15.",
    ];
    steps.forEach((s, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setBuildLog((l) => [...l, s]);
          setProgress(Math.round(((i + 1) / steps.length) * 100));
          if (i === steps.length - 1) {
            setBuilding(false);
            setRunning(true);
            log("I", "ActivityManager", "Start proc com.roentgenium.portfolio for activity MainActivity");
            notify("Run 'portfolio'", "Installed and running on Pixel_9 - 15", "play_circle");
            window.setTimeout(() => setProgress(0), 900);
          }
        }, 260 * (i + 1))
      );
    });
  }, [building, openBottom, log, notify, payload]);

  const stopBuild = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setBuilding(false);
    setProgress(0);
    setBuildLog((l) => [...l, "", "Build cancelled."]);
    log("W", "Gradle", "build cancelled by user");
  }, [log]);

  /* ---------- terminal commands ---------- */

  const resolveFile = (arg: string | undefined): FileId | null => {
    if (!arg) return null;
    const a = arg.toLowerCase().replace(/^(src\/|\.\/)/, "");
    return FILE_IDS.find((f) => FILE_META[f].label.toLowerCase() === a || f === a || FILE_META[f].label.toLowerCase().replace(/\.(tsx|md)$/, "") === a) ?? null;
  };

  const exec = (raw: string): string[] | { clear: true } | { err: string[] } => {
    const [cmd, ...args] = raw.split(/\s+/);
    switch (cmd) {
      case "help":
        return [
          "Commands:",
          "  ls                 list project files",
          "  cat <file>         print a file (e.g. cat about)",
          "  open <file>        open it in the editor",
          "  repos              list GitHub projects",
          "  github             open my GitHub profile",
          "  whoami            print the username",
          "  neofetch          system info (real values from your browser)",
          "  ./gradlew assembleDebug   build & run",
          "  reload             re-fetch GitHub data",
          "  clear              clear the screen (Ctrl+L)",
          "Also try: double-tap Shift for Search Everywhere.",
        ];
      case "ls":
        return ["Home.tsx", "src/", ...FILE_IDS.filter((f) => f !== "home").map((f) => `  ${FILE_META[f].label}`)];
      case "cat": {
        const f = resolveFile(args[0]);
        return f ? plainByFile[f] : { err: [`cat: ${args[0] ?? ""}: No such file or directory`] };
      }
      case "open": {
        const f = resolveFile(args[0]);
        if (!f) return { err: [`open: ${args[0] ?? ""}: No such file or directory`] };
        openFile(f);
        return [`Opened ${FILE_META[f].label}`];
      }
      case "repos":
        return payload.repos.map((r) => `${r.name.padEnd(24)} ${(r.language ?? "-").padEnd(12)} ${r.release?.tag ?? r.branch}  ${formatDate(r.pushedAt)}`);
      case "github":
        window.open(GH_PROFILE, "_blank", "noopener,noreferrer");
        return [`Opening ${GH_PROFILE}`];
      case "whoami":
        return [PROFILE.name];
      case "neofetch":
        return neofetch({ user: GH_OWNER, repos: payload.repos.length, source: payload.source });
      case "date":
        return [new Date().toString()];
      case "echo":
        return [args.join(" ")];
      case "clear":
        return { clear: true };
      case "reload":
        void reload();
        return ["Refreshing GitHub data…"];
      case "./gradlew":
      case "gradlew":
        runBuild();
        return [`> ${raw}`, "Switch to the Build tab for output."];
      case "exit":
        setBottomOpen(false);
        return [];
      case "sudo":
        return { err: [`${PROFILE.name} is not in the sudoers file. This incident will be reported.`] };
      default:
        return { err: [`bash: ${cmd}: command not found`] };
    }
  };

  /* ---------- Search Everywhere ---------- */

  const closePalette = () => { setPaletteOpen(false); setQuery(""); setSel(0); };
  const openPalette = useCallback(() => { setPaletteOpen(true); setSel(0); }, []);

  const toggleLeft = useCallback((p: Exclude<LeftPanel, null>) => {
    setLeftPanel((cur) => (cur === p ? null : p));
    if (p === "search") window.setTimeout(() => searchInput.current?.focus(), 30);
  }, []);

  const paletteItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [
      ...FILE_IDS.map((f): PaletteItem => ({ id: `f-${f}`, label: FILE_META[f].label, hint: `${FILE_META[f].dir || "portfolio"}/`, icon: "description", group: "Files", run: () => openFile(f) })),
      ...payload.repos.map((r): PaletteItem => ({ id: `r-${r.name}`, label: r.name, hint: `${r.language ?? "repo"} · show in Releases`, icon: "rocket_launch", group: "Projects", run: () => openFile("work", r.name) })),
      ...payload.repos.map((r): PaletteItem => ({ id: `g-${r.name}`, label: `Open ${r.name} on GitHub`, hint: r.url.replace("https://", ""), icon: "open_in_new", group: "Links", run: () => window.open(r.url, "_blank", "noopener,noreferrer") })),
      ...Object.entries(CONTACT).map(([k, v]): PaletteItem => ({ id: `l-${k}`, label: contactLabel(k), hint: v.replace(/^https?:\/\/(www\.)?/, ""), icon: "open_in_new", group: "Links", run: () => window.open(v, "_blank", "noopener,noreferrer") })),
      { id: "a-run", label: "Run 'portfolio'", hint: "Shift+F10", icon: "play_arrow", group: "Actions", run: runBuild },
      { id: "a-term", label: "Toggle Terminal", hint: "Alt+F12", icon: "terminal", group: "Actions", run: () => (bottomOpen && bottomTab === "terminal" ? setBottomOpen(false) : openBottom("terminal")) },
      { id: "a-log", label: "Open Logcat", icon: "bug_report", group: "Actions", run: () => openBottom("logcat") },
      { id: "a-git", label: "Open Git log", icon: "call_split", group: "Actions", run: () => openBottom("git") },
      { id: "a-proj", label: "Toggle Project panel", hint: "Alt+1", icon: "folder", group: "Actions", run: () => toggleLeft("project") },
      { id: "a-find", label: "Find in Files", hint: "Ctrl+Shift+F", icon: "search", group: "Actions", run: () => toggleLeft("search") },
      { id: "a-prev", label: "Toggle Preview", icon: "smartphone", group: "Actions", run: () => setPreviewOpen((v) => !v) },
      { id: "a-bm", label: "Toggle Bookmarks panel", icon: "bookmark", group: "Actions", run: () => setBookmarksOpen((v) => !v) },
      { id: "a-bml", label: "Toggle bookmark on current line", hint: "Alt+B", icon: "bookmark_add", group: "Actions", run: () => toggleBookmark(activeTab, cursors[activeTab]) },
      { id: "a-reload", label: "Reload GitHub data", icon: "refresh", group: "Actions", run: () => void reload() },
    ];
    return items;
  }, [payload, openFile, runBuild, bottomOpen, bottomTab, openBottom, toggleLeft, toggleBookmark, activeTab, cursors, reload]);

  const paletteResults = useMemo<PaletteItem[]>(() => {
    const q = query.trim().toLowerCase();
    const goto = /^:(\d+)$/.exec(q);
    if (goto) {
      const n = Math.max(1, Math.min(Number(goto[1]), linesByFile[activeTab].length));
      return [{ id: "goto", label: `Go to line ${n} in ${FILE_META[activeTab].label}`, icon: "arrow_forward", group: "Go to", run: () => jump(activeTab, n) }];
    }
    if (!q) return paletteItems.filter((i) => i.group === "Files" || i.group === "Actions").slice(0, 12);
    const tokens = q.split(/\s+/);
    return paletteItems.filter((i) => tokens.every((t) => `${i.label} ${i.hint ?? ""} ${i.group}`.toLowerCase().includes(t))).slice(0, 14);
  }, [query, paletteItems, linesByFile, activeTab, jump]);

  useEffect(() => { setSel(0); }, [query]);
  useEffect(() => { if (paletteOpen) paletteInput.current?.focus(); }, [paletteOpen]);

  /* ---------- global shortcuts ---------- */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (e.key === "Shift" && !e.repeat) {
        const now = Date.now();
        if (now - lastShift.current < 380) { openPalette(); lastShift.current = 0; } else lastShift.current = now;
        return;
      }
      lastShift.current = 0;
      if ((mod && e.key.toLowerCase() === "k") || (mod && e.shiftKey && ["a", "p"].includes(e.key.toLowerCase()))) { e.preventDefault(); openPalette(); }
      else if (mod && e.shiftKey && e.key.toLowerCase() === "f") { e.preventDefault(); setLeftPanel("search"); window.setTimeout(() => searchInput.current?.focus(), 30); }
      else if (e.altKey && e.key === "1") { e.preventDefault(); toggleLeft("project"); }
      else if (e.altKey && e.key === "F12") { e.preventDefault(); setBottomOpen((o) => (o && bottomTab === "terminal" ? false : true)); setBottomTab("terminal"); }
      else if (e.shiftKey && e.key === "F10") { e.preventDefault(); runBuild(); }
      else if (e.altKey && e.key.toLowerCase() === "b") { e.preventDefault(); toggleBookmark(activeTab, cursors[activeTab]); }
      else if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); cycleTab(1); }
      else if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); cycleTab(-1); }
      else if (e.key === "Escape") { if (paletteOpen) closePalette(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ---------- editor keyboard ---------- */

  const onEditorKey = (e: React.KeyboardEvent) => {
    const total = linesByFile[activeTab].length;
    const cur = cursors[activeTab];
    let n: number | null = null;
    if (e.key === "ArrowDown") n = Math.min(total, cur + 1);
    else if (e.key === "ArrowUp") n = Math.max(1, cur - 1);
    else if (e.key === "PageDown") n = Math.min(total, cur + 10);
    else if (e.key === "PageUp") n = Math.max(1, cur - 10);
    else if (e.key === "Home" && e.ctrlKey) n = 1;
    else if (e.key === "End" && e.ctrlKey) n = total;
    else if (e.key === "g" && e.ctrlKey) { e.preventDefault(); setQuery(":"); openPalette(); return; }
    if (n !== null) {
      e.preventDefault();
      setCursors((c) => ({ ...c, [activeTab]: n! }));
      setJumpSeq((s) => s + 1);
    }
  };

  /* ---------- search + structure data ---------- */

  const searchResults = useMemo(() => {
    const q = searchQ.trim();
    if (q.length < 2) return [];
    const out: { file: FileId; line: number; text: string }[] = [];
    for (const f of FILE_IDS)
      plainByFile[f].forEach((t, i) => { if (t.toLowerCase().includes(q.toLowerCase())) out.push({ file: f, line: i + 1, text: t.trim() }); });
    return out.slice(0, 80);
  }, [searchQ, plainByFile]);

  const structure = useMemo(() => {
    const out: { line: number; text: string }[] = [];
    plainByFile[activeTab].forEach((t, i) => { if (/^(export|\/\/|#)/.test(t)) out.push({ line: i + 1, text: t }); });
    return out;
  }, [plainByFile, activeTab]);

  /* ---------- bottom panel drag ---------- */

  const dragRef = useRef(false);
  const onDragMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setBottomH(Math.max(120, Math.min(window.innerHeight - 200, window.innerHeight - e.clientY - 28)));
  };

  /* ---------- derived ---------- */

  const isMd = FILE_META[activeTab].ext === "MD";
  const hasPreview = activeTab === "work";
  const showCode = !hasPreview || mdView !== "preview";
  const showPreviewPane = hasPreview && mdView !== "code";
  const total = linesByFile[activeTab].length;
  const cursor = cursors[activeTab];
  const lineBookmarks = bookmarks
    .map((b) => { const [f, n] = b.split(":"); return { file: f as FileId, line: Number(n) }; })
    .filter((b) => FILE_IDS.includes(b.file) && b.line <= (linesByFile[b.file]?.length ?? 0));

  const railBtn = (label: string, icon: string, active: boolean, onClick: () => void) => (
    <button
      type="button" aria-label={label} title={label} aria-pressed={active} onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded ${active ? "bg-[#3574f0]/25 text-white" : "text-[#a9b7c6]/60 hover:bg-white/10 hover:text-[#a9b7c6]"} ${focusRing}`}
    >
      <Icon name={icon} size={19} />
    </button>
  );

  const bottomTabBtn = (id: BottomTab, label: string, icon: string) => (
    <button
      key={id} type="button" role="tab" aria-selected={bottomTab === id} onClick={() => setBottomTab(id)}
      className={`flex items-center gap-1.5 border-b-2 px-3 py-1.5 text-xs ${bottomTab === id ? "border-[#3574f0] text-white" : "border-transparent text-[#9aa0a6] hover:text-white"} ${focusRing}`}
    >
      <Icon name={icon} size={14} /> {label}
    </button>
  );

  const treeBtn = (id: FileId, indent = 0) => (
    <button
      key={id} onClick={() => openFile(id)}
      className={`flex w-full items-center gap-2 rounded py-1 pr-2 text-left text-xs ${focusRing} ${activeTab === id ? "bg-[#3a3d41] text-white" : "text-[#cccccc] hover:bg-white/5"}`}
      style={{ paddingLeft: 8 + indent * 14 }}
    >
      <Icon name="description" size={16} className={fileIcon(id)} />
      {FILE_META[id].label}
    </button>
  );

  return (
    <main
      className={`${jetbrainsMono.variable} ${roboto.variable} flex h-screen flex-col overflow-hidden bg-[#1e1f22] text-[13px] text-[#a9b7c6]`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <MaterialIconsFont />

      {/* ───────── toolbar ───────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-[#393b40] bg-[#2b2d30] px-3 py-1.5">
        <button onClick={() => toggleLeft("project")} className={`rounded p-1 text-[#a9b7c6] hover:bg-white/10 ${focusRing}`} aria-label={leftPanel === "project" ? "Close project files" : "Open project files"} aria-expanded={leftPanel === "project"}>
          <Icon name="menu" size={20} />
        </button>
        <span className="flex items-center gap-1.5 text-xs text-[#e2e4e9]">
          <Icon name="code" size={16} />
          <span className="font-semibold">portfolio</span>
          <Icon name="arrow_drop_down" size={16} className="text-[#9aa0a6]" />
        </span>
        <span className="hidden items-center gap-1.5 text-xs text-[#9aa0a6] sm:flex"><Icon name="call_split" size={16} /> main<Icon name="arrow_drop_down" size={16} /></span>
        <span className="hidden items-center gap-1.5 rounded border border-[#393b40] px-2 py-0.5 text-xs text-[#cfd3d8] md:flex">
          <Icon name="smartphone" size={14} /> Pixel 9 <span className="text-[#6f737a]">API 35</span>
        </span>
        {building ? (
          <button onClick={stopBuild} aria-label="Stop build" title="Stop" className={`rounded p-0.5 text-[#cf6a4c] hover:bg-white/10 ${focusRing}`}><Icon name="stop" size={20} /></button>
        ) : (
          <button onClick={runBuild} aria-label="Run 'portfolio' (Shift+F10)" title="Run 'portfolio' (Shift+F10)" className={`rounded p-0.5 text-[#57965c] hover:bg-white/10 ${focusRing}`}><Icon name="play_arrow" size={20} /></button>
        )}
        <button onClick={() => openBottom("logcat")} aria-label="Open Logcat" title="Logcat" className={`rounded p-0.5 text-[#9aa0a6] hover:bg-white/10 ${focusRing}`}><Icon name="bug_report" size={18} /></button>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={openPalette} aria-label="Search everywhere (double Shift)" title="Search everywhere (double Shift)" className={`flex items-center gap-1.5 rounded border border-[#393b40] px-2 py-0.5 text-[11px] text-[#9aa0a6] hover:bg-white/10 ${focusRing}`}>
            <Icon name="search" size={15} /> <span className="hidden sm:inline">Search everywhere</span>
            <kbd className="hidden rounded bg-[#393b40] px-1 text-[10px] text-[#cfd3d8] md:inline">⇧⇧</kbd>
          </button>
          <button onClick={() => setPreviewOpen((v) => !v)} aria-pressed={previewOpen} className={`hidden items-center gap-1 rounded px-2 py-0.5 text-[11px] text-[#9aa0a6] hover:bg-white/10 lg:flex ${focusRing}`}>
            <Icon name="smartphone" size={16} /> Preview
          </button>
          <button onClick={() => setBookmarksOpen((v) => !v)} aria-pressed={bookmarksOpen} className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] text-[#9aa0a6] hover:bg-white/10 ${focusRing}`}>
            <Icon name="bookmark" size={16} /> <span className="hidden sm:inline">Bookmarks</span>
          </button>
          <a href={GH_PROFILE} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full bg-[#57965c] text-[#141416]">
            <Avatar size={24} className="h-full w-full object-cover" />
          </a>
        </div>
      </div>

      {/* progress bar (build / data load) */}
      <div className="h-0.5 shrink-0 bg-transparent" aria-hidden="true">
        <div className={`h-full bg-[#3574f0] transition-all duration-200 ${loading && !building ? "w-1/3 animate-pulse" : ""}`} style={building || progress ? { width: `${progress}%` } : undefined} />
      </div>

      <div className="relative flex min-h-0 flex-1">
        {/* ───────── icon rail ───────── */}
        <nav aria-label="Editor tools" className="flex w-11 shrink-0 flex-col items-center gap-1 border-r border-[#393b40] bg-[#1e1f22] py-2">
          {railBtn("Project (Alt+1)", "folder", leftPanel === "project", () => toggleLeft("project"))}
          {railBtn("Find in Files (Ctrl+Shift+F)", "search", leftPanel === "search", () => toggleLeft("search"))}
          {railBtn("Structure", "account_tree", leftPanel === "structure", () => toggleLeft("structure"))}
          {railBtn("Run (Shift+F10)", "play_arrow", building, runBuild)}
          {railBtn("Logcat", "bug_report", bottomOpen && bottomTab === "logcat", () => openBottom("logcat"))}
          {railBtn("Git", "call_split", bottomOpen && bottomTab === "git", () => openBottom("git"))}
          <span className="mt-auto" />
          {railBtn("Terminal (Alt+F12)", "terminal", bottomOpen && bottomTab === "terminal", () => (bottomOpen && bottomTab === "terminal" ? setBottomOpen(false) : openBottom("terminal")))}
        </nav>

        {/* ───────── left tool window ───────── */}
        {leftPanel && (
          <>
            <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setLeftPanel(null)} aria-hidden="true" />
            <aside
              aria-label={leftPanel === "project" ? "Project files" : leftPanel === "search" ? "Find in files" : "Structure"}
              onKeyDown={(e) => e.key === "Escape" && setLeftPanel(null)}
              className="absolute bottom-0 left-11 top-0 z-30 flex w-64 flex-col border-r border-[#393b40] bg-[#1e1f22] md:static md:z-auto"
            >
              <div className="flex items-center border-b border-[#393b40] px-3 py-1.5 text-[11px] uppercase tracking-wide text-[#6f737a]">
                {leftPanel === "project" ? "Project" : leftPanel === "search" ? "Find in Files" : `Structure · ${FILE_META[activeTab].label}`}
                <button onClick={() => setLeftPanel(null)} aria-label="Hide panel" className={`ml-auto rounded p-0.5 hover:text-white ${focusRing}`}><Icon name="remove" size={16} /></button>
              </div>

              {leftPanel === "project" && (
                <div className="flex-1 overflow-auto p-2">
                  <p className="mb-1 px-1 text-xs font-bold text-white">▾ portfolio</p>
                  {treeBtn("home", 0)}
                  <p className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#cccccc]" style={{ paddingLeft: 8 }}><Icon name="folder_open" size={16} /> src</p>
                  {(["about", "skills", "work", "contact"] as FileId[]).map((id) => treeBtn(id, 1))}
                  <p className="mt-2 flex items-center gap-1.5 px-2 py-1 text-xs text-[#cccccc]"><Icon name="folder_open" size={16} /> github / {GH_OWNER}</p>
                  {payload.repos.map((r) => (
                    <button key={r.name} onClick={() => openFile("work", r.name)} className={`flex w-full items-center gap-2 rounded py-1 pr-2 pl-[22px] text-left text-xs text-[#cccccc] hover:bg-white/5 ${focusRing}`}>
                      <Icon name="rocket_launch" size={15} className="text-[#e2b273]" />
                      <span className="min-w-0 flex-1 truncate">{r.name}</span>
                      <span className="shrink-0 text-[10px] text-[#6f737a]">{r.release?.tag ?? ""}</span>
                    </button>
                  ))}
                </div>
              )}

              {leftPanel === "search" && (
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="p-2">
                    <input
                      ref={searchInput} value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                      placeholder="Search all files…" aria-label="Search all files"
                      className={`w-full rounded border border-[#393b40] bg-[#2b2d30] px-2 py-1 text-xs text-white placeholder:text-[#6f737a] ${focusRing}`}
                    />
                    <p className="mt-1 text-[11px] text-[#6f737a]">{searchQ.trim().length < 2 ? "Type at least 2 characters" : `${searchResults.length} match${searchResults.length === 1 ? "" : "es"}`}</p>
                  </div>
                  <ul className="flex-1 overflow-auto pb-2">
                    {searchResults.map((r, i) => (
                      <li key={`${r.file}-${r.line}-${i}`}>
                        <button onClick={() => jump(r.file, r.line)} className={`block w-full px-3 py-1 text-left text-xs hover:bg-white/5 ${focusRing}`}>
                          <span className="block text-[10px] text-[#6f737a]">{FILE_META[r.file].label}:{r.line}</span>
                          <span className="block truncate text-[#cfd3d8]"><Highlight text={r.text} q={searchQ.trim()} /></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {leftPanel === "structure" && (
                <ul className="flex-1 overflow-auto p-2">
                  {structure.length === 0 && <li className="px-2 py-1 text-xs text-[#6f737a]">Nothing to show</li>}
                  {structure.map((s) => (
                    <li key={s.line}>
                      <button onClick={() => jump(activeTab, s.line)} className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs text-[#cccccc] hover:bg-white/5 ${focusRing}`}>
                        <Icon name="code" size={14} className="text-[#67d6ef]" />
                        <span className="truncate">{s.text.replace(/^(export (default )?(const|function) |\/\/ |# )/, "").replace(/\s*=.*$/, "")}</span>
                        <span className="ml-auto text-[10px] text-[#6f737a]">{s.line}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </>
        )}

        {/* ───────── editor + bottom tool window ───────── */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div role="tablist" aria-label="Open project files" className="flex shrink-0 overflow-x-auto border-b border-[#393b40] bg-[#2b2d30]">
            {openTabs.map((id, i) => (
              <div
                key={id}
                ref={(el) => { tabRefs.current[id] = el; }}
                role="tab" aria-selected={activeTab === id} aria-controls={`panel-${id}`} id={`tab-${id}`}
                tabIndex={activeTab === id ? 0 : -1}
                onClick={() => setActiveTab(id)}
                onAuxClick={(e) => e.button === 1 && closeTab(id, e)}
                onKeyDown={(e) => handleTabKeyDown(e, i)}
                className={`group flex shrink-0 cursor-pointer items-center gap-2 border-r border-[#393b40] px-3 py-2 text-xs ${focusRing} ${
                  activeTab === id ? "border-t-2 border-t-[#3574f0] bg-[#1e1f22] text-white" : "border-t-2 border-t-transparent text-[#9aa0a6] hover:bg-white/5"
                }`}
              >
                <Icon name="description" size={16} className={fileIcon(id)} />
                {FILE_META[id].label}
                <button type="button" aria-label={`Close ${FILE_META[id].label}`} onClick={(e) => closeTab(id, e)} className={`ml-1 rounded p-0.5 text-[#9aa0a6] hover:bg-white/20 hover:text-white ${focusRing}`}>
                  <Icon name="close" size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* markdown view switcher */}
          {hasPreview && (
            <div className="flex shrink-0 items-center gap-1 border-b border-[#393b40] bg-[#232426] px-3 py-1" role="group" aria-label="Editor view">
              {([["code", "Code", "code"], ["split", "Split", "vertical_split"], ["preview", "Preview", "visibility"]] as const).map(([v, label, icon]) => (
                <button key={v} onClick={() => setMdView(v)} aria-pressed={mdView === v} className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] ${mdView === v ? "bg-[#3574f0]/25 text-white" : "text-[#9aa0a6] hover:bg-white/10"} ${focusRing}`}>
                  <Icon name={icon} size={14} /> {label}
                </button>
              ))}
            </div>
          )}

          <div className="flex min-h-0 flex-1">
            {showCode && (
              <div
                role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} tabIndex={0}
                onKeyDown={onEditorKey}
                className={`min-w-0 flex-1 overflow-auto py-3 ${focusRing} ${showPreviewPane ? "border-r border-[#393b40] md:max-w-[50%]" : ""}`}
              >
                {linesByFile[activeTab].map((data, i) => (
                  <Line
                    key={`${activeTab}-${i}`} file={activeTab} n={i + 1} data={data}
                    active={cursor === i + 1} bookmarked={bookmarks.includes(`${activeTab}:${i + 1}`)}
                    onPick={(n) => setCursors((c) => ({ ...c, [activeTab]: n }))}
                    onBookmark={(n) => toggleBookmark(activeTab, n)}
                  />
                ))}
              </div>
            )}
            {showPreviewPane && (
              <div
                {...(!showCode ? { role: "tabpanel", id: `panel-${activeTab}`, "aria-labelledby": `tab-${activeTab}`, tabIndex: 0 } : {})}
                className={`min-w-0 flex-1 overflow-auto bg-[#1e1f22] ${focusRing}`}
              >
                <ReleasesView payload={payload} loading={loading} onReload={() => void reload()} focus={focusRepo} />
              </div>
            )}
          </div>

          {/* bottom tool window */}
          {bottomOpen && (
            <section aria-label="Tool window" className="flex shrink-0 flex-col border-t border-[#393b40] bg-[#1e1f22]" style={{ height: bottomH }}>
              <div
                onPointerDown={(e) => { dragRef.current = true; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
                onPointerMove={onDragMove}
                onPointerUp={() => { dragRef.current = false; }}
                className="h-1 shrink-0 cursor-row-resize hover:bg-[#3574f0]/60"
                role="separator" aria-orientation="horizontal" aria-label="Resize tool window"
              />
              <div className="flex shrink-0 items-center border-b border-[#393b40] bg-[#2b2d30]" role="tablist" aria-label="Tool windows">
                {bottomTabBtn("terminal", "Terminal", "terminal")}
                {bottomTabBtn("build", "Build", "build")}
                {bottomTabBtn("logcat", "Logcat", "bug_report")}
                {bottomTabBtn("git", "Git", "call_split")}
                <button onClick={() => setBottomOpen(false)} aria-label="Hide tool window" className={`ml-auto mr-2 rounded p-0.5 text-[#9aa0a6] hover:text-white ${focusRing}`}><Icon name="remove" size={16} /></button>
              </div>
              <div className="min-h-0 flex-1">
                <div className={bottomTab === "terminal" ? "h-full" : "hidden"}><Terminal exec={exec} visible={bottomOpen && bottomTab === "terminal"} /></div>
                {bottomTab === "build" && (
                  <div className="h-full overflow-auto px-3 py-2 text-xs leading-5">
                    {buildLog.length === 0 && <p className="text-[#6f737a]">No build yet — press ▶ or Shift+F10.</p>}
                    {buildLog.map((l, i) => (
                      <div key={i} className={l.startsWith("BUILD SUCCESSFUL") ? "font-bold text-[#57965c]" : l.startsWith("> Task") ? "text-[#a9b7c6]" : l.startsWith("Build cancelled") ? "text-[#cf6a4c]" : "text-[#9aa0a6]"}>{l || " "}</div>
                    ))}
                  </div>
                )}
                {bottomTab === "logcat" && (
                  <div className="h-full overflow-auto px-3 py-2 text-xs leading-5">
                    {logcat.map((l) => (
                      <div key={l.id} className="whitespace-pre-wrap">
                        <span className="text-[#6f737a]">{l.t} </span>
                        <span className={l.level === "E" ? "text-[#ff6b68]" : l.level === "W" ? "text-[#e2b273]" : l.level === "D" ? "text-[#67d6ef]" : "text-[#a5c261]"}>{l.level}/{l.tag}: </span>
                        <span className="text-[#cfd3d8]">{l.msg}</span>
                      </div>
                    ))}
                  </div>
                )}
                {bottomTab === "git" && (
                  <div className="h-full overflow-auto px-3 py-2 text-xs leading-6">
                    <p className="mb-1 text-[#6f737a]">github.com/{GH_OWNER} — most recently pushed first</p>
                    {[...payload.repos].sort((a, b) => +new Date(b.pushedAt) - +new Date(a.pushedAt)).map((r) => (
                      <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="flex flex-wrap gap-x-3 hover:bg-white/5">
                        <span className="text-[#e2b273]">{r.branch}</span>
                        <span className="text-white">{r.name}</span>
                        <span className="text-[#6f737a]">{formatDate(r.pushedAt)}</span>
                        {r.release && <span className="text-[#57965c]">({r.release.tag})</span>}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* ───────── device preview ───────── */}
        {previewOpen && (
          <div className="hidden w-64 shrink-0 flex-col border-l border-[#393b40] bg-[#232426] lg:flex" style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex items-center justify-between border-b border-[#393b40] px-3 py-2 text-[11px] text-[#9aa0a6]">
              <span>{running ? "Pixel 9 · running" : FILE_META[activeTab].label.replace(/\.(tsx|md)/, "Preview")}</span>
              <span className={`flex items-center gap-1 ${running ? "text-[#57965c]" : loading ? "text-[#e2b273]" : "text-[#57965c]"}`}>
                <Icon name={loading ? "sync" : "check_circle"} size={14} className={loading ? "animate-spin" : ""} /> {loading ? "Syncing" : "Up-to-date"}
              </span>
            </div>
            <div className="flex-1 overflow-auto p-3">
              <div className="mx-auto w-full max-w-[13rem] overflow-hidden rounded-2xl border border-[#393b40]">
                <Preview id={activeTab} payload={payload} onOpen={openFile} />
              </div>
            </div>
          </div>
        )}

        {/* ───────── bookmarks ───────── */}
        {bookmarksOpen && (
          <div className="absolute right-0 z-10 flex h-full w-full flex-col border-l border-[#393b40] bg-[#1e1f22] sm:w-72 md:static md:w-72" style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex items-center border-b border-[#393b40] px-4 py-2 text-xs">
              <span className="font-semibold text-white">Bookmarks</span>
              <button onClick={() => setBookmarksOpen(false)} aria-label="Close bookmarks panel" className={`ml-auto rounded p-0.5 text-[#9aa0a6] hover:text-white ${focusRing}`}><Icon name="close" size={16} /></button>
            </div>
            <nav aria-label="Jump to section" className="flex-1 overflow-auto p-2">
              {BOOKMARK_NAV.map((b, i) => (
                <button key={b.target} onClick={() => openFile(b.target)} className={`flex w-full items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-white/5 ${focusRing}`}>
                  <span className="flex h-6 w-8 shrink-0 items-center justify-center rounded border border-[#393b40] bg-[#2b2d30] text-[10px] font-semibold text-[#9aa0a6]">F{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-medium text-[#e2e4e9]">{FILE_META[b.target].label}</span>
                    <span className="block truncate text-[11px] text-[#8a8f96]">{b.sub}</span>
                  </span>
                </button>
              ))}
              <p className="mx-2 mb-1 mt-4 text-[10px] font-semibold uppercase tracking-wide text-[#6f737a]">Line bookmarks</p>
              {lineBookmarks.length === 0 && <p className="px-2 text-[11px] leading-relaxed text-[#6f737a]">Click a line number in the editor, or press Alt+B, to drop a bookmark.</p>}
              {lineBookmarks.map((b) => (
                <button key={`${b.file}:${b.line}`} onClick={() => jump(b.file, b.line)} className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left hover:bg-white/5 ${focusRing}`}>
                  <Icon name="bookmark" size={14} className="text-[#e2b273]" />
                  <span className="min-w-0">
                    <span className="block truncate text-xs text-[#e2e4e9]">{FILE_META[b.file].label}:{b.line}</span>
                    <span className="block truncate font-mono text-[11px] text-[#8a8f96]">{plainByFile[b.file][b.line - 1]?.trim()}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* ───────── status bar ───────── */}
      <div className="flex shrink-0 items-center gap-1.5 border-t border-[#393b40] bg-[#2b2d30] px-3 py-1 text-[11px] text-[#9aa0a6]">
        <span className="hidden sm:inline">portfolio</span>
        <span className="hidden sm:inline"><Crumb /></span>
        {FILE_META[activeTab].dir && (<><span>{FILE_META[activeTab].dir}</span><Crumb /></>)}
        <span className="text-[#e2e4e9]">{FILE_META[activeTab].label}</span>
        <button
          onClick={() => void reload()} title={payload.errors.join("\n") || "Reload GitHub data"}
          className={`ml-3 flex items-center gap-1 rounded px-1.5 hover:bg-white/10 ${focusRing} ${payload.source === "live" ? "text-[#57965c]" : payload.source === "partial" ? "text-[#e2b273]" : "text-[#cf6a4c]"}`}
        >
          <Icon name={loading ? "sync" : payload.source === "live" ? "cloud_done" : "cloud_off"} size={13} className={loading ? "animate-spin" : ""} />
          <span className="hidden sm:inline">{loading ? "Syncing GitHub…" : payload.source === "live" ? "GitHub: live" : payload.source === "partial" ? "GitHub: partial" : "GitHub: cached"}</span>
        </button>
        <span className="ml-auto hidden sm:inline">{isMd ? "Markdown" : "TypeScript JSX"}</span>
        <span className="hidden sm:inline">LF</span>
        <span className="hidden sm:inline">UTF-8</span>
        <span>Ln {cursor}, Col 1</span>
        <span className="hidden text-[#6f737a] md:inline">/{total}</span>
      </div>

      {/* ───────── Search Everywhere ───────── */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-3 pt-[12vh]" onMouseDown={(e) => e.target === e.currentTarget && closePalette()}>
          <div role="dialog" aria-modal="true" aria-label="Search everywhere" className="w-full max-w-xl overflow-hidden rounded-lg border border-[#393b40] bg-[#2b2d30] shadow-2xl" style={{ fontFamily: "var(--font-sans)" }}>
            <div className="flex items-center gap-2 border-b border-[#393b40] px-3">
              <Icon name="search" size={18} className="text-[#9aa0a6]" />
              <input
                ref={paletteInput} value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files, projects, actions… (:12 to go to a line)" aria-label="Search everywhere"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, paletteResults.length - 1)); }
                  else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
                  else if (e.key === "Enter") { e.preventDefault(); const it = paletteResults[sel]; if (it) { closePalette(); it.run(); } }
                  else if (e.key === "Escape") { e.preventDefault(); closePalette(); }
                }}
                className="w-full bg-transparent py-3 text-sm text-white placeholder:text-[#6f737a] outline-none"
              />
            </div>
            <ul className="max-h-80 overflow-auto py-1" role="listbox">
              {paletteResults.length === 0 && <li className="px-4 py-3 text-xs text-[#6f737a]">No results</li>}
              {paletteResults.map((it, i) => (
                <li key={it.id} role="option" aria-selected={i === sel}>
                  <button
                    onMouseMove={() => setSel(i)} onClick={() => { closePalette(); it.run(); }}
                    className={`flex w-full items-center gap-3 px-4 py-2 text-left text-xs ${i === sel ? "bg-[#3574f0]/30 text-white" : "text-[#cfd3d8]"}`}
                  >
                    <Icon name={it.icon} size={16} className="text-[#9aa0a6]" />
                    <span className="min-w-0 flex-1 truncate">{it.label}</span>
                    {it.hint && <span className="shrink-0 text-[11px] text-[#6f737a]">{it.hint}</span>}
                    <span className="shrink-0 rounded bg-[#393b40] px-1.5 text-[10px] text-[#9aa0a6]">{it.group}</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-4 border-t border-[#393b40] px-4 py-1.5 text-[10px] text-[#6f737a]">
              <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
            </div>
          </div>
        </div>
      )}

      {/* ───────── notifications ───────── */}
      <div className="pointer-events-none fixed bottom-9 right-3 z-40 flex w-72 flex-col gap-2" style={{ fontFamily: "var(--font-sans)" }} aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto flex gap-3 rounded-lg border border-[#393b40] bg-[#2b2d30] p-3 shadow-xl">
            <Icon name={t.icon} size={20} className="text-[#57965c]" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white">{t.title}</p>
              <p className="text-[11px] leading-snug text-[#9aa0a6]">{t.body}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
