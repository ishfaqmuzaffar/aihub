import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/Navbar";
import { AdminDashboard } from "./AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  if (!session.user.isAdmin) redirect("/");

  const [pending, approved, rejected, users, stats] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { author: { select: { id: true, name: true, username: true, email: true } }, _count: { select: { likes: true } } },
    }),
    prisma.post.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { id: true, name: true, username: true } }, _count: { select: { likes: true, purchases: true } } },
    }),
    prisma.post.findMany({
      where: { status: "REJECTED" },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: { author: { select: { id: true, name: true, username: true } } },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { _count: { select: { posts: true, purchases: true } } },
    }),
    Promise.all([
      prisma.post.count({ where: { status: "PENDING" } }),
      prisma.post.count({ where: { status: "APPROVED" } }),
      prisma.user.count(),
      prisma.purchase.count(),
    ]),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AdminDashboard
        pending={pending as any}
        approved={approved as any}
        rejected={rejected as any}
        users={users as any}
        stats={{ pending: stats[0], approved: stats[1], users: stats[2], sales: stats[3] }}
      />
    </div>
  );
}
