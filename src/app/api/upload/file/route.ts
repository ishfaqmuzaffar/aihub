import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".zip",".json",".csv",".pdf",".txt",".md",".py",".js",".ts",".jsx",".tsx",".html",".xml",".yaml",".yml",".xlsx",".docx"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File exceeds 100MB limit" }, { status: 400 });

    const originalName = file.name;
    const ext = "." + originalName.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) return NextResponse.json({ error: `File type not allowed` }, { status: 400 });

    const uploadDir = join(process.cwd(), "public", "uploads", "files");
    await mkdir(uploadDir, { recursive: true });

    const filename = `${randomUUID()}${ext}`;
    const bytes = await file.arrayBuffer();
    await writeFile(join(uploadDir, filename), Buffer.from(bytes));

    return NextResponse.json({ fileUrl: `/uploads/files/${filename}`, fileName: originalName, fileSize: file.size }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
