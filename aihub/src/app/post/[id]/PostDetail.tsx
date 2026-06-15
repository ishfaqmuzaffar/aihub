"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Bookmark, MessageCircle, Eye, Share2, ArrowLeft, ShoppingCart, Download, CheckCircle, Star, GitFork } from "lucide-react";
import { cn, formatCount, timeAgo, POST_TYPE_CONFIG, getAvatarColor, formatPrice } from "@/lib/utils";
import { useCart } from "@/components/cart/CartContext";
import { useSession } from "next-auth/react";

export function PostDetail({ post, session: serverSession }: { post: any; session: any }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addToCart, isInCart } = useCart();
  const config = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
  const [liked, setLiked] = useState(post.likes?.length > 0);
  const [likeCount, setLikeCount] = useState(post._count.likes);
  const [bookmarked, setBookmarked] = useState(post.bookmarks?.length > 0);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(post.comments || []);
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartMsg, setCartMsg] = useState("");

  const allImages = post.images?.length > 0 ? post.images : post.imageUrl ? [post.imageUrl] : [];
  const authorColor = getAvatarColor(post.author.name || "U");
  const inCart = isInCart(post.id);
  const isPurchased = post.purchases?.length > 0;
  const isOwn = session?.user?.id === post.authorId;

  async function handleLike() {
    if (!session) return router.push("/auth/login");
    setLiked((v: boolean) => !v);
    setLikeCount((c: number) => (liked ? c - 1 : c + 1));
    await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
  }

  async function handleBookmark() {
    if (!session) return router.push("/auth/login");
    setBookmarked((v: boolean) => !v);
    await fetch(`/api/posts/${post.id}/bookmark`, { method: "POST" });
  }

  async function handleCartAction() {
    if (!session) return router.push("/auth/login?callbackUrl=/cart");
    setCartLoading(true);
    const res = await addToCart(post.id);
    setCartLoading(false);
    if (res?.inCart) setCartMsg("Added to cart!");
    else if (res?.inCart === false) setCartMsg("Removed from cart");
    setTimeout(() => setCartMsg(""), 2000);
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !comment.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}/comment`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment }),
      });
      const data = await res.json();
      setComments([data, ...comments]);
      setComment("");
    } finally { setSubmitting(false); }
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: images + comments */}
        <div className="lg:col-span-3 space-y-5">
          {/* Main image */}
          <div className={cn("rounded-2xl overflow-hidden flex items-center justify-center min-h-72 bg-gray-100",
            allImages.length === 0 && post.type === "ART" && "bg-purple-50",
            allImages.length === 0 && post.type === "PROMPT" && "bg-emerald-50",
            allImages.length === 0 && post.type === "APP" && "bg-blue-50",
            allImages.length === 0 && post.type === "WORKFLOW" && "bg-amber-50",
          )}>
            {allImages.length > 0 ? (
              <img src={allImages[activeImage]} alt={post.title} className="w-full object-contain max-h-[500px]" />
            ) : (
              <span className="text-8xl py-12">{config.emoji}</span>
            )}
          </div>

          {/* Thumbnail strip */}
          {allImages.length > 1 && (
            <div className="flex gap-2">
              {allImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={cn("w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                    activeImage === i ? "border-primary" : "border-transparent hover:border-gray-300"
                  )}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Content block */}
          {post.content && (
            <div className="rounded-xl border bg-gray-50 p-4">
              <h3 className="text-sm font-semibold mb-2 text-gray-700">
                {post.type === "PROMPT" ? "Prompt" : post.type === "APP" ? "Details" : "Workflow"}
                {!post.isFree && !isPurchased && !isOwn && (
                  <span className="ml-2 text-xs text-amber-600 font-normal">🔒 Purchase to unlock full content</span>
                )}
              </h3>
              <pre className={cn("text-sm whitespace-pre-wrap font-mono leading-relaxed",
                !post.isFree && !isPurchased && !isOwn && "blur-sm select-none"
              )}>
                {post.content}
              </pre>
            </div>
          )}

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> Comments ({comments.length})
            </h2>
            {session && (
              <form onSubmit={handleComment} className="space-y-2">
                <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts..." rows={3}
                  className="w-full px-3 py-2 text-sm rounded-xl border bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <button type="submit" disabled={submitting || !comment.trim()}
                  className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors font-medium"
                >
                  {submitting ? "Posting..." : "Post comment"}
                </button>
              </form>
            )}
            {comments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">No comments yet. Be first!</p>
            ) : (
              <div className="space-y-4">
                {comments.map((c: any) => (
                  <div key={c.id} className="flex gap-3">
                    <div className={cn("w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold", getAvatarColor(c.user.name || "U"))}>
                      {(c.user.name || "U")[0].toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">{c.user.name || c.user.username}</span>
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: info + buy */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border", config.color)}>{config.label}</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3 mb-2">{post.title}</h1>
            {post.description && <p className="text-gray-500 text-sm leading-relaxed">{post.description}</p>}
          </div>

          {/* Rating */}
          {post.ratingCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={cn("w-4 h-4", s <= Math.round(post.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-700">{post.rating.toFixed(1)}</span>
              <span className="text-sm text-gray-400">({formatCount(post.ratingCount)} reviews)</span>
            </div>
          )}

          {/* Price & CTA */}
          <div className="bg-gray-50 rounded-2xl border p-5 space-y-4">
            <div className="flex items-end gap-3">
              <span className={cn("text-3xl font-bold", post.isFree ? "text-emerald-600" : "text-gray-900")}>
                {post.isFree ? "Free" : formatPrice(post.price)}
              </span>
              {post.salesCount > 0 && <span className="text-sm text-gray-400 mb-1">{formatCount(post.salesCount)} sales</span>}
            </div>

            {isOwn ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 font-medium text-center">
                This is your item
              </div>
            ) : isPurchased ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-700 font-medium">
                  <CheckCircle className="w-4 h-4" /> You own this item
                </div>
                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                  <Download className="w-4 h-4" /> Download / Access
                </button>
              </div>
            ) : post.isFree ? (
              <button className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors text-base">
                <Download className="w-5 h-5" /> Get for Free
              </button>
            ) : (
              <div className="space-y-2">
                <button onClick={handleCartAction} disabled={cartLoading}
                  className={cn("w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all text-base",
                    inCart ? "bg-gray-900 text-white hover:bg-gray-800" : "bg-primary text-white hover:bg-primary/90"
                  )}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartLoading ? "..." : cartMsg || (inCart ? "Remove from cart" : "Add to cart")}
                </button>
                {inCart && (
                  <Link href="/cart" className="block text-center py-2.5 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-colors">
                    Go to cart →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button onClick={handleLike} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm transition-all font-medium",
              liked ? "bg-rose-50 border-rose-200 text-rose-600" : "text-gray-600 hover:border-gray-300"
            )}>
              <Heart className={cn("w-4 h-4", liked && "fill-current")} /> {formatCount(likeCount)}
            </button>
            <button onClick={handleBookmark} className={cn("flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm transition-all font-medium",
              bookmarked ? "bg-primary/10 border-primary/30 text-primary" : "text-gray-600 hover:border-gray-300"
            )}>
              <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} /> Save
            </button>
            <button onClick={handleShare} className="px-3 py-2 rounded-xl border text-gray-600 hover:border-gray-300 transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Author */}
          <Link href={`/creators/${post.author.username || post.author.id}`}
            className="flex items-center gap-3 p-3 rounded-xl border hover:border-primary/30 transition-colors"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold", authorColor)}>
              {(post.author.name || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900">{post.author.name || post.author.username}</p>
              {post.author.bio && <p className="text-xs text-gray-500 truncate">{post.author.bio}</p>}
            </div>
            <span className="text-xs text-primary font-medium">View profile →</span>
          </Link>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Views", value: formatCount(post.viewCount) },
              { label: "Likes", value: formatCount(likeCount) },
              { label: "Comments", value: formatCount(post._count.comments) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                <div className="font-bold text-gray-900">{value}</div>
                <div className="text-xs text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/discover?q=${tag}`}
                  className="text-xs px-2 py-1 bg-gray-100 rounded-lg text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <Link href={`/upload?remixFrom=${post.id}`}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-xl border text-sm text-gray-500 hover:text-primary hover:border-primary/30 transition-all"
          >
            <GitFork className="w-4 h-4" /> Remix this
          </Link>
        </div>
      </div>
    </div>
  );
}
