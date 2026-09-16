import { prisma } from "@/lib/prisma";
import { assertOwner } from "@/lib/auth";

export async function DELETE(
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

  await prisma.thread.delete({ where: { id: params.id } }); // ok: communitypulse-thread-delete-without-ownership-check

  return new Response(null, { status: 204 });
}
