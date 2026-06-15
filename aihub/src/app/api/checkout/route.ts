import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { postIds } = await req.json();
    if (!postIds || postIds.length === 0) return NextResponse.json({ error: "No items to purchase" }, { status: 400 });

    const posts = await prisma.post.findMany({
      where: { id: { in: postIds }, published: true },
    });

    if (posts.length !== postIds.length) return NextResponse.json({ error: "Some items not found" }, { status: 400 });

    const purchases = [];
    for (const post of posts) {
      const alreadyOwned = await prisma.purchase.findUnique({
        where: { userId_postId: { userId: session.user.id, postId: post.id } },
      });
      if (alreadyOwned) continue;

      const purchase = await prisma.purchase.create({
        data: { userId: session.user.id, postId: post.id, price: post.price || 0 },
      });
      purchases.push(purchase);

      await prisma.post.update({
        where: { id: post.id },
        data: { salesCount: { increment: 1 } },
      });

      if (post.price && post.price > 0) {
        await prisma.user.update({
          where: { id: post.authorId },
          data: {
            totalSales: { increment: 1 },
            totalEarnings: { increment: post.price * 0.8 },
          },
        });
      }
    }

    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id, postId: { in: postIds } },
    });

    return NextResponse.json({ success: true, purchases: purchases.length });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Checkout failed" }, { status: 500 });
  }
}
