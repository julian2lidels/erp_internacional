-- ============================================================================
-- ERP INTERNACIONAL - ESQUEMA COMPLETO E IDEMPOTENTE (MYSQL 8.0)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS erp_internacional
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE erp_internacional;

CREATE TABLE IF NOT EXISTS moneda (
    id_moneda INT AUTO_INCREMENT PRIMARY KEY,
    codigo_iso VARCHAR(3) NOT NULL UNIQUE,
    nombre VARCHAR(60) NOT NULL,
    simbolo VARCHAR(10) NOT NULL,
    activa TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS tasa_cambio (
    id_tasa INT AUTO_INCREMENT PRIMARY KEY,
    id_moneda_origen INT NOT NULL,
    id_moneda_destino INT NOT NULL,
    tasa DECIMAL(18, 6) NOT NULL,
    fecha_vigencia DATE NOT NULL,
    FOREIGN KEY (id_moneda_origen) REFERENCES moneda(id_moneda),
    FOREIGN KEY (id_moneda_destino) REFERENCES moneda(id_moneda)
);

CREATE TABLE IF NOT EXISTS sucursal (
    id_sucursal INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    pais VARCHAR(60) NOT NULL,
    ciudad VARCHAR(60) NOT NULL,
    id_moneda_base INT NOT NULL,
    activa TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (id_moneda_base) REFERENCES moneda(id_moneda)
);

CREATE TABLE IF NOT EXISTS impuesto (
    id_impuesto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    porcentaje DECIMAL(6, 2) NOT NULL,
    pais VARCHAR(60) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rol (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS usuario (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INT NOT NULL,
    id_sucursal INT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_sucursal) REFERENCES sucursal(id_sucursal)
);

CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    usuario_actor VARCHAR(100) NOT NULL,
    accion VARCHAR(120) NOT NULL,
    modulo VARCHAR(60) NOT NULL,
    fecha_evento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- DATOS SEMILLA INICIALES (IDEMPOTENTES)
-- ============================================================================

INSERT IGNORE INTO rol (id_rol, nombre, descripcion) VALUES
(1, 'Administrador', 'Acceso total: gestión de roles, usuarios, sucursales, impuestos y tasas'),
(2, 'Operador', 'Operación diaria: consulta y registro de tasas de cambio y movimientos'),
(3, 'Auditor', 'Solo lectura: supervisión de tasas, monedas, impuestos y auditoría');

INSERT IGNORE INTO moneda (id_moneda, codigo_iso, nombre, simbolo, activa) VALUES
(1, 'COP', 'Peso Colombiano', '$', 1),
(2, 'USD', 'Dólar Estadounidense', 'US$', 1),
(3, 'EUR', 'Euro', '€', 1);

INSERT IGNORE INTO sucursal (id_sucursal, codigo, nombre, pais, ciudad, id_moneda_base, activa) VALUES
(1, 'BOG-01', 'Sede Principal Bogotá', 'Colombia', 'Bogotá', 1, 1),
(2, 'MIA-01', 'Sucursal Internacional Miami', 'Estados Unidos', 'Miami', 2, 1),
(3, 'MAD-01', 'Centro Operativo Madrid', 'España', 'Madrid', 3, 1);

INSERT IGNORE INTO impuesto (id_impuesto, nombre, porcentaje, pais, activo) VALUES
(1, 'IVA General Colombia', 19.00, 'Colombia', 1),
(2, 'Sales Tax Florida', 7.00, 'Estados Unidos', 1),
(3, 'IVA General España', 21.00, 'España', 1);

INSERT IGNORE INTO usuario (id_usuario, nombre, email, password_hash, id_rol, id_sucursal, activo) VALUES
(1, 'Julian Medina', 'admin@erp.com', 'admin123', 1, 1, 1),
(2, 'Carlos Operador', 'operador@erp.com', 'oper123', 2, 1, 1),
(3, 'Laura Auditora', 'auditor@erp.com', 'audit123', 3, 2, 1);

INSERT IGNORE INTO tasa_cambio (id_tasa, id_moneda_origen, id_moneda_destino, tasa, fecha_vigencia) VALUES
(1, 2, 1, 4350.000000, '2026-11-24'),
(2, 3, 1, 4680.000000, '2026-11-24'),
(3, 3, 2, 1.080000, '2026-11-24');

INSERT IGNORE INTO auditoria (id_auditoria, usuario_actor, accion, modulo) VALUES
(1, 'Julian Medina', 'Inicialización del núcleo ERP Internacional', 'Seguridad y Accesos'),
(2, 'Carlos Operador', 'Actualización de tasa USD -> COP', 'Divisas y Finanzas');
