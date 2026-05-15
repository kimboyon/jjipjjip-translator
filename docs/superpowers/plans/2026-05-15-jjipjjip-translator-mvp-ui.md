# 찝찝함 번역기 MVP UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current homepage with the approved 찝찝함 번역기 MVP webapp UI: input-first flow, 6 mode tabs, safety/trial signals, and structured result cards.

**Architecture:** Keep the existing Next.js App Router and Tailwind setup. Implement the first MVP as a client-side homepage with local state and deterministic sample output, leaving real AI/API/payment integration for a later plan.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, lucide-react.

---

## File Structure

- Modify `app/page.tsx`: convert homepage into a client component that manages selected mode, relationship, help type, tone, text input, generated result state, copy state, and sample result rendering.
- Modify `app/globals.css`: update the body background and add small reusable utility classes for the new app surface only if Tailwind utilities become too noisy.
- No new route is required for the first UI pass.
- No database, auth, payment, or OpenAI API integration is included in this implementation.

## Task 1: Establish Homepage Data Model And Static UI Shell

**Files:**

- Modify: `app/page.tsx`

- [x] **Step 1: Replace the current homepage imports**

Use a client component and lucide icons:

```tsx
"use client";

import {
  ArrowRight,
  Clipboard,
  Copy,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
```

- [x] **Step 2: Add option arrays and sample result above the component**

Define modes, relationships, help types, tones, and a deterministic result object in `app/page.tsx`.

```tsx
const modes = ["답장 온도", "선 넘음", "세대차이", "거리두기", "관계 유지", "피로도"] as const;
const relationships = ["상사", "동료", "후배", "친구", "모임", "가족", "기타"] as const;
const helpTypes = ["말투 점검", "답장", "감정 해석", "거리두기", "상대 의도 분석", "직장용 표현"] as const;
const tones = ["직장용", "부드럽게", "단호하게", "가볍게", "거리두기"] as const;

const sampleResult = {
  summary: "세대나 태도에 대한 일반화가 개인 평가처럼 느껴져 불편함이 남은 상황입니다.",
  separation: [
    { label: "감정", body: "억울함, 경계심, 평가받는 느낌" },
    { label: "사실", body: "상대는 MZ와 책임감에 대한 일반화 표현을 사용했습니다." },
    { label: "해석", body: "나를 겨냥했을 수도 있지만, 특정인을 지목하지 않은 푸념일 수도 있습니다." },
  ],
  possibleMeanings: [
    "조직 안에서 느낀 답답함을 세대 표현으로 뭉뚱그렸을 가능성",
    "특정 업무 상황을 말하려다 표현이 거칠어진 가능성",
    "실제로 반복된다면 세대 프레임으로 평가하는 패턴일 가능성",
  ],
  responseLevel: "낮게 시작",
  toneRisk: "조금 차가움",
  replies: [
    "그렇게 느끼실 수도 있을 것 같아요. 다만 저는 이 건은 책임지고 마무리하려고 일정 정리해두었습니다.",
    "말씀 주신 부분 참고하겠습니다. 저는 이번 건은 업무 기준에 맞춰 진행 상황을 공유드리겠습니다.",
    "세대 이야기보다는 이번 업무에서 필요한 기준을 확인하고 맞춰보겠습니다.",
  ],
  avoid: ["요즘 윗세대도 똑같아요", "그건 편견 아닌가요?", "저한테 하시는 말씀이세요?"],
  nextAction: "감정 반박보다 업무 기준과 일정으로 대화를 되돌리는 편이 안전합니다.",
};
```

- [x] **Step 3: Add local state inside `Home`**

```tsx
export default function Home() {
  const [mode, setMode] = useState<(typeof modes)[number]>("답장 온도");
  const [relationship, setRelationship] = useState<(typeof relationships)[number]>("상사");
  const [helpType, setHelpType] = useState<(typeof helpTypes)[number]>("말투 점검");
  const [tone, setTone] = useState<(typeof tones)[number]>("직장용");
  const [situation, setSituation] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const remainingUses = useMemo(() => (hasResult ? 9 : 10), [hasResult]);
}
```

## Task 2: Implement Input-First Screen

**Files:**

- Modify: `app/page.tsx`

- [x] **Step 1: Add submit and copy handlers inside `Home`**

```tsx
function handleAnalyze() {
  if (!situation.trim()) return;
  setIsGenerating(true);
  window.setTimeout(() => {
    setHasResult(true);
    setIsGenerating(false);
  }, 450);
}

async function handleCopy(text: string, index: number) {
  await navigator.clipboard.writeText(text);
  setCopiedIndex(index);
  window.setTimeout(() => setCopiedIndex(null), 1200);
}
```

- [x] **Step 2: Render the page wrapper**

Use a light app background with a dense, usable first screen:

```tsx
return (
  <main className="min-h-screen bg-[#f8fafc] text-slate-950">
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
      {/* header, input, result sections go here */}
    </div>
  </main>
);
```

- [x] **Step 3: Render header and trust signals**

Include brand, Trial, saved-off, and remaining uses:

```tsx
<header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-4">
  <div>
    <p className="text-sm font-black tracking-normal text-slate-950">찝찝함 번역기</p>
    <p className="mt-1 text-xs text-slate-500">관계의 온도를 다시 맞추는 말 정리 도구</p>
  </div>
  <div className="flex flex-wrap items-center gap-2">
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">Trial 7일</span>
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white"><LockKeyhole size={13} /> 저장 안 함</span>
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">{remainingUses}회 남음</span>
  </div>
</header>
```

- [x] **Step 4: Render hero copy, pause notice, mode tabs, textarea, selectors, and CTA**

Implement the approved `10초 멈춤` experience and the 6 menu tabs in the left panel.

## Task 3: Implement Structured Result Cards

**Files:**

- Modify: `app/page.tsx`

- [x] **Step 1: Render empty result state when `hasResult` is false**

Show a quiet placeholder explaining that results will be split into 감정/사실/해석/대응.

- [x] **Step 2: Render result state when `hasResult` is true**

Include:

- Summary dark card
- 감정 / 사실 / 해석 cards
- Possible meanings list
- 대응 필요도 and 말투 리스크 labels
- Replies with per-sentence copy buttons
- Avoid expressions
- Next action

- [x] **Step 3: Add rewrite action buttons**

Add visual-only buttons for `조금 부드럽게`, `더 단호하게`, and `직장용으로`.

## Task 4: Global Styling Cleanup And Verification

**Files:**

- Modify: `app/globals.css`

- [x] **Step 1: Change the default body background**

Set `body` background to the new app surface:

```css
body {
  margin: 0;
  background: #f8fafc;
  color: #0f172a;
}
```

- [x] **Step 2: Run lint**

Run:

```bash
npm run lint
```

Expected: command exits successfully.

- [x] **Step 3: Run build**

Run:

```bash
npm run build
```

Expected: command exits successfully.

- [x] **Step 4: Start dev server and verify in browser**

Run:

```bash
npm run dev
```

Open the local URL and verify:

- Mobile and desktop layouts do not overlap.
- The first screen shows `10초 멈추고 정리하기`.
- The 6 tabs are visible and clickable.
- Entering text and clicking CTA shows result cards.
- Copy button changes state after copying.
- Result cards do not use percentages or diagnosis language.
