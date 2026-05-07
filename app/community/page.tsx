import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/format";
import type { Post } from "@/lib/types";
import { MessageCircle, Paperclip, PenLine, ThumbsUp } from "lucide-react";
import Link from "next/link";

export default async function Community() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: posts } = await supabase
    .from("posts")
    .select(user ? "*, profiles(*), replies(id), attachments(id)" : "*, replies(id), attachments(id)")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-ink p-3 md:p-6">
      <section className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-md bg-paper shadow-velvet md:grid-cols-[260px_1fr]">
        <aside className="bg-[linear-gradient(160deg,#073027,#07130f)] p-7 text-ivory">
          <Link href="/" className="font-serif text-2xl tracking-[0.45em] text-gold">
            V
          </Link>
          <p className="mt-10 text-[11px] uppercase tracking-[0.22em] text-ivory/60">Customer Center</p>
          <nav className="mt-5 space-y-2 text-sm">
            {["Community", "My Activities", "Messages", "Saved", "Support Tickets", "Announcements"].map((item, index) => (
              <Link
                key={item}
                href="/community"
                className={`flex items-center justify-between rounded px-3 py-3 ${index === 0 ? "bg-white/10" : "text-ivory/75"}`}
              >
                <span>{item}</span>
                {index === 2 ? <span className="rounded-full bg-ivory/20 px-2 text-xs">3</span> : null}
              </Link>
            ))}
          </nav>
          <div className="mt-20 rounded-md border border-ivory/10 p-4 text-xs leading-6 text-ivory/70">
            Need help?
            <br />
            Our support team is here for you.
          </div>
        </aside>
        <div className="p-5 md:p-9">
          <div className="flex flex-col justify-between gap-4 border-b border-ink/10 pb-6 md:flex-row md:items-start">
            <div>
              <h1 className="font-serif text-4xl text-ink">Community</h1>
              <p className="mt-2 text-sm text-ink/60">Connect, ask, and share ideas with other members.</p>
            </div>
            <Link href={user ? "/community/new" : "/login"} className="velora-button inline-flex items-center justify-center gap-2">
              <PenLine size={15} /> Write a Post
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {["All Topics", "Products", "Styling", "Orders & Shipping", "Care & Materials", "Events"].map((topic, index) => (
              <span key={topic} className={`rounded-full border px-3 py-1.5 text-xs ${index === 0 ? "bg-ink text-ivory" : "border-ink/10 text-ink/70"}`}>
                {topic}
              </span>
            ))}
          </div>
          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_260px]">
            <div className="overflow-hidden rounded-md border border-ink/10 bg-white/60">
              {(posts as (Post & { replies?: { id: string }[]; attachments?: { id: string }[] })[] | null)?.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`} className="block border-b border-ink/10 p-5 transition hover:bg-ivory">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/80 text-sm font-semibold text-white">
                      {initials(post.profiles?.display_name, post.profiles?.email)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-ink">{post.title}</h2>
                        <span className="rounded-full bg-jade/20 px-2 py-1 text-[11px] text-moss">{post.category}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-ink/60">{post.content}</p>
                      <p className="mt-3 text-xs text-ink/45">
                        {post.profiles?.display_name ?? "Velora member"} replied {formatDate(post.created_at)}
                      </p>
                    </div>
                    <div className="hidden items-end gap-4 text-xs text-ink/45 sm:flex">
                      <span className="inline-flex items-center gap-1"><MessageCircle size={14} /> {post.replies?.length ?? 0}</span>
                      <span className="inline-flex items-center gap-1"><Paperclip size={14} /> {post.attachments?.length ?? 0}</span>
                      <span className="inline-flex items-center gap-1"><ThumbsUp size={14} /> 12</span>
                    </div>
                  </div>
                </Link>
              ))}
              {!posts?.length ? <p className="p-8 text-center text-sm text-ink/55">No community posts yet.</p> : null}
            </div>
            <aside className="space-y-4">
              <div className="rounded-md border border-ink/10 bg-white/60 p-5">
                <h3 className="text-sm font-semibold">Top Contributors</h3>
                <div className="mt-4 space-y-3 text-sm text-ink/65">
                  {["Emma Parker", "James L.", "Sophia M."].map((name) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss text-xs text-white">{initials(name)}</span>
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-md border border-ink/10 bg-white/60 p-5">
                <h3 className="text-sm font-semibold">Popular Tags</h3>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-ink/65">
                  {["Restock", "Styling Tips", "Care Guide", "New Arrivals", "Sustainability"].map((tag) => (
                    <span key={tag} className="rounded-full border border-ink/10 px-3 py-1"># {tag}</span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
