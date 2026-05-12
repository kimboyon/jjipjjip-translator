import { signOut } from "@/app/actions/auth";
import { withAuthTimeout } from "@/lib/auth-timeout";
import { isAdminEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { Menu, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

export async function Nav() {
  const supabase = await createClient();
  const { data: { user } } = (await withAuthTimeout(supabase.auth.getUser(), { data: { user: null }, error: null })) as {
    data: { user: { email?: string | null } | null };
  };
  const admin = isAdminEmail(user?.email);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-gold/30 px-5 py-5 text-sm text-ivory/90 md:px-10">
      <Link href="/" className="font-serif text-xl font-semibold tracking-normal text-gold">
        맨업 <span className="text-ivory">ManUp</span>
      </Link>
      <nav className="hidden items-center gap-8 text-xs font-semibold md:flex">
        <Link href="/#growth">성장</Link>
        <Link href="/community">커뮤니티</Link>
        <Link href="/#mentoring">멘토링</Link>
        <Link href="/#care">상담</Link>
        <Link href="/community">고객센터</Link>
        {admin ? <Link href="/admin" className="inline-flex items-center gap-1 text-gold"><ShieldCheck size={14} /> 관리자</Link> : null}
      </nav>
      <div className="flex items-center gap-4">
        <Search className="hidden md:block" size={15} />
        {user ? (
          <form action={signOut}>
            <button className="rounded border border-ivory/25 px-3 py-2 text-xs">로그아웃</button>
          </form>
        ) : (
          <Link href="/login" className="rounded border border-ivory/25 px-3 py-2 text-xs">
            로그인
          </Link>
        )}
        <Menu className="md:hidden" size={18} />
      </div>
    </header>
  );
}
