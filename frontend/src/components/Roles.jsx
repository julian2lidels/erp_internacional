import { useState, useEffect } from 'react';
import SectionBanner from './SectionBanner';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const cargarRoles = () => {
    fetch('/api/core/roles')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setRoles(Array.isArray(data) ? data : []))
      .catch(() => setRoles([]));
  };

  useEffect(() => {
    cargarRoles();
  }, []);

  const crearRol = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await fetch('/api/core/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, descripcion }),
    });
    setNombre('');
    setDescripcion('');
    cargarRoles();
  };

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/banners/seguridad.svg"
        etiqueta="Seguridad y Accesos"
        titulo="Gestión de Roles"
        descripcion="Define perfiles operativos y niveles de privilegio dentro del núcleo administrativo del ERP."
        badgeDerecha="Zona Restringida · Admin"
      />

      <form onSubmit={crearRol} className="bg-[#120A24] p-5 rounded-2xl border border-fuchsia-500/30 flex flex-wrap gap-3 shadow-[0_0_30px_rgba(217,70,239,0.18)]">
        <input
          type="text"
          placeholder="Nombre del rol"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="Descripción de permisos"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 flex-1 focus:outline-none focus:border-fuchsia-400"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.35)] transition"
        >
          Crear Rol
        </button>
      </form>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">ID</th>
              <th className="px-5 py-3.5">Rol</th>
              <th className="px-5 py-3.5">Descripción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {roles.map((r) => (
              <tr key={r.id_rol} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 text-purple-300/60">{r.id_rol}</td>
                <td className="px-5 py-3.5 font-semibold text-white">{r.nombre}</td>
                <td className="px-5 py-3.5 text-purple-200/80">{r.descripcion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
