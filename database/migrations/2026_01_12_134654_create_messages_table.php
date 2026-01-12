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
        Schema::create('messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('conversation_id')
                ->constrained('conversations')
                ->restrictOnDelete();

            $table->foreignId('sender_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->text('body');
            $table->string('message_type', 16)->default('user')->index(); // user|system
            $table->string('system_code', 32)->nullable()->index(); // ad_sold, warning, etc.
            $table->json('meta')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index(['conversation_id', 'created_at']);
            $table->index(['sender_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
