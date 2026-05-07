"use client";

import type { Post, UploadedAttachment } from "@/lib/types";
import { createClient } from "@/lib/supabase/browser";
import { CloudUpload, Loader2, Paperclip } from "lucide-react";
import { useMemo, useState } from "react";

const categories = ["Care & Materials", "Styling", "Orders & Shipping", "Products", "Events"];

export function PostEditor({
  action,
  post
}: {
  action: (formData: FormData) => void;
  post?: Post;
}) {
  const [uploads, setUploads] = useState<UploadedAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const uploadJson = useMemo(() => JSON.stringify(uploads), [uploads]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    const supabase = createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setUploading(false);
      return;
    }

    const nextUploads: UploadedAttachment[] = [];
    for (const file of Array.from(files)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      const path = `${user.id}/${Date.now()}-${safeName}`;
      const { error } = await supabase.storage.from("board-attachments").upload(path, file, {
        upsert: false
      });
      if (!error) {
        nextUploads.push({
          file_path: path,
          file_name: file.name,
          mime_type: file.type || "application/octet-stream",
          size: file.size
        });
      }
    }
    setUploads((current) => [...current, ...nextUploads]);
    setUploading(false);
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="attachments" value={uploadJson} />
      <div>
        <label className="velora-label">Title</label>
        <input
          name="title"
          required
          minLength={2}
          defaultValue={post?.title}
          className="velora-input"
          placeholder="Will the Maia bag restock?"
        />
      </div>
      <div>
        <label className="velora-label">Category</label>
        <select name="category" defaultValue={post?.category ?? categories[0]} className="velora-input">
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="velora-label">Content</label>
        <textarea
          name="content"
          required
          rows={8}
          defaultValue={post?.content}
          className="velora-input resize-none"
          placeholder="Share a question, announcement, styling note, or support request."
        />
      </div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-ink/25 bg-paper px-5 py-8 text-center text-sm text-ink/65">
        {uploading ? <Loader2 className="mb-3 animate-spin text-gold" /> : <CloudUpload className="mb-3 text-gold" />}
        Drag & drop images or files here
        <span className="mt-1 text-xs">JPG, PNG, PDF up to 10MB</span>
        <input className="sr-only" type="file" multiple onChange={(event) => onFiles(event.target.files)} />
      </label>
      {uploads.length ? (
        <div className="flex flex-wrap gap-2">
          {uploads.map((upload) => (
            <span key={upload.file_path} className="inline-flex items-center gap-2 rounded bg-ink/5 px-3 py-2 text-xs">
              <Paperclip size={13} /> {upload.file_name}
            </span>
          ))}
        </div>
      ) : null}
      <button className="velora-button w-full">Publish Post</button>
    </form>
  );
}
