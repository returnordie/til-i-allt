<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['name' => 'Höfuðborgarsvæðið', 'sort_order' => 1],
            ['name' => 'Suðurnes', 'sort_order' => 2],
            ['name' => 'Vesturland', 'sort_order' => 3],
            ['name' => 'Norðurland', 'sort_order' => 4],
            ['name' => 'Austurland', 'sort_order' => 5],
            ['name' => 'Suðurland', 'sort_order' => 6],
            ['name' => 'Vestfirðir', 'sort_order' => 7],
        ];

        foreach ($regions as $region) {
            Region::query()->updateOrCreate(
                ['slug' => Str::slug($region['name'])],
                [
                    'name' => $region['name'],
                    'sort_order' => $region['sort_order'],
                    'is_active' => true,
                ]
            );
        }
    }
}
