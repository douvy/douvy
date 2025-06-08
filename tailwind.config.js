/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        lora: ["Lora", "serif"],
        vulf: ["VulfMono", "monospace"],
        degular: ["DegularDisplay", "sans-serif"],
      },
      colors: {
        // Legacy colors for backward compatibility (dark mode default)
        dark: "#111216",
        surface: "#202733", 
        elevated: "#21262d",
        primary: "#e6edf3",
        title: "#222222",
        highlight: "#91c9f5",
        muted: "#b8bdc7",
        blue: "#2f81f7",
        "light-blue": "#65a0fd",
        outline: "#3b434b",
        "outline-hover": "#415b85",
        divider: "#22262b",
        frame: "#333842",
        shadow: "rgba(0, 0, 0, 0.12)",

        // Blue button theme (Twitter-like) - stays same in both modes
        "blue-base": "#2250c7",
        "blue-dark": "#1a3fa6", 
        "blue-light": "#3961cc",
        "blue-highlight": "#6080d6",
        "blue-shadow": "#16368e",

        // GitHub button theme - changes with theme
        "dark-border": "#36393f",
        "dark-border-hover": "#444444", 
        "dark-bg": "#1d1f23",
        "dark-bg-hover": "#2a2e33",
        "dark-element": "#222325",
        "dark-element-border": "#2f2f32",
        "dark-shadow": "#282a2f",

        // Active button theme
        "active-border": "#263044",
        "active-bg": "#171e2e", 
        "active-bg-hover": "#1f2b46",
        "active-element": "#222a3c",
        "active-shadow": "#222a3c",

        // Light mode button theme (GitHub button in light mode)
        "light-border": "#dedfe3",
        "light-border-hover": "#dedfe3", // No color change on hover
        "light-bg": "#f3f4f6",
        "light-bg-hover": "#eaeaee", 
        "light-element": "#e6e8ea", // Updated bottom border inside
        "light-element-border": "#dbdde1",
        "light-shadow": "#dbdde1",
        "light-text": "#000000",
        "light-hotkey": "#6b7281",
        "light-hotkey-bg": "#eeeff4", // New hotkey background

        // Light mode filter button colors
        "filter-active-bg": "#f2f5fa",
        "filter-active-border": "#d1dffc",
        "filter-active-text": "#2250c7",
        "filter-active-element": "#e5eaf4",
        "filter-active-bg-hover": "#eaf0f8",
        "filter-inactive-text": "#000000",
        "filter-inactive-bg-hover": "#ececee",
      },
      boxShadow: {
        project: "5px 5px 0 hsla(219, 90%, 60%, 0.15)",
        "project-hover":
          "6px 6px 0 hsla(219, 93%, 60%, 0.15), -6px -6px 0 hsla(219, 93%, 80%, 0.08)",
        gallery: "11px 11px 48px rgba(0, 0, 0, 0.12)",
      },
      spacing: {
        section: "70px",
        "section-mobile": "12px",
      },
      zIndex: {
        "-1": "-1",
      },
      borderWidth: {
        default: "1px",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "425px",
            color: "#b8bdc7",
            a: {
              color: "#2f81f7",
              "&:hover": {
                color: "#65a0fd",
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
};
