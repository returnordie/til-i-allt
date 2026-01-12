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
        Schema::create('auth_events', function (Blueprint $table) {
            $table->id();

            // null ef t.d. "failed login" (við vitum ekki user enn)
            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            // login | logout | registered | failed | lockout | password_reset | email_verified ...
            $table->string('event', 24)->index();

            // "web" guard o.s.frv. (valkvætt)
            $table->string('guard', 24)->nullable()->index();

            // privacy-friendly (ekki geyma raw IP/UA)
            $table->string('ip_hash', 64)->nullable();
            $table->string('ua_hash', 64)->nullable();

            // ef user_id er null (failed attempts): hash af email/identifier
            $table->string('identifier_hash', 64)->nullable()->index();

            $table->json('meta')->nullable(); // t.d. remember=true, device info, etc.

            $table->timestamp('occurred_at')->useCurrent()->index();
            $table->timestamps();

            $table->index(['user_id', 'occurred_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('auth_events');
    }
};
