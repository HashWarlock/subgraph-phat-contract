/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "scaffoldEthDark",
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        scaffoldEth: {
          primary: "#59A138",
          "primary-content": "#29451C",
          secondary: "#F5FFF0",
          "secondary-content": "#325422",
          accent: "#29451C",
          "accent-content": "#F5FFF0",
          neutral: "#6FB74E",
          "neutral-content": "#ffffff",
          "base-100": "#D5F6C6",
          "base-200": "#B2E69A",
          "base-300": "#8AD368",
          "base-content": "#29451C",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        scaffoldEthDark: {
          primary: "#59A138",
          "primary-content": "#F9FBFF",
          secondary: "#438525",
          "secondary-content": "#D5F6C6",
          accent: "#F9FBFF",
          "accent-content": "#F9FBFF",
          neutral: "#F5FFF0",
          "neutral-content": "#F9FBFF",
          "base-100": "#3B6727",
          "base-200": "#438525",
          "base-300": "#325422",
          "base-content": "#F9FBFF",
          info: "#385183",
          success: "#34EEB6",
          warning: "#FFCF72",
          error: "#FF8863",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "hsl(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
