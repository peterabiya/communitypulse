import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";
import type { User } from "@prisma/client";

/**
 * CommunityPulse has no admin role. Every account is equal, and the only
 * access control question that matters is: does the current session own
 * the thing it is trying to edit or delete. That is a narrower model than
 * LedgerLite or OpsConsole, and the narrowness is deliberate, not a gap.
 */

export class UnauthenticatedError extends Error {}
export class ForbiddenError extends Error {}
export class UsernameRequiredError extends Error {}

export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // Unlike LedgerLite/OpsConsole's silent upsert, CommunityPulse requires
  // a username before a user can post, so first-time visitors land in a
  // profile-setup step rather than getting a default identity assigned.
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new UnauthenticatedError("No active session or profile not set up");
  return user;
}

export function assertOwner(user: User, resourceAuthorId: string) {
  if (user.id !== resourceAuthorId) {
    throw new ForbiddenError("You do not own this resource");
  }
}
