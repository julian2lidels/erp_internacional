"""CRUD de todas las tablas del ERP + reglas de negocio.

Cada recurso se declara una sola vez en RECURSOS (tabla, llave primaria y columnas).
Los nombres de tabla y columna salen de este diccionario, nunca del cliente, así que
no hay riesgo de inyección SQL. Los valores siempre van como parámetros.

GET    /api/erp/{recurso}                   lista
POST   /api/erp/{recurso}                   crea
PUT    /api/erp/{recurso}?<llave>=valor     actualiza
DELETE /api/erp/{recurso}?<llave>=valor     elimina
Si la petición trae el encabezado X-Usuario-Id, cada cambio queda en `auditoria`.
"""
import json
from datetime import date, datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import text
from sqlalchemy.orm import Session

from src.config.database import get_db

router = APIRouter(prefix="/api/erp", tags=["ERP"])

RECURSOS = {
    # ---- Divisas ----
    "monedas": {"tabla": "moneda", "pk": ["codigo_moneda"], "auto": False,
                "cols": ["nombre", "simbolo"]},
    "tasas-cambio": {"tabla": "tasa_cambio", "pk": ["id_tasa"], "auto": True,
                     "cols": ["moneda_origen", "moneda_destino", "tasa", "fecha_vigencia", "fuente"]},
    # ---- Organización ----
    "paises": {"tabla": "pais", "pk": ["id_pais"], "auto": True,
               "cols": ["nombre", "codigo_iso", "codigo_moneda"]},
    "sucursales": {"tabla": "sucursal", "pk": ["id_sucursal"], "auto": True,
                   "cols": ["nombre", "id_pais", "direccion", "codigo_moneda_base"]},
    "impuestos": {"tabla": "impuesto", "pk": ["id_impuesto"], "auto": True,
                  "cols": ["id_pais", "nombre", "porcentaje"]},
    "roles": {"tabla": "rol", "pk": ["id_rol"], "auto": True,
              "cols": ["nombre", "descripcion"]},
    # ---- Ventas ----
    "clientes": {"tabla": "cliente", "pk": ["id_cliente"], "auto": True,
                 "cols": ["nombre", "id_pais", "email", "codigo_moneda"]},
    "pedidos-venta": {"tabla": "pedido_venta", "pk": ["id_pedido"], "auto": True,
                      "cols": ["id_cliente", "id_usuario", "id_sucursal", "fecha", "estado"],
                      "usuario_auto": ["id_usuario"]},
    "detalle-pedido-venta": {"tabla": "detalle_pedido_venta", "pk": ["id_detalle"], "auto": True,
                             "cols": ["id_pedido", "id_producto", "cantidad", "precio_unitario"]},
    "facturas": {"tabla": "factura", "pk": ["id_factura"], "auto": True,
                 "cols": ["id_pedido", "id_impuesto", "fecha", "subtotal", "valor_impuesto",
                          "total", "codigo_moneda", "tasa_aplicada"],
                 "calc": ["subtotal", "valor_impuesto", "total"], "sin_put": True},
    # ---- Compras ----
    "proveedores": {"tabla": "proveedor", "pk": ["id_proveedor"], "auto": True,
                    "cols": ["nombre", "id_pais", "identificacion_fiscal", "codigo_moneda",
                             "condiciones_pago", "activo"],
                    "bool": ["activo"]},
    "ordenes-compra": {"tabla": "orden_compra", "pk": ["id_orden_compra"], "auto": True,
                       "cols": ["id_proveedor", "id_sucursal", "id_usuario_solicitante",
                                "id_usuario_aprobador", "fecha", "estado",
                                "fecha_estimada_entrega", "codigo_moneda", "total"],
                       "calc": ["total"], "usuario_auto": ["id_usuario_solicitante"]},
    "detalle-orden-compra": {"tabla": "detalle_orden_compra", "pk": ["id_detalle"], "auto": True,
                             "cols": ["id_orden_compra", "id_producto", "cantidad", "precio_unitario"]},
    # ---- Inventario ----
    "productos": {"tabla": "producto", "pk": ["id_producto"], "auto": True,
                  "cols": ["sku", "nombre", "precio_base", "stock_minimo", "activo"],
                  "bool": ["activo"]},
    "bodegas": {"tabla": "bodega", "pk": ["id_bodega"], "auto": True,
                "cols": ["nombre", "id_sucursal"]},
    "stock": {"tabla": "stock", "pk": ["id_bodega", "id_producto"], "auto": False,
              "cols": ["cantidad"]},
    "movimientos-inventario": {"tabla": "movimiento_inventario", "pk": ["id_movimiento"], "auto": True,
                               "cols": ["id_producto", "id_bodega_origen", "id_bodega_destino", "tipo",
                                        "estado", "cantidad", "fecha", "id_usuario", "id_orden_compra"],
                               "calc": ["fecha"], "cols_update": ["estado"], "sin_delete": True,
                               "usuario_auto": ["id_usuario"]},
    # ---- Contabilidad ----
    "periodos-contables": {"tabla": "periodo_contable", "pk": ["id_periodo"], "auto": True,
                           "cols": ["id_sucursal", "anio", "mes", "estado"]},
    "asientos-contables": {"tabla": "asiento_contable", "pk": ["id_asiento"], "auto": True,
                           "cols": ["id_periodo", "fecha", "descripcion", "monto_original",
                                    "codigo_moneda", "tasa_aplicada", "monto_base"],
                           "calc": ["monto_base"]},
    # ---- Recursos humanos ----
    "empleados": {"tabla": "empleado", "pk": ["id_empleado"], "auto": True,
                  "cols": ["nombre", "documento", "cargo", "salario", "codigo_moneda",
                           "id_sucursal", "fecha_ingreso"]},
    "novedades": {"tabla": "novedad", "pk": ["id_novedad"], "auto": True,
                  "cols": ["id_empleado", "tipo", "fecha_inicio", "fecha_fin", "aprobada"],
                  "bool": ["aprobada"]},
    "nominas": {"tabla": "nomina", "pk": ["id_nomina"], "auto": True,
                "cols": ["id_empleado", "anio", "mes", "salario_base", "bonificaciones",
                         "deducciones", "neto_pagar"],
                "calc": ["neto_pagar"]},
}


