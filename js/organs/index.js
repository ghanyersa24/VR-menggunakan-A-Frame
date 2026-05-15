// =====================================================================
// Organ registry — daftar semua organ yang tersedia di aplikasi.
// Untuk menambah organ baru:
//   1. Buat file ./<organ>.js dengan default export sesuai kontrak
//      di heart.js.
//   2. Import & tambahkan ke `ORGANS` di bawah.
// Tidak ada perubahan lain yang dibutuhkan di file utama HTML.
// =====================================================================

import heart from './heart.js';
import lungs from './lungs.js';

export const ORGANS = {
  [heart.key]: heart,
  [lungs.key]: lungs,
};

// Daftar key sesuai urutan tampil di selector boxes (kiri ke kanan).
export const ORGAN_ORDER = ['heart', 'lungs'];
