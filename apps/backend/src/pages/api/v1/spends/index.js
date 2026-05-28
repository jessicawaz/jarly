import { db } from "@/lib/db/client";
import { budgets, goals, spends } from "@/lib/db/schema";
import { getUser } from "@/lib/getUser";
import { and, eq, gte, lt } from "drizzle-orm";
import { DateTime } from "luxon";

export default async function handler(req, res) {
  const user = await getUser(req, res);
  if (!user) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Please sign in." },
    });
  }

  if (req.method === "GET") {
    const { from, to } = req.query;

    const now = DateTime.now();
    const start = from ? new Date(from) : now.startOf("month").toJSDate();
    const end = to
      ? new Date(to)
      : now.plus({ months: 1 }).startOf("month").toJSDate();

    const conditions = [
      eq(spends.userId, user.userId),
      lt(spends.createdAt, end),
    ];

    if (from) {
      conditions.push(gte(spends.createdAt, start));
    }

    const filteredSpends = await db
      .select()
      .from(spends)
      .where(and(...conditions));

    return res.status(200).json({ data: filteredSpends });
  }

  if (req.method === "POST") {
    // POST - new spend
    const { amount, jar, goalId, label } = req.body;
    if (!amount || !jar) {
      return res.status(400).json({
        error: { code: "MISSING_FIELDS", message: "Missing spend data." },
      });
    }

    const now = DateTime.now();
    const monthYear = now.startOf("month").toISODate(); // 2026-05-01

    const [budget] = await db
      .select()
      .from(budgets)
      .where(and(eq(budgets.userId, user.userId), eq(budgets.month, monthYear)))
      .limit(1);

    if (!budget) {
      res.status(400).json({
        error: {
          code: "NO_BUDGET",
          message: "No budget found for this month.",
        },
      });
      return;
    }

    const [spend] = await db
      .insert(spends)
      .values({
        userId: user.userId,
        budgetId: budget.id,
        goalId: goalId || null,
        jar,
        amountCents: Number(amount),
        label: label || null,
      })
      .returning();

    if (goalId) {
      const [currentGoal] = await db
        .select()
        .from(goals)
        .where(eq(goals.id, goalId))
        .limit(1);

      if (currentGoal) {
        const update = { savedCents: currentGoal.savedCents + Number(amount) };
        if (
          currentGoal.targetCents >=
          currentGoal.savedCents + Number(amount)
        ) {
          update.completedAt = DateTime.now();
        }
        await db.update(goals).set(update).where(eq(goals.id, goalId));
      }
    }

    return res.status(201).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
