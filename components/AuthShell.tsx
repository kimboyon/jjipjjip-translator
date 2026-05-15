import Link from "next/link";
import type { ReactNode } from "react";

export function AuthShell({
  children,
  title,
  subtitle,
  footer
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  footer: ReactNode;
}) {
  return (
    <main className="grid min-h-screen bg-[#f6f4ef] text-black lg:grid-cols-[0.44fr_0.56fr]">
      <section className="hidden bg-black p-10 text-white lg:flex lg:flex-col lg:justify-center">
        <Link href="/" className="text-3xl font-black tracking-normal">
          찝찝함 번역기
        </Link>
        <div className="my-10 h-px w-16 bg-white/30" />
        <p className="max-w-sm text-3xl font-black leading-tight">보내기 전, 마음에 남은 찝찝함을 문장으로 정리합니다.</p>
        <p className="mt-10 max-w-xs text-xs leading-6 text-white/55">회원가입 후 구글, 네이버, 카카오톡 계정으로 빠르게 로그인할 수 있습니다.</p>
      </section>
      <section className="flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-8 inline-block text-2xl font-black tracking-normal lg:hidden">
          찝찝함 번역기
        </Link>
        <h1 className="text-4xl font-black text-black">{title}</h1>
        <p className="mt-2 text-sm text-black/60">{subtitle}</p>
        <div className="mt-8 text-left">{children}</div>
        <div className="mt-8 text-center text-xs text-black/60">{footer}</div>
        </div>
      </section>
    </main>
  );
}
