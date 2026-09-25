"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { flashKeyForStatus } from "@/lib/flash";
import { canPublish } from "@/lib/roles";
import { createServerSupabase } from "@/lib/supabase/server";
import { requireStaff } from "@/services/auth";
import { changeArticleStatus, deleteArticle, saveArticle } from "@/services/editorial";
import type { ArticleStatus } from "@/types/domain";
import { articleInputSchema, articleStatusSchema, toFieldErrors } from "@/validation/article";
import type { ArticleFormState } from "@/validation/article-form-state";

const PUBLISH_DENIED = "Hanya editor yang bisa menerbitkan berita. Kirim ke editor untuk ditinjau.";

export async function saveArticleAction(
  _previous: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const profile = await requireStaff();
  const parsed = articleInputSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { message: "Ada isian yang perlu diperbaiki.", fieldErrors: toFieldErrors(parsed.error) };
  }
  if (parsed.data.status === "published" && !canPublish(profile.role)) {
    return { message: PUBLISH_DENIED, fieldErrors: {} };
  }

  try {
    await saveArticle(parsed.data, profile);
  } catch (error) {
    return { message: (error as Error).message, fieldErrors: {} };
  }

  revalidateNewsPages();
  redirect(`/dashboard?pesan=${flashKeyForStatus(parsed.data.status)}`);
}

export async function changeStatusAction(articleId: string, status: ArticleStatus): Promise<void> {
  const profile = await requireStaff();
  const nextStatus = articleStatusSchema.parse(status);
  if (nextStatus === "published" && !canPublish(profile.role)) throw new Error(PUBLISH_DENIED);

  await changeArticleStatus(articleId, nextStatus);
  revalidateNewsPages();
  revalidatePath("/dashboard");
}

export async function deleteArticleAction(articleId: string): Promise<void> {
  await requireStaff();
  await deleteArticle(articleId);
  revalidateNewsPages();
  revalidatePath("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/masuk");
}

/** Halaman berita publik memakai ISR, jadi perlu disegarkan setelah ada perubahan. */
function revalidateNewsPages(): void {
  revalidatePath("/");
  revalidatePath("/berita/[slug]", "page");
  revalidatePath("/kategori/[slug]", "page");
  revalidatePath("/tag/[slug]", "page");
}