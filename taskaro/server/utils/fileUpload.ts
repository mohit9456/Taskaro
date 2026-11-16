import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadProfileImage(file: any): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const originalName = file.name || "avatar.jpg";
  const ext = path.extname(originalName) || ".jpg";
  const safeBase = originalName
    .replace(ext, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 20);

  const fileName = `${Date.now()}-${safeBase}${ext}`;
  const filePath = path.join(uploadDir, fileName);

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}
