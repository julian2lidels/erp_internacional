import { useEffect, useRef, useState } from 'react';
import { tituloDe } from '../config/entidades';

export default function Navbar({ vistaActiva, setVistaActiva, sesion, rolActual, grupos, onLogout }) {
  const [abierto, setAbierto] = useState(false);
  const caja = useRef(null);

  useEffect(() => {
    const cerrar = (e) => {
      if (e.type === 'keydown' && e.key !== 'Escape') return;
      if (e.type === 'mousedown' && caja.current?.contains(e.target)) return;
      setAbierto(false);
    };
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', cerrar);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      document.removeEventListener('keydown', cerrar);
    };
  }, []);

  const ir = (vista) => {
    setVistaActiva(vista);
    setAbierto(false);
  };

  const grupoActivo = grupos.find((g) => g.items.includes(vistaActiva));

  return (
    <header className="sticky top-0 z-50 border-b border-purple-400/20 bg-[#0A0614]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-4">
        <button onClick={() => ir('inicio')} className="flex items-center gap-3.5 text-left group">
          <span className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center font-extrabold text-white text-sm shadow-[0_0_25px_rgba(168,85,247,0.55)] group-hover:scale-105 transition">
            ERP
          </span>
          <span className="font-display text-xl font-bold text-white tracking-tight">ERP Internacional</span>
        </button>

        <nav className="flex items-center gap-2.5" ref={caja}>
          <button
            onClick={() => ir('inicio')}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              vistaActiva === 'inicio'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
                : 'text-purple-200/80 hover:text-white hover:bg-purple-950/60'
            }`}
          >
            Inicio
          </button>

          <div className="relative">
            <button
              onClick={() => setAbierto((v) => !v)}
              aria-expanded={abierto}
              aria-haspopup="true"
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                grupoActivo ? 'bg-purple-900/60 border-fuchsia-500/50 text-white' : 'bg-[#140C26]/90 border-purple-400/25 text-purple-100 hover:border-purple-300/50'
              }`}
            >
              {grupoActivo ? grupoActivo.titulo : 'Módulos'} {abierto ? '˄' : '˅'}
            </button>

            {abierto && (
              <div className="absolute right-0 mt-2.5 w-[min(92vw,46rem)] rounded-3xl bg-[#120A24]/98 backdrop-blur-xl border border-purple-400/35 shadow-[0_20px_50px_rgba(0,0,0,0.75)] p-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-h-[75vh] overflow-y-auto">
                {grupos.map((g) => (
                  <div key={g.id} className="space-y-2">
                    <p className="font-display text-lg text-white">{g.titulo}</p>
                    <ul className="space-y-0.5">
                      {g.items.map((it) => (
                        <li key={it}>
                          <button
                            onClick={() => ir(it)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition ${
                              vistaActiva === it ? 'bg-fuchsia-600/30 text-white' : 'text-purple-100/85 hover:bg-purple-600/25 hover:text-fuchsia-200'
                            }`}
                          >
                            {tituloDe(it)}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="flex items-center gap-3 bg-[#130B24] border border-purple-400/30 rounded-full pl-4 pr-1.5 py-1.5">
          <span className="text-xs text-purple-100 leading-tight text-right">
            <span className="block font-semibold text-white">{sesion?.nombre}</span>
            <span className="block text-purple-300/70">{rolActual?.nombre || ''}</span>
          </span>
          <button onClick={onLogout} className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-100 border border-purple-300/40 hover:text-white hover:border-fuchsia-400 transition">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
