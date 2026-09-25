import Link from "next/link";
import { roleLabel } from "@/lib/labels";
import { siteConfig } from "@/lib/site";
import { requireStaff } from "@/services/auth";
import { signOutAction } from "./actions";
import styles from "@/components/dashboard/dashboard.module.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={`page ${styles.topbarInner}`}>
          <Link href="/dashboard" className={styles.brand}>
            {siteConfig.name} <span>Redaksi</span>
          </Link>
          <nav className={styles.topnav} aria-label="Menu redaksi">
            <Link href="/dashboard/artikel/baru">Tulis berita</Link>
            <Link href="/">Lihat situs</Link>
          </nav>
          <div className={styles.account}>
            <span>
              {profile.fullName || "Tanpa nama"} ({roleLabel[profile.role]})
            </span>
            <form action={signOutAction}>
              <button type="submit" className={styles.linkButton}>
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className={`page ${styles.main}`}>{children}</main>
    </div>
  );
}
