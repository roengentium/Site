<# : batch portion
@echo off & setlocal
chcp 65001 >nul
mode con: cols=120 lines=34 >nul 2>&1
powershell -NoProfile -ExecutionPolicy Bypass -Command "iex (${%~f0} | Out-String)"
goto :eof
: end batch / begin powershell #>

# =====================================================================
#  MATRIX -> AQUA SWIRL -> LOGO  on a Frutiger Aero sky   (edit below)
# =====================================================================
$Brand      = 'Y O U R   B R A N D'   # text typed under the logo
$Fullscreen = $true                    # toggles fullscreen (Alt+Enter) and restores it after
$P1 = 60       # frames of pure matrix rain
$P2 = 110      # frames of swirl / colour shift / sky fading in
$P3 = 90       # frames of logo hold (shimmer, bubbles, sparkles)
$FrameMs = 40  # ms per frame

$src = @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using System.Threading;

public static class Aero
{
    const string ESC = "\u001b";
    static int W, H, cxn, cyn;
    static double pxRow, pxCol;
    static bool thick;
    static HashSet<int> pts = new HashSet<int>();
    static Random rnd = new Random();
    static char[] glyphs = "0123456789ABCDEFGHKMNRTXZ$#@%&*+=<>:|".ToCharArray();

    static char G() { return glyphs[rnd.Next(glyphs.Length)]; }
    static float Clamp(float v, float lo, float hi) { return v < lo ? lo : (v > hi ? hi : v); }
    static float Lerp(float a, float b, float t) { return a + (b - a) * t; }

    // ---- logo drawn in a 300x300 pixel space, mapped to terminal cells ----
    static void Dot(double px, double py)
    {
        int c = (int)Math.Round(cxn + (px - 150) / pxCol);
        int r = (int)Math.Round(cyn + (py - 145) / pxRow);
        if (c >= 0 && c < W && r >= 0 && r < H)
        {
            pts.Add(r * W + c);
            if (thick && c + 1 < W) pts.Add(r * W + c + 1);
        }
    }
    static void Seg(double x1, double y1, double x2, double y2)
    {
        double len = Math.Sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
        int n = Math.Max(2, (int)(len / 1.5));
        for (int k = 0; k <= n; k++) { double u = (double)k / n; Dot(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u); }
    }
    static void Arc(double ox, double oy, double rad, double a1, double a2)
    {
        int n = Math.Max(8, (int)(Math.Abs(a2 - a1) * Math.PI / 180.0 * rad / 1.5));
        for (int k = 0; k <= n; k++)
        {
            double a = (a1 + (a2 - a1) * k / n) * Math.PI / 180.0;
            Dot(ox + rad * Math.Cos(a), oy - rad * Math.Sin(a));
        }
    }

    static void AppendRgb(StringBuilder sb, bool fg, int rgb)
    {
        sb.Append(ESC).Append(fg ? "[38;2;" : "[48;2;");
        sb.Append((rgb >> 16) & 255).Append(';').Append((rgb >> 8) & 255).Append(';').Append(rgb & 255).Append('m');
    }

