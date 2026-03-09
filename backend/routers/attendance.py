from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from typing import List, Optional
from datetime import date

from database import get_db
from models import Employee, Attendance
from schemas import (
    AttendanceCreate,
    AttendanceResponse,
    AttendanceWithEmployee,
    AttendanceSummary,
)

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def mark_attendance(record: AttendanceCreate, db: Session = Depends(get_db)):
    # Verify employee exists
    employee = db.query(Employee).filter(
        Employee.employee_id == record.employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{record.employee_id}' not found",
        )

    # Check for duplicate attendance on same date
    existing = db.query(Attendance).filter(
        Attendance.employee_id == record.employee_id,
        Attendance.date == record.date,
    ).first()
    if existing:
        # Update existing record instead of creating duplicate
        existing.status = record.status.value
        db.commit()
        db.refresh(existing)
        return existing

    db_record = Attendance(
        employee_id=record.employee_id,
        date=record.date,
        status=record.status.value,
    )
    try:
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance record already exists for this date",
        )

    return db_record


@router.get("/summary/all", response_model=List[AttendanceSummary])
def get_attendance_summary(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    summaries = []

    for emp in employees:
        present = db.query(func.count(Attendance.id)).filter(
            Attendance.employee_id == emp.employee_id,
            Attendance.status == "Present",
        ).scalar()

        absent = db.query(func.count(Attendance.id)).filter(
            Attendance.employee_id == emp.employee_id,
            Attendance.status == "Absent",
        ).scalar()

        summaries.append(
            AttendanceSummary(
                employee_id=emp.employee_id,
                full_name=emp.full_name,
                department=emp.department,
                total_present=present or 0,
                total_absent=absent or 0,
                total_days=(present or 0) + (absent or 0),
            )
        )

    return summaries


@router.get("", response_model=List[AttendanceWithEmployee])
def get_all_attendance(
    date_filter: Optional[date] = Query(None, alias="date"),
    db: Session = Depends(get_db),
):
    query = db.query(Attendance, Employee.full_name).join(
        Employee, Attendance.employee_id == Employee.employee_id
    )

    if date_filter:
        query = query.filter(Attendance.date == date_filter)

    results = query.order_by(Attendance.date.desc()).all()

    return [
        AttendanceWithEmployee(
            id=record.id,
            employee_id=record.employee_id,
            date=record.date,
            status=record.status,
            created_at=record.created_at,
            employee_name=name,
        )
        for record, name in results
    ]


@router.get("/{employee_id}", response_model=List[AttendanceResponse])
def get_attendance(
    employee_id: str,
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db),
):
    # Verify employee exists
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found",
        )

    query = db.query(Attendance).filter(Attendance.employee_id == employee_id)

    if start_date:
        query = query.filter(Attendance.date >= start_date)
    if end_date:
        query = query.filter(Attendance.date <= end_date)

    return query.order_by(Attendance.date.desc()).all()
