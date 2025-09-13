<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{AuthController, VehicleController, GpsLocationController, DashboardController};

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
    Route::middleware('auth:api')->get('/me', [AuthController::class, 'me']);
});

Route::middleware('auth:api')->group(function () {
    Route::get('/vehicles',               [VehicleController::class, 'index']);
    Route::post('/vehicles',              [VehicleController::class, 'store']);
    Route::put('/vehicles/{vehicle}',     [VehicleController::class, 'update']);
    Route::delete('/vehicles/{vehicle}',  [VehicleController::class, 'destroy']);

    Route::get('/vehicles/{vehicle}/locations',  [GpsLocationController::class, 'index']);
    Route::post('/vehicles/{vehicle}/locations', [GpsLocationController::class, 'store']);

    Route::get('/dashboard/vehicles', [DashboardController::class, 'vehiclesWithDistance']);
});
