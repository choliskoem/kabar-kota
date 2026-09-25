import Link from "next/link";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { roleLabel } from "@/lib/labels";
import { canPublish } from "@/lib/roles";
import { siteConfig } from "@/lib/site";
import { requireStaff } from "@/services/auth";
import { signOutAction } from "./actions";
import styles from "@/components/dashboard/dashboard.module.css";

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return (words[0]?.[0] ?? "?").concat(words[1]?.[0] ?? "").toUpperCase();
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireStaff();
  const displayName = profile.fullName || "Tanpa nama";

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={`page ${styles.topbarInner}`}>
          <Link href="/dashboard" className={styles.brand}>
            {siteConfig.name}
            <span>Redaksi</span>
          </Link>
          <DashboardNav listLabel={canPublish(profile.role) ? "Semua berita" : "Berita saya"} />
          <div className={styles.account}>
            <span className={styles.avatar} aria-hidden="true">
              {initialsOf(displayName)}
            </span>
            <span className={styles.accountText}>
              <strong>{displayName}</strong>
              <span>{roleLabel[profile.role]}</span>
            </span>
            <form action={signOutAction}>
              <button type="submit" className={styles.signOut}>
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