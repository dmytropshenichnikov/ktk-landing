import { NextResponse } from "next/server";

export const config = {
  api: { bodyParser: false, sizeLimit: "10mb" },
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Файл завеликий. Максимум 8MB." }, { status: 413 });
    }

    // Convert to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;
    
    // Generate a unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `upload_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    
    // Try to save to filesystem (Vercel writable dir)
    let url = `/uploads/${filename}`;
    try {
      const { writeFile, mkdir } = await import("fs/promises");
      const path = await import("path");
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      await writeFile(path.join(uploadDir, filename), buffer);
      console.log("File saved to:", url);
    } catch (fsError) {
      // If filesystem write fails (Vercel), use base64 data URL
      console.log("FS write failed, using base64");
      url = dataUrl;
    }

    return NextResponse.json({ success: true, url });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
