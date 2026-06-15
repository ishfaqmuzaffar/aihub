"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PostCard } from "@/components/cards/PostCard";
import { PostWithAuthor } from "@/types";
import { TrendingUp, Clock, Star, DollarSign, SlidersHorizontal } from "lucide-react";
import { cn, POST_TYPE_CONFIG } from "@/lib/utils";

const TYPES = [
  { value: "", label: "All Tools" },
  ...Object.entries(POST_TYPE_CONFIG).map(([value, cfg]) => ({
    value: value.toLowerCase(),
    label: `${cfg.emoji} ${cfg.label}`,
  })),
];

const SORTS = [
  { value: "trending", label: "Trending", icon: TrendingUp },
  { value: "new",      label: "Newest",   icon: Clock },
  { value: "top",      label: "Best Selling", icon: Star },
  { value: "price",    label: "Price",    icon: DollarSign },
];

export function DiscoverFeed({ posts, total }: { posts: PostWithAuthor[]; total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeType = searchParams.get("type") || "";
  const activeSort = searchParams.get("sort") || "trending";
  const q = searchParams.get("q") || "";

  function navigate(type: string, sort: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (type) params.set("type", type); else params.delete("type");
    params.set("sort", sort);
    router.push(`/discover?${params.toString()}`);
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {q ? `Results for "${q}"` : "Browse AI Tools"}
          <span className="text-gray-400 font-normal text-lg ml-2">({total.toLocaleString()} items)</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1">Hand-reviewed, production-ready AI tools for business</p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white border rounded-xl p-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {TYPES.map(({ value, label }) => (
            <button key={value} onClick={() => navigate(value, activeSort)}
              className={cn("px-3 py-1.5 rounded-lg text-sm whitespace-nowrap font-medium transition-all",
                activeType === value ? "bg-primary text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 mr-1" />
          {SORTS.map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => navigate(activeType, value)}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all font-medium",
                activeSort === value ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-24 text-gray-500 bg-white rounded-xl border">
          <p className="text-lg font-medium">No tools found</p>
          <p className="text-sm mt-1">Try a different category or search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {posts.map((post) => <PostCard key={post.id} post={post} />)}
        </div>
      )}
    </main>
  );
}
