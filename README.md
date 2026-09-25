# Kabar Kota

Portal berita kota untuk pembaca muda. Dibangun dengan **Next.js 16 (App Router)** dan **Supabase** (Postgres, Auth, Storage), di-deploy ke **Vercel**.

## Fitur

- Beranda bergaya poster: berita utama dengan blok warna kategori, jalur "Terkini", hashtag "Lagi rame", dan baris berita per kategori yang bisa di-swipe di HP. Dirender statis (ISR) sehingga cepat.
- Halaman hashtag (`/tag/[slug]`), estimasi waktu baca, bar progres membaca, tombol Bagikan (membuka menu share bawaan HP), dan rekomendasi "Baca juga".
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

Buat project baru di [supabase.com](https://supabase.com), lalu buka **SQL Editor** dan jalankan file migrasi **secara berurutan**:

1. `supabase/migrations/20260925000000_init.sql` membuat semua tabel, trigger, aturan RLS, dan bucket `news-images`.
2. `supabase/migrations/20260926000000_genz_refresh.sql` menambahkan fungsi waktu baca, view `trending_tags`, dan warna kategori baru. Jalankan **setelah** `seed.sql` bila kamu memakai data contoh, supaya warna kategorinya ikut diperbarui.

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
    (public)/        beranda, /berita/[slug], /kategori/[slug], /tag/[slug] (ISR)
    masuk/           halaman dan action login
    dashboard/       halaman redaksi dan server action
  components/
    news/            komponen tampilan berita (poster, stiker, jalur terkini, baris swipe)
    article/         bar progres baca dan tombol bagikan
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

Waktu baca (`reading_minutes`) dan tag yang sedang ramai (`trending_tags`) dihitung saat dibaca, bukan disimpan sebagai kolom, jadi tidak ada data ganda yang bisa tidak sinkron.

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
- Pencarian berita.
- Tipe database otomatis: `npx supabase gen types typescript --project-id <id> > src/types/supabase.ts`, lalu pakai sebagai generic di client Supabase.

## Identitas visual

- **Jalur kota:** setiap kategori punya warna jalur sendiri (seperti rute angkot/transit), dipakai di garis header, halte "Terkini", dan blok poster.
- **Stiker:** kategori, hashtag, logo, dan tombol Bagikan tampil sebagai stiker bergaris tebal yang sedikit miring. Warna teks di atas warna kategori dipilih otomatis agar kontrasnya terbaca (`lib/color.ts`).
- **Huruf:** Bricolage Grotesque versi padat untuk judul, Plus Jakarta Sans untuk teks.
- **Gerak:** hanya satu animasi otomatis (poster muncul saat beranda dibuka). Semua animasi mati bila perangkat memakai pengaturan "kurangi gerakan".
