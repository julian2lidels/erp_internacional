CREATE DATABASE erp_internacional CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE erp_internacional;

CREATE TABLE moneda (
    codigo_moneda CHAR(3)     PRIMARY KEY,           -- COP, USD, EUR
    nombre        VARCHAR(50) NOT NULL,
    simbolo       VARCHAR(5)  NOT NULL
) ENGINE=InnoDB;

CREATE TABLE pais (
    id_pais       INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(80) NOT NULL,
    codigo_iso    CHAR(2)     NOT NULL UNIQUE,
    codigo_moneda CHAR(3)     NOT NULL,
    FOREIGN KEY (codigo_moneda) REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;

CREATE TABLE tasa_cambio (
    id_tasa        INT AUTO_INCREMENT PRIMARY KEY,
    moneda_origen  CHAR(3)        NOT NULL,
    moneda_destino CHAR(3)        NOT NULL,
    tasa           DECIMAL(18,6)  NOT NULL CHECK (tasa > 0),
    fecha_vigencia DATE           NOT NULL,
    fuente         VARCHAR(100),
    FOREIGN KEY (moneda_origen)  REFERENCES moneda(codigo_moneda),
    FOREIGN KEY (moneda_destino) REFERENCES moneda(codigo_moneda),
    UNIQUE (moneda_origen, moneda_destino, fecha_vigencia)
) ENGINE=InnoDB;

CREATE TABLE sucursal (
    id_sucursal        INT AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(100) NOT NULL,
    id_pais            INT          NOT NULL,
    direccion          VARCHAR(200),
    codigo_moneda_base CHAR(3)      NOT NULL,
    FOREIGN KEY (id_pais) REFERENCES pais(id_pais),
    FOREIGN KEY (codigo_moneda_base) REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;

CREATE TABLE impuesto (                               -- ERP-VEN-004
    id_impuesto INT AUTO_INCREMENT PRIMARY KEY,
    id_pais     INT          NOT NULL,
    nombre      VARCHAR(50)  NOT NULL,                -- IVA, VAT...
    porcentaje  DECIMAL(5,2) NOT NULL CHECK (porcentaje >= 0),
    FOREIGN KEY (id_pais) REFERENCES pais(id_pais)
) ENGINE=InnoDB;

CREATE TABLE rol (
    id_rol      INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE modulo (
    id_modulo INT AUTO_INCREMENT PRIMARY KEY,
    nombre    VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE rol_modulo (                             
    id_rol    INT NOT NULL,
    id_modulo INT NOT NULL,
    PRIMARY KEY (id_rol, id_modulo),
    FOREIGN KEY (id_rol)    REFERENCES rol(id_rol),
    FOREIGN KEY (id_modulo) REFERENCES modulo(id_modulo)
) ENGINE=InnoDB;

CREATE TABLE usuario (
    id_usuario    INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol        INT NOT NULL,
    id_sucursal   INT NOT NULL,
    idioma        CHAR(2) NOT NULL DEFAULT 'es',
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_rol)      REFERENCES rol(id_rol),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE auditoria (
    id_auditoria   BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_usuario     INT          NOT NULL,
    tabla_afectada VARCHAR(60)  NOT NULL,
    accion         ENUM('INSERT','UPDATE','DELETE','ACCESO_DENEGADO') NOT NULL,
    valor_anterior TEXT,
    valor_nuevo    TEXT,
    fecha_hora     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
) ENGINE=InnoDB;

CREATE TABLE periodo_contable (
    id_periodo  INT AUTO_INCREMENT PRIMARY KEY,
    id_sucursal INT      NOT NULL,
    anio        SMALLINT NOT NULL,
    mes         TINYINT  NOT NULL CHECK (mes BETWEEN 1 AND 12),
    estado      ENUM('ABIERTO','CERRADO') NOT NULL DEFAULT 'ABIERTO',
    UNIQUE (id_sucursal, anio, mes),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE asiento_contable (
    id_asiento     INT AUTO_INCREMENT PRIMARY KEY,
    id_periodo     INT NOT NULL,
    fecha          DATE NOT NULL,
    descripcion    VARCHAR(200),
    monto_original DECIMAL(18,2) NOT NULL,
    codigo_moneda  CHAR(3)       NOT NULL,
    tasa_aplicada  DECIMAL(18,6) NOT NULL DEFAULT 1,
    monto_base     DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (id_periodo)    REFERENCES periodo_contable(id_periodo),
    FOREIGN KEY (codigo_moneda) REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;

CREATE TABLE cliente (
    id_cliente    INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL,
    id_pais       INT NOT NULL,
    email         VARCHAR(120),
    codigo_moneda CHAR(3) NOT NULL,
    FOREIGN KEY (id_pais)       REFERENCES pais(id_pais),
    FOREIGN KEY (codigo_moneda) REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;

CREATE TABLE proveedor (                              -- ERP-COM-003
    id_proveedor     INT AUTO_INCREMENT PRIMARY KEY,
    nombre           VARCHAR(120) NOT NULL,
    id_pais          INT NOT NULL,
    identificacion_fiscal VARCHAR(30) NOT NULL UNIQUE,
    codigo_moneda    CHAR(3) NOT NULL,
    condiciones_pago VARCHAR(100),
    activo           BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_pais)       REFERENCES pais(id_pais),
    FOREIGN KEY (codigo_moneda) REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;
CREATE TABLE producto (
    id_producto  INT AUTO_INCREMENT PRIMARY KEY,
    sku          VARCHAR(30)  NOT NULL UNIQUE,
    nombre       VARCHAR(120) NOT NULL,
    precio_base  DECIMAL(18,2) NOT NULL CHECK (precio_base >= 0),
    stock_minimo INT NOT NULL DEFAULT 0,
    activo       BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE bodega (
    id_bodega   INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    id_sucursal INT NOT NULL,
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE stock (
    id_bodega   INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad    INT NOT NULL DEFAULT 0 CHECK (cantidad >= 0),
    PRIMARY KEY (id_bodega, id_producto),
    FOREIGN KEY (id_bodega)   REFERENCES bodega(id_bodega),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
) ENGINE=InnoDB;
CREATE TABLE orden_compra (
    id_orden_compra        INT AUTO_INCREMENT PRIMARY KEY,
    id_proveedor           INT NOT NULL,
    id_sucursal            INT NOT NULL,
    id_usuario_solicitante INT NOT NULL,
    id_usuario_aprobador   INT NULL,
    fecha                  DATE NOT NULL,
    estado                 ENUM('PENDIENTE_APROBACION','APROBADA','EN_TRANSITO','RECIBIDA','CANCELADA')
                           NOT NULL DEFAULT 'PENDIENTE_APROBACION',
    fecha_estimada_entrega DATE,
    codigo_moneda          CHAR(3) NOT NULL,
    total                  DECIMAL(18,2) NOT NULL DEFAULT 0,
    FOREIGN KEY (id_proveedor)           REFERENCES proveedor(id_proveedor),
    FOREIGN KEY (id_sucursal)            REFERENCES sucursal(id_sucursal),
    FOREIGN KEY (id_usuario_solicitante) REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_usuario_aprobador)   REFERENCES usuario(id_usuario),
    FOREIGN KEY (codigo_moneda)          REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;

CREATE TABLE detalle_orden_compra (
    id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
    id_orden_compra INT NOT NULL,
    id_producto     INT NOT NULL,
    cantidad        INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(18,2) NOT NULL CHECK (precio_unitario >= 0),
    FOREIGN KEY (id_orden_compra) REFERENCES orden_compra(id_orden_compra),
    FOREIGN KEY (id_producto)     REFERENCES producto(id_producto)
) ENGINE=InnoDB;

CREATE TABLE movimiento_inventario (
    id_movimiento     INT AUTO_INCREMENT PRIMARY KEY,
    id_producto       INT NOT NULL,
    id_bodega_origen  INT NULL,
    id_bodega_destino INT NULL,
    tipo              ENUM('ENTRADA','SALIDA','TRASLADO') NOT NULL,
    estado            ENUM('COMPLETADO','EN_TRANSITO') NOT NULL DEFAULT 'COMPLETADO',
    cantidad          INT NOT NULL CHECK (cantidad > 0),
    fecha             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_usuario        INT NOT NULL,
    id_orden_compra   INT NULL,
    FOREIGN KEY (id_producto)       REFERENCES producto(id_producto),
    FOREIGN KEY (id_bodega_origen)  REFERENCES bodega(id_bodega),
    FOREIGN KEY (id_bodega_destino) REFERENCES bodega(id_bodega),
    FOREIGN KEY (id_usuario)        REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_orden_compra)   REFERENCES orden_compra(id_orden_compra)
) ENGINE=InnoDB;
CREATE TABLE pedido_venta (
    id_pedido   INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente  INT NOT NULL,
    id_usuario  INT NOT NULL,                   
    id_sucursal INT NOT NULL,
    fecha       DATE NOT NULL,
    estado      ENUM('CREADO','FACTURADO','CANCELADO') NOT NULL DEFAULT 'CREADO',
    FOREIGN KEY (id_cliente)  REFERENCES cliente(id_cliente),
    FOREIGN KEY (id_usuario)  REFERENCES usuario(id_usuario),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE detalle_pedido_venta (
    id_detalle      INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido       INT NOT NULL,
    id_producto     INT NOT NULL,
    cantidad        INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(18,2) NOT NULL CHECK (precio_unitario >= 0),
    FOREIGN KEY (id_pedido)   REFERENCES pedido_venta(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
) ENGINE=InnoDB;

CREATE TABLE factura (
    id_factura     INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido      INT NOT NULL UNIQUE,
    id_impuesto    INT NOT NULL,
    fecha          DATE NOT NULL,
    subtotal       DECIMAL(18,2) NOT NULL,
    valor_impuesto DECIMAL(18,2) NOT NULL,
    total          DECIMAL(18,2) NOT NULL,
    codigo_moneda  CHAR(3)       NOT NULL,
    tasa_aplicada  DECIMAL(18,6) NOT NULL DEFAULT 1,
    FOREIGN KEY (id_pedido)     REFERENCES pedido_venta(id_pedido),
    FOREIGN KEY (id_impuesto)   REFERENCES impuesto(id_impuesto),
    FOREIGN KEY (codigo_moneda) REFERENCES moneda(codigo_moneda)
) ENGINE=InnoDB;

CREATE TABLE empleado (
    id_empleado   INT AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL,
    documento     VARCHAR(30)  NOT NULL UNIQUE,
    cargo         VARCHAR(80)  NOT NULL,
    salario       DECIMAL(18,2) NOT NULL CHECK (salario > 0),
    codigo_moneda CHAR(3) NOT NULL,
    id_sucursal   INT NOT NULL,
    fecha_ingreso DATE NOT NULL,
    FOREIGN KEY (codigo_moneda) REFERENCES moneda(codigo_moneda),
    FOREIGN KEY (id_sucursal)   REFERENCES sucursal(id_sucursal)
) ENGINE=InnoDB;

CREATE TABLE novedad (
    id_novedad   INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado  INT NOT NULL,
    tipo         ENUM('VACACIONES','INCAPACIDAD','HORAS_EXTRA') NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin    DATE NOT NULL,
    aprobada     BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
) ENGINE=InnoDB;

CREATE TABLE nomina (
    id_nomina     INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado   INT      NOT NULL,
    anio          SMALLINT NOT NULL,
    mes           TINYINT  NOT NULL CHECK (mes BETWEEN 1 AND 12),
    salario_base  DECIMAL(18,2) NOT NULL,
    bonificaciones DECIMAL(18,2) NOT NULL DEFAULT 0,
    deducciones   DECIMAL(18,2) NOT NULL DEFAULT 0,
    neto_pagar    DECIMAL(18,2) NOT NULL,
    UNIQUE (id_empleado, anio, mes),
    FOREIGN KEY (id_empleado) REFERENCES empleado(id_empleado)
) ENGINE=InnoDB;



-- ===================== DATOS INICIALES =====================
INSERT INTO rol (id_rol, nombre, descripcion) VALUES
(1, 'Administrador', 'Acceso total a todos los módulos'),
(2, 'Operador', 'Operación diaria: divisas, ventas, compras e inventario'),
(3, 'Auditor', 'Solo lectura: finanzas, organización y contabilidad');

INSERT INTO moneda (codigo_moneda, nombre, simbolo) VALUES
('COP', 'Peso Colombiano', '$'),
('USD', 'Dólar Estadounidense', 'US$'),
('EUR', 'Euro', '€');

INSERT INTO pais (id_pais, nombre, codigo_iso, codigo_moneda) VALUES
(1, 'Colombia', 'CO', 'COP'),
(2, 'Estados Unidos', 'US', 'USD'),
(3, 'España', 'ES', 'EUR');

INSERT INTO sucursal (id_sucursal, nombre, id_pais, direccion, codigo_moneda_base) VALUES
(1, 'Sede Principal Bogotá', 1, 'Calle 100 # 10-20, Bogotá', 'COP'),
(2, 'Sucursal Internacional Miami', 2, '1200 Brickell Ave, Miami', 'USD'),
(3, 'Centro Operativo Madrid', 3, 'Paseo de la Castellana 50, Madrid', 'EUR');

INSERT INTO impuesto (id_impuesto, id_pais, nombre, porcentaje) VALUES
(1, 1, 'IVA General Colombia', 19.00),
(2, 2, 'Sales Tax Florida', 7.00),
(3, 3, 'IVA General España', 21.00);

INSERT INTO tasa_cambio (moneda_origen, moneda_destino, tasa, fecha_vigencia, fuente) VALUES
('USD', 'COP', 4350.000000, '2026-11-24', 'Banco de la República'),
('EUR', 'COP', 4680.000000, '2026-11-24', 'Banco de la República'),
('EUR', 'USD', 1.080000, '2026-11-24', 'BCE');

INSERT INTO modulo (id_modulo, nombre) VALUES
(1, 'DIVISAS'), (2, 'ORGANIZACION'), (3, 'SEGURIDAD'), (4, 'VENTAS'),
(5, 'COMPRAS'), (6, 'INVENTARIO'), (7, 'CONTABILIDAD'), (8, 'RRHH');

INSERT INTO rol_modulo (id_rol, id_modulo) VALUES
(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),
(2,1),(2,4),(2,5),(2,6),
(3,1),(3,2),(3,7);

-- Contraseñas (bcrypt): admin123 / oper123 / audit123
INSERT INTO usuario (id_usuario, nombre, email, password_hash, id_rol, id_sucursal, idioma, activo) VALUES
(1, 'Julian Medina', 'admin@erp.com', '$2b$12$DmhBcdk8ecu3r9UMAevYjOTmkFsKlIhete/nu3pQ/qH4gPyJi.Usm', 1, 1, 'es', TRUE),
(2, 'Carlos Operador', 'operador@erp.com', '$2b$12$06SrgdFLpSm0IHOnwMDTn./2B9Loy7PWgwxrW8QOcTfzNWflOZfOq', 2, 1, 'es', TRUE),
(3, 'Laura Auditora', 'auditor@erp.com', '$2b$12$OzFVPA7LJeUNi07uUNDYL.Xi405zaxc23P8F/sjzStmreZtXtpazC', 3, 2, 'es', TRUE);

INSERT INTO auditoria (id_usuario, tabla_afectada, accion, valor_anterior, valor_nuevo) VALUES
(1, 'usuario', 'INSERT', NULL, '{"email": "admin@erp.com", "rol": 1}'),
(2, 'tasa_cambio', 'INSERT', NULL, '{"par": "USD/COP", "tasa": 4350}');

INSERT INTO periodo_contable (id_periodo, id_sucursal, anio, mes, estado) VALUES
(1, 1, 2026, 11, 'ABIERTO'), (2, 1, 2026, 10, 'CERRADO');

INSERT INTO asiento_contable (id_periodo, fecha, descripcion, monto_original, codigo_moneda, tasa_aplicada, monto_base) VALUES
(1, '2026-11-20', 'Pago de licencias en USD', 1000.00, 'USD', 4350, 4350000.00);

INSERT INTO cliente (id_cliente, nombre, id_pais, email, codigo_moneda) VALUES
(1, 'Distribuidora Andina S.A.S.', 1, 'compras@andina.co', 'COP'),
(2, 'Miami Retail Group', 2, 'orders@miamiretail.com', 'USD');

INSERT INTO proveedor (id_proveedor, nombre, id_pais, identificacion_fiscal, codigo_moneda, condiciones_pago, activo) VALUES
(1, 'Tecnologías Iberia S.L.', 3, 'ES-B12345678', 'EUR', '30 días', TRUE),
(2, 'Global Parts Inc.', 2, 'US-98-7654321', 'USD', '45 días', TRUE);

INSERT INTO producto (id_producto, sku, nombre, precio_base, stock_minimo, activo) VALUES
(1, 'LAP-001', 'Portátil 14 pulgadas', 2500000.00, 5, TRUE),
(2, 'MON-002', 'Monitor 27 pulgadas', 900000.00, 3, TRUE),
(3, 'TEC-003', 'Teclado mecánico', 250000.00, 10, TRUE);

INSERT INTO bodega (id_bodega, nombre, id_sucursal) VALUES
(1, 'Bodega Central Bogotá', 1),
(2, 'Bodega Miami', 2);

INSERT INTO stock (id_bodega, id_producto, cantidad) VALUES
(1, 1, 20), (1, 2, 12), (1, 3, 40), (2, 1, 8);

INSERT INTO empleado (id_empleado, nombre, documento, cargo, salario, codigo_moneda, id_sucursal, fecha_ingreso) VALUES
(1, 'Ana María Rojas', '1020304050', 'Contadora', 5200000.00, 'COP', 1, '2024-02-01'),
(2, 'John Carter', 'US-4455667', 'Sales Manager', 4800.00, 'USD', 2, '2023-08-15');

INSERT INTO novedad (id_empleado, tipo, fecha_inicio, fecha_fin, aprobada) VALUES
(1, 'VACACIONES', '2026-12-15', '2026-12-30', FALSE);

INSERT INTO nomina (id_empleado, anio, mes, salario_base, bonificaciones, deducciones, neto_pagar) VALUES
(1, 2026, 10, 5200000.00, 300000.00, 208000.00, 5292000.00);
