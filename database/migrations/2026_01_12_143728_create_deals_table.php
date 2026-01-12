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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ad_id')
                ->constrained('ads')
                ->restrictOnDelete();

            $table->foreignId('seller_id')
                ->constrained('users')
                ->restrictOnDelete();

            // buyer má vera óþekktur fyrst (t.d. "merkt selt" án val)
            $table->foreignId('buyer_id')->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            // proposed | confirmed | completed | canceled | disputed
            $table->string('status', 16)->default('proposed')->index();

            $table->unsignedBigInteger('price_final')->nullable();
            $table->string('currency', 3)->default('ISK');

            $table->timestamp('confirmed_at')->nullable()->index();
            $table->timestamp('completed_at')->nullable()->index();
            $table->timestamp('canceled_at')->nullable()->index();

            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['ad_id', 'status']);
            $table->index(['seller_id', 'status']);
            $table->index(['buyer_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
