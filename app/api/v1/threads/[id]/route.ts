import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      title: true,
      body: true,
      topic: true,
      createdAt: true,
      author: { select: { username: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          body: true,
          createdAt: true,
          author: { select: { username: true } },
        },
      },
    },
  });

  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: thread.id,
    title: thread.title,
    body: thread.body,
    topic: thread.topic,
    createdAt: thread.createdAt,
    author: thread.author.username,
    comments: thread.comments.map((c) => ({
      id: c.id,
      body: c.body,
      createdAt: c.createdAt,
      author: c.author.username,
    })),
  });
}
