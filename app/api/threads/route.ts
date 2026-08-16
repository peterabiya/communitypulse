import { NextRequest, NextResponse } from "next/server";
import { requireUser, UnauthenticatedError } from "@/lib/auth";
import { createThreadSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function GET() {
  // No auth check: thread listings are public by design.
  const threads = await prisma.thread.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { author: true },
  });
  return NextResponse.json(threads);
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();

    const body = await req.json();
    const parsed = createThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid thread data" }, { status: 400 });
    }

    // authorId always comes from the session, never the request body.
    const thread = await prisma.thread.create({
      data: { ...parsed.data, authorId: user.id },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (e) {
    if (e instanceof UnauthenticatedError) {
      return NextResponse.json(
        { error: "Sign in and set a username before posting" },
        { status: 401 }
      );
    }
    throw e;
  }
}
