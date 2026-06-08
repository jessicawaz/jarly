import { db } from "@/lib/db/client";
import { budgets, users } from "@/lib/db/schema";
import { eq, notInArray } from "drizzle-orm";
import { DateTime } from "luxon";

export default async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(403).end(); // unauthorized
  }

  if (req.method === "POST") {
    const previousMonth = DateTime.now().minus({ months: 1 }).startOf("month").toFormat("yyyy-MM-dd");
    const currentMonth = DateTime.now().startOf("month").toFormat("yyyy-MM-dd");

    const usersNeedingBudget = await db
      .select()
      .from(users)
      .where(
        notInArray(
          users.id,
          db
            .select({ id: budgets.userId })
            .from(budgets)
            .where(eq(budgets.month, currentMonth)),
        ),
      );

    const previousBudgets = await db
      .select()
      .from(budgets)
      .where(eq(budgets.month, previousMonth));

    const budgetInserts = [];
    for (const user of usersNeedingBudget) {
      const prevBudget = previousBudgets.find((b) => b.userId === user.id);
      if (!prevBudget) {
        continue;
      }

      const userBudget = {
        userId: user.id,
        month: currentMonth,
        incomeCents: prevBudget.incomeCents,
        needsPct: prevBudget.needsPct,
        goalsPct: prevBudget.goalsPct,
        funPct: prevBudget.funPct,
        needsAmt: prevBudget.needsAmt,
        goalsAmt: prevBudget.goalsAmt,
        funAmt: prevBudget.funAmt,
      };
      budgetInserts.push(userBudget);
    }

    await db.insert(budgets).values(budgetInserts);

    return res.status(200).json({ sent: budgetInserts.length });
  }

  res.setHeader("Allow", ["POST"]);
  return res.status(405).end();
}
