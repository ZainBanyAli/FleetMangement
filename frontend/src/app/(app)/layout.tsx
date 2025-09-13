// frontend/src/app/(app)/layout.tsx
import React from "react";
import Nav from "@/components/Nav";
import "leaflet/dist/leaflet.css"; // your map CSS
import AppShell from "@/components/AppShell";


export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell title="Dashboard">{children}</AppShell>;
}