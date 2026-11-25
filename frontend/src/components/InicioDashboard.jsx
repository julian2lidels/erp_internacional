export default function InicioDashboard({ setVistaActiva, esAdmin, rolActual }) {
  return (
    <div className="space-y-10 py-2">
      {/* Hero Banner con imagen en degradado Hollow Purple */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/35 bg-[#120A24] p-8 md:p-12 shadow-[0_0_50px_rgba(147,51,234,0.25)]">
        <img
          src="/banners/hero.svg"
          alt="ERP Internacional Core"
          className="absolute inset-0 w-full h-full object-cover object-right opacity-90 pointer-events-none"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07040F]/95 via-[#0F0622]/85 to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-950/85 border border-fuchsia-500/35 text-xs font-medium text-fuchsia-300">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_#38BDF8]" />
            <span>Framework ERP Internacional operativo y conectado</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Gestión financiera global con{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              precisión infinita
            </span>
          </h1>

          <p className="text-base md:text-lg text-purple-200/80 leading-relaxed">
            Control centralizado de divisas ISO, tasas de cambio en tiempo real, sucursales internacionales y regímenes tributarios desplegados en OpenShift.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => setVistaActiva('tasas')}
              className="px-6 py-3 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-purple-700 hover:brightness-110 shadow-[0_0_30px_rgba(192,132,252,0.45)] transition"
            >
              Operar Tasas de Cambio →
            </button>
            <button
              onClick={() => setVistaActiva('sucursales')}
              className="px-6 py-3 rounded-full text-sm font-semibold text-purple-200 bg-purple-950/70 border border-purple-500/35 hover:border-fuchsia-400/60 hover:text-white transition"
            >
              Explorar Sedes Globales
            </button>
          </div>
        </div>
      </section>

      {/* Grid de Tarjetas Modulares con cabecera ilustrada en degradado */}
      <section className={`grid grid-cols-1 ${esAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {/* Módulo 1: Divisas y Finanzas */}
        <div className="overflow-hidden rounded-3xl bg-[#120A24]/95 border border-purple-500/30 hover:border-fuchsia-500/55 flex flex-col justify-between transition shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
          <div>
            <div className="relative h-32 w-full overflow-hidden">
              <img src="/banners/finanzas.svg" alt="Divisas y Finanzas" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120A24] via-[#120A24]/40 to-transparent" />
              <span className="absolute bottom-3 left-6 text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">
                Módulo 01
              </span>
            </div>
            <div className="px-7 pb-6 pt-2 space-y-2">
              <h2 className="text-2xl font-bold text-white">Divisas y Finanzas</h2>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                Catálogo de monedas ISO internacionales y registro histórico de tasas de conversión entre mercados.
              </p>
            </div>
          </div>

          <div className="px-7 pb-7 space-y-3">
            <button
              onClick={() => setVistaActiva('monedas')}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#1A0F33] hover:bg-purple-900/50 border border-purple-500/25 hover:border-fuchsia-400/50 text-sm font-semibold text-white flex items-center justify-between transition"
            >
              <span>Monedas</span>
              <span className="text-fuchsia-400">→</span>
            </button>
            <button
              onClick={() => setVistaActiva('tasas')}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#1A0F33] hover:bg-purple-900/50 border border-purple-500/25 hover:border-fuchsia-400/50 text-sm font-semibold text-white flex items-center justify-between transition"
            >
              <span>Tasas de Cambio</span>
              <span className="text-fuchsia-400">→</span>
            </button>
          </div>
        </div>

        {/* Módulo 2: Organización Global */}
        <div className="overflow-hidden rounded-3xl bg-[#120A24]/95 border border-purple-500/30 hover:border-sky-400/55 flex flex-col justify-between transition shadow-[0_12px_35px_rgba(0,0,0,0.5)]">
          <div>
            <div className="relative h-32 w-full overflow-hidden">
              <img src="/banners/global.svg" alt="Organización Global" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#120A24] via-[#120A24]/40 to-transparent" />
              <span className="absolute bottom-3 left-6 text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
                Módulo 02
              </span>
            </div>
            <div className="px-7 pb-6 pt-2 space-y-2">
              <h2 className="text-2xl font-bold text-white">Organización Global</h2>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                Países de operación, administración de sedes y sucursales internacionales, y reglas fiscales por jurisdicción.
              </p>
            </div>
          </div>

          <div className="px-7 pb-7 space-y-3">
            <button
              onClick={() => setVistaActiva('sucursales')}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#1A0F33] hover:bg-purple-900/50 border border-purple-500/25 hover:border-sky-400/50 text-sm font-semibold text-white flex items-center justify-between transition"
            >
              <span>Sucursales y Sedes</span>
              <span className="text-sky-400">→</span>
            </button>
            <button
              onClick={() => setVistaActiva('impuestos')}
              className="w-full px-4 py-3.5 rounded-2xl bg-[#1A0F33] hover:bg-purple-900/50 border border-purple-500/25 hover:border-sky-400/50 text-sm font-semibold text-white flex items-center justify-between transition"
            >
              <span>Impuestos</span>
              <span className="text-sky-400">→</span>
            </button>
          </div>
        </div>

        {/* Módulo 3 (Oculto para roles no-Admin): Seguridad y Accesos */}
        {esAdmin && (
          <div className="overflow-hidden rounded-3xl bg-[#120A24]/95 border border-fuchsia-500/40 hover:border-fuchsia-400 flex flex-col justify-between transition shadow-[0_0_40px_rgba(217,70,239,0.2)]">
            <div>
              <div className="relative h-32 w-full overflow-hidden">
                <img src="/banners/seguridad.svg" alt="Seguridad y Accesos" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120A24] via-[#120A24]/40 to-transparent" />
                <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">
                    Módulo 03 · Admin
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/35">
                    {rolActual?.nombre}
                  </span>
                </div>
              </div>
              <div className="px-7 pb-6 pt-2 space-y-2">
                <h2 className="text-2xl font-bold text-white">Seguridad y Accesos</h2>
                <p className="text-sm text-purple-200/70 leading-relaxed">
                  Control de roles, asignación de permisos por módulo, gestión de usuarios y trazabilidad de auditoría.
                </p>
              </div>
            </div>

            <div className="px-7 pb-7 space-y-3">
              <button
                onClick={() => setVistaActiva('roles')}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#211142] hover:bg-fuchsia-900/40 border border-fuchsia-500/30 text-sm font-semibold text-white flex items-center justify-between transition"
              >
                <span>Roles</span>
                <span className="text-fuchsia-400">→</span>
              </button>
              <button
                onClick={() => setVistaActiva('usuarios')}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#211142] hover:bg-fuchsia-900/40 border border-fuchsia-500/30 text-sm font-semibold text-white flex items-center justify-between transition"
              >
                <span>Usuarios y Permisos</span>
                <span className="text-fuchsia-400">→</span>
              </button>
              <button
                onClick={() => setVistaActiva('auditoria')}
                className="w-full px-4 py-3.5 rounded-2xl bg-[#211142] hover:bg-fuchsia-900/40 border border-fuchsia-500/30 text-sm font-semibold text-white flex items-center justify-between transition"
              >
                <span>Auditoría</span>
                <span className="text-fuchsia-400">→</span>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
