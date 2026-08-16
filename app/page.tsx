import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const threads = await prisma.thread.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { author: true, _count: { select: { comments: true } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8 space-y-3">
        {threads.map((t) => (
          <Link key={t.id} href={`/threads/${t.id}`} className="thread-card">
            <span className="topic-pill">{t.topic}</span>
            <h2 className="mt-3 font-display text-lg font-bold">{t.title}</h2>
            <p className="mt-2 text-sm text-muted">
              by @{t.author.username} &middot; {t._count.comments} comments
            </p>
          </Link>
        ))}
        {threads.length === 0 && (
          <p className="py-10 text-center text-sm text-muted">
            No threads yet. Be the first to post.
          </p>
        )}
      </div>
    </main>
  );
}
