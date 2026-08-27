"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEMO_CREDENTIALS } from "@/lib/constants";
import { PropPulseLogo } from "@/components/shared/PropPulseLogo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export default function LoginPage() {
  const t = useTranslations("login");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(result.error === "Configuration" ? t("errorRateLimited") : t("errorInvalid"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute end-4 top-4">
        <LocaleSwitcher />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <PropPulseLogo className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tCommon("brand")}</h1>
            <p className="text-sm text-muted-foreground">{tCommon("tagline")}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-foreground">{t("signInHeading")}</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("signIn")}
              </Button>
            </form>

            <div className="mt-5 rounded-lg border border-border bg-muted/50 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{t("demoCredentials")}</p>
              <p className="mt-1">{t("demoEmail", { email: DEMO_CREDENTIALS.email })}</p>
              <p>{t("demoPassword", { password: DEMO_CREDENTIALS.password })}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
