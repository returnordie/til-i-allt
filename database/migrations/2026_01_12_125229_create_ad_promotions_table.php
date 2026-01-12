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
        Schema::create('ad_promotions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ad_id')->constrained('ads')->restrictOnDelete();
            // featured | bump | spotlight (þú getur byrjað bara með featured)
            $table->string('type', 24)->index();

            // stjórnar sýnileika
            $table->timestamp('starts_at')->index();
            $table->timestamp('ends_at')->index();

            // ef þú vilt mismunandi “styrk”
            $table->unsignedSmallInteger('priority')->default(100)->index();

            // payment tracking (MVP)
            $table->string('status', 16)->default('active')->index(); // active|scheduled|ended|refunded|canceled
            $table->unsignedInteger('amount')->nullable(); // í ISK krónum
            $table->string('currency', 3)->default('ISK');
            $table->string('provider', 32)->nullable(); // stripe, etc.
            $table->string('provider_ref')->nullable(); // payment intent / charge id

            $table->timestamps();
            $table->softDeletes();
            $table->index(['ad_id', 'type', 'starts_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_promotions');
    }
};
