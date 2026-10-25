/**
 * GitHub data layer.
 *
 * `loadRepos()` talks to the real GitHub REST API (repo, latest release,
 * languages and the git tree for screenshots). It runs in two places:
 *   1. server-side in /api/github (cached for an hour, optional GITHUB_TOKEN)
 *   2. directly in the browser as a fallback (api.github.com allows CORS)
 * If both fail, the hand-written SNAPSHOT below keeps the page populated.
 */

export const GH_OWNER = "roengentium";
export const GH_PROFILE = `https://github.com/${GH_OWNER}`;

/** Best projects, in display order. */
export const FEATURED = [
  "AndroidBuilder",
  "LegacyTune",
  "ArtificiallyInteligent",
  "rgjailbreaks",
  "Cyclopean",
  "SplitLite",
] as const;

export type ReleaseAsset = {
  name: string;
  size: number;
  downloads: number;
  url: string;
};

export type Release = {
  tag: string;
  name: string;
  url: string;
  publishedAt: string;
  prerelease: boolean;
  body: string;
  assets: ReleaseAsset[];
};

export type RepoData = {
  name: string;
  url: string;
  description: string;
  language: string | null;
  languages: Record<string, number>;
  stars: number | null;
  forks: number | null;
  issues: number | null;
  topics: string[];
  license: string | null;
  branch: string;
  pushedAt: string;
  homepage: string | null;
  release: Release | null;
  /** Main picture for the card (screenshot, or GitHub's social card). */
  hero: string;
  /** Small logo/icon found in the repo, if any. */
  icon: string | null;
  /** More screenshots found in the repo or release notes. */
  gallery: string[];
};

export type RepoPayload = {
  repos: RepoData[];
  source: "live" | "partial" | "snapshot";
  fetchedAt: string;
  errors: string[];
};

