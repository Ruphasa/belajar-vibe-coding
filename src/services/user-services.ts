import { db } from "../db";
import { users, sessions } from "../db/schema";
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
