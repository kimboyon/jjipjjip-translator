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
    <main className="marble flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-md text-center">
        <Link href="/" className="mb-8 inline-block font-serif text-2xl tracking-[0.5em] text-gold">
          V
        </Link>
        <h1 className="font-serif text-4xl text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink/65">{subtitle}</p>
        <div className="mt-8 text-left">{children}</div>
        <div className="mt-8 text-center text-xs text-ink/65">{footer}</div>
      </section>
    </main>
  );
}
