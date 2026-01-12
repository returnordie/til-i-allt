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
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ad_id')->nullable()->constrained('ads')->restrictOnDelete();

            $table->foreignId('owner_id')->constrained('users')->restrictOnDelete();

            $table->foreignId('member_id')->constrained('users')->restrictOnDelete();

            $table->string('status', 16)->default('open')->index(); // open|closed|blocked
            $table->string('context', 16)->default('ad')->index();
            $table->string('subject')->nullable()->index();

            $table->timestamp('last_message_at')->nullable()->index();

            // Read/Archive per user (þar sem þetta er alltaf 2ja manna)
            $table->timestamp('owner_last_read_at')->nullable();
            $table->timestamp('member_last_read_at')->nullable();
            $table->timestamp('owner_archived_at')->nullable()->index();
            $table->timestamp('member_archived_at')->nullable()->index();

            $table->timestamps();
            $table->softDeletes();

            // Einn þráður per auglýsing + member
            $table->unique(['context', 'ad_id', 'member_id']);

            $table->index(['owner_id', 'last_message_at']);
            $table->index(['member_id', 'last_message_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
