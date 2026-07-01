# Feature: User Logout

## API Endpoint
Implement an API to log out a user. This endpoint requires a valid session token, which will be deleted from the database upon a successful logout.

**Endpoint:** `DELETE /api/logout`

**Headers:**
- `Authorization`: `Bearer <token>`

**Response (Success - 200 OK):**
```json
{
    "message": "Logout successful"
}
```

**Response (Error - 401 Unauthorized):**
```json
{
    "message": "Unauthorized"
}
```

## Folder & File Structure
Continue using our layered architecture inside the `src` folder:
- `src/routes/user-routes.ts`: Add the new logout endpoint here.
- `src/services/user-services.ts`: Add the business logic for deleting the session token.

## Implementation Notes for Programmer
1. **Middleware / Token Verification**:
   - Extract the `Authorization` header (`Bearer <token>`).
   - If the header is missing or improperly formatted, return a `401 Unauthorized` response with the message `"Unauthorized"`.
2. **Service Logic (`user-services.ts`)**:
   - Create a function (e.g., `logoutUser(token: string)`) that receives the token.
   - Execute a `DELETE` query on the `sessions` table where the `token` matches the provided token.
   - If the deletion affects 0 rows (meaning the token didn't exist in the database), throw an error to return a `401 Unauthorized`.
3. **Route Setup (`user-routes.ts`)**:
   - Add the `DELETE /logout` endpoint.
   - If the token is successfully deleted via the service, return the `200 OK` response with `"Logout successful"`.
   - If an error is caught (e.g., invalid token), return `401 Unauthorized`.
