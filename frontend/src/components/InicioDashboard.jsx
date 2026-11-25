export default function InicioDashboard({ setVistaActiva, esAdmin, rolActual }) {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Banner estilo plantilla SaaS moderna */}
      <section className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-[#160B2E] via-[#100722] to-[#090414] p-8 md:p-12 shadow-[0_0_50px_rgba(147,51,234,0.22)]">
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-fuchsia-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-purple-950/80 border border-fuchsia-500/35 text-xs font-medium text-fuchsia-300">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-[0_0_10px_#38BDF8]" />
            <span>Framework ERP Internacional operativo y conectado</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Gestión financiera global con{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-sky-400 bg-clip-text text-transparent">
              precisión infinita
            </span>
          </h1>

          <p className="text-base md:text-lg text-purple-200/75 leading-relaxed">
            Control centralizado de divisas ISO, tasas de cambio en tiempo real, sucursales internacionales y regímenes tributarios desde una arquitectura desplegada en OpenShift.
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
              className="px-6 py-3 rounded-full text-sm font-semibold text-purple-200 bg-purple-950/60 border border-purple-500/35 hover:border-fuchsia-400/60 hover:text-white transition"
            >
              Explorar Sedes Globales
            </button>
          </div>
        </div>
      </section>

      {/* Tarjetas Modulares estilo Grid SaaS */}
      <section className={`grid grid-cols-1 ${esAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6`}>
        {/* Módulo 1: Divisas y Finanzas */}
        <div className="rounded-3xl bg-[#120A24]/90 border border-purple-500/25 hover:border-fuchsia-500/45 p-7 flex flex-col justify-between transition shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
          <div className="space-y-3 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">
              Módulo 01
            </span>
            <h2 className="text-2xl font-bold text-white">Divisas y Finanzas</h2>
            <p className="text-sm text-purple-200/70 leading-relaxed">
              Catálogo de monedas ISO internacionales y registro histórico de tasas de conversión entre mercados.
            </p>
          </div>

          <div className="space-y-3">
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
        <div className="rounded-3xl bg-[#120A24]/90 border border-purple-500/25 hover:border-fuchsia-500/45 p-7 flex flex-col justify-between transition shadow-[0_10px_35px_rgba(0,0,0,0.45)]">
          <div className="space-y-3 mb-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-sky-400">
              Módulo 02
            </span>
            <h2 className="text-2xl font-bold text-white">Organización Global</h2>
            <p className="text-sm text-purple-200/70 leading-relaxed">
              Países de operación, administración de sedes y sucursales internacionales, y reglas fiscales por jurisdicción.
            </p>
          </div>

          <div className="space-y-3">
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
          <div className="rounded-3xl bg-gradient-to-b from-[#1A0D36] to-[#120A24] border border-fuchsia-500/35 hover:border-fuchsia-400 p-7 flex flex-col justify-between transition shadow-[0_0_35px_rgba(217,70,239,0.18)]">
            <div className="space-y-3 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-fuchsia-400">
                  Módulo 03 · Admin
                </span>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30">
                  {rolActual?.nombre}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">Seguridad y Accesos</h2>
              <p className="text-sm text-purple-200/70 leading-relaxed">
                Control de roles, asignación de permisos por módulo, gestión de usuarios y trazabilidad de auditoría.
              </p>
            </div>

            <div className="space-y-3">
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
