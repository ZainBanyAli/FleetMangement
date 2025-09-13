"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation"; // ✅ for redirect
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Car, Gauge, Plus, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false }) as any;
const TileLayer     = dynamic(() => import("react-leaflet").then(m => m.TileLayer),     { ssr: false }) as any;
const Polyline      = dynamic(() => import("react-leaflet").then(m => m.Polyline),      { ssr: false }) as any;

type VehicleWithDistance = {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  total_distance_km: number;
};

type GpsPoint = { latitude: number; longitude: number; timestamp?: string | number };

export default function DashboardPage() {
  const { token } = useAuth();
  const router = useRouter();

  // 🚫 redirect unauthenticated users to register
  useEffect(() => {
    if (!token) {
      router.replace("/register");
    }
  }, [token, router]);

  // prevent rendering until redirect check runs
  if (!token) return null;

  const [rows, setRows] = useState<VehicleWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gps, setGps] = useState<GpsPoint[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsErr, setGpsErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<{ data: VehicleWithDistance[] }>("/dashboard/vehicles", {}, token!);
      const list = res.data || [];
      setRows(list);
      if (list.length && selectedId == null) setSelectedId(list[0].id);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function loadGps(id: number) {
    setGpsLoading(true);
    setGpsErr(null);
    try {
      const r = await apiFetch<{ data: GpsPoint[] }>(`/vehicles/${id}/locations`, {}, token!);
      setGps(Array.isArray(r?.data) ? r.data : []);
    } catch (e: any) {
      setGpsErr(e?.message || "Failed to load GPS");
    } finally {
      setGpsLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-line */ }, [token]);
  useEffect(() => { if (selectedId != null) loadGps(selectedId); /* eslint-disable-line */ }, [selectedId, token]);

  const totalVehicles = rows.length;
  const totalDistance = useMemo(() => rows.reduce((s, r) => s + (+r.total_distance_km || 0), 0), [rows]);

  return (
    <div className="space-y-6">
      {/* Action Row */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Overview</div>
        <div className="flex gap-2">
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white px-3 py-2 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Manage Vehicles
          </Link>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Kpi title="Vehicles" icon={<Car className="h-5 w-5 text-indigo-600" />}>
          {loading ? "—" : totalVehicles}
        </Kpi>
        <Kpi title="Total Distance" icon={<Gauge className="h-5 w-5 text-indigo-600" />}>
          {loading ? "—" : `${totalDistance.toFixed(3)} km`}
        </Kpi>
        <Kpi title="Average / Vehicle" icon={<Gauge className="h-5 w-5 text-indigo-600" />}>
          {loading ? "—" : `${(totalVehicles ? totalDistance / totalVehicles : 0).toFixed(3)} km`}
        </Kpi>
      </div>

      {err && <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

      {/* Chart */}
      <div className="rounded-xl border bg-white p-4">
        <div className="mb-3 font-medium">Distance by Vehicle</div>
        <div className="h-64">
          {loading ? (
            <div className="text-sm text-slate-500">Loading…</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-slate-500">No vehicles yet.</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows.map(r => ({ name: r.plate_number, value: +r.total_distance_km || 0 }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v: number) => [`${v.toFixed(3)} km`, "Distance"]} />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Map */}
      <div id="map" className="rounded-xl border bg-white p-4">
        {/* ... your map logic unchanged ... */}
      </div>
    </div>
  );
}

function Kpi({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>{title}</span>
        {icon}
      </div>
      <div className="mt-2 text-3xl font-semibold">{children}</div>
    </div>
  );
}
