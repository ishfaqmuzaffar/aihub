"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Globe, Users, Heart, FileText } from "lucide-react";
import { PostCard } from "@/components/cards/PostCard";
import { cn, formatCount, getAvatarColor, POST_TYPE_CONFIG } from "@/lib/utils";

export function CreatorProfile({ user, session, totalLikes }: { user: any; session: any; totalLikes: number }) {
  const router = useRouter();
  const [following, setFollowing] = useState(user.followers?.length > 0);
  const [followerCount, setFollowerCount] = useState(user._count.followers);
  const [activeType, setActiveType] = useState("ALL");

  const isOwn = session?.user?.id === user.id;
  const avatarColor = getAvatarColor(user.name || "U");

  const filteredPosts =
    activeType === "ALL"
      ? user.posts
      : user.posts.filter((p: any) => p.type === activeType);

  async function handleFollow() {
    if (!session) return router.push("/auth/login");
    setFollowing((v: boolean) => !v);
    setFollowerCount((c: number) => (following ? c - 1 : c + 1));
    await fetch(`/api/users/${user.id}/follow`, { method: "POST" });
  }

  const types = ["ALL", "ART", "PROMPT", "APP", "WORKFLOW"];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row gap-6 items-start mb-10">
        <div
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-semibold flex-shrink-0",
            avatarColor
          )}
        >
          {user.image ? (
            <img src={user.image} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            (user.name || "U")[0].toUpperCase()
          )}
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold">{user.name}</h1>
              {user.username && (
                <p className="text-muted-foreground">@{user.username}</p>
              )}
            </div>
            {!isOwn && (
              <button
                onClick={handleFollow}
                className={cn(
                  "px-5 py-2 rounded-lg text-sm font-medium transition-all",
                  following
                    ? "border hover:border-destructive hover:text-destructive text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              >
                {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
          {user.bio && <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-lg">{user.bio}</p>}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              {user.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { icon: FileText, label: "Posts", value: user._count.posts },
          { icon: Heart, label: "Likes", value: totalLikes },
          { icon: Users, label: "Followers", value: followerCount },
          { icon: Users, label: "Following", value: user._count.following },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center p-4 rounded-xl bg-muted/50">
            <div className="text-xl font-semibold">{formatCount(value)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {types.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm whitespace-nowrap border transition-all",
              activeType === t
                ? "bg-primary text-primary-foreground border-primary"
                : "text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
            )}
          >
            {t === "ALL" ? "All" : POST_TYPE_CONFIG[t as keyof typeof POST_TYPE_CONFIG].label}
            {t === "ALL"
              ? ` (${user.posts.length})`
              : ` (${user.posts.filter((p: any) => p.type === t).length})`}
          </button>
        ))}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>No {activeType === "ALL" ? "" : activeType.toLowerCase() + " "}posts yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPosts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
