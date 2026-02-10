import { stackServer } from "@/lib/stack/server";
import { redirect } from "next/navigation";

export default async function Page({ request }: any) {
  const user = await stackServer.getUser({ request });

  if (!user) redirect("/login");

  const account = await user.getConnectedAccount("linkedin");
  if (!account) redirect("/login");

  const token = await account.useAccessToken();

  const profile = await fetch("https://api.linkedin.com/v2/me", {
    headers: { Authorization: `Bearer ${token.accessToken}` },
  }).then((r) => r.json());

  return (
    <main>
      <h1>Dashboard</h1>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </main>
  );
}
