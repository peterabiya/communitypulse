import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * PUBLIC INTEGRATION API — no API key, no auth, deliberately. Unlike
 * LedgerLite's /api/v1 (private data, gated by an API key) or
 * OpsConsole (nothing public at all), this endpoint's whole purpose is
 * to be openly readable, since thread listings are already public on
 * the site itself.
 *
 * That does not mean it is risk-free. Being public and unauthenticated
 * makes this exact endpoint the natural target for Project 8's chaos
 * engineering (a malformed-payload or high-volume flood test) and it is
 * one of the assets Project 10's inventory must always be able to
 * account for. Rate limiting is intentionally deferred to the Cloudflare
 * edge layer, the same pattern used across all three products.
 */
export async function GET() {
  const threads = await prisma.thread.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      title: true,
      topic: true,
      createdAt: true,
      author: { select: { username: true } },
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json(
    threads.map((t) => ({
      id: t.id,
      title: t.title,
      topic: t.topic,
      createdAt: t.createdAt,
      author: t.author.username,
      commentCount: t._count.comments,
    }))
  );
}
