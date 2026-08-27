import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "./db";
import User from "@/models/User";
import { checkRateLimit } from "./rate-limiter";
import { authConfig } from "./auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials, request) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        // Rate limit by IP + email to slow down brute force / credential stuffing
        const forwardedFor = request?.headers?.get("x-forwarded-for");
        const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";
        const rateLimitKey = `login:${ip}:${email.toLowerCase()}`;
        const { allowed } = checkRateLimit(rateLimitKey);
        if (!allowed) {
          throw new Error("Too many login attempts. Please try again later.");
        }

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() }).lean();
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) return null;

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.company,
          reraBrn: user.reraBrn,
        };
      },
    }),
  ],
});
