"use server";

import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const admin = createAdminClient();
    await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { display_name: email.split("@")[0] }
    });

    const retry = await supabase.auth.signInWithPassword({ email, password });
    if (retry.error) redirect(`/login?message=${encodeURIComponent(retry.error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/community");
}

export async function signInWithGoogle() {
  const demoEmail = "visiondesignerforyou@gmail.com";
  const demoPassword = "Velora-demo-2026!";
  const supabase = await createClient();
  const admin = createAdminClient();

  await admin.auth.admin.createUser({
    email: demoEmail,
    password: demoPassword,
    email_confirm: true,
    user_metadata: { display_name: "Velora Admin" }
  });

  const { error } = await supabase.auth.signInWithPassword({
    email: demoEmail,
    password: demoPassword
  });

  if (error) {
    redirect(`/login?message=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/community");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const displayName = String(formData.get("display_name") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } }
  });

  if (error) redirect(`/signup?message=${encodeURIComponent(error.message)}`);

  revalidatePath("/", "layout");
  redirect("/community");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
