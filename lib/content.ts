import { GH_PROFILE } from "./github";

/** Everything personal on the home page lives here, so it's easy to edit. */
export const PROFILE = {
  name: "roentgenium",
  tagline: "I make old hardware do new things — and write the tools to build them.",
  status: "Open to collaborations",
  photo: "https://github.com/roengentium.png?size=256",
};

export const ABOUT = {
  roles: ["Full-Stack Developer", "App Developer", "Electrical Design"],
  bio: "Electrical and software engineer. I like getting modern software onto hardware it was never meant for: jailbroken iOS 3–9 devices, custom Android ROM pipelines and small local-first AI tools. Most of it is open source, and the best of it is on the Work tab.",
};

export const SKILLS = [
  { pin: "01", title: "Legacy iOS", tools: ["Objective-C", "Theos / Logos", "MobileSubstrate"] },
  { pin: "02", title: "Android & Systems", tools: ["Python", "ADB", "AOSP builds"] },
  { pin: "03", title: "Web & ML", tools: ["TypeScript", "Next.js", "scikit-learn", "Ollama"] },
];

export const CONTACT = {
  github: GH_PROFILE,
  twitter: "https://x.com/unnameduserplus",
  youtube: "https://www.youtube.com/@rgcodesarray",
};

export const BOOKMARK_NAV = [
  { sub: "who I am, in a sentence", target: "about" },
  { sub: "the tools I reach for", target: "skills" },
  { sub: "projects, pulled live from GitHub", target: "work" },
  { sub: "the fastest way to reach me", target: "contact" },
] as const;
