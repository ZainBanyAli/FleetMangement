<?php

namespace App\Exceptions;

use App\Http\Controllers\Concerns\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

// JWT exceptions
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenExpiredException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\TokenInvalidException;
use PHPOpenSourceSaver\JWTAuth\Exceptions\JWTException;

class Handler extends ExceptionHandler
{
    use ApiResponse;

    public function render($request, Throwable $e)
    {
        // 422: validation errors
        if ($e instanceof ValidationException) {
            return $this->fail('Validation error', 422, $e->errors());
        }

        // 401: unauthenticated / bad token
        if ($e instanceof AuthenticationException || $e instanceof JWTException) {
            return $this->fail('Unauthenticated', 401);
        }
        if ($e instanceof TokenExpiredException) {
            return $this->fail('Token expired', 401);
        }
        if ($e instanceof TokenInvalidException) {
            return $this->fail('Token invalid', 401);
        }

        // 403: no permission
        if ($e instanceof AuthorizationException) {
            return $this->fail('Forbidden', 403);
        }

        // 404: not found (route or model)
        if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
            return $this->fail('Not found', 404);
        }

        // 405: method not allowed
        if ($e instanceof MethodNotAllowedHttpException) {
            return $this->fail('Method not allowed', 405);
        }

        // 429: too many requests (if you enable throttling)
        if ($e instanceof ThrottleRequestsException) {
            return $this->fail('Too many requests', 429);
        }

        // DB errors (duplicate, constraint, etc.)
        if ($e instanceof QueryException) {
            $msg = $e->getMessage();
            $status = str_contains(strtolower($msg), 'duplicate entry') ? 409 : 400;
            // keep errors null in prod; show message only if APP_DEBUG=true
            return $this->fail('Database error', $status, config('app.debug') ? $msg : null);
        }

        // Any HttpException keeps its status code
        if ($e instanceof HttpException) {
            return $this->fail($e->getMessage() ?: 'HTTP error', $e->getStatusCode());
        }

        // Fallback
        if (config('app.debug')) {
            return parent::render($request, $e);
        }
        return $this->fail('Internal server error', 500);
    }
}
