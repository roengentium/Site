import { GH_PROFILE } from "./github";

/** Everything personal on the home page lives here, so it's easy to edit. */
export const PROFILE = {
  name: "roentgenium",
  tagline: "I make old hardware do new things and write the tools to build them. Oh and debian better",
  status: "Open to collaborations",
  photo: "https://github.com/roengentium.png?size=256",
};

export const ABOUT = {
  roles: ["Full-Stack Developer", "App Developer", "Electrical Design", "Game Developer", "Server Dev"],
  bio: "Electrical and software engineer. I like getting modern software onto hardware it was never meant for. Most of it is open source, and the best of it is on the Work tab. Also I love building electrical circuits for mods and other stuff.",
};

export const SKILLS = [
  { pin: "01", title: "Legacy iOS", tools: ["Objective-C", "Theos", "C / C++"] },
  { pin: "02", title: "Android & Systems", tools: ["Python", "Java/kt", "make/asm"] },
  { pin: "03", title: "Web & ML", tools: ["TypeScript", "Next.js", "scikit-learn", "Ollama"] },
  {pin: "04", title: "Game Development", tools: ["Unity", "C#", "js"] },
  { pin: "05", title: "Server Development", tools: ["php", "SQL", "python3 based management", "flask + npm"] },
];

export const CONTACT = {
  github: GH_PROFILE,
  twitter: "https://x.com/unnameduserplus",
  youtube: "https://www.youtube.com/@rgcodesarray",
  discord: "https://discord.gg/CHgBRkab2e",
  reddit: "https://www.reddit.com/user/Expensive_Culture530/",
};

export const BOOKMARK_NAV = [
  { sub: "who I am, in a sentence", target: "about" },
  { sub: "the tools I reach for", target: "skills" },
  { sub: "projects", target: "work" },
  { sub: "the fastest way to reach me", target: "contact" },
] as const;
