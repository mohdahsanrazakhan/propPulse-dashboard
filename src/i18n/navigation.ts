import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

// Locale-aware Link / useRouter / usePathname / redirect: use these instead
// of the next/navigation and next/link equivalents anywhere under src/app.
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
