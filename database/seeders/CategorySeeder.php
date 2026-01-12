<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $tree = [
            // Sölutorg
            'solutorg' => [
                'Heimili & garður' => [
                    'Húsgögn',
                    'Heimilistæki',
                    'Verkfæri',
                    'Garðyrkja',
                    'Byggingavörur',
                    'Annað í heimili',
                ],
                'Tölvur & tækni' => [
                    'Fartölvur',
                    'Borðtölvur',
                    'Skjáir',
                    'Símar',
                    'Spjaldtölvur',
                    'Leikjatölvur',
                    'Netbúnaður',
                    'Annað í tækni',
                ],
                'Tómstundir' => [
                    'Íþróttir',
                    'Útivist',
                    'Veiði',
                    'Bækur',
                    'Safngripir',
                    'Hljóðfæri',
                    'Annað í tómstundum',
                ],
                'Föt & fylgihlutir' => [
                    'Kvenfatnaður',
                    'Karlfatnaður',
                    'Barnavörur',
                    'Skór',
                    'Skartgripir',
                    'Annað í fatnaði',
                ],
                'Óskast eftir' => [
                    'Óskast eftir (almenn)',
                ],
            ],

            // Bílatorg
            'bilatorg' => [
                'Ökutæki' => [
                    'Vörubílar',
                    'Bílar',
                    'Jeppar',
                    'Sendibílar',
                    'Mótorhjól',
                    'Hjólhýsi & fellihýsi',
                    'Önnur skráningaskyld ökutæki',
                ],
                'Tæki & vélar' => [
                    'Vinnuvélar',
                    'Traktorar',
                    'Lyftarar',
                    'Annað í tækjum',
                ],
            ],

            // Fasteignir
            'fasteignir' => [
                'Íbúðarhúsnæði' => [
                    'Íbúðir',
                    'Einbýli',
                    'Parhús / Raðhús',
                    'Sumarhús',
                    'Herbergi',
                ],
                'Atvinnuhúsnæði' => [
                    'Til leigu',
                    'Til sölu',
                    'Lóðir',
                    'Geymslur / Bílskúrar',
                ],
            ],
        ];

        foreach ($tree as $section => $parents) {
            foreach ($parents as $parentName => $children) {
                $parent = $this->upsertCategory($section, $parentName, null, 0);

                $sort = 0;
                foreach ($children as $childName) {
                    $this->upsertCategory($section, $childName, $parent->id, $sort++);
                }
            }
        }
    }

    private function upsertCategory(string $section, string $name, ?int $parentId, int $sortOrder): Category
    {
        $slug = Str::slug($name);

        return Category::updateOrCreate(
            [
                'section' => $section,
                'parent_id' => $parentId,
                'slug' => $slug,
            ],
            [
                'name' => $name,
                'sort_order' => $sortOrder,
                'is_active' => true,
            ]
        );
    }
}