MODULO_DE = {
    "monedas": "DIVISAS", "tasas-cambio": "DIVISAS",
    "paises": "ORGANIZACION", "sucursales": "ORGANIZACION", "impuestos": "ORGANIZACION",
    "roles": "SEGURIDAD",
    "clientes": "VENTAS", "pedidos-venta": "VENTAS", "detalle-pedido-venta": "VENTAS", "facturas": "VENTAS",
    "proveedores": "COMPRAS", "ordenes-compra": "COMPRAS", "detalle-orden-compra": "COMPRAS",
    "productos": "INVENTARIO", "bodegas": "INVENTARIO", "stock": "INVENTARIO",
    "movimientos-inventario": "INVENTARIO",
    "periodos-contables": "CONTABILIDAD", "asientos-contables": "CONTABILIDAD",
    "empleados": "RRHH", "novedades": "RRHH", "nominas": "RRHH",
}


# ---------------------------------------------------------------- utilidades
def _cfg(recurso: str) -> dict:
    cfg = RECURSOS.get(recurso)
    if not cfg:
        raise HTTPException(status_code=404, detail=f"Recurso '{recurso}' no existe")
    return cfg


def _num(v) -> float:
    try:
        return float(v) if v not in (None, "") else 0.0
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail=f"Valor numérico inválido: {v}")


def _limpiar(v):
    if isinstance(v, str):
        v = v.strip()
        return v if v != "" else None
    return v


def _serializar(cfg: dict, fila: dict) -> dict:
    salida = {}
    for k, v in fila.items():
        if isinstance(v, Decimal):
            v = float(v)
        elif isinstance(v, (date, datetime)):
            v = str(v)
        elif k in cfg.get("bool", []) and v is not None:
            v = bool(v)
        salida[k] = v
    return salida


def _mensaje(e: Exception) -> str:
    orig = str(getattr(e, "orig", e))
    bajo = orig.lower()
    if "foreign key" in bajo:
        return ("No se puede completar la operación: el registro está relacionado con "
                "otros datos, o la referencia indicada no existe.")
    if "duplicate entry" in bajo:
        return "Ya existe un registro con esos datos (valor repetido)."
    if "check constraint" in bajo:
        return "Algún valor no cumple las reglas (por ejemplo cantidad, monto o mes inválido)."
    if "cannot be null" in bajo or "doesn't have a default" in bajo:
        return "Faltan campos obligatorios."
    return orig


def _usuario(request: Request):
    v = request.headers.get("x-usuario-id")
    return int(v) if v and v.isdigit() else None


def _auditar(db: Session, request: Request, tabla: str, accion: str, antes, despues):
    uid = _usuario(request)
    if not uid:
        return
    # INSERT ... SELECT: si el usuario no existe simplemente no inserta nada
    db.execute(
        text("""INSERT INTO auditoria (id_usuario, tabla_afectada, accion, valor_anterior, valor_nuevo)
                SELECT id_usuario, :t, :a, :ant, :nue FROM usuario WHERE id_usuario = :u"""),
        {
            "u": uid, "t": tabla, "a": accion,
            "ant": json.dumps(antes, default=str) if antes else None,
            "nue": json.dumps(despues, default=str) if despues else None,
        },
    )


