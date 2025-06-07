/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        lora: ['Lora', 'serif'],
        vulf: ['VulfMono', 'monospace'],
        degular: ['DegularDisplay', 'sans-serif'],
      },
      colors: {
        // Core background and UI colors
        'dark': '#111216',        // Main background
        'surface': '#202733',     // Secondary surface
        'elevated': '#21262d',    // Elevated components
        
        // Text hierarchy
        'primary': '#e6edf3',     // Main text
        'title': '#222222',       // Headings
        'highlight': '#91c9f5',   // Accented text
        'muted': '#b8bdc7',       // Secondary text
        'blue': '#2f81f7',        // Links and accents
        'light-blue': '#65a0fd',  // Subtle accents
        
        // UI borders and effects
        'outline': '#3b434b',     // Primary borders
        'outline-hover': '#415b85', // Hover state for borders
        'divider': '#22262b',     // Subtle dividers
        'frame': '#333842',       // Image frames
        'shadow': 'rgba(0, 0, 0, 0.12)', // Shadow color
        
        // Blue button theme (Twitter-like)
        'blue-base': '#2250c7',          // Base color
        'blue-dark': '#1a3fa6',          // Darker variant
        'blue-light': '#3961cc',         // Lighter variant
        'blue-highlight': '#6080d6',     // Accent color
        'blue-shadow': '#16368e',        // Shadow effect
        
        // Dark button theme (GitHub-like)
        'dark-border': '#36393f',        // Base color
        'dark-border-hover': '#444444',  // Hover state
        'dark-bg': '#1d1f23',            // Main surface
        'dark-bg-hover': '#2a2e33',      // Active state
        'dark-element': '#222325',       // UI elements
        'dark-element-border': '#2f2f32',// Borders
        'dark-shadow': '#282a2f',        // Shadow effect
        'dark-shadow-hover': '#333333',  // Hover shadow
        
        // Active button theme
        'active-border': '#263044',      // Base border color
        'active-bg': '#171e2e',          // Main surface
        'active-bg-hover': '#1f2b46',    // Hover state
        'active-element': '#222a3c',     // Bottom border inside outer border
        'active-shadow': '#222a3c',      // Shadow effect (same as element for consistency)
      },
      boxShadow: {
        'project': '5px 5px 0 hsla(219, 90%, 60%, 0.15)',
        'project-hover': '6px 6px 0 hsla(219, 93%, 60%, 0.15), -6px -6px 0 hsla(219, 93%, 80%, 0.08)',
        'gallery': '11px 11px 48px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        'section': '70px',
        'section-mobile': '12px',
      },
      zIndex: {
        '-1': '-1',
      },
      borderWidth: {
        'default': '1px',
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: '425px',
            color: '#b8bdc7',
            a: {
              color: '#2f81f7',
              '&:hover': {
                color: '#65a0fd',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
}