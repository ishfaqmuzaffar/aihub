import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      post: {
        include: { author: { select: { id: true, name: true, username: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.cartItem.deleteMany({ where: { userId: session.user.id } });
  return NextResponse.json({ success: true });
}
