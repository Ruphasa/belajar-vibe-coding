# Belajar Vibe Coding 🚀

Selamat datang di proyek **Belajar Vibe Coding**! Proyek ini adalah sebuah RESTful API yang dibangun menggunakan Bun, ElysiaJS, dan Drizzle ORM dengan fokus pada performa yang sangat cepat dan kode yang sangat ketat (Type-Safe).

---

## 📑 Daftar Isi

1. [Tech Stack & Library](#tech-stack--library)
2. [Cara Setup](#cara-setup)
3. [Cara Run](#cara-run)
4. [Cara Test](#cara-test)
5. [Arsitektur & Struktur Folder](#arsitektur--struktur-folder)
6. [Skema Database](#skema-database)
7. [Daftar API yang Tersedia](#daftar-api-yang-tersedia)

---

## 🛠️ Tech Stack & Library

Proyek ini dibangun menggunakan alat-alat modern berikut:
- **[Bun](https://bun.sh/)**: Runtime JavaScript super cepat yang menggantikan Node.js, npm/yarn, nodemon, dan Jest sekaligus.
- **[ElysiaJS](https://elysiajs.com/)**: Framework web untuk Bun yang berfokus pada kecepatan, ergonomi, dan End-to-End Type Safety.
- **[Drizzle ORM](https://orm.drizzle.team/)**: TypeScript ORM yang sangat cepat, aman, dan mudah digunakan (bersama `drizzle-kit` untuk migrasi).
- **[MySQL2](https://github.com/sidorares/node-mysql2)**: Driver database MySQL yang sangat kencang.
- **TypeBox** (bawaan Elysia): Digunakan untuk validasi schema request/response secara ketat.

---

## ⚙️ Cara Setup

Berikut adalah langkah-langkah untuk menyiapkan proyek di komputermu:

1. **Pastikan Bun sudah terinstall**
   Jika belum, install Bun dengan menjalankan perintah berikut di terminal:
   ```bash
   powershell -c "irm bun.sh/install.ps1 | iex"  # Untuk Windows
   # atau
   curl -fsSL https://bun.sh/install | bash      # Untuk Mac/Linux
   ```

2. **Kloning Repositori & Install Dependencies**
   ```bash
   git clone https://github.com/Ruphasa/belajar-vibe-coding.git
   cd belajar-vibe-coding
   bun install
   ```

3. **Konfigurasi Environment**
   Buat file `.env` di folder root, lalu isi dengan koneksi database MySQL milikmu:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```
   *(Ganti username, password, dan nama_database dengan milikmu sendiri)*

4. **Migrasi Database**
   Push skema database langsung ke MySQL agar tabelnya otomatis terbuat:
   ```bash
   bun run db:push
   ```

---

## 🚀 Cara Run

Untuk menjalankan aplikasi dalam mode _development_ (dengan fitur auto-reload/watch), jalankan:

```bash
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`.

---

## 🧪 Cara Test

Kami menggunakan `bun test` bawaan dari Bun untuk Unit Testing. Sistem *testing* ini sangat cepat dan diisolasi (menghapus data dummy secara otomatis setiap sebelum tes dijalankan).

Untuk menjalankan skenario tes:
```bash
bun test
```
*(Saat ini terdapat belasan skenario tes yang mencakup validasi positif dan negatif untuk setiap endpoint API).*

---

## 📂 Arsitektur & Struktur Folder

Arsitektur aplikasi ini memisahkan antara *Controller* (Routes), *Business Logic* (Services), dan *Data Access* (Database) agar kode rapi dan mudah dirawat.

```text
📦 belajar-vibe-coding
 ┣ 📂 src
 ┃ ┣ 📂 db
 ┃ ┃ ┣ 📜 index.ts         # Inisiasi koneksi ke database Drizzle/MySQL
 ┃ ┃ ┗ 📜 schema.ts        # Definisi skema tabel database (Users & Sessions)
 ┃ ┣ 📂 routes
 ┃ ┃ ┗ 📜 user-routes.ts   # Berisi definisi HTTP endpoints (GET, POST, dll) & Validasi TypeBox
 ┃ ┣ 📂 services
 ┃ ┃ ┗ 📜 user-services.ts # Berisi business logic (Cek duplikasi, Hashing, Insert ke DB)
 ┃ ┗ 📜 index.ts           # Titik masuk (Entry point) utama aplikasi Elysia
 ┣ 📂 tests
 ┃ ┗ 📜 user-routes.test.ts# File unit test untuk rute-rute API
 ┣ 📜 .env                 # File environment (tidak di-commit ke Git)
 ┣ 📜 drizzle.config.ts    # Konfigurasi Drizzle Kit untuk keperluan migrasi
 ┣ 📜 package.json         # Konfigurasi dependensi dan scripts proyek
 ┗ 📜 tsconfig.json        # Konfigurasi TypeScript
```

---

## 🗄️ Skema Database

Terdapat 2 tabel utama dalam aplikasi ini:

### 1. `users`
Menyimpan data pengguna yang terdaftar.
- `id`: `varchar(255)` (Primary Key, otomatis diisi dengan CUID acak)
- `name`: `varchar(255)` (Nama pengguna)
- `email`: `varchar(255)` (Email pengguna, **Unik**)
- `password`: `varchar(255)` (Di-hash menggunakan algoritma Bcrypt bawaan Bun)

### 2. `sessions`
Menyimpan sesi login / token otentikasi.
- `token`: `varchar(255)` (Primary Key, UUID unik sebagai bearer token)
- `userId`: `varchar(255)` (Foreign Key, mengarah ke `users.id`)

---

## 🌐 Daftar API yang Tersedia

Base URL: `http://localhost:3000`

### 1. Register Akun Baru
- **Method:** `POST`
- **Endpoint:** `/api/users`
- **Body:** JSON
  ```json
  {
    "name": "Jhon Doe",
    "email": "jhon@gmail.com",
    "password": "password123"
  }
  ```
- **Keterangan:** Validasi TypeBox akan memastikan email formatnya benar dan panjang password minimal 8 karakter. Email tidak boleh duplikat.

### 2. Login
- **Method:** `POST`
- **Endpoint:** `/api/login`
- **Body:** JSON
  ```json
  {
    "email": "jhon@gmail.com",
    "password": "password123"
  }
  ```
- **Sukses:** Mengembalikan status `200` dan sebuah string `token`.

### 3. Mengambil Data User (Protected)
- **Method:** `GET`
- **Endpoint:** `/api/users`
- **Headers:** `Authorization: Bearer <token_kamu>`
- **Keterangan:** Mengambil daftar seluruh pengguna dari database dengan field terbatas (id, nama, email). Hanya bisa diakses bila token valid.

### 4. Logout (Protected)
- **Method:** `DELETE`
- **Endpoint:** `/api/logout`
- **Headers:** `Authorization: Bearer <token_kamu>`
- **Keterangan:** Akan menghapus `token` dari tabel `sessions` di database, sehingga token tersebut tidak lagi valid untuk dipakai.
