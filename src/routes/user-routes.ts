import { Elysia, t } from "elysia";
import { registerUser, loginUser, getUsers, logoutUser } from "../services/user-services";



export const userRoutes = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    try {
      await registerUser(body);
      set.status = 201;
      return { message: "User created successfully" };
    } catch (error: any) {
      if (error?.message === "User already exists" || error?.code === "ER_DUP_ENTRY" || error?.message?.includes("Duplicate entry") || (error?.cause && error.cause.code === "ER_DUP_ENTRY")) {
        set.status = 409;
        return { message: "User already exists" };
      }
      console.error("DB Error:", error);
      set.status = 500;
      return { message: "Internal server error" };
    }
  }, {
    detail: {
      summary: "Register Akun Baru",
      tags: ["Users"],
      description: "Mendaftarkan pengguna baru dengan email dan password."
    },
    body: t.Object({
      name: t.String({ maxLength: 255 }),
      email: t.String({ format: "email", maxLength: 255 }),
      password: t.String({ minLength: 8, maxLength: 255 })
    }),
    response: {
      201: t.Object({ message: t.String() }),
      409: t.Object({ message: t.String() }),
      500: t.Object({ message: t.String() })
    }
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
    detail: {
      summary: "Login Pengguna",
      tags: ["Users"],
      description: "Autentikasi pengguna dan mengembalikan Bearer Token."
    },
    body: t.Object({
      email: t.String({ format: "email", maxLength: 255 }),
      password: t.String({ maxLength: 255 })
    }),
    response: {
      200: t.Object({ message: t.String(), token: t.String() }),
      404: t.Object({ message: t.String() })
    }
  })
  .group("", (app) => app
    .derive(({ headers }) => {
      const authHeader = headers.authorization;
      return { token: authHeader ? authHeader.split(" ")[1] : "" };
    })
    .onBeforeHandle(({ headers, set }) => {
      const authHeader = headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { message: "unauthorized" };
      }
    })
    .get("/users", async ({ token, set }) => {
      try {
        const data = await getUsers(token);
        set.status = 200;
        return { message: "Login successful", data };
      } catch (error) {
        set.status = 401;
        return { message: "unauthorized" };
      }
    }, {
      detail: {
        summary: "Ambil Semua Pengguna",
        tags: ["Users"],
        description: "Mengambil data semua pengguna. Membutuhkan Bearer Token."
      },
      headers: t.Object({
        authorization: t.Optional(t.String({ description: "Masukkan token: Bearer <token>" }))
      }),
      response: {
        200: t.Object({
          message: t.String(),
          data: t.Array(
            t.Object({
              id: t.Number(),
              name: t.String(),
              email: t.String(),
              createdAt: t.Any()
            })
          )
        }),
        401: t.Object({ message: t.String() })
      }
    })
    .delete("/logout", async ({ token, set }) => {
      try {
        await logoutUser(token);
        set.status = 200;
        return { message: "Logout successful" };
      } catch (error) {
        set.status = 401;
        return { message: "Unauthorized" };
      }
    }, {
      detail: {
        summary: "Logout Pengguna",
        tags: ["Users"],
        description: "Menghapus sesi pengguna. Membutuhkan Bearer Token."
      },
      headers: t.Object({
        authorization: t.Optional(t.String({ description: "Masukkan token: Bearer <token>" }))
      }),
      response: {
        200: t.Object({ message: t.String() }),
        401: t.Object({ message: t.String() })
      }
    })
  );
