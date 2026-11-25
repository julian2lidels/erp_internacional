// Una entrada por tabla del ERP. CrudPage dibuja la pantalla a partir de esto.
//   tipo: texto | numero | fecha | bool | select | ref (llave foránea)
//   auto: lo llena el servidor (no aparece en el formulario)
//   calc: lo calcula el servidor (se muestra, no se edita)
const ESTADOS_OC = ['PENDIENTE_APROBACION', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA', 'CANCELADA'];

export const ENTIDADES = {
  // ---------------- Divisas ----------------
  monedas: {
    grupo: 'divisas', titulo: 'Catálogo de monedas', imagen: '/img/monedas.svg',
    descripcion: 'Divisas habilitadas para facturar, comprar y registrar asientos.',
    pk: ['codigo_moneda'], pkManual: true,
    etiqueta: (r) => `${r.codigo_moneda} · ${r.nombre}`,
    campos: [
      { k: 'codigo_moneda', label: 'Código ISO', tipo: 'texto', max: 3, req: true, mayus: true, soloCrear: true },
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'simbolo', label: 'Símbolo', tipo: 'texto', max: 5, req: true },
    ],
  },
  'tasas-cambio': {
    grupo: 'divisas', titulo: 'Tasas de cambio', imagen: '/img/tasas.svg',
    descripcion: 'Valor de cada moneda frente a otra en una fecha de vigencia.',
    pk: ['id_tasa'],
    campos: [
      { k: 'moneda_origen', label: 'Moneda origen', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'moneda_destino', label: 'Moneda destino', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'tasa', label: 'Tasa', tipo: 'numero', step: '0.000001', req: true },
      { k: 'fecha_vigencia', label: 'Vigente desde', tipo: 'fecha', req: true },
      { k: 'fuente', label: 'Fuente', tipo: 'texto' },
    ],
  },
  // ---------------- Organización ----------------
  paises: {
    grupo: 'organizacion', titulo: 'Países', imagen: '/img/sucursales.svg',
    descripcion: 'Países donde opera la empresa y su moneda oficial.',
    pk: ['id_pais'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'codigo_iso', label: 'Código ISO (2 letras)', tipo: 'texto', max: 2, req: true, mayus: true },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
    ],
  },
  sucursales: {
    grupo: 'organizacion', titulo: 'Sedes y sucursales', imagen: '/img/sucursales.svg',
    descripcion: 'Oficinas en cada país, con su moneda base contable.',
    pk: ['id_sucursal'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'id_pais', label: 'País', tipo: 'ref', ref: 'paises', req: true },
      { k: 'direccion', label: 'Dirección', tipo: 'texto' },
      { k: 'codigo_moneda_base', label: 'Moneda base', tipo: 'ref', ref: 'monedas', req: true },
    ],
  },
  impuestos: {
    grupo: 'organizacion', titulo: 'Impuestos por país', imagen: '/img/impuestos.svg',
    descripcion: 'Reglas fiscales (IVA, sales tax) que se aplican al facturar.',
    pk: ['id_impuesto'], etiqueta: (r) => `${r.nombre} (${r.porcentaje}%)`,
    campos: [
      { k: 'id_pais', label: 'País', tipo: 'ref', ref: 'paises', req: true },
      { k: 'nombre', label: 'Nombre del impuesto', tipo: 'texto', req: true },
      { k: 'porcentaje', label: 'Porcentaje (%)', tipo: 'numero', step: '0.01', req: true },
    ],
  },
  // ---------------- Seguridad ----------------
  roles: {
    grupo: 'seguridad', titulo: 'Roles', imagen: '/img/roles.svg',
    descripcion: 'Perfiles de acceso. Los módulos de cada rol se asignan en Usuarios y permisos.',
    pk: ['id_rol'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre del rol', tipo: 'texto', req: true },
      { k: 'descripcion', label: 'Descripción', tipo: 'texto' },
    ],
  },
  auditoria: {
    grupo: 'seguridad', titulo: 'Bitácora de auditoría', imagen: '/img/auditoria.svg',
    descripcion: 'Quién cambió qué y cuándo. Incluye los accesos denegados.',
    endpoint: '/api/seguridad/auditoria', pk: ['id_auditoria'], soloLista: true,
    campos: [
      { k: 'fecha_hora', label: 'Fecha', tipo: 'texto' },
      { k: 'usuario', label: 'Usuario', tipo: 'texto' },
      { k: 'tabla_afectada', label: 'Tabla', tipo: 'texto' },
      { k: 'accion', label: 'Acción', tipo: 'texto' },
      { k: 'valor_nuevo', label: 'Valor nuevo', tipo: 'texto' },
    ],
  },
  // ---------------- Ventas ----------------
  clientes: {
    grupo: 'ventas', titulo: 'Clientes', imagen: '/img/ventas.svg',
    descripcion: 'Clientes nacionales e internacionales y su moneda de trato.',
    pk: ['id_cliente'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'id_pais', label: 'País', tipo: 'ref', ref: 'paises', req: true },
      { k: 'email', label: 'Correo', tipo: 'texto' },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
    ],
  },
  'pedidos-venta': {
    grupo: 'ventas', titulo: 'Pedidos de venta', imagen: '/img/ventas.svg',
    descripcion: 'Pedidos de los clientes. Los productos se agregan en el detalle del pedido.',
    pk: ['id_pedido'], etiqueta: (r) => `Pedido #${r.id_pedido}`,
    campos: [
      { k: 'id_cliente', label: 'Cliente', tipo: 'ref', ref: 'clientes', req: true },
      { k: 'id_sucursal', label: 'Sucursal', tipo: 'ref', ref: 'sucursales', req: true },
      { k: 'fecha', label: 'Fecha', tipo: 'fecha', req: true },
      { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['CREADO', 'FACTURADO', 'CANCELADO'], def: 'CREADO' },
      { k: 'id_usuario', label: 'Registrado por', tipo: 'ref', ref: 'usuarios', auto: true },
    ],
  },
  'detalle-pedido-venta': {
    grupo: 'ventas', titulo: 'Detalle de pedidos', imagen: '/img/ventas.svg',
    descripcion: 'Productos, cantidades y precio de cada pedido de venta.',
    pk: ['id_detalle'],
    campos: [
      { k: 'id_pedido', label: 'Pedido', tipo: 'ref', ref: 'pedidos-venta', req: true },
      { k: 'id_producto', label: 'Producto', tipo: 'ref', ref: 'productos', req: true },
      { k: 'cantidad', label: 'Cantidad', tipo: 'numero', step: '1', req: true },
      { k: 'precio_unitario', label: 'Precio unitario', tipo: 'numero', step: '0.01', req: true },
    ],
  },
  facturas: {
    grupo: 'ventas', titulo: 'Facturas', imagen: '/img/ventas.svg',
    descripcion: 'Se genera desde un pedido. El subtotal, el impuesto y el total se calculan solos.',
    pk: ['id_factura'], sinEditar: true, etiqueta: (r) => `Factura #${r.id_factura}`,
    campos: [
      { k: 'id_pedido', label: 'Pedido a facturar', tipo: 'ref', ref: 'pedidos-venta', req: true },
      { k: 'id_impuesto', label: 'Impuesto', tipo: 'ref', ref: 'impuestos', req: true },
      { k: 'fecha', label: 'Fecha', tipo: 'fecha', req: true },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'tasa_aplicada', label: 'Tasa aplicada', tipo: 'numero', step: '0.000001', def: '1' },
      { k: 'subtotal', label: 'Subtotal', tipo: 'numero', calc: true },
      { k: 'valor_impuesto', label: 'Impuesto', tipo: 'numero', calc: true },
      { k: 'total', label: 'Total', tipo: 'numero', calc: true },
    ],
  },
  // ---------------- Compras ----------------
  proveedores: {
    grupo: 'compras', titulo: 'Proveedores', imagen: '/img/compras.svg',
    descripcion: 'Proveedores locales y del exterior con su identificación fiscal.',
    pk: ['id_proveedor'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'id_pais', label: 'País', tipo: 'ref', ref: 'paises', req: true },
      { k: 'identificacion_fiscal', label: 'Identificación fiscal', tipo: 'texto', req: true },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'condiciones_pago', label: 'Condiciones de pago', tipo: 'texto' },
      { k: 'activo', label: 'Activo', tipo: 'bool', def: true },
    ],
  },
  'ordenes-compra': {
    grupo: 'compras', titulo: 'Órdenes de compra', imagen: '/img/compras.svg',
    descripcion: 'Pedidos a proveedores. El total se recalcula con su detalle.',
    pk: ['id_orden_compra'], etiqueta: (r) => `OC #${r.id_orden_compra}`,
    campos: [
      { k: 'id_proveedor', label: 'Proveedor', tipo: 'ref', ref: 'proveedores', req: true },
      { k: 'id_sucursal', label: 'Sucursal', tipo: 'ref', ref: 'sucursales', req: true },
      { k: 'fecha', label: 'Fecha', tipo: 'fecha', req: true },
      { k: 'fecha_estimada_entrega', label: 'Entrega estimada', tipo: 'fecha' },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'estado', label: 'Estado', tipo: 'select', opciones: ESTADOS_OC, def: 'PENDIENTE_APROBACION' },
      { k: 'id_usuario_aprobador', label: 'Aprobada por', tipo: 'ref', ref: 'usuarios' },
      { k: 'id_usuario_solicitante', label: 'Solicitada por', tipo: 'ref', ref: 'usuarios', auto: true },
      { k: 'total', label: 'Total', tipo: 'numero', calc: true },
    ],
  },
  'detalle-orden-compra': {
    grupo: 'compras', titulo: 'Detalle de órdenes', imagen: '/img/compras.svg',
    descripcion: 'Productos y precios de cada orden de compra.',
    pk: ['id_detalle'],
    campos: [
      { k: 'id_orden_compra', label: 'Orden de compra', tipo: 'ref', ref: 'ordenes-compra', req: true },
      { k: 'id_producto', label: 'Producto', tipo: 'ref', ref: 'productos', req: true },
      { k: 'cantidad', label: 'Cantidad', tipo: 'numero', step: '1', req: true },
      { k: 'precio_unitario', label: 'Precio unitario', tipo: 'numero', step: '0.01', req: true },
    ],
  },
  // ---------------- Inventario ----------------
  productos: {
    grupo: 'inventario', titulo: 'Productos', imagen: '/img/inventario.svg',
    descripcion: 'Catálogo de productos con precio base y stock mínimo.',
    pk: ['id_producto'], etiqueta: (r) => `${r.sku} · ${r.nombre}`,
    campos: [
      { k: 'sku', label: 'SKU', tipo: 'texto', req: true },
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'precio_base', label: 'Precio base', tipo: 'numero', step: '0.01', req: true },
      { k: 'stock_minimo', label: 'Stock mínimo', tipo: 'numero', step: '1', def: '0' },
      { k: 'activo', label: 'Activo', tipo: 'bool', def: true },
    ],
  },
  bodegas: {
    grupo: 'inventario', titulo: 'Bodegas', imagen: '/img/inventario.svg',
    descripcion: 'Bodegas de cada sucursal.',
    pk: ['id_bodega'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'id_sucursal', label: 'Sucursal', tipo: 'ref', ref: 'sucursales', req: true },
    ],
  },
  stock: {
    grupo: 'inventario', titulo: 'Existencias', imagen: '/img/inventario.svg',
    descripcion: 'Cantidad de cada producto por bodega. Los movimientos la actualizan solos.',
    pk: ['id_bodega', 'id_producto'], pkManual: true,
    campos: [
      { k: 'id_bodega', label: 'Bodega', tipo: 'ref', ref: 'bodegas', req: true, soloCrear: true },
      { k: 'id_producto', label: 'Producto', tipo: 'ref', ref: 'productos', req: true, soloCrear: true },
      { k: 'cantidad', label: 'Cantidad', tipo: 'numero', step: '1', req: true },
    ],
  },
  'movimientos-inventario': {
    grupo: 'inventario', titulo: 'Movimientos de inventario', imagen: '/img/inventario.svg',
    descripcion: 'Entradas, salidas y traslados. Cada movimiento ajusta las existencias.',
    pk: ['id_movimiento'], sinBorrar: true, editables: ['estado'],
    campos: [
      { k: 'tipo', label: 'Tipo', tipo: 'select', opciones: ['ENTRADA', 'SALIDA', 'TRASLADO'], req: true },
      { k: 'id_producto', label: 'Producto', tipo: 'ref', ref: 'productos', req: true },
      { k: 'id_bodega_origen', label: 'Bodega origen', tipo: 'ref', ref: 'bodegas' },
      { k: 'id_bodega_destino', label: 'Bodega destino', tipo: 'ref', ref: 'bodegas' },
      { k: 'cantidad', label: 'Cantidad', tipo: 'numero', step: '1', req: true },
      { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['COMPLETADO', 'EN_TRANSITO'], def: 'COMPLETADO' },
      { k: 'id_orden_compra', label: 'Orden de compra', tipo: 'ref', ref: 'ordenes-compra' },
      { k: 'fecha', label: 'Fecha', tipo: 'texto', calc: true },
      { k: 'id_usuario', label: 'Registrado por', tipo: 'ref', ref: 'usuarios', auto: true },
    ],
  },
  // ---------------- Contabilidad ----------------
  'periodos-contables': {
    grupo: 'contabilidad', titulo: 'Periodos contables', imagen: '/img/contabilidad.svg',
    descripcion: 'Meses contables de cada sucursal, abiertos o cerrados.',
    pk: ['id_periodo'], etiqueta: (r) => `${r.anio}-${String(r.mes).padStart(2, '0')} (${r.estado})`,
    campos: [
      { k: 'id_sucursal', label: 'Sucursal', tipo: 'ref', ref: 'sucursales', req: true },
      { k: 'anio', label: 'Año', tipo: 'numero', step: '1', req: true },
      { k: 'mes', label: 'Mes (1-12)', tipo: 'numero', step: '1', req: true },
      { k: 'estado', label: 'Estado', tipo: 'select', opciones: ['ABIERTO', 'CERRADO'], def: 'ABIERTO' },
    ],
  },
  'asientos-contables': {
    grupo: 'contabilidad', titulo: 'Asientos contables', imagen: '/img/contabilidad.svg',
    descripcion: 'Movimientos contables. El monto base se calcula con la tasa aplicada.',
    pk: ['id_asiento'],
    campos: [
      { k: 'id_periodo', label: 'Periodo', tipo: 'ref', ref: 'periodos-contables', req: true },
      { k: 'fecha', label: 'Fecha', tipo: 'fecha', req: true },
      { k: 'descripcion', label: 'Descripción', tipo: 'texto' },
      { k: 'monto_original', label: 'Monto original', tipo: 'numero', step: '0.01', req: true },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'tasa_aplicada', label: 'Tasa aplicada', tipo: 'numero', step: '0.000001', def: '1' },
      { k: 'monto_base', label: 'Monto en moneda base', tipo: 'numero', calc: true },
    ],
  },
  // ---------------- Recursos humanos ----------------
  empleados: {
    grupo: 'rrhh', titulo: 'Empleados', imagen: '/img/rrhh.svg',
    descripcion: 'Personal de cada sucursal con su salario y moneda de pago.',
    pk: ['id_empleado'], etiqueta: (r) => r.nombre,
    campos: [
      { k: 'nombre', label: 'Nombre', tipo: 'texto', req: true },
      { k: 'documento', label: 'Documento', tipo: 'texto', req: true },
      { k: 'cargo', label: 'Cargo', tipo: 'texto', req: true },
      { k: 'salario', label: 'Salario', tipo: 'numero', step: '0.01', req: true },
      { k: 'codigo_moneda', label: 'Moneda', tipo: 'ref', ref: 'monedas', req: true },
      { k: 'id_sucursal', label: 'Sucursal', tipo: 'ref', ref: 'sucursales', req: true },
      { k: 'fecha_ingreso', label: 'Fecha de ingreso', tipo: 'fecha', req: true },
    ],
  },
  novedades: {
    grupo: 'rrhh', titulo: 'Novedades', imagen: '/img/rrhh.svg',
    descripcion: 'Vacaciones, incapacidades y horas extra de los empleados.',
    pk: ['id_novedad'],
    campos: [
      { k: 'id_empleado', label: 'Empleado', tipo: 'ref', ref: 'empleados', req: true },
      { k: 'tipo', label: 'Tipo', tipo: 'select', opciones: ['VACACIONES', 'INCAPACIDAD', 'HORAS_EXTRA'], req: true },
      { k: 'fecha_inicio', label: 'Desde', tipo: 'fecha', req: true },
      { k: 'fecha_fin', label: 'Hasta', tipo: 'fecha', req: true },
      { k: 'aprobada', label: 'Aprobada', tipo: 'bool', def: false },
    ],
  },
  nominas: {
    grupo: 'rrhh', titulo: 'Nómina', imagen: '/img/rrhh.svg',
    descripcion: 'Pago mensual por empleado. El neto = salario base + bonificaciones − deducciones.',
    pk: ['id_nomina'],
    campos: [
      { k: 'id_empleado', label: 'Empleado', tipo: 'ref', ref: 'empleados', req: true },
      { k: 'anio', label: 'Año', tipo: 'numero', step: '1', req: true },
      { k: 'mes', label: 'Mes (1-12)', tipo: 'numero', step: '1', req: true },
      { k: 'salario_base', label: 'Salario base', tipo: 'numero', step: '0.01', req: true },
      { k: 'bonificaciones', label: 'Bonificaciones', tipo: 'numero', step: '0.01', def: '0' },
      { k: 'deducciones', label: 'Deducciones', tipo: 'numero', step: '0.01', def: '0' },
      { k: 'neto_pagar', label: 'Neto a pagar', tipo: 'numero', calc: true },
    ],
  },
};

