"use client";

import { useActionState } from "react";
import { signInAction, type LoginState } from "./actions";
import styles from "./login.module.css";

const initialState: LoginState = { message: null };

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);
  const message = state.message;

  return (
    <form action={formAction} className={styles.form}>
      <input type="hidden" name="next" value={next ?? ""} />
      <label className={styles.field}>
        <span>Email</span>
        <input type="email" name="email" autoComplete="email" required />
      </label>
      <label className={styles.field}>
        <span>Kata sandi</span>
        <input type="password" name="password" autoComplete="current-password" required />
      </label>
      {message && (
        <p role="alert" className={styles.error}>
          {message}
        </p>
      )}
      <button type="submit" disabled={isPending} className={styles.button}>
        {isPending ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
