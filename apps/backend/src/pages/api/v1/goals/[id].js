// PATCH - update name, emoji, target, or deadline
// DELETE - delete a goal permanently
import { and, eq, sql } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/lib/db/client";
import { goals } from "@/lib/db/schema";
import { getUser } from "@/lib/getUser";

export default async function handler(req, res) {
  const user = await getUser(req, res);
  if (!user) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Please sign in." },
    });
  }

  const goalId = req.query.id;

  if (req.method === "PATCH") {
    // PATCH - update goal
    const { name, targetCents, targetDate, category } = req.body;

    const [goal] = await db
      .update(goals)
      .set({
        name,
        targetCents: Number(targetCents),
        targetDate,
        category: category,
      })
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.userId)))
      .returning();

    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // DELETE - update archived_at to now

    const [goal] = await db
      .update(goals)
      .set({ archivedAt: sql`now()` })
      .where(and(eq(goals.id, goalId), eq(goals.userId, user.userId)))
      .returning();

    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  return res.status(405).end();
}
