/**
 * The curl animation. Swap the body of `buildFrames()` for your own frames:
 * each frame is just a string; the route clears the screen between them.
 */
export const FRAME_MS = 80;

const ESC = "\x1b";
const rgb = (r: number, g: number, b: number) => `${ESC}[38;2;${r};${g};${b}m`;
const RESET = `${ESC}[0m`;

const SPIN = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const TITLE = "roengentium.me";

export function buildFrames(): string[] {
  const frames: string[] = [];

  // 1. type the title out
  for (let i = 1; i <= TITLE.length; i++) {
    frames.push(`\n  ${rgb(87, 150, 92)}${TITLE.slice(0, i)}${i < TITLE.length ? "█" : ""}${RESET}\n`);
  }

  // 2. progress bar with a spinner
  const W = 30;
  for (let p = 0; p <= 100; p += 2) {
    const fill = Math.round((p / 100) * W);
    const hue = Math.round(87 + (p / 100) * 130);
    frames.push(
      `\n  ${rgb(87, 150, 92)}${TITLE}${RESET}\n\n` +
        `  ${SPIN[(p / 2) % SPIN.length]} building portfolio\n` +
        `  [${rgb(hue, 150, 220 - p)}${"█".repeat(fill)}${RESET}${"░".repeat(W - fill)}] ${String(p).padStart(3)}%\n`
    );
  }

  // 3. done
  for (let i = 0; i < 12; i++) {
    const on = i % 2 === 0;
    frames.push(
      `\n  ${rgb(87, 150, 92)}${TITLE}${RESET}\n\n` +
        `  ${on ? rgb(87, 150, 92) : rgb(165, 194, 97)}✔ BUILD SUCCESSFUL${RESET}\n` +
        `  https://github.com/roengentium\n`
    );
  }
  return frames;
}
