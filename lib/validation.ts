import { z } from "zod";

const USERNAME_RE = /^[a-z0-9_]{3,24}$/;

export const setUsernameSchema = z.object({
  username: z.string().regex(USERNAME_RE, "lowercase letters, numbers, underscore, 3-24 chars"),
  bio: z.string().max(280).optional(),
});

export const createThreadSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(10000),
  topic: z.string().min(1).max(50),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});

/**
 * Every field above is user-generated public content, rendered back to
 * every visitor, not just the author. React's JSX escaping already
 * protects the main render path, so this is a deliberate backstop for
 * anywhere content gets rendered outside JSX (an RSS export, an email
 * digest, the public API's JSON, which is safe by construction, but a
 * future HTML-rendering integration would not be). Kept here so the
 * pattern already exists in the repo before Project 7's design review
 * process would otherwise have to ask for it from scratch.
 */
export function escapeForNonJsxOutput(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
