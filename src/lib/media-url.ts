import { env } from "@/lib/env";

export const NEWS_IMAGE_BUCKET = "news-images";

export function publicImageUrl(storagePath: string): string {
  return `${env.supabaseUrl}/storage/v1/object/public/${NEWS_IMAGE_BUCKET}/${storagePath}`;
}
