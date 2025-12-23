import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'accent-orange': '#ff6b00',
        'accent-green': '#00ff87',
        'bg-black': '#000000',
        'bg-dark': '#111111',
        'bg-darker': '#1a1a1a',
      },
    },
  },
  plugins: [],
}
export default config
