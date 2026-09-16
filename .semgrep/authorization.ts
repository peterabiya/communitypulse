import { prisma } from "@/lib/prisma";
import { assertOwner } from "@/lib/auth";

// DELIBERATELY VULNERABLE TEST CASE.
export async function DELETE_UNSAFE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // ruleid: communitypulse-thread-delete-without-ownership-check
  await prisma.thread.delete({
    where: { id: params.id },
  });

  return new Response(null, { status: 204 });
}

export async function DELETE_SAFE(
  _req: Request,
  { params }: { params: { id: string } },
  user: { id: string }
) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
  });

  if (!thread) {
    return new Response("Not found", { status: 404 });
  }

  assertOwner(user as any, thread.authorId);

  // ok: communitypulse-thread-delete-without-ownership-check
  await prisma.thread.delete({ where: { id: params.id } });

  return new Response(null, { status: 204 });
}
