import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  const comment = await prisma.comment.create({
    data: {
      content: content.trim(),
      userId: session.user.id,
      postId: params.id,
    },
    include: {
      user: { select: { id: true, name: true, username: true, image: true } },
    },
  });

  return NextResponse.json(comment, { status: 201 });
}
