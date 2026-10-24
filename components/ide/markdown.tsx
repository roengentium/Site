import type { ReactNode } from "react";

/**
 * Tiny, safe markdown renderer for GitHub release notes.
 * Handles headings, lists, fenced code, bold, inline code, links and images.
 * Raw HTML is dropped, and only http(s) URLs are allowed.
 */

const safeUrl = (u: string) => (/^https?:\/\//i.test(u) ? u : undefined);

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))|(`([^`]+)`)|(\*\*([^*]+)\*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const k = `${key}-${i++}`;
    if (m[1]) {
      const src = safeUrl(m[3]);
      if (src)
        // eslint-disable-next-line @next/next/no-img-element
        out.push(<img key={k} src={src} alt={m[2]} loading="lazy" className="my-2 max-w-full rounded-md border border-[#393b40]" />);
    } else if (m[4]) {
      const href = safeUrl(m[6]);
      out.push(
        href ? (
          <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="text-[#5794d1] hover:underline">
            {m[5]}
          </a>
        ) : (
          m[5]
        )
      );
    } else if (m[7]) {
      out.push(
        <code key={k} className="rounded bg-[#2b2d30] px-1 py-0.5 font-mono text-[12px] text-[#e2b273]">
          {m[8]}
        </code>
      );
    } else if (m[9]) {
      out.push(
        <strong key={k} className="font-semibold text-white">
          {m[10]}
        </strong>
      );
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const clean = source
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe)[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?[a-z][^>]*>/gi, "");
  const lines = clean.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let i = 0;
  let b = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push(
        <pre key={b++} className="my-2 overflow-x-auto rounded-md border border-[#393b40] bg-[#1e1f22] p-3 font-mono text-[12px] leading-5 text-[#a9b7c6]">
          {code.join("\n")}
        </pre>
      );
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      const size = ["text-lg", "text-base", "text-sm", "text-sm"][h[1].length - 1];
      blocks.push(
        <p key={b++} className={`mb-1 mt-4 font-bold text-white ${size}`}>
          {inline(h[2], `h${b}`)}
        </p>
      );
      i++;
      continue;
    }
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
      blocks.push(
        <ul key={b++} className="my-2 list-disc space-y-1 pl-5 marker:text-[#6f737a]">
          {items.map((t, n) => (
            <li key={n}>{inline(t, `l${b}-${n}`)}</li>
          ))}
        </ul>
      );
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\s*[-*]\s)/.test(lines[i])) para.push(lines[i++]);
    blocks.push(
      <p key={b++} className="my-2 leading-relaxed">
        {inline(para.join(" "), `p${b}`)}
      </p>
    );
  }
  return <>{blocks}</>;
}
