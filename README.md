# Petunjuk Menjalankan Aplikasi VR

> Dibuat oleh **Ghany Abdillah Ersa**, Mahasiswa Magister Sistem Informasi, Fakultas Ilmu Komputer, Universitas Brawijaya.

## Persyaratan
- Browser modern (Chrome / Firefox / Edge versi terbaru)
- Koneksi internet (untuk memuat A-Frame dari CDN dan asset 360°)
- Opsional: HMD (Meta Quest, dll.) untuk mode VR penuh

## Cara Menjalankan

### Metode 1: Buka Langsung (Paling Mudah)
Klik dua kali file `index.html`. Browser akan membukanya secara lokal.

> **Catatan:** Beberapa browser memblokir akses asset CORS saat dibuka via `file://`. 
> Jika ada gambar yang tidak muncul, gunakan Metode 2.

### Metode 2: Local Server (Direkomendasikan)
Jalankan salah satu perintah di folder proyek:

**Python 3:**
```bash
python -m http.server 8000
```

**Node.js (jika punya):**
```bash
npx http-server -p 8000
```

**VS Code:**  
Install ekstensi *Live Server*, klik kanan `index.html` → "Open with Live Server".

## Tips Mengaktifkan Mode VR di Browser
1. Klik ikon kacamata VR di pojok kanan-bawah scene
2. Browser akan switch ke mode stereoscopic (split-screen)
3. Untuk fullscreen di desktop tanpa headset: tekan `F11`

## Struktur File
```
vr-project/
├── index.html              # Halaman beranda navigasi
├── vr-objek3d.html         # Aplikasi 1 (objek 3D)
├── vr-360.html             # Aplikasi 2 (VR 360°)
├── README.md               # File ini
```

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Asset tidak muncul | Gunakan local server (Metode 2) |
| Tidak bisa bergerak | Klik dulu pada area scene, lalu pakai WASD |
| Cursor tidak berfungsi | Pastikan tidak ada browser extension yang memblokir script |
| Hotspot 360° tidak respons | Hover beberapa detik (fuse-timeout 1.5s) |
