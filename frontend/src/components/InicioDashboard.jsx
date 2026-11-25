import { useEffect, useState } from 'react';
import { ENTIDADES, VISTAS_ESPECIALES, imagenDe, tituloDe } from '../config/entidades';
import { getLista } from '../api';
import Galaxia from './Galaxia';

// Inicio con estructura de cartelera de teatro: hero a pantalla completa,
// cinta de tasas de cambio y "en cartelera" con cada módulo como una función.
function descripcionDe(clave) {
  return ENTIDADES[clave]?.descripcion || (VISTAS_ESPECIALES[clave] ? 'Cuentas, estados y permisos por módulo' : '');
}

export default function InicioDashboard({ setVistaActiva, grupos, sesion, rolActual }) {
  const [tasas, setTasas] = useState([]);
  const primerGrupo = grupos[0];

  useEffect(() => {
    getLista('/api/erp/tasas-cambio').then((t) => setTasas(t.slice(0, 8)));
  }, []);

  return (
    <div className="-mx-6 -mt-8">
      <section className="relative min-h-[78vh] flex items-center overflow-hidden border-b border-purple-400/20">
        <Galaxia />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07040F] via-[#07040F]/80 to-transparent md:via-[#07040F]/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07040F] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.02]">
              Finanzas globales, sin límites
            </h1>
            <p className="text-base md:text-lg text-purple-100/80 leading-relaxed max-w-xl">
              Hola, {sesion?.nombre}. Entraste como {rolActual?.nombre || 'usuario'}: monedas, ventas, compras,
              inventario, contabilidad y nómina de todos tus países en un solo lugar.
            </p>
            {primerGrupo && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setVistaActiva(primerGrupo.items[0])}
                  className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 shadow-[0_0_35px_rgba(192,132,252,0.5)] transition"
                >
                  Empezar en {primerGrupo.titulo}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {tasas.length > 0 && (
        <div className="border-b border-purple-400/15 bg-[#0a0517]">
          <ul className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-x-10 gap-y-2 font-display text-lg text-purple-200/85">
            {tasas.map((t) => (
              <li key={t.id_tasa}>
                {t.moneda_origen}/{t.moneda_destino}{' '}
                <span className="text-white">{Number(t.tasa).toLocaleString('es-CO', { maximumFractionDigits: 4 })}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-20 space-y-24">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-white">En cartelera</h2>

        {grupos.map((g, idx) => (
          <section
            key={g.id}
            className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${idx % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}
          >
            <div className="relative rounded-[2rem] overflow-hidden border border-purple-400/25 aspect-[4/3]">
              <img src={g.imagen} alt={g.titulo} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07040F]/70 to-transparent" />
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white">{g.titulo}</h3>
                <p className="text-purple-100/75 leading-relaxed max-w-md">{g.texto}</p>
              </div>

              <ul className="divide-y divide-purple-400/20 border-y border-purple-400/20">
                {g.items.map((it) => (
                  <li key={it}>
                    <button
                      onClick={() => setVistaActiva(it)}
                      className="w-full flex items-center gap-4 py-4 text-left group focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400"
                    >
                      <img src={imagenDe(it)} alt="" className="w-20 h-14 rounded-xl object-cover border border-purple-400/25 shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-display text-xl text-white group-hover:text-fuchsia-300 transition">{tituloDe(it)}</span>
                        <span className="block text-sm text-purple-200/65 truncate">{descripcionDe(it)}</span>
                      </span>
                      <span className="text-sm font-semibold text-fuchsia-300 px-4 py-2 rounded-full border border-fuchsia-400/40 group-hover:bg-fuchsia-500/20 transition">
                        Abrir
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
