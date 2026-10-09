import type { ArticleField } from "@/validation/article";

export type { ArticleField };

export interface ArticleFormState {
  message: string | null;
  fieldErrors: Partial<Record<ArticleField, string>>;
}

export const initialArticleFormState: ArticleFormState = { message: null, fieldErrors: {} };