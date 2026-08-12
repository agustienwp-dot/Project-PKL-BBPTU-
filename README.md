# Sistem Manajemen Ternak dan Penjualan Hewan (FarmStock Pro)

Aplikasi web modern untuk mengelola data hewan ternak, kandang, stok ketersediaan hewan, transaksi penjualan, riwayat pertumbuhan berat, serta mutasi perpindahan kandang.

---

## 🚀 Tech Stack

### Backend
* **Node.js** (v18+)
* **Express.js** (Framework REST API)
* **Prisma ORM** (Database Abstraction & Migration)
* **JSON Web Token (JWT)** & **BCrypt** (Autentikasi & Hashing Password)
* **Zod** (Validasi Input Request)
* **Helmet** & **Express Rate Limit** (Keamanan Server API)
* **Jest** & **Supertest** (Pengujian Otomatis Integration Testing)

### Database
* **SQLite** (Bawaan siap jalan zero-config) / **PostgreSQL** (Dukungan produksi)

---

## ⚙️ Cara Setup & Menjalankan Backend

1. Masuk ke folder `backend`:
   ```bash
   cd backend
   ```

2. Install dependency:
   ```bash
   npm install
   ```

3. Jalankan Prisma Client & Push Schema:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

4. Jalankan Database Seed:
   ```bash
   npm run prisma:seed
   ```

5. Jalankan Server Dev API:
   ```bash
   npm run dev
   ```
   Server backend Express berjalan di: `http://localhost:5000`

6. Jalankan Automated Integration Testing (Jest):
   ```bash
   npm test
   ```

---

## 🔑 Data Akun Uji Coba (Default Seed)

| Role | Email | Password | Hak Akses |
|---|---|---|---|
| **ADMIN** | `admin@farm.com` | `admin123` | Akses Penuh Sistem (Manage All & Users) |
| **STAFF** | `staff@farm.com` | `staff123` | Akses Operasional Kandang & Hewan |

---

## 📡 Dokumentasi Endpoint REST API

Seluruh endpoint memerlukan Header `Authorization: Bearer <JWT_TOKEN>` kecuali `POST /api/auth/login` dan `GET /api/health`.

### 1. Autentikasi (`/api/auth`)
* `POST /api/auth/login` - Login pengguna (Dilindungi Rate Limiter 10x/15 mnt).
  * Payload: `{ "email": "admin@farm.com", "password": "admin123" }`
* `GET /api/auth/me` - Ambil profil user yang sedang login.

### 2. Dashboard & Statistik Stok (`/api/dashboard`)
* `GET /api/dashboard` - Ambil data real-time agregasi stok hewan (`totalAnimals`, `availableAnimals`, `soldAnimals`, `deceasedAnimals`, `totalCages`, `totalSales`, `totalRevenue`, & rincian stok per kandang).

### 3. Kandang / Cage API (`/api/cages`)
* `GET /api/cages` - Daftar semua kandang beserta jumlah hewan tersedia & slot kosong.
* `POST /api/cages` - Tambah kandang baru (Validasi Zod).
  * Payload: `{ "name": "Kandang D", "type": "Sapi", "location": "Blok Timur", "capacity": 15 }`
* `GET /api/cages/:id` - Detail kandang lengkap dengan daftar hewan berstatus `AVAILABLE` di kandang tersebut.
* `PUT /api/cages/:id` - Update data kandang.
* `DELETE /api/cages/:id` - Hapus kandang (Hanya Role ADMIN, gagal jika masih berisi hewan).

### 4. Hewan / Animal API (`/api/animals`)
* `GET /api/animals` - Daftar hewan ternak.
  * Query Params: `page`, `limit`, `search`, `status` (`AVAILABLE`, `SOLD`, `DECEASED`, `TRANSFERRED`), `type`, `cageId`, `sortBy`, `order`.
* `POST /api/animals` - Tambah hewan ternak baru.
  * Validasi: Kode hewan harus unik, kapasitas kandang tidak boleh dilampaui.
  * Payload:
    ```json
    {
      "code": "SP-005",
      "name": "Bintang",
      "type": "Sapi",
      "breed": "Limosin",
      "gender": "Jantan",
      "weight": 420.5,
      "purchasePrice": 16000000,
      "estimatedSellingPrice": 23000000,
      "cageId": "<CAGE_ID>"
    }
    ```
* `GET /api/animals/:id` - Detail hewan ternak + riwayat berat, perpindahan, & transaksi.
* `PUT /api/animals/:id` - Update data hewan ternak.
* `DELETE /api/animals/:id` - Hapus data hewan ternak (ADMIN only).

### 5. Riwayat Berat & Mutasi Kandang
* `GET /api/animals/:id/weights` - Riwayat pertumbuhan berat hewan.
* `POST /api/animals/:id/weights` - Catat berat hewan baru.
  * Payload: `{ "weight": 445.0, "notes": "Penimbangan rutin" }`
* `POST /api/animals/:id/move` - Pindahkan hewan ke kandang baru (Atomic Transaction & Validasi Kapasitas Kandang Tujuan).
  * Payload: `{ "toCageId": "<TARGET_CAGE_ID>", "notes": "Pindah kandang penggemukan" }`
* `GET /api/animals/:id/movements` - Riwayat perpindahan kandang hewan.

### 6. Pembeli / Buyer API (`/api/buyers`)
* `GET /api/buyers` - Daftar pembeli + pencarian.
* `POST /api/buyers` - Tambah data pembeli baru.
* `GET /api/buyers/:id` - Detail pembeli + riwayat transaksi pembelian.
* `PUT /api/buyers/:id` - Update data pembeli.
* `DELETE /api/buyers/:id` - Hapus pembeli (ADMIN only).

### 7. Transaksi Penjualan / Sales API (`/api/sales`)
* `GET /api/sales` - Daftar seluruh transaksi penjualan.
* `GET /api/sales/:id` - Detail transaksi penjualan.
* `POST /api/sales` - Catat transaksi penjualan baru (**Database Transaction Atomic**).
  * Aturan Bisnis:
    1. Memastikan hewan berstatus `AVAILABLE`.
    2. Memastikan hewan belum pernah dijual.
    3. Memastikan pembeli valid & harga jual > 0.
    4. Mengubah status hewan secara otomatis menjadi `SOLD`.
    5. Menuliskan Audit Log.
    6. Rollback otomatis jika ada proses yang gagal.
  * Payload:
    ```json
    {
      "animalId": "<ANIMAL_ID>",
      "buyerId": "<BUYER_ID>",
      "weightAtSale": 450.0,
      "sellingPrice": 24000000,
      "paymentMethod": "TRANSFER",
      "notes": "Lunas Transfer Bank"
    }
    ```

---

## 🧪 Pengujian Bisnis Otomatis (Automated Tests)

Jalankan perintah pengujian:
```bash
npm test
```

Pengujian mencakup 6 aturan bisnis kritis:
1. ✅ **TEST 1**: Hewan `AVAILABLE` dapat dijual dengan sukses.
2. ✅ **TEST 2**: Hewan `SOLD` tidak dapat dijual lagi (gagal).
3. ✅ **TEST 3 & 4**: Setelah penjualan, stok `AVAILABLE` berkurang & `SOLD` bertambah pada agregasi dashboard.
4. ✅ **TEST 5**: Kapasitas kandang tidak boleh dilampaui saat menambah hewan / memindahkan hewan.
5. ✅ **TEST 6**: Transaksi rollback otomatis (status hewan tetap `AVAILABLE`) jika transaksi penjualan gagal.
