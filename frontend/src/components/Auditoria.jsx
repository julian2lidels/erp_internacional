import { useState, useEffect } from 'react';

export default function Auditoria() {
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    fetch('/api/core/auditoria')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setEventos(Array.isArray(data) ? data : []))
      .catch(() => setEventos([]));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-fuchsia-400">Seguridad y Accesos</span>
          <h2 className="text-2xl font-bold text-white">Bitácora de Auditoría</h2>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/35">
          Zona Restringida · Admin
        </span>
      </div>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">Fecha</th>
              <th className="px-5 py-3.5">Usuario</th>
              <th className="px-5 py-3.5">Módulo</th>
              <th className="px-5 py-3.5">Acción Registrada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {eventos.map((ev) => (
              <tr key={ev.id_auditoria} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 text-sky-300 font-mono text-xs">{ev.fecha_evento}</td>
                <td className="px-5 py-3.5 font-semibold text-white">{ev.usuario_actor}</td>
                <td className="px-5 py-3.5 text-fuchsia-400">{ev.modulo}</td>
                <td className="px-5 py-3.5 text-purple-200/85">{ev.accion}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
