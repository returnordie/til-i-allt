<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // icon = Material Symbols name (string), t.d. "weekend", "directions_car"
        $tree = [
            // Sölutorg
            'solutorg' => [
                'Heimili & garður' => [
                    'icon' => 'home_and_garden',
                    'children' => [
                        ['name' => 'Húsgögn',          'icon' => 'weekend'],
                        ['name' => 'Heimilistæki',     'icon' => 'kitchen'],
                        ['name' => 'Verkfæri',         'icon' => 'handyman'],
                        ['name' => 'Garðyrkja',        'icon' => 'yard'],
                        ['name' => 'Byggingavörur',    'icon' => 'build'],
                        ['name' => 'Annað í heimili',  'icon' => 'category'],
                    ],
                ],
                'Tölvur & tækni' => [
                    'icon' => 'devices',
                    'children' => [
                        ['name' => 'Fartölvur',        'icon' => 'laptop_mac'],
                        ['name' => 'Borðtölvur',       'icon' => 'desktop_windows'],
                        ['name' => 'Skjáir',           'icon' => 'monitor'],
                        ['name' => 'Símar',            'icon' => 'smartphone'],
                        ['name' => 'Spjaldtölvur',     'icon' => 'tablet_mac'],
                        ['name' => 'Leikjatölvur',     'icon' => 'sports_esports'],
                        ['name' => 'Netbúnaður',       'icon' => 'router'],
                        ['name' => 'Annað í tækni',    'icon' => 'memory'],
                    ],
                ],
                'Tómstundir' => [
                    'icon' => 'sports_and_outdoors',
                    'children' => [
                        ['name' => 'Íþróttir',         'icon' => 'sports_soccer'],
                        ['name' => 'Útivist',          'icon' => 'hiking'],
                        ['name' => 'Veiði',            'icon' => 'phishing'],
                        ['name' => 'Bækur',            'icon' => 'menu_book'],
                        ['name' => 'Safngripir',       'icon' => 'collections'],
                        ['name' => 'Hljóðfæri',        'icon' => 'music_note'],
                        ['name' => 'Annað í tómstundum','icon' => 'category'],
                    ],
                ],
                'Föt & fylgihlutir' => [
                    'icon' => 'checkroom',
                    'children' => [
                        ['name' => 'Kvenfatnaður',     'icon' => 'woman'],
                        ['name' => 'Karlfatnaður',     'icon' => 'man'],
                        ['name' => 'Barnavörur',       'icon' => 'child_friendly'],
                        ['name' => 'Skór',             'icon' => 'footprint'],
                        ['name' => 'Skartgripir',      'icon' => 'diamond'],
                        ['name' => 'Annað í fatnaði',  'icon' => 'category'],
                    ],
                ],
                'Óskast eftir' => [
                    'icon' => 'manage_search',
                    'children' => [
                        ['name' => 'Óskast eftir (almenn)', 'icon' => 'search'],
                    ],
                ],
            ],

            // Bílatorg
            // (Þú sagðir: fyrir bílatorg sýnum við undirflokka frekar en yfirflokka í UI — það er UI logic, ekki seeder.)
            'bilatorg' => [
                'Ökutæki' => [
                    'icon' => 'directions_car',
                    'children' => [
                        ['name' => 'Vörubílar',                     'icon' => 'local_shipping'],
                        ['name' => 'Bílar',                         'icon' => 'directions_car'],
                        ['name' => 'Jeppar',                        'icon' => 'airport_shuttle'],
                        ['name' => 'Sendibílar',                    'icon' => 'local_shipping'],
                        ['name' => 'Mótorhjól',                     'icon' => 'two_wheeler'],
                        ['name' => 'Hjólhýsi & fellihýsi',           'icon' => 'travel'],
                        ['name' => 'Önnur skráningaskyld ökutæki',  'icon' => 'commute'],
                    ],
                ],
                'Tæki & vélar' => [
                    'icon' => 'construction',
                    'children' => [
                        ['name' => 'Vinnuvélar',     'icon' => 'construction'],
                        ['name' => 'Traktorar',      'icon' => 'agriculture'],
                        ['name' => 'Lyftarar',       'icon' => 'forklift'],
                        ['name' => 'Annað í tækjum', 'icon' => 'precision_manufacturing'],
                    ],
                ],
            ],

            // Fasteignir
            'fasteignir' => [
                'Íbúðarhúsnæði' => [
                    'icon' => 'apartment',
                    'children' => [
                        ['name' => 'Íbúðir',            'icon' => 'apartment'],
                        ['name' => 'Einbýli',           'icon' => 'house'],
                        ['name' => 'Parhús / Raðhús',   'icon' => 'home'],
                        ['name' => 'Sumarhús',          'icon' => 'holiday_village'],
                        ['name' => 'Herbergi',          'icon' => 'bed'],
                    ],
                ],
                'Atvinnuhúsnæði' => [
                    'icon' => 'business',
                    'children' => [
                        ['name' => 'Til leigu',           'icon' => 'key'],
                        ['name' => 'Til sölu',            'icon' => 'sell'],
                        ['name' => 'Lóðir',               'icon' => 'landscape'],
                        ['name' => 'Geymslur / Bílskúrar','icon' => 'garage'],
                    ],
                ],
            ],
        ];

        foreach ($tree as $section => $parents) {
            foreach ($parents as $parentName => $node) {
                $parentIcon = $node['icon'] ?? null;
                $children = $node['children'] ?? [];

                $parent = $this->upsertCategory($section, $parentName, $parentIcon, null, 0);

                $sort = 0;
                foreach ($children as $child) {
                    $this->upsertCategory(
                        $section,
                        $child['name'],
                        $child['icon'] ?? null,
                        $parent->id,
                        $sort++
                    );
                }
            }
        }
    }

    private function upsertCategory(
        string $section,
        string $name,
        ?string $icon,
        ?int $parentId,
        int $sortOrder
    ): Category {
        $slug = Str::slug($name);

        return Category::updateOrCreate(
            [
                'section' => $section,
                'parent_id' => $parentId,
                'slug' => $slug,
            ],
            [
                'name' => $name,
                'icon' => $icon,          // <— DB column
                'sort_order' => $sortOrder,
                'is_active' => true,
            ]
        );
    }
}
