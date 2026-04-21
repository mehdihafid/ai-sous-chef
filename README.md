# AI Sous Chef 🍳

Snap a photo of your fridge and get personalized meal ideas with full recipes — powered by Claude AI.

## What it does

1. **Upload** a photo of your fridge or pantry
2. **Claude scans** the image and identifies ingredients
3. **Pick a meal** from 4 suggested options (with cook time + difficulty)
4. **Get the full recipe** streamed in real-time, including a shopping list for missing items

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router)
- [React 19](https://react.dev/)
- [Anthropic Claude](https://www.anthropic.com/) — vision for ingredient detection + recipe generation
- [Tailwind CSS](https://tailwindcss.com/)
- TypeScript

## Running locally

1. Clone the repo and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file with your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

3. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

After deploying, add `ANTHROPIC_API_KEY` in your Vercel project's **Settings → Environment Variables**.
