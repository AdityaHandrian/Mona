<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Carbon\Carbon;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'date_of_birth',
        'profile_photo_path',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth'     => 'date',
        ];
    }

    /**
     * Mutator: terima dd/mm/yyyy ATAU yyyy-mm-dd, simpan sebagai yyyy-mm-dd.
     */
    public function setDateOfBirthAttribute($value): void
    {
        if (blank($value)) {
            $this->attributes['date_of_birth'] = null;
            return;
        }

        // Coba dd/mm/yyyy
        try {
            $this->attributes['date_of_birth'] = Carbon::createFromFormat('d/m/Y', $value)->format('Y-m-d');
            return;
        } catch (\Throwable $e) {}

        // Coba yyyy-mm-dd
        try {
            $this->attributes['date_of_birth'] = Carbon::createFromFormat('Y-m-d', $value)->format('Y-m-d');
            return;
        } catch (\Throwable $e) {}

        // Kalau dua-duanya gagal, biarkan value mentah (akan ketangkap validasi di controller)
        $this->attributes['date_of_birth'] = $value;
    }

    /**
     * Accessor: kembalikan dd/mm/yyyy untuk dipakai di frontend.
     */
    public function getDateOfBirthAttribute($value): ?string
    {
        if (blank($value)) return null;

        try {
            return Carbon::parse($value)->format('d/m/Y');
        } catch (\Throwable $e) {
            return $value; // fallback
        }
    }

    /**
     * (Opsional) Virtual: first_name & last_name, berguna untuk form.
     */
    protected $appends = [
        // tambahkan kalau mau otomatis ikut di-serialize ke Inertia/JSON:
        // 'first_name', 'last_name',
    ];

    public function getFirstNameAttribute(): ?string
    {
        if (blank($this->name)) return null;
        $parts = preg_split('/\s+/', trim($this->name), -1, PREG_SPLIT_NO_EMPTY);
        return $parts[0] ?? null;
    }

    public function getLastNameAttribute(): ?string
    {
        if (blank($this->name)) return null;
        $parts = preg_split('/\s+/', trim($this->name), -1, PREG_SPLIT_NO_EMPTY);
        array_shift($parts);
        return count($parts) ? implode(' ', $parts) : null;
    }
}
