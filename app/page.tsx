import { Nav } from "@/components/Nav";
import { ArrowRight, BarChart3, BrainCircuit, MessageCircle, UsersRound } from "lucide-react";
import Link from "next/link";

const features = [
  { title: "멘토링", body: "전문가와 운영자가 1:1로 방향을 함께 설계합니다.", icon: UsersRound },
  { title: "커뮤니티", body: "동료들과 질문, 후기, 자료를 나누며 성장 루틴을 만듭니다.", icon: MessageCircle },
  { title: "성장 리포트", body: "활동과 상담 데이터를 기반으로 나의 변화를 읽습니다.", icon: BarChart3 }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-ink p-3 text-ivory md:p-6">
      <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-md border border-ivory/35 bg-ink shadow-velvet md:min-h-[calc(100vh-3rem)]">
        <div className="absolute inset-0 neural-grid opacity-95" />
        <div className="absolute right-0 top-20 hidden h-[72%] w-[52%] md:block">
          <div className="absolute left-12 top-12 h-72 w-72 rounded-full border border-gold/30" />
          <div className="absolute left-28 top-16 h-[28rem] w-[18rem] rounded-[48%] bg-[radial-gradient(circle_at_52%_36%,rgba(247,242,234,0.76),rgba(123,151,136,0.18)_32%,transparent_60%)] blur-[0.2px]" />
          <div className="absolute left-28 top-12 h-[30rem] w-[24rem] rounded-full border-l border-gold/30 opacity-70" />
          <BrainCircuit className="absolute left-80 top-36 text-gold/70" size={140} strokeWidth={0.6} />
        </div>
        <div className="relative z-10">
          <Nav />
          <div className="grid min-h-[64vh] items-center gap-10 px-7 pb-16 pt-10 md:grid-cols-[0.88fr_1.12fr] md:px-16">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold">ManUp Growth Platform</p>
              <h1 className="mt-6 max-w-3xl text-5xl font-black leading-[1.08] tracking-normal sm:text-6xl md:text-7xl xl:text-8xl">
                <span className="block whitespace-nowrap">남자의 성장을</span>
                <br />
                <span className="block text-gold">설계하다</span>
              </h1>
              <p className="mt-7 max-w-lg text-base leading-8 text-ivory/78">
                커뮤니티, 멘토링, 콘텐츠, 상담을 하나로 연결해 몸과 마음의 루틴을 만드는 남성 성장 플랫폼.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/signup" className="gold-button inline-flex items-center justify-center gap-4">
                  시작하기 <ArrowRight size={15} />
                </Link>
                <Link href="/community" className="inline-flex items-center justify-center rounded border border-gold/45 px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-ivory">
                  프로그램 보기
                </Link>
              </div>
            </div>
          </div>
          <div id="growth" className="grid gap-3 px-7 pb-8 md:grid-cols-3 md:px-16">
            {features.map(({ title, body, icon: Icon }) => (
              <article key={title} className="manup-card p-5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 text-gold">
                  <Icon size={26} strokeWidth={1.2} />
                </div>
                <h2 className="mt-5 text-lg font-bold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ivory/65">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section id="mentoring" className="mx-auto grid max-w-6xl gap-10 px-4 py-20 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Method</p>
          <h2 className="mt-4 text-4xl font-black">신뢰를 만드는 구조</h2>
        </div>
        <div id="care" className="grid gap-4 sm:grid-cols-3">
          {["목표 진단", "상담 기록", "커뮤니티 피드백"].map((item) => (
            <div key={item} className="border-t border-gold/30 pt-5 text-sm leading-7 text-ivory/70">
              <strong className="block text-base text-ivory">{item}</strong>
              뇌과학 기반의 명확한 단계와 낮은 시각 소음으로 꾸준한 행동을 돕습니다.
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
