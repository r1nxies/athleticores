# AthletiCore Dashboard

This project scaffolds a simple Django-powered API and a React dashboard inspired by the provided UI mockups. The backend exposes a single endpoint that returns the overview metrics, performance trends, and athlete status data used to render the dashboard. The frontend consumes that API and renders the dashboard with a dark, performance-oriented theme.

## Backend (Django)

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run migrations (creates the SQLite database):
   ```bash
   python manage.py migrate
   ```
5. Start the server:
   ```bash
   python manage.py runserver 8000
   ```
6. The dashboard data will be available at `http://localhost:8000/api/dashboard/`.

## Authentication

- Create a staff user with `python manage.py createsuperuser` before trying to log in.
- The React dashboard now renders a login screen that POSTs credentials to `/api/auth/login/` (and `/api/auth/logout/` when you sign out). You must sign in to let the frontend fetch the dashboard payload and keep the session via cookies.
- The login screen also exposes a “Create portal access” form that posts to `/api/auth/register/` so you can provision new staff accounts without touching the backend shell.

> The API sets `Access-Control-Allow-Origin` to `*`, so the React app can fetch data during local development.

## Frontend (React + Vite)

1. Open a new terminal and change into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev -- --host
   ```
4. Navigate to the provided URL (typically `http://localhost:5173`) to view the dashboard. The React app automatically fetches live data from the Django API.

## Tips

- If the frontend cannot reach the backend, make sure `python manage.py runserver 8000` is still running and that the API URL at the top of `frontend/src/App.jsx` points to the correct host.
- The project ships with static data. For future work, replace `dashboard/data.py` with database-backed models or serializers as needed.
