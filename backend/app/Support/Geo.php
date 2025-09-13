<?php
namespace App\Support;

class Geo {
    public static function haversineKm(float $lat1, float $lon1, float $lat2, float $lon2): float {
        $R=6371; $dLat=deg2rad($lat2-$lat1); $dLon=deg2rad($lon2-$lon1);
        $a=sin($dLat/2)**2 + cos(deg2rad($lat1))*cos(deg2rad($lat2))*sin($dLon/2)**2;
        return 2*$R*asin(min(1,sqrt($a)));
    }
}
