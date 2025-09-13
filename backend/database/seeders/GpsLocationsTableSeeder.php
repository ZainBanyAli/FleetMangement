<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use DB;

class GpsLocationsTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('gps_locations')->insert([
            [
                'vehicle_id' => 1,
                'latitude' => 32.5556789,
                'longitude' => 35.1234567,
                'timestamp' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'vehicle_id' => 2,
                'latitude' => 31.9556789,
                'longitude' => 35.9345678,
                'timestamp' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
