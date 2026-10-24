import { NextResponse } from "next/server";
import { loadRepos } from "@/lib/github";

// Re-run at most once an hour; unauthenticated GitHub allows 60 requests/hour
// and one refresh costs about 20. Set GITHUB_TOKEN to raise that to 5,000.
export const revalidate = 3600;

export async function GET() {
  const headers: Record<string, string> = {};
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const payload = await loadRepos({ headers, next: { revalidate: 3600 } } as RequestInit);

  // If everything failed, tell the client so it can try the browser route / snapshot.
  return NextResponse.json(payload, {
    status: payload.source === "snapshot" ? 502 : 200,
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
