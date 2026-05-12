import Link from "next/link";

const mockupSrc = "/mockup.png";
const localSrc = "http://localhost:3001/";
const deployedSrc = "https://velora-web-nine.vercel.app/";

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-[#0b1411] p-4 text-ivory">
      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-gold">ManUp Preview</p>
          <h1 className="mt-2 font-serif text-4xl">Design Compare</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <Link className="rounded border border-ivory/20 px-3 py-2" href="/">
            Local
          </Link>
          <a className="rounded border border-ivory/20 px-3 py-2" href={deployedSrc} target="_blank" rel="noreferrer">
            Vercel
          </a>
          <a className="rounded border border-ivory/20 px-3 py-2" href={mockupSrc} target="_blank" rel="noreferrer">
            Mockup
          </a>
        </div>
      </div>

      <section className="grid gap-4 xl:grid-cols-3">
        <PreviewFrame title="Original Mockup">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mockupSrc} alt="Original ManUp mockup" className="h-full w-full object-contain" />
        </PreviewFrame>
        <PreviewFrame title="Local App">
          <iframe src={localSrc} title="Local ManUp app" className="h-full w-full bg-white" />
        </PreviewFrame>
        <PreviewFrame title="Vercel Deployment">
          <iframe src={deployedSrc} title="Deployed app" className="h-full w-full bg-white" />
        </PreviewFrame>
      </section>
    </main>
  );
}

function PreviewFrame({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-md border border-ivory/15 bg-[#151d19] shadow-velvet">
      <header className="flex items-center justify-between border-b border-ivory/10 px-4 py-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        <span className="text-[10px] uppercase tracking-[0.18em] text-ivory/45">Desktop</span>
      </header>
      <div className="h-[72vh] bg-paper">{children}</div>
    </article>
  );
}
