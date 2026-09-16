import { prisma } from "@/lib/prisma";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  // DELIBERATELY VULNERABLE TEST FIXTURE.
  // This simulates deleting a thread without verifying ownership.
  // ruleid: communitypulse-thread-delete-without-ownership-check
  await prisma.thread.delete({
    where: { id: params.id },
  });

  return new Response(null, { status: 204 });
}
