// GET current user profile + jar settings
// PATCH update income, jar split, display name
// DELETE account & all assoc data
import { eq, and } from "drizzle-orm";
import { DateTime } from "luxon";

import { db } from "@/lib/db/client";
import { users, budgets } from "@/lib/db/schema";
import { getUser } from "@/lib/getUser";

export default async function handler(req, res) {
  const authUser = await getUser(req, res);
  if (!authUser) {
    return res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Please sign in." } });
  }

  const now = DateTime.now();
  const monthYear = now.startOf("month").toISODate(); // 2026-05-01

  if (req.method === "GET") {
    const result = await db
      .select()
      .from(users)
      .leftJoin(budgets, eq(users.id, budgets.userId))
      .where(and(eq(users.id, authUser.userId), eq(budgets.month, monthYear)))
      .orderBy(budgets.month)
      .limit(1);

    if (!result.length) {
      return res
        .status(404)
        .json({ error: { code: "NOT_FOUND", message: "User not found." } });
    }

    const { users: user, budgets: budget } = result[0];

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        monthlyIncomeCents: user.monthlyIncome,
        onboardedAt: user.onboardedAt,
      },
      budget: budget
        ? {
            id: budget.id,
            incomeCents: budget.incomeCents,
            needsPct: budget.needsPct,
            goalsPct: budget.goalsPct,
            funPct: budget.funPct,
            needsAmt: budget.needsAmt,
            goalsAmt: budget.goalsAmt,
            funAmt: budget.funAmt,
          }
        : null,
    });
  }

  if (req.method === "PATCH") {
    const { displayName, monthlyIncomeCents, needsPct, goalsPct, funPct } =
      req.body;

    // Update user fields (only displayName exists on users table)
    if (displayName) {
      await db
        .update(users)
        .set({ displayName })
        .where(eq(users.id, authUser.userId));
    }

    // Update budget fields
    if (
      monthlyIncomeCents !== undefined ||
      needsPct !== undefined ||
      goalsPct !== undefined ||
      funPct !== undefined
    ) {
      const now = DateTime.now();
      const monthYear = now.startOf("month").toISODate();

      const budgetUpdates = {};
      if (monthlyIncomeCents !== undefined) {
        budgetUpdates.incomeCents = monthlyIncomeCents;
      }
      if (needsPct !== undefined) {
        budgetUpdates.needsPct = needsPct;
      }
      if (goalsPct !== undefined) {
        budgetUpdates.goalsPct = goalsPct;
      }
      if (funPct !== undefined) {
        budgetUpdates.funPct = funPct;
      }

      if (
        needsPct !== undefined ||
        goalsPct !== undefined ||
        funPct !== undefined
      ) {
        // Get current income to recalculate
        const [currentBudget] = await db
          .select()
          .from(budgets)
          .where(
            and(
              eq(budgets.userId, authUser.userId),
              eq(budgets.month, monthYear),
            ),
          )
          .limit(1);

        if (currentBudget) {
          const income = currentBudget.incomeCents;
          const n = needsPct ?? currentBudget.needsPct;
          const g = goalsPct ?? currentBudget.goalsPct;
          const f = funPct ?? currentBudget.funPct;

          budgetUpdates.needsAmt = Math.round((n / 100) * income);
          budgetUpdates.goalsAmt = Math.round((g / 100) * income);
          budgetUpdates.funAmt = Math.round((f / 100) * income);
        }
      }

      await db
        .update(budgets)
        .set(budgetUpdates)
        .where(
          and(
            eq(budgets.userId, authUser.userId),
            eq(budgets.month, monthYear),
          ),
        );
    }

    res.status(200).json({ ok: true });
    return;
  }

  res.setHeader("Allow", ["GET", "PATCH"]);
  return res.status(405).end();
}
