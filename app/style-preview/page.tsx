import { Activity, ArrowRight, BarChart3, Brain, CheckCircle2, HeartPulse, Moon, ShieldCheck } from "lucide-react";
import Link from "next/link";

const symptomItems = [
  ["에너지", "82", Activity],
  ["수면", "7.1h", Moon],
  ["기분", "안정", HeartPulse]
] as const;

export default function StylePreviewPage() {
  return (
    <main className="min-h-screen bg-[#eef0ea] p-4 text-[#07130f] md:p-8">
      <header className="mx-auto max-w-7xl rounded-md bg-[#07130f] px-6 py-7 text-white shadow-velvet md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <Link href="/" className="font-serif text-2xl font-semibold text-[#d6ad61]">
              맨업 <span className="text-white">ManUp</span>
            </Link>
            <h1 className="mt-5 text-4xl font-black md:text-6xl">3가지 디자인 방향 미리보기</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70">
              남성 갱년기 건강관리 앱, Andropause Tracker, 글로벌 건강 데이터 앱의 느낌을 ManUp에 맞게 정리했습니다.
              각 카드는 실제 앱 화면에 적용될 히어로, 체크인, 리포트 카드의 축약 샘플입니다.
            </p>
          </div>
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded border border-[#d6ad61]/50 px-4 py-3 text-xs font-bold text-[#d6ad61]">
            홈으로 <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <section className="mx-auto mt-6 grid max-w-7xl gap-6 xl:grid-cols-3">
        <PreviewCard
          option="01"
          title="Clinical Luxury"
          subtitle="고급 남성 클리닉처럼 신뢰감 있게"
          description="가장 추천. 기존 딥그린과 골드 무드를 유지하면서 의료/건강 서비스다운 신뢰도와 프리미엄 감각을 강화합니다."
          background="#07130f"
          panel="#f7f2ea"
          primary="#f2d675"
          secondary="#7d9a8c"
          text="#f7f2ea"
          dark="#07130f"
        />
        <PreviewCard
          option="02"
          title="Data Performance"
          subtitle="몸의 변화를 숫자로 통제하는 트래커"
          description="글로벌 Low-T, TRT, 피트니스 트래커 느낌입니다. 차트, 점수, 주간 리포트가 강한 제품형 UI에 적합합니다."
          background="#0b0f10"
          panel="#f4f7f6"
          primary="#43b883"
          secondary="#6e8796"
          text="#f4f7f6"
          dark="#0b0f10"
        />
        <PreviewCard
          option="03"
          title="Warm Professional Care"
          subtitle="상담과 회복에 가까운 따뜻한 전문성"
          description="40대 이상 사용자에게 부담이 적은 톤입니다. 상담, 생활습관, 회복 루틴 중심의 서비스에 잘 맞습니다."
          background="#10231e"
          panel="#faf7ef"
          primary="#a9793b"
          secondary="#8a9aa0"
          text="#faf7ef"
          dark="#10231e"
        />
      </section>
    </main>
  );
}

function PreviewCard({
  option,
  title,
  subtitle,
  description,
  background,
  panel,
  primary,
  secondary,
  text,
  dark
}: {
  option: string;
  title: string;
  subtitle: string;
  description: string;
  background: string;
  panel: string;
  primary: string;
  secondary: string;
  text: string;
  dark: string;
}) {
  return (
    <article className="overflow-hidden rounded-md border border-black/10 bg-white shadow-velvet">
      <div className="p-5" style={{ backgroundColor: background, color: text }}>
        <div className="flex items-center justify-between">
          <span className="rounded-full border px-3 py-1 text-xs font-black tracking-[0.16em]" style={{ borderColor: primary, color: primary }}>
            OPTION {option}
          </span>
          <ShieldCheck size={22} style={{ color: primary }} />
        </div>
        <h2 className="mt-6 text-3xl font-black">{title}</h2>
        <p className="mt-2 text-sm font-semibold" style={{ color: primary }}>
          {subtitle}
        </p>
        <div className="mt-7 rounded-md border p-5" style={{ borderColor: `${primary}55`, backgroundColor: "#00000022" }}>
          <p className="text-[11px] font-black uppercase tracking-[0.22em]" style={{ color: primary }}>
            ManUp Health Check-in
          </p>
          <h3 className="mt-4 text-4xl font-black leading-tight">
            남성 건강 변화를
            <br />
            한눈에 기록
          </h3>
          <p className="mt-4 text-sm leading-7 opacity-70">
            에너지, 수면, 성욕, 집중력, 기분 변화를 매일 체크하고 주간 리포트로 확인합니다.
          </p>
          <button
            className="mt-6 rounded px-4 py-3 text-xs font-black shadow-[0_10px_28px_rgba(0,0,0,0.28)]"
            style={{
              background: primary,
              color: title === "Data Performance" ? dark : "#fffaf0"
            }}
          >
            체크인 시작
          </button>
        </div>
      </div>

      <div className="p-5" style={{ backgroundColor: panel, color: dark }}>
        <div className="grid grid-cols-3 gap-3">
          {symptomItems.map(([label, value, Icon]) => (
            <div key={label} className="rounded border border-black/10 bg-white/45 p-3">
              <Icon size={16} style={{ color: secondary }} />
              <p className="mt-3 text-[11px] text-black/50">{label}</p>
              <p className="mt-1 text-xl font-black">{value}</p>
            </div>
          ))}
        </div>

        <section className="mt-4 rounded border border-black/10 bg-white/55 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black">주간 증상 리포트</p>
            <BarChart3 size={17} style={{ color: primary }} />
          </div>
          <div className="mt-4 h-2 rounded-full bg-black/10">
            <div
              className="h-2 w-[76%] rounded-full"
              style={{ background: `linear-gradient(90deg, ${secondary}, ${primary})` }}
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs leading-5">
            <div className="rounded bg-black/[0.04] p-3">
              <HeartPulse className="mb-2" size={15} style={{ color: primary }} />
              피로감 18% 감소
            </div>
            <div className="rounded bg-black/[0.04] p-3">
              <Brain className="mb-2" size={15} style={{ color: primary }} />
              집중 루틴 6일 유지
            </div>
          </div>
        </section>

        <p className="mt-4 rounded border border-black/10 bg-white/55 p-4 text-xs leading-6 text-black/65">
          {description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {["증상 추적", "전문가 상담", "주간 미션", "개인정보 보호"].map((item) => (
            <span key={item} className="inline-flex items-center gap-1 rounded border border-black/10 bg-white/45 px-3 py-2 text-[11px]">
              <CheckCircle2 size={12} style={{ color: primary }} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
