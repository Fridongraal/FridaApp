/**
 * Utility to process and compress images to lightweight Base64 Data URLs.
 * Automatically resizes large images to maintain fast local database performance
 * and keep JSON/CSV backups compact and portable.
 */
export async function compressImageToDataUrl(
  file: File | Blob,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within max dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // If file is not PNG or WebP, fill white background before conversion
        const hasAlpha = file.type === "image/png" || file.type === "image/webp";
        if (!hasAlpha) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP for high compression, fallback to JPEG
        try {
          const webpDataUrl = canvas.toDataURL("image/webp", quality);
          if (webpDataUrl.startsWith("data:image/webp")) {
            resolve(webpDataUrl);
            return;
          }
        } catch {
          // WebP not supported, fallback below
        }

        const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(jpegDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
