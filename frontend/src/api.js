// Llamadas a la API. Cada petición lleva el id del usuario con sesión
// (encabezado X-Usuario-Id) para que el backend valide permisos y registre auditoría.
const CLAVE_SESION = 'erp_sesion';

export function leerSesion() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION)) || null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    if (sesion) sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    /* sin almacenamiento disponible: la sesión dura solo mientras la pestaña esté abierta */
  }
}

function cabeceras() {
  const h = { 'Content-Type': 'application/json' };
  const s = leerSesion();
  if (s?.id_usuario) h['X-Usuario-Id'] = String(s.id_usuario);
  return h;
}

function textoError(data, status) {
  const d = data?.detail ?? data?.error;
  if (Array.isArray(d)) return d.map((e) => e.msg).join('. ');
  return d || `Error ${status}`;
}

// Devuelve [] si la API falla, para que la pantalla no quede en blanco.
export async function getLista(url) {
  try {
    const res = await fetch(url, { headers: cabeceras() });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// POST / PUT / PATCH / DELETE. Lanza Error con el mensaje del servidor si falla.
export async function enviar(metodo, url, cuerpo) {
  const res = await fetch(url, {
    method: metodo,
    headers: cabeceras(),
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(textoError(data, res.status));
  return data;
}
