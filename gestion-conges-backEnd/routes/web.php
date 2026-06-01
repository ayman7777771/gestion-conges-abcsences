<?php

use Illuminate\Support\Facades\Route;

Route::get('/login', function () {
    return response()->json([
        'message' => 'Use POST /api/auth/login for API authentication',
        'endpoint' => '/api/auth/login',
        'method' => 'POST',
        'body' => [
            'email' => 'user@example.com',
            'password' => 'password'
        ]
    ]);
})->name('login');

Route::get('/', function () {
    return response()->json([
        'message' => 'Leave Management API',
        'version' => '1.0.0',
        'api_docs' => '/api/documentation'
    ]);
})->name('home');