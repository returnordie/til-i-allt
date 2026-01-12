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
        Schema::create('ad_events', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ad_id')
                ->constrained('ads')
                ->restrictOnDelete();

            // Hver framkvæmdi (admin/user/system). Mæli með "System user" svo þetta sé alltaf filled.
            $table->foreignId('actor_id')
                ->constrained('users')
                ->restrictOnDelete();

            // status_changed | report_created | report_resolved | promotion_started | promotion_ended | etc
            $table->string('event', 32)->index();

            $table->string('from_status', 16)->nullable()->index();
            $table->string('to_status', 16)->nullable()->index();

            // Auka upplýsingar (t.d. reason="auto_expired", note, report_id, o.s.frv.)
            $table->json('meta')->nullable();

            // valkvætt: privacy-friendly hashes ef þú vilt rekjanleika
            $table->string('ip_hash', 64)->nullable();
            $table->string('ua_hash', 64)->nullable();

            $table->timestamps();

            $table->index(['ad_id', 'created_at']);
            $table->index(['actor_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_events');
    }
};
