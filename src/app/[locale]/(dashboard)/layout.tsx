import { getLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Providers } from "@/components/layout/Providers";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    const locale = await getLocale();
    redirect({ href: "/login", locale });
    return null;
  }

  return (
    <Providers>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <Sidebar company={session.user.company} reraBrn={session.user.reraBrn} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header
            userName={session.user.name ?? "Agency Owner"}
            company={session.user.company}
            reraBrn={session.user.reraBrn}
            role={session.user.role}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
