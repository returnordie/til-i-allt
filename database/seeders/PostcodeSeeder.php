<?php

namespace Database\Seeders;

use App\Models\Postcode;
use App\Models\Region;
use Illuminate\Database\Seeder;

class PostcodeSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['code' => '101', 'name' => 'Reykjavík', 'region' => 'hofudborgarsvaedid'],
            ['code' => '200', 'name' => 'Kópavogur', 'region' => 'hofudborgarsvaedid'],
            ['code' => '220', 'name' => 'Hafnarfjörður', 'region' => 'hofudborgarsvaedid'],
            ['code' => '230', 'name' => 'Reykjanesbær', 'region' => 'sudurnes'],
            ['code' => '300', 'name' => 'Akranes', 'region' => 'vesturland'],
            ['code' => '400', 'name' => 'Ísafjörður', 'region' => 'vestfirdir'],
            ['code' => '600', 'name' => 'Akureyri', 'region' => 'nordurland'],
            ['code' => '700', 'name' => 'Egilsstaðir', 'region' => 'austurland'],
            ['code' => '800', 'name' => 'Selfoss', 'region' => 'sudurland'],
        ];

        $regions = Region::query()
            ->whereIn('slug', collect($data)->pluck('region')->unique()->all())
            ->get()
            ->keyBy('slug');

        foreach ($data as $row) {
            $region = $regions->get($row['region']);
            if (! $region) {
                continue;
            }

            Postcode::query()->updateOrCreate(
                ['code' => $row['code']],
                [
                    'name' => $row['name'],
                    'region_id' => $region->id,
                    'is_active' => true,
                ]
            );
        }
    }
}
