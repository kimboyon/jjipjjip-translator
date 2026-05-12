import { signUp } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import Link from "next/link";

export default async function Signup({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="회원가입"
      subtitle="맨업 커뮤니티와 성장 리포트를 시작하세요."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link href="/login" className="text-gold">
            로그인
          </Link>
        </>
      }
    >
      <form action={signUp} className="space-y-5">
        {params.message ? <p className="rounded bg-burgundy/10 p-3 text-sm text-burgundy">{params.message}</p> : null}
        <div>
          <label className="velora-label">이름</label>
          <input className="velora-input" name="display_name" required placeholder="홍길동" />
        </div>
        <div>
          <label className="velora-label">이메일</label>
          <input className="velora-input" type="email" name="email" required placeholder="name@example.com" />
        </div>
        <div>
          <label className="velora-label">비밀번호</label>
          <input className="velora-input" type="password" name="password" required minLength={6} placeholder="6자 이상 입력하세요" />
        </div>
        <button className="velora-button w-full">회원가입</button>
      </form>
      <SocialAuthButtons returnTo="/signup" />
    </AuthShell>
  );
}
