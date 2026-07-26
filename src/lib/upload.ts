// Client-side image compression before upload
export async function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Resize if needed
      let w = img.width;
      let h = img.height;
      if (w > maxWidth) {
        h = (h * maxWidth) / w;
        w = maxWidth;
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
        } else {
          reject(new Error("Compression failed"));
        }
      }, "image/jpeg", quality);
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadPhoto(file: File, folder = "photos"): Promise<string> {
  // Compress first
  const compressed = await compressImage(file);
  const fd = new FormData();
  fd.append("file", compressed);
  fd.append("folder", folder);
  const r = await fetch("/api/upload", { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Upload failed");
  return d.url;
}
