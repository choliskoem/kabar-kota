import type { ReactNode } from "react";
import styles from "./dashboard.module.css";

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** Mis. "42/160" di pojok kanan label. */
  counter?: { current: number; max: number };
  children: ReactNode;
}

export function FormField({ id, label, hint, error, counter, children }: FormFieldProps) {
  const isOverLimit = counter ? counter.current > counter.max : false;

  return (
    <div className={styles.field} data-invalid={error ? "" : undefined}>
      <div className={styles.fieldLabelRow}>
        <label htmlFor={id}>{label}</label>
        {counter && (
          <span className={styles.counter} data-over={isOverLimit ? "" : undefined} aria-live="polite">
            {counter.current}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className={styles.fieldError}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Menghubungkan input dengan teks bantuan atau pesan error-nya untuk pembaca layar. */
export function describedBy(id: string, error?: string, hasHint = false): string | undefined {
  if (error) return `${id}-error`;
  return hasHint ? `${id}-hint` : undefined;
}