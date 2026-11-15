// utils/fileUpload.js
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadProfileImage(file) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `${Date.now()}-${file.name}`;
  const filePath = path.join(uploadDir, fileName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  return `${process.env.NEXT_PUBLIC_HOST}/uploads/${fileName}`;
}
