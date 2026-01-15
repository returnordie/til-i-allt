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
        Schema::create('ad_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ad_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attribute_definition_id')->constrained()->cascadeOnDelete();

            $table->string('value_text', 191)->nullable();
            $table->decimal('value_number', 14, 2)->nullable();
            $table->boolean('value_bool')->nullable();
            $table->json('value_json')->nullable(); // multiselect o.fl.

            $table->timestamps();

            $table->unique(['ad_id','attribute_definition_id']);
            $table->index(['attribute_definition_id','value_number']);
            $table->index(['attribute_definition_id','value_text']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ad_attribute_values');
    }
};
