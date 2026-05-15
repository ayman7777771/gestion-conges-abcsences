<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\User;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use Illuminate\Support\Facades\DB;
use Exception;

#[Signature('leaves:reset-balances')]
#[Description('Réinitialisation annuelle des soldes de congés pour tous les employés')]
class ResetLeaveBalances extends Command
{
    public function handle(): int
    {
        $currentYear = now()->year;
        $users = User::all();
        $leaveTypes = LeaveType::all();

        $this->info("Début de la réinitialisation pour l'année : $currentYear");

        DB::beginTransaction();

        try {
            foreach ($users as $user) {
                foreach ($leaveTypes as $type) {
                    LeaveBalance::updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'leave_type_id' => $type->id,
                            'year' => $currentYear,
                        ],
                        [
                            'balance' => $type->default_quota,
                        ]
                    );
                }
            }

            DB::commit();
            $this->info('Les soldes de congés ont été réinitialisés avec succès !');
            return Command::SUCCESS;

        } catch (Exception $e) {
            DB::rollBack();
            $this->error('Erreur lors de la réinitialisation : ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}