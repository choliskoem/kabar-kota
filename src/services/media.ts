// Dipakai dari browser: kompres → unggah ke Storage → catat di tabel media.
import { compressImage } from "@/lib/image/compress";
import { NEWS_IMAGE_BUCKET } from "@/lib/media-url";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { toMedia } from "@/services/mappers";
import type { MediaRow } from "@/types/database-rows";
import type { Media } from "@/types/domain";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SOURCE_BYTES = 15 * 1024 * 1024;
const LARGE_WIDTH = 1600;
const THUMB_WIDTH = 480;

export interface ImageDetails {
  altText: string;
  caption: string;
  credit: string;
}

export function validateSourceImage(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return "Format gambar harus JPG, PNG, atau WebP.";
  if (file.size > MAX_SOURCE_BYTES) return "Ukuran gambar maksimal 15 MB.";
  return null;
}

export async function uploadNewsImage(file: File, details: ImageDetails): Promise<Media> {
  const validationError = validateSourceImage(file);
  if (validationError) throw new Error(validationError);

  const supabase = createBrowserSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sesi berakhir. Silakan masuk lagi.");

  const [large, thumb] = await Promise.all([
    compressImage(file, LARGE_WIDTH),
    compressImage(file, THUMB_WIDTH),
  ]);

  const basePath = buildBasePath(user.id);
  const storagePath = `${basePath}.${large.extension}`;
  const thumbPath = `${basePath}-thumb.${thumb.extension}`;
  const storage = supabase.storage.from(NEWS_IMAGE_BUCKET);

  const uploads = await Promise.all([
    storage.upload(storagePath, large.blob, { contentType: large.blob.type, cacheControl: "31536000" }),
    storage.upload(thumbPath, thumb.blob, { contentType: thumb.blob.type, cacheControl: "31536000" }),
  ]);
  const uploadError = uploads.find((result) => result.error)?.error;
  if (uploadError) {
    await storage.remove([storagePath, thumbPath]);
    throw new Error(`Gagal mengunggah gambar: ${uploadError.message}`);
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      storage_path: storagePath,
      thumb_path: thumbPath,
      width: large.width,
      height: large.height,
      alt_text: details.altText.trim(),
      caption: details.caption.trim() || null,
      credit: details.credit.trim() || null,
      uploaded_by: user.id,
    })
    .select("id, storage_path, thumb_path, width, height, alt_text, caption, credit")
    .single();

  if (error) {
    await storage.remove([storagePath, thumbPath]);
    throw new Error(`Gagal menyimpan data gambar: ${error.message}`);
  }
  return toMedia(data as MediaRow);
}

/** {user_id}/{tahun}/{bulan}/{uuid} — folder pertama wajib user id (dicek policy Storage). */
function buildBasePath(userId: string): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${userId}/${now.getFullYear()}/${month}/${crypto.randomUUID()}`;
}
