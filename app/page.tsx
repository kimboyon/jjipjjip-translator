import { Nav } from "@/components/Nav";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-ink p-3 text-ivory md:p-6">
      <section className="relative min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-md border border-ivory/40 bg-[radial-gradient(circle_at_72%_42%,rgba(180,137,72,0.28),transparent_22%),linear-gradient(130deg,#050a08,#101711_52%,#07130f)] shadow-velvet md:min-h-[calc(100vh-3rem)]">
        <Nav />
        <div className="grid min-h-[72vh] items-center gap-10 px-7 pb-20 pt-6 md:grid-cols-[0.9fr_1.1fr] md:px-16">
          <div className="relative z-10">
            <h1 className="max-w-xl font-serif text-6xl leading-[0.95] tracking-normal text-ivory md:text-8xl">
              Timeless
              <br />
              by Design.
            </h1>
            <p className="mt-8 max-w-xs text-sm leading-7 text-ivory/75">
              Curated pieces. Thoughtful materials. Lasting impact.
            </p>
            <Link href="/community" className="gold-button mt-8 inline-flex items-center gap-4">
              Explore Collection <ArrowRight size={15} />
            </Link>
          </div>
          <div className="relative min-h-[360px] md:min-h-[560px]" aria-hidden="true">
            <div className="absolute left-[18%] top-[12%] h-80 w-52 rotate-[-18deg] rounded bg-[linear-gradient(145deg,#22362d,#050807_45%,#466152)] shadow-velvet md:h-[30rem] md:w-80" />
            <div className="absolute left-[6%] top-[34%] h-48 w-48 rounded-full border-[12px] border-gold/70 md:h-80 md:w-80" />
            <div className="absolute left-[22%] top-[26%] h-32 w-[72%] rotate-[24deg] rounded-full bg-[linear-gradient(100deg,rgba(255,250,240,0.05),rgba(255,250,240,0.86),rgba(255,250,240,0.08))] blur-[1px] md:h-48" />
            <div className="absolute bottom-8 right-8 h-44 w-64 rounded bg-[linear-gradient(145deg,#cfc0ab,#816e5a)] opacity-75 md:h-72 md:w-96" />
          </div>
        </div>
        <div className="absolute bottom-10 left-7 text-[11px] uppercase leading-6 tracking-[0.28em] text-ivory/80 md:left-16">
          Spring / Summer 2026
          <br />
          New Arrivals
        </div>
      </section>
      <section id="about" className="mx-auto grid max-w-6xl gap-8 px-4 py-20 md:grid-cols-3">
        {["Material Notes", "Community Care", "Quiet Luxury"].map((title) => (
          <article key={title} className="border-t border-ivory/20 pt-6">
            <h2 className="font-serif text-3xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-ivory/65">
              A restrained digital house for collections, support, and refined community exchange.
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}
