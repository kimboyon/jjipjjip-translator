import { signIn } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import { Eye } from "lucide-react";
import Link from "next/link";

export default async function Login({
  searchParams
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/#translator";

  return (
    <AuthShell
      title="로그인"
      subtitle="계정으로 들어와 Plus 전환을 이어가세요."
      footer={
        <>
          계정이 없으신가요?{" "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-black">
            회원가입
          </Link>
        </>
      }
    >
      <form action={signIn} className="space-y-5">
        {params.message ? <p className="rounded bg-burgundy/10 p-3 text-sm text-burgundy">{params.message}</p> : null}
        <input type="hidden" name="next" value={next} />
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
      <SocialAuthButtons returnTo="/login" next={next} />
    </AuthShell>
  );
}
