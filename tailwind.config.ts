/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand:  { DEFAULT: "#dc2626", dark: "#b91c1c" }, // قرمز
        basebg: { light: "#f9fafb", dark: "#111827" },    // خاکستری روشن/تیره
        surface:{ light: "#ffffff", dark: "#1f2937" }     // سفید/تیره
      }
    }
  },
  plugins: [require("@tailwindcss/forms")]
};
