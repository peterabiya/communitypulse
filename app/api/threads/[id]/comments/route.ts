import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthenticatedError } from "@/lib/auth";
import { createCommentSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireUser();

    const thread = await prisma.thread.findUnique({ where: { id: params.id } });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid comment" }, { status: 400 });
    }

    const comment = await prisma.comment.create({
      data: { body: parsed.data.body, threadId: params.id, authorId: user.id },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthenticatedError) {
      return NextResponse.json(
        { error: "Sign in and set a username before commenting" },
        { status: 401 }
      );
    }
    throw e;
  }
}
