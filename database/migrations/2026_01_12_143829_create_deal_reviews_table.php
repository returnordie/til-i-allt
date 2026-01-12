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
        Schema::create('deal_reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('deal_id')
                ->constrained('deals')
                ->restrictOnDelete();

            $table->foreignId('rater_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->foreignId('ratee_id')
                ->constrained('users')
                ->restrictOnDelete();

            // 1-5
            $table->unsignedTinyInteger('rating')->index();

            $table->text('comment')->nullable();
            $table->json('meta')->nullable(); // tags, structured feedback

            $table->timestamps();
            $table->softDeletes();

            // einn review per rater á hverju deal
            $table->unique(['deal_id', 'rater_id']);

            $table->index(['ratee_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deal_reviews');
    }
};
