import { createPost } from "@/app/actions/community";
import { PostEditor } from "@/components/PostEditor";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/format";
import type { Post } from "@/lib/types";
import { Bell, MessageCircle, MoreVertical, Paperclip, PenLine, Search, ThumbsUp, UserRound } from "lucide-react";
import Link from "next/link";

const tabs = ["공지", "질문", "후기", "자유"];

export default async function Community() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: posts } = await supabase
    .from("posts")
    .select(user ? "*, profiles(*), replies(id), attachments(id)" : "*, replies(id), attachments(id)")
    .order("created_at", { ascending: false });

  const typedPosts = (posts ?? []) as unknown as (Post & { replies?: { id: string }[]; attachments?: { id: string }[] })[];
  const selected = typedPosts[0];

  return (
    <main className="min-h-screen bg-ink p-3 md:p-6">
      <section className="min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-md bg-paper shadow-velvet">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 px-5 py-5 md:px-10">
          <Link href="/" className="font-serif text-2xl font-semibold text-ink">
            맨업 <span className="text-sm font-normal">ManUp</span>
          </Link>
          <nav className="hidden gap-8 text-sm font-semibold text-ink/70 md:flex">
            <Link href="/#growth">성장</Link>
            <Link href="/community" className="text-ink">커뮤니티</Link>
            <Link href="/#mentoring">멘토링</Link>
            <Link href="/#care">상담</Link>
            <Link href="/community">고객센터</Link>
          </nav>
          <div className="flex items-center gap-4 text-ink/70">
            <Search size={18} />
            <Bell size={18} />
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-moss text-xs text-white">
              {user ? initials(user.user_metadata.display_name, user.email) : <UserRound size={15} />}
            </span>
          </div>
        </header>
        <div className="grid gap-6 p-5 md:grid-cols-[280px_1fr] md:p-8 lg:grid-cols-[320px_1fr]">
          <aside>
            <h1 className="text-3xl font-black text-ink">고객센터 & 커뮤니티</h1>
            <div className="mt-6 flex border-b border-ink/10 text-sm">
              {tabs.map((tab, index) => (
                <span key={tab} className={`px-4 py-3 ${index === 1 ? "border-b-2 border-ink font-bold text-ink" : "text-ink/55"}`}>
                  {tab}
                </span>
              ))}
            </div>
            <section className="mt-5 rounded-md border border-ink/10 bg-white/70 p-4">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
                <PenLine size={16} /> 글 작성
              </h2>
              {user ? (
                <PostEditor action={createPost} />
              ) : (
                <div className="rounded-md border border-dashed border-ink/15 p-5 text-center text-sm text-ink/60">
                  로그인 후 글 작성과 파일 업로드가 가능합니다.
                  <Link href="/login" className="velora-button mt-4 block">
                    로그인
                  </Link>
                </div>
              )}
            </section>
          </aside>
          <section className="space-y-4">
            {selected ? (
              <article className="rounded-md border border-ink/10 bg-white/75 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="rounded-full bg-ink/5 px-3 py-1 text-xs text-ink/65">{selected.category}</span>
                    <h2 className="mt-3 text-xl font-bold text-ink">{selected.title}</h2>
                    <p className="mt-2 text-xs text-ink/45">
                      {formatDate(selected.created_at)} · 조회 {Math.max(12, selected.replies?.length ?? 0) * 8}
                    </p>
                  </div>
                  <MoreVertical size={18} className="text-ink/45" />
                </div>
                <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-ink/70">{selected.content}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(selected.attachments?.length ?? 0) > 0 ? (
                    <span className="inline-flex items-center gap-2 rounded border border-ink/10 px-3 py-2 text-xs text-ink/60">
                      <Paperclip size={14} /> 첨부파일 {selected.attachments?.length}개
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 rounded border border-ink/10 px-3 py-2 text-xs text-ink/45">
                      <Paperclip size={14} /> 첨부파일 없음
                    </span>
                  )}
                  <Link href={`/community/${selected.id}`} className="inline-flex items-center gap-2 rounded border border-gold/35 px-3 py-2 text-xs font-semibold text-gold">
                    상세 보기
                  </Link>
                </div>
              </article>
            ) : null}
            <div className="space-y-3">
              {typedPosts.map((post) => (
                <Link key={post.id} href={`/community/${post.id}`} className="block rounded-md border border-ink/10 bg-white/60 p-4 transition hover:bg-white">
                  <div className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moss text-xs text-white">
                      {initials(post.profiles?.display_name, post.profiles?.email)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-ink">{post.title}</h3>
                        <span className="rounded-full bg-jade/20 px-2 py-1 text-[11px] text-moss">{post.category}</span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-ink/60">{post.content}</p>
                      <p className="mt-3 text-xs text-ink/45">{post.profiles?.display_name ?? "맨업 멤버"} · {formatDate(post.created_at)}</p>
                    </div>
                    <div className="hidden items-end gap-4 text-xs text-ink/45 sm:flex">
                      <span className="inline-flex items-center gap-1"><MessageCircle size={14} /> {post.replies?.length ?? 0}</span>
                      <span className="inline-flex items-center gap-1"><Paperclip size={14} /> {post.attachments?.length ?? 0}</span>
                      <span className="inline-flex items-center gap-1"><ThumbsUp size={14} /> 2</span>
                    </div>
                  </div>
                </Link>
              ))}
              {!typedPosts.length ? <p className="rounded-md border border-ink/10 bg-white/60 p-8 text-center text-sm text-ink/55">아직 게시글이 없습니다.</p> : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
