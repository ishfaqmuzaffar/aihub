import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { cn, formatPrice, timeAgo, POST_TYPE_CONFIG } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/purchases");

  const purchases = await prisma.purchase.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      post: {
        include: { author: { select: { name: true, username: true } } },
      },
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
          <span className="text-gray-400 text-sm">({purchases.length} items)</span>
        </div>
        {purchases.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't purchased anything yet</p>
            <Link href="/discover" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Browse marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((p) => {
              const cfg = POST_TYPE_CONFIG[p.post.type as keyof typeof POST_TYPE_CONFIG];
              return (
                <Link key={p.id} href={`/post/${p.postId}`}
                  className="flex items-center gap-4 bg-white rounded-xl border p-4 hover:border-primary/30 transition-all"
                >
                  <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden", !p.post.imageUrl && "bg-gray-100")}>
                    {p.post.imageUrl ? <img src={p.post.imageUrl} alt={p.post.title} className="w-full h-full object-cover" /> : <span className="text-2xl">{cfg?.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{p.post.title}</p>
                    <p className="text-sm text-gray-500">by {p.post.author.name || p.post.author.username}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full border mt-1 inline-block", cfg?.color)}>{cfg?.label}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{formatPrice(p.price)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(p.createdAt)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
