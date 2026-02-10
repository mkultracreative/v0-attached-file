import { stackServer } from "@/lib/stack/server";

export async function connectLinkedIn(user: any) {
  const account = await user.useConnectedAccount("linkedin", {
    or: "redirect",
    scopes: ["r_liteprofile", "r_emailaddress", "openid", "profile", "email"],
  });

  const token = await account.useAccessToken();

  return { account, token };
}
