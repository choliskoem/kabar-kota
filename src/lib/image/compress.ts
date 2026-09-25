export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  extension: "webp" | "jpg";
}

/**
 * Mengecilkan gambar di browser dan mengubahnya ke WebP.
 * Browser yang belum bisa membuat WebP (Safari lama) otomatis mendapat JPEG.
 */
export async function compressImage(
  file: File,
  maxWidth: number,
  quality = 0.8,
): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Browser ini tidak mendukung pengolahan gambar.");
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const webp = await canvasToBlob(canvas, "image/webp", quality);
  if (webp?.type === "image/webp") return { blob: webp, width, height, extension: "webp" };

  const jpeg = await canvasToBlob(canvas, "image/jpeg", quality);
  if (!jpeg) throw new Error("Gambar gagal diproses. Coba file lain.");
  return { blob: jpeg, width, height, extension: "jpg" };
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}
