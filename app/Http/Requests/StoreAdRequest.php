<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAdRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'section' => ['required', Rule::in(['solutorg','bilatorg','fasteignir'])],
            'category_slug' => ['required','string'],
            'subcategory_slug' => ['nullable','string'],

            // samþykkjum bæði naming, normalizum í controller
            'listing_type' => ['required', Rule::in(['sell','want','for_sale','wanted'])],

            'title' => ['required','string','min:3','max:120'],
            'price' => ['nullable','numeric','min:0','max:9999999999'],
            'description' => ['nullable','string','max:20000'],

            'attributes' => ['sometimes','array'],

            'images' => ['nullable','array','max:15'],
            'images.*' => ['file','image','mimes:jpg,jpeg,png,webp','max:8192'],
            'main_image_index' => ['nullable','integer','min:0','max:14'],
        ];
    }
}
