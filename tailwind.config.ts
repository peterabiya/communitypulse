import type { Config } from "tailwindcss";

// Design direction: warm and human, the opposite register from
// LedgerLite's paper ledger and OpsConsole's dark control room. This is
// a public space people post in, so it should feel approachable, not
// clinical. Topic pills and avatars carry the visual identity instead of
// ruled lines or status dots.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#FBF7F2",
        ink: "#241F1C",
        line: "#E7DDD2",
        coral: "#E1613B",
        blue: "#3E6B8A",
        muted: "#8A8079",
      },
      fontFamily: {
        display: ["var(--font-jakarta)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
