import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { getUser } from "@/lib/getUser";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const authUser = await getUser(req, res);
  if (!authUser) {
    res
      .status(401)
      .json({ error: { code: "UNAUTHORIZED", message: "Please sign in." } });
    return;
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400).json({
      error: {
        code: "MISSING_FIELDS",
        message: "Both passwords are required.",
      },
    });
    return;
  }

  if (newPassword.length < 8) {
    res.status(400).json({
      error: {
        code: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters.",
      },
    });
    return;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.userId))
    .limit(1);

  if (!user || !user.passwordHash) {
    res
      .status(400)
      .json({
        error: {
          code: "NO_PASSWORD",
          message: "No password set on this account.",
        },
      });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res
      .status(401)
      .json({
        error: {
          code: "INVALID_PASSWORD",
          message: "Current password is incorrect.",
        },
      });
    return;
  }

  const newHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash: newHash })
    .where(eq(users.id, authUser.userId));

  res.status(200).json({ ok: true });
}
