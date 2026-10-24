"use client";

import Link from "next/link";

const timelineData = [
  {
    year: "2018",
    title: "Scratch",
    description: "Scratch: Practically every single kid's first coding language, used to be the blueprint for bigger projects.",
  },
  {
    year: "2019",
    title: "Scratch & Python",
    description: "Scratch & Python: More of the last one, barely used Python at all.",
  },
  {
    year: "2020",
    title: "Python & HTML",
    description: "Python & HTML: Slightly more advanced Python scripts, started to make basic webpages.",
  },
  {
    year: "2021",
    title: "Web Core & Systems",
    description: "HTML, CSS, JS, Python, C++: First 3 are key details in my future website making journey, Python as a more algorithmic approach, and C++ for simple efficiency.",
  },
  {
    year: "2022",
    title: "Python & Ruby",
    description: "Python and Ruby: the backend duo for websites.",
  },
  {
    year: "2023",
    title: "Games & Architecture",
    description: "C#, Java, Python: C# for unity games, Java for simple applications, and Python for AI enhancement, etc.",
  },
  {
    year: "2024",
    title: "Advanced Systems",
    description: "Python, C, .net: Python for more AI enhancement, C and .net for advanced application programming.",
  },
];

export default function LanguagesPage() {
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
          <Link href="/projects" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Projects</Link>
          <span className="text-zinc-800">/</span>
          <span className="text-zinc-200">Languages</span>
          <span className="text-zinc-800">/</span>
          <Link href="/blog" className="text-zinc-500 hover:text-zinc-200 transition-colors duration-150">Blog</Link>
        </nav>

        {/* Section Title */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Languages</h1>
          <p className="text-zinc-400 text-sm">A chronological breakdown of codebases, software stacks, and development environments.</p>
        </header>

        {/* Interactive Vertical Timeline Wrapper */}
        <div className="relative w-full border-l border-zinc-800/80 ml-4 pl-8 space-y-8 my-4">
          {timelineData.map((item) => (
            <div 
              key={item.year} 
              className="group relative flex flex-col gap-2 rounded-2xl border border-zinc-900/60 bg-zinc-950/40 backdrop-blur-xl p-5 shadow-2xl transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/20"
            >
              {/* Floating Timeline Bullet Dot Indicator */}
              <div className="absolute top-6 left-[-37px] w-4 h-4 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center transition-all duration-300 group-hover:border-zinc-400 group-hover:bg-white shadow-[0_0_15px_rgba(0,0,0,1)]">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 group-hover:bg-zinc-950 transition-colors" />
              </div>

              {/* Timeline Entry Header */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-black tracking-tight text-white bg-zinc-900 border border-zinc-800/80 px-2.5 py-0.5 rounded-md">
                  {item.year}
                </span>
                <h2 className="text-base font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors tracking-tight">
                  {item.title}
                </h2>
              </div>

              {/* Entry Description Detail Content */}
              <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Minimal Tech Footer */}
        <footer className="w-full flex items-center justify-between text-[11px] text-zinc-600 font-medium tracking-wide border-t border-zinc-900/60 pt-6 mt-4">
          <div>Timeframe Stack: 7 years total</div>
          <div>Runtime Environment: Stable</div>
        </footer>

      </div>
    </main>
  );
}