    public static void Run(int w, int h, string brand, int p1, int p2, int p3, int frameMs)
    {
        W = w; H = h;
        int N = W * H;

        // ---------- layout ----------
        int LR = Math.Min(38, H - 12);
        LR = Math.Min(LR, (int)((W - 6) * 206.0 / 440.0));
        if (LR < 10) LR = 10;
        pxRow = 206.0 / LR; pxCol = pxRow / 2.0;
        cxn = W / 2; cyn = (int)(H * 0.45);
        thick = LR >= 20;
        int hy = (int)(H * 0.74);                       // horizon row
        int trow = Math.Min(H - 5, cyn + LR / 2 + 2);   // title row
        double top = cyn - LR / 2.0;

        // ---------- build the logo ----------
        Seg(42, 42, 258, 42); Seg(258, 42, 258, 222); Seg(258, 222, 42, 222); Seg(42, 222, 42, 42);
        Seg(42, 203, 258, 203);
        Seg(122, 222, 112, 240); Seg(178, 222, 188, 240);
        Seg(88, 240, 212, 240); Seg(88, 250, 212, 250);
        Arc(150, 128, 46, 125, 415);
        Seg(150, 86, 150, 126);
        Arc(150, 128, 68, 245, 122);
        double ang = 122 * Math.PI / 180.0;
        double hx = 150 + 68 * Math.Cos(ang), hyy = 128 - 68 * Math.Sin(ang);
        double back = Math.Atan2(-Math.Cos(ang), -Math.Sin(ang));
        for (int s = -1; s <= 1; s += 2)
        {
            double a2 = back + s * 0.55;
            Seg(hx, hyy, hx + 15 * Math.Cos(a2), hyy + 15 * Math.Sin(a2));
        }
        int[] tg = new int[pts.Count]; pts.CopyTo(tg);
        int pn = tg.Length;
        double[] pr0 = new double[pn], pr1 = new double[pn], pdt = new double[pn], pth = new double[pn], pst = new double[pn];
        for (int k = 0; k < pn; k++)
        {
            int tc = tg[k] % W, trw = tg[k] / W;
            double ax1 = (tc - cxn) / 2.0, ay1 = trw - cyn;
            double ax0 = (rnd.Next(0, W) - cxn) / 2.0, ay0 = rnd.Next(0, H) - cyn;
            pr1[k] = Math.Sqrt(ax1 * ax1 + ay1 * ay1);
            pr0[k] = Math.Sqrt(ax0 * ax0 + ay0 * ay0) + 4;
            double t1 = Math.Atan2(ay1, ax1), t0 = Math.Atan2(ay0, ax0);
            double d = t0 - t1;
            while (d > Math.PI) d -= 2 * Math.PI;
            while (d <= -Math.PI) d += 2 * Math.PI;
            pdt[k] = d + 4 * Math.PI;      // two full turns of swirl
            pth[k] = t1;
            pst[k] = rnd.NextDouble();
        }

        // ---------- buffers ----------
        float[] br = new float[N], mx = new float[N], ob = new float[N], glow = new float[N], sh = new float[N];
        char[] ch = new char[N], oc = new char[N];
        bool[] lk = new bool[N];
        int[] lf = new int[N];
        int[] pCh = new int[N], pFg = new int[N], pBg = new int[N], bgc = new int[N];
        for (int i = 0; i < N; i++) { pCh[i] = -1; pFg[i] = -1; pBg[i] = -1; }

        // ---------- per-row sky / water gradient ----------
        float[] rowR = new float[H], rowG = new float[H], rowB = new float[H];
        float[] rayFade = new float[H], horAdd = new float[H];
        for (int y = 0; y < H; y++)
        {
            if (y < hy)
            {
                float t = (float)Math.Pow((double)y / hy, 1.25);
                rowR[y] = Lerp(6, 110, t); rowG[y] = Lerp(50, 205, t); rowB[y] = Lerp(140, 250, t);
            }
            else
            {
                float t = (float)(y - hy) / Math.Max(1, H - hy);
                rowR[y] = Lerp(50, 8, t); rowG[y] = Lerp(190, 105, t); rowB[y] = Lerp(215, 150, t);
            }
            rayFade[y] = Math.Max(0f, 1f - y / (hy * 1.05f));
            double q = (y - hy) / 0.9;
            horAdd[y] = (float)(70 * Math.Exp(-q * q));
        }

        // ---------- rain columns ----------
        float[] dy = new float[W], dv = new float[W];
        for (int x = 0; x < W; x++)
        {
            dv[x] = 0.35f + (float)rnd.NextDouble() * 0.65f;
            dy[x] = rnd.NextDouble() < 0.6 ? (float)rnd.NextDouble() * H : -1f;
        }

        // ---------- bubbles, bokeh, sparkles ----------
        int nb = Math.Max(16, W / 7);
        double[] bx = new double[nb], by = new double[nb], bs = new double[nb], bp = new double[nb];
        for (int k = 0; k < nb; k++)
        { bx[k] = rnd.NextDouble() * W; by[k] = H + rnd.NextDouble() * H; bs[k] = 0.15 + rnd.NextDouble() * 0.4; bp[k] = rnd.NextDouble() * 6; }

        int nk = 14;
        double[] kx = new double[nk], ky = new double[nk], kr = new double[nk], kv = new double[nk], kp = new double[nk];
        for (int k = 0; k < nk; k++)
        {
            kx[k] = rnd.NextDouble() * W; ky[k] = rnd.NextDouble() * H;
            kr[k] = 2.5 + rnd.NextDouble() * 6.5; kv[k] = 0.03 + rnd.NextDouble() * 0.07; kp[k] = rnd.NextDouble() * 6;
        }

        int ns = Math.Max(20, W / 6);
        int[] sx = new int[ns], sy = new int[ns]; double[] sp = new double[ns];
        for (int k = 0; k < ns; k++) { sx[k] = rnd.Next(0, W); sy[k] = rnd.Next(0, hy); sp[k] = rnd.NextDouble() * 6.28; }

        int TF = p1 + p2 + p3;
        Stream so = Console.OpenStandardOutput();
        UTF8Encoding enc = new UTF8Encoding(false);
        StringBuilder sb = new StringBuilder(1 << 18);
        int curFg = -1, curBg = -1, curX = -1, curY = -1;
        float sunX = W * 0.14f, sunY = -2f, sunK = 1f / (H * H * 0.18f);
        Stopwatch sw = new Stopwatch();

        try
        {
            byte[] b0 = enc.GetBytes(ESC + "[0m" + ESC + "[2J" + ESC + "[H" + ESC + "[?25l");
            so.Write(b0, 0, b0.Length);

            for (int f = 0; f < TF; f++)
            {
                sw.Reset(); sw.Start();
                float gm, spawn, tp;
                if (f < p1) { gm = 0f; spawn = 0.05f; tp = 0f; }
                else if (f < p1 + p2)
                {
                    float q = (float)(f - p1) / p2;
                    gm = Math.Min(1f, q * 1.3f); spawn = 0.05f * (1 - q); tp = q;
                }
                else { gm = 1f; spawn = 0f; tp = 1f; }

                // decay trails, clear overlay
                for (int i = 0; i < N; i++) br[i] = br[i] > 0.03f ? br[i] * 0.84f : 0f;
                Array.Clear(oc, 0, N);

                // matrix rain
                for (int x = 0; x < W; x++)
                {
                    if (dy[x] >= 0)
                    {
                        int yy = (int)dy[x];
                        if (yy < H)
                        {
                            int i = yy * W + x;
                            if (!lk[i]) { br[i] = 1f; mx[i] = gm; ch[i] = G(); }
                        }
                        dy[x] += dv[x];
                        if (f >= p1 + p2) dv[x] *= 1.12f;
                        if (dy[x] >= H + 2) dy[x] = -1f;
                    }
                    else if (rnd.NextDouble() < spawn) { dy[x] = 0f; dv[x] = 0.35f + (float)rnd.NextDouble() * 0.65f; }
                }

                // swirl particles
                if (f >= p1)
                {
                    for (int k = 0; k < pn; k++)
                    {
                        double p = (f - (p1 + pst[k] * p2 * 0.35)) / (p2 * 0.65);
                        if (p <= 0) continue;
                        int idx = tg[k];
                        if (lk[idx]) continue;
                        if (p >= 1)
                        {
                            lk[idx] = true; lf[idx] = f; ch[idx] = G();
                            int lx = idx % W, ly = idx / W;
                            for (int ddy = -1; ddy <= 1; ddy++)
                                for (int ddx = -2; ddx <= 2; ddx++)
                                {
                                    int xx = lx + ddx, yy2 = ly + ddy;
                                    if (xx < 0 || xx >= W || yy2 < 0 || yy2 >= H) continue;
                                    float v = 1f - (Math.Abs(ddx) * 0.25f + Math.Abs(ddy) * 0.3f);
                                    int j = yy2 * W + xx;
                                    if (v > sh[j]) sh[j] = v;
                                }
                            continue;
                        }
                        double ee = p * p * (3 - 2 * p);
                        double rr = pr0[k] + (pr1[k] - pr0[k]) * ee;
                        double th = pth[k] + pdt[k] * (1 - ee);
                        int cc = (int)Math.Round(cxn + rr * Math.Cos(th) * 2);
                        int rw = (int)Math.Round(cyn + rr * Math.Sin(th));
                        if (cc >= 0 && cc < W && rw >= 0 && rw < H)
                        {
                            int i = rw * W + cc;
                            br[i] = 1f; mx[i] = 1f; ch[i] = G();
                        }
                    }
                }

                // overlay: bubbles
                if (tp > 0.3f)
                {
                    for (int k = 0; k < nb; k++)
                    {
                        by[k] -= bs[k];
                        if (by[k] < -1) { by[k] = H + rnd.NextDouble() * 6; bx[k] = rnd.NextDouble() * W; }
                        int bxx = (int)(bx[k] + Math.Sin(f * 0.1 + bp[k]) * 1.6), byy = (int)by[k];
                        if (bxx >= 0 && bxx < W && byy >= 0 && byy < H)
                        {
                            int i = byy * W + bxx;
                            oc[i] = bs[k] > 0.4 ? 'O' : (bs[k] > 0.25 ? 'o' : '.');
                            ob[i] = 1f;
                        }
                    }
                }
                // overlay: sparkles in the sky
                if (gm > 0.5f)
                {
                    for (int k = 0; k < ns; k++)
                    {
                        double v = Math.Sin(f * 0.13 + sp[k]);
                        if (v > 0.75)
                        {
                            int i = sy[k] * W + sx[k];
                            if (oc[i] == 0 && !lk[i]) { oc[i] = v > 0.93 ? '*' : '+'; ob[i] = 2f; }
                        }
                    }
                }
                // overlay: waves on the water
                if (gm > 0.3f)
                {
                    for (int row = H - 3; row < H; row++)
                        for (int x = 0; x < W; x++)
                        {
                            double v = Math.Sin(x * 0.35 + f * 0.25 + row * 1.7);
                            if (v > 0.5) { int i = row * W + x; if (oc[i] == 0) { oc[i] = '~'; ob[i] = 0.25f + 0.3f * (float)v; } }
                        }
                }
                // overlay: title
                int ts = f - (p1 + p2 + 8);
                if (ts >= 0)
                {
                    int nt = Math.Min(brand.Length, ts / 2 + 1);
                    int c0 = cxn - brand.Length / 2;
                    for (int k = 0; k < nt; k++)
                    {
                        int i = trow * W + c0 + k;
                        if (brand[k] != ' ' && i >= 0 && i < N) { oc[i] = brand[k]; ob[i] = 3f; }
                    }
                }

                // bokeh glow field
                Array.Clear(glow, 0, N);
                if (gm > 0f)
                {
                    for (int k = 0; k < nk; k++)
                    {
                        ky[k] -= kv[k]; kx[k] += Math.Sin(f * 0.02 + kp[k]) * 0.08;
                        if (ky[k] < -kr[k]) { ky[k] = H + kr[k]; kx[k] = rnd.NextDouble() * W; }
                        double r = kr[k];
                        int x0 = Math.Max(0, (int)(kx[k] - 2 * r - 2)), x1 = Math.Min(W - 1, (int)(kx[k] + 2 * r + 2));
                        int y0 = Math.Max(0, (int)(ky[k] - r - 1)), y1 = Math.Min(H - 1, (int)(ky[k] + r + 1));
                        double pulse = 0.75 + 0.25 * Math.Sin(f * 0.05 + kp[k]);
                        for (int yy = y0; yy <= y1; yy++)
                            for (int xx = x0; xx <= x1; xx++)
                            {
                                double ddx = (xx - kx[k]) * 0.5, ddy = yy - ky[k];
                                double d = Math.Sqrt(ddx * ddx + ddy * ddy);
                                double v = 0;
                                if (d < r) v += 0.20 * (1 - d / r);
                                double q2 = (d - r) / 0.7;
                                v += 0.40 * Math.Exp(-q2 * q2);
                                glow[yy * W + xx] += (float)(48 * v * pulse);
                            }
                    }
                }

                // ---------- render (only changed cells are sent) ----------
                if (gm > 0f && (f & 1) == 0)
                {
                    for (int y = 0; y < H; y++)
                        for (int x = 0; x < W; x++)
                        {
                            int i = y * W + x;
                            float add = glow[i];
                            float u = x * 0.5f - y * 0.4f;
                            float ry = (float)(Math.Sin(u * 0.30 + f * 0.012) * Math.Sin(u * 0.11 - f * 0.008 + 1.3));
                            if (ry > 0f) add += 55f * ry * ry * rayFade[y];
                            float sdx = (x - sunX) * 0.5f, sdy = y - sunY;
                            add += 100f * (float)Math.Exp(-(sdx * sdx + sdy * sdy) * sunK);
                            add += horAdd[y];
                            if (y >= hy)
                            {
                                float cs = (float)(Math.Sin(x * 0.22 + f * 0.06 + Math.Sin(y * 0.7 + f * 0.04) * 2.0) * Math.Sin(y * 0.9 - f * 0.05 + x * 0.08));
                                if (cs > 0.2f) add += 30f * cs * cs;
                            }
                            float shd = 1f - 0.45f * sh[i];
                            int rr2 = (int)(Clamp((rowR[y] + add * 0.85f) * shd, 0, 255) * gm) & 0xF8;
                            int gg2 = (int)(Clamp((rowG[y] + add) * shd, 0, 255) * gm) & 0xF8;
                            int bb2 = (int)(Clamp((rowB[y] + add * 0.95f) * shd, 0, 255) * gm) & 0xF8;
                            bgc[i] = (rr2 << 16) | (gg2 << 8) | bb2;
                        }
                }
                sb.Length = 0;
                float sweep = (f * 0.9f) % (W * 0.5f + H + 14) - 6;
                for (int y = 0; y < H; y++)
                {
                    for (int x = 0; x < W; x++)
                    {
                        int i = y * W + x;

                        int bg = bgc[i];

                        // foreground
                        char c = ' '; int fg = 0;
                        if (oc[i] != 0)
                        {
                            c = oc[i]; float o = ob[i];
                            if (o >= 1.5f) fg = 0xFFFFFF;
                            else fg = ((int)(110 + 110 * o) << 16) | ((int)(190 + 60 * o) << 8) | 255;
                        }
                        else if (lk[i])
                        {
                            c = (char)0x2588;
                            if (f - lf[i] < 6) c = ch[i];
                            float g = Clamp((float)((y - top) / LR), 0f, 1f);
                            float cr = 240 - 50 * g, cg = 250 - 15 * g, cb = 255;
                            float dd = Math.Abs(x * 0.5f + y - sweep);
                            if (dd < 3f) { float hl = (3f - dd) / 3f; cr += (255 - cr) * hl; cg += (255 - cg) * hl; }
                            fg = ((int)cr << 16) | ((int)cg << 8) | (int)cb;
                        }
                        else if (br[i] > 0.06f)
                        {
                            c = ch[i]; float b = br[i], m = mx[i];
                            float wh = b > 0.9f ? (b - 0.9f) * 10f : 0f;
                            float tr = 20 + 100 * m, tgc = 255 - 25 * m, tb = 70 + 185 * m;
                            tr += (255 - tr) * wh; tgc += (255 - tgc) * wh; tb += (255 - tb) * wh;
                            float br0 = (bg >> 16) & 255, bg0 = (bg >> 8) & 255, bb0 = bg & 255;
                            int fr = ((int)Lerp(br0, tr, b)) & 0xF8, fgg = ((int)Lerp(bg0, tgc, b)) & 0xF8, fb = ((int)Lerp(bb0, tb, b)) & 0xF8;
                            fg = (fr << 16) | (fgg << 8) | fb;
                        }
                        if (c == ' ') fg = 0;

                        if (pCh[i] == c && pFg[i] == fg && pBg[i] == bg) continue;
                        pCh[i] = c; pFg[i] = fg; pBg[i] = bg;

                        if (curY != y || curX != x) sb.Append(ESC).Append('[').Append(y + 1).Append(';').Append(x + 1).Append('H');
                        if (bg != curBg) { AppendRgb(sb, false, bg); curBg = bg; }
                        if (c != ' ' && fg != curFg) { AppendRgb(sb, true, fg); curFg = fg; }
                        sb.Append(c);
                        curX = x + 1; curY = y;
                    }
                }
                byte[] fb2 = enc.GetBytes(sb.ToString());
                so.Write(fb2, 0, fb2.Length); so.Flush();

                int wait = frameMs - (int)sw.ElapsedMilliseconds;
                if (wait > 1) Thread.Sleep(wait);
            }
            Thread.Sleep(900);
        }
        finally
        {
            byte[] bz = enc.GetBytes(ESC + "[0m" + ESC + "[" + (H + 1) + ";1H" + ESC + "[?25h\n");
            so.Write(bz, 0, bz.Length); so.Flush();
        }
    }
}
'@

