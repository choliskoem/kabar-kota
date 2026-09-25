"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./dashboard.module.css";

interface NavItem {
  href: string;
  label: string;
  isActive: (pathname: string) => boolean;
}

export function DashboardNav({ listLabel }: { listLabel: string }) {
  const pathname = usePathname();

  const items: NavItem[] = [
    {
      href: "/dashboard",
      label: listLabel,
      isActive: (path) => path === "/dashboard" || /^\/dashboard\/artikel\/(?!baru)/.test(path),
    },
    {
      href: "/dashboard/artikel/baru",
      label: "Tulis berita",
      isActive: (path) => path === "/dashboard/artikel/baru",
    },
  ];

  return (
    <nav className={styles.topnav} aria-label="Menu redaksi">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.isActive(pathname) ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
      <Link href="/" target="_blank" rel="noopener">
        Lihat situs
      </Link>
    </nav>
  );
}