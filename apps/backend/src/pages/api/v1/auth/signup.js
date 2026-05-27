import bcrypt from "bcryptjs";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { firstName, lastName, email, password } = req.body;
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

  const pwHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      email,
      displayName: `${firstName} ${lastName}`,
      passwordHash: pwHash,
    })
    .returning();

  return res.status(201).json({ userId: user.id });
}
