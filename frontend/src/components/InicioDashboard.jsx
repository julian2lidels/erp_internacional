// Inicio con estructura de cartelera de teatro: hero a pantalla completa,
// cinta de divisas y "en cartelera" con cada módulo como una función.
const GRUPOS = [
  {
    id: 'finanzas',
    titulo: 'Divisas y Finanzas',
    texto: 'Catálogo de monedas ISO y registro histórico de tasas de conversión entre mercados.',
    imagen: '/img/monedas.svg',
    items: [
      { vista: 'monedas', nombre: 'Monedas', detalle: 'Divisas habilitadas para operar', imagen: '/img/monedas.svg' },
      { vista: 'tasas', nombre: 'Tasas de Cambio', detalle: 'Conversión entre mercados', imagen: '/img/tasas.svg' },
    ],
  },
  {
    id: 'global',
    titulo: 'Organización Global',
    texto: 'Sedes y sucursales internacionales, con las reglas fiscales de cada jurisdicción.',
    imagen: '/img/sucursales.svg',
    items: [
      { vista: 'sucursales', nombre: 'Sedes y Sucursales', detalle: 'Presencia en cada país', imagen: '/img/sucursales.svg' },
      { vista: 'impuestos', nombre: 'Impuestos', detalle: 'Reglas por jurisdicción', imagen: '/img/impuestos.svg' },
    ],
  },
  {
    id: 'seguridad',
    titulo: 'Seguridad y Accesos',
    texto: 'Roles, permisos por módulo, usuarios y trazabilidad de cada cambio.',
    imagen: '/img/roles.svg',
    admin: true,
    items: [
      { vista: 'roles', nombre: 'Roles', detalle: 'Qué puede hacer cada perfil', imagen: '/img/roles.svg' },
      { vista: 'usuarios', nombre: 'Usuarios y Permisos', detalle: 'Altas, bajas y accesos', imagen: '/img/usuarios.svg' },
      { vista: 'auditoria', nombre: 'Auditoría', detalle: 'Historial del sistema', imagen: '/img/auditoria.svg' },
    ],
  },
];

const DIVISAS = ['USD', 'EUR', 'COP', 'GBP', 'JPY', 'MXN', 'BRL', 'CHF', 'CAD', 'CNY'];

export default function InicioDashboard({ setVistaActiva, esAdmin, rolActual }) {
  const grupos = GRUPOS.filter((g) => !g.admin || esAdmin);

  return (
    <div className="-mx-6 -mt-8">
      {/* Hero a pantalla completa con la imagen de Gojo */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden border-b border-purple-400/20">
        <img
          src="/img/gojo.png"
          alt="Gojo liberando una esfera de energía morada"
          className="absolute right-0 top-0 h-full w-full md:w-[62%] object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07040F] via-[#07040F]/80 to-transparent md:via-[#07040F]/45" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#07040F] to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16">
          <div className="max-w-2xl space-y-6">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-[1.02]">
              Finanzas globales, sin límites
            </h1>
            <p className="text-base md:text-lg text-purple-100/80 leading-relaxed max-w-xl">
              Monedas, tasas de cambio, sucursales e impuestos de todos tus países en un solo lugar.
              {rolActual?.nombre ? ` Estás viendo el sistema como ${rolActual.nombre}.` : ''}
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setVistaActiva('tasas')}
                className="px-7 py-3.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:brightness-110 shadow-[0_0_35px_rgba(192,132,252,0.5)] transition"
              >
                Ver tasas de cambio
              </button>
              <button
                onClick={() => setVistaActiva('sucursales')}
                className="px-7 py-3.5 rounded-full text-sm font-semibold text-purple-100 border border-purple-300/40 hover:border-sky-300 hover:text-white transition"
              >
                Explorar sedes
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Cinta de divisas */}
      <div className="border-b border-purple-400/15 bg-[#0a0517]">
        <ul className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-x-10 gap-y-2 font-display text-lg text-purple-200/80">
          {DIVISAS.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </div>

      {/* En cartelera: cada grupo es una función con su imagen */}
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
                  <li key={it.vista}>
                    <button
                      onClick={() => setVistaActiva(it.vista)}
                      className="w-full flex items-center gap-4 py-4 text-left group focus-visible:outline focus-visible:outline-2 focus-visible:outline-fuchsia-400"
                    >
                      <img src={it.imagen} alt="" className="w-20 h-14 rounded-xl object-cover border border-purple-400/25" />
                      <span className="flex-1">
                        <span className="block font-display text-xl text-white group-hover:text-fuchsia-300 transition">{it.nombre}</span>
                        <span className="block text-sm text-purple-200/65">{it.detalle}</span>
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
