"""Crea las 24 tablas y los datos iniciales en MySQL al arrancar el backend."""
import logging
import re
import threading
import time
from pathlib import Path

from sqlalchemy import text

from src.config.database import engine

RUTA_SQL = Path(__file__).resolve().parents[2] / "schema" / "init.sql"


def _sentencias():
    sql = RUTA_SQL.read_text(encoding="utf-8")
    sql = re.sub(r"--[^\n]*", "", sql)  # quita comentarios
    partes = [p.strip() for p in sql.split(";")]
    # La base de datos ya existe en OpenShift: se omiten CREATE DATABASE y USE
    return [p for p in partes if p and not p.upper().startswith(("CREATE DATABASE", "USE "))]


def _hace_falta_crear(conn):
    """True si faltan tablas. Si hay un esquema viejo, lo borra primero."""
    existe_moneda = conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.tables "
        "WHERE table_schema = DATABASE() AND table_name = 'moneda'"
    )).scalar()
    if not existe_moneda:
        return True
    completo = conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.columns "
        "WHERE table_schema = DATABASE() AND table_name = 'moneda' AND column_name = 'codigo_moneda'"
    )).scalar() and conn.execute(text(
        "SELECT COUNT(*) FROM information_schema.tables "
        "WHERE table_schema = DATABASE() AND table_name = 'nomina'"
    )).scalar()
    if completo:
        return False
    logging.warning("Esquema antiguo o incompleto: se recrean las tablas.")
    tablas = [r[0] for r in conn.execute(text(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = DATABASE()"
    )).fetchall()]
    conn.exec_driver_sql("SET FOREIGN_KEY_CHECKS = 0")
    for t in tablas:
        conn.exec_driver_sql(f"DROP TABLE IF EXISTS `{t}`")
    conn.exec_driver_sql("SET FOREIGN_KEY_CHECKS = 1")
    return True


def inicializar():
    with engine.begin() as conn:
        if not _hace_falta_crear(conn):
            logging.info("Base de datos ya inicializada.")
            return
        for sentencia in _sentencias():
            conn.exec_driver_sql(sentencia)
        logging.info("Base de datos creada con datos iniciales.")


def _esperar_mysql():
    for intento in range(1, 41):
        try:
            inicializar()
            return
        except Exception as e:  # MySQL aún arrancando
            logging.warning("MySQL no está listo (intento %s/40): %s", intento, e)
            time.sleep(3)
    logging.error("No se pudo inicializar la base de datos.")


def iniciar_en_segundo_plano():
    # En segundo plano para que /api/health responda mientras MySQL arranca
    threading.Thread(target=_esperar_mysql, daemon=True).start()
