import { signIn } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
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
      title="로그인"
      subtitle="맨업 ManUp에 오신 것을 환영합니다."
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link href="/signup" className="text-gold">
            회원가입
          </Link>
        </>
      }
    >
      <form action={signIn} className="space-y-5">
        {params.message ? <p className="rounded bg-burgundy/10 p-3 text-sm text-burgundy">{params.message}</p> : null}
        <div>
          <label className="velora-label">이메일</label>
          <input className="velora-input" type="email" name="email" required placeholder="이메일을 입력하세요" />
        </div>
        <div>
          <label className="velora-label">비밀번호</label>
          <div className="relative">
            <input className="velora-input pr-10" type="password" name="password" required placeholder="비밀번호를 입력하세요" />
            <Eye className="absolute right-3 top-3.5 text-ink/45" size={16} />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-ink/65">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked className="accent-moss" /> 로그인 상태 유지
          </label>
          <span>비밀번호 찾기</span>
        </div>
        <button className="velora-button w-full">로그인</button>
      </form>
      <SocialAuthButtons returnTo="/login" />
    </AuthShell>
  );
}