// Destinos de las llaves foráneas que no son una entidad CRUD normal
export const REFS_EXTRA = {
  usuarios: { endpoint: '/api/seguridad/usuarios', valor: 'id_usuario', etiqueta: (r) => r.nombre },
};

// Grupos del menú y del inicio. "modulo" es el nombre en la tabla `modulo`.
export const GRUPOS = [
  { id: 'divisas', modulo: 'DIVISAS', titulo: 'Divisas y Finanzas', imagen: '/img/monedas.svg',
    texto: 'Monedas ISO y tasas de conversión entre mercados.', items: ['monedas', 'tasas-cambio'] },
  { id: 'organizacion', modulo: 'ORGANIZACION', titulo: 'Organización Global', imagen: '/img/sucursales.svg',
    texto: 'Países, sedes y reglas fiscales de cada jurisdicción.', items: ['paises', 'sucursales', 'impuestos'] },
  { id: 'ventas', modulo: 'VENTAS', titulo: 'Ventas', imagen: '/img/ventas.svg',
    texto: 'Clientes, pedidos y facturación con impuestos.', items: ['clientes', 'pedidos-venta', 'detalle-pedido-venta', 'facturas'] },
  { id: 'compras', modulo: 'COMPRAS', titulo: 'Compras', imagen: '/img/compras.svg',
    texto: 'Proveedores y órdenes de compra con aprobación.', items: ['proveedores', 'ordenes-compra', 'detalle-orden-compra'] },
  { id: 'inventario', modulo: 'INVENTARIO', titulo: 'Inventario', imagen: '/img/inventario.svg',
    texto: 'Productos, bodegas, existencias y movimientos.', items: ['productos', 'bodegas', 'stock', 'movimientos-inventario'] },
  { id: 'contabilidad', modulo: 'CONTABILIDAD', titulo: 'Contabilidad', imagen: '/img/contabilidad.svg',
    texto: 'Periodos y asientos en moneda original y base.', items: ['periodos-contables', 'asientos-contables'] },
  { id: 'rrhh', modulo: 'RRHH', titulo: 'Recursos Humanos', imagen: '/img/rrhh.svg',
    texto: 'Empleados, novedades y nómina mensual.', items: ['empleados', 'novedades', 'nominas'] },
  { id: 'seguridad', modulo: 'SEGURIDAD', titulo: 'Seguridad y Accesos', imagen: '/img/roles.svg', admin: true,
    texto: 'Roles, usuarios, permisos por módulo y auditoría.', items: ['roles', 'usuarios', 'auditoria'] },
];

// Vista especial que no usa CrudPage
export const VISTAS_ESPECIALES = {
  usuarios: { titulo: 'Usuarios y permisos', imagen: '/img/usuarios.svg', grupo: 'seguridad' },
};

export function endpointDe(clave) {
  return ENTIDADES[clave]?.endpoint || `/api/erp/${clave}`;
}

export function tituloDe(clave) {
  return ENTIDADES[clave]?.titulo || VISTAS_ESPECIALES[clave]?.titulo || clave;
}

export function imagenDe(clave) {
  return ENTIDADES[clave]?.imagen || VISTAS_ESPECIALES[clave]?.imagen || '/img/roles.svg';
}
