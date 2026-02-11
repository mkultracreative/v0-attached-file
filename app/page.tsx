import { stackServerApp } from "@/lib/stackServer";
import Link from "next/link";

export default async function HomePage() {
  const user = await stackServerApp.getUser();

  return (
    <main className="flex min-h-screen items-center justify-center">
      {!user ? (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Dazzle Resume</h1>
          <Link
            href="/handler/sign-in"
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Login with LinkedIn
          </Link>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">
            Welcome {user.displayName ?? user.email}
          </h1>
          <Link
            href="/app"
            className="px-6 py-3 bg-black text-white rounded-lg"
          >
            Open Dashboard
          </Link>
        </div>
      )}
    </main>
  );
}
