import { useState, useEffect } from 'react';

export default function Navbar({ vistaActiva, setVistaActiva, rolActual, setRolActual }) {
  const [menuAbierto, setMenuAbierto] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetch('/api/core/roles')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const lista = Array.isArray(data) ? data : [];
        setRoles(lista);
        if (lista.length > 0 && !rolActual) {
          setRolActual(lista[0]);
        }
      })
      .catch((err) => {
        console.error('Error cargando roles:', err);
        setRoles([]);
      });
  }, []);

  const esAdmin =
    rolActual?.nombre?.toLowerCase() === 'administrador' || rolActual?.id_rol === 1;

  const toggleMenu = (nombre) => {
    setMenuAbierto((prev) => (prev === nombre ? null : nombre));
  };

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#0A0614]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-20 flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => {
            setVistaActiva('inicio');
            setMenuAbierto(null);
          }}
          className="flex items-center gap-3.5 text-left group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 flex items-center justify-center font-extrabold text-white text-sm tracking-wider shadow-[0_0_25px_rgba(168,85,247,0.55)] group-hover:scale-105 transition">
            ERP
          </div>
          <div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              ERP{' '}
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
                Internacional
              </span>
            </span>
          </div>
        </button>

        <nav className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setVistaActiva('inicio');
              setMenuAbierto(null);
            }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              vistaActiva === 'inicio'
                ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_20px_rgba(192,132,252,0.45)]'
                : 'text-purple-200/80 hover:text-white hover:bg-purple-950/60 border border-transparent'
            }`}
          >
            Inicio
          </button>

          <div className="relative">
            <button
              onClick={() => toggleMenu('finanzas')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 ${
                vistaActiva === 'monedas' || vistaActiva === 'tasas'
                  ? 'bg-purple-900/60 border-fuchsia-500/50 text-white'
                  : 'bg-[#140C26]/90 border-purple-500/25 text-purple-200 hover:border-purple-400/50'
              }`}
            >
              <span>Divisas y Finanzas</span>
              <span className="text-[10px] text-fuchsia-400">{menuAbierto === 'finanzas' ? '˄' : '˅'}</span>
            </button>

            {menuAbierto === 'finanzas' && (
              <div className="absolute left-0 mt-2.5 w-56 rounded-2xl bg-[#120A24]/95 backdrop-blur-xl border border-purple-500/35 shadow-[0_15px_40px_rgba(0,0,0,0.75)] py-2 z-50">
                <button
                  onClick={() => {
                    setVistaActiva('monedas');
                    setMenuAbierto(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-purple-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                >
                  <span>Catálogo de Monedas</span>
                  
                </button>
                <button
                  onClick={() => {
                    setVistaActiva('tasas');
                    setMenuAbierto(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-purple-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                >
                  <span>Tasas de Cambio</span>
                  
                </button>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => toggleMenu('global')}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition flex items-center gap-2 ${
                vistaActiva === 'sucursales' || vistaActiva === 'impuestos'
                  ? 'bg-purple-900/60 border-fuchsia-500/50 text-white'
                  : 'bg-[#140C26]/90 border-purple-500/25 text-purple-200 hover:border-purple-400/50'
              }`}
            >
              <span>Organización Global</span>
              <span className="text-[10px] text-fuchsia-400">{menuAbierto === 'global' ? '˄' : '˅'}</span>
            </button>

            {menuAbierto === 'global' && (
              <div className="absolute left-0 mt-2.5 w-56 rounded-2xl bg-[#120A24]/95 backdrop-blur-xl border border-purple-500/35 shadow-[0_15px_40px_rgba(0,0,0,0.75)] py-2 z-50">
                <button
                  onClick={() => {
                    setVistaActiva('sucursales');
                    setMenuAbierto(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-purple-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                >
                  <span>Sedes y Sucursales</span>
                  
                </button>
                <button
                  onClick={() => {
                    setVistaActiva('impuestos');
                    setMenuAbierto(null);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-purple-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                >
                  <span>Reglas e Impuestos</span>
                  
                </button>
              </div>
            )}
          </div>

          {esAdmin && (
            <div className="relative">
              <button
                onClick={() => toggleMenu('seguridad')}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition flex items-center gap-2 ${
                  vistaActiva === 'roles' || vistaActiva === 'usuarios' || vistaActiva === 'auditoria'
                    ? 'bg-gradient-to-r from-fuchsia-600/40 to-purple-700/40 border-fuchsia-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.35)]'
                    : 'bg-[#190D30] border-fuchsia-500/40 text-fuchsia-300 hover:border-fuchsia-400'
                }`}
              >
                <span>Seguridad y Accesos</span>
                <span className="text-[10px]">{menuAbierto === 'seguridad' ? '˄' : '˅'}</span>
              </button>

              {menuAbierto === 'seguridad' && (
                <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-[#120A24]/95 backdrop-blur-xl border border-fuchsia-500/40 shadow-[0_15px_45px_rgba(168,85,247,0.3)] py-2 z-50">
                  <button
                    onClick={() => {
                      setVistaActiva('roles');
                      setMenuAbierto(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-fuchsia-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                  >
                    <span>Gestión de Roles</span>
                    
                  </button>
                  <button
                    onClick={() => {
                      setVistaActiva('usuarios');
                      setMenuAbierto(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-fuchsia-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                  >
                    <span>Usuarios y Permisos</span>
                    
                  </button>
                  <button
                    onClick={() => {
                      setVistaActiva('auditoria');
                      setMenuAbierto(null);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-purple-100 hover:bg-fuchsia-600/25 hover:text-fuchsia-300 flex items-center justify-between"
                  >
                    <span>Auditoría del Sistema</span>
                    
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-2.5 bg-[#130B24] border border-purple-500/30 rounded-full px-3.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-pulse" />
          <span className="text-xs text-purple-300/80">Rol:</span>
          <select
            value={rolActual?.id_rol || ''}
            onChange={(e) => {
              const seleccionado = roles.find((r) => r.id_rol === Number(e.target.value));
              setRolActual(seleccionado);
              setMenuAbierto(null);
              if (
                seleccionado?.id_rol !== 1 &&
                (vistaActiva === 'roles' || vistaActiva === 'usuarios' || vistaActiva === 'auditoria')
              ) {
                setVistaActiva('inicio');
              }
            }}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
          >
            {roles.map((rol) => (
              <option key={rol.id_rol} value={rol.id_rol} className="bg-[#120826] text-white">
                {rol.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
}
