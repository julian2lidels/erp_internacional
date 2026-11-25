from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import engine, get_db

app = FastAPI(title="ERP Internacional API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def inicializar_esquema():
    sentencias = [
        """CREATE TABLE IF NOT EXISTS moneda (
            id_moneda INT AUTO_INCREMENT PRIMARY KEY,
            codigo_iso VARCHAR(3) NOT NULL UNIQUE,
            nombre VARCHAR(60) NOT NULL,
            simbolo VARCHAR(10) NOT NULL,
            activa TINYINT(1) NOT NULL DEFAULT 1
        )""",
        """CREATE TABLE IF NOT EXISTS tasa_cambio (
            id_tasa INT AUTO_INCREMENT PRIMARY KEY,
            id_moneda_origen INT NOT NULL,
            id_moneda_destino INT NOT NULL,
            tasa DECIMAL(18, 6) NOT NULL,
            fecha_vigencia DATE NOT NULL,
            FOREIGN KEY (id_moneda_origen) REFERENCES moneda(id_moneda),
            FOREIGN KEY (id_moneda_destino) REFERENCES moneda(id_moneda)
        )""",
        """CREATE TABLE IF NOT EXISTS sucursal (
            id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
            codigo VARCHAR(20) NOT NULL UNIQUE,
            nombre VARCHAR(100) NOT NULL,
            pais VARCHAR(60) NOT NULL,
            ciudad VARCHAR(60) NOT NULL,
            id_moneda_base INT NOT NULL,
            activa TINYINT(1) NOT NULL DEFAULT 1,
            FOREIGN KEY (id_moneda_base) REFERENCES moneda(id_moneda)
        )""",
        """CREATE TABLE IF NOT EXISTS impuesto (
            id_impuesto INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(60) NOT NULL,
            porcentaje DECIMAL(6, 2) NOT NULL,
            pais VARCHAR(60) NOT NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1
        )""",
        """CREATE TABLE IF NOT EXISTS rol (
            id_rol INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(50) NOT NULL UNIQUE,
            descripcion VARCHAR(255)
        )""",
        """CREATE TABLE IF NOT EXISTS usuario (
            id_usuario INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            email VARCHAR(120) NOT NULL UNIQUE,
            password_hash VARCHAR(255) NOT NULL,
            id_rol INT NOT NULL,
            id_sucursal INT NULL,
            activo TINYINT(1) NOT NULL DEFAULT 1,
            FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
            FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
        )""",
        """CREATE TABLE IF NOT EXISTS auditoria (
            id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
            usuario_actor VARCHAR(100) NOT NULL,
            accion VARCHAR(120) NOT NULL,
            modulo VARCHAR(60) NOT NULL,
            fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )""",
        """INSERT IGNORE INTO rol (id_rol, nombre, descripcion) VALUES
        (1, 'Administrador', 'Acceso total: gestión de roles, usuarios, sucursales, impuestos y tasas'),
        (2, 'Operador', 'Operación diaria: consulta y registro de tasas de cambio y movimientos'),
        (3, 'Auditor', 'Solo lectura: supervisión de tasas, monedas, impuestos y auditoría')""",
        """INSERT IGNORE INTO moneda (id_moneda, codigo_iso, nombre, simbolo, activa) VALUES
        (1, 'COP', 'Peso Colombiano', '$', 1),
        (2, 'USD', 'Dólar Estadounidense', 'US$', 1),
        (3, 'EUR', 'Euro', '€', 1)""",
        """INSERT IGNORE INTO sucursal (id_sucursal, codigo, nombre, pais, ciudad, id_moneda_base, activa) VALUES
        (1, 'BOG-01', 'Sede Principal Bogotá', 'Colombia', 'Bogotá', 1, 1),
        (2, 'MIA-01', 'Sucursal Internacional Miami', 'Estados Unidos', 'Miami', 2, 1),
        (3, 'MAD-01', 'Centro Operativo Madrid', 'España', 'Madrid', 3, 1)""",
        """INSERT IGNORE INTO impuesto (id_impuesto, nombre, porcentaje, pais, activo) VALUES
        (1, 'IVA General Colombia', 19.00, 'Colombia', 1),
        (2, 'Sales Tax Florida', 7.00, 'Estados Unidos', 1),
        (3, 'IVA General España', 21.00, 'España', 1)""",
        """INSERT IGNORE INTO usuario (id_usuario, nombre, email, password_hash, id_rol, id_sucursal, activo) VALUES
        (1, 'Julian Medina', 'admin@erp.com', 'admin123', 1, 1, 1),
        (2, 'Carlos Operador', 'operador@erp.com', 'oper123', 2, 1, 1),
        (3, 'Laura Auditora', 'auditor@erp.com', 'audit123', 3, 2, 1)""",
        """INSERT IGNORE INTO auditoria (id_auditoria, usuario_actor, accion, modulo) VALUES
        (1, 'Julian Medina', 'Inicialización del núcleo ERP Internacional', 'Seguridad y Accesos'),
        (2, 'Carlos Operador', 'Actualización de tasa USD -> COP', 'Divisas y Finanzas')"""
    ]
    try:
        with engine.begin() as conn:
            for sql in sentencias:
                conn.execute(text(sql))
    except Exception as e:
        print(f"[WARN] Auto-init DB pendiente: {e}")


@app.on_event("startup")
def on_startup():
    inicializar_esquema()


def registrar_auditoria(db: Session, accion: str, modulo: str, actor: str = "Julian Medina"):
    try:
        db.execute(
            text("INSERT INTO auditoria (usuario_actor, accion, modulo) VALUES (:u, :a, :m)"),
            {"u": actor, "a": accion, "m": modulo},
        )
    except Exception:
        pass


class MonedaIn(BaseModel):
    codigo_iso: str
    nombre: str
    simbolo: str
    activa: int = 1


class TasaCambioIn(BaseModel):
    id_moneda_origen: int
    id_moneda_destino: int
    tasa: float
    fecha_vigencia: str


class SucursalIn(BaseModel):
    codigo: str
    nombre: str
    pais: str
    ciudad: str
    id_moneda_base: int
    activa: int = 1


class ImpuestoIn(BaseModel):
    nombre: str
    porcentaje: float
    pais: str
    activo: int = 1


class RolIn(BaseModel):
    nombre: str
    descripcion: str = ""


class UsuarioIn(BaseModel):
    nombre: str
    email: str
    password_hash: str
    id_rol: int
    id_sucursal: int | None = None
    activo: int = 1


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/core/monedas")
def listar_monedas(db: Session = Depends(get_db)):
    filas = db.execute(text("SELECT id_moneda, codigo_iso, nombre, simbolo, activa FROM moneda ORDER BY id_moneda")).fetchall()
    return [dict(r._mapping) for r in filas]


@app.post("/api/core/monedas")
def crear_moneda(item: MonedaIn, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO moneda (codigo_iso, nombre, simbolo, activa) VALUES (:c, :n, :s, :a)"),
        {"c": item.codigo_iso.upper(), "n": item.nombre, "s": item.simbolo, "a": item.activa},
    )
    registrar_auditoria(db, f"Creación de moneda {item.codigo_iso.upper()}", "Divisas y Finanzas")
    db.commit()
    return {"mensaje": "Moneda creada"}


@app.get("/api/core/tasas")
def listar_tasas(db: Session = Depends(get_db)):
    sql = """
    SELECT t.id_tasa, t.id_moneda_origen, mo.codigo_iso AS origen_iso,
           t.id_moneda_destino, md.codigo_iso AS destino_iso,
           t.tasa, DATE_FORMAT(t.fecha_vigencia, '%Y-%m-%d') AS fecha_vigencia
    FROM tasa_cambio t
    JOIN moneda mo ON t.id_moneda_origen = mo.id_moneda
    JOIN moneda md ON t.id_moneda_destino = md.id_moneda
    ORDER BY t.id_tasa DESC
    """
    filas = db.execute(text(sql)).fetchall()
    return [dict(r._mapping) for r in filas]


@app.post("/api/core/tasas")
def crear_tasa(item: TasaCambioIn, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO tasa_cambio (id_moneda_origen, id_moneda_destino, tasa, fecha_vigencia) VALUES (:o, :d, :t, :f)"),
        {"o": item.id_moneda_origen, "d": item.id_moneda_destino, "t": item.tasa, "f": item.fecha_vigencia},
    )
    registrar_auditoria(db, f"Registro de tasa de cambio ({item.tasa})", "Divisas y Finanzas")
    db.commit()
    return {"mensaje": "Tasa registrada"}


@app.get("/api/core/sucursales")
def listar_sucursales(db: Session = Depends(get_db)):
    sql = """
    SELECT s.id_sucursal, s.codigo, s.nombre, s.pais, s.ciudad, s.id_moneda_base, m.codigo_iso AS moneda_base, s.activa
    FROM sucursal s
    JOIN moneda m ON s.id_moneda_base = m.id_moneda
    ORDER BY s.id_sucursal
    """
    filas = db.execute(text(sql)).fetchall()
    return [dict(r._mapping) for r in filas]


@app.post("/api/core/sucursales")
def crear_sucursal(item: SucursalIn, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO sucursal (codigo, nombre, pais, ciudad, id_moneda_base, activa) VALUES (:c, :n, :p, :ci, :m, :a)"),
        {"c": item.codigo, "n": item.nombre, "p": item.pais, "ci": item.ciudad, "m": item.id_moneda_base, "a": item.activa},
    )
    registrar_auditoria(db, f"Nueva sucursal {item.codigo} ({item.pais})", "Organización Global")
    db.commit()
    return {"mensaje": "Sucursal creada"}


@app.get("/api/core/impuestos")
def listar_impuestos(db: Session = Depends(get_db)):
    filas = db.execute(text("SELECT id_impuesto, nombre, porcentaje, pais, activo FROM impuesto ORDER BY id_impuesto")).fetchall()
    return [dict(r._mapping) for r in filas]


@app.post("/api/core/impuestos")
def crear_impuesto(item: ImpuestoIn, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO impuesto (nombre, porcentaje, pais, activo) VALUES (:n, :p, :pa, :a)"),
        {"n": item.nombre, "p": item.porcentaje, "pa": item.pais, "a": item.activo},
    )
    registrar_auditoria(db, f"Nueva regla fiscal {item.nombre} ({item.porcentaje}%)", "Organización Global")
    db.commit()
    return {"mensaje": "Impuesto creado"}


@app.get("/api/core/roles")
def listar_roles(db: Session = Depends(get_db)):
    filas = db.execute(text("SELECT id_rol, nombre, descripcion FROM rol ORDER BY id_rol")).fetchall()
    return [dict(r._mapping) for r in filas]


@app.post("/api/core/roles")
def crear_rol(item: RolIn, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO rol (nombre, descripcion) VALUES (:n, :d)"),
        {"n": item.nombre, "d": item.descripcion},
    )
    registrar_auditoria(db, f"Creación de rol {item.nombre}", "Seguridad y Accesos")
    db.commit()
    return {"mensaje": "Rol creado"}


@app.get("/api/core/usuarios")
def listar_usuarios(db: Session = Depends(get_db)):
    sql = """
    SELECT u.id_usuario, u.nombre, u.email, u.id_rol, r.nombre AS rol_nombre, u.id_sucursal, s.nombre AS sucursal_nombre, u.activo
    FROM usuario u
    JOIN rol r ON u.id_rol = r.id_rol
    LEFT JOIN sucursal s ON u.id_sucursal = s.id_sucursal
    ORDER BY u.id_usuario
    """
    filas = db.execute(text(sql)).fetchall()
    return [dict(r._mapping) for r in filas]


@app.post("/api/core/usuarios")
def crear_usuario(item: UsuarioIn, db: Session = Depends(get_db)):
    db.execute(
        text("INSERT INTO usuario (nombre, email, password_hash, id_rol, id_sucursal, activo) VALUES (:n, :e, :p, :r, :s, :a)"),
        {"n": item.nombre, "e": item.email, "p": item.password_hash, "r": item.id_rol, "s": item.id_sucursal, "a": item.activo},
    )
    registrar_auditoria(db, f"Registro de usuario {item.nombre}", "Seguridad y Accesos")
    db.commit()
    return {"mensaje": "Usuario creado"}


@app.get("/api/core/auditoria")
def listar_auditoria(db: Session = Depends(get_db)):
    filas = db.execute(
        text("SELECT id_auditoria, usuario_actor, accion, modulo, DATE_FORMAT(fecha_evento, '%Y-%m-%d %H:%i') AS fecha_evento FROM auditoria ORDER BY id_auditoria DESC LIMIT 30")
    ).fetchall()
    return [dict(r._mapping) for r in filas]
