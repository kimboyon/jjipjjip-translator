create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 160),
  content text not null check (char_length(content) between 1 and 12000),
  category text not null default 'Care & Materials',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  parent_reply_id uuid references public.replies(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  uploader_id uuid not null references public.profiles(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  mime_type text,
  size bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  path text not null,
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
drop trigger if exists replies_set_updated_at on public.replies;
create trigger replies_set_updated_at before update on public.replies for each row execute function public.set_updated_at();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.replies enable row level security;
alter table public.attachments enable row level security;
alter table public.page_views enable row level security;

drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users" on public.profiles for select to authenticated using (true);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "posts public readable" on public.posts;
create policy "posts public readable" on public.posts for select to anon, authenticated using (true);
drop policy if exists "authenticated users create posts" on public.posts;
create policy "authenticated users create posts" on public.posts for insert to authenticated with check ((select auth.uid()) = author_id);
drop policy if exists "authors update own posts" on public.posts;
create policy "authors update own posts" on public.posts for update to authenticated using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
drop policy if exists "authors delete own posts" on public.posts;
create policy "authors delete own posts" on public.posts for delete to authenticated using ((select auth.uid()) = author_id);

drop policy if exists "replies public readable" on public.replies;
create policy "replies public readable" on public.replies for select to anon, authenticated using (true);
drop policy if exists "authenticated users create replies" on public.replies;
create policy "authenticated users create replies" on public.replies for insert to authenticated with check ((select auth.uid()) = author_id);
drop policy if exists "authors update own replies" on public.replies;
create policy "authors update own replies" on public.replies for update to authenticated using ((select auth.uid()) = author_id) with check ((select auth.uid()) = author_id);
drop policy if exists "authors delete own replies" on public.replies;
create policy "authors delete own replies" on public.replies for delete to authenticated using ((select auth.uid()) = author_id);

drop policy if exists "attachments public readable" on public.attachments;
create policy "attachments public readable" on public.attachments for select to anon, authenticated using (true);
drop policy if exists "authenticated users create attachments" on public.attachments;
create policy "authenticated users create attachments" on public.attachments for insert to authenticated with check ((select auth.uid()) = uploader_id);
drop policy if exists "uploaders delete own attachments" on public.attachments;
create policy "uploaders delete own attachments" on public.attachments for delete to authenticated using ((select auth.uid()) = uploader_id);

drop policy if exists "anyone can record page views" on public.page_views;
create policy "anyone can record page views" on public.page_views for insert to anon, authenticated with check (viewer_id is null or (select auth.uid()) = viewer_id);
drop policy if exists "authenticated users read page views" on public.page_views;
create policy "authenticated users read page views" on public.page_views for select to authenticated using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('board-attachments', 'board-attachments', true, 10485760, array['image/png','image/jpeg','image/webp','application/pdf','text/plain']::text[])
on conflict (id) do update set public = true, file_size_limit = 10485760, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "authenticated users upload board attachments" on storage.objects;
create policy "authenticated users upload board attachments" on storage.objects for insert to authenticated with check (bucket_id = 'board-attachments' and owner_id = (select auth.uid())::text);
drop policy if exists "owners update board attachments" on storage.objects;
create policy "owners update board attachments" on storage.objects for update to authenticated using (bucket_id = 'board-attachments' and owner_id = (select auth.uid())::text) with check (bucket_id = 'board-attachments' and owner_id = (select auth.uid())::text);
drop policy if exists "owners delete board attachments" on storage.objects;
create policy "owners delete board attachments" on storage.objects for delete to authenticated using (bucket_id = 'board-attachments' and owner_id = (select auth.uid())::text);

create index if not exists posts_author_created_idx on public.posts(author_id, created_at desc);
create index if not exists replies_post_created_idx on public.replies(post_id, created_at asc);
create index if not exists attachments_post_idx on public.attachments(post_id);
create index if not exists page_views_created_idx on public.page_views(created_at desc);
create index if not exists attachments_uploader_idx on public.attachments(uploader_id);
create index if not exists page_views_viewer_idx on public.page_views(viewer_id);
create index if not exists replies_author_idx on public.replies(author_id);
create index if not exists replies_parent_idx on public.replies(parent_reply_id);

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.set_updated_at() from public;
