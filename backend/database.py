from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

import os

# Use environment variables for production (Vercel Postgres)
# Vercel provides POSTGRES_URL, while some platforms use DATABASE_URL
database_url = os.environ.get("POSTGRES_URL") or os.environ.get("DATABASE_URL")

if database_url:
    # Handle Vercel's 'postgres://' vs SQLAlchemy's 'postgresql://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    # If using Vercel Postgres with pooling, SQLAlchemy might need the non-pooling URL
    # or handle the ?sslmode=require parameter correctly.
    if "vercel-storage.com" in database_url and "sslmode=" not in database_url:
        separator = "&" if "?" in database_url else "?"
        database_url += f"{separator}sslmode=require"
        
    SQLALCHEMY_DATABASE_URL = database_url
    engine_args = {}
else:
    if os.environ.get("VERCEL"):
        SQLALCHEMY_DATABASE_URL = "sqlite:////tmp/hrms_lite.db"
    else:
        SQLALCHEMY_DATABASE_URL = "sqlite:///./hrms_lite.db"
    engine_args = {"connect_args": {"check_same_thread": False}}

engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_args)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
