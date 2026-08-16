"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CommentForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch(`/api/threads/${threadId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not post comment.");
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <textarea
        className="field-input min-h-[100px]"
        required
        maxLength={5000}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment"
      />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" className="btn-primary mt-3" disabled={submitting}>
        {submitting ? "Posting…" : "Comment"}
      </button>
    </form>
  );
}
