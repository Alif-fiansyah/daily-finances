# Daily Finances - Smart Financial Platform

**Daily Finances** adalah aplikasi pencatatan keuangan cerdas berbasis web modern yang dirancang dengan estetika **Neubrutalism** (menampilkan kontras warna tajam, border hitam tebal, dan bayangan tegas). Aplikasi ini memadukan kemudahan pencatatan transaksi, pemindaian struk lokal, visualisasi diagram batang kategori, serta asisten keuangan interaktif.

---

## Fitur Utama

1. **Dashboard Arus Kas Harian**
   - Ringkasan total pengeluaran bulan ini secara *real-time*.
   - Indikator sisa anggaran dan batas target anggaran yang dapat diatur fleksibel.
   - Tabel ringkasan transaksi terbaru.

2. **Smart Scan Struk & QRIS (Local OCR)**
   - Mendukung 3 metode input: **Unggah Berkas**, **Pindai Kamera Langsung**, dan **Input Manual**.
   - Dilengkapi mesin ekstraksi teks cerdas (*Tesseract.js*) untuk membaca nominal dan jenis merchant secara otomatis tanpa error API eksternal.
   - Kolom catatan yang bersih untuk memudahkan penulisan detail barang yang dibeli.

3. **Log & Analisis Transaksi**
   - Daftar seluruh riwayat transaksi lengkap dengan filter pencarian berdasarkan *merchant* dan kategori.
   - Fitur hapus data transaksi dengan konfirmasi.

4. **Statistik Diagram Batang & AI Planner**
   - Visualisasi diagram batang interaktif untuk melihat distribusi pengeluaran berdasarkan kategori (Makanan & Minuman, Belanja Bulanan, Transportasi, dll.).
   - **AI Financial Advisor** interaktif untuk tanya-jawab seputar evaluasi pengeluaran dan tips hemat.

---

## Teknologi yang Digunakan

- **Frontend**: React.js (via CDN untuk kesederhanaan dan performa cepat)
- **Styling**: Tailwind CSS & Custom Neubrutalism CSS Framework
- **Backend / Server**: PHP (Local Development Server)
- **OCR Engine**: Tesseract.js (Client-side Optical Character Recognition)
- **Icons**: Lucide Icons

---

## Cara Menjalankan Aplikasi

1. Pastikan Anda sudah menginstal **PHP** di komputer/laptop Anda.
2. Clone atau unduh repositori proyek ini ke dalam direktori lokal Anda.
3. Buka terminal atau command prompt, lalu arahkan ke folder utama proyek (`daily-finances`).
4. Jalankan server lokal PHP dengan perintah:
   ```bash
   php -S localhost:8000

## Sample Photo
<img width="1600" height="848" alt="image" src="https://github.com/user-attachments/assets/08a387fa-368a-4b62-b6db-69792f2ac632" />
<img width="1600" height="846" alt="image" src="https://github.com/user-attachments/assets/8f09be56-784a-4020-aa62-7701440bfd5d" />
<img width="1600" height="845" alt="image" src="https://github.com/user-attachments/assets/83ceee1e-8fec-44b6-94d8-7b29039eecb6" />
<img width="1600" height="847" alt="image" src="https://github.com/user-attachments/assets/f312409d-8ed7-4caa-9bb4-f3094ab72b61" />
<img width="1600" height="843" alt="image" src="https://github.com/user-attachments/assets/9d35a647-52e0-4388-a21c-7acac3744c72" />




