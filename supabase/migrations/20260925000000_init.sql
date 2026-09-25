-- =====================================================================
-- Kabar Kota — skema awal
-- Normalisasi: setiap fakta disimpan di satu tempat (3NF).
--   profiles   : data penulis/editor (1:1 dengan auth.users)
--   categories : daftar kategori + warna jalurnya
--   tags       : daftar tag unik
--   media      : metadata gambar (file-nya di Supabase Storage)
--   articles   : isi berita, merujuk kategori, penulis, dan gambar sampul
--   article_tags : relasi banyak-ke-banyak artikel ↔ tag
-- =====================================================================

-- ---------- Tipe enum ----------
create type public.user_role as enum ('reader', 'writer', 'editor', 'admin');
create type public.article_status as enum ('draft', 'review', 'published');

-- ---------- Tabel ----------
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '' check (char_length(full_name) <= 80),
  role        public.user_role not null default 'reader',
  created_at  timestamptz not null default now()
);

create table public.categories (
  id        bigint generated always as identity primary key,
  name      text not null unique check (char_length(name) between 2 and 40),
  slug      text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  color     text not null check (color ~ '^#[0-9A-Fa-f]{6}$'),
  position  smallint not null default 0
);

create table public.tags (
  id    bigint generated always as identity primary key,
  name  text not null check (char_length(name) between 2 and 40),
  slug  text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

create table public.media (
  id            uuid primary key default gen_random_uuid(),
  storage_path  text not null unique,
  thumb_path    text not null unique,
  width         integer not null check (width > 0),
  height        integer not null check (height > 0),
  alt_text      text not null check (char_length(alt_text) between 3 and 200),
  caption       text check (char_length(caption) <= 300),
  credit        text check (char_length(credit) <= 80),
  uploaded_by   uuid references public.profiles (id) on delete set null,
  created_at    timestamptz not null default now()
);

create table public.articles (
  id              uuid primary key default gen_random_uuid(),
  title           text not null check (char_length(title) between 10 and 160),
  slug            text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt         text not null check (char_length(excerpt) between 20 and 300),
  body            text not null check (char_length(body) >= 50),
  category_id     bigint not null references public.categories (id) on delete restrict,
  author_id       uuid not null references public.profiles (id) on delete restrict,
  cover_media_id  uuid references public.media (id) on delete set null,
  status          public.article_status not null default 'draft',
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint articles_published_has_date
    check (status <> 'published' or published_at is not null)
);

create table public.article_tags (
  article_id  uuid not null references public.articles (id) on delete cascade,
  tag_id      bigint not null references public.tags (id) on delete cascade,
  primary key (article_id, tag_id)
);

-- ---------- Indeks untuk query yang sering dipakai ----------
create index articles_published_idx
  on public.articles (published_at desc) where status = 'published';
create index articles_category_published_idx
  on public.articles (category_id, published_at desc) where status = 'published';
create index articles_author_idx on public.articles (author_id);
create index articles_cover_idx on public.articles (cover_media_id);
create index article_tags_tag_idx on public.article_tags (tag_id);
create index media_uploaded_by_idx on public.media (uploaded_by);

-- ---------- Trigger ----------
create function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger articles_set_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

-- Tanggal terbit diisi otomatis saat status menjadi 'published'
-- dan dikosongkan lagi bila artikel ditarik.
create function public.sync_published_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  elsif new.status <> 'published' then
    new.published_at := null;
  end if;
  return new;
end;
$$;

create trigger articles_sync_published_at
  before insert or update of status on public.articles
  for each row execute function public.sync_published_at();

-- Setiap akun baru otomatis punya profil dengan peran 'reader'.
create function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Fungsi bantu peran ----------
create function public.current_user_role()
returns public.user_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid();
$$;

create function public.is_staff()
returns boolean language sql stable set search_path = '' as $$
  select coalesce(public.current_user_role() in ('writer', 'editor', 'admin'), false);
$$;

create function public.is_editor()
returns boolean language sql stable set search_path = '' as $$
  select coalesce(public.current_user_role() in ('editor', 'admin'), false);
$$;

-- ---------- Row Level Security ----------
alter table public.profiles     enable row level security;
alter table public.categories   enable row level security;
alter table public.tags         enable row level security;
alter table public.media        enable row level security;
alter table public.articles     enable row level security;
alter table public.article_tags enable row level security;

-- profiles: nama penulis tampil publik; pengguna hanya boleh mengubah namanya sendiri.
create policy "Profil dapat dibaca publik"
  on public.profiles for select using (true);
create policy "Pengguna mengubah profilnya sendiri"
  on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.profiles from anon, authenticated;
grant update (full_name) on public.profiles to authenticated;

-- categories: dibaca publik, dikelola editor.
create policy "Kategori dapat dibaca publik"
  on public.categories for select using (true);
create policy "Editor mengelola kategori"
  on public.categories for all to authenticated
  using (public.is_editor()) with check (public.is_editor());

-- tags: dibaca publik, staf boleh menambah tag baru.
create policy "Tag dapat dibaca publik"
  on public.tags for select using (true);
create policy "Staf menambah tag"
  on public.tags for insert to authenticated with check (public.is_staff());

-- media: dibaca publik; staf mencatat unggahannya sendiri.
create policy "Media dapat dibaca publik"
  on public.media for select using (true);
create policy "Staf mencatat media miliknya"
  on public.media for insert to authenticated
  with check (public.is_staff() and uploaded_by = (select auth.uid()));
create policy "Pemilik atau editor mengubah media"
  on public.media for update to authenticated
  using (uploaded_by = (select auth.uid()) or public.is_editor());
create policy "Pemilik atau editor menghapus media"
  on public.media for delete to authenticated
  using (uploaded_by = (select auth.uid()) or public.is_editor());

-- articles: publik hanya melihat yang terbit; penulis mengelola draf miliknya;
-- hanya editor/admin yang boleh menerbitkan atau mengubah artikel yang sudah terbit.
create policy "Artikel terbit dapat dibaca publik"
  on public.articles for select
  using (
    status = 'published'
    or author_id = (select auth.uid())
    or public.is_editor()
  );
create policy "Staf membuat artikel atas namanya"
  on public.articles for insert to authenticated
  with check (
    public.is_staff()
    and author_id = (select auth.uid())
    and (status <> 'published' or public.is_editor())
  );
create policy "Penulis mengubah draf, editor mengubah semua"
  on public.articles for update to authenticated
  using (
    (author_id = (select auth.uid()) and status <> 'published')
    or public.is_editor()
  )
  with check (
    (public.is_staff() and author_id = (select auth.uid()) and status <> 'published')
    or public.is_editor()
  );
create policy "Penulis menghapus draf, editor menghapus semua"
  on public.articles for delete to authenticated
  using (
    (author_id = (select auth.uid()) and status = 'draft')
    or public.is_editor()
  );

-- article_tags: mengikuti hak akses artikelnya.
create policy "Tag artikel mengikuti artikel yang terlihat"
  on public.article_tags for select
  using (exists (select 1 from public.articles a where a.id = article_id));
create policy "Pengubah artikel mengatur tagnya"
  on public.article_tags for all to authenticated
  using (exists (
    select 1 from public.articles a
    where a.id = article_id
      and ((a.author_id = (select auth.uid()) and a.status <> 'published') or public.is_editor())
  ))
  with check (exists (
    select 1 from public.articles a
    where a.id = article_id
      and ((a.author_id = (select auth.uid()) and a.status <> 'published') or public.is_editor())
  ));

-- ---------- Storage: bucket gambar berita ----------
-- Batas 2 MB dan hanya WebP/JPEG: gambar mentah yang lolos dari kompresi client akan ditolak.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('news-images', 'news-images', true, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do nothing;

-- Path file: {user_id}/{tahun}/{bulan}/{uuid}.webp
create policy "Staf mengunggah ke foldernya sendiri"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'news-images'
    and public.is_staff()
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Pemilik atau editor menghapus gambar"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'news-images'
    and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_editor())
  );
