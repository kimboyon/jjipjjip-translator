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

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

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
  const canAnalyze = situation.trim().length > 0 && !isGenerating;

  function handleAnalyze() {
    if (!situation.trim()) return;
    setIsGenerating(true);
    window.setTimeout(() => {
      setHasResult(true);
      setIsGenerating(false);
    }, 450);
  }

  async function handleCopy(text: string, index: number) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      setCopiedIndex(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-4">
          <div>
            <p className="text-sm font-black tracking-normal text-slate-950">찝찝함 번역기</p>
            <p className="mt-1 text-xs text-slate-500">관계의 온도를 다시 맞추는 말 정리 도구</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
              Trial 7일
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white">
              <LockKeyhole size={13} /> 저장 안 함
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
              {remainingUses}회 남음
            </span>
          </div>
        </header>

        <section className="grid flex-1 gap-5 py-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
          <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-center gap-2 text-xs font-black text-orange-700">
                <Sparkles size={14} /> 보내기 전 10초 멈춤
              </div>
              <p className="mt-1 text-xs leading-5 text-orange-900">
                상대 속마음을 맞히지 않고, 내 감정과 확인 가능한 사실부터 분리합니다.
              </p>
            </div>

            <div className="mt-6">
              <p className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
                <MessageSquareText size={13} /> {mode}
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-normal text-slate-950 sm:text-5xl">
                지금 보내려는 말,
                <br />
                한 번만 정리해볼까요?
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                답장을 만들기 전에 감정, 사실, 해석, 대응을 나눠 봅니다. 결과는 진단이 아니라 대화를
                차분하게 고르는 참고자료입니다.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={classNames(
                    "min-h-10 rounded-full px-3 text-xs font-extrabold transition",
                    mode === item
                      ? "bg-slate-950 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                상황 또는 보내려는 문장
                <span className="font-bold text-slate-400">결과 생성 후 폐기</span>
              </span>
              <textarea
                value={situation}
                onChange={(event) => {
                  setSituation(event.target.value);
                  if (hasResult) setHasResult(false);
                }}
                className="mt-2 min-h-36 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                placeholder={'예: 상사가 "요즘 MZ들은 책임감이 약한 것 같아"라고 했는데 나한테 하는 말 같아서 기분이 나빴다.'}
              />
            </label>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <OptionSelect label="관계" value={relationship} options={relationships} onChange={setRelationship} />
              <OptionSelect label="원하는 도움" value={helpType} options={helpTypes} onChange={setHelpType} />
              <OptionSelect label="톤" value={tone} options={tones} onChange={setTone} />
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className={classNames(
                "mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black text-white transition",
                canAnalyze ? "bg-indigo-600 hover:bg-indigo-700" : "cursor-not-allowed bg-slate-300",
              )}
            >
              {isGenerating ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />}
              10초 멈추고 정리하기
            </button>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                ["진단 아님", "심리, 법률, 치료 판단을 대신하지 않아요."],
                ["가능성 분리", "상대 의도를 단정하지 않아요."],
                ["기본 비저장", "사용자가 저장을 누르기 전 기억하지 않아요."],
              ].map(([title, body]) => (
                <div key={title} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
                    <ShieldCheck size={13} /> {title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <ResultPanel
            hasResult={hasResult}
            copiedIndex={copiedIndex}
            onCopy={handleCopy}
            relationship={relationship}
            helpType={helpType}
            tone={tone}
          />
        </section>
      </div>
    </main>
  );
}

function OptionSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ResultPanel({
  hasResult,
  copiedIndex,
  onCopy,
  relationship,
  helpType,
  tone,
}: {
  hasResult: boolean;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  relationship: string;
  helpType: string;
  tone: string;
}) {
  if (!hasResult) {
    return (
      <aside className="flex min-h-[520px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">정리 결과 미리보기</p>
              <p className="mt-1 text-xs text-slate-500">입력 후 카드가 이곳에 생성됩니다.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">진단 아님</span>
          </div>

          <div className="mt-6 rounded-lg bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold text-slate-300">먼저 분리해보면</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["감정", "사실", "해석"].map((item) => (
                <div key={item} className="rounded-lg bg-slate-800 px-3 py-4 text-center text-sm font-black">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PreviewCard title="대응 필요도" body="낮게 시작 / 확인 필요 / 공식 대응" />
            <PreviewCard title="말투 리스크" body="차가움 / 공격적 / 모호함" />
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-5">
          <Clipboard className="text-slate-400" size={28} />
          <p className="mt-3 text-sm font-black text-slate-800">보내도 되는 문장 3개가 준비됩니다.</p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            복사하기 쉽게 문장별 버튼을 붙이고, 피해야 할 표현과 다음 행동도 함께 보여줍니다.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">찝찝함 정리 결과</p>
          <p className="mt-1 text-xs text-slate-500">
            {relationship} · {helpType} · {tone}
          </p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700">진단 아님</span>
      </div>

      <div className="mt-5 rounded-lg bg-slate-950 p-5 text-white">
        <p className="text-xs font-bold text-slate-300">상황 요약</p>
        <p className="mt-3 text-base font-extrabold leading-7">{sampleResult.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {sampleResult.separation.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black text-indigo-700">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{item.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950">상대 말의 가능한 해석</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">3가지</span>
        </div>
        <div className="mt-3 grid gap-2">
          {sampleResult.possibleMeanings.map((meaning) => (
            <p key={meaning} className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
              {meaning}
            </p>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatusCard title="대응 필요도" value={sampleResult.responseLevel} tone="orange" />
        <StatusCard title="말투 리스크" value={sampleResult.toneRisk} tone="indigo" />
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-950">보내도 되는 문장</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">문장별 복사</span>
        </div>
        <div className="mt-3 grid gap-2">
          {sampleResult.replies.map((reply, index) => (
            <div key={reply} className="grid gap-2 rounded-lg bg-slate-50 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm leading-6 text-slate-800">{reply}</p>
              <button
                type="button"
                onClick={() => onCopy(reply, index)}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg bg-orange-500 px-3 text-xs font-black text-white transition hover:bg-orange-600"
              >
                <Copy size={13} /> {copiedIndex === index ? "복사됨" : "복사"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-3 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <h2 className="text-sm font-black text-orange-800">피해야 할 표현</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sampleResult.avoid.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-700 ring-1 ring-orange-200">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <h2 className="text-sm font-black text-indigo-900">다음 행동 제안</h2>
          <p className="mt-2 text-sm leading-6 text-indigo-900">{sampleResult.nextAction}</p>
        </div>
      </section>

      <div className="mt-4 flex flex-wrap gap-2">
        {["조금 부드럽게", "더 단호하게", "직장용으로"].map((action) => (
          <button
            key={action}
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-lg bg-slate-100 px-3 text-xs font-black text-slate-700 transition hover:bg-slate-200"
          >
            <RefreshCw size={13} /> {action}
          </button>
        ))}
      </div>
    </aside>
  );
}

function PreviewCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-black text-slate-700">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function StatusCard({ title, value, tone }: { title: string; value: string; tone: "orange" | "indigo" }) {
  return (
    <div
      className={classNames(
        "rounded-lg border p-4",
        tone === "orange" ? "border-orange-200 bg-orange-50" : "border-indigo-100 bg-indigo-50",
      )}
    >
      <p className={classNames("text-xs font-black", tone === "orange" ? "text-orange-700" : "text-indigo-700")}>
        {title}
      </p>
      <p className="mt-2 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
