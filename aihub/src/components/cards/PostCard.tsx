"use client";

import Link from "next/link";
import { Heart, Star, ShoppingCart, Eye, Zap } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { cn, formatCount, formatPrice, POST_TYPE_CONFIG, getAvatarColor } from "@/lib/utils";
import { PostWithAuthor } from "@/types";
import { useCart } from "@/components/cart/CartContext";

export function PostCard({ post }: { post: PostWithAuthor }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const config = POST_TYPE_CONFIG[post.type];
  const [liked, setLiked] = useState(post.likes?.some((l) => l.userId === session?.user?.id) ?? false);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const inCart = isInCart(post.id);
  const thumb = post.imageUrl || post.images?.[0];
  const avatarColor = getAvatarColor(post.author.name || "U");

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    if (!session) return router.push("/auth/login");
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  }

  async function handleCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!session) return router.push("/auth/login");
    await addToCart(post.id);
  }

  return (
    <Link href={`/post/${post.id}`} className="group block">
      <div className="rounded-xl border bg-white hover:shadow-lg hover:border-primary/30 transition-all duration-200 overflow-hidden h-full flex flex-col">
        {/* Thumbnail */}
        <div className={cn("relative h-40 flex items-center justify-center overflow-hidden flex-shrink-0",
          !thumb && "bg-gradient-to-br",
          !thumb && post.type === "APP" && "from-blue-50 to-blue-100",
          !thumb && post.type === "WORKFLOW" && "from-emerald-50 to-emerald-100",
          !thumb && post.type === "AGENT" && "from-purple-50 to-purple-100",
          !thumb && post.type === "TEMPLATE" && "from-orange-50 to-orange-100",
          !thumb && post.type === "PLUGIN" && "from-pink-50 to-pink-100",
          !thumb && post.type === "DATASET" && "from-amber-50 to-amber-100",
        )}>
          {thumb ? (
            <img src={thumb} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <span className="text-5xl">{config.emoji}</span>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
          <span className={cn("absolute top-2 left-2 text-xs font-semibold px-2 py-0.5 rounded-full border", config.color)}>
            {config.label}
          </span>
          {post.featured && (
            <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-400 text-amber-900">
              ⭐ Featured
            </span>
          )}
          {!post.isFree && !inCart && (
            <button onClick={handleCart}
              className="absolute bottom-2 right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-primary/90"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-3 flex flex-col flex-1">
          <h3 className="font-semibold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-primary transition-colors text-gray-900">
            {post.title}
          </h3>

          {post.toolsUsed?.length > 0 && (
            <div className="flex items-center gap-1 mb-2 flex-wrap">
              {post.toolsUsed.slice(0, 3).map((tool) => (
                <span key={tool} className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">
                  {tool}
                </span>
              ))}
              {post.toolsUsed.length > 3 && (
                <span className="text-[10px] text-gray-400">+{post.toolsUsed.length - 3}</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1.5 mb-2">
            <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0", avatarColor)}>
              {(post.author.name || "U")[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-500 truncate">{post.author.username || post.author.name}</span>
            {post.author.badge && (
              <span className="text-[10px] px-1 py-0.5 bg-amber-100 text-amber-700 rounded font-medium">{post.author.badge}</span>
            )}
          </div>

          {post.ratingCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("w-3 h-3", s <= Math.round(post.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                ))}
              </div>
              <span className="text-xs text-gray-400">({formatCount(post.ratingCount)})</span>
            </div>
          )}

          <div className="flex items-center justify-between mt-auto pt-2 border-t">
            <div>
              {post.isFree ? (
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><Zap className="w-3 h-3" />Free</span>
              ) : (
                <span className="text-sm font-bold text-gray-900">{formatPrice(post.price)}</span>
              )}
              {post.salesCount > 0 && (
                <p className="text-[10px] text-gray-400">{formatCount(post.salesCount)} sales</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{formatCount(post.viewCount)}</span>
              <button onClick={handleLike} className={cn("flex items-center gap-0.5 hover:text-rose-500 transition-colors", liked && "text-rose-500")}>
                <Heart className={cn("w-3 h-3", liked && "fill-current")} />{formatCount(likeCount)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
