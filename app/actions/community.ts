"use server";

import type { UploadedAttachment } from "@/lib/types";
import { isAdminEmail } from "@/lib/env";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function parseUploads(value: FormDataEntryValue | null): UploadedAttachment[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?message=로그인이 필요합니다.");
  return { supabase, user };
}

export async function createPost(formData: FormData) {
  const { supabase, user } = await requireUser();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const category = String(formData.get("category") ?? "질문");
  const uploads = parseUploads(formData.get("attachments"));

  const { data: post, error } = await supabase
    .from("posts")
    .insert({ title, content, category, author_id: user.id })
    .select("id")
    .single();

  if (error || !post) redirect(`/community/new?message=${encodeURIComponent(error?.message ?? "글 작성에 실패했습니다.")}`);

  if (uploads.length) {
    await supabase.from("attachments").insert(
      uploads.map((upload) => ({
        ...upload,
        post_id: post.id,
        uploader_id: user.id
      }))
    );
  }

  revalidatePath("/community");
  redirect(`/community/${post.id}`);
}

export async function updatePost(postId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const uploads = parseUploads(formData.get("attachments"));
  const { error } = await supabase
    .from("posts")
    .update({
      title: String(formData.get("title") ?? "").trim(),
      content: String(formData.get("content") ?? "").trim(),
      category: String(formData.get("category") ?? "질문")
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (error) redirect(`/community/${postId}/edit?message=${encodeURIComponent(error.message)}`);

  if (uploads.length) {
    await supabase.from("attachments").insert(
      uploads.map((upload) => ({
        ...upload,
        post_id: postId,
        uploader_id: user.id
      }))
    );
  }

  revalidatePath("/community");
  redirect(`/community/${postId}`);
}

export async function deletePost(postId: string) {
  const { supabase, user } = await requireUser();
  if (isAdminEmail(user.email)) {
    const admin = createAdminClient();
    await admin.from("posts").delete().eq("id", postId);
  } else {
    await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id);
  }
  revalidatePath("/community");
  redirect("/community");
}

export async function createReply(postId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const content = String(formData.get("content") ?? "").trim();
  const parent = String(formData.get("parent_reply_id") ?? "");

  await supabase.from("replies").insert({
    post_id: postId,
    author_id: user.id,
    content,
    parent_reply_id: parent || null
  });

  revalidatePath(`/community/${postId}`);
  redirect(`/community/${postId}`);
}
