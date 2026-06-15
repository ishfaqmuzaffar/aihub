"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function RegisterForm({ callbackUrl }: { callbackUrl?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      await signIn("credentials", { email, password, redirect: false });
      router.push(callbackUrl || "/discover");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700" htmlFor="name">Full name</label>
        <input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required
          className="w-full px-3 py-2 rounded-lg border bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700" htmlFor="username">Username</label>
        <input id="username" value={username} onChange={e => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
          placeholder="your_handle" required minLength={3} maxLength={30}
          className="w-full px-3 py-2 rounded-lg border bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700" htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
          className="w-full px-3 py-2 rounded-lg border bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5 text-gray-700" htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Min 8 characters" required minLength={8}
          className="w-full px-3 py-2 rounded-lg border bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Create free account"}
      </button>
      <p className="text-xs text-center text-gray-400">By creating an account you agree to our Terms of Service and Privacy Policy</p>
    </form>
  );
}
