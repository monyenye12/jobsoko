/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  // Enable dark mode based on class or data-theme attribute
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
    },
  },
  plugins: [require("tailwindcss-animate")],
  safelist: [
    // Add classes that might be dynamically generated and need to be included in production
    "bg-green-50",
    "bg-green-100",
    "bg-blue-50",
    "bg-blue-100",
    "bg-red-50",
    "bg-red-100",
    "bg-yellow-50",
    "bg-yellow-100",
    "text-green-500",
    "text-green-600",
    "text-green-700",
    "text-blue-500",
    "text-blue-600",
    "text-blue-700",
    "text-red-500",
    "text-red-600",
    "text-red-700",
    "text-yellow-500",
    "text-yellow-600",
    "text-yellow-700",
    "border-green-200",
    "border-blue-200",
    "border-red-200",
    "border-yellow-200",
    "dark:bg-gray-800",
    "dark:bg-gray-900",
    "dark:text-white",
    "dark:text-gray-100",
    "dark:text-gray-200",
    "dark:text-gray-300",
    "dark:text-gray-400",
    "dark:border-gray-700",
    "dark:border-gray-800",
  ],
};
