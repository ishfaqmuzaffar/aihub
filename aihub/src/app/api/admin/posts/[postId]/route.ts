import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, adminNote } = await req.json();

  let data: any = {};

  if (action === "approve") {
    data = { status: "APPROVED", published: true, adminNote: adminNote || null };
  } else if (action === "reject") {
    data = { status: "REJECTED", published: false, adminNote: adminNote || null };
  } else if (action === "feature") {
    data = { featured: true };
  } else if (action === "unfeature") {
    data = { featured: false };
  } else {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const post = await prisma.post.update({
    where: { id: params.postId },
    data,
  });

  return NextResponse.json(post);
}
