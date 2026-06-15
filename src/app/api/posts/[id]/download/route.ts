import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createReadStream } from "fs";
import { join } from "path";
import { stat } from "fs/promises";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, fileUrl: true, fileName: true, isFree: true, authorId: true },
  });

  if (!post || !post.fileUrl) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const isAuthor = post.authorId === session.user.id;
  const isAdmin = session.user.isAdmin;

  if (!post.isFree && !isAuthor && !isAdmin) {
    const purchase = await prisma.purchase.findUnique({
      where: { userId_postId: { userId: session.user.id, postId: params.id } },
    });
    if (!purchase) return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const filePath = join(process.cwd(), "public", post.fileUrl);
  try {
    const stats = await stat(filePath);
    const fileBuffer = await import("fs/promises").then(fs => fs.readFile(filePath));
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${post.fileName || "download"}"`,
        "Content-Type": "application/octet-stream",
        "Content-Length": stats.size.toString(),
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found on server" }, { status: 404 });
  }
}
