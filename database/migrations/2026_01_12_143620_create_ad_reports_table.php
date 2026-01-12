<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('ad_reports', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ad_id')
                ->constrained('ads')
                ->restrictOnDelete();

            $table->foreignId('reporter_id')
                ->constrained('users')
                ->restrictOnDelete();

            // scam | spam | illegal | wrong_category | duplicate | offensive | other
            $table->string('reason', 32)->index();

            $table->text('notes')->nullable();

            // open | reviewing | resolved | rejected
            $table->string('status', 16)->default('open')->index();

            $table->foreignId('handled_by')->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamp('handled_at')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['ad_id', 'status']);
            $table->index(['reporter_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_reports');
    }
};
