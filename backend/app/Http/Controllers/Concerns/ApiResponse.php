<?php

namespace App\Http\Controllers\Concerns;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    protected function ok($data = null, string $message = 'OK', int $code = 200): JsonResponse
    {
        return response()->json(['message' => $message, 'data' => $data], $code);
    }

    protected function created($data = null, string $message = 'Created'): JsonResponse
    {
        return $this->ok($data, $message, 201);
    }

    protected function noContent(): JsonResponse
    {
        return response()->json([], 204);
    }

    protected function fail(string $message = 'Something went wrong', int $code = 400, $errors = null): JsonResponse
    {
        return response()->json(['message' => $message, 'errors' => $errors], $code);
    }
}