$ErrorActionPreference = 'Continue'

# --- enable ANSI / VT colours on classic Windows consoles ---
try {
Add-Type -Namespace Win -Name Con -MemberDefinition @'
[DllImport("kernel32.dll")] public static extern IntPtr GetStdHandle(int n);
[DllImport("kernel32.dll")] public static extern bool GetConsoleMode(IntPtr h, out int m);
[DllImport("kernel32.dll")] public static extern bool SetConsoleMode(IntPtr h, int m);
'@
$hnd = [Win.Con]::GetStdHandle(-11); $mode = 0
[void][Win.Con]::GetConsoleMode($hnd, [ref]$mode)
[void][Win.Con]::SetConsoleMode($hnd, ($mode -bor 4))
} catch {}

# --- compile the render engine ---
try { Add-Type -TypeDefinition $src -Language CSharp } catch { Write-Host "Could not compile animation engine: $_"; exit 1 }

# --- go fullscreen (Alt+Enter works in Windows Terminal and classic console) ---
$didFs = $false
if ($Fullscreen) {
    try {
        $w0 = [Console]::WindowWidth
        Add-Type -AssemblyName System.Windows.Forms
        [Windows.Forms.SendKeys]::SendWait('%{ENTER}')
        for ($t = 0; $t -lt 30; $t++) { Start-Sleep -Milliseconds 100; if ([Console]::WindowWidth -ne $w0) { break } }
        Start-Sleep -Milliseconds 500
        $didFs = ([Console]::WindowWidth -ne $w0)
    } catch {}
}

$Wd = [Console]::WindowWidth  - 1
$Ht = [Console]::WindowHeight - 1
if ($Wd -lt 20) { $Wd = 119 }
if ($Ht -lt 10) { $Ht = 33 }

try { [Aero]::Run($Wd, $Ht, $Brand, $P1, $P2, $P3, $FrameMs) }
finally {
    if ($didFs) { try { [Windows.Forms.SendKeys]::SendWait('%{ENTER}'); Start-Sleep -Milliseconds 300 } catch {} }
}

# =====================================================================
#  >>> put your real payload below (installer, tool launch, etc.) <<<
# =====================================================================
