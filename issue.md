# Feature: Get Users (Protected Route)

## API Endpoint
Implement an API to fetch a list of users. This endpoint must be protected and requires a valid session token.

**Endpoint:** `GET /api/users`

**Headers:**
- `Authorization`: `Bearer <token>`

**Response (Success - 200 OK):**
```json
{
    "message": "Login successful",
    "data": [
        {
            "id": 1,
            "name": "Rizqi Fauzan",
            "email": "rizqifauzan@gmail.com"
        }
    ]
}
```

**Response (Error - 401 Unauthorized):**
```json
{
    "message": "unauthorized"
}
```

## Folder & File Structure
Continue using our layered architecture inside the `src` folder:
- `src/routes/user-routes.ts`: Add the new endpoint here.
- `src/services/user-services.ts`: Add the business logic for fetching users and verifying the token.

## Implementation Notes for Programmer
1. **Middleware / Token Verification**:
   - Extract the `Authorization` header (`Bearer <token>`).
   - Query the `sessions` table in the database to ensure the token exists and is valid.
   - If the token is invalid or missing, immediately return a `401 Unauthorized` response with the message `unauthorized`.
2. **Service Logic (`user-services.ts`)**:
   - Create a function (e.g., `getUsers()`) that queries the `users` table.
   - Select only the `id`, `name`, and `email` fields (exclude passwords or timestamps if not needed).
3. **Route Setup (`user-routes.ts`)**:
   - Update the existing `GET /api/users` (or create it if it doesn't exist) to include the authorization check.
   - If authorized, call the service to fetch users and format the response to match the success JSON structure above.
