<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveType extends Model
{
    /** @use HasFactory<\Database\Factories\LeaveTypeFactory> */
    use HasFactory;
    protected $fillable = ['name', 'default_quota', 'is_paid'];
    public function leaveBalances()
    {
        return $this->hasMany(LeaveBalance::class);
    }

    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }
}
