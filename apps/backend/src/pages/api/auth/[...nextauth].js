// NextAuth.js catch-all
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

export default NextAuth(authOptions);
