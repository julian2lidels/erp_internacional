import json
import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.config.database import get_db
from .models import Modulo, Usuario, Auditoria
from .schemas import ModuloCreate, AsignarModulosRequest, UsuarioCreate, UsuarioUpdateEstado, LoginRequest

router = APIRouter(prefix="/api/seguridad", tags=["Seguridad y Auditoría"])

def registrar_auditoria(
    db: Session,
    id_usuario: int,
    tabla: str,
    accion: str,
    anterior: dict | None = None,
    nuevo: dict | None = None
):
    evento = Auditoria(
        id_usuario=id_usuario,
        tabla_afectada=tabla,
        accion=accion,
        valor_anterior=json.dumps(anterior, default=str) if anterior else None,
        valor_nuevo=json.dumps(nuevo, default=str) if nuevo else None
    )
    db.add(evento)
    db.commit()

@router.get("/modulos")
def listar_modulos(db: Session = Depends(get_db)):
    filas = db.execute(text("SELECT id_modulo, nombre FROM modulo ORDER BY id_modulo")).fetchall()
    return [{"id_modulo": r[0], "nombre": r[1]} for r in filas]

@router.post("/modulos")
def crear_modulo(data: ModuloCreate, db: Session = Depends(get_db)):
    nombre_limpio = data.nombre.strip().upper()
    existe = db.query(Modulo).filter(Modulo.nombre == nombre_limpio).first()
    if existe:
        raise HTTPException(status_code=400, detail="El módulo ya existe")
    nuevo = Modulo(nombre=nombre_limpio)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"id_modulo": nuevo.id_modulo, "nombre": nuevo.nombre}

@router.get("/roles/{id_rol}/modulos")
def obtener_modulos_por_rol(id_rol: int, db: Session = Depends(get_db)):
    filas = db.execute(
        text("""
            SELECT m.id_modulo, m.nombre
            FROM modulo m
            INNER JOIN rol_modulo rm ON m.id_modulo = rm.id_modulo
            WHERE rm.id_rol = :id_rol
        """),
        {"id_rol": id_rol}
    ).fetchall()
    return [{"id_modulo": r[0], "nombre": r[1]} for r in filas]

@router.post("/roles/asignar-modulos")
def asignar_modulos_rol(data: AsignarModulosRequest, db: Session = Depends(get_db)):
    try:
        db.execute(text("DELETE FROM rol_modulo WHERE id_rol = :id_rol"), {"id_rol": data.id_rol})
        for id_mod in data.modulos_ids:
            db.execute(
                text("INSERT INTO rol_modulo (id_rol, id_modulo) VALUES (:r, :m)"),
                {"r": data.id_rol, "m": id_mod}
            )
        db.commit()
        return {"message": "Permisos actualizados correctamente"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/usuarios")
def listar_usuarios(db: Session = Depends(get_db)):
    filas = db.execute(
        text("""
            SELECT u.id_usuario, u.nombre, u.email, u.id_rol, r.nombre AS rol,
                   u.id_sucursal, s.nombre AS sucursal, u.idioma, u.activo
            FROM usuario u
            INNER JOIN rol r ON u.id_rol = r.id_rol
            INNER JOIN sucursal s ON u.id_sucursal = s.id_sucursal
            ORDER BY u.id_usuario DESC
        """)
    ).fetchall()
    return [
        {
            "id_usuario": r[0],
            "nombre": r[1],
            "email": r[2],
            "id_rol": r[3],
            "rol": r[4],
            "id_sucursal": r[5],
            "sucursal": r[6],
            "idioma": r[7],
            "activo": bool(r[8]),
        }
        for r in filas
    ]

@router.post("/usuarios")
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    if db.query(Usuario).filter(Usuario.email == data.email).first():
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    
    hashed = bcrypt.hashpw(data.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    nuevo = Usuario(
        nombre=data.nombre,
        email=data.email,
        password_hash=hashed,
        id_rol=data.id_rol,
        id_sucursal=data.id_sucursal,
        idioma=data.idioma,
        activo=True
    )
    try:
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        registrar_auditoria(db, nuevo.id_usuario, "usuario", "INSERT", None, {"email": nuevo.email, "rol": nuevo.id_rol})
        return {"message": "Usuario creado exitosamente", "id_usuario": nuevo.id_usuario}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/usuarios/{id_usuario}/estado")
def cambiar_estado_usuario(id_usuario: int, data: UsuarioUpdateEstado, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id_usuario == id_usuario).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    estado_anterior = usuario.activo
    usuario.activo = data.activo
    db.commit()
    registrar_auditoria(
        db, id_usuario, "usuario", "UPDATE",
        {"activo": estado_anterior}, {"activo": data.activo}
    )
    return {"message": "Estado actualizado"}

@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == data.email).first()
    if not usuario or not bcrypt.checkpw(data.password.encode("utf-8"), usuario.password_hash.encode("utf-8")):
        if usuario:
            registrar_auditoria(db, usuario.id_usuario, "usuario", "ACCESO_DENEGADO", None, {"motivo": "Clave incorrecta"})
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    if not usuario.activo:
        registrar_auditoria(db, usuario.id_usuario, "usuario", "ACCESO_DENEGADO", None, {"motivo": "Usuario inactivo"})
        raise HTTPException(status_code=403, detail="Usuario desactivado")

    modulos = db.execute(
        text("""
            SELECT m.nombre FROM modulo m
            INNER JOIN rol_modulo rm ON m.id_modulo = rm.id_modulo
            WHERE rm.id_rol = :id_rol
        """),
        {"id_rol": usuario.id_rol}
    ).fetchall()

    return {
        "id_usuario": usuario.id_usuario,
        "nombre": usuario.nombre,
        "email": usuario.email,
        "id_rol": usuario.id_rol,
        "id_sucursal": usuario.id_sucursal,
        "idioma": usuario.idioma,
        "modulos_permitidos": [m[0] for m in modulos]
    }

@router.get("/auditoria")
def listar_auditoria(db: Session = Depends(get_db)):
    filas = db.execute(
        text("""
            SELECT a.id_auditoria, u.nombre AS usuario, a.tabla_afectada,
                   a.accion, a.valor_anterior, a.valor_nuevo, a.fecha_hora
            FROM auditoria a
            INNER JOIN usuario u ON a.id_usuario = u.id_usuario
            ORDER BY a.fecha_hora DESC
            LIMIT 100
        """)
    ).fetchall()
    return [
        {
            "id_auditoria": r[0],
            "usuario": r[1],
            "tabla_afectada": r[2],
            "accion": r[3],
            "valor_anterior": r[4],
            "valor_nuevo": r[5],
            "fecha_hora": str(r[6]),
        }
        for r in filas
    ]
