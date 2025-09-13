"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { Menu, BarChart3, Car, Map as MapIcon, LogOut } from "lucide-react";

/**
 * Reusable pill button that matches your "Add Vehicle" / Save styling
 * Use in the header via the actions prop, e.g.:
 * <PillButton asChild><Link href="/vehicles">Manage Vehicles</Link></PillButton>
 */
export function PillButton({
  asChild,
  children,
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const base =
    "rounded-full bg-slate-900 px-5 py-2.5 text-white transition " +
    "hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed " +
    "focus:outline-none focus:ring-2 focus:ring-slate-300";

  if (asChild) {
    // when wrapping a Link, call like: <PillButton asChild><Link ...>Text</Link></PillButton>
    return (
      <span
        className={`${base} inline-flex items-center ${className}`}
        {...rest}
      >
        {children}
      </span>
    );
  }

  return (
    <button className={`${base} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export default function AppShell({
  title = "Dashboard",
  actions, // right-side header actions (pill buttons, etc.)
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const closeOnMobile = useCallback(() => {
    setOpen(false);
  }, []);

  const isActive = (href: string) => {
    // mark active for exact path or sub-routes
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/vehicles") return pathname.startsWith("/vehicles");
    if (href === "/map") return pathname === "/map";
    return pathname === href;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 lg:px-6 h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen((s) => !s)}
              className="lg:hidden rounded-md border px-2.5 py-2 hover:bg-slate-50"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-semibold">Fleet Portal</span>
            <span className="hidden sm:inline-block text-slate-400">/</span>
            <span className="hidden sm:inline-block text-sm text-slate-500">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Optional right-side buttons passed from pages (e.g., Manage Vehicles) */}
            {actions}
          </div>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r transition-transform duration-200 ${
            open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="px-4 py-4 text-xs font-semibold tracking-wider text-slate-400">
            MENU
          </div>

          <nav className="px-2 pb-4 space-y-1">
            <SideLink
              href="/dashboard"
              icon={<BarChart3 className="h-4 w-4" />}
              label="Dashboard"
              active={isActive("/dashboard")}
              onNavigate={closeOnMobile}
            />
            <SideLink
              href="/vehicles"
              icon={<Car className="h-4 w-4" />}
              label="Vehicles"
              active={isActive("/vehicles")}
              onNavigate={closeOnMobile}
            />
            <SideLink
              href="/map"
              icon={<MapIcon className="h-4 w-4" />}
              label="Map"
              active={isActive("/map")}
              onNavigate={closeOnMobile}
            />

            <div className="pt-4"></div>
          </nav>
        </aside>

        {/* Content area */}
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

function SideLink({
  href,
  icon,
  label,
  active,
  disabled,
  onNavigate,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onNavigate?: () => void;
}) {
  const base =
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition";
  const state = disabled
    ? "opacity-50 cursor-not-allowed"
    : active
    ? "bg-indigo-50 text-indigo-700"
    : "hover:bg-slate-50";

  if (disabled) {
    return (
      <div className={`${base} ${state}`}>
        {icon}
        <span>{label}</span>
      </div>
    );
  }

  return (
    <Link href={href} onClick={onNavigate} className={`${base} ${state}`}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
