"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import type { Provider } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const oauthProviders = {
  google: "google",
  kakao: "kakao",
  naver: "custom:naver"
} satisfies Record<string, Provider>;

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const allowTestLogin = process.env.ALLOW_TEST_LOGIN !== "false";

    if (!allowTestLogin) {
      redirect(`/login?message=${encodeURIComponent(error.message)}`);
    }

    // Development-only shortcut: create or repair a confirmed test user so
    // arbitrary email/password pairs can enter the prototype quickly.
    const admin = createAdminClient();
    const displayName = email.includes("@") ? email.split("@")[0] : "ManUp Tester";
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: displayName }
    });

    if (created.error && created.error.message.toLowerCase().includes("already")) {
      const { data: users } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const existing = users.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());

      if (existing) {
        await admin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
          user_metadata: { display_name: existing.user_metadata?.display_name ?? displayName }
        });
      }
    } else if (created.error) {
      redirect(`/login?message=${encodeURIComponent(created.error.message)}`);
    }

    const retry = await supabase.auth.signInWithPassword({ email, password });
    if (retry.error) {
      redirect(`/login?message=${encodeURIComponent(retry.error.message)}`);
    }
  }

  revalidatePath("/", "layout");
  redirect("/community");
}

export async function signInWithOAuth(formData: FormData) {
  const providerKey = String(formData.get("provider") ?? "");
  const next = String(formData.get("next") ?? "/community");
  const returnTo = String(formData.get("returnTo") ?? "/login");
  const provider = oauthProviders[providerKey as keyof typeof oauthProviders];

  if (!provider) {
    redirect(`${returnTo}?message=${encodeURIComponent("지원하지 않는 소셜 로그인입니다.")}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=${encodeURIComponent(next)}`
    }
  });

  if (error || !data.url) {
    redirect(`${returnTo}?message=${encodeURIComponent(error?.message ?? "소셜 로그인을 시작하지 못했습니다.")}`);
  }

  redirect(data.url);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });

  if (error) redirect(`/signup?message=${encodeURIComponent(error.message)}`);

  if (data.user && !data.session) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(data.user.id, {
      email_confirm: true,
      user_metadata: { display_name: displayName }
    });
    await supabase.auth.signInWithPassword({ email, password });
  }

  revalidatePath("/", "layout");
  redirect("/community");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
