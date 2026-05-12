import { createPost } from "@/app/actions/community";
import { PostEditor } from "@/components/PostEditor";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewPost() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?message=로그인이 필요합니다.");

  return (
    <main className="min-h-screen bg-ink px-4 py-8">
      <section className="mx-auto max-w-3xl rounded-md bg-paper p-6 shadow-velvet md:p-10">
        <Link href="/community" className="text-xs uppercase tracking-[0.22em] text-gold">
          커뮤니티로 돌아가기
        </Link>
        <h1 className="mt-5 text-4xl font-black text-ink">글 작성</h1>
        <p className="mt-2 text-sm text-ink/60">질문, 후기, 상담 요청을 명확하게 남겨주세요.</p>
        <div className="mt-8">
          <PostEditor action={createPost} />
        </div>
      </section>
    </main>
  );
}
