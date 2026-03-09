from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
from routers import employees, attendance

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HRMS Lite API",
    description="Lightweight Human Resource Management System",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(employees.router)
app.include_router(attendance.router)


@app.get("/")
def root():
    return {"message": "HRMS Lite API is running", "version": "1.0.0"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
