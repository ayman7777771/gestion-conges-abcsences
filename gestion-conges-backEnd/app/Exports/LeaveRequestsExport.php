<?php

namespace App\Exports;

use App\Models\LeaveRequest;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class LeaveRequestsExport implements FromQuery, WithHeadings, WithMapping, WithStyles, WithChunkReading
{
    public function __construct(
        private ?string $from = null,
        private ?string $to = null,
    ) {}

    public function query()
    {
        $query = LeaveRequest::with(['user.department', 'leaveType'])
            ->where('status', 'approved');

        if ($this->from) {
            $query->whereDate('start_date', '>=', $this->from);
        }

        if ($this->to) {
            $query->whereDate('end_date', '<=', $this->to);
        }

        return $query;
    }

    public function headings(): array
    {
        return [
            'Employé',
            'Département',
            'Type de congé',
            'Date début',
            'Date fin',
            'Jours',
            'Statut',
        ];
    }

    public function map($row): array
    {
        return [
            $row->user?->name,
            $row->user?->department?->name ?? '-',
            $row->leaveType?->name ?? '-',
            $row->start_date,
            $row->end_date,
            $row->days_count,
            $row->status,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => ['bold' => true],
            ],
        ];
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}