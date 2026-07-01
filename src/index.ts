import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { userRoutes } from "./routes/user-routes";

const app = new Elysia()
  .use(userRoutes)
  .get("/", () => {
    return { status: "ok", message: "Server is running!" };
  })
  .get("/users", async () => {
    try {
      const allUsers = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        createdAt: users.createdAt
      }).from(users);
      return allUsers;
    } catch (error) {
      return { error: "Database error" };
    }
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
