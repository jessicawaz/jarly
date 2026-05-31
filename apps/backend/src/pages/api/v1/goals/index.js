import { and, eq, isNull } from "drizzle-orm";

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

  if (req.method === "GET") {
    // GET - list all active goals w progess
    const savedGoals = await db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, user.userId), isNull(goals.archivedAt)));

    return res.status(200).json({ data: savedGoals });
  }

  if (req.method === "POST") {
    // POST - create a new goal
    const { name, targetCents, targetDate, category } = req.body;
    
    if (!name || !targetCents || !targetDate || !category) {
      return res.status(400).json({
        error: { code: "MISSING_FIELDS", message: "Missing goal data." },
      });
    }

    const [goal] = await db
      .insert(goals)
      .values({
        userId: user.userId,
        name,
        targetCents: Number(targetCents),
        targetDate,
        category: category,
      })
      .returning();

    return res.status(201).json({ ok: true });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
