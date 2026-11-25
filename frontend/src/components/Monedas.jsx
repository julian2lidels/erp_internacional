import { useState, useEffect } from 'react';
import SectionBanner from './SectionBanner';

export default function Monedas() {
  const [monedas, setMonedas] = useState([]);
  const [codigoIso, setCodigoIso] = useState('');
  const [nombre, setNombre] = useState('');
  const [simbolo, setSimbolo] = useState('');

  const cargar = () => {
    fetch('/api/core/monedas')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setMonedas(Array.isArray(data) ? data : []))
      .catch(() => setMonedas([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    if (!codigoIso || !nombre || !simbolo) return;
    await fetch('/api/core/monedas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo_iso: codigoIso, nombre, simbolo, activa: 1 }),
    });
    setCodigoIso('');
    setNombre('');
    setSimbolo('');
    cargar();
  };

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/img/monedas.svg"
        etiqueta="Divisas y Finanzas"
        titulo="Catálogo de Monedas ISO"
        descripcion="Administra las divisas habilitadas para operaciones internacionales, facturación y conversión multicontable."
      />

      <form onSubmit={guardar} className="bg-[#120A24] p-5 rounded-2xl border border-purple-500/30 flex flex-wrap gap-3 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
        <input
          type="text"
          maxLength={3}
          placeholder="ISO (ej. GBP)"
          value={codigoIso}
          onChange={(e) => setCodigoIso(e.target.value.toUpperCase())}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-36 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="Nombre de la moneda"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 flex-1 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="Símbolo (ej. £)"
          value={simbolo}
          onChange={(e) => setSimbolo(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-32 focus:outline-none focus:border-fuchsia-400"
        />
        <button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.35)] transition">
          Agregar Moneda
        </button>
      </form>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">ISO</th>
              <th className="px-5 py-3.5">Nombre</th>
              <th className="px-5 py-3.5">Símbolo</th>
              <th className="px-5 py-3.5">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {monedas.map((m) => (
              <tr key={m.id_moneda} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 font-bold text-fuchsia-400">{m.codigo_iso}</td>
                <td className="px-5 py-3.5 text-white">{m.nombre}</td>
                <td className="px-5 py-3.5 text-sky-300">{m.simbolo}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                    {m.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
