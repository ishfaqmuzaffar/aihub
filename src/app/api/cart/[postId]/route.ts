import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = await prisma.post.findUnique({ where: { id: params.postId } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  if (post.isFree) return NextResponse.json({ error: "Free items don't need cart" }, { status: 400 });
  if (post.authorId === session.user.id) return NextResponse.json({ error: "Cannot buy your own item" }, { status: 400 });

  const alreadyPurchased = await prisma.purchase.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: params.postId } },
  });
  if (alreadyPurchased) return NextResponse.json({ error: "Already purchased" }, { status: 400 });

  const existing = await prisma.cartItem.findUnique({
    where: { userId_postId: { userId: session.user.id, postId: params.postId } },
  });
  if (existing) {
    await prisma.cartItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ inCart: false });
  }

  await prisma.cartItem.create({ data: { userId: session.user.id, postId: params.postId } });
  return NextResponse.json({ inCart: true });
}

export async function DELETE(_req: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await prisma.cartItem.deleteMany({ where: { userId: session.user.id, postId: params.postId } });
  return NextResponse.json({ success: true });
}
