<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Requests\LocationRequest;
use App\Models\Vehicle;
use App\Services\GpsLocationService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Log;

class GpsLocationController extends Controller
{
    use ApiResponse;

    // No middleware() here in Laravel 11
    public function __construct(private GpsLocationService $service)
    {
        // middleware handled in routes/api.php group
    }

    public function index(Vehicle $vehicle)
    {
        try {
            return $this->ok($this->service->list($vehicle));
        } catch (AuthorizationException $e) {
            return $this->fail('Forbidden', 403);
        } catch (\Throwable $e) {
            Log::error('Locations.index', ['e' => $e, 'vehicle' => $vehicle->id ?? null]);
            return $this->fail('Failed to fetch locations', 500);
        }
    }

    public function store(LocationRequest $request, Vehicle $vehicle)
    {
        try {
            return $this->created($this->service->create($vehicle, $request->validated()), 'Location created');
        } catch (AuthorizationException $e) {
            return $this->fail('Forbidden', 403);
        } catch (\Throwable $e) {
            Log::error('Locations.store', ['e' => $e, 'vehicle' => $vehicle->id ?? null]);
            return $this->fail('Failed to create location', 500);
        }
    }
}
