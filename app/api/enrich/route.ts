import { stackServer } from "@/lib/stack/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await stackServer.getUser({ request: req });
  if (!user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const account = await user.getConnectedAccount("linkedin");
  if (!account)
    return NextResponse.json({ error: "no_linkedin" }, { status: 400 });

  const token = await account.useAccessToken();

  const emailData = await fetch(
    "https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))",
    { headers: { Authorization: `Bearer ${token.accessToken}` } }
  ).then((r) => r.json());

  const email = emailData?.elements?.[0]?.["handle~"]?.emailAddress;

  if (!email) {
    return NextResponse.json({ error: "email_not_found" }, { status: 400 });
  }

  return NextResponse.json({ email });
}
