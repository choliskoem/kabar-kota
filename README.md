# Kabar Kota

Portal berita kota untuk pembaca muda. Dibangun dengan **Next.js 16 (App Router)** dan **Supabase** (Postgres, Auth, Storage), di-deploy ke **Vercel**.

## Fitur

- Beranda dengan berita utama, jalur "Terkini", dan seksi per kategori, dirender statis (ISR) sehingga cepat.
- Halaman berita dan halaman kategori, lengkap dengan metadata untuk dibagikan ke media sosial.
- Dashboard redaksi: tulis, ubah, kirim ke editor, terbitkan, dan tarik berita.
- Unggah foto sampul: dikompres dan diubah ke WebP **di browser** (ukuran besar 1600 px + thumbnail 480 px), lalu dikirim langsung ke Supabase Storage.
- Hak akses dijaga di database lewat Row Level Security, bukan hanya di tampilan.

## Peran pengguna

| Peran | Bisa apa |
|---|---|
| `reader` | Peran awal setiap akun baru. Tidak bisa masuk dashboard. |
| `writer` | Menulis berita, mengunggah foto, mengubah draf miliknya, mengirim ke editor. |
| `editor` | Semua hak penulis, ditambah menerbitkan, menarik, dan mengubah semua berita. |
| `admin` | Sama seperti editor (disiapkan untuk pengelolaan pengguna ke depan). |

## Menjalankan project

### 1. Buat project Supabase

Buat project baru di [supabase.com](https://supabase.com), lalu buka **SQL Editor** dan jalankan isi file `supabase/migrations/20260925000000_init.sql`. File ini membuat semua tabel, trigger, aturan RLS, dan bucket `news-images`.

### 2. Atur login

Di **Authentication → Sign In / Providers**, matikan *Allow new users to sign up* supaya hanya admin yang bisa membuat akun. Lalu buat akunmu di **Authentication → Users → Add user** (centang *Auto Confirm User*).

Jadikan akun itu admin lewat SQL Editor:

```sql
update public.profiles set role = 'admin', full_name = 'Nama Kamu'
where id = (select id from auth.users where email = 'email@kamu.com');
```

Akun penulis lain dibuat dengan cara yang sama, lalu perannya diubah ke `writer` atau `editor`.

### 3. Isi data contoh (opsional)

Jalankan `supabase/seed.sql` di SQL Editor. Isinya enam kategori, beberapa tag, dan tujuh berita fiktif berbahasa Indonesia atas nama akun admin tadi.

### 4. Jalankan secara lokal

```bash
cp .env.example .env.local   # isi URL dan publishable key dari Project Settings → API
npm install
npm run dev
```

Buka `http://localhost:3000`, dan dashboard redaksi di `http://localhost:3000/masuk`.

### 5. Deploy ke Vercel

Import repository ke Vercel dan tambahkan dua environment variable dari `.env.example`. Tidak ada pengaturan lain yang diperlukan.

## Struktur folder

```
supabase/
  migrations/        skema database, RLS, dan bucket Storage
  seed.sql           data contoh
src/
  app/
    (public)/        beranda, /berita/[slug], /kategori/[slug] (ISR)
    masuk/           halaman dan action login
    dashboard/       halaman redaksi dan server action
  components/
    news/            komponen tampilan berita
    dashboard/       formulir berita dan pengunggah foto
    site/            header dan footer
    motion/          animasi GSAP dan smooth scroll Lenis
  lib/               util murni: format tanggal, slug, peran, client Supabase
  services/          semua akses data (query publik, redaksi, unggah media)
  types/             tipe domain (camelCase) dan bentuk baris database (snake_case)
  validation/        skema Zod untuk input formulir
  proxy.ts           memperbarui sesi dan menjaga /dashboard
```

Aturan yang dipakai di seluruh kode:

- Komponen tidak pernah memanggil Supabase langsung; semua lewat `services/`.
- Baris database (snake_case) diubah ke tipe domain (camelCase) di `services/mappers.ts`, jadi komponen tidak bergantung pada nama kolom.
- Halaman publik memakai client tanpa cookie (`lib/supabase/public.ts`) supaya tetap statis. Dashboard memakai client dengan sesi (`lib/supabase/server.ts`).
- Validasi input dilakukan dua kali: Zod di server action untuk pesan yang ramah, dan constraint + RLS di database sebagai pengaman terakhir.

## Skema database

```
auth.users 1──1 profiles 1──* articles *──1 categories
                   │             │  └──*  article_tags *──1 tags
                   │             └──0..1 media (sampul)
                   └──* media (pengunggah)
```

Semua tabel sudah dalam bentuk normal ketiga: kategori, tag, gambar, dan penulis disimpan di tabelnya sendiri dan dirujuk lewat foreign key. Tanggal terbit dan `updated_at` diisi otomatis oleh trigger.

## Tentang unggah gambar

Alur di `services/media.ts`:

1. File dicek (JPG/PNG/WebP, maksimal 15 MB).
2. Dikompres di browser menjadi dua ukuran lewat `lib/image/compress.ts`. Browser yang belum bisa membuat WebP otomatis mendapat JPEG.
3. Diunggah ke `news-images/{user_id}/{tahun}/{bulan}/{uuid}.webp`.
4. Metadatanya (deskripsi gambar, keterangan, kredit foto, ukuran) dicatat di tabel `media`. Jika langkah ini gagal, file yang sudah terunggah dihapus lagi.

Bucket dibatasi 2 MB dan hanya menerima WebP/JPEG, jadi file mentah yang lolos dari kompresi akan ditolak oleh Supabase. Karena gambar sudah optimal, `next.config.ts` mematikan optimasi gambar Vercel agar tidak memakan kuota paket Hobby.

## Pengembangan berikutnya

- Galeri foto di dalam berita: tambah tabel `article_media (article_id, media_id, position)`.
- Halaman tag dan pencarian.
- Tipe database otomatis: `npx supabase gen types typescript --project-id <id> > src/types/supabase.ts`, lalu pakai sebagai generic di client Supabase.