def _exigir_escritura(db: Session, request: Request, recurso: str, cfg: dict):
    """Solo escribe quien inició sesión, no es Auditor y tiene el módulo asignado."""
    uid = _usuario(request)
    if not uid:
        raise HTTPException(status_code=401, detail="Inicia sesión para modificar datos")
    fila = db.execute(
        text("""SELECT r.nombre, u.activo FROM usuario u
                INNER JOIN rol r ON r.id_rol = u.id_rol WHERE u.id_usuario = :u"""),
        {"u": uid},
    ).first()
    if not fila or not fila[1]:
        raise HTTPException(status_code=401, detail="Usuario no válido o desactivado")
    rol = fila[0]
    permitido = rol == "Administrador"
    if not permitido and rol != "Auditor":
        permitido = bool(db.execute(
            text("""SELECT COUNT(*) FROM rol_modulo rm
                    INNER JOIN modulo m ON m.id_modulo = rm.id_modulo
                    INNER JOIN usuario u ON u.id_rol = rm.id_rol
                    WHERE u.id_usuario = :u AND m.nombre = :m"""),
            {"u": uid, "m": MODULO_DE.get(recurso)},
        ).scalar())
    if not permitido:
        _auditar(db, request, cfg["tabla"], "ACCESO_DENEGADO", None, {"rol": rol, "recurso": recurso})
        db.commit()
        raise HTTPException(status_code=403, detail=f"Tu rol ({rol}) no puede modificar este módulo")


def _pk_query(request: Request, cfg: dict) -> dict:
    pk = {}
    for c in cfg["pk"]:
        v = request.query_params.get(c)
        if v is None:
            raise HTTPException(status_code=400, detail=f"Falta la llave '{c}' en la URL")
        pk[c] = v
    return pk


def _donde(cfg: dict) -> str:
    return " AND ".join(f"`{c}` = :pk_{c}" for c in cfg["pk"])


def _obtener(db: Session, cfg: dict, pk: dict) -> dict:
    fila = db.execute(
        text(f"SELECT * FROM `{cfg['tabla']}` WHERE {_donde(cfg)}"),
        {f"pk_{k}": v for k, v in pk.items()},
    ).mappings().first()
    if not fila:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return dict(fila)


# ------------------------------------------------------------ reglas de negocio
def _mover_stock(db: Session, bodega: int, producto: int, delta: int):
    if delta < 0:
        fila = db.execute(
            text("SELECT cantidad FROM stock WHERE id_bodega=:b AND id_producto=:p FOR UPDATE"),
            {"b": bodega, "p": producto},
        ).first()
        if not fila or fila[0] < -delta:
            raise HTTPException(status_code=400, detail="Stock insuficiente en la bodega de origen")
    db.execute(
        text("""INSERT INTO stock (id_bodega, id_producto, cantidad) VALUES (:b, :p, :c)
                ON DUPLICATE KEY UPDATE cantidad = cantidad + :c"""),
        {"b": bodega, "p": producto, "c": delta},
    )


def _recalcular_orden(db: Session, id_orden):
    if not id_orden:
        return
    db.execute(
        text("""UPDATE orden_compra SET total = (
                    SELECT COALESCE(SUM(cantidad * precio_unitario), 0)
                    FROM detalle_orden_compra WHERE id_orden_compra = :i)
                WHERE id_orden_compra = :i"""),
        {"i": id_orden},
    )


