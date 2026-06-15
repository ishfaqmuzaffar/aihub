import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { isAdmin } = await req.json();

  const user = await prisma.user.update({
    where: { id: params.userId },
    data: { isAdmin },
  });

  return NextResponse.json({ id: user.id, isAdmin: user.isAdmin });
}
