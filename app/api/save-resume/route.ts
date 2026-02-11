import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stackServer";
import { query } from "@/lib/db";

export async function POST(req: Request) {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const resumeContent = body.resume_content;

  const userRes = await query(
    `SELECT id FROM users WHERE stack_user_id=$1 LIMIT 1`,
    [user.id]
  );

  if (userRes.rowCount === 0) {
    return NextResponse.json({ error: "user_missing" }, { status: 400 });
  }

  const userId = userRes.rows[0].id;

  await query(
    `
                                              UPDATE people
                                                  SET resume_content=$1, updated_at=now()
                                                      WHERE user_id=$2
                                                          `,
    [resumeContent, userId]
  );

  return NextResponse.json({ ok: true });
}
