"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Car, Gauge, Plus, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// ---- react-leaflet (typed CSR components)
import type {
  MapContainerProps,
  TileLayerProps,
  PolylineProps,
} from "react-leaflet";

const MapContainer = dynamic<MapContainerProps>(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic<TileLayerProps>(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);
const Polyline = dynamic<PolylineProps>(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
);

// ---- Types
type VehicleWithDistance = {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  total_distance_km: number;
};

type GpsPoint = {
  latitude: number;
  longitude: number;
  timestamp?: string | number;
};

// ---- Helpers
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export default function DashboardPage() {
  const { token } = useAuth();
  const router = useRouter();

  // ---- State (hooks must be before any early return)
  const [rows, setRows] = useState<VehicleWithDistance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [gps, setGps] = useState<GpsPoint[]>([]);
  const [gpsLoading, setGpsLoading] = useState<boolean>(false);
  const [gpsErr, setGpsErr] = useState<string | null>(null);

  // ---- Redirect unauthenticated (no early return)
  useEffect(() => {
    if (!token) router.replace("/register");
  }, [token, router]);

  // --- Helpers
  function getErrMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (
      typeof err === "object" &&
      err !== null &&
      "message" in err &&
      typeof (err as any).message === "string"
    ) {
      return (err as { message: string }).message;
    }
    return "Unexpected error";
  }

  // ---- Loaders
  async function load(): Promise<void> {
    if (!token) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await apiFetch<{ data: VehicleWithDistance[] }>(
        "/dashboard/vehicles",
        {},
        token
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setRows(list);
      if (list.length && selectedId == null) {
        setSelectedId(list[0].id);
      }
    } catch (e: unknown) {
      setErr(getErrMessage(e) || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  async function loadGps(id: number): Promise<void> {
    if (!token) return;
    setGpsLoading(true);
    setGpsErr(null);
    try {
      const res = await apiFetch<{ data: GpsPoint[] }>(
        `/vehicles/${id}/locations`,
        {},
        token
      );
      const list = Array.isArray(res?.data) ? res.data : [];
      setGps(list);
    } catch (e: unknown) {
      setGpsErr(getErrMessage(e) || "Failed to load GPS");
    } finally {
      setGpsLoading(false);
    }
  }

  useEffect(() => {
    if (token) load();
  }, [token]);

  useEffect(() => {
    if (token && selectedId != null) loadGps(selectedId);
  }, [selectedId, token]);

  // ---- KPIs
  const totalVehicles = rows.length;

  // Fleet total (sum of API totals)
  const fleetTotalKm = useMemo(
    () => rows.reduce((s, r) => s + (+r.total_distance_km || 0), 0),
    [rows]
  );

  // API total for the selected vehicle
  const selectedVehicleTotalKm = useMemo(() => {
    const v = rows.find((r) => r.id === selectedId);
    return v ? +v.total_distance_km || 0 : 0;
  }, [rows, selectedId]);

  // Distance from the loaded GPS points (what’s on the map)
  const selectedGpsDistanceKm = useMemo(() => {
    if (!gps?.length) return 0;
    let d = 0;
    for (let i = 1; i < gps.length; i++) {
      d += haversineKm(
        +gps[i - 1].latitude,
        +gps[i - 1].longitude,
        +gps[i].latitude,
        +gps[i].longitude
      );
    }
    return d;
  }, [gps]);

  // ---- UI
  if (!token) {
    return <div className="p-6 text-slate-600">Redirecting to register…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Row */}
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Overview</div>
        <div className="flex items-center gap-2">
          <select
            className="border rounded-md px-2 py-2 text-sm"
            value={selectedId ?? ""}
            onChange={(e) =>
              setSelectedId(e.target.value ? Number(e.target.value) : null)
            }
            disabled={loading || rows.length === 0}
          >
            {rows.length === 0 ? (
              <option value="">No vehicles</option>
            ) : (
              rows.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.plate_number} ({v.brand} {v.model})
                </option>
              ))
            )}
          </select>

          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi
          title="Vehicles"
          icon={<Car className="h-5 w-5 text-indigo-600" />}
        >
          {loading ? "—" : totalVehicles}
        </Kpi>

        <Kpi
          title="Fleet Total"
          icon={<Gauge className="h-5 w-5 text-indigo-600" />}
        >
          {loading ? "—" : `${fleetTotalKm.toFixed(3)} km`}
        </Kpi>

        <Kpi
          title="Avg / Vehicle"
          icon={<Gauge className="h-5 w-5 text-indigo-600" />}
        >
          {loading
            ? "—"
            : `${(totalVehicles ? fleetTotalKm / totalVehicles : 0).toFixed(
                3
              )} km`}
        </Kpi>

        <Kpi
          title="Selected Vehicle"
          icon={<Gauge className="h-5 w-5 text-indigo-600" />}
        >
          {gpsLoading ? "—" : `${selectedGpsDistanceKm.toFixed(3)} km`}
          <div className="text-xs text-slate-500 mt-1">
            API total:{" "}
            {loading ? "—" : `${selectedVehicleTotalKm.toFixed(3)} km`}
          </div>
        </Kpi>
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </div>
      )}

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
              <BarChart
                data={rows.map((r) => ({
                  name: r.plate_number,
                  value: +r.total_distance_km || 0,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(v: number) => [`${v.toFixed(3)} km`, "Distance"]}
                />
                <Bar dataKey="value" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Map preview using loaded GPS */}
      <div id="map" className="rounded-xl border bg-white p-4">
        <div className="mb-3 font-medium">Track Preview</div>
        <div className="h-72 w-full">
          {gpsErr ? (
            <div className="text-sm text-red-600">{gpsErr}</div>
          ) : gpsLoading ? (
            <div className="text-sm text-slate-500">Loading GPS…</div>
          ) : gps.length < 2 ? (
            <div className="text-sm text-slate-500">Not enough points.</div>
          ) : (
            <MapContainer
              center={[gps[0].latitude, gps[0].longitude]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Polyline positions={gps.map((p) => [p.latitude, p.longitude])} />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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
