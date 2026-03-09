from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional

from database import get_db
from models import Employee
from schemas import EmployeeCreate, EmployeeResponse

router = APIRouter(prefix="/api/employees", tags=["Employees"])


@router.get("", response_model=List[EmployeeResponse])
def list_employees(
    department: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Employee)

    if department:
        query = query.filter(Employee.department == department)

    if search:
        pattern = f"%{search}%"
        query = query.filter(
            (Employee.full_name.ilike(pattern))
            | (Employee.employee_id.ilike(pattern))
            | (Employee.email.ilike(pattern))
        )

    return query.order_by(Employee.created_at.desc()).all()


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    # Check for duplicate employee_id
    existing = db.query(Employee).filter(
        Employee.employee_id == employee.employee_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{employee.employee_id}' already exists",
        )

    # Check for duplicate email
    existing_email = db.query(Employee).filter(
        Employee.email == employee.email
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with email '{employee.email}' already exists",
        )

    db_employee = Employee(**employee.model_dump())
    try:
        db.add(db_employee)
        db.commit()
        db.refresh(db_employee)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Employee with this ID or email already exists",
        )

    return db_employee


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found",
        )
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee '{employee_id}' not found",
        )

    db.delete(employee)
    db.commit()
    return {"message": f"Employee '{employee_id}' deleted successfully"}


@router.get("/departments/list", response_model=List[str])
def list_departments(db: Session = Depends(get_db)):
    departments = db.query(Employee.department).distinct().all()
    return [d[0] for d in departments]
