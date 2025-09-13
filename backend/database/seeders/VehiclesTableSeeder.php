<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use DB;

class VehiclesTableSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('vehicles')->insert([
            [
                'user_id' => 1,
                'plate_number' => 'JOD-1234',
                'brand' => 'Toyota',
                'model' => 'Corolla',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => 2,
                'plate_number' => 'JOD-5678',
                'brand' => 'Nissan',
                'model' => 'Altima',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
