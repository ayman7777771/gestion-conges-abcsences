<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveBalance extends Model
{
    /** @use HasFactory<\Database\Factories\LeaveBalanceFactory> */
    use HasFactory;
    protected $fillable = ['user_id', 'leave_type_id', 'year', 'quota', 'used'];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
    protected $appends = ['remaining'];
    
    public function getRemainingAttribute(): int|string
    {
        if (!$this->leaveType->is_paid) {
        return 'Illimité';
    }
        $remaining = $this->quota - $this->used;
        return max(0, $remaining);
    }
}
