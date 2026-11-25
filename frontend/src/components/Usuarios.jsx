import { useState, useEffect } from 'react';
import SectionBanner from './SectionBanner';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idRol, setIdRol] = useState('');
  const [idSucursal, setIdSucursal] = useState('');

  const cargar = () => {
    fetch('/api/core/usuarios')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setUsuarios(Array.isArray(data) ? data : []))
      .catch(() => setUsuarios([]));

    fetch('/api/core/roles')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]));

    fetch('/api/core/sucursales')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(() => setSucursales([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    if (!nombre || !email || !password || !idRol) return;
    await fetch('/api/core/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        email,
        password_hash: password,
        id_rol: Number(idRol),
        id_sucursal: idSucursal ? Number(idSucursal) : null,
        activo: 1,
      }),
    });
    setNombre('');
    setEmail('');
    setPassword('');
    cargar();
  };

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/img/usuarios.svg"
        etiqueta="Seguridad y Accesos"
        titulo="Usuarios y Permisos"
        descripcion="Registra operadores y auditores, vinculando su rol de seguridad y sucursal asignada."
        badgeDerecha="Zona Restringida · Admin"
      />

      <form onSubmit={guardar} className="bg-[#120A24] p-5 rounded-2xl border border-fuchsia-500/30 flex flex-wrap gap-3 shadow-[0_0_30px_rgba(217,70,239,0.18)]">
        <input
          type="text"
          placeholder="Nombre completo"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-36 focus:outline-none focus:border-fuchsia-400"
        />
        <select
          value={idRol}
          onChange={(e) => setIdRol(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400"
        >
          <option value="">Seleccionar Rol</option>
          {roles.map((r) => (
            <option key={r.id_rol} value={r.id_rol}>
              {r.nombre}
            </option>
          ))}
        </select>
        <select
          value={idSucursal}
          onChange={(e) => setIdSucursal(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400"
        >
          <option value="">Sucursal (Opcional)</option>
          {sucursales.map((s) => (
            <option key={s.id_sucursal} value={s.id_sucursal}>
              {s.nombre}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.35)] transition">
          Crear Usuario
        </button>
      </form>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">Usuario</th>
              <th className="px-5 py-3.5">Correo</th>
              <th className="px-5 py-3.5">Rol</th>
              <th className="px-5 py-3.5">Sucursal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {usuarios.map((u) => (
              <tr key={u.id_usuario} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 font-semibold text-white">{u.nombre}</td>
                <td className="px-5 py-3.5 text-purple-200/80">{u.email}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                    {u.rol_nombre}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sky-300">{u.sucursal_nombre || 'Global'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
