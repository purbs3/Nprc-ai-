/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./services/**/*.{ts,tsx}",
        "./utils/**/*.{ts,tsx}",
        "./ChatInterface.tsx"
    ],
    theme: {
        extend: {},
    },
    plugins: [],
};