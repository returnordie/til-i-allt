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
        Schema::table('deal_reviews', function (Blueprint $table) {
            $table->unsignedDecimal('rating', 3, 1)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('deal_reviews', function (Blueprint $table) {
            $table->unsignedTinyInteger('rating')->change();
        });
    }
};
