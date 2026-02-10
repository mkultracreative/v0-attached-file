import { StackServerApp } from "@stackframe/stack";

export const stackServer = new StackServerApp({
  projectId: process.env.STACK_PROJECT_ID!,
  secretKey: process.env.STACK_SECRET_KEY!,
  oauthScopesOnSignIn: {
    linkedin: ["r_liteprofile", "r_emailaddress", "openid", "profile", "email"],
  },
});
