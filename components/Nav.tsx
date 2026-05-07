import { signOut } from "@/app/actions/auth";
import { isAdminEmail } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { Search, ShoppingBag } from "lucide-react";
import Link from "next/link";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  const admin = isAdminEmail(user?.email);

  return (
    <header className="flex items-center justify-between gap-4 px-5 py-6 text-[11px] uppercase tracking-[0.28em] text-ivory/90 md:px-10">
      <Link href="/" className="font-serif text-xl tracking-[0.42em]">
        VELORA
      </Link>
      <nav className="hidden items-center gap-8 md:flex">
        <Link href="/#collection">Collection</Link>
        <Link href="/community">Community</Link>
        <Link href="/#about">About</Link>
        {admin ? <Link href="/admin">Admin</Link> : null}
      </nav>
      <div className="flex items-center gap-4">
        <Search size={15} />
        <ShoppingBag size={15} />
        {user ? (
          <form action={signOut}>
            <button className="rounded border border-ivory/25 px-3 py-2">Logout</button>
          </form>
        ) : (
          <Link href="/login" className="rounded border border-ivory/25 px-3 py-2">
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
