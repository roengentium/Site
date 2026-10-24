"use client";

import { useState } from "react";
import {
  GH_OWNER,
  formatBytes,
  formatDate,
  langColor,
  type RepoData,
  type RepoPayload,
} from "@/lib/github";
import { Markdown } from "./markdown";

function MIcon({ name, size = 16, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <span className={`material-icons select-none leading-none ${className}`} style={{ fontSize: size }} aria-hidden="true" translate="no">
      {name}
    </span>
  );
}

/** An image that degrades to a gradient tile if the URL fails (offline, blocked, 404). */
function Picture({ src, alt, className, label }: { src: string; alt: string; className?: string; label: string }) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-[#2b2d30] to-[#1a1b1d] text-2xl font-black text-[#3a3d41] ${className ?? ""}`} role="img" aria-label={alt}>
        {label}
      </div>
    );
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}

function LanguageBar({ repo }: { repo: RepoData }) {
  const entries = Object.entries(repo.languages);
  const total = entries.reduce((n, [, v]) => n + v, 0);
  if (!total) return null;
  return (
    <div className="mt-3">
      <div className="flex h-1.5 overflow-hidden rounded-full bg-[#2b2d30]" role="img" aria-label={`Languages: ${entries.map(([k]) => k).join(", ")}`}>
        {entries.map(([k, v]) => (
          <span key={k} style={{ width: `${(v / total) * 100}%`, background: langColor(k) }} />
        ))}
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#9aa0a6]">
        {entries.slice(0, 5).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full" style={{ background: langColor(k) }} />
            <span className="text-[#cfd3d8]">{k}</span>
            {entries.length > 1 && <span>{((v / total) * 100).toFixed(1)}%</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1 text-[11px] text-[#9aa0a6]">
      <MIcon name={icon} size={14} /> {children}
    </span>
  );
}

function ReleaseEntry({ repo, index, highlighted }: { repo: RepoData; index: number; highlighted: boolean }) {
  const [assetsOpen, setAssetsOpen] = useState(index === 0);
  const rel = repo.release;
  const zip = `${repo.url}/archive/refs/heads/${repo.branch}.zip`;
  const tgz = `${repo.url}/archive/refs/heads/${repo.branch}.tar.gz`;
  const date = formatDate(rel?.publishedAt ?? repo.pushedAt);
  const label = repo.name.slice(0, 2).toUpperCase();

  return (
    <article
      id={`repo-${repo.name}`}
      className={`grid gap-4 border-b border-[#393b40] py-8 md:grid-cols-[11rem_1fr] md:gap-8 ${highlighted ? "bg-[#3574f0]/[0.06]" : ""}`}
    >
      {/* left rail: date + tag, like github.com/<repo>/releases */}
      <div className="flex flex-row flex-wrap items-start gap-x-3 gap-y-2 md:flex-col md:pr-2">
        <time className="text-xs font-medium text-[#cfd3d8]">{date}</time>
        <a
          href={rel?.url ?? repo.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-[#9aa0a6] hover:text-[#5794d1]"
        >
          <MIcon name="sell" size={14} />
          {rel?.tag ?? repo.branch}
        </a>
        <span className="flex items-center gap-1 text-[11px] text-[#6f737a]">
          <MIcon name="call_split" size={13} /> {repo.branch}
        </span>
      </div>

      {/* right: the release card */}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {repo.icon && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={repo.icon} alt="" className="h-7 w-7 rounded-md border border-[#393b40] bg-[#1e1f22]" onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
          <h2 className="text-xl font-bold tracking-tight text-white">
            <a href={rel?.url ?? repo.url} target="_blank" rel="noopener noreferrer" className="hover:text-[#5794d1]">
              {rel ? rel.name : repo.name}
            </a>
          </h2>
          {index === 0 && rel && !rel.prerelease && (
            <span className="rounded-full border border-[#57965c]/50 px-2 py-0.5 text-[11px] font-medium text-[#57965c]">Latest</span>
          )}
          {rel?.prerelease && (
            <span className="rounded-full border border-[#e2b273]/50 px-2 py-0.5 text-[11px] font-medium text-[#e2b273]">Pre-release</span>
          )}
          {!rel && (
            <span className="rounded-full border border-[#393b40] px-2 py-0.5 text-[11px] font-medium text-[#9aa0a6]" title="No GitHub release published yet — source only">
              Source only
            </span>
          )}
        </div>
        {rel && <p className="mt-0.5 text-xs text-[#6f737a]">{repo.name}</p>}

        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#cfd3d8]">{repo.description}</p>

        {rel?.body.trim() && (
          <div className="mt-3 max-w-2xl text-sm text-[#cfd3d8]">
            <Markdown source={rel.body} />
          </div>
        )}

        <a href={repo.url} target="_blank" rel="noopener noreferrer" className="mt-4 block overflow-hidden rounded-lg border border-[#393b40] bg-[#1e1f22] transition-colors hover:border-[#4a4d52]">
          <Picture src={repo.hero} alt={`${repo.name} preview`} label={label} className="aspect-[2/1] w-full object-cover" />
        </a>

        {repo.gallery.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {repo.gallery.map((g) => (
              <Picture key={g} src={g} alt={`${repo.name} screenshot`} label={label} className="aspect-video w-full rounded-md border border-[#393b40] object-cover" />
            ))}
          </div>
        )}

        <LanguageBar repo={repo} />

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {repo.stars !== null && <Stat icon="star_border">{repo.stars}</Stat>}
          {repo.forks !== null && <Stat icon="call_split">{repo.forks}</Stat>}
          {repo.issues !== null && <Stat icon="error_outline">{repo.issues} open</Stat>}
          {repo.license && <Stat icon="balance">{repo.license}</Stat>}
          <Stat icon="update">pushed {formatDate(repo.pushedAt)}</Stat>
        </div>

        {repo.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {repo.topics.map((t) => (
              <a key={t} href={`https://github.com/topics/${t}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#3574f0]/15 px-2.5 py-0.5 text-[11px] text-[#7aa7f5] hover:bg-[#3574f0]/30">
                {t}
              </a>
            ))}
          </div>
        )}

        {/* Assets */}
        <div className="mt-5 max-w-2xl overflow-hidden rounded-lg border border-[#393b40]">
          <button
            type="button"
            onClick={() => setAssetsOpen((v) => !v)}
            aria-expanded={assetsOpen}
            className="flex w-full items-center gap-1 bg-[#2b2d30] px-3 py-2 text-left text-xs font-semibold text-white hover:bg-[#2f3135]"
          >
            <MIcon name={assetsOpen ? "arrow_drop_down" : "arrow_right"} size={20} />
            Assets
            <span className="ml-1 rounded-full bg-[#393b40] px-1.5 text-[10px] font-medium text-[#cfd3d8]">
              {(rel?.assets.length ?? 0) + 2}
            </span>
          </button>
          {assetsOpen && (
            <ul className="divide-y divide-[#393b40] text-xs">
              {rel?.assets.map((a) => (
                <li key={a.name}>
                  <a href={a.url} className="flex items-center gap-2 px-3 py-2 text-[#5794d1] hover:bg-white/[0.03]">
                    <MIcon name="inventory_2" size={16} className="text-[#9aa0a6]" />
                    <span className="min-w-0 flex-1 truncate">{a.name}</span>
                    <span className="shrink-0 text-[#6f737a]">{formatBytes(a.size)}</span>
                    <span className="hidden shrink-0 text-[#6f737a] sm:inline">{a.downloads} ↓</span>
                  </a>
                </li>
              ))}
              <li>
                <a href={zip} className="flex items-center gap-2 px-3 py-2 text-[#5794d1] hover:bg-white/[0.03]">
                  <MIcon name="folder_zip" size={16} className="text-[#9aa0a6]" />
                  <span className="flex-1">Source code (zip)</span>
                </a>
              </li>
              <li>
                <a href={tgz} className="flex items-center gap-2 px-3 py-2 text-[#5794d1] hover:bg-white/[0.03]">
                  <MIcon name="folder_zip" size={16} className="text-[#9aa0a6]" />
                  <span className="flex-1">Source code (tar.gz)</span>
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}

const SOURCE_LABEL = {
  live: { text: "Live from the GitHub API", color: "#57965c", icon: "cloud_done" },
  partial: { text: "Partly live — some repos from cache", color: "#e2b273", icon: "cloud_queue" },
  snapshot: { text: "Offline snapshot — GitHub API unreachable", color: "#cf6a4c", icon: "cloud_off" },
} as const;

export function ReleasesView({
  payload,
  loading,
  onReload,
  focus,
}: {
  payload: RepoPayload;
  loading: boolean;
  onReload: () => void;
  focus: string | null;
}) {
  const s = SOURCE_LABEL[payload.source];
  return (
    <div className="mx-auto w-full max-w-4xl px-5 pb-16 pt-6" style={{ fontFamily: "var(--font-sans)" }}>
      <header className="flex flex-wrap items-center gap-3 border-b border-[#393b40] pb-4">
        <MIcon name="rocket_launch" size={22} className="text-[#9aa0a6]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Releases</h1>
          <p className="text-xs text-[#9aa0a6]">
            Best projects by{" "}
            <a href={`https://github.com/${GH_OWNER}`} target="_blank" rel="noopener noreferrer" className="text-[#5794d1] hover:underline">
              @{GH_OWNER}
            </a>
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1" style={{ color: s.color }} title={payload.errors.join("\n") || undefined}>
            <MIcon name={s.icon} size={15} /> {loading ? "Refreshing…" : s.text}
          </span>
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            className="flex items-center gap-1 rounded border border-[#393b40] px-2 py-1 text-[#cfd3d8] hover:bg-white/5 disabled:opacity-50"
          >
            <MIcon name="refresh" size={14} className={loading ? "animate-spin" : ""} /> Reload
          </button>
        </div>
      </header>

      {payload.repos.map((r, i) => (
        <ReleaseEntry key={r.name} repo={r} index={i} highlighted={focus === r.name} />
      ))}
    </div>
  );
}
