import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Estats semàfor
        status: {
          ok: "hsl(var(--status-ok))",
          "ok-foreground": "hsl(var(--status-ok-foreground))",
          "ok-subtle": "hsl(var(--status-ok-subtle))",
          warning: "hsl(var(--status-warning))",
          "warning-foreground": "hsl(var(--status-warning-foreground))",
          "warning-subtle": "hsl(var(--status-warning-subtle))",
          error: "hsl(var(--status-error))",
          "error-foreground": "hsl(var(--status-error-foreground))",
          "error-subtle": "hsl(var(--status-error-subtle))",
          pending: "hsl(var(--status-pending))",
          "pending-foreground": "hsl(var(--status-pending-foreground))",
          "pending-subtle": "hsl(var(--status-pending-subtle))",
        },
        // Severitat PII
        pii: {
          critical: "hsl(var(--pii-critical))",
          "critical-bg": "hsl(var(--pii-critical-bg))",
          high: "hsl(var(--pii-high))",
          "high-bg": "hsl(var(--pii-high-bg))",
          medium: "hsl(var(--pii-medium))",
          "medium-bg": "hsl(var(--pii-medium-bg))",
          low: "hsl(var(--pii-low))",
          "low-bg": "hsl(var(--pii-low-bg))",
          safe: "hsl(var(--pii-safe))",
          "safe-bg": "hsl(var(--pii-safe-bg))",
        },
        // Diff
        diff: {
          added: "hsl(var(--diff-added))",
          "added-text": "hsl(var(--diff-added-text))",
          removed: "hsl(var(--diff-removed))",
          "removed-text": "hsl(var(--diff-removed-text))",
          highlight: "hsl(var(--diff-highlight))",
        },
        // Waveform
        waveform: {
          bg: "hsl(var(--waveform-bg))",
          wave: "hsl(var(--waveform-wave))",
          progress: "hsl(var(--waveform-progress))",
          cursor: "hsl(var(--waveform-cursor))",
        },
        // Panells
        panel: {
          header: "hsl(var(--panel-header))",
          border: "hsl(var(--panel-border))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "SF Mono",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
