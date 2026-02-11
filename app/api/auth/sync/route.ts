import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stackServer";
import { query } from "@/lib/db";

export async function POST() {
  const user = await stackServerApp.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const stackUserId = user.id;
  const email =
    user.email ?? (user.primaryEmail ? user.primaryEmail.email : null) ?? null;

  const displayName = user.displayName ?? null;
  const avatar = user.avatarUrl ?? null;

  const upsertUser = await query(
    `
                                        INSERT INTO users (stack_user_id, email, display_name, avatar_url, updated_at)
                                            VALUES ($1,$2,$3,$4,now())
                                                ON CONFLICT (stack_user_id)
                                                    DO UPDATE SET email=$2, display_name=$3, avatar_url=$4, updated_at=now()
                                                        RETURNING id;
                                                            `,
    [stackUserId, email, displayName, avatar]
  );

  const userId = upsertUser.rows[0].id;

  const peopleRes = await query(
    `SELECT id, resume_content FROM people WHERE user_id=$1 LIMIT 1`,
    [userId]
  );

  let needsEnrich = false;

  if (peopleRes.rowCount === 0) {
    await query(`INSERT INTO people (user_id) VALUES ($1)`, [userId]);
    needsEnrich = true;
  } else {
    needsEnrich = peopleRes.rows[0].resume_content === null;
  }

  return NextResponse.json({
    ok: true,
    needsEnrich,
  });
}
