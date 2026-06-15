import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { cn, formatCount, getAvatarColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CreatorsPage() {
  const creators = await prisma.user.findMany({
    where: { posts: { some: { published: true } } },
    orderBy: { posts: { _count: "desc" } },
    take: 48,
    include: {
      _count: { select: { posts: true, followers: true } },
      posts: {
        where: { published: true },
        take: 3,
        orderBy: { createdAt: "desc" },
        select: { type: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-semibold mb-1">Creators</h1>
        <p className="text-muted-foreground mb-8">People building with AI</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {creators.map((creator) => {
            const color = getAvatarColor(creator.name || "U");
            return (
              <Link
                key={creator.id}
                href={`/creators/${creator.username || creator.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 transition-all"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-lg flex-shrink-0",
                    color
                  )}
                >
                  {creator.image ? (
                    <img src={creator.image} alt={creator.name || ""} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    (creator.name || "U")[0].toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{creator.name}</p>
                  {creator.username && (
                    <p className="text-xs text-muted-foreground">@{creator.username}</p>
                  )}
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatCount(creator._count.posts)} posts
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCount(creator._count.followers)} followers
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
