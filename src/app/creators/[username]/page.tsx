import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { CreatorProfile } from "./CreatorProfile";

export const dynamic = "force-dynamic";

export default async function CreatorPage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: params.username }, { id: params.username }],
    },
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { id: true, name: true, username: true, image: true } },
          _count: { select: { likes: true, comments: true, remixes: true } },
          ...(session && {
            likes: { where: { userId: session.user.id }, select: { userId: true } },
            bookmarks: { where: { userId: session.user.id }, select: { userId: true } },
          }),
        },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
      ...(session && {
        followers: {
          where: { followerId: session.user.id },
          select: { followerId: true },
        },
      }),
    },
  });

  if (!user) notFound();

  const totalLikes = await prisma.like.count({
    where: { post: { authorId: user.id } },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CreatorProfile user={user as any} session={session} totalLikes={totalLikes} />
    </div>
  );
}
