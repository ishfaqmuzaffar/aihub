import { Navbar } from "@/components/layout/Navbar";
import { DiscoverFeed } from "./DiscoverFeed";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default async function DiscoverPage({ searchParams }: { searchParams: { type?: string; sort?: string; q?: string; featured?: string } }) {
  const session = await getServerSession(authOptions);
  const type = searchParams.type?.toUpperCase();
  const sort = searchParams.sort || "trending";
  const q = searchParams.q;
  const featuredOnly = searchParams.featured === "true";

  const validTypes = ["APP", "WORKFLOW", "AGENT", "TEMPLATE", "PLUGIN", "DATASET"];
  const typeFilter = type && validTypes.includes(type) ? type : undefined;

  const orderBy =
    sort === "new"   ? { createdAt: "desc" as const } :
    sort === "top"   ? { salesCount: "desc" as const } :
    sort === "price" ? { price: "asc" as const } :
                       { viewCount: "desc" as const };

  const posts = await prisma.post.findMany({
    where: {
      published: true, status: "APPROVED",
      ...(typeFilter && { type: typeFilter as any }),
      ...(featuredOnly && { featured: true }),
      ...(q && { OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { tags: { has: q.toLowerCase() } },
        { toolsUsed: { has: q } },
      ]}),
    },
    orderBy,
    take: 48,
    include: {
      author: { select: { id: true, name: true, username: true, image: true, badge: true } },
      _count: { select: { likes: true, comments: true, remixes: true, purchases: true } },
      ...(session && {
        likes: { where: { userId: session.user.id }, select: { userId: true } },
        bookmarks: { where: { userId: session.user.id }, select: { userId: true } },
      }),
    },
  });

  const total = await prisma.post.count({ where: { published: true, status: "APPROVED", ...(typeFilter && { type: typeFilter as any }) } });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8"><div className="h-96 animate-pulse bg-gray-200 rounded-xl" /></div>}>
        <DiscoverFeed posts={posts as any} total={total} />
      </Suspense>
    </div>
  );
}
