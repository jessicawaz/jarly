import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function getUser(req, res) {
  // Try NextAuth session first (web)
  const session = await getServerSession(req, res, authOptions);
  if (session?.user?.id) {
    return { userId: session.user.id };
  }

  // Try Bearer token (mobile)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
      return { userId: decoded.userId };
    } catch (e) {
      return null;
    }
  }

  return null;
}
