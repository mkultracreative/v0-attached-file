"use client";

import { stackClient } from "@/lib/stack/client";

export default function LoginForm() {
  const handleLogin = async () => {
    await stackClient.signInWithOAuth("linkedin");
  };

  return (
    <div>
      <button onClick={handleLogin}>Continue with LinkedIn</button>
    </div>
  );
}
