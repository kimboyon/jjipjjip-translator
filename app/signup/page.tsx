import { signUp } from "@/app/actions/auth";
import { AuthShell } from "@/components/AuthShell";
import { SocialAuthButtons } from "@/components/SocialAuthButtons";
import Link from "next/link";

export default async function Signup({
  searchParams
}: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/";

  return (
    <AuthShell
      title="회원가입"
      subtitle="Plus로 전환하고 EMOTRANS 분석을 계속 이용해보세요."
      footer={
        <>
          이미 계정이 있으신가요?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-black">
            로그인
          </Link>
        </>
      }
    >
      <form action={signUp} className="space-y-5">
        {params.message ? <p className="rounded bg-burgundy/10 p-3 text-sm text-burgundy">{params.message}</p> : null}
        <input type="hidden" name="next" value={next} />
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
      <SocialAuthButtons returnTo="/signup" next={next} />
    </AuthShell>
  );
}
