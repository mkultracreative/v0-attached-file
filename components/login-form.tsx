"use client";

import { useRouter } from "next/navigation";
import { useStackApp } from "@stackframe/stack";

export default function LoginForm() {
  const stackApp = useStackApp();
  const router = useRouter();

  async function handleLogin() {
    await stackApp.signInWithOAuth("linkedin");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-black text-white rounded-lg"
    >
      Login with LinkedIn
    </button>
  );
}