def _antes_insertar(recurso: str, db: Session, d: dict):
    if recurso == "nominas":
        d["bonificaciones"] = _num(d.get("bonificaciones"))
        d["deducciones"] = _num(d.get("deducciones"))
        d["neto_pagar"] = round(_num(d.get("salario_base")) + d["bonificaciones"] - d["deducciones"], 2)

    elif recurso == "asientos-contables":
        tasa = _num(d.get("tasa_aplicada")) or 1.0
        d["tasa_aplicada"] = tasa
        d["monto_base"] = round(_num(d.get("monto_original")) * tasa, 2)

    elif recurso == "facturas":
        pedido = db.execute(
            text("SELECT estado FROM pedido_venta WHERE id_pedido = :p"), {"p": d.get("id_pedido")}
        ).first()
        if not pedido:
            raise HTTPException(status_code=400, detail="El pedido indicado no existe")
        if pedido[0] != "CREADO":
            raise HTTPException(status_code=400, detail=f"El pedido está {pedido[0]} y no se puede facturar")
        subtotal = db.execute(
            text("SELECT COALESCE(SUM(cantidad * precio_unitario), 0) FROM detalle_pedido_venta WHERE id_pedido = :p"),
            {"p": d["id_pedido"]},
        ).scalar()
        if not subtotal or float(subtotal) <= 0:
            raise HTTPException(status_code=400, detail="El pedido no tiene productos en su detalle")
        pct = db.execute(
            text("SELECT porcentaje FROM impuesto WHERE id_impuesto = :i"), {"i": d.get("id_impuesto")}
        ).scalar()
        if pct is None:
            raise HTTPException(status_code=400, detail="El impuesto indicado no existe")
        d["subtotal"] = round(float(subtotal), 2)
        d["valor_impuesto"] = round(float(subtotal) * float(pct) / 100, 2)
        d["total"] = round(d["subtotal"] + d["valor_impuesto"], 2)
        d["tasa_aplicada"] = _num(d.get("tasa_aplicada")) or 1.0

    elif recurso == "movimientos-inventario":
        tipo, origen, destino = d.get("tipo"), d.get("id_bodega_origen"), d.get("id_bodega_destino")
        if tipo == "ENTRADA" and not destino:
            raise HTTPException(status_code=400, detail="Una ENTRADA necesita bodega de destino")
        if tipo == "SALIDA" and not origen:
            raise HTTPException(status_code=400, detail="Una SALIDA necesita bodega de origen")
        if tipo == "TRASLADO":
            if not origen or not destino:
                raise HTTPException(status_code=400, detail="Un TRASLADO necesita origen y destino")
            if str(origen) == str(destino):
                raise HTTPException(status_code=400, detail="El origen y el destino no pueden ser la misma bodega")
        if d.get("estado") == "EN_TRANSITO" and tipo != "TRASLADO":
            raise HTTPException(status_code=400, detail="Solo un TRASLADO puede estar EN_TRANSITO")
        d.pop("fecha", None)


def _despues_insertar(recurso: str, db: Session, d: dict):
    if recurso == "facturas":
        db.execute(text("UPDATE pedido_venta SET estado='FACTURADO' WHERE id_pedido=:p"), {"p": d["id_pedido"]})

    elif recurso == "detalle-orden-compra":
        _recalcular_orden(db, d.get("id_orden_compra"))

    elif recurso == "movimientos-inventario":
        cant, prod = int(d["cantidad"]), d["id_producto"]
        tipo, origen, destino = d["tipo"], d.get("id_bodega_origen"), d.get("id_bodega_destino")
        completado = d.get("estado", "COMPLETADO") == "COMPLETADO"
        if tipo == "ENTRADA":
            _mover_stock(db, destino, prod, cant)
            if d.get("id_orden_compra"):
                db.execute(
                    text("UPDATE orden_compra SET estado='RECIBIDA' WHERE id_orden_compra=:o"),
                    {"o": d["id_orden_compra"]},
                )
        elif tipo == "SALIDA":
            _mover_stock(db, origen, prod, -cant)
        elif tipo == "TRASLADO":
            _mover_stock(db, origen, prod, -cant)
            if completado:
                _mover_stock(db, destino, prod, cant)


def _antes_actualizar(recurso: str, db: Session, d: dict, anterior: dict):
    nuevo = {**anterior, **d}
    if recurso == "nominas":
        d["neto_pagar"] = round(
            _num(nuevo.get("salario_base")) + _num(nuevo.get("bonificaciones")) - _num(nuevo.get("deducciones")), 2
        )
    elif recurso == "asientos-contables":
        tasa = _num(nuevo.get("tasa_aplicada")) or 1.0
        d["tasa_aplicada"] = tasa
        d["monto_base"] = round(_num(nuevo.get("monto_original")) * tasa, 2)
    elif recurso == "movimientos-inventario":
        if anterior["estado"] == "COMPLETADO" and d.get("estado") == "EN_TRANSITO":
            raise HTTPException(status_code=400, detail="Un movimiento completado no se puede reabrir")


def _despues_actualizar(recurso: str, db: Session, anterior: dict, d: dict):
    if recurso == "detalle-orden-compra":
        _recalcular_orden(db, anterior["id_orden_compra"])
        if d.get("id_orden_compra"):
            _recalcular_orden(db, d["id_orden_compra"])
    elif recurso == "movimientos-inventario":
        if (anterior["estado"] == "EN_TRANSITO" and d.get("estado") == "COMPLETADO"
                and anterior["tipo"] == "TRASLADO"):
            _mover_stock(db, anterior["id_bodega_destino"], anterior["id_producto"], anterior["cantidad"])


