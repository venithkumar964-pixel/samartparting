# Smart Parking & Slot Booking Platform

A web-based parking system that helps users find and book available parking slots, built with a React (Vite) frontend and a FastAPI (Python) backend.

## Project Structure

```text
smart-parking/
│
├── app/                  # FastAPI application
│   ├── api/              # Routers / views
│   │   └── routes/
│   ├── core/             # Settings / security helpers / DB engine
│   ├── models/           # SQLAlchemy ORM models
│   ├── schemas/          # Pydantic schemas
│   └── services/         # Business logic
│
├── tests/                # Unit tests (mirrors app structure)
│
├── docs/                 # Diagrams, API contract
│
├── frontend/             # React (Vite) frontend
│
├── database/
│   └── schema.sql        # Database schema
│
├── .env.example          # Environment variables template
├── README.md
└── requirements.txt
```

## Setup

### Backend (FastAPI)

```sh
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 5000
```

Or run directly:

```sh
python -m app.main
```

The API runs on `http://localhost:5000`. Interactive docs are available at `http://localhost:5000/docs`.

### Frontend (React)

```sh
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies `/api` to the backend.

### Tests

```sh
pip install -r requirements-dev.txt
pytest
```

## Features

* User Login
* User Registration
* View Parking Slots
* Book Parking Slot
* Responsive UI

## Technologies Used

* React (Vite)
* FastAPI (Python)
* SQLAlchemy ORM
* SQLite
* Pydantic

## Project Flow

```text
Home
 ↓
Login / Register
 ↓
Parking Slots
 ↓
Select Slot
 ↓
Book Slot
```

## Project Title

**Smart Parking & Slot Booking Platform**
