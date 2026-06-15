"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, Upload, LogOut, User, Bookmark, TreePine, ShoppingBag, ShoppingCart, LayoutDashboard } from "lucide-react";
import { getAvatarColor, cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartContext";

export function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();
  const { count } = useCart();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/discover?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <TreePine className="w-5 h-5 text-primary" />
          <span className="text-gray-900">AI<span className="text-primary">Forest</span></span>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 shrink-0">
          {[
            { href: "/discover", label: "Browse" },
            { href: "/discover?type=art", label: "AI Art" },
            { href: "/discover?type=prompt", label: "Prompts" },
            { href: "/discover?type=app", label: "Apps" },
            { href: "/discover?type=workflow", label: "Workflows" },
            { href: "/creators", label: "Creators" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="text-sm text-gray-600 hover:text-primary transition-colors font-medium">
              {label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search AI creations..."
              className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-100 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white transition-all"
            />
          </div>
        </form>

        <div className="flex items-center gap-3 shrink-0">
          {session ? (
            <>
              <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {count > 9 ? "9+" : count}
                  </span>
                )}
              </Link>
              <Link href="/upload" className="flex items-center gap-1.5 text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
                <Upload className="w-3.5 h-3.5" />
                Sell
              </Link>
              <div className="relative group">
                <button className="flex items-center gap-2">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold", getAvatarColor(session.user.name || session.user.email))}>
                    {(session.user.name || session.user.email)[0].toUpperCase()}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-2">
                    <div className="px-2 py-1.5 text-xs text-gray-500 truncate border-b mb-1">{session.user.email}</div>
                    <Link href="/account" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors font-medium text-primary">
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>
                    <Link href={`/creators/${session.user.username || session.user.id}`} className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      <User className="w-4 h-4" /> Public Profile
                    </Link>
                    <Link href="/purchases" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      <ShoppingBag className="w-4 h-4" /> My Purchases
                    </Link>
                    <Link href="/bookmarks" className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                      <Bookmark className="w-4 h-4" /> Bookmarks
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-lg hover:bg-gray-50 transition-colors text-red-500 mt-1 border-t pt-2">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/cart" className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
              </Link>
              <Link href="/auth/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium">Sign in</Link>
              <Link href="/auth/register" className="text-sm px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">Join free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
