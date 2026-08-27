import type { NextAuthConfig } from "next-auth";
import { SESSION_MAX_AGE_SECONDS } from "./constants";

// Edge-safe auth config: no providers here (Credentials needs bcrypt + mongoose,
// which are Node-only APIs unsupported in the Edge middleware runtime).
// middleware.ts uses this directly; lib/auth.ts extends it with the full
// Credentials provider for use in API routes / server components.
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.company = user.company;
        token.reraBrn = user.reraBrn;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.company = token.company as string;
        session.user.reraBrn = token.reraBrn as string;
      }
      return session;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
