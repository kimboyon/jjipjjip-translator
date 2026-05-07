import { signIn, signInWithGoogle } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { Eye } from "lucide-react";
import Link from "next/link";

export default async function Login({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue to your account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-gold">
            Create one
          </Link>
        </>
      }
    >
      <form action={signIn} className="space-y-5">
        {params.message ? <p className="rounded bg-burgundy/10 p-3 text-sm text-burgundy">{params.message}</p> : null}
        <div>
          <label className="velora-label">Email address</label>
          <input className="velora-input" type="email" name="email" required placeholder="hello@velora.com" />
        </div>
        <div>
          <label className="velora-label">Password</label>
          <div className="relative">
            <input className="velora-input pr-10" type="password" name="password" required placeholder="••••••••••" />
            <Eye className="absolute right-3 top-3.5 text-ink/45" size={16} />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-ink/65">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="accent-moss" /> Remember me
          </label>
          <span>Forgot password?</span>
        </div>
        <button className="velora-button w-full">Sign In</button>
      </form>
      <div className="mt-8 grid grid-cols-3 gap-3">
        <form action={signInWithGoogle}>
          <button className="w-full rounded border border-ink/10 bg-white/60 py-3 text-xs text-ink/80 transition hover:border-gold hover:bg-white">
            G
          </button>
        </form>
        {["Apple", "MS"].map((item) => (
          <button key={item} className="rounded border border-ink/10 bg-white/30 py-3 text-xs text-ink/35" disabled>
            {item}
          </button>
        ))}
      </div>
    </AuthShell>
  );
}
