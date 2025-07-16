🛠️ STEP 1: Set Up the Project
```bash
npx create-next-app@latest habit-tracker --typescript
cd habit-tracker
```

🌐 STEP 2: Install Dependencies
```bash
yarn add -D tailwindcss@^3.4.3 postcss autoprefixer
yarn add next-pwa
npx tailwindcss init -p
```

⚙️ STEP 3: Configure Tailwind
tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

styles/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

🔌 STEP 4: Configure PWA
next.config.js
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
})

module.exports = withPWA({
  reactStrictMode: true,
})
```

📄 STEP 5: Add Manifest and Icons
public/manifest.json
```json
{
  "name": "Habit Tracker",
  "short_name": "Habits",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

🧠 STEP 6: Enable PWA Meta Tags
pages/_document.tsx
```tsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
```

📋 STEP 7: Build the Sample Habit Tracker
pages/index.tsx
```tsx
import { useState, useEffect } from 'react'

export default function Home() {
  const [habits, setHabits] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('habits') || '[]')
    }
    return []
  })

  const [input, setInput] = useState('')

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (input.trim()) {
      setHabits([...habits, { text: input, timestamp: Date.now() }])
      setInput('')
    }
  }

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">Habit Tracker</h1>
      <input
        className="border p-2 rounded w-full mb-2"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Enter a habit or action"
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={addHabit}
      >
        Add Habit
      </button>
      <ul className="mt-4">
        {habits.map((habit, i) => (
          <li key={i} className="border-b py-1">
            ✅ {habit.text}
          </li>
        ))}
      </ul>
    </main>
  )
}
```

🚀 STEP 8: Run and Deploy
🧪 Run locally
```bash
yarn dev
```
Visit http://localhost:3000

🌍 Deploy to Vercel
Push your project to GitHub
Go to https://vercel.com
Import your repo → Vercel auto-detects and deploys it
