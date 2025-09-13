<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GpsLocation extends Model
{
    protected $fillable = ['vehicle_id','latitude','longitude','timestamp'];
    
     protected $casts = [
        'timestamp' => 'datetime',
    ];

    public function vehicle()
    {
        return $this->belongsTo(\App\Models\Vehicle::class);
    }
}
