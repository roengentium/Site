"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// 1. PLACE YOUR CREDENTIALS HERE
const BLOG_ID = "YOUR_BLOGGER_ID"; 
const API_KEY = "YOUR_GOOGLE_API_KEY"; 

interface BlogPost {
  id: string;
  title: string;
  published: string;
  url: string;
  content: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Fetches live public posts from your Blogger platform
    async function fetchBloggerPosts() {
      try {
        const res = await fetch(
          `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts?key=${API_KEY}`
        );
        if (!res.ok) throw new Error("Failed to communicate with Blogger API");
        
        const data = await res.json();
        // If your blog is empty, data.items might return undefined
        setPosts(data.items || []);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchBloggerPosts();
  }, []);

  // Helper function to turn heavy HTML content from Blogger into clean plain-text strings
  const cleanSummary = (htmlText: string) => {
    if (!htmlText) return "";
    const plainText = htmlText.replace(/<\/?[^>]+(>|$)/g, ""); // Strips raw HTML markup tags
    return plainText.length > 160 ? plainText.substring(0, 160) + "..." : plainText;
  };

  // Helper function to format system ISO timestamps into clean layout strings
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  };

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
          <span className="text-zinc-200">Blog</span>
        </nav>

        {/* Header Section */}
        <header className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Articles</h1>
          <p className="text-zinc-400 text-sm">Synchronized real-time feeds deployed directly from my external dashboard engine.</p>
        </header>

        {/* Runtime State Evaluation Core Link Feed */}
        <div className="w-full space-y-6">
          
          {loading && (
            <div className="w-full py-12 text-center text-sm font-mono text-zinc-500 tracking-widest animate-pulse">
              FETCHING_LIVE_DATA_NODES...
            </div>
          )}

          {error && (
            <div className="w-full p-6 text-center text-xs font-mono text-rose-500/80 border border-rose-500/20 bg-rose-500/5 rounded-2xl">
              ERROR: API execution failed. Verify your system credentials.
            </div>
          )}

          {!loading && !error && posts.length === 0 && (
            <div className="w-full py-16 text-center text-sm text-zinc-500 border border-zinc-900 border-dashed rounded-2xl bg-zinc-950/20 backdrop-blur-md">
              No articles discovered. Deploy a new post via the dashboard workspace.
            </div>
          )}

          {!loading && !error && posts.map((post) => (
            <a 
              key={post.id}
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group p-6 rounded-2xl border border-zinc-900/80 bg-zinc-950/40 backdrop-blur-xl shadow-2xl transition-all duration-300 hover:border-zinc-800/80 hover:bg-zinc-900/20"
            >
              <div className="flex items-center gap-3 text-xs font-semibold text-zinc-500 mb-2">
                <span>{formatDate(post.published)}</span>
                <span className="text-zinc-800">•</span>
                <span className="text-zinc-400 font-mono text-[10px] tracking-wider uppercase border border-zinc-800 px-1.5 py-0.5 rounded bg-zinc-900/40">Live Post</span>
              </div>
              
              <h2 className="text-lg font-bold text-zinc-100 group-hover:text-white transition-colors tracking-tight mb-2">
                {post.title}
              </h2>
              
              <p className="text-zinc-400 text-sm leading-relaxed font-sans">
                {cleanSummary(post.content)}
              </p>
              
              <div className="mt-4 text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors flex items-center gap-1">
                <span>Read full post on Blogger</span>
                <span>→</span>
              </div>
            </a>
          ))}
        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-between text-[11px] text-zinc-600 font-medium tracking-wide border-t border-zinc-900/60 pt-6 mt-4">
          <div>Synced Node Inventory: {posts.length} logs</div>
          <div>Connection stable</div>
        </footer>

      </div>
    </main>
  );
}
