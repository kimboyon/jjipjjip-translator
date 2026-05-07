import { updatePost } from "@/app/actions/community";
import { PostEditor } from "@/components/PostEditor";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=Please sign in first.");
  const { data: post } = await supabase.from("posts").select("*").eq("id", id).single();
  if (!post) notFound();
  if (post.author_id !== user.id) redirect(`/community/${id}`);
  const action = updatePost.bind(null, id);

  return (
    <main className="min-h-screen bg-ink px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-md bg-paper p-6 shadow-velvet md:p-10">
        <Link href={`/community/${id}`} className="text-xs uppercase tracking-[0.22em] text-gold">
          Back to Post
        </Link>
        <h1 className="mt-5 font-serif text-4xl text-ink">Edit Post</h1>
        <div className="mt-8">
          <PostEditor action={action} post={post} />
        </div>
      </section>
    </main>
  );
}
