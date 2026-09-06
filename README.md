# Smart Parking & Slot Booking Platform

A full-stack web application that lets users find parking locations, view live slot
availability, book slots online, make payments, and manage their bookings — managed
through an admin dashboard. Built as a beginner-friendly college capstone project.

## Project Description

The Smart Parking system solves the everyday problem of finding a parking spot.
Users can search parking locations by area, see which slots are free in real time,
pick a slot, choose a date and time, pay online (simulated), and instantly get a
booking confirmation with a booking ID. An admin can manage users, parking
locations, slots, bookings, and payments, and monitor revenue through a dashboard.

## Features

* User registration and login with hashed passwords
* Search parking locations by location / area
* Live slot availability (Available / Occupied / Reserved / Selected)
* Book a slot with date, start time, end time, and automatic fee calculation
* Simulated payment via UPI / Card / Cash with payment status stored in the database
* Booking confirmation page with QR-code placeholder
* My Bookings page with Cancel Booking option
* Admin dashboard with statistics and full management of users, parking, slots,
  bookings, and payments
* Slot status correctly released when a booking is cancelled
* Responsive, modern UI built with React

## Technology Stack

| Layer      | Technology                                   |
|------------|----------------------------------------------|
| Frontend   | React.js, HTML5, CSS3, JavaScript, React Router, Axios |
| Backend    | Python, Flask, Flask REST API, Flask-CORS    |
| Database   | SQLite, SQLAlchemy ORM (Flask-SQLAlchemy)    |
| Security   | Werkzeug password hashing, input/email validation |

## Project Structure

```text
smart-parking/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ParkingCard.jsx
│       │   └── SlotCard.jsx
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Parking.jsx
│       │   ├── Slots.jsx
│       │   ├── Booking.jsx
│       │   ├── Payment.jsx
│       │   ├── Confirmation.jsx
│       │   ├── MyBookings.jsx
│       │   └── AdminDashboard.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── backend/
│   ├── app.py             # Flask setup, CORS, sample data seeding
│   ├── models.py          # SQLAlchemy models
│   ├── routes.py          # All REST API endpoints
│   ├── database.py        # SQLAlchemy db instance
│   ├── requirements.txt
│   └── smart_parking.db   # Created automatically on first run
│
├── .env.example
├── .gitignore
└── README.md
```

## Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
python app.py
```

The Flask API runs on `http://127.0.0.1:5000`. All endpoints are under `/api`.

## Frontend Setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The React app (Vite) runs on `http://localhost:3000`. It talks to Flask using Axios,
with the base URL configured in `frontend/src/services/api.js`.

## Database Information

* SQLite database file: `backend/smart_parking.db` (created automatically on first run)
* ORM: SQLAlchemy via Flask-SQLAlchemy
* Sample data is inserted automatically the first time the app runs: 4 parking
  locations, sample slots (A01–A05, B01–B03) with varied statuses, an admin user,
  and a demo user.

### Tables

* `users` — id, name, email, phone, password (hashed), vehicle_number, vehicle_type, role, created_at
* `parkings` — id, name, address, total_slots, available_slots, price_per_hour, status
* `slots` — id, parking_id, slot_number, slot_type, status
* `bookings` — id, user_id, parking_id, slot_id, booking_date, start_time, end_time, duration, amount, status
* `payments` — id, booking_id, amount, payment_method, payment_status, payment_date

Relationships: User → Booking, Parking → Slot, Parking → Booking, Slot → Booking, Booking → Payment.

### Demo Accounts

| Role  | Email                 | Password    |
|-------|-----------------------|-------------|
| Admin | admin@smartpark.in    | admin123    |
| User  | demo@smartpark.in     | demo1234    |

## API Information

Base URL: `http://127.0.0.1:5000/api`

The logged-in user is identified with the `X-User-Id` request header, which the
frontend sends automatically. Admin endpoints reject requests without an admin account.

| Method | Endpoint                          | Description                         |
|--------|-----------------------------------|-------------------------------------|
| POST   | `/register`                       | Create a user account               |
| POST   | `/login`                          | Login and get user details          |
| GET    | `/users`                          | List users (admin)                  |
| GET    | `/users/<id>`                     | Get one user                        |
| PUT    | `/users/<id>`                     | Update a user (admin)               |
| DELETE | `/users/<id>`                     | Delete a user (admin)               |
| GET    | `/parking`                        | List parking locations              |
| GET    | `/parking/<id>`                   | Get a parking location and its slots|
| POST   | `/parking`                        | Add a parking location (admin)      |
| PUT    | `/parking/<id>`                   | Update a parking location (admin)   |
| DELETE | `/parking/<id>`                   | Delete a parking location (admin)   |
| GET    | `/parking/<parking_id>/slots`     | List slots of a parking             |
| POST   | `/slots`                          | Add a slot (admin)                  |
| PUT    | `/slots/<id>`                     | Update a slot (admin)               |
| DELETE | `/slots/<id>`                     | Delete a slot (admin)               |
| GET    | `/bookings`                       | List bookings (mine or all)         |
| GET    | `/bookings/<id>`                  | Get one booking                     |
| POST   | `/bookings`                       | Create a booking                    |
| PUT    | `/bookings/<id>`                  | Update booking status (e.g. cancel) |
| DELETE | `/bookings/<id>`                  | Delete a booking (admin)            |
| GET    | `/payments`                       | List payments                       |
| GET    | `/payments/<id>`                  | Get one payment                     |
| POST   | `/payments`                       | Create a payment                    |
| GET    | `/admin/dashboard`                | Dashboard statistics (admin)        |
| GET    | `/health`                         | Health check                        |

Responses are JSON, for example:

```json
{
  "success": true,
  "message": "Payment successful! Your booking is confirmed.",
  "booking_id": 101
}
```

## Booking Flow

```text
User Login
    ↓
Search Parking
    ↓
Select Parking Location
    ↓
View Available Slots
    ↓
Select Slot
    ↓
Select Date & Time
    ↓
Calculate Parking Fee
    ↓
Confirm Booking
    ↓
Payment
    ↓
Booking Confirmation
    ↓
My Bookings
```

When a booking is confirmed:

1. The slot is checked for availability.
2. The booking record is created.
3. The slot status changes to `reserved`.
4. The parking's available-slot count is reduced.
5. A payment record is created.
6. The confirmation is returned to the frontend.

When a booking is cancelled:

1. The booking status changes to `cancelled`.
2. The slot status changes back to `available`.
3. The parking's available-slot count is increased.

## Security Notes

* Passwords are hashed with Werkzeug (`generate_password_hash`) — never stored in plain text.
* Duplicate email registration is rejected.
* Email, phone, and vehicle number are validated on the backend.
* Slot availability is checked again on the server before a booking is created.
* Admin endpoints require an admin account.
* CORS is configured to allow the React dev server.

## How to Run the Project

Open **two terminals** from the project root.

**Terminal 1 — Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Flask will be running at `http://127.0.0.1:5000`.

**Terminal 2 — Frontend:**

```bash
cd frontend
npm install
npm run dev
```

React (Vite) will be running at `http://localhost:3000`. Open that URL in your
browser to use the application.