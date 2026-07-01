import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/user-services";

export const userRoutes = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      await registerUser(body);
      set.status = 201;
      return { message: "User created successfully" };
    } catch (error: any) {
      if (error.message === "User already exists") {
        set.status = 409;
      } else {
        set.status = 400;
      }
      return { message: error.message || "An error occurred" };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String()
    })
  })
  .post("/login", async ({ body, set }) => {
    try {
      const token = await loginUser(body);
      set.status = 200;
      return { message: "Login successful", token };
    } catch (error: any) {
      set.status = 404; // User not found
      return { message: "User not found" };
    }
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String()
    })
  });
