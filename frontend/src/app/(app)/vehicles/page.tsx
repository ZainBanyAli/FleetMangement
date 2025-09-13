"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import VehicleForm, { type VehiclePayload } from "@/components/VehicleForm";

import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Car, Plus, Pencil, Trash2, RefreshCw, Search, Filter } from "lucide-react";

// Types
export type Vehicle = {
  id: number;
  plate_number: string;
  brand: string;
  model: string;
  created_at: string;
  updated_at: string;
};

export default function VehiclesPage() {
  // If you added `initialized` in AuthContext (recommended), use it to avoid flicker.
  const { token, initialized = true } = useAuth() as {
    token: string | null;
    initialized?: boolean;
  };
  const router = useRouter();

  // -------------------- hooks must be unconditonal (declare BEFORE any returns) --------------------
  const [rows, setRows] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [q, setQ] = useState("");
  const [brandFilter, setBrandFilter] = useState<string>("all");

  // Redirect unauthenticated users AFTER mount
  useEffect(() => {
    if (initialized && !token) {
      router.replace("/register");
    }
  }, [initialized, token, router]);

  // Load vehicles
  const load = async () => {
    if (!token) return; // guard if redirecting
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ message: string; data: Vehicle[] }>("/vehicles", {}, token);
      setRows(res.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load();
  }, [token]); // re-load when token becomes available

  const onCreate = async (data: VehiclePayload) => {
    if (!token) return;
    await apiFetch("/vehicles", { method: "POST", body: JSON.stringify(data) }, token);
    setCreating(false);
    await load();
  };

  const onUpdate = async (data: VehiclePayload) => {
    if (!token || !editingId) return;
    await apiFetch(`/vehicles/${editingId}`, { method: "PUT", body: JSON.stringify(data) }, token);
    setEditingId(null);
    await load();
  };

  const onDelete = async (id: number) => {
    if (!token) return;
    await apiFetch(`/vehicles/${id}`, { method: "DELETE" }, token);
    await load();
  };

  const currentEditing = useMemo(
    () => (editingId ? rows.find((r) => r.id === editingId) ?? null : null),
    [editingId, rows]
  );

  const brands = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => r.brand && s.add(r.brand));
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return rows.filter((r) => {
      const matchesText =
        !needle ||
        r.plate_number.toLowerCase().includes(needle) ||
        r.brand.toLowerCase().includes(needle) ||
        r.model.toLowerCase().includes(needle);
      const matchesBrand = brandFilter === "all" || r.brand === brandFilter;
      return matchesText && matchesBrand;
    });
  }, [rows, q, brandFilter]);

  // -------------------- conditional render AFTER hooks --------------------
  if (!initialized || !token) {
    // Either still checking storage or redirecting away — render nothing to avoid hook mismatch
    return null;
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-950 dark:to-black px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-5 w-5 text-slate-400" />
            <div>
              <h1 className="text-2xl font-semibold">Vehicles</h1>
              <p className="text-sm text-slate-500">Create, edit, and remove vehicles.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!creating && !editingId && (
              <Button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-white hover:bg-slate-800"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Couldn’t load vehicles</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create */}
        {creating && (
          <Card>
            <CardHeader>
              <CardTitle>Create Vehicle</CardTitle>
              <CardDescription>Fill in the details below.</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleForm onSubmit={onCreate} onCancel={() => setCreating(false)} />
            </CardContent>
          </Card>
        )}

        {/* Edit */}
        {editingId && currentEditing && (
          <Card>
            <CardHeader>
              <CardTitle>Edit Vehicle</CardTitle>
              <CardDescription>Update details and save your changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <VehicleForm
                initial={{
                  plate_number: currentEditing.plate_number,
                  brand: currentEditing.brand,
                  model: currentEditing.model,
                }}
                onSubmit={onUpdate}
                onCancel={() => setEditingId(null)}
              />
            </CardContent>
          </Card>
        )}

        {/* Table */}
        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>All Vehicles</CardTitle>
                <CardDescription>Manage your fleet records</CardDescription>
              </div>

              {/* Toolbar */}
              <div className="flex w-full md:w-auto items-center gap-2">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search plate, brand, model…"
                    className="pl-8"
                  />
                </div>

                <div className="relative">
                  <Button variant="outline" className="inline-flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {brandFilter === "all" ? "All brands" : brandFilter}
                  </Button>
                  <select
                    aria-label="Filter by brand"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                  >
                    <option value="all">All brands</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="relative">
              <Table className="whitespace-nowrap [&_th]:px-4 [&_th]:py-3 [&_td]:px-4 [&_td]:py-3">
                <TableCaption>
                  {loading
                    ? "Loading vehicles…"
                    : filtered.length === 0
                    ? "No matches."
                    : `${filtered.length} vehicle${filtered.length > 1 ? "s" : ""}`}
                </TableCaption>

                <TableHeader className="sticky top-0 z-10 bg-slate-100/70 backdrop-blur">
                  <TableRow className="[&>th]:text-slate-600 [&>th]:font-medium">
                    <TableHead className="w-[200px]">Plate</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead className="text-right w-[1%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <TableRow key={`sk-${i}`} className="border-b border-slate-100">
                          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-8 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    : filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="p-6">
                          <div className="rounded-lg border bg-white p-6 text-center">
                            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-slate-100 grid place-items-center">
                              <Car className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="font-medium">No vehicles found</div>
                            <p className="text-sm text-slate-500">
                              Try adjusting your search or filters.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((v, idx) => (
                        <TableRow
                          key={v.id}
                          className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${
                            idx % 2 ? "bg-white" : "bg-slate-50/40"
                          }`}
                        >
                          <TableCell className="font-medium">
                            <span className="inline-flex items-center gap-2">
                              <Badge variant="secondary" className="font-mono text-xs">
                                {v.plate_number}
                              </Badge>
                            </span>
                          </TableCell>
                          <TableCell className="text-slate-700">{v.brand}</TableCell>
                          <TableCell className="text-slate-700">{v.model}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Edit"
                                className="hover:bg-slate-100"
                                onClick={() => {
                                  setCreating(false);
                                  setEditingId(v.id);
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    title="Delete"
                                    className="hover:bg-red-50 text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete vehicle?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently remove the vehicle
                                      <span className="font-medium"> {v.plate_number}</span>.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => onDelete(v.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
