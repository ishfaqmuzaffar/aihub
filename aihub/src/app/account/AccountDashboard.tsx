"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, TrendingUp, ShoppingBag, DollarSign, Eye, Heart, Star, Plus, Package, Users, FileText, Clock } from "lucide-react";
import { cn, formatCount, formatPrice, timeAgo, POST_TYPE_CONFIG, getAvatarColor } from "@/lib/utils";
import { PostCard } from "@/components/cards/PostCard";

const TABS = ["Overview", "My Items", "Sales", "Purchases"] as const;
type Tab = typeof TABS[number];

export function AccountDashboard({ user, posts, purchases, recentSales, totalViews, totalLikes }: any) {
  const [tab, setTab] = useState<Tab>("Overview");

  const avatarColor = getAvatarColor(user?.name || "U");
  const freeItems = posts.filter((p: any) => p.isFree).length;
  const paidItems = posts.filter((p: any) => !p.isFree).length;

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0", avatarColor)}>
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500 text-sm">@{user?.username || user?.email}</p>
                {user?.badge && <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">{user.badge}</span>}
              </div>
              <div className="flex gap-3">
                <Link href="/upload" className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> New Item
                </Link>
                <Link href={`/creators/${user?.username || user?.id}`} className="flex items-center gap-1.5 border px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
                  View Profile
                </Link>
              </div>
            </div>
            <div className="flex gap-6 mt-4 text-sm">
              <div><span className="font-bold text-gray-900">{user?._count?.posts}</span> <span className="text-gray-500">items</span></div>
              <div><span className="font-bold text-gray-900">{user?._count?.followers}</span> <span className="text-gray-500">followers</span></div>
              <div><span className="font-bold text-gray-900">{user?._count?.following}</span> <span className="text-gray-500">following</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: DollarSign, label: "Total Earnings", value: `$${(user?.totalEarnings || 0).toFixed(2)}`, color: "text-green-600", bg: "bg-green-50" },
          { icon: ShoppingBag, label: "Total Sales", value: user?.totalSales || 0, color: "text-blue-600", bg: "bg-blue-50" },
          { icon: Eye, label: "Total Views", value: formatCount(totalViews), color: "text-purple-600", bg: "bg-purple-50" },
          { icon: Heart, label: "Total Likes", value: formatCount(totalLikes), color: "text-rose-600", bg: "bg-rose-50" },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border p-4">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border rounded-xl p-1 mb-6 w-fit">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
              tab === t ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Item Summary</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-gray-900">{posts.length}</div>
                  <div className="text-xs text-gray-500">Total Items</div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-emerald-700">{freeItems}</div>
                  <div className="text-xs text-gray-500">Free</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-xl font-bold text-blue-700">{paidItems}</div>
                  <div className="text-xs text-gray-500">Paid</div>
                </div>
              </div>
            </div>

            {recentSales.length > 0 && (
              <div className="bg-white rounded-xl border p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Recent Sales</h2>
                <div className="space-y-3">
                  {recentSales.slice(0, 5).map((sale: any) => (
                    <div key={sale.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{sale.post.title}</p>
                        <p className="text-xs text-gray-400">Purchased by {sale.user.name || sale.user.username} · {timeAgo(sale.createdAt)}</p>
                      </div>
                      <span className="font-bold text-green-600">{formatPrice(sale.post.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Top Items</h2>
              <div className="space-y-3">
                {posts.slice(0, 5).map((post: any) => {
                  const cfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
                  return (
                    <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors">
                      <span className="text-xl">{cfg?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400">{formatCount(post.viewCount)} views · {post._count.purchases} sales</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 flex-shrink-0">{post.isFree ? "Free" : formatPrice(post.price)}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5 text-white">
              <Package className="w-6 h-6 mb-3 text-green-200" />
              <h3 className="font-bold mb-1">Share more work</h3>
              <p className="text-sm text-green-100 mb-3">Upload new AI creations and start earning.</p>
              <Link href="/upload" className="block text-center bg-white text-green-700 font-semibold text-sm py-2 rounded-lg hover:bg-green-50 transition-colors">
                Upload now
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* My Items */}
      {tab === "My Items" && (
        <div>
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl border p-16 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't uploaded any items yet</p>
              <Link href="/upload" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                Upload your first item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
            </div>
          )}
        </div>
      )}

      {/* Sales */}
      {tab === "Sales" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {recentSales.length === 0 ? (
            <div className="p-16 text-center">
              <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sales yet. Keep sharing your work!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Item</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Buyer</th>
                  <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Date</th>
                  <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentSales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sale.post.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sale.user.name || sale.user.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{timeAgo(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">${((sale.post.price || 0) * 0.8).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Purchases */}
      {tab === "Purchases" && (
        <div className="space-y-3">
          {purchases.length === 0 ? (
            <div className="bg-white rounded-xl border p-16 text-center">
              <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't purchased anything yet</p>
              <Link href="/discover" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                Browse marketplace
              </Link>
            </div>
          ) : (
            purchases.map((purchase: any) => {
              const cfg = POST_TYPE_CONFIG[purchase.post.type as keyof typeof POST_TYPE_CONFIG];
              return (
                <Link key={purchase.id} href={`/post/${purchase.postId}`}
                  className="flex items-center gap-4 bg-white rounded-xl border p-4 hover:border-primary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {purchase.post.imageUrl
                      ? <img src={purchase.post.imageUrl} alt={purchase.post.title} className="w-full h-full object-cover" />
                      : <span className="text-xl">{cfg?.emoji}</span>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{purchase.post.title}</p>
                    <p className="text-sm text-gray-500">by {purchase.post.author.name || purchase.post.author.username}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-gray-900">{formatPrice(purchase.price)}</p>
                    <p className="text-xs text-gray-400">{timeAgo(purchase.createdAt)}</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}
