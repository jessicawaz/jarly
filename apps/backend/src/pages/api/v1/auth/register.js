import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { budgets, goals, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  // Sign up
  const {
    firstName,
    lastName,
    email,
    password,
    needsPct,
    goalsPct,
    funPct,
    income,
    goal,
  } = req.body;

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return res.status(400).json({
      error: {
        code: "EMAIL_TAKEN",
        message: "An account with that email already exists.",
      },
    });
  }

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

  if (goal) {
    const { name, targetCents, targetDate, category } = goal;
    if (!name || !targetCents || !targetDate || !category) {
      return res.status(400).json({
        error: { code: "MISSING_FIELDS", message: "Missing goal data." },
      });
    }
  }

  const pwHash = await bcrypt.hash(password, 12);

  try {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(users)
        .values({
          email,
          displayName: `${firstName} ${lastName}`,
          passwordHash: pwHash,
          onboardedAt: new Date(),
        })
        .returning();

      // Create budget
      const now = new Date();
      const month = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      await tx.insert(budgets).values({
        userId: user.id,
        month,
        incomeCents: Number(income) * 100,
        needsPct: Number(needsPct),
        goalsPct: Number(goalsPct),
        funPct: Number(funPct),
        needsAmt: Math.round((Number(needsPct) / 100) * Number(income) * 100),
        goalsAmt: Math.round((Number(goalsPct) / 100) * Number(income) * 100),
        funAmt: Math.round((Number(funPct) / 100) * Number(income) * 100),
      });

      // Create goal (if exists)
      if (goal) {
        await tx.insert(goals).values({
          userId: user.id,
          name: goal.name,
          targetCents: Number(goal.targetCents),
          targetDate: goal.targetDate,
          category: goal.category,
        });
      }
    });

    return res.status(201).json({ ok: true });
  } catch (err) {
    return res
      .status(500)
      .json({ error: { code: "SERVER_ERROR", message: err.message } });
  }
}
