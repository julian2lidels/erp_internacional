import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DB_USER = os.getenv("MYSQL_USER", "erpuser")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD", "ErpPass2026")
DB_HOST = os.getenv("MYSQL_SERVICE_HOST", os.getenv("DB_HOST", "mysql"))
DB_PORT = os.getenv("MYSQL_SERVICE_PORT", os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("MYSQL_DATABASE", "erp_internacional")

DATABASE_URL = f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
