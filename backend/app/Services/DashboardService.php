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
            $pts = $v->locations()->orderBy('timestamp')->get(['latitude','longitude']);
            $total = 0.0;
            for ($i=1; $i<$pts->count(); $i++) {
                $a=$pts[$i-1]; $b=$pts[$i];
                $total += Geo::haversineKm($a->latitude,$a->longitude,$b->latitude,$b->longitude);
            }
            return [
                'id' => $v->id,
                'plate_number' => $v->plate_number,
                'brand' => $v->brand,
                'model' => $v->model,
                'total_distance_km' => round($total, 3),
            ];
        });
    }
}
