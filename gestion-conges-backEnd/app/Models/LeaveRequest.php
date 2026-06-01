<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Http\Request;

class LeaveRequest extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'leave_type_id',
        'start_date',
        'end_date',
        'days_count',
        'reason',
        'status',
        'reviewed_by',
        'reviewed_at',
        'review_comment',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date'   => 'date:Y-m-d',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    // controller كان طويل وحيدت منو شوية من المنطق ودرتو هنا باش ننقص من الاسطر لي فيه
    // Scopes 

    public function scopeForCurrentUser($query)
    {
        return $query->where('user_id', auth()->id());
    }

    public function scopeForManagerTeam($query)
    {
        return $query->whereHas('user', function ($q) {
            $q->where('manager_id', auth()->id());
        });
    }

    public function scopeForDepartment($query, $departmentId)
    {
        if (!$departmentId) {
            return $query;
        }

        return $query->whereHas('user', function ($q) use ($departmentId) {
            $q->where('department_id', $departmentId);
        });
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

  public function scopeForMonth($query, $month, $year)
  {
    return $query->where(function ($q) use ($month, $year) {
        $q->whereMonth('start_date', $month)->whereYear('start_date', $year)
          ->orWhereMonth('end_date', $month)->whereYear('end_date', $year);
    });
  }
    
    public function scopeWithFilters($query, Request $request)
    {
        return $query
            ->when(
                $request->has('status'),
                fn($q) => $q->where('status', $request->status)
            )
            ->when(
                $request->has('from'),
                fn($q) => $q->whereDate('start_date', '>=', $request->from)
            )
            ->when(
                $request->has('to'),
                fn($q) => $q->whereDate('end_date', '<=', $request->to)
            );
    }
    
    public function markAsApproved(string $comment=null): self
    {
        $this->update([
            'status'         => 'approved',
            'reviewed_by'    => auth()->id(),
            'reviewed_at'    => now(),
            'review_comment' => $comment,
        ]);

        return $this->fresh(['user', 'leaveType']);
    }

    public function markAsRejected(string $comment=null): self
    {
        $this->update([
            'status'         => 'rejected',
            'reviewed_by'    => auth()->id(),
            'reviewed_at'    => now(),
            'review_comment' => $comment,
        ]);

        return $this->fresh(['user', 'leaveType']);
    }

    public function markAsCancelled(): self
    {
        $this->update(['status' => 'cancelled']);
        return $this->fresh();
    }
}