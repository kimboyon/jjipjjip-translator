# 맨업 ManUp Web

Next.js App Router, Supabase, and Tailwind CSS로 만든 남성 성장 관리 웹앱입니다.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Environment Variables

Copy `.env.example` to `.env.local` and fill in Supabase keys.

`SUPABASE_SERVICE_ROLE_KEY` is server-only and must never be exposed with a `NEXT_PUBLIC_` prefix.

For local prototype testing, `ALLOW_TEST_LOGIN=true` lets any email/password pair create or repair a confirmed test user on login. Set it to `false` before production.
