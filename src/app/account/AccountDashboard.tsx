"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, TrendingUp, ShoppingBag, DollarSign, Eye, Heart, Star, Plus, Package, Clock, CheckCircle, XCircle, Download, ExternalLink } from "lucide-react";
import { cn, formatCount, formatPrice, timeAgo, POST_TYPE_CONFIG, getAvatarColor } from "@/lib/utils";

const TABS = ["Overview", "My Listings", "Sales", "Purchases"] as const;
type Tab = typeof TABS[number];

const STATUS_CONFIG = {
  PENDING:  { label: "Under review", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "Live",         color: "bg-green-100 text-green-700 border-green-200",  icon: CheckCircle },
  REJECTED: { label: "Rejected",     color: "bg-red-100 text-red-700 border-red-200",        icon: XCircle },
};

export function AccountDashboard({ user, posts, purchases, recentSales, totalViews, totalLikes }: any) {
  const [tab, setTab] = useState<Tab>("Overview");
  const avatarColor = getAvatarColor(user?.name || "U");

  const pendingCount = posts.filter((p: any) => p.status === "PENDING").length;
  const approvedCount = posts.filter((p: any) => p.status === "APPROVED").length;
  const rejectedCount = posts.filter((p: any) => p.status === "REJECTED").length;

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
                <Link href="/sell" className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                  <Plus className="w-4 h-4" /> Submit a tool
                </Link>
                <Link href={`/creators/${user?.username || user?.id}`} className="flex items-center gap-1.5 border px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700">
                  Public profile
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 mt-4 text-sm">
              <div><span className="font-bold text-gray-900">{approvedCount}</span> <span className="text-gray-500">live</span></div>
              <div><span className="font-bold text-amber-600">{pendingCount}</span> <span className="text-gray-500">pending</span></div>
              <div><span className="font-bold text-gray-900">{user?._count?.followers}</span> <span className="text-gray-500">followers</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
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
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all relative",
              tab === t ? "bg-primary text-white" : "text-gray-600 hover:text-gray-900"
            )}
          >
            {t}
            {t === "My Listings" && pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-900 mb-4">Listing Status</h2>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { label: "Live", value: approvedCount, color: "text-green-600", bg: "bg-green-50" },
                  { label: "Under review", value: pendingCount, color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Rejected", value: rejectedCount, color: "text-red-600", bg: "bg-red-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={cn("rounded-xl p-3", bg)}>
                    <div className={cn("text-2xl font-bold", color)}>{value}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                  </div>
                ))}
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
                        <p className="text-xs text-gray-400">by {sale.user.name || sale.user.username} · {timeAgo(sale.createdAt)}</p>
                      </div>
                      <span className="font-bold text-green-600 text-sm">{formatPrice(sale.post.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {posts.filter((p: any) => p.status === "REJECTED").length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                <h2 className="font-bold text-red-800 mb-3 flex items-center gap-2"><XCircle className="w-4 h-4" /> Rejected listings need attention</h2>
                {posts.filter((p: any) => p.status === "REJECTED").map((post: any) => (
                  <div key={post.id} className="bg-white rounded-lg p-3 mb-2 last:mb-0">
                    <p className="font-medium text-gray-900 text-sm">{post.title}</p>
                    {post.adminNote && <p className="text-xs text-red-600 mt-1">Reason: {post.adminNote}</p>}
                    <Link href="/sell" className="text-xs text-primary hover:underline mt-1 inline-block">Resubmit →</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Star className="w-4 h-4 text-amber-500" /> Top Tools</h2>
              <div className="space-y-3">
                {posts.filter((p: any) => p.status === "APPROVED").slice(0, 5).map((post: any) => {
                  const cfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
                  return (
                    <Link key={post.id} href={`/post/${post.id}`} className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors">
                      <span className="text-xl">{cfg?.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                        <p className="text-xs text-gray-400">{formatCount(post.viewCount)} views</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 flex-shrink-0">{post.isFree ? "Free" : formatPrice(post.price)}</span>
                    </Link>
                  );
                })}
                {posts.filter((p: any) => p.status === "APPROVED").length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No approved tools yet</p>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5 text-white">
              <Package className="w-6 h-6 mb-3 text-green-200" />
              <h3 className="font-bold mb-1">Submit a new tool</h3>
              <p className="text-sm text-green-100 mb-3">Each approved tool earns you 80% of every sale.</p>
              <Link href="/sell" className="block text-center bg-white text-green-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-green-50 transition-colors">
                Start submission
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* My Listings */}
      {tab === "My Listings" && (
        <div className="space-y-3">
          {posts.length === 0 ? (
            <div className="bg-white rounded-xl border p-16 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">You haven't submitted any tools yet</p>
              <Link href="/sell" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                Submit your first tool
              </Link>
            </div>
          ) : posts.map((post: any) => {
            const cfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
            const statusCfg = STATUS_CONFIG[post.status as keyof typeof STATUS_CONFIG];
            const StatusIcon = statusCfg.icon;
            const thumb = post.imageUrl || post.images?.[0];
            return (
              <div key={post.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden", !thumb && "bg-gray-100")}>
                  {thumb ? <img src={thumb} alt={post.title} className="w-full h-full object-cover" /> : <span className="text-2xl">{cfg?.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 flex-shrink-0", statusCfg.color)}>
                      <StatusIcon className="w-3 h-3" /> {statusCfg.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{cfg?.label} · {timeAgo(post.createdAt)}</p>
                  {post.adminNote && post.status === "REJECTED" && (
                    <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded">Admin note: {post.adminNote}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 space-y-1">
                  <p className="font-bold text-gray-900">{post.isFree ? "Free" : formatPrice(post.price)}</p>
                  <p className="text-xs text-gray-400">{post._count?.purchases || 0} sales</p>
                  {post.status === "APPROVED" && (
                    <Link href={`/post/${post.id}`} className="text-xs text-primary hover:underline flex items-center gap-1 justify-end">
                      <ExternalLink className="w-3 h-3" /> View
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sales */}
      {tab === "Sales" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          {recentSales.length === 0 ? (
            <div className="p-16 text-center">
              <DollarSign className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No sales yet. Get your first tool approved to start earning!</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {["Tool", "Buyer", "Date", "Earnings"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentSales.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{sale.post.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{sale.user.name || sale.user.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">{timeAgo(sale.createdAt)}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-600">${((sale.post.price || 0) * 0.8).toFixed(2)}</td>
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
              <Link href="/discover" className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors">Browse marketplace</Link>
            </div>
          ) : purchases.map((purchase: any) => {
            const cfg = POST_TYPE_CONFIG[purchase.post.type as keyof typeof POST_TYPE_CONFIG];
            const thumb = purchase.post.imageUrl || purchase.post.images?.[0];
            return (
              <div key={purchase.id} className="bg-white rounded-xl border p-4 flex items-center gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden", !thumb && "bg-gray-100")}>
                  {thumb ? <img src={thumb} alt={purchase.post.title} className="w-full h-full object-cover" /> : <span className="text-2xl">{cfg?.emoji}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{purchase.post.title}</p>
                  <p className="text-sm text-gray-500">by {purchase.post.author.name || purchase.post.author.username}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(purchase.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="font-bold text-gray-900">{formatPrice(purchase.price)}</p>
                  {purchase.post.fileUrl && (
                    <a href={`/api/posts/${purchase.postId}/download`}
                      className="flex items-center gap-1.5 text-xs bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                  <Link href={`/post/${purchase.postId}`} className="text-xs text-primary hover:underline">View details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
