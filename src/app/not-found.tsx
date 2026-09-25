import Link from "next/link";

export default function NotFound() {
  return (
    <main className="page" style={{ paddingBlock: "4rem", display: "grid", gap: "1rem" }}>
      <h1>Halaman tidak ditemukan</h1>
      <p>Berita ini mungkin sudah dipindahkan atau tautannya salah ketik.</p>
      <Link href="/">Kembali ke beranda</Link>
    </main>
  );
}
