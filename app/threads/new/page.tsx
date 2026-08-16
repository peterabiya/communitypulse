"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewThreadPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/threads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, topic, body }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not post thread.");
      return;
    }
    const created = await res.json();
    router.push(`/threads/${created.id}`);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-8 font-display text-2xl font-bold">Start a thread</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="field-label" htmlFor="topic">
            Topic
          </label>
          <input
            id="topic"
            className="field-input"
            required
            maxLength={50}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. general, help, showcase"
          />
        </div>
        <div>
          <label className="field-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            className="field-input"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="body">
            Body
          </label>
          <textarea
            id="body"
            className="field-input min-h-[160px]"
            required
            maxLength={10000}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Posting…" : "Post thread"}
        </button>
      </form>
    </main>
  );
}
