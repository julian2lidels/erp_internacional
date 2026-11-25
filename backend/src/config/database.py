import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:  # en OpenShift no hay .env; en local sí
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:
    pass

# En OpenShift el Deployment define DB_HOST, DB_PORT, DB_USER, DB_PASS y DB_NAME.
DB_USER = os.getenv("DB_USER", os.getenv("MYSQL_USER", "erpuser"))
DB_PASS = os.getenv("DB_PASS", os.getenv("MYSQL_PASSWORD", "ErpPass2026"))
DB_HOST = os.getenv("DB_HOST", "mysql")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", os.getenv("MYSQL_DATABASE", "erp_internacional"))

SQLALCHEMY_DATABASE_URL = (
    f"mysql+mysqlconnector://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=300)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
