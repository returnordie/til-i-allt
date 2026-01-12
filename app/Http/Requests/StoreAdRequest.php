<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAdRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'section' => ['required', 'in:solutorg,bilatorg,fasteignir'],
            'ad_type' => ['required', 'in:for_sale,wanted'], // eða þín gildi
            'category_id' => ['required', 'exists:categories,id'],
            'title' => ['required', 'string', 'min:6', 'max:120'],
            'price' => ['nullable', 'integer', 'min:0', 'max:9999999999'],
            'description' => ['required', 'string', 'min:20', 'max:10000'],

            'images' => ['nullable', 'array', 'max:12'],
            'images.*' => ['file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:8192'],
            'main_image_index' => ['nullable', 'integer', 'min:0', 'max:11'],
        ];
    }
}
