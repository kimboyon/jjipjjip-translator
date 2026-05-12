import { signInWithOAuth } from "@/app/actions/auth";

const providers = [
  {
    key: "google",
    label: "Google",
    className: "border-ink/10 bg-white text-ink hover:border-gold"
  },
  {
    key: "naver",
    label: "Naver",
    className: "border-[#03c75a] bg-[#03c75a] text-white hover:bg-[#02b351]"
  },
  {
    key: "kakao",
    label: "Kakao",
    className: "border-[#fee500] bg-[#fee500] text-[#191600] hover:bg-[#f6dc00]"
  }
];

export function SocialAuthButtons({
  returnTo,
  next = "/community"
}: {
  returnTo: "/login" | "/signup";
  next?: string;
}) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-ink/10" />
        <span className="text-[11px] font-semibold text-ink/45">또는 소셜 계정으로 계속하기</span>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {providers.map((provider) => (
          <form key={provider.key} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={provider.key} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <input type="hidden" name="next" value={next} />
            <button
              className={`w-full rounded border px-4 py-3 text-xs font-black transition ${provider.className}`}
              type="submit"
            >
              {provider.label}
            </button>
          </form>
        ))}
      </div>
      {returnTo === "/signup" ? (
        <p className="mt-3 text-center text-[11px] leading-5 text-ink/45">
          소셜 계정으로 처음 시작하면 자동으로 회원가입 후 로그인됩니다.
        </p>
      ) : null}
    </div>
  );
}
