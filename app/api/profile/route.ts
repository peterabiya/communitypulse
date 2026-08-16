import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setUsernameSchema } from "@/lib/validation";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = setUsernameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid username or bio" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { username: parsed.data.username } });
  if (existing && existing.id !== userId) {
    return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  }

  const user = await prisma.user.upsert({
    where: { id: userId },
    update: { username: parsed.data.username, bio: parsed.data.bio },
    create: { id: userId, username: parsed.data.username, bio: parsed.data.bio },
  });

  return NextResponse.json(user, { status: 201 });
}
