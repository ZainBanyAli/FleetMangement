"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, ArrowRight } from "lucide-react";
import Image from "next/image";


export default function HomePage() {
  const { token, logout } = useAuth(); // make sure your AuthContext exposes logout()

  return (
    <main className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      {/* Top nav */}
      <header className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-900 dark:bg-white grid place-items-center text-white dark:text-slate-900 font-bold">
            V
          </div>
          <span className="font-semibold">Vehicle Management Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link href="/vehicles">Vehicles</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          {token ? (
            <Button variant="destructive" onClick={logout}>
              Log out
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Sign in</Link>
            </Button>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 py-12 lg:py-16 grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Manage your fleet with clarity.
            </h1>

            <p className="text-slate-600 dark:text-slate-300 max-w-prose text-lg">
              Vehicles, distances, and insights beautifully organized. A
              streamlined portal to add, edit, and track vehicles, monitor total
              distance, and get quick insights .
            </p>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="inline-flex items-center gap-2">
                <Link href={token ? "/dashboard" : "/login"}>
                  {token ? "Go to Dashboard" : "Get Started"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/vehicles">Manage Vehicles</Link>
              </Button>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border bg-gradient-to-br from-slate-200/70 to-slate-300/40 dark:from-slate-800/60 dark:to-slate-900/60">
            {/* Hero image */}
<div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border">
  <Image
    src="/car.jpg" 
    alt="Car fleet"
    fill
    className="object-cover"
    priority
    sizes="(max-width: 1024px) 100vw, 50vw"
  />
</div>

          </div>
        </div>
      </section>
    </main>
  );
}
