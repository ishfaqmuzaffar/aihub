import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) return NextResponse.json({ error: "No files provided" }, { status: 400 });
    if (files.length > MAX_FILES) return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const urls: string[] = [];

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF allowed.` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File "${file.name}" exceeds 5MB limit` }, { status: 400 });
      }

      const ext = file.type.split("/")[1].replace("jpeg", "jpg");
      const filename = `${randomUUID()}.${ext}`;
      const bytes = await file.arrayBuffer();
      await writeFile(join(uploadDir, filename), Buffer.from(bytes));
      urls.push(`/uploads/${filename}`);
    }

    return NextResponse.json({ urls }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
