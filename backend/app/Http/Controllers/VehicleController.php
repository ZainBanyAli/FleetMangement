<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Requests\VehicleRequest;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

class VehicleController extends Controller
{
    use ApiResponse;

   
    public function __construct(private VehicleService $service)
    {
      
    }

    public function index()
    {
        try {
            return $this->ok($this->service->listForCurrentUser());
        } catch (\Throwable $e) {
            Log::error('Vehicles.index', ['e' => $e]);
            return $this->fail('Failed to fetch vehicles', 500);
        }
    }

    public function store(VehicleRequest $request)
    {
        try {
            return $this->created($this->service->create($request->validated()), 'Vehicle created');
        } catch (\Throwable $e) {
            Log::error('Vehicles.store', ['e' => $e]);
            return $this->fail('Failed to create vehicle', 500);
        }
    }

    public function update(VehicleRequest $request, Vehicle $vehicle)
    {
        try {
            return $this->ok($this->service->update($vehicle, $request->validated()), 'Vehicle updated');
        } catch (AuthorizationException $e) {
            return $this->fail('Forbidden', 403);
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vehicle not found', 404);
        } catch (\Throwable $e) {
            Log::error('Vehicles.update', ['e' => $e, 'id' => $vehicle->id ?? null]);
            return $this->fail('Failed to update vehicle', 500);
        }
    }

    public function destroy(Vehicle $vehicle)
    {
        try {
            $this->service->delete($vehicle);
            return $this->noContent();
        } catch (AuthorizationException $e) {
            return $this->fail('Forbidden', 403);
        } catch (ModelNotFoundException $e) {
            return $this->fail('Vehicle not found', 404);
        } catch (\Throwable $e) {
            Log::error('Vehicles.destroy', ['e' => $e, 'id' => $vehicle->id ?? null]);
            return $this->fail('Failed to delete vehicle', 500);
        }
    }
}
