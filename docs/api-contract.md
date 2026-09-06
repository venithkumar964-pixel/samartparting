# Smart Parking API — API Contract

Base URL: `http://127.0.0.1:5000/api`

Response shape for success: `{ "success": true, "message": "...", ... }`
Response shape for errors: `{ "success": false, "error": "..." }`

Authentication: requests identify the logged-in user with the `X-User-Id` header
(auto-sent by the frontend). Endpoints marked **(admin)** check that the header
belongs to a user with role `admin`.

## Authentication

### POST /api/register

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+91 9876543210",
  "password": "supersecret",
  "vehicleNumber": "ABC-1234",
  "vehicleType": "car"
}
```

`vehicleType` is one of `car`, `bike`, `ev`. Passwords are stored hashed.

- **201** — account created
- **400** — validation error
- **409** — email already registered

### POST /api/login

```json
{ "email": "jane@example.com", "password": "supersecret" }
```

- **200** — `{ "success": true, "user": { id, name, email, phone, vehicleNumber, vehicleType, role } }`
- **401** — invalid credentials

## Users (admin)

- `GET /api/users` — (admin) list all users
- `GET /api/users/<id>` — get one user
- `PUT /api/users/<id>` — (admin) update name / phone / vehicleNumber / vehicleType / role
- `DELETE /api/users/<id>` — (admin) delete a user (no bookings allowed)

## Parking Locations

- `GET /api/parking` — list locations (`?q=` filters by name/address)
- `GET /api/parking/<id>` — location including its slots
- `POST /api/parking` — (admin) add location
- `PUT /api/parking/<id>` — (admin) update location
- `DELETE /api/parking/<id>` — (admin) delete location (no bookings allowed)

```json
POST /api/parking
{
  "name": "City Mall Parking",
  "address": "T. Nagar, Chennai",
  "pricePerHour": 40,
  "status": "open"
}
```

## Parking Slots

- `GET /api/parking/<parking_id>/slots` — list slots of a location
- `POST /api/slots` — (admin) add a slot
- `PUT /api/slots/<id>` — (admin) update slot status / number / type
- `DELETE /api/slots/<id>` — (admin) delete a slot (no bookings allowed)

Slot statuses: `available`, `occupied`, `reserved`.

```json
POST /api/slots
{
  "parking_id": 1,
  "slotNumber": "A06",
  "slotType": "car",
  "status": "available"
}
```

## Bookings

- `GET /api/bookings` — current user's bookings, or all bookings for an admin
- `GET /api/bookings/<id>` — booking details (owner or admin)
- `POST /api/bookings` — create a booking
- `PUT /api/bookings/<id>` — (admin) update status: `pending` / `confirmed` / `completed` / `cancelled`
- `DELETE /api/bookings/<id>` — (admin) delete a booking (frees the slot)

```json
POST /api/bookings
{
  "user_id": 2,
  "parking_id": 1,
  "slot_id": 3,
  "booking_date": "2026-09-25",
  "start_time": "10:00",
  "end_time": "12:30"
}
```

Duration and amount are computed by the backend from the parking's price per hour.
Creating a booking reserves the slot and reduces the available-slot count.
Setting status to `cancelled` releases the slot and restores the count.

## Payments

- `GET /api/payments` — payments of the current user, or all for admin
- `GET /api/payments/<id>` — one payment
- `POST /api/payments` — simulate payment

```json
POST /api/payments
{ "booking_id": 5, "paymentMethod": "UPI" }
```

`paymentMethod` is one of `UPI`, `Card`, `Cash`. Payment is stored with status
`paid` and the booking is marked `confirmed`.

## Admin

- `GET /api/admin/dashboard` — (admin) totals: users, parking locations, slots,
  available/occupied slots, bookings, and revenue

## Health

- `GET /api/health` — `{ "status": "ok" }`