<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
         return [
        'latitude'  => ['required','numeric','between:-90,90'],
        'longitude' => ['required','numeric','between:-180,180'],
        'timestamp' => ['required','date'],
    ];
    }
}
