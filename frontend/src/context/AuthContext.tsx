// /context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AuthCtx = {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  initialized: boolean; // true after we read storage once
};

const Ctx = createContext<AuthCtx | null>(null);

// Accept only non-empty, non-"null"/"undefined" tokens;
// Optional: if token looks like a JWT, reject if expired.
function sanitizeStoredToken(raw: string | null): string | null {
  if (!raw) return null;
  if (raw === "null" || raw === "undefined") return null;

  // Optional JWT expiry check:
  try {
    const parts = raw.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload?.exp && Date.now() / 1000 >= Number(payload.exp)) return null;
    }
  } catch {
    // not a JWT or malformed; ignore and treat as opaque token
  }
  return raw;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Read token once on mount (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("token");
    setTokenState(sanitizeStoredToken(raw));
    setInitialized(true);
  }, []);

  // Centralized setter to avoid storing bad values
  const setToken = (t: string | null) => {
    if (t && t !== "null" && t !== "undefined") {
      localStorage.setItem("token", t);
      setTokenState(t);
    } else {
      localStorage.removeItem("token");
      setTokenState(null);
    }
  };

  const logout = () => setToken(null);

  return (
    <Ctx.Provider value={{ token, setToken, logout, initialized }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
