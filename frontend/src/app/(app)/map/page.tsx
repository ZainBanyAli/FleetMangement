"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw } from "lucide-react";

// --- Leaflet (client-only) ---
const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
) as any;
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
) as any;
const Polyline = dynamic(
  () => import("react-leaflet").then((m) => m.Polyline),
  { ssr: false }
) as any;

type Vehicle = { id: number; plate_number: string; brand: string; model: string };
type GpsPoint = { latitude: number; longitude: number; timestamp?: string | number };

/** Fit to Jordan by default; fit to route when available */
function FitJordanOrRoute({ polyline }: { polyline: [number, number][] }) {
  const { useMap } = require("react-leaflet");
  const map = useMap();

  useEffect(() => {
    const L = require("leaflet");
    if (polyline.length >= 2) {
      map.fitBounds(L.latLngBounds(polyline), { padding: [20, 20] });
    } else if (polyline.length === 1) {
      map.setView(polyline[0], 13);
    } else {
      // Jordan bounds
      const jordan = L.latLngBounds([29.1, 34.9], [33.4, 39.3]);
      map.fitBounds(jordan);
    }
  }, [map, polyline]);

  return null;
}

export default function MapPage() {
  const { token } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!token) router.replace("/register");
  }, [token, router]);

  if (!token) return null; // block render until redirect

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [gps, setGps] = useState<GpsPoint[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);

  const polyline = useMemo<[number, number][]>(
    () => gps.map((p) => [Number(p.latitude), Number(p.longitude)] as [number, number]),
    [gps]
  );
  const center: [number, number] = polyline[0] ?? [31.963158, 35.930359]; // Amman

  // Load vehicles
  useEffect(() => {
    (async () => {
      const res = await apiFetch<{ data: Vehicle[] }>("/vehicles", {}, token!);
      const list = res.data || [];
      setVehicles(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load GPS of selected vehicle
  const reloadGps = async () => {
    if (!token || selectedId == null) return;
    setGpsLoading(true);
    try {
      const res = await apiFetch<{ data: GpsPoint[] }>(
        `/vehicles/${selectedId}/locations`,
        {},
        token
      );
      const data = (res.data || [])
        .map((p) => ({
          latitude: Number(p.latitude),
          longitude: Number(p.longitude),
          timestamp: p.timestamp,
        }))
        .filter((p) => !Number.isNaN(p.latitude) && !Number.isNaN(p.longitude))
        .sort((a, b) => {
          const ta = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tb = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return ta - tb;
        });
      setGps(data);
    } finally {
      setGpsLoading(false);
    }
  };

  useEffect(() => {
    reloadGps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, token]);

  return (
    <div className="space-y-4">
      {/* Toolbar (ensure it's above the map) */}
      <div className="relative z-20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Select
            value={selectedId != null ? String(selectedId) : ""}
            onValueChange={(v) => setSelectedId(Number(v))}
          >
            <SelectTrigger className="h-10 w-56">
              <SelectValue placeholder="Select a vehicle" />
            </SelectTrigger>

            {/* High z-index + popper positioning so it renders above the map */}
            <SelectContent position="popper" className="z-[9999]">
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={String(v.id)}>
                  {v.plate_number} • {v.brand} {v.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="secondary"
            onClick={reloadGps}
            disabled={gpsLoading || selectedId == null}
            className="inline-flex items-center gap-2 rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${gpsLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <Link
          href="/vehicles"
          className="rounded-full bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800 transition"
        >
          Manage Vehicles
        </Link>
      </div>

      {/* Map (lower stacking order than toolbar/select) */}
      <div className="relative z-10 h-[calc(100vh-14rem)] min-h-[420px] rounded-xl border-4 border-indigo-600 shadow-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={7}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          className="!z-0" // keep the map below the dropdown
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {polyline.length > 0 && <Polyline positions={polyline} />}
          <FitJordanOrRoute polyline={polyline} />
        </MapContainer>
      </div>
    </div>
  );
}
