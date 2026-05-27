import { db } from "@/lib/db/client";
import { spends } from "@/lib/db/schema";
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

  const now = DateTime.now();
  const monthStart = now.startOf("month").toJSDate();
  const monthEnd = now.plus({ months: 1 }).startOf("month").toJSDate();

  if (req.method === "GET") {
    const currentSpends = await db
      .select()
      .from(spends)
      .where(
        and(
          eq(spends.userId, user.userId),
          gte(spends.createdAt, monthStart),
          lt(spends.createdAt, monthEnd),
        ),
      );
    return res.status(200).json({ data: currentSpends });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end();
}
