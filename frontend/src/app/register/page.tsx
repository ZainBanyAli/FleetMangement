"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  // ✅ start empty (placeholders only)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { token, setToken } = useAuth();

  // If already logged in, skip register
  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSubmitting(true);
    try {
      const res = await apiFetch<{ token: string; user: any }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      // Save token if your API returns it, then send them to login (your original behavior)
      setToken(res.token);
      router.replace("/login");
      // If you prefer to go straight to the app:
      // router.replace("/dashboard");
    } catch (err: any) {
      const msg = err?.details?.message || err?.message || "Register failed";
      setError(typeof msg === "string" ? msg : "Register failed");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = name.trim() && email.trim() && password.length >= 6 && !submitting;
  const passwordStrength = getPasswordStrength(password);

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-black flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md shadow-2xl backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/60">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>Join and start managing your fleet in minutes.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Registration failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={onSubmit} className="space-y-4" noValidate autoComplete="off">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid place-items-center pl-3">
                  <User className="h-4 w-4 text-slate-400" />
                </span>
                <Input
                  id="name"
                  name="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-9"
                  autoComplete="name"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid place-items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </span>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  autoComplete="email"
                  inputMode="email"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 grid place-items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </span>
                <Input
                  id="password"
                  name="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10"
                  autoComplete="new-password"
                  disabled={submitting}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute inset-y-0 right-0 grid place-items-center pr-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className={
                    "h-full transition-all " +
                    (passwordStrength === "weak"
                      ? "w-1/3 bg-red-500"
                      : passwordStrength === "medium"
                      ? "w-2/3 bg-amber-500"
                      : "w-full bg-emerald-500")
                  }
                />
              </div>
              <p className="text-xs text-slate-500">Strength: {passwordStrength}</p>
            </div>

            <Button type="submit" className="w-full group" disabled={!canSubmit}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account…
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </Button>

            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              Already have an account?{" "}
              <Link href="/login" className="font-medium underline-offset-4 hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function getPasswordStrength(pw: string): "weak" | "medium" | "strong" {
  if (!pw) return "weak";
  let score = 0;
  if (pw.length >= 6) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return score >= 3 ? "strong" : score === 2 ? "medium" : "weak";
}
