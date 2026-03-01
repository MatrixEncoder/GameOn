import type { Config } from 'tailwindcss';

export default <Config>{
    darkMode: 'class',
    content: [
        './src/**/*.{js,ts,jsx,tsx}',
        './app/**/*.{js,ts,jsx,tsx}',
        './pages/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                primary: 'hsl(210, 100%, 55%)',
                secondary: 'hsl(280, 70%, 55%)',
                accent: 'hsl(47, 100%, 48%)',    // yellow gold
                background: '#111114',
                surface: '#1a1a1f',
                card: '#222228',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                xl2: '14px',
                xl3: '18px',
            },
            boxShadow: {
                glow: '0 0 18px 2px rgba(245, 208, 0, 0.25)',
                card: '0 4px 24px rgba(0,0,0,0.4)',
            },
        },
    },
    plugins: [],
};
