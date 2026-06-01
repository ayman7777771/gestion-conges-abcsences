<?php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\LeaveRequest;
use App\Policies\LeaveRequestPolicy;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void { }

    public function boot(): void
    {
        Gate::policy(LeaveRequest::class, LeaveRequestPolicy::class);
    }
}