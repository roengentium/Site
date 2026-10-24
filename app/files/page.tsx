"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WorkspaceFile {
  name: string;
  type: string;
  path: string;
  size: string;
}

export default function IndexPage() {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function readWorkspaceFiles() {
      try {
        const res = await fetch("/api/files");
        if (!res.ok) throw new Error("API filesystem channel offline");
        const data = await res.json();
        setFiles(data.error ? [] : data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    readWorkspaceFiles();
  }, []);

  return (
    <main 
      className="relative min-h-screen w-full flex flex-col items-center justify-start py-16 px-4 bg-[#030303] text-zinc-300 select-none antialiased"
      style={{ fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      
      {/* Shared Cinematic Black & White City Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat fixed filter grayscale brightness-[0.20] contrast-[1.1]"
        style={{ backgroundImage: "url('https://unsplash.com')" }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-[#030303] fixed" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] fixed" />

      <div className="z-10 w-full max-w-2xl flex flex-col gap-8">
        
        {/* Navigation Breadcrumbs */}
        <nav className="w-full flex items-center justify-start gap-3 text-xs font-semibold tracking-wide">
          <Link href="/" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Home</Link>
          <span className="text-zinc-800">/</span>
          <Link href="/projects" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Projects</Link>
          <span className="text-zinc-800">/</span>
          <Link href="/languages" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Languages</Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-200">Index</span>
        </nav>

        {/* Section Title */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Index</h1>
          <p className="text-zinc-400 text-sm">A real-time file tree generated dynamically from the production source repository.</p>
        </header>

        {/* System Inventory Grid */}
        <div className="w-full rounded-2xl border border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl shadow-2xl overflow-hidden0">
          <div className="overflow-x-auto">
            
            {loading && (
              <div className="w-full py-16 text-center text-xs font-mono text-zinc-500 tracking-widest animate-pulse">
                SCANNING_WORKSPACE_DIRECTORIES...
              </div>
            )}

            {error && (
              <div className="w-full m-6 text-center text-xs font-mono text-rose-500/80 p-4 border border-rose-500/20 bg-rose-500/5 rounded-xl">
                ERROR: Failed to establish server-side disk inventory.
              </div>
            )}

            {!loading && !error && files.length === 0 && (
              <div className="w-full py-16 text-center text-xs text-zinc-600 font-mono">
                EMPTY_WORKSPACE_SECTOR
              </div>
            )}

            {!loading && !error && files.length > 0 && (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500 font-semibold tracking-wider uppercase bg-zinc-900/20">
                    <th className="py-3 px-5">Object File</th>
                    <th className="py-3 px-4">Allocation Type</th>
                    <th className="py-3 px-4 text-right">Disk Memory</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40 text-zinc-400 font-medium">
                  {files.map((file) => (
                    <tr key={file.path} className="hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-zinc-200">
                        <div className="flex flex-col">
                          <span>{file.name}</span>
                          <span className="text-[10px] text-zinc-600 font-sans tracking-normal mt-0.5">{file.path}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-zinc-400 font-sans">{file.type}</td>
                      <td className="py-3.5 px-4 text-right font-mono text-zinc-500">{file.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-between text-[11px] text-zinc-600 font-medium tracking-wide border-t border-zinc-900/60 pt-6 mt-4">
          <div>Mapped Sector Allocation: {files.length} active files</div>
          <div>Index system status: ONLINE</div>
        </footer>

      </div>
    </main>
  );
}
