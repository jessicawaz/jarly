import { getUser } from "@/lib/getUser";
import { db } from "@/lib/db/client";
import { users, budgets, notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const user = await getUser(req, res);
  if (!user) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Please sign in." },
    });
  }

  const { needsPct, goalsPct, funPct, income } = req.body;

  if (
    needsPct === undefined ||
    goalsPct === undefined ||
    funPct === undefined ||
    !income
  ) {
    return res.status(400).json({
      error: { code: "MISSING_FIELDS", message: "Missing budget data." },
    });
  }

  await db
    .update(users)
    .set({
      monthlyIncome: Number(income),
      needsPct: Number(needsPct),
      goalsPct: Number(goalsPct),
      onboardedAt: new Date(),
    })
    .where(eq(users.id, user.userId));

  const now = new Date();
  const month = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];

  const [budget] = await db
    .insert(budgets)
    .values({
      userId: user.userId,
      month,
      incomeCents: Number(income) * 100,
      needsPct: Number(needsPct),
      goalsPct: Number(goalsPct),
      funPct: Number(funPct),
      needsAmt: Math.round((Number(needsPct) / 100) * Number(income) * 100),
      goalsAmt: Math.round((Number(goalsPct) / 100) * Number(income) * 100),
      funAmt: Math.round((Number(funPct) / 100) * Number(income) * 100),
    })
    .returning();

    // Create notif row
    await db.insert(notifications).values({ userId: user.userId });

  return res.status(201).json({ budgetId: budget.id });
}
