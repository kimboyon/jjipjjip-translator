import { signUp } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import Link from "next/link";

export default async function Signup({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Create account"
      subtitle="Join the Velora customer center and community"
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="text-gold">
            Sign in
          </Link>
        </>
      }
    >
      <form action={signUp} className="space-y-5">
        {params.message ? <p className="rounded bg-burgundy/10 p-3 text-sm text-burgundy">{params.message}</p> : null}
        <div>
          <label className="velora-label">Display name</label>
          <input className="velora-input" name="display_name" required placeholder="Emma Parker" />
        </div>
        <div>
          <label className="velora-label">Email address</label>
          <input className="velora-input" type="email" name="email" required placeholder="hello@velora.com" />
        </div>
        <div>
          <label className="velora-label">Password</label>
          <input className="velora-input" type="password" name="password" required minLength={6} placeholder="At least 6 characters" />
        </div>
        <button className="velora-button w-full">Create Account</button>
      </form>
    </AuthShell>
  );
}
