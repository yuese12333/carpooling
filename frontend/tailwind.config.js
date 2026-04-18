/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // 定义 shadcn 所需的变量
        brand: {
          DEFAULT: '#10B981', // 对应 bg-brand
          dark: '#0d9488',    // 对应 bg-brand-dark
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // --- 核心修改：定义 Popover 颜色 ---
        popover: {
          DEFAULT: "#ffffff", // 强制白色背景
          foreground: "hsl(var(--popover-foreground))",
        },
        // ... 其他颜色配置
      },
    },
  },
  plugins: [],
}

