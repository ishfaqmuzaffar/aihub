"use client";

import { useCart } from "@/components/cart/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";
import { TreePine, ShieldCheck, CreditCard, CheckCircle, ArrowLeft, Lock } from "lucide-react";
import { cn, formatPrice, POST_TYPE_CONFIG } from "@/lib/utils";

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, total, clearCart, count } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/login?callbackUrl=/checkout");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && count === 0 && !success) router.push("/cart");
  }, [count, status, success, router]);

  async function handlePurchase() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postIds: items.map((i) => i.postId) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      clearCart();
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return <div className="min-h-screen bg-gray-50"><Navbar /><div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div></div>;

  if (success) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="bg-white rounded-2xl border p-10">
          <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Purchase Complete!</h1>
          <p className="text-gray-500 mb-8">Your items are now available in your purchases library.</p>
          <div className="flex flex-col gap-3">
            <Link href="/purchases" className="bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              View My Purchases
            </Link>
            <Link href="/discover" className="border py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/cart" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-gray-900">Account</h2>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {(session?.user?.name || session?.user?.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-primary" />
                <h2 className="font-semibold text-gray-900">Payment</h2>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <p className="font-medium mb-1">Demo Mode — No real payment required</p>
                <p className="text-amber-700">This is a demo checkout. Click "Complete Purchase" to simulate a successful payment and access your items.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-semibold text-gray-900 mb-4">Items ({count})</h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const cfg = POST_TYPE_CONFIG[item.post.type as keyof typeof POST_TYPE_CONFIG];
                  const thumb = item.post.imageUrl || (item.post.images && item.post.images[0]);
                  return (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden", !thumb && "bg-gray-100")}>
                        {thumb ? <img src={thumb} alt={item.post.title} className="w-full h-full object-cover" /> : <span className="text-xl">{cfg?.emoji}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.post.title}</p>
                        <p className="text-xs text-gray-500">by {item.post.author.name || item.post.author.username}</p>
                      </div>
                      <span className="font-semibold text-gray-900 flex-shrink-0">{formatPrice(item.post.price)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border p-5 sticky top-20">
              <h2 className="font-bold text-gray-900 text-lg mb-4">Order Total</h2>
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-primary"><span>AI Forest discount</span><span>-$0.00</span></div>
              </div>
              <div className="border-t pt-4 mb-5">
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">{error}</div>}

              <button onClick={handlePurchase} disabled={loading}
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-base"
              >
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><ShieldCheck className="w-5 h-5" /> Complete Purchase</>}
              </button>

              <div className="flex items-center justify-center gap-2 mt-4 text-xs text-gray-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
