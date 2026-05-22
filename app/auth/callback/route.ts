import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const providerError = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const rawNext = requestUrl.searchParams.get("next") ?? "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (providerError) {
    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(providerError)}`, requestUrl.origin));
  }

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }

    return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error.message)}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent("소셜 로그인에 실패했습니다. 다시 시도해주세요.")}`, requestUrl.origin));
}
