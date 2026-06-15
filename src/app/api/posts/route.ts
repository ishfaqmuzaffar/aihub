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
      isFree, price, version, demoUrl, videoUrl, documentationUrl, supportEmail,
      toolsUsed, compatibility, requirements, fileUrl, fileName, fileSize, remixedFromId,
    } = await req.json();

    if (!title?.trim() || title.length < 10) return NextResponse.json({ error: "Title must be at least 10 characters" }, { status: 400 });
    if (!description?.trim() || description.length < 100) return NextResponse.json({ error: "Description must be at least 100 characters" }, { status: 400 });

    const validTypes = ["APP", "WORKFLOW", "AGENT", "TEMPLATE", "PLUGIN", "DATASET"];
    if (!validTypes.includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    if (!isFree && price && price < 5) return NextResponse.json({ error: "Minimum price is $5.00" }, { status: 400 });

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        type,
        content: content?.trim() || requirements?.trim() || null,
        imageUrl: imageUrl || null,
        images: Array.isArray(images) ? images : [],
        tags: Array.isArray(tags) ? tags.slice(0, 10) : [],
        isFree: isFree !== false,
        price: !isFree && price ? parseFloat(price) : null,
        status: "PENDING",
        published: false,
        version: version?.trim() || null,
        demoUrl: demoUrl?.trim() || null,
        videoUrl: videoUrl?.trim() || null,
        documentationUrl: documentationUrl?.trim() || null,
        supportEmail: supportEmail?.trim() || null,
        toolsUsed: Array.isArray(toolsUsed) ? toolsUsed : [],
        compatibility: Array.isArray(compatibility) ? compatibility : [],
        requirements: requirements?.trim() || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        fileSize: fileSize || null,
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
