import { useState, useEffect } from 'react';
import SectionBanner from './SectionBanner';

export default function TasasCambio() {
  const [tasas, setTasas] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [tasa, setTasa] = useState('');
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));

  const cargar = () => {
    fetch('/api/core/tasas')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTasas(Array.isArray(data) ? data : []))
      .catch(() => setTasas([]));

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
    if (!origen || !destino || !tasa) return;
    await fetch('/api/core/tasas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_moneda_origen: Number(origen),
        id_moneda_destino: Number(destino),
        tasa: Number(tasa),
        fecha_vigencia: fecha,
      }),
    });
    setTasa('');
    cargar();
  };

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/banners/finanzas.svg"
        etiqueta="Divisas y Finanzas"
        titulo="Tasas de Cambio Internacional"
        descripcion="Registra y consulta paridades cambiarias vigentes entre divisas de origen y destino con historial por fecha."
      />

      <form onSubmit={guardar} className="bg-[#120A24] p-5 rounded-2xl border border-purple-500/30 flex flex-wrap gap-3 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
        <select
          value={origen}
          onChange={(e) => setOrigen(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400"
        >
          <option value="">Moneda Origen</option>
          {monedas.map((m) => (
            <option key={m.id_moneda} value={m.id_moneda}>
              {m.codigo_iso} - {m.nombre}
            </option>
          ))}
        </select>

        <select
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400"
        >
          <option value="">Moneda Destino</option>
          {monedas.map((m) => (
            <option key={m.id_moneda} value={m.id_moneda}>
              {m.codigo_iso} - {m.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.000001"
          placeholder="Tasa (ej. 4350.50)"
          value={tasa}
          onChange={(e) => setTasa(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-44 focus:outline-none focus:border-fuchsia-400"
        />

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400"
        />

        <button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.35)] transition">
          Registrar Tasa
        </button>
      </form>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">Origen</th>
              <th className="px-5 py-3.5">Destino</th>
              <th className="px-5 py-3.5">Tasa</th>
              <th className="px-5 py-3.5">Fecha Vigencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {tasas.map((t) => (
              <tr key={t.id_tasa} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 font-bold text-fuchsia-400">{t.origen_iso}</td>
                <td className="px-5 py-3.5 font-bold text-sky-400">{t.destino_iso}</td>
                <td className="px-5 py-3.5 text-white font-medium">{Number(t.tasa).toLocaleString('es-CO')}</td>
                <td className="px-5 py-3.5 text-purple-200/75">{t.fecha_vigencia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
