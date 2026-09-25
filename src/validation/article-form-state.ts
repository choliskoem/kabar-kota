import type { ArticleInput } from "@/validation/article";

export type ArticleField = keyof ArticleInput;

export interface ArticleFormState {
  message: string | null;
  fieldErrors: Partial<Record<ArticleField, string>>;
}

export const initialArticleFormState: ArticleFormState = { message: null, fieldErrors: {} };
