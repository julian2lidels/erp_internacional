import { useEffect, useState } from 'react';
import SectionBanner from './SectionBanner';
import { enviar, getLista } from '../api';

const input =
  'w-full bg-[#1B1036] border border-purple-400/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400';

export default function Usuarios({ soloLectura }) {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [modulos, setModulos] = useState([]);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', id_rol: '', id_sucursal: '', idioma: 'es' });
  const [rolPermisos, setRolPermisos] = useState('');
  const [asignados, setAsignados] = useState([]);
  const [nuevoModulo, setNuevoModulo] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');

  const cargarUsuarios = () => getLista('/api/seguridad/usuarios').then(setUsuarios);
  const cargarModulos = () => getLista('/api/seguridad/modulos').then(setModulos);

  useEffect(() => {
    cargarUsuarios();
    cargarModulos();
    getLista('/api/erp/roles').then(setRoles);
    getLista('/api/erp/sucursales').then(setSucursales);
  }, []);

  const avisar = (fn) => async (...args) => {
    setError('');
    setOk('');
    try {
      const r = await fn(...args);
      if (r?.message) setOk(r.message);
    } catch (e) {
      setError(e.message);
    }
  };

  const crearUsuario = avisar(async (e) => {
    e.preventDefault();
    const r = await enviar('POST', '/api/seguridad/usuarios', {
      ...form,
      id_rol: Number(form.id_rol),
      id_sucursal: Number(form.id_sucursal),
    });
    setForm({ nombre: '', email: '', password: '', id_rol: '', id_sucursal: '', idioma: 'es' });
    cargarUsuarios();
    return r;
  });

  const cambiarEstado = avisar(async (u) => {
    const r = await enviar('PATCH', `/api/seguridad/usuarios/${u.id_usuario}/estado`, { activo: !u.activo });
    cargarUsuarios();
    return r;
  });

  const elegirRol = async (id) => {
    setRolPermisos(id);
    if (!id) return setAsignados([]);
    const lista = await getLista(`/api/seguridad/roles/${id}/modulos`);
    setAsignados(lista.map((m) => m.id_modulo));
  };

  const alternar = (id) => setAsignados((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const guardarPermisos = avisar(() =>
    enviar('POST', '/api/seguridad/roles/asignar-modulos', { id_rol: Number(rolPermisos), modulos_ids: asignados })
  );

  const crearModulo = avisar(async (e) => {
    e.preventDefault();
    await enviar('POST', '/api/seguridad/modulos', { nombre: nuevoModulo });
    setNuevoModulo('');
    cargarModulos();
    return { message: 'Módulo creado' };
  });

  const f = (k) => (e) => setForm((v) => ({ ...v, [k]: e.target.value }));

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/img/usuarios.svg"
        etiqueta="Seguridad y Accesos"
        titulo="Usuarios y permisos"
        descripcion="Crea cuentas, actívalas o desactívalas y decide qué módulos ve cada rol."
        badgeDerecha={`${usuarios.length} usuario${usuarios.length === 1 ? '' : 's'}`}
      />

      <div aria-live="polite" className="space-y-2">
        {error && <p role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">{error}</p>}
        {ok && <p className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">{ok}</p>}
      </div>

      {!soloLectura && (
        <form onSubmit={crearUsuario} className="rounded-3xl border border-purple-400/25 bg-[#0f0824]/90 p-6 space-y-5">
          <h3 className="font-display text-2xl text-white">Nuevo usuario</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="space-y-1.5 block"><span className="text-sm text-purple-200/80">Nombre *</span>
              <input className={input} required value={form.nombre} onChange={f('nombre')} /></label>
            <label className="space-y-1.5 block"><span className="text-sm text-purple-200/80">Correo *</span>
              <input className={input} type="email" required value={form.email} onChange={f('email')} /></label>
            <label className="space-y-1.5 block"><span className="text-sm text-purple-200/80">Contraseña (mínimo 6) *</span>
              <input className={input} type="password" required minLength={6} value={form.password} onChange={f('password')} /></label>
            <label className="space-y-1.5 block"><span className="text-sm text-purple-200/80">Rol *</span>
              <select className={input} required value={form.id_rol} onChange={f('id_rol')}>
                <option value="">Selecciona…</option>
                {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
              </select></label>
            <label className="space-y-1.5 block"><span className="text-sm text-purple-200/80">Sucursal *</span>
              <select className={input} required value={form.id_sucursal} onChange={f('id_sucursal')}>
                <option value="">Selecciona…</option>
                {sucursales.map((s) => <option key={s.id_sucursal} value={s.id_sucursal}>{s.nombre}</option>)}
              </select></label>
            <label className="space-y-1.5 block"><span className="text-sm text-purple-200/80">Idioma</span>
              <select className={input} value={form.idioma} onChange={f('idioma')}>
                <option value="es">Español</option><option value="en">English</option>
              </select></label>
          </div>
          <button className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 transition">Crear usuario</button>
        </form>
      )}

      <section className="rounded-3xl border border-purple-400/25 bg-[#0f0824]/90 overflow-hidden">
        <h3 className="font-display text-2xl text-white p-5 border-b border-purple-400/15">Usuarios</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#1C1038] text-purple-200">
              <tr>{['Nombre', 'Correo', 'Rol', 'Sucursal', 'Idioma', 'Estado'].map((h) => <th key={h} className="px-5 py-3.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-purple-400/10">
              {usuarios.map((u) => (
                <tr key={u.id_usuario} className="hover:bg-purple-900/20">
                  <td className="px-5 py-3 text-white">{u.nombre}</td>
                  <td className="px-5 py-3 text-purple-100">{u.email}</td>
                  <td className="px-5 py-3 text-purple-100">{u.rol}</td>
                  <td className="px-5 py-3 text-purple-100">{u.sucursal}</td>
                  <td className="px-5 py-3 text-purple-100">{u.idioma}</td>
                  <td className="px-5 py-3">
                    <button
                      disabled={soloLectura}
                      onClick={() => cambiarEstado(u)}
                      className={`px-3 py-1 rounded-full border text-xs font-semibold ${u.activo ? 'border-emerald-400/40 text-emerald-200' : 'border-rose-400/40 text-rose-200'} disabled:opacity-60`}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && <tr><td colSpan={6} className="px-5 py-10 text-center text-purple-200/60">No hay usuarios todavía.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-3xl border border-purple-400/25 bg-[#0f0824]/90 p-6 space-y-5">
        <h3 className="font-display text-2xl text-white">Módulos por rol</h3>
        <label className="block max-w-xs space-y-1.5">
          <span className="text-sm text-purple-200/80">Rol</span>
          <select className={input} value={rolPermisos} onChange={(e) => elegirRol(e.target.value)}>
            <option value="">Selecciona un rol…</option>
            {roles.map((r) => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
          </select>
        </label>
        {rolPermisos && (
          <>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {modulos.map((m) => (
                <label key={m.id_modulo} className="flex items-center gap-2.5 rounded-xl border border-purple-400/20 px-3.5 py-2.5 text-sm text-purple-100">
                  <input type="checkbox" className="h-4 w-4 accent-fuchsia-500" disabled={soloLectura} checked={asignados.includes(m.id_modulo)} onChange={() => alternar(m.id_modulo)} />
                  {m.nombre}
                </label>
              ))}
            </div>
            {!soloLectura && (
              <button onClick={guardarPermisos} className="px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 transition">
                Guardar permisos
              </button>
            )}
          </>
        )}
        {!soloLectura && (
          <form onSubmit={crearModulo} className="flex flex-wrap items-end gap-3 pt-2 border-t border-purple-400/15">
            <label className="block flex-1 min-w-[12rem] max-w-xs space-y-1.5">
              <span className="text-sm text-purple-200/80">Nuevo módulo</span>
              <input className={input} required value={nuevoModulo} onChange={(e) => setNuevoModulo(e.target.value)} />
            </label>
            <button className="px-5 py-2.5 rounded-full text-sm font-semibold text-purple-100 border border-purple-300/40 hover:text-white transition">Agregar módulo</button>
          </form>
        )}
      </section>
    </div>
  );
}
