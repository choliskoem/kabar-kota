-- =====================================================================
-- Kabar Kota — pembaruan tampilan Gen Z
-- Data turunan (waktu baca, tag yang sedang ramai) dihitung saat dibaca,
-- tidak disimpan sebagai kolom, supaya skema tetap ternormalisasi.
-- =====================================================================

-- Waktu baca (menit), dipanggil lewat select=...,reading_minutes (computed field PostgREST).
create function public.reading_minutes(article public.articles)
returns integer language sql immutable set search_path = '' as $$
  select greatest(
    1,
    ceil(array_length(regexp_split_to_array(trim(article.body), '\s+'), 1) / 200.0)
  )::integer;
$$;

-- Tag yang paling sering dipakai berita terbit dalam 14 hari terakhir.
-- security_invoker: view mengikuti aturan RLS pembacanya.
create view public.trending_tags with (security_invoker = true) as
select t.id, t.name, t.slug, count(*)::integer as article_count
from public.tags t
join public.article_tags at on at.tag_id = t.id
join public.articles a on a.id = at.article_id
where a.status = 'published'
  and a.published_at > now() - interval '14 days'
group by t.id, t.name, t.slug;

grant select on public.trending_tags to anon, authenticated;

-- Warna kategori yang lebih cerah untuk tampilan baru.
update public.categories set color = '#FFB400' where slug = 'kota';
update public.categories set color = '#3D5AFE' where slug = 'politik';
update public.categories set color = '#00B37E' where slug = 'ekonomi';
update public.categories set color = '#FF5A1F' where slug = 'olahraga';
update public.categories set color = '#FF3D8B' where slug = 'hiburan';
update public.categories set color = '#8B5CF6' where slug = 'teknologi';
