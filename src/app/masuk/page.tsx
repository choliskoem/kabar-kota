import type { Metadata } from "next";
import Link from "next/link";
import { signOutAction } from "@/app/dashboard/actions";
import { siteConfig } from "@/lib/site";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

export const metadata: Metadata = { title: "Masuk redaksi" };

interface LoginPageProps {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next, error } = await searchParams;
  const hasNoAccess = error === "akses";

  return (
    <main className={styles.page}>
      <Link href="/" className={styles.wordmark}>
        {siteConfig.name}
      </Link>
      <h1 className={styles.title}>Masuk redaksi</h1>

      {hasNoAccess ? (
        <>
          <p role="alert" className={styles.error}>
            Akun ini belum punya akses redaksi. Minta admin mengubah peranmu, atau masuk dengan akun lain.
          </p>
          <form action={signOutAction}>
            <button type="submit" className={styles.button}>
              Keluar dan ganti akun
            </button>
          </form>
        </>
      ) : (
        <>
          <p className={styles.lede}>Untuk penulis dan editor. Akun dibuat oleh admin.</p>
          <LoginForm next={next} />
        </>
      )}
    </main>
  );
}