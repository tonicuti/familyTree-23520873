import type { Config } from "tailwindcss";

const config: Config = {
  content: [
            "./index.html", 
            "./src/**/*.{ts,tsx, js, jsx}"
  ], 
  theme: {
    extend: {
      colors: {
        primaryblue: "#CBF3F0",
        secondaryblue: "#00C5C3",
        primaryorange: "#FFBF69",
        secondaryorange: "oklch(436.96, 0.54, -0.27)",  
      },
    },
  },
  plugins: [],
};

export default config;