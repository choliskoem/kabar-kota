-- =====================================================================
-- Data contoh Kabar Kota (semua berita di bawah ini fiktif).
-- Jalankan SETELAH kamu membuat akun dan menjadikannya admin (lihat README),
-- karena setiap artikel butuh penulis.
-- =====================================================================

insert into public.categories (name, slug, color, position) values
  ('Kota',      'kota',      '#E8A200', 1),
  ('Politik',   'politik',   '#2F5BEA', 2),
  ('Ekonomi',   'ekonomi',   '#0E9F6E', 3),
  ('Olahraga',  'olahraga',  '#F2622E', 4),
  ('Hiburan',   'hiburan',   '#D6336C', 5),
  ('Teknologi', 'teknologi', '#7A4DE0', 6)
on conflict (slug) do nothing;

insert into public.tags (name, slug) values
  ('Transportasi', 'transportasi'),
  ('Anak Muda', 'anak-muda'),
  ('UMKM', 'umkm'),
  ('Sepak Bola', 'sepak-bola'),
  ('Musik', 'musik'),
  ('Startup', 'startup')
on conflict (slug) do nothing;

do $$
declare
  v_author uuid;
begin
  select id into v_author
  from public.profiles
  where role in ('admin', 'editor')
  order by created_at
  limit 1;

  if v_author is null then
    raise notice 'Belum ada akun editor/admin. Buat akun dulu, lalu jalankan seed ini lagi.';
    return;
  end if;

  insert into public.articles
    (title, slug, excerpt, body, category_id, author_id, status, published_at)
  select s.title, s.slug, s.excerpt, s.body, c.id, v_author, 'published', now() - s.age
  from (values
    (
      'Rute Bus Malam Baru Mulai Beroperasi, Warga Pulang Kerja Tak Lagi Bingung',
      'rute-bus-malam-baru-mulai-beroperasi',
      'Tiga rute bus malam resmi berjalan hingga pukul 01.00, menghubungkan pusat kota dengan kawasan perumahan di pinggiran.',
      $b$Mulai pekan ini, tiga rute bus malam resmi beroperasi hingga pukul 01.00. Rute baru ini menghubungkan terminal pusat dengan tiga kawasan perumahan terpadat di pinggiran kota.

Dinas Perhubungan menyebut uji coba akan berlangsung selama tiga bulan. Jumlah penumpang tiap rute akan dievaluasi sebelum jadwal dibuat permanen.

Bagi pekerja sif malam dan pegawai kafe, rute ini jadi pilihan yang lebih murah dibanding ojek daring. Tarifnya sama dengan bus siang dan bisa dibayar dengan kartu uang elektronik.$b$,
      'kota', interval '40 minutes'
    ),
    (
      'Ruang Kreatif di Bekas Gudang Stasiun Dibuka untuk Komunitas Anak Muda',
      'ruang-kreatif-bekas-gudang-stasiun-dibuka',
      'Gudang tua di sisi timur stasiun kini disulap jadi ruang kerja bersama, studio rekaman kecil, dan lapangan skateboard.',
      $b$Gudang tua di sisi timur stasiun yang lama tidak terpakai kini dibuka sebagai ruang kreatif. Isinya ruang kerja bersama, studio rekaman kecil, dan area skateboard beratap.

Pengelola menyebut komunitas bisa meminjam ruangan secara gratis dengan mendaftar lewat formulir daring. Prioritas diberikan untuk kegiatan yang terbuka untuk umum.

Pada hari pembukaan, belasan komunitas mulai dari fotografi hingga desain grafis mengisi jadwal lokakarya untuk sebulan ke depan.$b$,
      'kota', interval '3 hours'
    ),
    (
      'DPRD Kota Gelar Rapat Dengar Pendapat soal Tarif Parkir Digital',
      'dprd-rapat-dengar-pendapat-tarif-parkir-digital',
      'Warga dan juru parkir diundang menyampaikan masukan sebelum sistem parkir tanpa uang tunai diterapkan di seluruh kota.',
      $b$DPRD kota menggelar rapat dengar pendapat untuk membahas rencana penerapan parkir tanpa uang tunai di seluruh ruas jalan utama.

Sejumlah perwakilan juru parkir meminta kepastian soal pembagian hasil setelah sistem digital berlaku. Sementara itu, perwakilan mahasiswa mengusulkan tarif khusus untuk sepeda motor di kawasan kampus.

Rapat lanjutan dijadwalkan bulan depan dengan menghadirkan penyedia sistem pembayaran.$b$,
      'politik', interval '6 hours'
    ),
    (
      'Bazar UMKM Akhir Pekan Catat Transaksi Tertinggi Tahun Ini',
      'bazar-umkm-akhir-pekan-transaksi-tertinggi',
      'Lebih dari dua ratus pelapak ikut serta, dengan jajanan kekinian dan produk fesyen lokal jadi yang paling laris.',
      $b$Bazar UMKM di alun-alun kota akhir pekan lalu mencatat transaksi tertinggi sepanjang tahun ini. Lebih dari dua ratus pelapak ikut serta selama tiga hari penyelenggaraan.

Jajanan kekinian dan produk fesyen lokal menjadi yang paling banyak dicari pengunjung. Sebagian besar transaksi dilakukan lewat pembayaran kode QR.

Panitia berencana menggelar bazar serupa setiap bulan dengan tema yang berganti-ganti.$b$,
      'ekonomi', interval '1 day'
    ),
    (
      'Tim Futsal Pelajar Kota Melaju ke Final Tingkat Provinsi',
      'tim-futsal-pelajar-melaju-ke-final-provinsi',
      'Kemenangan adu penalti di semifinal membawa tim pelajar kota ke laga puncak untuk pertama kalinya dalam lima tahun.',
      $b$Tim futsal pelajar kota memastikan tempat di final tingkat provinsi setelah menang adu penalti di semifinal. Ini pertama kalinya dalam lima tahun tim kota mencapai laga puncak.

Pelatih tim menyebut kunci kemenangan ada pada latihan fisik rutin selama dua bulan terakhir. Penjaga gawang tim menggagalkan dua tendangan penalti lawan.

Laga final akan digelar di gelanggang olahraga provinsi dan disiarkan langsung lewat kanal video resmi penyelenggara.$b$,
      'olahraga', interval '1 day 5 hours'
    ),
    (
      'Festival Musik Tepi Sungai Umumkan Deretan Band Lokal',
      'festival-musik-tepi-sungai-umumkan-band-lokal',
      'Separuh pengisi acara tahun ini adalah band baru dari kota sendiri yang terpilih lewat audisi terbuka.',
      $b$Festival musik tepi sungai tahun ini mengumumkan deretan pengisi acaranya. Separuh dari mereka adalah band baru asal kota yang terpilih lewat audisi terbuka.

Penyelenggara menyiapkan dua panggung, satu di dermaga dan satu di taman kota. Tiket dijual dalam dua gelombang, dengan harga khusus bagi pelajar yang menunjukkan kartu pelajar.

Selain musik, festival juga menghadirkan pasar kerajinan dan area makanan dari pelaku usaha setempat.$b$,
      'hiburan', interval '2 days'
    ),
    (
      'Mahasiswa Kota Rancang Aplikasi Pantau Antrean Puskesmas',
      'mahasiswa-rancang-aplikasi-pantau-antrean-puskesmas',
      'Aplikasi buatan tim mahasiswa ini menampilkan nomor antrean secara langsung, sehingga warga bisa datang tepat waktu.',
      $b$Tim mahasiswa dari salah satu kampus di kota merancang aplikasi untuk memantau antrean puskesmas secara langsung dari ponsel.

Dengan aplikasi ini, warga bisa mengambil nomor dari rumah dan datang ketika giliran mereka sudah dekat. Uji coba dilakukan di dua puskesmas selama sebulan.

Tim berharap aplikasi ini bisa dipakai di seluruh puskesmas kota setelah uji coba selesai dievaluasi.$b$,
      'teknologi', interval '3 days'
    )
  ) as s (title, slug, excerpt, body, category_slug, age)
  join public.categories c on c.slug = s.category_slug
  on conflict (slug) do nothing;

  insert into public.article_tags (article_id, tag_id)
  select a.id, t.id
  from (values
    ('rute-bus-malam-baru-mulai-beroperasi', 'transportasi'),
    ('ruang-kreatif-bekas-gudang-stasiun-dibuka', 'anak-muda'),
    ('dprd-rapat-dengar-pendapat-tarif-parkir-digital', 'transportasi'),
    ('bazar-umkm-akhir-pekan-transaksi-tertinggi', 'umkm'),
    ('tim-futsal-pelajar-melaju-ke-final-provinsi', 'anak-muda'),
    ('festival-musik-tepi-sungai-umumkan-band-lokal', 'musik'),
    ('festival-musik-tepi-sungai-umumkan-band-lokal', 'anak-muda'),
    ('mahasiswa-rancang-aplikasi-pantau-antrean-puskesmas', 'startup')
  ) as m (article_slug, tag_slug)
  join public.articles a on a.slug = m.article_slug
  join public.tags t on t.slug = m.tag_slug
  on conflict do nothing;
end;
$$;
