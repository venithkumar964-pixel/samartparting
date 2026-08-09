# Smart Parking API — API Contract

Base URL: `http://localhost:5000`

## GET /api/health

Health check.

**200**

```json
{ "status": "ok" }
```

## POST /api/register

Creates a new user account.

Request body:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1 555 123 4567",
  "password": "supersecret",
  "vehicleNumber": "ABC-1234",
  "vehicleType": "car"
}
```

`vehicleType` is one of: `car`, `bike`, `ev`.

Responses:

- **201** — `{ "message": "Account created successfully!" }`
- **409** — `{ "error": "An account with this email already exists." }`
- **422** — `{ "error": "<validation message>" }`

## POST /api/login

Authenticates a user.

Request body:

```json
{
  "email": "jane@example.com",
  "password": "supersecret",
  "rememberMe": false
}
```

Responses:

- **200**

  ```json
  {
    "message": "Login successful.",
    "user": {
      "id": 1,
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1 555 123 4567",
      "vehicleNumber": "ABC-1234",
      "vehicleType": "car"
    }
  }
  ```

- **401** — `{ "error": "Invalid email or password." }`
- **422** — `{ "error": "<validation message>" }`

All error responses use the `{ "error": "..." }` shape.
