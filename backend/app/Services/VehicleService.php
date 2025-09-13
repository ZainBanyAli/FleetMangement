<?php

namespace App\Services;

use App\Models\Vehicle;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Access\AuthorizationException;

class VehicleService
{
    public function listForCurrentUser()
    {
        return Vehicle::where('user_id', Auth::id())->latest()->get();
    }

    public function create(array $data): Vehicle
    {
        $data['user_id'] = Auth::id();
        return Vehicle::create($data);
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $this->authorizeOwner($vehicle);
        $vehicle->update($data);
        return $vehicle;
    }

    public function delete(Vehicle $vehicle): void
    {
        $this->authorizeOwner($vehicle);
        $vehicle->delete();
    }

    private function authorizeOwner(Vehicle $vehicle): void
    {
        if ($vehicle->user_id !== Auth::id()) {
            throw new AuthorizationException('Forbidden');
        }
    }
}
