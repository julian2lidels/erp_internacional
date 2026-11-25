from sqlalchemy import Column, Integer, BigInteger, String, Boolean, ForeignKey, Enum, Text, DateTime
from sqlalchemy.sql import func
from src.config.database import Base

class Modulo(Base):
    __tablename__ = "modulo"
    id_modulo = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(50), nullable=False, unique=True)

class RolModulo(Base):
    __tablename__ = "rol_modulo"
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), primary_key=True)
    id_modulo = Column(Integer, ForeignKey("modulo.id_modulo"), primary_key=True)

class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(120), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    id_rol = Column(Integer, ForeignKey("rol.id_rol"), nullable=False)
    id_sucursal = Column(Integer, ForeignKey("sucursal.id_sucursal"), nullable=False)
    idioma = Column(String(2), nullable=False, default="es")
    activo = Column(Boolean, nullable=False, default=True)

class Auditoria(Base):
    __tablename__ = "auditoria"
    id_auditoria = Column(BigInteger, primary_key=True, autoincrement=True)
    id_usuario = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    tabla_afectada = Column(String(60), nullable=False)
    accion = Column(Enum("INSERT", "UPDATE", "DELETE", "ACCESO_DENEGADO"), nullable=False)
    valor_anterior = Column(Text, nullable=True)
    valor_nuevo = Column(Text, nullable=True)
    fecha_hora = Column(DateTime, nullable=False, server_default=func.now())
