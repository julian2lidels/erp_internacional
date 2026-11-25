import { useState, useEffect } from 'react';
import SectionBanner from './SectionBanner';

export default function Sucursales() {
  const [sucursales, setSucursales] = useState([]);
  const [monedas, setMonedas] = useState([]);
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [pais, setPais] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [idMonedaBase, setIdMonedaBase] = useState('');

  const cargar = () => {
    fetch('/api/core/sucursales')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setSucursales(Array.isArray(data) ? data : []))
      .catch(() => setSucursales([]));

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
    if (!codigo || !nombre || !pais || !ciudad || !idMonedaBase) return;
    await fetch('/api/core/sucursales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo,
        nombre,
        pais,
        ciudad,
        id_moneda_base: Number(idMonedaBase),
        activa: 1,
      }),
    });
    setCodigo('');
    setNombre('');
    setPais('');
    setCiudad('');
    cargar();
  };

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/banners/global.svg"
        etiqueta="Organización Global"
        titulo="Sucursales y Países de Operación"
        descripcion="Configura las sedes internacionales, ciudades de operación y moneda contable base asignada a cada centro."
      />

      <form onSubmit={guardar} className="bg-[#120A24] p-5 rounded-2xl border border-purple-500/30 flex flex-wrap gap-3 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
        <input
          type="text"
          placeholder="Código (ej. CDMX-01)"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value.toUpperCase())}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-36 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="Nombre de sucursal"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 flex-1 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="País"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-36 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-36 focus:outline-none focus:border-fuchsia-400"
        />
        <select
          value={idMonedaBase}
          onChange={(e) => setIdMonedaBase(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-400"
        >
          <option value="">Moneda Base</option>
          {monedas.map((m) => (
            <option key={m.id_moneda} value={m.id_moneda}>
              {m.codigo_iso}
            </option>
          ))}
        </select>
        <button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.35)] transition">
          Agregar Sucursal
        </button>
      </form>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">Código</th>
              <th className="px-5 py-3.5">Sucursal</th>
              <th className="px-5 py-3.5">Ubicación</th>
              <th className="px-5 py-3.5">Moneda Base</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {sucursales.map((s) => (
              <tr key={s.id_sucursal} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 font-bold text-fuchsia-400">{s.codigo}</td>
                <td className="px-5 py-3.5 text-white">{s.nombre}</td>
                <td className="px-5 py-3.5 text-purple-200/80">{s.ciudad}, {s.pais}</td>
                <td className="px-5 py-3.5 text-sky-400 font-semibold">{s.moneda_base}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
