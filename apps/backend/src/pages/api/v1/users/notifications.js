import { getUser } from "@/lib/getUser";
import { db } from "@/lib/db/client";
import { notifications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== "GET" & req.method !== "PATCH") {
    return res.status(405).end();
  }

  const user = await getUser(req, res);
  if (!user) {
    return res.status(401).json({
      error: { code: "UNAUTHORIZED", message: "Please sign in." },
    });
  }

  if (req.method === "GET") {
    // Update notifs table where userId matches
    const notifPrefs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.userId));

    return res.status(200).json({ data: notifPrefs });
  } else {
    const { monthlyRecap, jarWarnings, goalMilestones } = req.body;

    await db
      .update(notifications)
      .set({ monthlyRecap, jarWarnings, goalMilestones })
      .where(eq(notifications.userId, user.userId));

    return res.status(200).json({ ok: true });
  }
}
