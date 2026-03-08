/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                eco: {
                    dark: '#0f172a',
                    card: '#1e293b',
                    primary: '#10b981', // emerald-500
                    hover: '#059669',   // emerald-600
                }
            }
        },
    },
    plugins: [],
}
