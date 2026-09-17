import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: { threads: { orderBy: { createdAt: "desc" }, take: 20 } },
  });

  if (!user) notFound();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-bold">@{user.username}</h1>
      {user.bio && <p className="mt-2 text-ink/80">{user.bio}</p>}

      <div className="mt-8 space-y-3">
        {user.threads.map((t) => (
          <Link key={t.id} href={`/threads/${t.id}`} className="thread-card">
            <span className="topic-pill">{t.topic}</span>
            <h2 className="mt-3 font-display text-lg font-bold">{t.title}</h2>
          </Link>
        ))}
        {user.threads.length === 0 && (
          <p className="py-6 text-sm text-muted">No threads posted yet.</p>
        )}
      </div>
    </main>
  );
}
