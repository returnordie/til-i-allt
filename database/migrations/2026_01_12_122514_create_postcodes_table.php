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
        Schema::create('postcodes', function (Blueprint $table) {
            $table->id();

            $table->string('code', 10)->unique();      // t.d. "101"
            $table->string('name');                    // t.d. "Reykjavík"
            $table->foreignId('region_id')
                ->constrained('regions')
                ->restrictOnDelete();

            // POINT(lng, lat) SRID 4326
            $table->geometry('centroid', subtype: 'point', srid: 4326)->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['region_id', 'code']);
            //$table->spatialIndex('centroid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('postcodes');
    }
};
