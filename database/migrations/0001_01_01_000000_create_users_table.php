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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('username', 32)->nullable()->unique();
            $table->string('phone_e164', 20)->nullable()->unique();
            $table->date('date_of_birth')->nullable();
            $table->boolean('show_phone')->default(false)->index();
            $table->boolean('show_name')->default(true)->index();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->unsignedBigInteger('tia_balance')->default(0);
            $table->boolean('is_system')->default(false)->index();
            $table->timestamp('last_login_at')->nullable()->index();
            $table->string('last_login_ip_hash', 64)->nullable();
            $table->string('last_login_ua_hash', 64)->nullable();
            $table->string('role')->default('user');
            $table->string('is_active')->default(true);
            $table->timestamp('banned_at')->nullable();
            $table->string('ban_reason')->nullable();
            $table->rememberToken();
            $table->timestamps();

            $table->index('tia_balance');

        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
