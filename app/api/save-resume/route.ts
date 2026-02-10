"use client";

import { stackClient } from "@/lib/stack/client";

export default function LoginPage() {
  const login = async () => {
    await stackClient.signInWithOAuth("linkedin");
  };

  return (
    <div className= "login" >
    <button onClick={ login }>
      Login with LinkedIn
      < /button>
      < /div>
  );
}