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
        Schema::create('ad_view_uniques', function (Blueprint $table) {
            $table->id();

            $table->foreignId('ad_id')->nullable()->constrained('ads')->nullOnDelete();

            // ef innskráður
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            // hash af “viewer identity” (user_id eða session-id), EKKI raw session
            $table->string('viewer_hash', 64);

            // dagur til að gera unique index einfalt (1 view per day per viewer)
            $table->date('viewed_on');

            // valkvætt til greiningar (privacy-friendly)
            $table->string('ip_hash', 64)->nullable();
            $table->string('ua_hash', 64)->nullable();

            $table->timestamps();
            $table->softDeletes();
            // tryggir: max 1 unique view per ad per viewer per day
            $table->unique(['ad_id', 'viewer_hash', 'viewed_on']);

            $table->index(['ad_id', 'viewed_on']);
            $table->index(['user_id', 'viewed_on']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_view_uniques');
    }
};
