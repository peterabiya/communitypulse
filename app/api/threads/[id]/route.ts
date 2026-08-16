import { NextRequest, NextResponse } from "next/server";
import {
  requireUser,
  assertOwner,
  UnauthenticatedError,
  ForbiddenError,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    include: { author: true, comments: { include: { author: true } } },
  });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(thread);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const thread = await prisma.thread.findUnique({ where: { id: params.id } });
    if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

    assertOwner(user, thread.authorId);

    await prisma.thread.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof UnauthenticatedError) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (e instanceof ForbiddenError) {
      return NextResponse.json({ error: "You do not own this thread" }, { status: 403 });
    }
    throw e;
  }
}