const og = (name: string) => `https://opengraph.githubassets.com/1/${GH_OWNER}/${name}`;
const raw = (name: string, branch: string, path: string) =>
  `https://raw.githubusercontent.com/${GH_OWNER}/${name}/${branch}/${path
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;

/* ---------------------------------------------------------------------- */
/* Offline snapshot (taken from the repos themselves)                       */
/* ---------------------------------------------------------------------- */

const snap = (
  r: Partial<RepoData> & Pick<RepoData, "name" | "description" | "pushedAt">
): RepoData => ({
  url: `${GH_PROFILE}/${r.name}`,
  language: null,
  languages: {},
  stars: null,
  forks: null,
  issues: null,
  topics: [],
  license: null,
  branch: "main",
  homepage: null,
  release: null,
  hero: og(r.name),
  icon: null,
  gallery: [],
  ...r,
});

export const SNAPSHOT: RepoData[] = [
  snap({
    name: "AndroidBuilder",
    description:
      "romforge: a custom Android ROM build orchestrator. Finds device, kernel and recovery trees on GitHub, stages GApps and Magisk, and drives the whole build from an interactive TUI or a plain CLI.",
    language: "Python",
    languages: { Python: 1 },
    topics: ["android", "rom", "aosp", "automation", "python"],
    pushedAt: "2026-08-30T00:00:00Z",
  }),
  snap({
    name: "LegacyTune",
    description:
      "A native music player for old iPhones and iPods. Two build tiers — ARMv6 / iOS 3 and ARMv7 / iOS 6 — with library scanning, playlists, favourites and search.",
    language: "Objective-C",
    languages: { "Objective-C": 1 },
    topics: ["ios", "objective-c", "music-player", "legacy-ios"],
    pushedAt: "2026-08-30T00:00:00Z",
  }),
  snap({
    name: "ArtificiallyInteligent",
    description:
      "A lightweight AI chatbot client for jailbroken iOS 4.0+. A SpringBoard overlay, a Settings pane and a standalone app — native Objective-C, no web views — talking to OpenAI-compatible, Ollama and custom providers.",
    language: "Objective-C",
    languages: { Logos: 1 },
    license: "MIT",
    topics: ["jailbreak", "ios", "theos", "chatbot", "ollama"],
    pushedAt: "2026-10-04T00:00:00Z",
    icon: raw("ArtificiallyInteligent", "main", "App/Resources/Icon@2x.png"),
  }),
  snap({
    name: "Cyclopean",
    description:
      "A Manifest V3 Chrome extension plus a local Python server that detects AI-generated text on the pages you read, then highlights or blocks it. Classifier trained on Ollama embeddings.",
    language: "Python",
    languages: { Python: 1 },
    topics: ["chrome-extension", "manifest-v3", "scikit-learn", "ollama"],
    pushedAt: "2026-09-06T00:00:00Z",
  }),
  snap({
    name: "SplitLite",
    description:
      "Fixed 50/50 two-app tiling for the iPad 2 on iOS 9.3.5. A jailbroken SpringBoard tweak — three-finger swipe up, pick an app for each half.",
    language: "Objective-C",
    languages: { Logos: 1 },
    license: "MIT",
    topics: ["jailbreak", "ipad", "ios9", "theos", "multitasking"],
    pushedAt: "2026-10-13T00:00:00Z",
  }),
  snap({
    name: "rgjailbreaks",
    description:
      "cydia / sileo repo",
    language: "html, js, css",
    languages: { Logos: 1 },
    license: "MIT",
    topics: ["jailbreak", "theos", "development"],
    pushedAt: "2026-10-08T00:00:00Z",
  }),
];

/* ---------------------------------------------------------------------- */
/* Live loader                                                              */
/* ---------------------------------------------------------------------- */

type GhRepo = {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics?: string[];
  license: { spdx_id: string | null; name: string } | null;
  default_branch: string;
  pushed_at: string;
  homepage: string | null;
};

type GhRelease = {
  tag_name: string;
  name: string | null;
  html_url: string;
  published_at: string | null;
  created_at: string;
  prerelease: boolean;
  draft: boolean;
  body: string | null;
  assets: { name: string; size: number; download_count: number; browser_download_url: string }[];
};

type GhTree = { tree?: { path: string; type: string; size?: number }[] };

const IMG = /\.(png|jpe?g|gif|webp)$/i;
const BAD_IMG = /(node_modules|@[23]x|-\d{2,3}(@\dx)?\.|\/Pods\/|\.xcassets|Default|LaunchImage)/i;

function scoreImage(path: string): number {
  let s = 0;
  if (/(screenshot|screen|preview|banner|demo|hero|cover|showcase)/i.test(path)) s += 100;
  if (/^(docs?|assets?|images?|img|media|screenshots?)\//i.test(path)) s += 40;
  if (/icon|logo/i.test(path)) s += 5;
  s -= path.split("/").length * 2;
  return s;
}

async function getJson<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const left = res.headers.get("x-ratelimit-remaining");
    throw new Error(`${res.status} ${url.replace("https://api.github.com", "")}${left === "0" ? " (rate limited)" : ""}`);
  }
  return (await res.json()) as T;
}

async function loadOne(name: string, init: RequestInit): Promise<RepoData> {
  const base = `https://api.github.com/repos/${GH_OWNER}/${name}`;
  const repo = await getJson<GhRepo>(base, init);
  const [releases, languages, tree] = await Promise.all([
    getJson<GhRelease[]>(`${base}/releases?per_page=5`, init).catch(() => [] as GhRelease[]),
    getJson<Record<string, number>>(`${base}/languages`, init).catch(() => ({})),
    getJson<GhTree>(`${base}/git/trees/${encodeURIComponent(repo.default_branch)}?recursive=1`, init).catch(
      () => ({}) as GhTree
    ),
  ]);

  const fallback = SNAPSHOT.find((s) => s.name === name);
  const latest = releases.find((r) => !r.draft) ?? null;
  const release: Release | null = latest
    ? {
        tag: latest.tag_name,
        name: latest.name || latest.tag_name,
        url: latest.html_url,
        publishedAt: latest.published_at ?? latest.created_at,
        prerelease: latest.prerelease,
        body: latest.body ?? "",
        assets: latest.assets.map((a) => ({
          name: a.name,
          size: a.size,
          downloads: a.download_count,
          url: a.browser_download_url,
        })),
      }
    : null;

  const imgs = (tree.tree ?? [])
    .filter((t) => t.type === "blob" && IMG.test(t.path) && !BAD_IMG.test(t.path))
    .map((t) => ({ path: t.path, score: scoreImage(t.path) }))
    .sort((a, b) => b.score - a.score);

  const bodyImgs = release
    ? Array.from(release.body.matchAll(/!\[[^\]]*\]\((https?:[^)\s]+)\)/g)).map((m) => m[1])
    : [];
  const shots = imgs.filter((i) => i.score >= 50).map((i) => raw(name, repo.default_branch, i.path));
  const icons = imgs.filter((i) => i.score < 50).map((i) => raw(name, repo.default_branch, i.path));
  const pictures = [...bodyImgs, ...shots];

  return {
    name: repo.name,
    url: repo.html_url,
    description: repo.description || fallback?.description || "",
    language: repo.language,
    languages,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    issues: repo.open_issues_count,
    topics: repo.topics?.length ? repo.topics : fallback?.topics ?? [],
    license: repo.license && repo.license.spdx_id && repo.license.spdx_id !== "NOASSERTION" ? repo.license.spdx_id : null,
    branch: repo.default_branch,
    pushedAt: repo.pushed_at,
    homepage: repo.homepage || null,
    release,
    hero: pictures[0] ?? og(name),
    icon: icons[0] ?? null,
    gallery: pictures.slice(1, 4),
  };
}

export async function loadRepos(init: RequestInit = {}): Promise<RepoPayload> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  const opts: RequestInit = { ...init, headers };
  const errors: string[] = [];

  const results = await Promise.allSettled(FEATURED.map((n) => loadOne(n, opts)));
  const repos = results.map((r, i) => {
    if (r.status === "fulfilled") return r.value;
    errors.push(String(r.reason?.message ?? r.reason));
    return SNAPSHOT.find((s) => s.name === FEATURED[i])!;
  });
  const ok = results.filter((r) => r.status === "fulfilled").length;

  return {
    repos,
    source: ok === FEATURED.length ? "live" : ok === 0 ? "snapshot" : "partial",
    fetchedAt: new Date().toISOString(),
    errors,
  };
}

/* ---------------------------------------------------------------------- */
/* Small helpers shared by the UI                                           */
/* ---------------------------------------------------------------------- */

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export const LANG_COLORS: Record<string, string> = {
  Python: "#3572a5",
  "Objective-C": "#438eff",
  "Objective-C++": "#6866fb",
  Logos: "#a9b7c6",
  Makefile: "#427819",
  Shell: "#89e051",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  "C++": "#f34b7d",
  C: "#8a8f96",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Java: "#b07219",
  Kotlin: "#a97bff",
};
export const langColor = (l: string) => LANG_COLORS[l] ?? "#6f737a";
