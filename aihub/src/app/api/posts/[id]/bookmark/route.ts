import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.bookmark.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: params.id } },
  });

  if (existing) {
    await prisma.bookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  } else {
    await prisma.bookmark.create({ data: { userId: session.user.id, postId: params.id } });
    return NextResponse.json({ bookmarked: true });
  }
}
