import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CommentForm from "./comment-form";

export default async function ThreadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const thread = await prisma.thread.findUnique({
    where: { id: params.id },
    include: {
      author: true,
      comments: { orderBy: { createdAt: "asc" }, include: { author: true } },
    },
  });

  if (!thread) notFound();

  const currentUser = await getCurrentUser();

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <span className="topic-pill">{thread.topic}</span>
      <h1 className="mt-3 font-display text-2xl font-bold">{thread.title}</h1>
      <p className="mt-2 text-sm text-muted">
        by{" "}
        <Link href={`/u/${thread.author.username}`} className="text-blue">
          @{thread.author.username}
        </Link>
      </p>
      <p className="mt-6 whitespace-pre-wrap text-ink/90">{thread.body}</p>

      <div className="mt-10 border-t border-line pt-6">
        <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-muted">
          {thread.comments.length} comments
        </h2>
        <div className="space-y-4">
          {thread.comments.map((c) => (
            <div key={c.id} className="rounded-lg bg-white/60 p-4">
              <p className="whitespace-pre-wrap text-sm">{c.body}</p>
              <p className="mt-2 text-xs text-muted">
                <Link href={`/u/${c.author.username}`} className="text-blue">
                  @{c.author.username}
                </Link>
              </p>
            </div>
          ))}
        </div>

        {currentUser ? (
          <CommentForm threadId={thread.id} />
        ) : (
          <p className="mt-6 text-sm text-muted">
            <Link href="/sign-in" className="text-blue">
              Sign in
            </Link>{" "}
            to comment.
          </p>
        )}
      </div>
    </main>
  );
}
