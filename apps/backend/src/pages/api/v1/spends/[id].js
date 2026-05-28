import { and, eq, sql } from "drizzle-orm";

import { db } from "@/lib/db/client";
import { goals, spends } from "@/lib/db/schema";
import { getUser } from "@/lib/getUser";

export default async function handler(req, res) {
  const user = await getUser(req, res);
  if (!user) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Please sign in." },
    });
  }

  const spendId = req.query.id;

  if (req.method === "PATCH") {
    // PATCH - update spend
    const { amount, label, jar, goalId } = req.body;

    await db
      .update(spends)
      .set({
        amountCents: Number(amount),
        jar,
        label,
        goalId,
      })
      .where(and(eq(spends.id, spendId), eq(spends.userId, user.userId)))
      .returning();

    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // DELETE - delete spend

    await db
      .delete(spends)
      .where(and(eq(spends.id, spendId), eq(spends.userId, user.userId)));

    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", ["PATCH", "DELETE"]);
  return res.status(405).end();
}
