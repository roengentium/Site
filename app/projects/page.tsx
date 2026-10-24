"use client";

import Link from "next/link";

const projectsData = [
  {
    id: "launcherx",
    title: "LauncherX",
    tag: "Roblox / Client",
    color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
    description: "LauncherX is a fork of a Roblox Revival called Project Mega. It basically turns all of the clients into one launcher that you can use to play any version you want! I'll also have a way to configure the clients to run on localhost, basically turning Roblox into a singleplayer client.",
  },
  {
    id: "infiniality",
    title: "Infiniality",
    tag: "Unity / Game",
    color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
    description: "You wake up one day to the jingle of a large department store. This is SCP-3008-1, and as soon as you realize this, you have no escape from this store. How long can you survive?\n\nMade in Unity 2022.3",
  },
  {
    id: "deluge",
    title: "Deluge",
    tag: "Unity / Game",
    color: "border-indigo-500/20 text-indigo-400 bg-indigo-500/5",
    description: "Deluge is a platformer game mostly inspired by the Roblox game \"Flood Escape 2\". You escape floods made out of different fluids, push buttons, and survive.\n\nMade in Unity 2022.3",
  },
  {
    id: "obscureyt",
    title: "ObscureYT",
    tag: "Web / API",
    color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5",
    description: "A website that is dedicated to finding old youtube videos! There is even a Tags section so that you can specify which videos you want to see! We also made another one that pulls Roblox Videos as well.",
    links: [
      { label: "RobloxYT", href: "https://github.io" },
      { label: "ObscureYT", href: "https://github.io" },
    ],
  },
  {
    id: "compressd",
    title: "Compress'd",
    tag: "Tool / Video",
    color: "border-amber-500/20 text-amber-400 bg-amber-500/5",
    description: "A video compressor for discord! Check it out:",
    links: [
      { label: "Video Bypasser", href: "https://github.io" },
    ],
  },
];

export default function ProjectsPage() {
  return (
    <main 
      className="relative min-h-screen w-full flex flex-col items-center justify-start py-16 px-4 bg-[#030303] text-zinc-300 select-none antialiased"
      style={{ fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif" }}
    >
      
      {/* 1. Shared Cinematic Black & White City Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat fixed filter grayscale brightness-[0.20] contrast-[1.1]"
        style={{ 
          backgroundImage: "url('https://unsplash.com')" 
        }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#030303] via-[#030303]/60 to-[#030303] fixed" />

      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] fixed" />

      {/* Main Structural Container */}
      <div className="z-10 w-full max-w-2xl flex flex-col gap-8">
        
        {/* Clean Breadcrumb Navigation Header */}
        <nav className="w-full flex items-center justify-start gap-3 text-xs font-semibold tracking-wide">
          <Link href="/" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Home</Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-200">Projects</span>
          <span className="text-zinc-800">/</span>
          <Link href="/languages" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Languages</Link>
          <span className="text-zinc-800">/</span>
          <Link href="/blog" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Blog</Link>
        </nav>

        {/* Section Title */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Projects</h1>
          <p className="text-zinc-400 text-sm">An indexed archive of software applications, game builds, and ongoing experiments.</p>
        </header>

        {/* Premium Work Showcase Grid Container */}
        <div className="w-full space-y-6">
          {projectsData.map((project) => (
            <div 
              key={project.id} 
              className="group p-6 rounded-2xl border border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/20"
            >
              {/* Project Line Header */}
              <div className="flex items-center justify-between gap-x-4 mb-3">
                <h2 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight">
                  {project.title}
                </h2>
                
                {/* Clean Tag Pill */}
                <span className={`text-[10px] uppercase font-semibold tracking-wider px-2.5 py-0.5 rounded-full border ${project.color}`}>
                  {project.tag}
                </span>
              </div>

              {/* Description Content Block */}
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line max-w-2xl">
                {project.description}
              </p>

              {/* Action Link Buttons */}
              {project.links && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {project.links.map((link) => (
                    <a 
                      key={`${project.id}-${link.label.toLowerCase()}`} 
                      href={link.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-zinc-800/80 bg-zinc-900/40 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-600 hover:bg-zinc-800/60 transition-all duration-150 shadow-sm"
                    >
                      <span>{link.label}</span>
                      <svg className="w-3 h-3 text-zinc-500 fill-none stroke-current stroke-2 ml-0.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                      </svg>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Minimal Footer */}
        <footer className="w-full flex items-center justify-between text-[11px] text-zinc-600 font-medium tracking-wide border-t border-zinc-900/60 pt-6 mt-4">
          <div>Repository Index: {projectsData.length} entries</div>
          <div>Stable Build</div>
        </footer>

      </div>
    </main>
  );
}
