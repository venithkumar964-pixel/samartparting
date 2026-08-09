# Smart Parking & Slot Booking Platform

A web-based parking system that helps users find and book available parking slots, built with a React (Vite) frontend and a Flask (Python) API.

## Setup

### Backend (Flask)

```sh
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
pip install -r requirements.txt
python app.py              # runs on http://localhost:5000
```

### Frontend (React)

```sh
cd frontend
npm install
npm run dev
```

## Features

* User Login
* User Registration
* View Parking Slots
* Book Parking Slot
* Responsive UI

## Technologies Used

* React (Vite)
* Flask (Python)
* HTML
* CSS
* JavaScript

## Project Structure

```text
smart-parking/
│
├── backend/
│   ├── app.py             # Flask API
│   └── requirements.txt   # Python dependencies
│
├── frontend/
│   ├── index.html
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Home, Login, Register pages
│       ├── App.jsx
│       └── main.jsx
│
├── database/
│   └── schema.sql         # Database schema
│
└── README.md              # Project documentation
```

## How to Run

1. Clone the project.
2. Set up and start the Flask backend (see Setup).
3. Set up and start the React frontend (see Setup).
4. Open the frontend URL in a browser.

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
