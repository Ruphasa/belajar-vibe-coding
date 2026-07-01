import { Elysia, t } from "elysia";
import { registerUser } from "../services/user-services";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  .post("/", async ({ body, set }) => {
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
  });
