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
    <main className="grid min-h-screen bg-paper lg:grid-cols-[0.44fr_0.56fr]">
      <section className="neural-grid hidden p-10 text-ivory lg:flex lg:flex-col lg:justify-center">
        <Link href="/" className="font-serif text-3xl font-semibold text-gold">
          맨업 <span className="text-ivory">ManUp</span>
        </Link>
        <div className="gold-line my-10 h-px w-16" />
        <p className="max-w-xs text-xl font-semibold leading-8">스스로를 넘어, 더 나은 내일을 만드는 남자들의 성장 플랫폼</p>
        <p className="mt-10 max-w-xs text-xs leading-6 text-ivory/62">안전한 보안 시스템으로 회원님의 정보를 보호합니다.</p>
      </section>
      <section className="marble flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md text-center">
        <Link href="/" className="mb-8 inline-block font-serif text-2xl font-semibold text-gold lg:hidden">
          맨업 <span className="text-ink">ManUp</span>
        </Link>
        <h1 className="text-4xl font-black text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink/65">{subtitle}</p>
        <div className="mt-8 text-left">{children}</div>
        <div className="mt-8 text-center text-xs text-ink/65">{footer}</div>
        </div>
      </section>
    </main>
  );
}
