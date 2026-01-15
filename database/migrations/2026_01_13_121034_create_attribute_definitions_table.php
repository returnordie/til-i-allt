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
        Schema::create('attribute_definitions', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // t.d. tire_width, car_year
            $table->string('label');
            $table->string('type'); // text|number|select|boolean|textarea|multiselect
            $table->json('options')->nullable(); // select/multiselect
            $table->string('unit')->nullable();
            $table->string('placeholder')->nullable();
            $table->string('help')->nullable();
            $table->string('group')->nullable(); // t.d. "Vél", "Öryggi"
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attribute_definitions');
    }
};
