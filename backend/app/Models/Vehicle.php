<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['user_id','plate_number','brand','model'];

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }

      public function locations()
    {
          return $this->hasMany(\App\Models\GpsLocation::class, 'vehicle_id')
                ->orderBy('timestamp');
    }
}
