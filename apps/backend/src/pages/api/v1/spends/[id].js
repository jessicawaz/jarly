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

    const [prevSpend] = await db
      .select({
        jar: spends.jar,
        goalId: spends.goalId,
        amountCents: spends.amountCents,
      })
      .from(spends)
      .where(eq(spends.id, spendId));

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

    if (prevSpend.jar === "Goals" && jar === "Goals") {
      if (prevSpend.goalId === goalId) {
        // recalc saved cents
        await db
          .update(goals)
          .set({
            savedCents: sql`${goals.savedCents} - ${prevSpend.amountCents} + ${Number(amount)}`,
          })
          .where(and(eq(goals.id, goalId), eq(goals.userId, user.userId)));
      } else {
        // remove from old goal, add to new goal
        await db
          .update(goals)
          .set({
            savedCents: sql`${goals.savedCents} - ${prevSpend.amountCents}`,
          })
          .where(
            and(eq(goals.id, prevSpend.goalId), eq(goals.userId, user.userId)),
          );

        await db
          .update(goals)
          .set({
            savedCents: sql`${goals.savedCents} + ${Number(amount)}`,
          })
          .where(and(eq(goals.id, goalId), eq(goals.userId, user.userId)));
      }
    } else if (prevSpend.jar !== "Goals" && jar === "Goals") {
      // add to new goal
      await db
        .update(goals)
        .set({
          savedCents: sql`${goals.savedCents} + ${Number(amount)}`,
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, user.userId)));
    } else if (prevSpend.jar === "Goals" && jar !== "Goals") {
      // subtract from old goal
      await db
        .update(goals)
        .set({
          savedCents: sql`${goals.savedCents} - ${prevSpend.amountCents}`,
        })
        .where(
          and(eq(goals.id, prevSpend.goalId), eq(goals.userId, user.userId)),
        );
    }

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
