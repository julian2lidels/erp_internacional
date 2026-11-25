import { useState, useEffect } from 'react';
import SectionBanner from './SectionBanner';

export default function Impuestos() {
  const [impuestos, setImpuestos] = useState([]);
  const [nombre, setNombre] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [pais, setPais] = useState('');

  const cargar = () => {
    fetch('/api/core/impuestos')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setImpuestos(Array.isArray(data) ? data : []))
      .catch(() => setImpuestos([]));
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (e) => {
    e.preventDefault();
    if (!nombre || !porcentaje || !pais) return;
    await fetch('/api/core/impuestos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre,
        porcentaje: Number(porcentaje),
        pais,
        activo: 1,
      }),
    });
    setNombre('');
    setPorcentaje('');
    setPais('');
    cargar();
  };

  return (
    <div className="space-y-6">
      <SectionBanner
        imagen="/img/impuestos.svg"
        etiqueta="Organización Global"
        titulo="Reglas Fiscales e Impuestos"
        descripcion="Define tarifas tributarias, IVA y retenciones aplicables por país y jurisdicción operativa."
      />

      <form onSubmit={guardar} className="bg-[#120A24] p-5 rounded-2xl border border-purple-500/30 flex flex-wrap gap-3 shadow-[0_0_30px_rgba(147,51,234,0.15)]">
        <input
          type="text"
          placeholder="Nombre (ej. IVA México)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 flex-1 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="number"
          step="0.01"
          placeholder="Porcentaje (%)"
          value={porcentaje}
          onChange={(e) => setPorcentaje(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-36 focus:outline-none focus:border-fuchsia-400"
        />
        <input
          type="text"
          placeholder="País"
          value={pais}
          onChange={(e) => setPais(e.target.value)}
          className="bg-[#1B1036] border border-purple-500/35 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-purple-300/40 w-44 focus:outline-none focus:border-fuchsia-400"
        />
        <button type="submit" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(192,132,252,0.35)] transition">
          Agregar Impuesto
        </button>
      </form>

      <div className="bg-[#120A24] rounded-2xl border border-purple-500/30 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1C1038] text-purple-200">
            <tr>
              <th className="px-5 py-3.5">Impuesto</th>
              <th className="px-5 py-3.5">Tarifa</th>
              <th className="px-5 py-3.5">País</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-purple-500/15">
            {impuestos.map((i) => (
              <tr key={i.id_impuesto} className="hover:bg-purple-900/20">
                <td className="px-5 py-3.5 text-white font-medium">{i.nombre}</td>
                <td className="px-5 py-3.5 text-fuchsia-400 font-bold">{i.porcentaje}%</td>
                <td className="px-5 py-3.5 text-purple-200/80">{i.pais}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
