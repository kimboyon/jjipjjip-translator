"use client";

import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Copy,
  CreditCard,
  Loader2,
  LockKeyhole,
  MessageSquareText,
  Mic,
  MicOff,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  demoAnalysisResult,
  helpTypes,
  intents,
  relationships,
  tones,
  type AnalysisResult,
} from "@/lib/jjipjjip-analysis";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

const TRIAL_DAYS = 7;
const TRIAL_USE_LIMIT = 10;
const TRIAL_START_KEY = "jjipjjip_trial_started_at";
const TRIAL_USED_KEY = "jjipjjip_trial_used_count";

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
  const [intent, setIntent] = useState<(typeof intents)[number]>("확인");
  const [relationship, setRelationship] = useState<(typeof relationships)[number]>("상사");
  const [helpType, setHelpType] = useState<(typeof helpTypes)[number]>("바로 보낼 답장");
  const [tone, setTone] = useState<(typeof tones)[number]>("직장용");
  const [situation, setSituation] = useState("");
  const [hasResult, setHasResult] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<AnalysisResult>(demoAnalysisResult);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechMessage, setSpeechMessage] = useState("");
  const [trialStartedAt, setTrialStartedAt] = useState<number | null>(null);
  const [usedCount, setUsedCount] = useState(0);
  const recognitionRef = useRef<LocalSpeechRecognition | null>(null);
  const speechBaseTextRef = useRef("");
  const shouldListenRef = useRef(false);

  const daysLeft = useMemo(() => {
    if (!trialStartedAt) return TRIAL_DAYS;
    const elapsedDays = Math.floor((Date.now() - trialStartedAt) / 86_400_000);
    return Math.max(0, TRIAL_DAYS - elapsedDays);
  }, [trialStartedAt]);
  const remainingUses = Math.max(0, TRIAL_USE_LIMIT - usedCount);
  const trialLocked = daysLeft <= 0 || remainingUses <= 0;
  const canAnalyze = (situation.trim().length > 0 || imageDataUrl.length > 0) && !isGenerating;

  useEffect(() => {
    const savedStart = window.localStorage.getItem(TRIAL_START_KEY);
    const savedUsed = Number(window.localStorage.getItem(TRIAL_USED_KEY) || "0");
    const start = savedStart ? Number(savedStart) : Date.now();

    if (!savedStart) {
      window.localStorage.setItem(TRIAL_START_KEY, String(start));
    }

    setTrialStartedAt(start);
    setUsedCount(Number.isFinite(savedUsed) ? Math.max(0, savedUsed) : 0);
  }, []);

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
    if (trialLocked) {
      setErrorMessage("무료 체험이 종료되었습니다. 회원가입 후 Plus로 계속 이용할 수 있어요.");
      return;
    }
    setIsGenerating(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent, relationship, helpType, tone, situation, imageDataUrl, imageName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "분석을 생성하지 못했습니다.");
      }

      setResult(data.result);
      setHasResult(true);
      const nextUsedCount = Math.min(TRIAL_USE_LIMIT, usedCount + 1);
      setUsedCount(nextUsedCount);
      window.localStorage.setItem(TRIAL_USED_KEY, String(nextUsedCount));
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

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("PNG, JPG, WebP 같은 이미지 파일만 첨부할 수 있어요.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("이미지는 5MB 이하로 첨부해주세요.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setErrorMessage("이미지를 읽지 못했습니다. 다른 파일로 다시 시도해주세요.");
        return;
      }

      setImageDataUrl(reader.result);
      setImageName(file.name);
      setHasResult(false);
      setErrorMessage("");
    };
    reader.onerror = () => setErrorMessage("이미지를 읽지 못했습니다. 다른 파일로 다시 시도해주세요.");
    reader.readAsDataURL(file);
  }

  function clearAttachedImage() {
    setImageDataUrl("");
    setImageName("");
    setHasResult(false);
  }

  return (
    <main className="min-h-screen bg-[#f6f4ef] text-[#171717]">
      <BrandHero />

      <section id="translator" className="border-y border-black/10 bg-[#f6f4ef]">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <header className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b98d4d]">Translator Studio</p>
              <h2 className="mt-2 text-3xl font-black leading-tight text-black sm:text-4xl">EMOTRANS-찝찝함 번역기</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
                계획서 기준의 답장 전용 화면입니다. 말 꺼내기 불편한 상황을 입력하면 감정, 사실, 해석, 대응을 나눠 바로 복사 가능한 문장으로 바꿔줍니다.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-black/70">
                <CalendarClock size={13} /> {daysLeft}일 남음
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-black px-3 py-1.5 text-xs font-bold text-white">
                <LockKeyhole size={13} /> 저장 안 함
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-bold text-black/70">
                {remainingUses}회 남음
              </span>
            </div>
          </header>

          <div className="grid gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:items-stretch">
            <div className="flex flex-col rounded-[6px] border border-black/10 bg-white p-4 shadow-[0_18px_70px_rgba(0,0,0,0.06)] sm:p-5 lg:p-7">
            <div className="rounded-[6px] border border-black/10 bg-[#fff7df] p-3">
              <div className="flex items-center gap-2 text-xs font-black text-black">
                <Sparkles size={14} /> 보내기 전 10초 멈춤
              </div>
              <p className="mt-1 text-xs leading-5 text-black/60">
                상대 속마음을 맞히지 않고, 내 감정과 확인 가능한 사실부터 분리합니다.
              </p>
            </div>

            <div className="mt-6">
              <p className="inline-flex items-center gap-1 rounded-full border border-black/10 bg-[#f7f7f4] px-3 py-1.5 text-xs font-bold text-black/65">
                <MessageSquareText size={13} /> {intent} 답장
              </p>
              <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-normal text-black sm:text-6xl">
                지금 보내려는 말,
                <br />
                한 번만 정리해볼까요?
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-black/55">
                답장을 만들기 전에 감정, 사실, 해석, 대응을 나눠 봅니다. 결과는 진단이 아니라 대화를
                차분하게 고르는 참고자료입니다.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {intents.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setIntent(item)}
                  className={classNames(
                    "min-h-10 rounded-full px-3 text-xs font-extrabold transition",
                    intent === item
                      ? "bg-black text-white shadow-sm"
                      : "bg-[#f3f1eb] text-black/55 hover:bg-black hover:text-white",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold text-black/70">
                <span>상황 또는 보내려는 문장</span>
                <span className="flex items-center gap-2">
                  <span className="font-bold text-black/35">결과 생성 후 폐기</span>
                  <button
                    type="button"
                    onClick={handleSpeechToggle}
                    disabled={!speechSupported}
                    className={classNames(
                      "inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs font-black transition",
                      isListening
                        ? "bg-[#e86f3a] text-white"
                        : "bg-black text-white hover:bg-[#333]",
                      !speechSupported && "cursor-not-allowed bg-black/15 text-black/35 hover:bg-black/15",
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
                className="mt-2 min-h-40 w-full resize-none rounded-[6px] border border-black/10 bg-[#fbfaf7] p-5 text-base leading-7 text-black outline-none transition placeholder:text-black/30 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5"
                placeholder={'예: 상사가 "요즘 MZ들은 책임감이 약한 것 같아"라고 했는데 나한테 하는 말 같아서 기분이 나빴다.'}
              />
            </label>
            <div className="mt-3 rounded-[6px] border border-dashed border-black/15 bg-[#fbfaf7] p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-black">캡쳐 이미지로 분석하기</p>
                  <p className="mt-1 text-xs leading-5 text-black/50">
                    대화 캡쳐를 첨부하면 이미지 속 문장을 읽어 분석에 함께 반영합니다.
                  </p>
                </div>
                <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] bg-black px-4 text-xs font-black text-white transition hover:bg-[#333]">
                  <Upload size={14} /> 이미지 첨부
                  <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/gif" className="sr-only" onChange={handleImageChange} />
                </label>
              </div>
              {imageDataUrl ? (
                <div className="mt-3 grid gap-3 rounded-[6px] border border-black/10 bg-white p-3 sm:grid-cols-[112px_1fr_auto] sm:items-center">
                  <div className="relative h-24 overflow-hidden rounded-[6px] bg-[#f3f1eb]">
                    <Image src={imageDataUrl} alt="첨부한 캡쳐 이미지 미리보기" fill sizes="112px" className="object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-black">{imageName || "첨부 이미지"}</p>
                    <p className="mt-1 text-xs leading-5 text-black/50">
                      이미지 내용과 입력한 설명을 함께 분석합니다. 개인정보가 보이면 가린 뒤 첨부해주세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={clearAttachedImage}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-[6px] border border-black/10 px-3 text-xs font-black text-black/60 transition hover:border-black hover:text-black"
                  >
                    <X size={14} /> 삭제
                  </button>
                </div>
              ) : null}
            </div>
            {speechMessage ? (
              <p
                className={classNames(
                  "mt-2 rounded-[6px] border px-3 py-2 text-xs font-bold leading-5",
                  isListening
                    ? "border-[#e86f3a]/30 bg-[#fff7df] text-black"
                    : "border-black/10 bg-[#f7f7f4] text-black/60",
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
              disabled={!canAnalyze || trialLocked}
              className={classNames(
                "mt-5 inline-flex min-h-12 items-center justify-center gap-2 rounded-[6px] px-5 text-sm font-black text-white transition",
                canAnalyze && !trialLocked ? "bg-black hover:bg-[#333]" : "cursor-not-allowed bg-black/20",
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
                <div key={title} className="rounded-[6px] border border-black/10 bg-[#f7f7f4] p-3">
                  <div className="flex items-center gap-1.5 text-xs font-black text-black">
                    <ShieldCheck size={13} /> {title}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-black/50">{body}</p>
                </div>
              ))}
            </div>
            </div>

            <div className="grid gap-4">
              {trialLocked ? <UpgradePanel daysLeft={daysLeft} remainingUses={remainingUses} /> : null}
              <ResultPanel
                hasResult={hasResult}
                copiedIndex={copiedIndex}
                onCopy={handleCopy}
                relationship={relationship}
                helpType={helpType}
                tone={tone}
                result={result}
              />
            </div>
          </div>
        </div>
      </section>

      <LandingStory />
      <SiteFooter />
    </main>
  );
}

function BrandHero() {
  return (
    <section className="min-h-screen bg-[#fbfaf8] text-black">
      <header className="flex min-h-24 items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <span className="relative h-12 w-12 overflow-hidden rounded-full bg-white">
            <Image src="/emotrans-logo.jpg" alt="EMOTRANS 로고" fill sizes="48px" className="object-cover" priority />
          </span>
          <span className="text-xl font-black tracking-normal">
            <span className="bg-[linear-gradient(90deg,#6d37e8_0%,#5b61ef_24%,#63a8f2_48%,#73d6be_72%,#8bef5d_100%)] bg-clip-text text-transparent">
              EMOTRANS
            </span>
            -찝찝함 번역기
          </span>
        </Link>
        <nav className="hidden items-center gap-10 text-sm font-bold text-black/75 lg:flex">
          <a href="#method" className="transition hover:text-[#7651e6]">서비스 소개</a>
          <a href="#translator" className="transition hover:text-[#7651e6]">분석 기능</a>
          <a href="#method" className="transition hover:text-[#7651e6]">이용 방법</a>
          <a href="#pricing" className="transition hover:text-[#7651e6]">요금제</a>
          <a href="#footer" className="transition hover:text-[#7651e6]">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login?next=/" className="hidden text-sm font-bold text-black/70 transition hover:text-black sm:inline">
            로그인
          </Link>
          <Link
            href="/signup?next=/"
            className="inline-flex h-12 items-center justify-center rounded-[14px] bg-gradient-to-r from-[#7651e6] to-[#8f63ff] px-5 text-sm font-black text-white shadow-[0_12px_30px_rgba(118,81,230,0.28)] transition hover:scale-[1.01]"
          >
            무료로 시작하기
          </Link>
        </div>
      </header>

      <div className="mx-auto grid min-h-[calc(100vh-6rem)] w-full max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:px-12">
        <div>
          <p className="text-base font-black text-[#7651e6]">대화 속 숨은 의도, 감정, 불편함까지</p>
          <h1 className="mt-8 text-6xl font-black leading-[1.02] tracking-normal sm:text-7xl lg:text-8xl">
            <span className="bg-[linear-gradient(90deg,#6d37e8_0%,#5b61ef_24%,#63a8f2_48%,#73d6be_72%,#8bef5d_100%)] bg-clip-text text-transparent">
              EMOTRANS
            </span>
            <span className="mt-6 block text-4xl font-black sm:text-5xl lg:text-6xl">말하지 않아도, 다~ 알아요.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base font-medium leading-8 text-black/55">
            가까운 사람과 더 가까워지긴 부담스러울 때, 먼 사람과 더 멀어지긴 싫을 때. 찝찝함 말을 캡쳐하거나 적어두면 보내기 좋은 답장으로 정리해드려요.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a
              href="#translator"
              className="inline-flex min-h-14 items-center justify-center gap-3 rounded-[12px] bg-black px-7 text-sm font-black text-white transition hover:bg-[#2a2a2a]"
            >
              분석 시작하기 <ArrowRight size={18} />
            </a>
            <a href="#method" className="inline-flex min-h-12 items-center gap-2 text-sm font-black text-[#7651e6]">
              서비스 소개 보기 <ArrowRight size={16} />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 rounded-full bg-[#7651e6]/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_28px_90px_rgba(87,70,130,0.14)]">
            <Image
              src="/jjipjjip-landing-reference.jpg"
              alt="EMOTRANS-찝찝함 번역기 메인 콘텐츠 이미지"
              width={1792}
              height={1008}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>

        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-4">
          {[
            ["대화 분석", "문맥, 어조, 단어 선택까지 AI가 정밀 분석해요."],
            ["숨은 의도 해석", "겉으로 드러나지 않은 상대의 진짜 의도를 가능한 범위로 정리해요."],
            ["감정 가시화", "감정을 수치와 태그로 보여줘서 직관적으로 이해할 수 있어요."],
            ["관계 조언", "더 건강한 소통을 위한 맞춤형 답장 팁을 제공해요."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-[18px] border border-black/10 bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#7651e6]/10 text-[#7651e6]">
                <Sparkles size={22} />
              </div>
              <h2 className="text-lg font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-black/58">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
function LandingStory() {
  return (
    <section id="method" className="min-h-screen bg-white text-black">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-16 sm:px-8 lg:px-12">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b98d4d]">How It Works</p>
        <div className="mt-6 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <h2 className="text-5xl font-black leading-[0.96] tracking-normal sm:text-6xl">
              감정은 덜어내고,
              <br />
              의미는 또렷하게.
            </h2>
            <p className="mt-6 text-base leading-8 text-black/58">
              EMOTRANS-찝찝함 번역기는 상대를 판단하기보다 내가 확인할 수 있는 사실과 감정을 먼저 정리합니다. 그래서 답장이 공격적이거나 애매해지는 순간을 줄입니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["01", "감정 분리", "불편함, 억울함, 당황스러움을 먼저 이름 붙입니다."],
              ["02", "사실 확인", "상대의 의도를 단정하지 않고 실제 발화와 상황을 나눕니다."],
              ["03", "문장 제안", "직장용, 부드럽게, 단호하게 등 톤에 맞춰 보낼 문장을 만듭니다."],
            ].map(([step, title, body]) => (
              <div key={step} className="min-h-72 rounded-[6px] border border-black/10 bg-[#f6f4ef] p-6">
                <p className="text-sm font-black text-[#b98d4d]">{step}</p>
                <h3 className="mt-16 text-2xl font-black">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-black/55">{body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-3 border-y border-black/10 py-6 text-sm font-bold text-black/62 md:grid-cols-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-[#b98d4d]" /> 기본 비저장
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-[#b98d4d]" /> 진단이 아닌 대화 보조
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={17} className="text-[#b98d4d]" /> 보내도 되는 문장 3개
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer id="footer" className="bg-[#07130f] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <p className="text-lg font-black text-[#f4c46d]">EMOTRANS-찝찝함 번역기</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
            보내기 전 감정과 사실을 분리하고, 관계를 덜 해치면서도 나를 지키는 문장을 제안합니다.
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Company</p>
          <dl className="mt-4 space-y-2 text-xs leading-5 text-white/58">
            <div className="flex gap-2">
              <dt className="w-20 text-white/35">브랜드명</dt>
              <dd>EMOTRANS-찝찝함 번역기</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 text-white/35">사업자번호</dt>
              <dd>000-00-00000</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 text-white/35">대표</dt>
              <dd>홍길동</dd>
            </div>
          </dl>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">Support</p>
          <div className="mt-4 space-y-2 text-xs leading-5 text-white/58">
            <p>고객센터: help@jjipjjip.kr</p>
            <p>통신판매업 신고번호: 제0000-서울-0000호</p>
            <p>주소: 서울특별시 강남구 테헤란로 000</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-[11px] text-white/35">
        Copyright 2026 EMOTRANS. All rights reserved.
      </div>
    </footer>
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
      <span className="text-xs font-extrabold text-black/60">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="mt-2 h-11 w-full rounded-[6px] border border-black/10 bg-white px-3 text-sm font-bold text-black outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
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
      <aside className="flex min-h-[520px] flex-col justify-between rounded-[6px] border border-black/10 bg-white p-4 shadow-[0_18px_70px_rgba(0,0,0,0.06)] sm:p-5 lg:p-6">
        <div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black text-slate-950">정리 결과 미리보기</p>
              <p className="mt-1 text-xs text-slate-500">입력 후 카드가 이곳에 생성됩니다.</p>
            </div>
            <span className="rounded-full bg-[#f3f1eb] px-3 py-1.5 text-xs font-bold text-black/50">진단 아님</span>
          </div>

          <div className="mt-6 rounded-[6px] bg-black p-5 text-white">
            <p className="text-xs font-bold text-slate-300">먼저 분리해보면</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {["감정", "사실", "해석"].map((item) => (
                <div key={item} className="rounded-[6px] bg-white/10 px-3 py-4 text-center text-sm font-black">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <PreviewCard title="대응 필요도" body="낮게 시작 / 확인 필요 / 공식 대응" />
            <PreviewCard title="말투 리스크" body="차가움 / 공격적 / 모호함" />
            <PreviewCard title="이론적 근거" body="NVC / 귀인 오류 / 경계 설정" />
            <PreviewCard title="대응 전략" body="관계와 톤에 맞춘 단계별 접근" />
          </div>
        </div>

        <div className="mt-6 rounded-[6px] border border-dashed border-black/20 bg-[#f7f7f4] p-5">
          <Clipboard className="text-black/35" size={28} />
          <p className="mt-3 text-sm font-black text-black">보내도 되는 문장 3개가 준비됩니다.</p>
          <p className="mt-2 text-xs leading-5 text-black/50">
            복사하기 쉽게 문장별 버튼을 붙이고, 피해야 할 표현과 다음 행동도 함께 보여줍니다.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-[6px] border border-black/10 bg-white p-4 shadow-[0_18px_70px_rgba(0,0,0,0.06)] sm:p-5 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-950">EMOTRANS 정리 결과</p>
          <p className="mt-1 text-xs text-slate-500">
            {relationship} · {helpType} · {tone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {result.source === "demo" ? (
            <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-orange-700">데모 결과</span>
          ) : null}
          <span className="rounded-full bg-[#f3f1eb] px-3 py-1.5 text-xs font-black text-black/55">진단 아님</span>
        </div>
      </div>

      <div className="mt-5 rounded-[6px] bg-black p-5 text-white">
        <p className="text-xs font-bold text-slate-300">상황 요약</p>
        <p className="mt-3 text-base font-extrabold leading-7">{result.summary}</p>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {result.separation.map((item) => (
          <div key={item.label} className="rounded-[6px] border border-black/10 bg-[#f7f7f4] p-4">
            <p className="text-xs font-black text-black">{item.label}</p>
            <p className="mt-2 text-sm leading-6 text-black/65">{item.body}</p>
          </div>
        ))}
      </div>

      <section className="mt-4 rounded-[6px] border border-black/10 p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-black text-slate-950">상대 말의 가능한 해석</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">3가지</span>
        </div>
        <div className="mt-3 grid gap-2">
          {result.possibleMeanings.map((meaning) => (
            <p key={meaning} className="rounded-[6px] bg-[#f7f7f4] px-3 py-2 text-sm leading-6 text-black/65">
              {meaning}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-[6px] border border-black/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-950">분석 근거가 되는 커뮤니케이션 이론</h2>
          <span className="rounded-full bg-[#f3f1eb] px-2.5 py-1 text-xs font-bold text-black/55">참고 프레임</span>
        </div>
        <div className="mt-3 grid gap-3">
          {result.theoreticalGrounds.map((ground) => (
            <div key={ground.title} className="rounded-[6px] bg-[#f7f7f4] p-4">
              <p className="text-sm font-black text-black">{ground.title}</p>
              <p className="mt-2 text-sm leading-7 text-black/65">{ground.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <StatusCard title="대응 필요도" value={result.responseLevel} tone="orange" />
        <StatusCard title="말투 리스크" value={result.toneRisk} tone="indigo" />
      </div>

      <section className="mt-4 rounded-[6px] border border-black/10 bg-[#f3f1eb] p-4">
        <h2 className="text-sm font-black text-black">전문 대응 전략</h2>
        <p className="mt-2 text-sm leading-7 text-black/65">{result.strategy}</p>
      </section>

      <section className="mt-4 rounded-[6px] border border-black/10 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-950">보내도 되는 문장</h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">문장별 복사</span>
        </div>
        <div className="mt-3 grid gap-2">
          {result.replies.map((reply, index) => (
            <div key={reply} className="grid gap-2 rounded-[6px] bg-[#f7f7f4] p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <p className="text-sm leading-6 text-black/75">{reply}</p>
              <button
                type="button"
                onClick={() => onCopy(reply, index)}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-[6px] bg-black px-3 text-xs font-black text-white transition hover:bg-[#333]"
              >
                <Copy size={13} /> {copiedIndex === index ? "복사됨" : "복사"}
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 grid gap-3 lg:grid-cols-[0.88fr_1.12fr]">
        <div className="rounded-[6px] border border-black/10 bg-[#fff7df] p-4">
          <h2 className="text-sm font-black text-black">피해야 할 표현</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {result.avoid.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-black/65 ring-1 ring-black/10">
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-[6px] border border-black/10 bg-[#f3f1eb] p-4">
          <h2 className="text-sm font-black text-black">다음 행동 제안</h2>
          <p className="mt-2 text-sm leading-6 text-black/65">{result.nextAction}</p>
        </div>
      </section>

      <p className="mt-4 rounded-[6px] border border-black/10 bg-[#f7f7f4] px-3 py-2 text-xs leading-5 text-black/50">
        {result.safetyNote}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {["조금 부드럽게", "더 단호하게", "직장용으로"].map((action) => (
          <button
            key={action}
            type="button"
            className="inline-flex h-10 items-center gap-1 rounded-[6px] bg-[#f3f1eb] px-3 text-xs font-black text-black/65 transition hover:bg-black hover:text-white"
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
    <div className="rounded-[6px] border border-black/10 bg-[#f7f7f4] p-4">
      <p className="text-xs font-black text-black/70">{title}</p>
      <p className="mt-2 text-sm leading-6 text-black/50">{body}</p>
    </div>
  );
}

function StatusCard({ title, value, tone }: { title: string; value: string; tone: "orange" | "indigo" }) {
  return (
    <div
      className={classNames(
        "rounded-[6px] border p-4",
        tone === "orange" ? "border-black/10 bg-[#fff7df]" : "border-black/10 bg-[#f3f1eb]",
      )}
    >
      <p className="text-xs font-black text-black/60">{title}</p>
      <p className="mt-2 text-lg font-black text-black">{value}</p>
    </div>
  );
}

function UpgradePanel({ daysLeft, remainingUses }: { daysLeft: number; remainingUses: number }) {
  const reason = remainingUses <= 0 ? "무료 분석 횟수를 모두 사용했습니다." : "7일 무료 체험이 종료되었습니다.";

  return (
    <aside className="rounded-[6px] border border-black bg-black p-5 text-white shadow-[0_18px_70px_rgba(0,0,0,0.16)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-white/45">Plus 전환</p>
          <h2 className="mt-1 text-2xl font-black tracking-normal">계속 정리하려면 계정을 만들어주세요.</h2>
        </div>
        <CreditCard className="shrink-0 text-white/60" size={26} />
      </div>
      <p className="mt-4 text-sm leading-6 text-white/65">{reason} 회원가입 후 구글, 네이버, 카카오톡으로 로그인하고 유료 전환을 이어갈 수 있습니다.</p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold text-white/65">
        <div className="rounded-[6px] border border-white/10 p-3">
          <span className="block text-white">남은 일수</span>
          {daysLeft}일
        </div>
        <div className="rounded-[6px] border border-white/10 p-3">
          <span className="block text-white">남은 횟수</span>
          {remainingUses}회
        </div>
      </div>
      <Link
        href="/signup?next=/"
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-white px-4 text-sm font-black text-black transition hover:bg-[#fff7df]"
      >
        <UserPlus size={16} /> 회원가입하고 계속하기
      </Link>
    </aside>
  );
}
