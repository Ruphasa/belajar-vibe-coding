import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

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
