"use client";

import type { ButtonHTMLAttributes } from "react";
import { useFormStatus } from "react-dom";

interface PendingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Teks selama formulir diproses, mis. "Menerbitkan...". */
  pendingText: string;
  /** Bila diisi, pengguna diminta konfirmasi dulu sebelum formulir dikirim. */
  confirmMessage?: string;
}

/** Tombol submit yang menampilkan status proses dan bisa meminta konfirmasi. */
export function PendingButton({
  pendingText,
  confirmMessage,
  children,
  disabled,
  onClick,
  ...buttonProps
}: PendingButtonProps) {
  const { pending, data } = useFormStatus();
  // Beberapa tombol bisa berada di satu formulir; hanya tombol yang ditekan yang berganti teks.
  const isThisButton =
    pending && (!buttonProps.name || data?.get(buttonProps.name) === String(buttonProps.value));

  return (
    <button
      type="submit"
      {...buttonProps}
      disabled={pending || disabled}
      aria-busy={isThisButton}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
    >
      {isThisButton ? pendingText : children}
    </button>
  );
}