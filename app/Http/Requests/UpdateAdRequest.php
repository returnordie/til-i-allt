<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAdRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'section' => ['required', Rule::in(['solutorg','bilatorg','fasteignir'])],
            'category_slug' => ['required','string'],
            'subcategory_slug' => ['nullable','string'],
            'listing_type' => ['required', Rule::in(['sell','want','for_sale','wanted'])],

            'title' => ['required','string','min:3','max:120'],
            'price' => ['nullable','numeric','min:0','max:9999999999'],
            'description' => ['nullable','string','max:20000'],
            'location_text' => ['nullable','string','max:120'],
            'postcode_id' => ['nullable','integer','exists:postcodes,id'],
            'attributes' => ['sometimes','array'],

            'images' => ['nullable','array','max:15'],
            'images.*' => ['file','image','mimes:jpg,jpeg,png,webp','max:8192'],
            'main_image_index' => ['nullable','integer','min:0','max:14'],

            // update-only: delete + set main (nota public_id til að passa route-key)
            'delete_image_public_ids' => ['nullable','array'],
            'delete_image_public_ids.*' => ['string'],

            'main_image_public_id' => ['nullable','string'],
        ];
    }
}
