export type Profile = {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Post = {
  id: string;
  author_id: string;
  title: string;
  content: string;
  category: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
};

export type Reply = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_reply_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: Profile | null;
};

export type Attachment = {
  id: string;
  post_id: string;
  uploader_id: string;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size: number | null;
  created_at: string;
};

export type UploadedAttachment = {
  file_path: string;
  file_name: string;
  mime_type: string;
  size: number;
};
