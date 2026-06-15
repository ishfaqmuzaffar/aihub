import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const {
      title, description, type, content, imageUrl, images, tags,
      isFree, price, version, demoUrl, documentationUrl, supportEmail,
      toolsUsed, compatibility, remixedFromId,
    } = await req.json();

    if (!title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description?.trim()) return NextResponse.json({ error: "Description is required" }, { status: 400 });

    const validTypes = ["APP", "WORKFLOW", "AGENT", "TEMPLATE", "PLUGIN", "DATASET"];
    if (!validTypes.includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    if (!isFree && price && price < 5) return NextResponse.json({ error: "Minimum price is $5.00" }, { status: 400 });

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        content: content?.trim() || null,
        imageUrl: imageUrl || null,
        images: Array.isArray(images) ? images : [],
        tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
        isFree: isFree !== false,
        price: !isFree && price ? parseFloat(price) : null,
        status: "PENDING",
        published: false,
        version: version?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        documentationUrl: documentationUrl?.trim() || null,
        supportEmail: supportEmail?.trim() || null,
        toolsUsed: Array.isArray(toolsUsed) ? toolsUsed : [],
        compatibility: Array.isArray(compatibility) ? compatibility : [],
        authorId: session.user.id,
        remixedFromId: remixedFromId || null,
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
