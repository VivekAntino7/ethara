from pydantic import BaseModel, EmailStr, field_validator
from datetime import date, datetime
from typing import Optional
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"


# ── Employee Schemas ──────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str

    @field_validator("employee_id")
    @classmethod
    def employee_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Employee ID cannot be empty")
        return v.strip()

    @field_validator("full_name")
    @classmethod
    def full_name_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Full name cannot be empty")
        return v.strip()

    @field_validator("department")
    @classmethod
    def department_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Department cannot be empty")
        return v.strip()


class EmployeeResponse(BaseModel):
    id: int
    employee_id: str
    full_name: str
    email: str
    department: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Attendance Schemas ────────────────────────────────────────────

class AttendanceCreate(BaseModel):
    employee_id: str
    date: date
    status: AttendanceStatus

    @field_validator("employee_id")
    @classmethod
    def employee_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Employee ID cannot be empty")
        return v.strip()


class AttendanceResponse(BaseModel):
    id: int
    employee_id: str
    date: date
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AttendanceWithEmployee(AttendanceResponse):
    employee_name: Optional[str] = None


class AttendanceSummary(BaseModel):
    employee_id: str
    full_name: str
    department: str
    total_present: int
    total_absent: int
    total_days: int
