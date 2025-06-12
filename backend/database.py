from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL
import os
DATABASE_DIR = os.getenv("DATABASE_DIR", "./data")
os.makedirs(DATABASE_DIR, exist_ok=True)
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DATABASE_DIR}/financial_dashboard.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

def create_tables():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 