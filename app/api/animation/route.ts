import { FRAME_MS, buildFrames } from "@/lib/animation";

// Streamed responses need to stay open for the length of the animation.
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const CLEAR = "\x1b[H\x1b[2J";
const HIDE = "\x1b[?25l";
const SHOW = "\x1b[?25h";

export async function GET(request: Request) {
  const ua = request.headers.get("user-agent") ?? "";
  const wantsHtml = (request.headers.get("accept") ?? "").includes("text/html");

  // Browsers would just see escape codes, so point them at the command instead.
  if (wantsHtml || !/curl|wget|httpie|powershell|libwww/i.test(ua)) {
    return new Response("Run it in a terminal:\n\n  curl -N https://roengentium.me/animation.bat\n", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const frames = buildFrames();
  const enc = new TextEncoder();
  let cancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const abort = () => { cancelled = true; };
      request.signal.addEventListener("abort", abort);
      try {
        controller.enqueue(enc.encode(HIDE));
        for (const f of frames) {
          if (cancelled) return;
          controller.enqueue(enc.encode(CLEAR + f));
          await new Promise((r) => setTimeout(r, FRAME_MS));
        }
      } finally {
        try { controller.enqueue(enc.encode(SHOW)); controller.close(); } catch {}
        request.signal.removeEventListener("abort", abort);
      }
    },
    cancel() { cancelled = true; },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
