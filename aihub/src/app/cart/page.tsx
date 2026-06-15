"use client";

import { useCart } from "@/components/cart/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Trash2, ShoppingCart, ArrowRight, Lock, TreePine } from "lucide-react";
import { cn, formatPrice, POST_TYPE_CONFIG } from "@/lib/utils";

export default function CartPage() {
  const { data: session } = useSession();
  const { items, removeFromCart, total, count } = useCart();
  const router = useRouter();

  function handleCheckout() {
    if (!session) return router.push("/auth/login?callbackUrl=/checkout");
    router.push("/checkout");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
          {count > 0 && <span className="text-sm text-gray-500">({count} {count === 1 ? "item" : "items"})</span>}
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-sm mb-6">Browse AI creations and add them to your cart</p>
            <Link href="/discover" className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-colors">
              Browse marketplace <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => {
                const cfg = POST_TYPE_CONFIG[item.post.type as keyof typeof POST_TYPE_CONFIG];
                const thumb = item.post.imageUrl || (item.post.images && item.post.images[0]);
                return (
                  <div key={item.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                    <div className={cn("w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
                      !thumb && "bg-gray-100"
                    )}>
                      {thumb ? (
                        <img src={thumb} alt={item.post.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">{cfg?.emoji}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/post/${item.postId}`} className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-1">
                        {item.post.title}
                      </Link>
                      <p className="text-sm text-gray-500">by {item.post.author.name || item.post.author.username}</p>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full mt-1 inline-block", cfg?.color)}>
                        {cfg?.label}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-gray-900 text-lg">{formatPrice(item.post.price)}</p>
                      <button onClick={() => removeFromCart(item.postId)}
                        className="text-red-400 hover:text-red-600 transition-colors mt-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border p-5 sticky top-20">
                <h2 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600 truncate mr-2">{item.post.title}</span>
                      <span className="font-medium text-gray-900 flex-shrink-0">{formatPrice(item.post.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 mb-5">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
                <button onClick={handleCheckout}
                  className="w-full bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  {!session ? <><Lock className="w-4 h-4" /> Login to Checkout</> : <><ArrowRight className="w-4 h-4" /> Proceed to Checkout</>}
                </button>
                {!session && (
                  <p className="text-xs text-center text-gray-400 mt-2">You need to sign in to complete your purchase</p>
                )}
                <Link href="/discover" className="block text-center text-sm text-primary hover:underline mt-3">
                  Continue shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
