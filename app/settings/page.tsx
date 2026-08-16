"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, bio }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Could not save profile.");
      return;
    }
    router.push("/");
  }

  return (
    <main className="mx-auto max-w-md px-6 py-10">
      <h1 className="mb-2 font-display text-2xl font-bold">Set up your profile</h1>
      <p className="mb-8 text-sm text-muted">
        A username is required before you can post or comment.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="field-label" htmlFor="username">
            Username
          </label>
          <input
            id="username"
            className="field-input"
            required
            pattern="[a-z0-9_]{3,24}"
            title="lowercase letters, numbers, underscore, 3-24 characters"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </div>
        <div>
          <label className="field-label" htmlFor="bio">
            Bio (optional)
          </label>
          <textarea
            id="bio"
            className="field-input"
            maxLength={280}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </main>
  );
}
