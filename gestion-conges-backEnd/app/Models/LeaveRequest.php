<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    /** @use HasFactory<\Database\Factories\LeaveRequestFactory> */
    use HasFactory;
    protected $fillable = [
    'user_id', 'leave_type_id', 'start_date', 'end_date', 
    'days_count', 'reason', 'status', 'reviewed_by', 
    'reviewed_at', 'review_comment'
];
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    public function leaveType()
    {
        return $this->belongsTo(LeaveType::class);
    }
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
