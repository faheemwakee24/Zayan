import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/RealEstate/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
      fontFamily: {
        sans: ["var(--font-poppins)", "Poppins", "ui-sans-serif", "sans-serif"],
        heading: ["var(--font-poppins)", "Poppins", "ui-sans-serif", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(243, 100%, 97%)",
          100: "hsl(243, 100%, 94%)",
          200: "hsl(244, 97%, 87%)",
          300: "hsl(244, 97%, 77%)",
          400: "hsl(244, 97%, 64%)",
          500: "hsl(244, 97%, 58%)",
          600: "hsl(244, 97%, 50%)",
          700: "hsl(243, 100%, 42%)",
          800: "hsl(243, 97%, 35%)",
          900: "hsl(243, 97%, 27%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "hsl(160, 84%, 95%)",
          100: "hsl(160, 84%, 88%)",
          200: "hsl(160, 84%, 77%)",
          300: "hsl(160, 84%, 63%)",
          400: "hsl(160, 84%, 49%)",
          500: "hsl(160, 84%, 40%)",
          600: "hsl(160, 84%, 35%)",
          700: "hsl(160, 84%, 28%)",
          800: "hsl(160, 84%, 22%)",
          900: "hsl(160, 84%, 17%)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "hsl(38, 100%, 97%)",
          100: "hsl(38, 100%, 93%)",
          200: "hsl(38, 99%, 83%)",
          300: "hsl(38, 97%, 70%)",
          400: "hsl(38, 93%, 57%)",
          500: "hsl(38, 92%, 50%)",
          600: "hsl(38, 92%, 45%)",
          700: "hsl(38, 92%, 35%)",
          800: "hsl(38, 92%, 25%)",
          900: "hsl(38, 92%, 16%)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        float: {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-30px)",
          },
        },
        "rotate-slow": {
          "0%": {
            transform: "rotateZ(0deg)",
          },
          "100%": {
            transform: "rotateZ(360deg)",
          },
        },
        "fade-in-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 8s ease-in-out infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "fade-in-up": "fade-in-up 0.6s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

