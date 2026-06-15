import { Navbar } from "@/components/layout/Navbar";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HomePage } from "./HomePage";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  const [trending, featured, newest, topSellers, stats] = await Promise.all([
    prisma.post.findMany({
      where: { published: true, status: "APPROVED" },
      orderBy: { viewCount: "desc" },
      take: 9,
      include: {
        author: { select: { id: true, name: true, username: true, image: true, badge: true } },
        _count: { select: { likes: true, comments: true, remixes: true, purchases: true } },
        ...(session && { likes: { where: { userId: session.user.id }, select: { userId: true } } }),
      },
    }),
    prisma.post.findMany({
      where: { published: true, status: "APPROVED", featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        author: { select: { id: true, name: true, username: true, image: true, badge: true } },
        _count: { select: { likes: true, comments: true, remixes: true, purchases: true } },
        ...(session && { likes: { where: { userId: session.user.id }, select: { userId: true } } }),
      },
    }),
    prisma.post.findMany({
      where: { published: true, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        author: { select: { id: true, name: true, username: true, image: true, badge: true } },
        _count: { select: { likes: true, comments: true, remixes: true, purchases: true } },
        ...(session && { likes: { where: { userId: session.user.id }, select: { userId: true } } }),
      },
    }),
    prisma.user.findMany({
      where: { posts: { some: { published: true, status: "APPROVED" } } },
      orderBy: { totalSales: "desc" },
      take: 6,
      include: { _count: { select: { posts: true, followers: true } } },
    }),
    Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { published: true, status: "APPROVED" } }),
      prisma.purchase.count(),
    ]),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <HomePage
        trending={trending as any}
        featured={featured as any}
        newest={newest as any}
        topSellers={topSellers as any}
        stats={{ users: stats[0], posts: stats[1], sales: stats[2] }}
      />
    </div>
  );
}
