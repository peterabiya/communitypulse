import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export default function Header() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold">
          CommunityPulse
        </Link>
        <div className="flex items-center gap-4">
          <SignedIn>
            <Link href="/threads/new" className="btn-primary">
              New thread
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className="btn-secondary">
              Sign in
            </Link>
          </SignedOut>
        </div>
      </div>
    </header>
  );
}
