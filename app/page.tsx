"use client";

import {
  ArrowRight,
  Clipboard,
  Copy,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  Mic,
  MicOff,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  demoAnalysisResult,
  helpTypes,
  modes,
  relationships,
  tones,
  type AnalysisResult,
} from "@/lib/jjipjjip-analysis";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

type LocalSpeechRecognitionResult = {
  isFinal: boolean;
  [index: number]: { transcript: string };
};

type LocalSpeechRecognitionEvent = {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: LocalSpeechRecognitionResult;
  };
};

type LocalSpeechRecognitionErrorEvent = {
  error: string;
};

type LocalSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: LocalSpeechRecognitionEvent) => void) | null;
  onerror: ((event: LocalSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => LocalSpeechRecognition;

type SpeechEnabledWindow = Window & {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

export default function Home() {
  const [mode, setMode] = useState<(typeof modes)[number]>("답장 온도");
  const [relationship, setRelationship] = useState<(typeof relationships)[number]>("상사");
  const [helpType, setHelpType] = useState<(typeof helpTypes)[number]>("말투 점검");
  const [tone, setTone] = useState<(typeof tones)[number]>("직장용");
  const [situation, setSituation] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<AnalysisResult>(demoAnalysisResult);
  const [errorMessage, setErrorMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");
  const recognitionRef = useRef<LocalSpeechRecognition | null>(null);
  const speechBaseTextRef = useRef("");
  const shouldListenRef = useRef(false);

  const remainingUses = useMemo(() => (hasResult ? 9 : 10), [hasResult]);
  const canAnalyze = situation.trim().length > 0 && !isGenerating;

  useEffect(() => {
    const speechWindow = window as SpeechEnabledWindow;
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setSpeechSupported(false);
      setSpeechMessage("이 브라우저는 음성 입력을 지원하지 않습니다. Chrome 또는 Edge에서 이용해주세요.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript || "";
        if (event.results[index].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const prefix = speechBaseTextRef.current ? `${speechBaseTextRef.current} ` : "";

      if (finalTranscript.trim()) {
        const nextText = `${prefix}${finalTranscript.trim()}`.trim();
        speechBaseTextRef.current = nextText;
        setSituation(nextText);
        setHasResult(false);
        setErrorMessage("");
        setSpeechMessage("음성이 입력되었습니다. 계속 말하거나 중지할 수 있어요.");
        return;
      }

      if (interimTranscript.trim()) {
        setSituation(`${prefix}${interimTranscript.trim()}`.trim());
        setHasResult(false);
        setErrorMessage("");
      }
    };

    recognition.onerror = (event) => {
      shouldListenRef.current = false;
      setIsListening(false);

      const messageByError: Record<string, string> = {
        "not-allowed": "마이크 권한이 거부되었습니다. 브라우저 주소창 권한 설정에서 마이크를 허용해주세요.",
        "service-not-allowed": "브라우저가 음성 인식 서비스를 허용하지 않았습니다. 마이크 권한과 브라우저 설정을 확인해주세요.",
        "no-speech": "음성이 감지되지 않았습니다. 조금 더 가까이 말하거나 다시 시작해주세요.",
        "audio-capture": "마이크를 찾을 수 없습니다. 입력 장치 연결 상태를 확인해주세요.",
        network: "음성 인식 네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.",
      };

      setSpeechMessage(messageByError[event.error] || "음성 입력 중 문제가 생겼습니다. 다시 시도해주세요.");
    };

    recognition.onend = () => {
      if (!shouldListenRef.current) {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);
    setSpeechMessage("");

    return () => {
      shouldListenRef.current = false;
      recognition.abort();
    };
  }, []);

  async function handleAnalyze() {
    if (!situation.trim()) return;
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, relationship, helpType, tone, situation }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석을 생성하지 못했습니다.");
      }

      setResult(data.result);
      setHasResult(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "분석을 생성하지 못했습니다.");
    } finally {
      setIsGenerating(false);
    }
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

  function handleSpeechToggle() {
    const recognition = recognitionRef.current;

    if (!speechSupported || !recognition) {
      setSpeechMessage("이 브라우저는 음성 입력을 지원하지 않습니다. Chrome 또는 Edge에서 이용해주세요.");
      return;
    }

    if (isListening) {
      shouldListenRef.current = false;
      recognition.stop();
      setIsListening(false);
      setSpeechMessage("음성 입력을 중지했습니다.");
      return;
    }

    speechBaseTextRef.current = situation.trim();
    shouldListenRef.current = true;
    setSpeechMessage("브라우저 권한 요청이 뜨면 마이크 사용을 허용해주세요. 듣는 중에는 말한 내용이 입력창에 들어갑니다.");

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(true);
      setSpeechMessage("이미 음성 입력이 시작되어 있습니다. 말한 내용이 입력창에 들어갑니다.");
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
              <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-slate-700">
                <span>상황 또는 보내려는 문장</span>
                <span className="flex items-center gap-2">
                  <span className="font-bold text-slate-400">결과 생성 후 폐기</span>
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    disabled={!speechSupported}
                    className={classNames(
                      "inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-black transition",
                      isListening
                        ? "bg-orange-500 text-white"
                        : "bg-slate-950 text-white hover:bg-indigo-700",
                      !speechSupported && "cursor-not-allowed bg-slate-300 text-slate-500 hover:bg-slate-300",
                    )}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    {isListening ? "듣는 중" : "음성 입력"}
                  </button>
                </span>
              </span>
              <textarea
                value={situation}
                onChange={(event) => {
                  setSituation(event.target.value);
                  if (hasResult) setHasResult(false);
                  if (errorMessage) setErrorMessage("");
                }}
                className="mt-2 min-h-36 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                placeholder={'예: 상사가 "요즘 MZ들은 책임감이 약한 것 같아"라고 했는데 나한테 하는 말 같아서 기분이 나빴다.'}
              />
            </label>
            {speechMessage ? (
              <p
                className={classNames(
                  "mt-2 rounded-lg border px-3 py-2 text-xs font-bold leading-5",
                  isListening
                    ? "border-orange-200 bg-orange-50 text-orange-800"
                    : "border-slate-200 bg-slate-50 text-slate-600",
                )}
              >
                {speechMessage}
              </p>
            ) : null}

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
            {errorMessage ? (
              <p className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-orange-800">
                {errorMessage}
              </p>
            ) : null}

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
            result={result}
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
  result,
}: {
  hasResult: boolean;
  copiedIndex: number | null;
  onCopy: (text: string, index: number) => void;
  relationship: string;
  helpType: string;
  tone: string;
  result: AnalysisResult;
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
        <div className="flex flex-wrap gap-2">
          {result.source === "demo" ? (
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">데모 결과</span>
          ) : null}
          <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-black text-indigo-700">진단 아님</span>
        </div>
      </div>

      <div className="mt-5 rounded-lg bg-slate-950 p-5 text-white">
        <p className="text-xs font-bold text-slate-300">상황 요약</p>
        <p className="mt-3 text-base font-extrabold leading-7">{result.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {result.separation.map((item) => (
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
          {result.possibleMeanings.map((meaning) => (
            <p key={meaning} className="rounded-lg bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700">
              {meaning}
            </p>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatusCard title="대응 필요도" value={result.responseLevel} tone="orange" />
        <StatusCard title="말투 리스크" value={result.toneRisk} tone="indigo" />
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-950">보내도 되는 문장</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">문장별 복사</span>
        </div>
        <div className="mt-3 grid gap-2">
          {result.replies.map((reply, index) => (
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
            {result.avoid.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-orange-700 ring-1 ring-orange-200">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-4">
          <h2 className="text-sm font-black text-indigo-900">다음 행동 제안</h2>
          <p className="mt-2 text-sm leading-6 text-indigo-900">{result.nextAction}</p>
        </div>
      </section>

      <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-500">
        {result.safetyNote}
      </p>

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
