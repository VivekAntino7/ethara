# HRMS Lite

A lightweight, full-stack Human Resource Management System for managing employee records and tracking daily attendance.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (dark theme) |
| Backend | Python FastAPI |
| Database | SQLite via SQLAlchemy |
| HTTP Client | Axios |

## Project Structure

```
ethara/
├── backend/
│   ├── main.py            # FastAPI app entry point
│   ├── database.py        # SQLAlchemy config
│   ├── models.py          # ORM models
│   ├── schemas.py         # Pydantic validation schemas
│   └── routers/
│       ├── employees.py   # Employee CRUD APIs
│       └── attendance.py  # Attendance APIs
└── frontend/
    ├── src/
    │   ├── api/           # Axios API client
    │   ├── components/    # Sidebar, Modal, PageHeader, etc.
    │   ├── pages/         # Dashboard, Employees, Attendance
    │   ├── App.jsx        # Root component with routing
    │   └── index.css      # Design system
    └── index.html
```

## Features

- **Employee Management**: Add, view, search, and delete employees
- **Attendance Tracking**: Mark Present/Absent, view records with date filtering
- **Dashboard**: Summary cards (total employees, present/absent today) + attendance summary table
- **Validation**: Required fields, email format, duplicate employee ID/email handling
- **UI States**: Loading spinners, empty states, error banners, toast notifications

### Unified Start (Recommended)
You can start both the backend and frontend with a single command:
```bash
chmod +x start.sh
./start.sh
```

### Manual Start

#### Backend
```bash
cd backend
pip3 install -r requirements.txt
pip3 install email-validator
python3 -m uvicorn main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/employees` | List all employees (supports `?search=` and `?department=`) |
| POST | `/api/employees` | Create a new employee |
| GET | `/api/employees/{id}` | Get single employee |
| DELETE | `/api/employees/{id}` | Delete employee + cascade attendance |
| POST | `/api/attendance` | Mark attendance (upserts for same date) |
| GET | `/api/attendance/{employee_id}` | Get attendance records (supports `?start_date=` and `?end_date=`) |
| GET | `/api/attendance` | Get all attendance (supports `?date=`) |
| GET | `/api/attendance/summary/all` | Attendance summary per employee |

## Assumptions & Limitations

- Single admin user — no authentication required
- SQLite used for simplicity (file-based, zero-config)
- Leave management, payroll, and advanced HR features are out of scope
- Deployment is not included in this version
