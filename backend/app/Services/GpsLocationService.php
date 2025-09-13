<?php

namespace App\Services;

use App\Models\Vehicle;
use Illuminate\Support\Facades\Auth;
use Illuminate\Auth\Access\AuthorizationException;

class GpsLocationService
{
    private function authorizeOwner(Vehicle $vehicle): void
    {
        if ($vehicle->user_id !== Auth::id()) {
            throw new AuthorizationException('Forbidden');
        }
    }

    public function list(Vehicle $vehicle)
    {
        $this->authorizeOwner($vehicle);
        return $vehicle->locations()->orderBy('timestamp')->get();
    }

    public function create(Vehicle $vehicle, array $data)
    {
        $this->authorizeOwner($vehicle);
        return $vehicle->locations()->create($data);
    }
}
