import type { ReactNode } from "react";
import { GH_OWNER, formatDate, type RepoPayload } from "@/lib/github";
import { ABOUT, CONTACT, PROFILE, SKILLS } from "@/lib/content";

/* Darcula-ish syntax colours */
export const KW = "text-[#cf8e6d]";
export const FN = "text-[#57965c]";
export const PARAM = "text-[#67d6ef]";
export const STR = "text-[#a5c261]";
export const COM = "text-[#7a7e85] italic";
export const MUT = "text-[#a9b7c6]";
export const HEADER = "text-[#5794d1] font-bold";

export type FileId = "home" | "about" | "skills" | "work" | "contact";
export const FILE_IDS: FileId[] = ["home", "about", "skills", "work", "contact"];

export const FILE_META: Record<FileId, { label: string; ext: "TSX" | "MD"; dir: string }> = {
  home: { label: "Home.tsx", ext: "TSX", dir: "" },
  about: { label: "About.tsx", ext: "TSX", dir: "src" },
  skills: { label: "SKILLS.md", ext: "MD", dir: "src" },
  work: { label: "WORK.md", ext: "MD", dir: "src" },
  contact: { label: "Contact.tsx", ext: "TSX", dir: "src" },
};

export type LineData = { text: ReactNode };

/** Plain text of a rendered line — used by search, `cat` and the structure view. */
export function textOf(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in node) return textOf((node as { props: { children?: ReactNode } }).props.children);
  return "";
}

const L = (text: ReactNode): LineData => ({ text });
const kw = (s: string) => <span className={KW}>{s}</span>;
const mut = (s: string) => <span className={MUT}>{s}</span>;
const str = (s: string, q = "'") => (
  <span className={STR}>
    {q}
    {s}
    {q}
  </span>
);
const prop = (indent: number, k: string, v: ReactNode, tail = ",") =>
  L(
    <span>
      {" ".repeat(indent)}
      <span className={PARAM}>{k}</span>
      {mut(": ")}
      {v}
      {mut(tail)}
    </span>
  );

function wrap(s: string, width: number): string[] {
  const out: string[] = [];
  let cur = "";
  for (const w of s.split(" ")) {
    if ((cur + " " + w).trim().length > width) {
      out.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}

function homeLines(): LineData[] {
  return [
    L(
      <span>
        {kw("export default function")} <span className={FN}>Hero</span>
        {mut("() {")}
      </span>
    ),
    L(
      <span>
        {"  "}
        {kw("return")} {mut("{")}
      </span>
    ),
    prop(4, "name", str(PROFILE.name)),
    prop(4, "tagline", str(PROFILE.tagline)),
    prop(4, "photo", str(PROFILE.photo)),
    prop(4, "status", str(PROFILE.status)),
    L(<span>{"  "}{mut("};")}</span>),
    L(mut("}")),
  ];
}

function aboutLines(): LineData[] {
  const bio = wrap(ABOUT.bio, 62);
  return [
    L(<span className={COM}>{"// who's behind the handle"}</span>),
    L(
      <span>
        {kw("export const")} <span className={PARAM}>about</span> {mut("= {")}
      </span>
    ),
    L(
      <span>
        {"  "}
        <span className={PARAM}>roles</span>
        {mut(": [")}
      </span>
    ),
    ...ABOUT.roles.map((r) => L(<span>{"    "}{str(r)}{mut(",")}</span>)),
    L(<span>{"  "}{mut("],")}</span>),
    ...bio.map((line, i) =>
      i === 0 ? (
        L(
          <span>
            {"  "}
            <span className={PARAM}>bio</span>
            {mut(": ")}
            <span className={STR}>{"`" + line}</span>
          </span>
        )
      ) : (
        L(
          <span className={STR}>
            {"    " + line}
            {i === bio.length - 1 ? "`" : ""}
            {i === bio.length - 1 && <span className={MUT}>,</span>}
          </span>
        )
      )
    ),
    L(mut("};")),
  ];
}

function skillsLines(): LineData[] {
  return [
    L(<span className={COM}>{"// pinout — what I build with"}</span>),
    L(
      <span>
        {kw("export const")} <span className={PARAM}>skills</span> {mut("= [")}
      </span>
    ),
    ...SKILLS.flatMap((s, i) => [
      L(<span>{"  "}{mut("{")}</span>),
      prop(4, "pin", str(s.pin)),
      prop(4, "title", str(s.title)),
      L(
        <span>
          {"    "}
          <span className={PARAM}>tools</span>
          {mut(": [")}
          {s.tools.map((t, n) => (
            <span key={t}>
              {str(t)}
              {n < s.tools.length - 1 && mut(", ")}
            </span>
          ))}
          {mut("],")}
        </span>
      ),
      L(<span>{"  "}{mut(i === SKILLS.length - 1 ? "}" : "},")}</span>),
    ]),
    L(mut("];")),
  ];
}

function contactLines(): LineData[] {
  return [
    L(
      <span>
        {kw("export const")} <span className={PARAM}>contact</span> {mut("= {")}
      </span>
    ),
    ...Object.entries(CONTACT).map(([k, v]) => prop(2, k, str(v))),
    L(mut("};")),
  ];
}

/** WORK.md is real markdown, generated from the GitHub payload. */
function workLines(payload: RepoPayload): LineData[] {
  const out: LineData[] = [
    L(<span className={HEADER}>{`# Releases — @${GH_OWNER}`}</span>),
    L(<span className={COM}>{`<!-- ${payload.source === "live" ? "live data from api.github.com" : "cached data"} · ${formatDate(payload.fetchedAt)} -->`}</span>),
    L(""),
  ];
  for (const r of payload.repos) {
    const when = formatDate(r.release?.publishedAt ?? r.pushedAt);
    out.push(
      L(
        <span>
          <span className={HEADER}>{"## "}</span>
          <span className={HEADER}>{r.name}</span>
          <span className={COM}>{`  ${r.release?.tag ?? r.branch} · ${when}`}</span>
        </span>
      ),
      L(<span className={COM}>{"> " + r.description}</span>),
      L(""),
      L(
        <span>
          <span className={KW}>{"!["}</span>
          <span className={PARAM}>{r.name}</span>
          <span className={KW}>{"]("}</span>
          <span className={STR}>{r.hero}</span>
          <span className={KW}>{")"}</span>
        </span>
      ),
      L(""),
      L(
        <span>
          {mut("- ")}
          <span className={PARAM}>language</span>
          {mut(": ")}
          {r.language ?? "—"}
          {r.topics.length > 0 && (
            <>
              {mut("  ·  ")}
              <span className={PARAM}>topics</span>
              {mut(": ")}
              {r.topics.join(", ")}
            </>
          )}
        </span>
      ),
      L(
        <span>
          {mut("- ")}
          <span className={PARAM}>source</span>
          {mut(": ")}
          <span className={STR}>{r.url}</span>
        </span>
      ),
      L("")
    );
  }
  return out;
}

export function buildLines(file: FileId, payload: RepoPayload): LineData[] {
  switch (file) {
    case "home":
      return homeLines();
    case "about":
      return aboutLines();
    case "skills":
      return skillsLines();
    case "work":
      return workLines(payload);
    case "contact":
      return contactLines();
  }
}
