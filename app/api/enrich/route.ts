import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stackServer";
import { query } from "@/lib/db";

export async function POST() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const userRes = await query(
    `SELECT id FROM users WHERE stack_user_id=$1 LIMIT 1`,
    [user.id]
  );

  if (userRes.rowCount === 0) {
    return NextResponse.json({ error: "user_missing" }, { status: 400 });
  }

  const userId = userRes.rows[0].id;

  const peopleRes = await query(
    `SELECT id, resume_content FROM people WHERE user_id=$1 LIMIT 1`,
    [userId]
  );

  if (peopleRes.rowCount > 0 && peopleRes.rows[0].resume_content !== null) {
    return NextResponse.json({ skipped: true });
  }

  // DO NOT call enrichlayer here yet (per instruction)
  // Placeholder response
  return NextResponse.json({ readyForEnrichment: true });
}
