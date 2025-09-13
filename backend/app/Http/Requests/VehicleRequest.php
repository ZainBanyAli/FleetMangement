<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        $vehicle = $this->route('vehicle');
        $id = is_object($vehicle) ? $vehicle->id : $vehicle;

        return [
         'plate_number' => [
         'required',
         'string',
         'max:50',
         'regex:/^[A-Z]{2,4}-[0-9]{3,4}$/i', // e.g. ABC-1234
          Rule::unique('vehicles', 'plate_number')->ignore($id),
],

            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'plate_number.required' => 'Plate number is required.',
            'plate_number.unique'   => 'This plate number already exists.',
        ];
    }
}
