# EMOTRANS-찝찝함 번역기

보내기 전 애매하고 찝찝함이 남는 말을 감정, 사실, 해석, 대응 전략으로 정리해주는 AI 답장 도구입니다.

## 주요 기능

- 상황 설명 또는 보내려는 문장 기반 답장 정리
- 대화 캡쳐 이미지 첨부 분석
- 관계, 답장 의도, 원하는 톤 선택
- 감정/사실/해석 분리
- 커뮤니케이션 이론 기반 분석 근거 제공
- 보내도 되는 문장 3개와 피해야 할 표현 제안
- Web Speech API 기반 음성 입력
- Supabase Auth 기반 회원가입/로그인

## 기술 스택

- Next.js App Router
- React
- Tailwind CSS
- Supabase Auth
- WarmTalent AI Chat Completions API
- Vercel

## 로컬 개발

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 환경 변수

`.env.example`을 참고해 `.env.local`을 구성합니다.

필수 항목:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `WARM_TALENT_API_KEY`

선택 항목:

- `WARM_TALENT_API_URL`
- `WARM_TALENT_MODEL`
- `NEXT_PUBLIC_SITE_URL`
- `ALLOW_TEST_LOGIN`

`SUPABASE_SERVICE_ROLE_KEY`는 서버 전용 키이므로 `NEXT_PUBLIC_` 접두사를 붙이면 안 됩니다.

## 배포

프로덕션은 Vercel에 배포합니다.

```bash
npm run build
```

현재 프로덕션 URL:

https://jjipjjip-translator.vercel.app