def _despues_borrar(recurso: str, db: Session, anterior: dict):
    if recurso == "facturas":
        db.execute(text("UPDATE pedido_venta SET estado='CREADO' WHERE id_pedido=:p"), {"p": anterior["id_pedido"]})
    elif recurso == "detalle-orden-compra":
        _recalcular_orden(db, anterior["id_orden_compra"])


# ------------------------------------------------------------------- endpoints
@router.get("/{recurso}")
def listar(recurso: str, db: Session = Depends(get_db)):
    cfg = _cfg(recurso)
    cols = cfg["pk"] + cfg["cols"]
    seleccion = ", ".join(f"`{c}`" for c in cols)
    orden = ", ".join(f"`{c}` DESC" for c in cfg["pk"])
    filas = db.execute(
        text(f"SELECT {seleccion} FROM `{cfg['tabla']}` ORDER BY {orden} LIMIT 500")
    ).mappings().all()
    return [_serializar(cfg, dict(f)) for f in filas]


@router.post("/{recurso}")
async def crear(recurso: str, request: Request, db: Session = Depends(get_db)):
    cfg = _cfg(recurso)
    _exigir_escritura(db, request, recurso, cfg)
    body = await request.json()
    permitidas = ([] if cfg["auto"] else cfg["pk"]) + [c for c in cfg["cols"] if c not in cfg.get("calc", [])]
    datos = {k: _limpiar(v) for k, v in body.items() if k in permitidas}
    for col in cfg.get("usuario_auto", []):
        if not datos.get(col):
            datos[col] = _usuario(request)
            if not datos[col]:
                raise HTTPException(status_code=400, detail="Inicia sesión para registrar este dato")
    if not datos:
        raise HTTPException(status_code=400, detail="No se enviaron datos")
    try:
        _antes_insertar(recurso, db, datos)
        columnas = ", ".join(f"`{c}`" for c in datos)
        marcas = ", ".join(f":{c}" for c in datos)
        res = db.execute(text(f"INSERT INTO `{cfg['tabla']}` ({columnas}) VALUES ({marcas})"), datos)
        nuevo_id = res.lastrowid if cfg["auto"] else None
        _despues_insertar(recurso, db, datos)
        _auditar(db, request, cfg["tabla"], "INSERT", None, datos)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=_mensaje(e))
    return {"message": "Registro creado correctamente", "id": nuevo_id}


@router.put("/{recurso}")
async def actualizar(recurso: str, request: Request, db: Session = Depends(get_db)):
    cfg = _cfg(recurso)
    if cfg.get("sin_put"):
        raise HTTPException(status_code=405, detail="Este registro no se puede modificar")
    _exigir_escritura(db, request, recurso, cfg)
    pk = _pk_query(request, cfg)
    body = await request.json()
    editables = [c for c in cfg.get("cols_update", cfg["cols"]) if c not in cfg.get("calc", [])]
    datos = {k: _limpiar(v) for k, v in body.items() if k in editables}
    if not datos:
        raise HTTPException(status_code=400, detail="No hay cambios para guardar")
    try:
        anterior = _obtener(db, cfg, pk)
        _antes_actualizar(recurso, db, datos, anterior)
        asignaciones = ", ".join(f"`{c}` = :{c}" for c in datos)
        params = {**datos, **{f"pk_{k}": v for k, v in pk.items()}}
        db.execute(text(f"UPDATE `{cfg['tabla']}` SET {asignaciones} WHERE {_donde(cfg)}"), params)
        _despues_actualizar(recurso, db, anterior, datos)
        _auditar(db, request, cfg["tabla"], "UPDATE", anterior, datos)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=_mensaje(e))
    return {"message": "Registro actualizado correctamente"}


@router.delete("/{recurso}")
def borrar(recurso: str, request: Request, db: Session = Depends(get_db)):
    cfg = _cfg(recurso)
    if cfg.get("sin_delete"):
        raise HTTPException(status_code=405, detail="Este registro no se puede eliminar")
    _exigir_escritura(db, request, recurso, cfg)
    pk = _pk_query(request, cfg)
    try:
        anterior = _obtener(db, cfg, pk)
        db.execute(
            text(f"DELETE FROM `{cfg['tabla']}` WHERE {_donde(cfg)}"),
            {f"pk_{k}": v for k, v in pk.items()},
        )
        _despues_borrar(recurso, db, anterior)
        _auditar(db, request, cfg["tabla"], "DELETE", anterior, None)
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=_mensaje(e))
    return {"message": "Registro eliminado correctamente"}
