import NextAuth from "next-auth";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { authConfig } from "@/lib/auth.config";
import { routing } from "@/i18n/routing";

// Edge-safe auth instance (no Credentials provider / bcrypt / mongoose);
// see lib/auth.config.ts for why this is split from lib/auth.ts.
const { auth } = NextAuth(authConfig);

// Locale routing/negotiation for non-API pages. `always` means every locale,
// including the default ("en"), is served under an explicit /en or /ar prefix.
const intlMiddleware = createMiddleware(routing);

const PUBLIC_PATHS = ["/login", "/api/auth"];

// Strip a leading /ar (or /en) locale segment so auth/public-path checks
// operate on the locale-agnostic path.
function stripLocale(pathname: string) {
  const match = pathname.match(/^\/(en|ar)(\/.*)?$/);
  return match ? (match[2] ?? "/") : pathname;
}

function localeFromPathname(pathname: string) {
  const match = pathname.match(/^\/(en|ar)(\/|$)/);
  return match ? match[1] : routing.defaultLocale;
}

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return response;
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return withSecurityHeaders(NextResponse.next());
  }

  // API routes are not locale-prefixed and don't go through next-intl.
  if (pathname.startsWith("/api")) {
    if (isPublicPath(pathname)) {
      return withSecurityHeaders(NextResponse.next());
    }
    const session = await auth();
    if (!session?.user) {
      return withSecurityHeaders(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    }
    return withSecurityHeaders(NextResponse.next());
  }

  const bare = stripLocale(pathname);

  if (isPublicPath(bare)) {
    return withSecurityHeaders(intlMiddleware(req));
  }

  const session = await auth();
  if (!session?.user) {
    const locale = localeFromPathname(pathname);
    const loginUrl = new URL(`/${locale}/login`, req.url);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return withSecurityHeaders(intlMiddleware(req));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
