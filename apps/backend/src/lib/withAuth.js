import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function withAuth(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions);

  if (!session) {
    return {
      redirect: { destination: "/onboarding/welcome", permanent: false },
    };
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user || !user.onboardedAt) {
    return {
      redirect: { destination: "/onboarding/welcome", permanent: false },
    };
  }

  return { user };
}
