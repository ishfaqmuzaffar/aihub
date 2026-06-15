import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { AccountDashboard } from "./AccountDashboard";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/account");

  const [user, posts, purchases, recentSales] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { _count: { select: { posts: true, followers: true, following: true } } },
    }),
    prisma.post.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { likes: true, comments: true, purchases: true } } },
    }),
    prisma.purchase.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { post: { include: { author: { select: { name: true, username: true } } } } },
    }),
    prisma.purchase.findMany({
      where: { post: { authorId: session.user.id } },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { post: { select: { title: true, price: true } }, user: { select: { name: true, username: true } } },
    }),
  ]);

  const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p._count.likes, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AccountDashboard
        user={user as any}
        posts={posts as any}
        purchases={purchases as any}
        recentSales={recentSales as any}
        totalViews={totalViews}
        totalLikes={totalLikes}
      />
    </div>
  );
}
