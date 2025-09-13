<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Services\DashboardService;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __construct(private DashboardService $service)
    {
        
    }

    public function vehiclesWithDistance()
    {
        try {
            return $this->ok($this->service->vehiclesWithDistance(), 'OK');
        } catch (\Throwable $e) {
            Log::error('Dashboard.vehiclesWithDistance', ['e' => $e]);
            return $this->fail('Failed to compute distances', 500);
        }
    }
}
