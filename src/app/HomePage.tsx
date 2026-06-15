"use client";

import Link from "next/link";
import { TreePine, ChevronRight, Star, ShoppingBag, TrendingUp, Clock, Sparkles, Check, Zap } from "lucide-react";
import { PostCard } from "@/components/cards/PostCard";
import { cn, formatCount, getAvatarColor, POST_TYPE_CONFIG } from "@/lib/utils";

const CATEGORIES = Object.entries(POST_TYPE_CONFIG).map(([type, cfg]) => ({ type, ...cfg }));

const WHY_ITEMS = [
  { icon: "🛡️", title: "Curated quality", desc: "Every listing manually reviewed by our team before going live. No spam, no junk." },
  { icon: "💼", title: "Business-ready", desc: "Tools built for real workflows. Each listing includes docs, support, and compatibility info." },
  { icon: "💰", title: "Fair revenue split", desc: "Creators keep 80% of every sale. No hidden fees, monthly payouts." },
  { icon: "🔒", title: "Secure checkout", desc: "Encrypted payments, instant access after purchase, lifetime download rights." },
];

export function HomePage({ trending, featured, newest, topSellers, stats }: any) {
  return (
    <main>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-950 via-green-950 to-gray-950 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-3 py-1 text-sm text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" /> Curated AI business tools marketplace
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4">
              The marketplace for <span className="text-primary">serious AI tools</span>
            </h1>
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Buy and sell production-ready AI apps, automation workflows, agents, and templates. Every listing is hand-reviewed for quality.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/discover" className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
                Browse marketplace <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/upload" className="bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-colors">
                Start selling
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { label: "Curated tools", value: `${formatCount(stats.posts)}+` },
              { label: "Verified creators", value: `${formatCount(stats.users)}+` },
              { label: "Completed sales", value: `${formatCount(stats.sales)}+` },
              { label: "Avg. tool rating", value: "4.8 ★" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="text-sm text-gray-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <Link href="/discover" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium whitespace-nowrap flex-shrink-0">
              All Tools
            </Link>
            {CATEGORIES.map(({ type, label, emoji }) => (
              <Link key={type} href={`/discover?type=${type.toLowerCase()}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium whitespace-nowrap flex-shrink-0 hover:border-primary hover:text-primary transition-colors text-gray-600"
              >
                <span>{emoji}</span> {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-12">

            {/* Featured */}
            {featured.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h2 className="text-lg font-bold text-gray-900">Featured Tools</h2>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Editor's Pick</span>
                  </div>
                  <Link href="/discover?featured=true" className="text-sm text-primary hover:underline flex items-center gap-1">See all <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {featured.map((post: any) => <PostCard key={post.id} post={post} />)}
                </div>
              </section>
            )}

            {/* Trending */}
            {trending.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-gray-900">Trending This Week</h2>
                  </div>
                  <Link href="/discover?sort=trending" className="text-sm text-primary hover:underline flex items-center gap-1">See all <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {trending.slice(0, 6).map((post: any) => <PostCard key={post.id} post={post} />)}
                </div>
              </section>
            )}

            {/* New arrivals */}
            {newest.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h2 className="text-lg font-bold text-gray-900">New Arrivals</h2>
                  </div>
                  <Link href="/discover?sort=new" className="text-sm text-primary hover:underline flex items-center gap-1">See all <ChevronRight className="w-3 h-3" /></Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:grid-cols-4 gap-4">
                  {newest.map((post: any) => <PostCard key={post.id} post={post} />)}
                </div>
              </section>
            )}

            {/* Why AIForest */}
            <section className="bg-gray-50 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Why AIForest?</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {WHY_ITEMS.map(({ icon, title, desc }) => (
                  <div key={title} className="flex gap-4">
                    <span className="text-2xl flex-shrink-0">{icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Top sellers */}
            {topSellers.length > 0 && (
              <div className="bg-white rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <h3 className="font-bold text-gray-900">Top Creators</h3>
                </div>
                <div className="space-y-3">
                  {topSellers.map((seller: any, i: number) => (
                    <Link key={seller.id} href={`/creators/${seller.username || seller.id}`}
                      className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-1.5 transition-colors"
                    >
                      <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0", getAvatarColor(seller.name || "U"))}>
                        {(seller.name || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{seller.name}</p>
                        <p className="text-xs text-gray-400">{formatCount(seller._count.posts)} tools</p>
                      </div>
                      {seller.badge && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded font-medium flex-shrink-0">{seller.badge}</span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Sell CTA */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-5 text-white">
              <ShoppingBag className="w-6 h-6 mb-3 text-green-200" />
              <h3 className="font-bold text-lg mb-1">Sell your tools</h3>
              <p className="text-sm text-green-100 mb-3">Keep 80% of every sale. Submit your tool for review.</p>
              <ul className="space-y-1.5 mb-4">
                {["Quality reviewed", "Instant payouts", "Global reach"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-xs text-green-100">
                    <Check className="w-3.5 h-3.5 text-green-300" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/upload" className="block text-center bg-white text-green-700 font-semibold text-sm py-2.5 rounded-xl hover:bg-green-50 transition-colors">
                Submit a tool
              </Link>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-xl border p-4">
              <h3 className="font-bold text-gray-900 mb-3">Categories</h3>
              <div className="space-y-1">
                {CATEGORIES.map(({ type, label, emoji, desc }) => (
                  <Link key={type} href={`/discover?type=${type.toLowerCase()}`}
                    className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-lg w-6 text-center">{emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                      <p className="text-xs text-gray-400 truncate">{desc}</p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
