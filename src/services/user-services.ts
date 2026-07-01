import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * Mendaftarkan pengguna baru ke dalam database.
 * 
 * Fungsi ini melakukan pengecekan apakah email sudah digunakan. Jika belum, 
 * fungsi akan mengenkripsi (hash) password yang diberikan menggunakan algoritma bcrypt
 * bawaan dari Bun, lalu menyimpan data pengguna baru tersebut ke dalam tabel `users`.
 * 
 * @param {any} data - Objek yang berisi `name`, `email`, dan `password` pengguna.
 * @throws {Error} Akan melempar error jika email sudah terdaftar sebelumnya.
 */
export async function registerUser(data: any) {
  // Check if email already exists
  const existingUser = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (existingUser.length > 0) {
    throw new Error("User already exists");
  }

  // Hash password using Bun's native bcrypt
  const hashedPassword = await Bun.password.hash(data.password, { algorithm: "bcrypt" });

  // Insert user
  await db.insert(users).values({
    name: data.name,
    email: data.email,
    password: hashedPassword,
  });
}

/**
 * Melakukan proses login pengguna dan menghasilkan token otentikasi.
 * 
 * Fungsi ini memvalidasi keberadaan email di database. Jika ditemukan, fungsi akan
 * memverifikasi kecocokan password menggunakan fungsi verifikasi bcrypt bawaan Bun.
 * Jika otentikasi berhasil, fungsi akan membuat sebuah token (UUID acak),
 * menyimpannya di tabel `sessions`, dan mengembalikan token tersebut kepada klien.
 * 
 * @param {any} data - Objek yang berisi `email` dan `password` pengguna.
 * @returns {Promise<string>} Token sesi / otentikasi yang berhasil dibuat.
 * @throws {Error} Akan melempar error "User not found" jika email atau password salah.
 */
export async function loginUser(data: any) {
  // Check if user exists
  const userList = await db.select().from(users).where(eq(users.email, data.email)).limit(1);
  if (userList.length === 0) {
    throw new Error("User not found");
  }
  const user = userList[0];

  // Verify password
  const isMatch = await Bun.password.verify(data.password, user.password);
  if (!isMatch) {
    throw new Error("User not found");
  }

  // Generate a simple token (UUID)
  const token = crypto.randomUUID();

  // Insert session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return token;
}

/**
 * Mengambil daftar seluruh pengguna dari database dengan field yang dibatasi.
 * 
 * Fungsi ini beroperasi di rute "protected", sehingga membutuhkan validasi token.
 * Ia akan mengecek apakah token yang diberikan valid dengan mencocokkannya
 * di tabel `sessions`. Jika valid, ia akan mengembalikan id, nama, dan email pengguna.
 * 
 * @param {string} token - Token sesi otentikasi (Bearer token).
 * @returns {Promise<Array>} Array berisi daftar pengguna.
 * @throws {Error} Akan melempar error "unauthorized" jika token tidak ditemukan.
 */
export async function getUsers(token: string) {
  // Check token in sessions
  const sessionList = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (sessionList.length === 0) {
    throw new Error("unauthorized");
  }

  // Fetch users with limited fields
  const allUsers = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
  }).from(users);

  return allUsers;
}

/**
 * Melakukan proses logout pengguna dengan menghapus sesinya.
 * 
 * Fungsi ini akan menghapus entri token yang cocok dari tabel `sessions`.
 * Setelah entri dihapus, token tersebut tidak lagi valid untuk rute-rute "protected".
 * 
 * @param {string} token - Token sesi otentikasi yang ingin di-logout.
 * @throws {Error} Akan melempar error "unauthorized" jika penghapusan gagal / token tidak ada.
 */
export async function logoutUser(token: string) {
  const result = await db.delete(sessions).where(eq(sessions.token, token));
  if (result[0].affectedRows === 0) {
    throw new Error("unauthorized");
  }
}
