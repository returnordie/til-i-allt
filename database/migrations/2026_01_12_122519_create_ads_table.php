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
        Schema::create('ads', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->string('section', 32)->index();
            $table->string('listing_type', 16)->index();
            $table->string('title');
            $table->string('slug');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price')->nullable();
            $table->string('currency', 3)->default('kr.');
            $table->boolean('negotiable')->default(false);
            $table->string('location_text')->nullable();
            $table->foreignId('postcode_id')->nullable()->constrained('postcodes')->restrictOnDelete();
            // draft | active | paused | sold | archived | expired
            $table->string('status', 16)->default('draft')->index();

            $table->timestamp('published_at')->nullable()->index();
            $table->timestamp('expires_at')->nullable()->index();
            $table->unsignedBigInteger('views_count')->default(0)->index();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['postcode_id', 'section', 'status', 'published_at']);
            $table->index(['category_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ads');
    }
};
