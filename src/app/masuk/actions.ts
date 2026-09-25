"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.email("Format email tidak valid."),
  password: z.string().min(6, "Kata sandi minimal 6 karakter."),
  next: z.string().optional(),
});

export interface LoginState {
  message: string | null;
}

export async function signInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: parsed.error.issues[0].message };

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) return { message: "Email atau kata sandi salah." };

  redirect(safeRedirectPath(parsed.data.next));
}

/** Hanya izinkan kembali ke halaman dashboard agar tidak bisa dipakai untuk open redirect. */
function safeRedirectPath(next: string | undefined): string {
  return next?.startsWith("/dashboard") ? next : "/dashboard";
}
