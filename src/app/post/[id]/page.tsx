import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { PostDetail } from "./PostDetail";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, username: true, image: true, bio: true } },
      _count: { select: { likes: true, comments: true, remixes: true } },
      comments: {
        orderBy: { createdAt: "desc" }, take: 20,
        include: { user: { select: { id: true, name: true, username: true, image: true } } },
      },
      remixedFrom: { include: { author: { select: { id: true, name: true, username: true } } } },
      ...(session && {
        likes: { where: { userId: session.user.id }, select: { userId: true } },
        bookmarks: { where: { userId: session.user.id }, select: { userId: true } },
        purchases: { where: { userId: session.user.id }, select: { userId: true } },
      }),
    },
  });

  if (!post) notFound();

  await prisma.post.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <PostDetail post={post as any} session={session} />
    </div>
  );
}
