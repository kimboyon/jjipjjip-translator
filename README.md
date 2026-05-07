# Velora Web

Next.js App Router, Supabase, and Tailwind CSS web app inspired by the Velora landing page mockup.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in Supabase keys.

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.
