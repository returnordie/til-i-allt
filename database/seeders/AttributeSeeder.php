<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\AttributeDefinition;
use App\Models\Category;
class AttributeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mkOpts = fn(array $nums) => array_map(fn($n) => ['value' => (string)$n, 'label' => (string)$n], $nums);

        // ---- SÖLUTORG: Dekkastærð sem 3 dropdowns ----
        AttributeDefinition::updateOrCreate(
            ['key' => 'tire_width'],
            ['label' => 'Breidd', 'type' => 'select', 'options' => $mkOpts([155,165,175,185,195,205,215,225,235,245,255,265,275,285,295,305,315]), 'unit' => 'mm', 'group' => 'Dekk']
        );
        AttributeDefinition::updateOrCreate(
            ['key' => 'tire_aspect'],
            ['label' => 'Prófíll', 'type' => 'select', 'options' => $mkOpts([30,35,40,45,50,55,60,65,70,75,80]), 'unit' => '%', 'group' => 'Dekk']
        );
        AttributeDefinition::updateOrCreate(
            ['key' => 'tire_rim'],
            ['label' => 'Tomma', 'type' => 'select', 'options' => $mkOpts([13,14,15,16,17,18,19,20,21,22]), 'unit' => '"', 'group' => 'Dekk']
        );

        AttributeDefinition::updateOrCreate(
            ['key' => 'tire_season'],
            ['label' => 'Tegund', 'type' => 'select', 'options' => [
                ['value'=>'summer','label'=>'Sumardekk'],
                ['value'=>'winter','label'=>'Vetrardekk'],
                ['value'=>'allseason','label'=>'Heilsárs'],
            ], 'group' => 'Dekk']
        );

        AttributeDefinition::updateOrCreate(
            ['key' => 'tire_studs'],
            ['label' => 'Negld', 'type' => 'boolean', 'group' => 'Dekk']
        );

        // ---- BÍLATORG: grunnreitir + aukabúnaður (multiselect) ----
        AttributeDefinition::updateOrCreate(['key'=>'car_make'], ['label'=>'Framleiðandi', 'type'=>'text', 'group'=>'Grunnur']);
        AttributeDefinition::updateOrCreate(['key'=>'car_model'], ['label'=>'Gerð', 'type'=>'text', 'group'=>'Grunnur']);
        AttributeDefinition::updateOrCreate(['key'=>'car_variant'], ['label'=>'Útfærsla / úrbúnaður', 'type'=>'text', 'group'=>'Grunnur']);

        AttributeDefinition::updateOrCreate(['key'=>'car_year'], ['label'=>'Nýskráning (ár)', 'type'=>'number', 'group'=>'Grunnur', 'unit'=>'ár']);
        AttributeDefinition::updateOrCreate(['key'=>'car_mileage_km'], ['label'=>'Akstur', 'type'=>'number', 'group'=>'Grunnur', 'unit'=>'km']);

        AttributeDefinition::updateOrCreate(['key'=>'car_fuel'], ['label'=>'Eldsneyti', 'type'=>'select', 'group'=>'Grunnur', 'options'=>[
            ['value'=>'petrol','label'=>'Bensín'],
            ['value'=>'diesel','label'=>'Dísel'],
            ['value'=>'phev','label'=>'Plug-in'],
            ['value'=>'ev','label'=>'Rafmagn'],
            ['value'=>'hybrid','label'=>'Hybrid'],
        ]]);

        AttributeDefinition::updateOrCreate(['key'=>'car_transmission'], ['label'=>'Skipting', 'type'=>'select', 'group'=>'Drifrás', 'options'=>[
            ['value'=>'auto','label'=>'Sjálfskipting'],
            ['value'=>'manual','label'=>'Beinskipt'],
        ]]);

        AttributeDefinition::updateOrCreate(['key'=>'car_drive'], ['label'=>'Drif', 'type'=>'select', 'group'=>'Drifrás', 'options'=>[
            ['value'=>'rwd','label'=>'Afturhjóladrif'],
            ['value'=>'fwd','label'=>'Framhjóladrif'],
            ['value'=>'awd','label'=>'Fjórhjóladrif'],
        ]]);

        AttributeDefinition::updateOrCreate(['key'=>'car_power_hp'], ['label'=>'Hestöfl', 'type'=>'number', 'group'=>'Vél', 'unit'=>'hp']);
        AttributeDefinition::updateOrCreate(['key'=>'car_engine_cc'], ['label'=>'Slagrými', 'type'=>'number', 'group'=>'Vél', 'unit'=>'cc']);
        AttributeDefinition::updateOrCreate(['key'=>'car_doors'], ['label'=>'Hurðir', 'type'=>'number', 'group'=>'Grunnur']);
        AttributeDefinition::updateOrCreate(['key'=>'car_seats'], ['label'=>'Sæti', 'type'=>'number', 'group'=>'Grunnur']);

        AttributeDefinition::updateOrCreate(['key'=>'car_features_safety'], [
            'label'=>'Öryggi',
            'type'=>'multiselect',
            'group'=>'Aukabúnaður',
            'options'=>[
                ['value'=>'abs','label'=>'ABS hemlakerfi'],
                ['value'=>'airbags','label'=>'Líknarbelgir'],
                ['value'=>'blind_spot','label'=>'Blindsvæðisvörn'],
                ['value'=>'lane_assist','label'=>'Akreinavari'],
                ['value'=>'cruise','label'=>'Hraðastillir'],
                ['value'=>'rear_cam','label'=>'Bakkmyndavél'],
                ['value'=>'parking_sensors_front','label'=>'Skynjarar framan'],
                ['value'=>'parking_sensors_rear','label'=>'Skynjarar aftan'],
            ],
        ]);

        AttributeDefinition::updateOrCreate(['key'=>'car_features_media'], [
            'label'=>'Afþreying',
            'type'=>'multiselect',
            'group'=>'Aukabúnaður',
            'options'=>[
                ['value'=>'carplay','label'=>'Apple CarPlay'],
                ['value'=>'android_auto','label'=>'Android Auto'],
                ['value'=>'bt_audio','label'=>'Bluetooth hljóðtenging'],
                ['value'=>'bt_phone','label'=>'Bluetooth símatenging'],
                ['value'=>'usb','label'=>'USB tengi'],
                ['value'=>'aux','label'=>'AUX'],
            ],
        ]);

        // ---- FASTEIGNIR: grunnreitir ----
        AttributeDefinition::updateOrCreate(['key'=>'prop_year_built'], ['label'=>'Byggt', 'type'=>'number', 'group'=>'Grunnur', 'unit'=>'ár']);
        AttributeDefinition::updateOrCreate(['key'=>'prop_size_m2'], ['label'=>'Stærð', 'type'=>'number', 'group'=>'Grunnur', 'unit'=>'m²']);
        AttributeDefinition::updateOrCreate(['key'=>'prop_rooms'], ['label'=>'Herbergi', 'type'=>'number', 'group'=>'Grunnur']);
        AttributeDefinition::updateOrCreate(['key'=>'prop_bedrooms'], ['label'=>'Svefnherb.', 'type'=>'number', 'group'=>'Grunnur']);
        AttributeDefinition::updateOrCreate(['key'=>'prop_bathrooms'], ['label'=>'Baðherb.', 'type'=>'number', 'group'=>'Grunnur']);
        AttributeDefinition::updateOrCreate(['key'=>'prop_washer'], ['label'=>'Þvottahús', 'type'=>'boolean', 'group'=>'Grunnur']);

        // ---- Tengja við flokka (REPLACE-a slugum eftir þínu) ----
        $this->attachToCategory('solutorg', 'dekk-felgur', ['tire_width','tire_aspect','tire_rim','tire_season','tire_studs']);

        // fyrir Bílatorg: settu slug sem er raunverulega “Bílar” hjá þér
        $this->attachToCategory('bilatorg', 'bilar', [
            'car_make','car_model','car_variant','car_year','car_mileage_km','car_fuel',
            'car_transmission','car_drive','car_power_hp','car_engine_cc','car_doors','car_seats',
            'car_features_safety','car_features_media',
        ]);

        // fyrir Fasteignir: settu slug sem er raunverulega “íbúðir” hjá þér
        $this->attachToCategory('fasteignir', 'ibudir', [
            'prop_year_built','prop_size_m2','prop_rooms','prop_bedrooms','prop_bathrooms','prop_washer',
        ]);
    }

    private function attachToCategory(string $section, string $categorySlug, array $keys): void
    {
        $cat = Category::where('section', $section)->where('slug', $categorySlug)->first();
        if (! $cat) return;

        $defs = AttributeDefinition::whereIn('key', $keys)->get()->keyBy('key');

        $sync = [];
        $order = 10;
        foreach ($keys as $k) {
            if (!isset($defs[$k])) continue;
            $sync[$defs[$k]->id] = ['required' => false, 'sort_order' => $order++];
        }

        $cat->attributes()->syncWithoutDetaching($sync);
    }

}
