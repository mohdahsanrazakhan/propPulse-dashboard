import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: string;
      company: string;
      reraBrn: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: string;
    company: string;
    reraBrn: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    company?: string;
    reraBrn?: string;
  }
}
