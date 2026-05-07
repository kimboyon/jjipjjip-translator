import { createReply, deletePost } from "@/app/actions/community";
import { createClient } from "@/lib/supabase/server";
import { formatDate, initials } from "@/lib/format";
import type { Attachment, Post, Reply } from "@/lib/types";
import { Download, MessageCircle, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const { data: post } = await supabase
    .from("posts")
    .select(user ? "*, profiles(*)" : "*")
    .eq("id", id)
    .single();
  if (!post) notFound();
  const typedPost = post as unknown as Post;
  const [{ data: replies }, { data: attachments }] = await Promise.all([
    supabase
      .from("replies")
      .select(user ? "*, profiles(*)" : "*")
      .eq("post_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("attachments").select("*").eq("post_id", id).order("created_at", { ascending: true })
  ]);
  const isAuthor = user?.id === typedPost.author_id;
  const replyAction = createReply.bind(null, id);
  const deleteAction = deletePost.bind(null, id);

  return (
    <main className="min-h-screen bg-ink px-4 py-8">
      <article className="mx-auto max-w-4xl rounded-md bg-paper p-6 shadow-velvet md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/community" className="text-xs uppercase tracking-[0.22em] text-gold">
            Community
          </Link>
          {isAuthor ? (
            <div className="flex gap-2">
              <Link href={`/community/${id}/edit`} className="inline-flex items-center gap-2 rounded border border-ink/10 px-3 py-2 text-xs">
                <Pencil size={14} /> Edit
              </Link>
              <form action={deleteAction}>
                <button className="inline-flex items-center gap-2 rounded border border-burgundy/20 px-3 py-2 text-xs text-burgundy">
                  <Trash2 size={14} /> Delete
                </button>
              </form>
            </div>
          ) : null}
        </div>
        <div className="mt-8 flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-white">
            {initials(typedPost.profiles?.display_name, typedPost.profiles?.email)}
          </div>
          <div>
            <span className="rounded-full bg-jade/20 px-2 py-1 text-xs text-moss">{typedPost.category}</span>
            <h1 className="mt-3 font-serif text-5xl text-ink">{typedPost.title}</h1>
            <p className="mt-2 text-sm text-ink/50">
              {typedPost.profiles?.display_name ?? "Velora member"} · {formatDate(typedPost.created_at)}
            </p>
          </div>
        </div>
        <p className="mt-8 whitespace-pre-wrap text-base leading-8 text-ink/75">{typedPost.content}</p>
        {attachments?.length ? (
          <div className="mt-8 rounded-md border border-ink/10 bg-white/60 p-4">
            <h2 className="text-sm font-semibold">Attachments</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {attachments.map((file: Attachment) => {
                const { data } = supabase.storage.from("board-attachments").getPublicUrl(file.file_path);
                return (
                  <a key={file.id} href={data.publicUrl} target="_blank" className="inline-flex items-center gap-2 rounded border border-ink/10 px-3 py-2 text-xs" rel="noreferrer">
                    <Download size={14} /> {file.file_name}
                  </a>
                );
              })}
            </div>
          </div>
        ) : null}
        <section className="mt-10 border-t border-ink/10 pt-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-ink/70">
            <MessageCircle size={16} /> Replies
          </h2>
          <div className="mt-5 space-y-4">
            {(replies as Reply[] | null)?.map((reply) => (
              <div key={reply.id} className={`rounded-md border border-ink/10 bg-white/60 p-4 ${reply.parent_reply_id ? "ml-8" : ""}`}>
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-moss text-xs text-white">
                    {initials(reply.profiles?.display_name, reply.profiles?.email)}
                  </span>
                  <span className="font-semibold">{reply.profiles?.display_name ?? "Member"}</span>
                  <span className="text-xs text-ink/45">{formatDate(reply.created_at)}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink/70">{reply.content}</p>
              </div>
            ))}
          </div>
          {user ? (
            <form action={replyAction} className="mt-6 space-y-3">
              <textarea name="content" required rows={4} className="velora-input resize-none" placeholder="Write a thoughtful reply." />
              <button className="velora-button">Reply</button>
            </form>
          ) : (
            <Link href="/login" className="mt-6 inline-block text-sm text-gold">
              Sign in to reply
            </Link>
          )}
        </section>
      </article>
    </main>
  );
}
