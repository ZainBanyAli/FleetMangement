<?php

namespace App\Services;

use App\Models\Vehicle;
use App\Support\Geo;
use Illuminate\Support\Facades\Auth;

class DashboardService
{
    public function vehiclesWithDistance()
    {
        return Vehicle::where('user_id', Auth::id())->get()->map(function ($v) {
            // IMPORTANT: include timestamp (or created_at) to allow gap checks
            $pts = $v->locations()
                ->orderBy('timestamp')
                ->get(['latitude','longitude','timestamp']);

            $n = $pts->count();
            if ($n < 2) {
                return $this->payload($v, 0.0);
            }

            $total = 0.0;
            $prev  = $pts[0];

            for ($i = 1; $i < $n; $i++) {
                $cur = $pts[$i];

                // Gap guard (e.g., > 120 minutes -> break chain)
                if (!empty($prev->timestamp) && !empty($cur->timestamp)) {
                    $gapMin = abs(strtotime((string)$cur->timestamp) - strtotime((string)$prev->timestamp)) / 60;
                    if ($gapMin > 120) { // tune for your sampling rate
                        $prev = $cur;
                        continue;
                    }
                }
                // Distance guard (e.g., > 10 km -> break chain)
                $d = Geo::haversineKm(
                    (float)$prev->latitude, (float)$prev->longitude,
                    (float)$cur->latitude,  (float)$cur->longitude
                );


                if ($d > 10) { // tune threshold (km)
                    $prev = $cur;
                    continue;
                }

                $total += $d;
                $prev   = $cur;
            }

            return $this->payload($v, round($total, 3));
        });
    }

    private function payload($v, float $km): array
    {
        return [
            'id' => $v->id,
            'plate_number' => $v->plate_number,
            'brand' => $v->brand,
            'model' => $v->model,
            'total_distance_km' => $km,
        ];
    }
}
