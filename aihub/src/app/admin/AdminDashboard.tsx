"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, Users, ShoppingBag, Package, Eye, ExternalLink, Shield } from "lucide-react";
import { cn, formatPrice, timeAgo, POST_TYPE_CONFIG, getAvatarColor } from "@/lib/utils";

const TABS = ["Pending", "Approved", "Rejected", "Users"] as const;
type Tab = typeof TABS[number];

export function AdminDashboard({ pending, approved, rejected, users, stats }: any) {
  const [tab, setTab] = useState<Tab>("Pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [localPending, setLocalPending] = useState(pending);
  const [localApproved, setLocalApproved] = useState(approved);
  const [localRejected, setLocalRejected] = useState(rejected);

  async function handleAction(postId: string, action: "approve" | "reject" | "feature" | "unfeature") {
    setActionLoading(postId + action);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote: noteMap[postId] || "" }),
      });
      if (!res.ok) throw new Error("Action failed");
      const updated = await res.json();

      if (action === "approve") {
        setLocalPending((prev: any[]) => prev.filter((p: any) => p.id !== postId));
        setLocalApproved((prev: any[]) => [updated, ...prev]);
      } else if (action === "reject") {
        setLocalPending((prev: any[]) => prev.filter((p: any) => p.id !== postId));
        setLocalRejected((prev: any[]) => [updated, ...prev]);
      } else {
        setLocalApproved((prev: any[]) => prev.map((p: any) => p.id === postId ? { ...p, featured: updated.featured } : p));
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAdminToggle(userId: string, isAdmin: boolean) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !isAdmin }),
    });
    window.location.reload();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Clock, label: "Pending Review", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50", tab: "Pending" },
          { icon: CheckCircle, label: "Approved Tools", value: stats.approved, color: "text-green-600", bg: "bg-green-50", tab: "Approved" },
          { icon: Users, label: "Total Users", value: stats.users, color: "text-blue-600", bg: "bg-blue-50", tab: "Users" },
          { icon: ShoppingBag, label: "Total Sales", value: stats.sales, color: "text-purple-600", bg: "bg-purple-50", tab: "Approved" },
        ].map(({ icon: Icon, label, value, color, bg, tab: t }) => (
          <button key={label} onClick={() => setTab(t as Tab)}
            className="bg-white rounded-xl border p-4 text-left hover:border-primary/30 transition-colors"
          >
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-3", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </button>
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
            {t === "Pending" && localPending.length > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{localPending.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Pending */}
      {tab === "Pending" && (
        <div className="space-y-4">
          {localPending.length === 0 ? (
            <div className="bg-white rounded-xl border p-16 text-center">
              <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">All caught up! No pending listings.</p>
            </div>
          ) : localPending.map((post: any) => {
            const cfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
            const thumb = post.imageUrl || post.images?.[0];
            return (
              <div key={post.id} className="bg-white rounded-xl border overflow-hidden">
                <div className="flex gap-4 p-4">
                  <div className={cn("w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden", !thumb && "bg-gray-100")}>
                    {thumb ? <img src={thumb} alt={post.title} className="w-full h-full object-cover" /> : <span className="text-3xl">{cfg?.emoji}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div>
                        <h3 className="font-bold text-gray-900">{post.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full border", cfg?.color)}>{cfg?.label}</span>
                          <span className="text-xs text-gray-400">by {post.author.name || post.author.username}</span>
                          <span className="text-xs text-gray-300">·</span>
                          <span className="text-xs text-gray-400">{timeAgo(post.createdAt)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-gray-900">{post.isFree ? "Free" : formatPrice(post.price)}</p>
                        {post.version && <p className="text-xs text-gray-400">v{post.version}</p>}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.description}</p>
                    {post.toolsUsed?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {post.toolsUsed.map((t: string) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap text-xs text-gray-400">
                      {post.demoUrl && <a href={post.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-3 h-3" />Demo</a>}
                      {post.documentationUrl && <a href={post.documentationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline"><ExternalLink className="w-3 h-3" />Docs</a>}
                      <Link href={`/post/${post.id}`} target="_blank" className="flex items-center gap-1 text-primary hover:underline"><Eye className="w-3 h-3" />Preview</Link>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 border-t px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <input
                    type="text"
                    placeholder="Admin note (optional, shown to seller on rejection)"
                    value={noteMap[post.id] || ""}
                    onChange={(e) => setNoteMap((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAction(post.id, "approve")}
                      disabled={actionLoading === post.id + "approve"}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === post.id + "approve" ? "..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleAction(post.id, "reject")}
                      disabled={actionLoading === post.id + "reject"}
                      className="flex items-center gap-1.5 px-4 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      {actionLoading === post.id + "reject" ? "..." : "Reject"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Approved */}
      {tab === "Approved" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tool</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Creator</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Sales</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Featured</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {localApproved.map((post: any) => {
                const cfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span>{cfg?.emoji}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">{post.title}</p>
                          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", cfg?.color)}>{cfg?.label}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{post.author.name || post.author.username}</td>
                    <td className="px-4 py-3 text-sm font-medium">{post.isFree ? "Free" : formatPrice(post.price)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{post._count.purchases}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleAction(post.id, post.featured ? "unfeature" : "feature")}
                        className={cn("text-xs px-2 py-1 rounded-lg font-medium border transition-colors",
                          post.featured ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200" : "text-gray-400 border-gray-200 hover:border-amber-300 hover:text-amber-600"
                        )}
                      >
                        {post.featured ? "⭐ Featured" : "Add feature"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/post/${post.id}`} target="_blank" className="text-primary text-xs hover:underline flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejected */}
      {tab === "Rejected" && (
        <div className="space-y-3">
          {localRejected.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-400">No rejected listings</div>
          ) : localRejected.map((post: any) => {
            const cfg = POST_TYPE_CONFIG[post.type as keyof typeof POST_TYPE_CONFIG];
            return (
              <div key={post.id} className="bg-white rounded-xl border p-4 flex items-start gap-3">
                <span className="text-2xl">{cfg?.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{post.title}</p>
                  <p className="text-sm text-gray-500">by {post.author.name || post.author.username} · {timeAgo(post.updatedAt)}</p>
                  {post.adminNote && (
                    <p className="text-sm text-red-600 mt-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">Note: {post.adminNote}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Users */}
      {tab === "Users" && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">User</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Email</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Tools</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Purchases</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Joined</th>
                <th className="text-left text-xs font-semibold text-gray-500 px-4 py-3">Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold", getAvatarColor(user.name || "U"))}>
                        {(user.name || "U")[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{user.name || user.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user._count.posts}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{user._count.purchases}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{timeAgo(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleAdminToggle(user.id, user.isAdmin)}
                      className={cn("text-xs px-2 py-1 rounded-lg font-medium border transition-colors",
                        user.isAdmin ? "bg-primary/10 text-primary border-primary/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200" : "text-gray-400 border-gray-200 hover:border-primary/30 hover:text-primary"
                      )}
                    >
                      {user.isAdmin ? "✓ Admin" : "Make admin"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
