<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'category_id',
        'item_name',
        'quantity',
        'item_price',
        'subtotal',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'item_price' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function transaction()
    {
        return $this->belongsTo(Transaction::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Boot method to automatically calculate subtotal
     */
    protected static function boot()
    {
        parent::boot();

        // Calculate subtotal before saving
        static::saving(function ($detail) {
            if ($detail->quantity && $detail->item_price) {
                $detail->subtotal = $detail->quantity * $detail->item_price;
            }
        });
    }
}