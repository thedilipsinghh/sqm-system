import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./**/*.{js,ts,jsx,tsx,mdx}",
    "../components/**/*.{js,ts,jsx,tsx,mdx}",
    "../../../packages/ui/src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff",
        "secondary-fixed-dim": "#62df7d",
        "on-tertiary-container": "#ffcba3",
        "on-secondary-fixed-variant": "#005320",
        "inverse-primary": "#b7c4ff",
        "surface-container": "#eaedff",
        "error-container": "#ffdad6",
        "surface-container-low": "#f2f3ff",
        "on-error-container": "#93000a",
        "inverse-on-surface": "#eef0ff",
        "on-primary-fixed": "#001551",
        "secondary": "#006e2d",
        "primary": "#0037b0",
        "on-tertiary-fixed-variant": "#6e3900",
        "outline": "#747686",
        "outline-variant": "#c4c5d7",
        "surface-dim": "#d2d9f4",
        "inverse-surface": "#283044",
        "primary-fixed": "#dce1ff",
        "on-surface": "#131b2e",
        "on-tertiary": "#ffffff",
        "on-tertiary-fixed": "#2f1500",
        "secondary-fixed": "#7ffc97",
        "on-error": "#ffffff",
        "secondary-container": "#7cf994",
        "primary-fixed-dim": "#b7c4ff",
        "surface-container-highest": "#dae2fd",
        "tertiary-fixed-dim": "#ffb77d",
        "on-primary": "#ffffff",
        "surface-variant": "#dae2fd",
        "on-surface-variant": "#434655",
        "primary-container": "#1d4ed8",
        "surface-bright": "#faf8ff",
        "on-primary-container": "#cad3ff",
        "tertiary": "#6b3700",
        "surface": "#faf8ff",
        "on-secondary-fixed": "#002109",
        "surface-tint": "#2151da",
        "tertiary-container": "#8d4b00",
        "surface-container-high": "#e2e7ff",
        "on-background": "#131b2e",
        "on-primary-fixed-variant": "#0039b5",
        "background": "#faf8ff",
        "tertiary-fixed": "#ffdcc3",
        "on-secondary-container": "#007230",
        "surface-container-lowest": "#ffffff",
        "error": "#ba1a1a"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "margin": "1.5rem",
        "space-xs": "0.25rem",
        "space-xl": "2rem",
        "gutter-lg": "1.5rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "margin-mobile": "1rem",
        "gutter": "1rem"
      },
      fontFamily: {
        "headline-sm": ["Inter"],
        "label-token-md": ["JetBrains Mono"],
        "label-token-sm": ["JetBrains Mono"],
        "body-sm": ["Inter"],
        "body-md": ["Inter"],
        "headline-xl-mobile": ["Inter"],
        "headline-md": ["Inter"],
        "label-token-lg": ["JetBrains Mono"],
        "label-ui": ["Inter"],
        "headline-xl": ["Inter"],
        "headline-lg": ["Inter"],
        "body-lg": ["Inter"]
      },
      fontSize: {
        "headline-sm": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "label-token-md": ["18px", { lineHeight: "22px", fontWeight: "600" }],
        "label-token-sm": ["13px", { lineHeight: "16px", fontWeight: "500" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-xl-mobile": ["26px", { lineHeight: "34px", fontWeight: "700" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "label-token-lg": ["28px", { lineHeight: "32px", fontWeight: "700" }],
        "label-ui": ["12px", { lineHeight: "16px", fontWeight: "600" }],
        "headline-xl": ["32px", { lineHeight: "40px", fontWeight: "700" }],
        "headline-lg": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }]
      }
    }
  },
  plugins: [],
};

export default config;
